import { streamText, createTextStreamResponse, toTextStream } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { ProjectScale, TechStackItem } from "@/types/project";

const AI_BASE_URL = process.env.AI_BASE_URL || "";
const AI_API_KEY = process.env.AI_API_KEY || "";
const MODEL_ID = process.env.AI_MODEL || "openai/gpt-4o-mini";

const provider = createOpenAICompatible({
  name: "mono",
  baseURL: AI_BASE_URL,
  apiKey: AI_API_KEY,
});
const model = provider.chatModel(MODEL_ID);

export async function POST(req: Request) {
  const { abstractIdea, answers, techStack, scale } = (await req.json()) as {
    abstractIdea: string;
    answers: { question: string; value: string | string[] }[];
    techStack: TechStackItem[];
    scale: ProjectScale;
  };
  if (!abstractIdea || !answers || !scale) {
    return new Response(JSON.stringify({ error: "Missing fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const answerText = answers
    .map(
      (a) =>
        `- ${a.question}: ${Array.isArray(a.value) ? a.value.join(", ") : a.value}`,
    )
    .join("\n");

  const stackText =
    techStack.length > 0
      ? techStack.map((t) => `- ${t.category}: ${t.name}`).join("\n")
      : "None specified — you should choose the best stack.";

  const aiPickHint =
    techStack.length === 0
      ? `\nSince no tech stack was chosen, YOU must pick the best technologies for this project. Fill the "techStack" array with your choices (category, name, and reason).`
      : `\nThe tech stack is pre-selected. Do NOT fill the "techStack" array.`;

  const prompt = `Generate a mindmap for this project as a React Flow node tree.

Project idea:
${abstractIdea}

Scale: ${scale}

User answers:
${answerText}

Tech stack:
${stackText}
${aiPickHint}

Create a tree structure with:
- 1 root node (project name)
- Feature/module nodes branching from root
- Sub-nodes for implementation details
- Edges connecting parent to children

Also identify the key database entities (e.g. User, Transaction, Product) from the project description and list them in the "entities" array.`;

  const jsonSchemaPrompt = `

Do NOT include position data — the client will compute layout automatically.

Respond with JSON matching this schema:
{
  "nodes": [{ "id": "string", "type": "root|feature|module|note", "data": {"label": "string"} }],
  "edges": [{ "id": "string", "source": "string", "target": "string", "label": "string|null" }],
  "techStack": [{ "category": "string", "name": "string", "reason": "string" }],
  "entities": [{ "name": "string", "description": "string" }]
}`;

  // Stream plain JSON — works with ALL models including those that don't
  // support structured outputs (e.g. GLM-5.3-flash, Qwen, DeepSeek).
  // The client collects the full text and parses JSON from it.
  const result = streamText({
    model,
    instructions:
      "You are a senior software architect. Generate architecture mindmaps as JSON. Respond with ONLY a valid JSON object — no markdown fences, no explanation, no extra text.",
    prompt: prompt + jsonSchemaPrompt,
  });

  return createTextStreamResponse({
    stream: toTextStream({ stream: result.stream }),
  });
}
