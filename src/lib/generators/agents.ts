import type { TechStackItem } from "@/types/project";

interface AGENTSInput {
  title: string;
  scale: string;
  techStack: TechStackItem[];
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateAGENTS(input: AGENTSInput): string {
  const { title, scale, techStack } = input;
  const lines: string[] = [];

  lines.push(`# ${title}`, "");
  lines.push(
    `> Scale: ${scale === "weekend" ? "Weekend Sprint" : "Startup"}`,
    "",
  );

  // --- Tech Stack Constraints ---
  if (techStack.length) {
    lines.push("## Tech Stack", "");
    for (const t of techStack) {
      lines.push(`- **${t.category}**: ${t.name} — ${t.reason}`);
    }
    lines.push("");
  }

  // --- Folder Structure Conventions ---
  lines.push("## Folder Structure", "");
  lines.push("```");
  const name = slugify(title);
  const hasFrontend = techStack.some((t) => t.category === "frontend");
  const backendFramework = techStack.find(
    (t) => t.category === "backend",
  )?.name;

  if (hasFrontend) {
    lines.push(`${name}/`);
    lines.push("├── src/");
    lines.push(
      "│   ├── app/          # Next.js App Router pages and API routes",
    );
    lines.push("│   ├── components/   # Reusable UI components");
    lines.push("│   │   └── ui/       # Base UI primitives (shadcn)");
  } else if (backendFramework === "NestJS") {
    lines.push(`${name}/`);
    lines.push("├── src/");
    lines.push(
      "│   ├── modules/      # Feature modules (controller + service)",
    );
    lines.push("│   ├── main.ts       # Application entry point");
    lines.push("│   └── common/       # Shared decorators, guards, pipes");
  } else if (backendFramework === "Express" || backendFramework === "Hono") {
    lines.push(`${name}/`);
    lines.push("├── src/");
    lines.push("│   ├── routes/       # API route handlers");
    lines.push("│   ├── controllers/  # Request/response logic");
    lines.push("│   ├── middleware/    # Custom middleware");
  } else {
    lines.push(`${name}/`);
    lines.push("├── src/");
    lines.push("│   ├── app/          # Application pages and API routes");
    lines.push("│   ├── components/   # Reusable UI components");
  }

  if (techStack.some((t) => t.category === "orm" && t.name === "Prisma")) {
    if (hasFrontend) {
      lines.push("│   └── lib/          # Shared utilities, prisma singleton");
    } else {
      lines.push("│   └── lib/          # Shared utilities, prisma singleton");
    }
    lines.push("├── prisma/");
    lines.push("│   └── schema.prisma # Database schema (source of truth)");
  } else if (
    techStack.some((t) => t.category === "orm" && t.name === "Drizzle")
  ) {
    if (hasFrontend) {
      lines.push("│   └── lib/          # Shared utilities, db client");
    } else {
      lines.push("│   └── lib/          # Shared utilities, db client");
    }
    lines.push("├── drizzle/          # Migration files");
  } else {
    lines.push("│   └── lib/          # Shared utilities");
  }

  if (techStack.some((t) => t.name === "Docker")) {
    lines.push("├── Dockerfile");
    lines.push("├── docker-compose.yml");
  }
  lines.push("```", "");

  // --- Operational Rules ---
  lines.push("## Operational Rules", "");
  lines.push("");
  lines.push(
    "1. **Read before writing**: Always read `PRD.md` before writing any code.",
  );
  lines.push(
    "2. **Follow the checklist**: Work through `TASKS.md` top-to-bottom. After completing a sub-task, mark it `[x]`.",
  );
  lines.push(
    "3. **Never skip acceptance criteria**: A task is done only when ALL its acceptance criteria are met.",
  );
  lines.push(
    "4. **No unlisted dependencies**: Never introduce a dependency not listed in the tech stack without explicit approval.",
  );
  lines.push(
    "5. **Boring over clever**: Prefer standard library and existing patterns over novel solutions.",
  );
  lines.push(
    "6. **One commit per task**: Each completed task should be a single, coherent commit.",
  );
  lines.push("");

  // --- DB Schema Handling Rules ---
  const hasORM = techStack.some(
    (t) => t.category === "orm" || t.category === "database",
  );
  if (hasORM) {
    const ormName =
      techStack.find((t) => t.category === "orm")?.name ??
      techStack.find((t) => t.category === "database")?.name ??
      "Prisma";
    lines.push(`## Database Schema Rules (${ormName})`);
    lines.push("");
    lines.push("When modifying `prisma/schema.prisma`:");
    lines.push("");
    lines.push(
      "1. Edit `prisma/schema.prisma` — this is the single source of truth.",
    );
    lines.push("2. Run `npx prisma db push` to sync schema to database.");
    lines.push("3. Run `npx prisma generate` to regenerate the client.");
    lines.push(
      "4. Never hand-edit migration files; use `prisma migrate dev` for production.",
    );
    lines.push(
      "5. All model fields must have explicit types; never use `Any` or `Json` unless justified.",
    );
    lines.push("6. Foreign key relations must define `onDelete` behavior.");
    lines.push("7. Run `pnpm lint` and `pnpm test` after every schema change.");
    lines.push("");
  }

  // --- Split-Stack Rules ---
  const hasSplitStack = (() => {
    const fe = techStack.some((t) => t.category === "frontend");
    const be = techStack.some((t) => t.category === "backend");
    const feName = techStack.find((t) => t.category === "frontend")?.name;
    const beName = techStack.find((t) => t.category === "backend")?.name;
    return fe && be && feName !== beName;
  })();

  if (hasSplitStack) {
    lines.push("## Split-Stack Rules");
    lines.push("");
    lines.push(
      "This project has a split-stack architecture (different frontend and backend frameworks).",
    );
    lines.push("");
    lines.push(
      "- **Frontend code** goes in `apps/frontend/` (or `frontend/` in monorepo).",
    );
    lines.push(
      "- **Backend code** goes in `apps/backend/` (or `backend/` in monorepo).",
    );
    lines.push(
      "- **Shared code** (types, utilities) goes in `packages/shared/`.",
    );
    lines.push(
      "- Never import directly from the other stack's `src/` — use the shared package.",
    );
    lines.push(
      "- API contracts between stacks must be defined as shared TypeScript interfaces.",
    );
    lines.push("");
  }

  // --- General Workflow ---
  lines.push("## Workflow");
  lines.push("");
  lines.push("For each task in `TASKS.md`:");
  lines.push("");
  lines.push("1. Read the task and its acceptance criteria");
  lines.push("2. Implement the code changes");
  lines.push("3. Write or update tests");
  lines.push("4. Run `pnpm lint` and `pnpm test`");
  lines.push("5. Mark the task `[x]` in `TASKS.md`");
  lines.push("6. Commit with a descriptive message");
  lines.push("");

  return lines.join("\n");
}
