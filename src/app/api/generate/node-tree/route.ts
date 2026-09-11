import { NextResponse } from "next/server";
import { generateNodeTree } from "@/lib/ai";
import type { ProjectScale, TechStackItem } from "@/types/project";

export async function POST(req: Request) {
  const { abstractIdea, answers, techStack, scale } = (await req.json()) as {
    abstractIdea: string;
    answers: { question: string; value: string | string[] }[];
    techStack: TechStackItem[];
    scale: ProjectScale;
  };
  if (!abstractIdea || !answers || !techStack || !scale) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  try {
    const result = await generateNodeTree(
      abstractIdea,
      answers,
      techStack,
      scale,
    );
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("generateNodeTree error:", message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
