import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = async (_req: Request, { params }: RouteContext) => {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project || project.userId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: project.id,
    title: project.title,
    abstractIdea: project.abstractIdea,
    scale: project.scale,
    answers: project.answers,
    techStack: project.techStack,
    nodeTree: project.nodeTree,
    currentStep: project.currentStep,
    status: project.status,
  });
};

export const PUT = async (req: Request, { params }: RouteContext) => {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;

  const project = await prisma.project.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!project || project.userId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title;
  if (typeof body.abstractIdea === "string")
    data.abstractIdea = body.abstractIdea;
  if (typeof body.scale === "string") data.scale = body.scale;
  if (body.answers !== undefined) data.answers = body.answers;
  if (body.techStack !== undefined) data.techStack = body.techStack;
  if (body.nodeTree !== undefined) data.nodeTree = body.nodeTree;
  if (typeof body.currentStep === "number") data.currentStep = body.currentStep;
  if (typeof body.status === "string") data.status = body.status;
  if (typeof body.prdContent === "string") data.prdContent = body.prdContent;
  if (typeof body.tasksContent === "string")
    data.tasksContent = body.tasksContent;
  if (typeof body.agentsContent === "string")
    data.agentsContent = body.agentsContent;

  await prisma.project.update({
    where: { id },
    data,
  });

  return NextResponse.json({ ok: true });
};
