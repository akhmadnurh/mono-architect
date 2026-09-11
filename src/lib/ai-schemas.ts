import { z } from "zod";

// --- Q&A (Fase 2) ---
export const QuestionSchema = z.object({
  questionId: z.string().describe("Unique identifier for the question"),
  question: z.string().describe("The question text"),
  options: z
    .array(z.string())
    .optional()
    .describe("Multiple-choice options if applicable"),
});

export const QAResponseSchema = z.object({
  questions: z
    .array(QuestionSchema)
    .min(3)
    .max(5)
    .describe("3-5 contextual questions based on the project idea"),
});

// --- Tech Stack (Fase 3) ---
export const TechStackOptionsSchema = z.object({
  frontend: z.array(z.string()).describe("Frontend technology options"),
  backend: z
    .array(z.string())
    .describe("Backend technology options (empty if not needed)"),
  database: z
    .array(z.string())
    .describe("Database options (empty if not needed)"),
  deployment: z
    .array(z.string())
    .describe("Deployment options (empty if not needed)"),
});

// Legacy flat format for downstream compatibility
export const TechStackItemSchema = z.object({
  category: z
    .string()
    .describe("Category: frontend, backend, database, deployment"),
  name: z.string().describe("Specific technology name"),
  reason: z.string().describe("Why this technology fits the project"),
});

export const TechStackResponseSchema = z.object({
  stack: z.array(TechStackItemSchema).describe("Recommended tech stack items"),
});

// --- Node Tree (Fase 4) ---
export const NodeSchema = z.object({
  id: z.string(),
  type: z
    .string()
    .describe("React Flow node type: root | feature | module | note"),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.record(z.unknown()).describe("Label and optional metadata"),
});

export const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().nullable().optional(),
});

export const NodeTreeSchema = z.object({
  nodes: z.array(NodeSchema).describe("All nodes in the architecture mindmap"),
  edges: z.array(EdgeSchema).describe("Connections between nodes"),
});

// --- Inferred types ---
export type Question = z.infer<typeof QuestionSchema>;
export type QAResponse = z.infer<typeof QAResponseSchema>;
export type TechStackOptions = z.infer<typeof TechStackOptionsSchema>;
export type TechStackItemZod = z.infer<typeof TechStackItemSchema>;
export type TechStackResponse = z.infer<typeof TechStackResponseSchema>;
export type NodeTreeResponse = z.infer<typeof NodeTreeSchema>;
