import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async () => {
  const session = await auth();
  if (!session?.user) return NextResponse.json([], { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    select: { id: true, title: true, scale: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
};
