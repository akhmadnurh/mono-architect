import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async () => {
  const session = await auth();
  if (!session?.user) return NextResponse.json([], { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      title: true,
      scale: true,
      createdAt: true,
      status: true,
      currentStep: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
};

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    title?: string;
    abstractIdea?: string;
    scale?: string;
    answers?: unknown;
    techStack?: unknown;
    currentStep?: number;
  };

  const project = await prisma.project.create({
    data: {
      userId: session.user.id,
      title: body.title ?? "Untitled",
      abstractIdea: body.abstractIdea ?? "",
      scale: body.scale ?? "weekend",
      answers: (body.answers ?? []) as object,
      techStack: (body.techStack ?? []) as object,
      currentStep: body.currentStep ?? 1,
    },
  });

  return NextResponse.json({ id: project.id }, { status: 201 });
};
