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
    select: { prdContent: true, userId: true },
  });

  if (!project || project.userId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ content: project.prdContent ?? "" });
};

export const PUT = async (req: Request, { params }: RouteContext) => {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { content } = (await req.json()) as { content: string };

  const project = await prisma.project.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!project || project.userId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.project.update({
    where: { id },
    data: { prdContent: content },
  });

  return NextResponse.json({ ok: true });
};
