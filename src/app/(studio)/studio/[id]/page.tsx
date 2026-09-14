import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { StudioClient } from "@/components/studio/studio-client";
import type {
  ProjectAnswer,
  TechStackItem,
  ProjectNodeTree,
} from "@/types/project";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudioPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      userId: true,
      abstractIdea: true,
      scale: true,
      answers: true,
      techStack: true,
      nodeTree: true,
      prdContent: true,
      tasksContent: true,
      agentsContent: true,
      currentStep: true,
      status: true,
    },
  });

  if (!project || project.userId !== session.user.id) notFound();

  return (
    <StudioClient
      project={{
        id: project.id,
        title: project.title,
        abstractIdea: project.abstractIdea,
        scale: project.scale as "weekend" | "startup",
        answers: project.answers as Array<{
          questionId: string;
          question: string;
          value: string;
        }>,
        techStack: project.techStack as Array<{
          category: string;
          name: string;
          reason: string;
        }>,
        nodeTree: (project.nodeTree as unknown as ProjectNodeTree) ?? null,
        prdContent: project.prdContent,
        tasksContent: project.tasksContent,
        agentsContent: project.agentsContent,
        currentStep: project.currentStep,
        status: project.status,
      }}
    />
  );
}
