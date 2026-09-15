import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AI_BASE_URL, AI_API_KEY, MODEL_ID } from "@/lib/ai/config";
import { generateAGENTS } from "@/lib/generators/agents";
import { parsePrdToNodeTree } from "@/lib/parsers/prd-to-nodes";

// ─── Request / Response types ──────────────────────────────────────

interface RefineRequest {
  projectId: string;
  instruction: string;
  /** "preview" = classify intent without saving; "apply" = save to DB */
  action?: "preview" | "apply";
  /** Full context from drawer */
  prdContent?: string;
  tasksContent?: string;
  agentsContent?: string;
  nodeTree?: string; // stringified JSON
  /** Required when action = "apply" */
  applyPayload?: {
    prdContent?: string;
    tasksContent?: string;
  };
}

export type IntentType = "QUESTION" | "ADVISORY" | "MUTATION";

export interface RefineProposal {
  label: string;
  actionPrompt: string;
}

interface RefineResponse {
  intent: IntentType;
  message: string;
  proposals?: RefineProposal[];
  updatedPrd?: string;
  updatedTasks?: string;
}

// ─── POST handler ──────────────────────────────────────────────────

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as RefineRequest;
  const {
    projectId,
    instruction,
    action = "preview",
    prdContent: clientPrd,
    tasksContent: clientTasks,
    agentsContent: clientAgents,
    nodeTree: clientNodes,
    applyPayload,
  } = body;

  // ── Apply: save pre-reviewed content to DB + regenerate AGENTS + parse nodeTree ──
  if (action === "apply") {
    if (!projectId || !applyPayload) {
      return NextResponse.json(
        { error: "projectId and applyPayload are required for apply" },
        { status: 400 },
      );
    }
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        userId: true,
        title: true,
        abstractIdea: true,
        scale: true,
        answers: true,
        techStack: true,
      },
    });
    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};

    // Save PRD
    if (applyPayload.prdContent !== undefined) {
      data.prdContent = applyPayload.prdContent;

      // Regenerate AGENTS from updated PRD context
      const regeneratedAgents = generateAGENTS({
        title: project.title,
        scale: project.scale,
        techStack: project.techStack as Array<{
          category: string;
          name: string;
          reason: string;
        }>,
      });
      data.agentsContent = regeneratedAgents;

      // Parse nodeTree from PRD sections 4 & 5
      const parsedNodeTree = parsePrdToNodeTree(applyPayload.prdContent);
      if (parsedNodeTree) {
        data.nodeTree = parsedNodeTree;
      }
    }

    // Save TASKS
    if (applyPayload.tasksContent !== undefined) {
      data.tasksContent = applyPayload.tasksContent;
    }

    await prisma.project.update({ where: { id: projectId }, data });

    return NextResponse.json({
      success: true,
      agentsContent: data.agentsContent,
      nodeTree: data.nodeTree,
    });
  }

  // ── Preview: classify intent + respond ──
  if (!projectId || !instruction) {
    return NextResponse.json(
      { error: "projectId and instruction are required" },
      { status: 400 },
    );
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      prdContent: true,
      tasksContent: true,
      agentsContent: true,
      userId: true,
    },
  });
  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Merge client-sent content with DB content (client takes precedence)
  const currentPrd = clientPrd ?? project.prdContent ?? "";
  const currentTasks = clientTasks ?? project.tasksContent ?? "";
  const currentAgents = clientAgents ?? project.agentsContent ?? "";

  const systemPrompt = `You are a senior software architect acting as an AI Refiner for a software project. You have access to the project's PRD, TASKS, AGENTS, and architecture node tree.

You MUST respond with valid JSON (no markdown wrapping) matching this schema:
{
  "intent": "QUESTION" | "ADVISORY" | "MUTATION",
  "message": "Your reply to the user",
  "proposals": [{ "label": "short button text", "actionPrompt": "instruction that will be sent to AI Refiner" }],
  "updatedPrd": "complete updated PRD (only when intent=MUTATION and PRD changes)",
  "updatedTasks": "complete updated TASKS (only when intent=MUTATION and TASKS changes)"
}

Intent classification rules:
- QUESTION: User asks a factual/technical question about the project. No document changes. No proposals.
- ADVISORY: User asks for opinion, analysis, comparison, or advice. Return analysis + 2-4 actionable proposals the user can click to execute.
- MUTATION: User gives a direct instruction to modify documents (add, remove, change content). Generate updated documents.

CRITICAL RULES:
- NEVER respond "PRD is empty" or similar when the prdContent string provided is non-empty. The user sees their content — trust it.
- When intent is QUESTION, omit proposals, updatedPrd, and updatedTasks.
- When intent is ADVISORY, omit updatedPrd and updatedTasks. proposals MUST have 2-4 items.
- When intent is MUTATION, include the COMPLETE updated document(s) — not partial diffs.
- Preserve all existing sections unless the instruction explicitly says to modify them.
- message should be in the same language as the user's instruction.`;

  const userPrompt = `Current project context:
---
PRD:
${currentPrd || "(no PRD content)"}
---
TASKS:
${currentTasks || "(no TASKS content)"}
---
AGENTS:
${currentAgents || "(no AGENTS content)"}
---
Node tree:
${clientNodes || "(not provided)"}
---

User instruction: ${instruction}

Classify the intent and respond with the JSON schema.`;

  try {
    const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_ID,
        stream: false,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `AI API ${res.status}: ${errText}` },
        { status: 502 },
      );
    }

    const data = await res.json();
    const raw: string = data.choices?.[0]?.message?.content ?? "";

    if (!raw) {
      return NextResponse.json(
        { error: "AI returned empty response" },
        { status: 502 },
      );
    }

    // Parse JSON — handle markdown-wrapped JSON
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    let parsed: RefineResponse;
    try {
      parsed = JSON.parse(jsonStr) as RefineResponse;
    } catch {
      // Fallback: treat raw as QUESTION with the raw text as message
      parsed = { intent: "QUESTION", message: raw };
    }

    // Validate intent
    const validIntents: IntentType[] = ["QUESTION", "ADVISORY", "MUTATION"];
    if (!validIntents.includes(parsed.intent)) {
      parsed.intent = "QUESTION";
    }

    // Build response — only include fields relevant to the intent
    const response: Record<string, unknown> = {
      intent: parsed.intent,
      message: parsed.message,
    };

    if (parsed.intent === "ADVISORY" && Array.isArray(parsed.proposals)) {
      response.proposals = parsed.proposals;
    }

    if (parsed.intent === "MUTATION") {
      if (parsed.updatedPrd) response.updatedPrd = parsed.updatedPrd;
      if (parsed.updatedTasks) response.updatedTasks = parsed.updatedTasks;
    }

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("refine error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
