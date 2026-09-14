import { NextResponse } from "next/server";
import { generateQuestions } from "@/lib/ai";

export async function POST(req: Request) {
  const { abstractIdea, previousAnswers } = (await req.json()) as {
    abstractIdea: string;
    previousAnswers?: Array<{ question: string; value: string | string[] }>;
  };
  if (!abstractIdea || typeof abstractIdea !== "string") {
    return NextResponse.json(
      { error: "abstractIdea is required" },
      { status: 400 },
    );
  }
  try {
    const result = await generateQuestions(abstractIdea, previousAnswers);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("generateQuestions error:", message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
