import type { Prisma } from "@prisma/client";

// --- Scale ---
export const PROJECT_SCALES = ["weekend", "startup"] as const;
export type ProjectScale = (typeof PROJECT_SCALES)[number];

// --- Q&A answers ---
export interface ProjectAnswer {
  questionId: string;
  value: string | string[];
}

// --- Tech stack ---
export interface TechStackItem {
  category: string;
  name: string;
  reason: string;
}

// --- React Flow node tree ---
export interface ProjectNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface ProjectEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ProjectNodeTree {
  nodes: ProjectNode[];
  edges: ProjectEdge[];
}

// --- Prisma row helpers ---
export type ProjectRow = Prisma.ProjectGetPayload<Record<string, never>>;

/** Cast a raw ProjectRow's Json fields into strict types */
export function parseProjectRow(row: ProjectRow) {
  return {
    ...row,
    answers: row.answers as unknown as ProjectAnswer[],
    techStack: row.techStack as unknown as TechStackItem[],
    nodeTree: (row.nodeTree ?? null) as ProjectNodeTree | null,
  };
}
