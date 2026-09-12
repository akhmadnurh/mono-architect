import type { Prisma } from "@prisma/client";

// --- Scale ---
export const PROJECT_SCALES = ["weekend", "startup"] as const;
export type ProjectScale = (typeof PROJECT_SCALES)[number];

// --- Q&A answers ---
export interface ProjectAnswer {
  questionId: string;
  question?: string;
  value: string | string[];
}

// --- Tech stack ---
export interface TechStackItem {
  category: string;
  name: string;
  reason: string;
}

export type TechStackMode = "ai" | "manual";

// --- React Flow node tree ---
export interface ProjectNode {
  id: string;
  type?: string;
  position?: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface ProjectEdge {
  id: string;
  source: string;
  target: string;
  label?: string | null;
}

export interface ProjectNodeTree {
  nodes: ProjectNode[];
  edges: ProjectEdge[];
}

// --- Data model entities (for PRD) ---
export interface ProjectEntity {
  name: string;
  description?: string;
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
