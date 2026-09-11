import { NextResponse } from "next/server";
import { generateQuestions } from "@/lib/ai";

export async function POST(req: Request) {
  const { abstractIdea } = (await req.json()) as { abstractIdea: string };
  if (!abstractIdea || typeof abstractIdea !== "string") {
    return NextResponse.json(
      { error: "abstractIdea is required" },
      { status: 400 },
    );
  }
  try {
    const result = await generateQuestions(abstractIdea);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("generateQuestions error:", message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
