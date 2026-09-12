export type TechStackCategory =
  | "frontend"
  | "backend"
  | "database"
  | "deployment"
  | "orm"
  | "uiLibrary"
  | "stateManagement";

export interface TechStackPreset {
  name: string;
  reason: string;
}

export const TECH_STACK_PRESETS: Record<TechStackCategory, TechStackPreset[]> =
  {
    frontend: [
      {
        name: "Next.js",
        reason:
          "Full-stack React framework with App Router, server components, and built-in API routes.",
      },
      {
        name: "React + Vite",
        reason:
          "Fast dev experience with Vite bundler; pair with a separate backend.",
      },
      {
        name: "Astro",
        reason:
          "Content-first framework; ships zero JS by default, supports any UI framework.",
      },
    ],
    backend: [
      {
        name: "Next.js API Routes",
        reason:
          "Colocated API handlers inside the Next.js app; no separate server needed.",
      },
      {
        name: "Express.js",
        reason: "Minimal, battle-tested Node.js framework for REST APIs.",
      },
      {
        name: "NestJS",
        reason:
          "Opinionated Node.js framework with dependency injection; suits large codebases.",
      },
      {
        name: "Hono",
        reason:
          "Ultra-lightweight web framework; runs on Node, Deno, Bun, and edge runtimes.",
      },
    ],
    database: [
      {
        name: "PostgreSQL",
        reason:
          "Production-grade relational DB; strong ACID, JSON support, and rich extension ecosystem.",
      },
      {
        name: "MySQL",
        reason: "Widely-used relational DB; solid for read-heavy workloads.",
      },
      {
        name: "MongoDB",
        reason:
          "Document-oriented NoSQL; flexible schema for rapidly evolving data models.",
      },
      {
        name: "SQLite",
        reason:
          "Serverless embedded DB; ideal for prototypes and single-server deployments.",
      },
    ],
    deployment: [
      {
        name: "Docker",
        reason:
          "Containerized deployments; consistent environments from dev to production.",
      },
      {
        name: "Vercel",
        reason:
          "Zero-config deploy for Next.js; includes edge functions and analytics.",
      },
      {
        name: "VPS (manual)",
        reason:
          "Full control over the server; deploy via SSH + Docker or direct Node process.",
      },
    ],
    orm: [
      {
        name: "Prisma",
        reason:
          "Type-safe ORM with auto-generated client, migrations, and Prisma Studio.",
      },
      {
        name: "Drizzle",
        reason:
          "Lightweight TypeScript ORM; SQL-like API with zero runtime overhead.",
      },
    ],
    uiLibrary: [
      {
        name: "shadcn/ui + Tailwind",
        reason:
          "Copy-paste accessible components built on Radix primitives; fully customizable via Tailwind.",
      },
      {
        name: "MUI (Material UI)",
        reason: "Comprehensive component library with Material Design system.",
      },
      {
        name: "Ant Design",
        reason:
          "Enterprise-grade component library; strong for admin dashboards.",
      },
    ],
    stateManagement: [
      {
        name: "Zustand",
        reason:
          "Minimal boilerplate state management; works with or without React.",
      },
      {
        name: "Redux Toolkit",
        reason:
          "Predictable state container with DevTools; suits complex app state.",
      },
      {
        name: "Jotai",
        reason:
          "Atomic state model; fine-grained reactivity with minimal boilerplate.",
      },
    ],
  };
