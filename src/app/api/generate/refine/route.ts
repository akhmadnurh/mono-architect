import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { AI_BASE_URL, AI_API_KEY, MODEL_ID } from "@/lib/ai/config";

interface RefineRequest {
  projectId: string;
  instruction: string;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, instruction } = (await req.json()) as RefineRequest;

  if (!projectId || !instruction) {
    return NextResponse.json(
      { error: "projectId and instruction are required" },
      { status: 400 },
    );
  }

  // Fetch current PRD
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { prdContent: true, userId: true },
  });

  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const currentPrd = project.prdContent ?? "";

  // Call AI to refine the PRD
  const systemPrompt = `You are a senior software architect and technical writer. You refine and update Product Requirement Documents (PRD).

RULES:
- Return the COMPLETE refined PRD in markdown format.
- Apply the user's instruction to the existing PRD.
- Preserve all existing sections unless the instruction says to modify them.
- Be specific and detailed in your additions.
- Return ONLY the markdown content, no explanation or wrapping.`;

  const userPrompt = `Current PRD:
---
${currentPrd || "(empty — create a new PRD)"}
---

User instruction: ${instruction}

Refine the PRD according to the instruction above. Return the complete updated PRD in markdown.`;

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
    const refinedContent: string = data.choices?.[0]?.message?.content ?? "";

    if (!refinedContent) {
      return NextResponse.json(
        { error: "AI returned empty response" },
        { status: 502 },
      );
    }

    // Save refined PRD to database
    await prisma.project.update({
      where: { id: projectId },
      data: { prdContent: refinedContent },
    });

    return NextResponse.json({ content: refinedContent });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("refine error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
