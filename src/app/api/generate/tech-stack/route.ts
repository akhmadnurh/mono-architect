import { NextResponse } from "next/server";
import { generateTechStack } from "@/lib/ai";
import type { ProjectScale } from "@/types/project";

export async function POST(req: Request) {
  const { abstractIdea, answers, scale } = (await req.json()) as {
    abstractIdea: string;
    answers: { question: string; value: string | string[] }[];
    scale: ProjectScale;
  };
  if (!abstractIdea || !answers || !scale) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  try {
    const result = await generateTechStack(abstractIdea, answers, scale);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("generateTechStack error:", message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
