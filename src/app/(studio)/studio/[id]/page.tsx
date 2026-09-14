import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { StudioClient } from "@/components/studio/studio-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudioPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, title: true, userId: true },
  });

  if (!project || project.userId !== session.user.id) notFound();

  return <StudioClient project={project} />;
}
