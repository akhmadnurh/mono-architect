import type {
  ProjectNodeTree,
  ProjectScale,
  TechStackItem,
} from "@/types/project";
import {
  QAResponseSchema,
  NodeTreeSchema,
  type QAResponse,
} from "./ai-schemas";

const AI_BASE_URL = process.env.AI_BASE_URL || "";
const AI_API_KEY = process.env.AI_API_KEY || "";
const MODEL_ID = process.env.AI_MODEL || "openai/gpt-4o-mini";

/** Direct chat completion — bypasses Vercel AI SDK to avoid SSE/parse issues with non-OpenAI models */
async function chat(system: string, prompt: string): Promise<string> {
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
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`AI API ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/** Extract the first valid JSON object or array from LLM output — handles code fences, extra text, and trailing garbage */
function extractJson(text: string): unknown {
  const trimmed = text.trim();

  // Strip markdown code fences if present
  const fenceMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  const raw = fenceMatch ? fenceMatch[1].trim() : trimmed;

  // Find first { or [
  const start = raw.search(/[[{]/);
  if (start === -1) throw new Error("No JSON found in response");

  const openChar = raw[start];
  let braceDepth = 0;
  let bracketDepth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < raw.length; i++) {
    const ch = raw[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") braceDepth++;
    if (ch === "}") braceDepth--;
    if (ch === "[") bracketDepth++;
    if (ch === "]") bracketDepth--;
    if (
      i > start &&
      ((openChar === "{" && braceDepth === 0) ||
        (openChar === "[" && bracketDepth === 0))
    ) {
      return JSON.parse(raw.slice(start, i + 1));
    }
  }

  // Fallback: try parsing raw as-is
  return JSON.parse(raw);
}

const JSON_ONLY =
  "You MUST respond with a single valid JSON object or array. No markdown, no explanation, no extra text. Just raw JSON.";

/** Fase 2: generate 3-5 contextual questions from an abstract idea */
export async function generateQuestions(
  abstractIdea: string,
): Promise<QAResponse> {
  const text = await chat(
    `You are a senior software architect. You generate clarifying questions for software projects.\n\n${JSON_ONLY}`,
    `Based on the following project idea, generate 3-5 clarifying questions as a JSON object.

Project idea:
${abstractIdea}

Generate questions covering: core features, target users, data model, integrations, and deployment preferences.

Respond with JSON matching this schema:
{
  "questions": [
    { "questionId": "string", "question": "string", "options": ["string"] | null }
  ]
}`,
  );
  return QAResponseSchema.parse(extractJson(text));
}

/** Fase 4: generate architecture mindmap as React Flow node tree */
export async function generateNodeTree(
  abstractIdea: string,
  answers: { question: string; value: string | string[] }[],
  techStack: TechStackItem[],
  scale: ProjectScale,
): Promise<ProjectNodeTree> {
  const answerText = answers
    .map(
      (a) =>
        `- ${a.question}: ${Array.isArray(a.value) ? a.value.join(", ") : a.value}`,
    )
    .join("\n");
  const stackText = techStack
    .map((t) => `- ${t.category}: ${t.name}`)
    .join("\n");
  const text = await chat(
    `You are a senior software architect. You generate architecture mindmaps for software projects.\n\n${JSON_ONLY}`,
    `Generate an architecture mindmap for this project.

Project idea:
${abstractIdea}

Scale: ${scale}

User answers:
${answerText}

Tech stack:
${stackText}

Create a tree structure with:
- 1 root node (project name)
- Feature/module nodes branching from root
- Sub-nodes for implementation details
- Edges connecting parent to children

Do NOT include position data — the client will compute layout automatically.

Respond with JSON matching this schema:
{
  "nodes": [{ "id": "string", "type": "root|feature|module|note", "data": {"label": "string"} }],
  "edges": [{ "id": "string", "source": "string", "target": "string", "label": "string|null" }]
}`,
  );
  return NodeTreeSchema.parse(extractJson(text));
}
