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
  lines.push(`${name}/`);
  lines.push("├── src/");
  lines.push("│   ├── app/          # Next.js App Router pages and API routes");
  lines.push("│   ├── components/   # Reusable UI components");
  lines.push("│   │   └── ui/       # Base UI primitives (shadcn)");

  if (techStack.some((t) => t.category === "orm" && t.name === "Prisma")) {
    lines.push("│   └── lib/          # Shared utilities, prisma singleton");
    lines.push("├── prisma/");
    lines.push("│   └── schema.prisma # Database schema (source of truth)");
  } else if (
    techStack.some((t) => t.category === "orm" && t.name === "Drizzle")
  ) {
    lines.push("│   └── lib/          # Shared utilities, db client");
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

  // --- Database Workflow ---
  if (techStack.some((t) => t.category === "orm" && t.name === "Prisma")) {
    lines.push("## Database Workflow", "");
    lines.push("");
    lines.push("When modifying `prisma/schema.prisma`:");
    lines.push("");
    lines.push("1. Edit `prisma/schema.prisma`");
    lines.push("2. Run `npx prisma db push` to sync schema to database");
    lines.push("3. Run `npx prisma generate` to regenerate the client");
    lines.push("4. Update any affected code");
    lines.push("");
  }

  // --- General Workflow ---
  lines.push("## Workflow", "");
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
