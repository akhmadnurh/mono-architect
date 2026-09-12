import { z } from "zod";

// --- Q&A (Fase 2) ---
export const QuestionSchema = z.object({
  questionId: z.string().describe("Unique identifier for the question"),
  question: z.string().describe("The question text"),
  options: z
    .array(z.string())
    .nullable()
    .optional()
    .describe(
      "Multiple-choice options if applicable, null if free-text question",
    ),
});

export const QAResponseSchema = z.object({
  questions: z
    .array(QuestionSchema)
    .min(3)
    .max(5)
    .describe("3-5 contextual questions based on the project idea"),
});

// --- Tech Stack (Fase 3) ---
const TechStackOptionItem = z.object({
  name: z.string().describe("Technology name"),
  reason: z.string().describe("Why this technology is recommended"),
});

export const TechStackOptionsSchema = z.object({
  frontend: z
    .array(TechStackOptionItem)
    .describe("Frontend technology options"),
  backend: z
    .array(TechStackOptionItem)
    .describe("Backend technology options (empty if not needed)"),
  database: z
    .array(TechStackOptionItem)
    .describe("Database options (empty if not needed)"),
  deployment: z
    .array(TechStackOptionItem)
    .describe("Deployment options (empty if not needed)"),
  orm: z
    .array(TechStackOptionItem)
    .describe("ORM options (empty if not needed)"),
  uiLibrary: z
    .array(TechStackOptionItem)
    .describe("UI library options (empty if not needed)"),
  stateManagement: z
    .array(TechStackOptionItem)
    .describe("State management options (empty if not needed)"),
});

export const TechStackItemSchema = z.object({
  category: z
    .string()
    .describe(
      "Category: frontend, backend, database, deployment, orm, uiLibrary, stateManagement",
    ),
  name: z.string().describe("Specific technology name"),
  reason: z.string().describe("Why this technology fits the project"),
});

// --- Node Tree (Fase 4) ---
export const NodeSchema = z.object({
  id: z.string(),
  type: z
    .string()
    .describe("React Flow node type: root | feature | module | note"),
  data: z.record(z.unknown()).describe("Label and optional metadata"),
});

export const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().nullable().optional(),
});

const EntitySchema = z.object({
  name: z.string().describe("Entity name, e.g. User, Transaction"),
  description: z
    .string()
    .optional()
    .describe("Brief description of the entity's purpose"),
});

export const NodeTreeSchema = z.object({
  nodes: z.array(NodeSchema).describe("All nodes in the architecture mindmap"),
  edges: z.array(EdgeSchema).describe("Connections between nodes"),
  techStack: z
    .array(TechStackItemSchema)
    .optional()
    .describe("AI-chosen tech stack (when user asks AI to pick in Step 3)"),
  entities: z
    .array(EntitySchema)
    .optional()
    .describe("Key database entities inferred from the architecture"),
});

// --- Inferred types ---
export type Question = z.infer<typeof QuestionSchema>;
export type QAResponse = z.infer<typeof QAResponseSchema>;
export type TechStackOptions = z.infer<typeof TechStackOptionsSchema>;
export type TechStackItemZod = z.infer<typeof TechStackItemSchema>;
export type NodeTreeResponse = z.infer<typeof NodeTreeSchema>;
