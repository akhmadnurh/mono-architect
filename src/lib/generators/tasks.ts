import type { TechStackItem } from "@/types/project";
import type { ProjectNodeTree } from "@/types/project";

interface TASKSInput {
  title: string;
  techStack: TechStackItem[];
  nodeTree: ProjectNodeTree | null;
}

// ─── Smart File Router ──────────────────────────────────────────────
// Maps (category, name) → infrastructure file paths.
// Feature nodes get component/app paths via featureName.

const INFRA_FILE_MAP: Record<string, Record<string, string[]>> = {
  database: {
    Prisma: ["prisma/schema.prisma", "src/lib/prisma.ts"],
    Drizzle: ["drizzle.config.ts", "src/lib/db.ts"],
  },
  orm: {
    Prisma: ["prisma/schema.prisma", "src/lib/prisma.ts"],
    Drizzle: ["drizzle.config.ts", "src/lib/db.ts"],
  },
  deployment: {
    Docker: ["Dockerfile", "docker-compose.yml"],
    Vercel: ["vercel.json"],
  },
};

function inferInfraFiles(category: string, name: string): string[] {
  const map = INFRA_FILE_MAP[category]?.[name];
  if (map) return map;
  // Fallback: never generate src/lib/<category>.ts
  return ["README.md"];
}

// Feature-node file targets
const INFRA_KEYWORDS = [
  "infra",
  "deploy",
  "ci/cd",
  "docker",
  "vercel",
  "container",
  "hosting",
];
function inferFeatureFiles(
  label: string,
  techStack: TechStackItem[],
): string[] {
  const lower = label.toLowerCase();
  // Redirect infra-related nodes away from src/app/.../page.tsx
  if (INFRA_KEYWORDS.some((kw) => lower.includes(kw))) {
    if (lower.includes("docker") || lower.includes("container")) {
      return ["Dockerfile", "docker-compose.yml"];
    }
    if (lower.includes("vercel") || lower.includes("hosting")) {
      return ["vercel.json", "README.md"];
    }
    return ["Dockerfile", "docker-compose.yml", "README.md"];
  }
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  // Backend-only scope: use module paths instead of frontend paths
  const isBackend = !techStack.some((t) => t.category === "frontend");
  if (isBackend) {
    return [
      `src/modules/${slug}/${slug}.controller.ts`,
      `src/modules/${slug}/${slug}.service.ts`,
    ];
  }
  return [`src/app/${slug}/page.tsx`, `src/components/${slug}/`];
}

// ─── Domain entity extractor ───────────────────────────────────────
// Maps feature labels → real PascalCase Prisma model names + domain fields.

interface DomainEntity {
  modelName: string; // PascalCase Prisma model name
  fields: string[]; // domain-specific field definitions
}

const ENTITY_REGISTRY: { pattern: RegExp; entity: DomainEntity }[] = [
  // ── User / Auth ──
  {
    pattern: /^(user|account|profile|profil)/i,
    entity: {
      modelName: "User",
      fields: [
        "id          String   @id @default(cuid())",
        "email       String   @unique",
        "name        String?",
        "password    String   // bcrypt hash",
        "role        Role     @default(USER)",
        "avatarUrl   String?",
        "createdAt   DateTime @default(now())",
        "updatedAt   DateTime @updatedAt",
      ],
    },
  },
  // ── Auth / Session ──
  {
    pattern: /(auth|login|sign.?in|sign.?up|session)/i,
    entity: {
      modelName: "Session",
      fields: [
        "id           String   @id @default(cuid())",
        "userId       String",
        "user         User     @relation(fields: [userId], references: [id])",
        "token        String   @unique",
        "expiresAt    DateTime",
        "createdAt    DateTime @default(now())",
      ],
    },
  },
  // ── Mood / Emotion tracking ──
  {
    pattern: /(mood|emotion|feeling|perasaan)/i,
    entity: {
      modelName: "MoodLog",
      fields: [
        "id           String   @id @default(cuid())",
        "userId       String",
        "user         User     @relation(fields: [userId], references: [id])",
        "moodScale    Int      // 1-5",
        "energyLevel  Int      // 1-5",
        "note         String?",
        "tags         String[] // e.g. ['stress', 'productive']",
        "createdAt    DateTime @default(now())",
      ],
    },
  },
  // ── Journal / Voice journal ──
  {
    pattern: /(journal|diary|catatan|journal.?voice|voice)/i,
    entity: {
      modelName: "JournalEntry",
      fields: [
        "id           String   @id @default(cuid())",
        "userId       String",
        "user         User     @relation(fields: [userId], references: [id])",
        "title        String?",
        "content      String   // rich text or markdown",
        "audioUrl     String?  // for voice journals",
        "moodTag      String?",
        "createdAt    DateTime @default(now())",
        "updatedAt    DateTime @updatedAt",
      ],
    },
  },
  // ── Micro-break / Break ──
  {
    pattern: /(micro.?break|break|istirahat|rehat)/i,
    entity: {
      modelName: "MicroBreak",
      fields: [
        "id           String   @id @default(cuid())",
        "userId       String",
        "user         User     @relation(fields: [userId], references: [id])",
        "type         BreakType // BREATHING, STRETCH, MEDITATION",
        "durationSec  Int      // seconds",
        "completed    Boolean  @default(false)",
        "startedAt    DateTime @default(now())",
        "completedAt  DateTime?",
      ],
    },
  },
  // ── Product / Item / Catalog ──
  {
    pattern: /(product|item|barang|produk|catalog|katalog)/i,
    entity: {
      modelName: "Product",
      fields: [
        "id           String   @id @default(cuid())",
        "name         String",
        "slug         String   @unique",
        "description  String?",
        "price        Decimal  @db.Decimal(10, 2)",
        "stock        Int      @default(0)",
        "imageUrl     String?",
        "categoryId   String?",
        "category     Category? @relation(fields: [categoryId], references: [id])",
        "isActive     Boolean  @default(true)",
        "createdAt    DateTime @default(now())",
        "updatedAt    DateTime @updatedAt",
      ],
    },
  },
  // ── Order / Transaction ──
  {
    pattern: /(order|transaction|transaksi|checkout|pesanan)/i,
    entity: {
      modelName: "Order",
      fields: [
        "id           String   @id @default(cuid())",
        "userId       String",
        "user         User     @relation(fields: [userId], references: [id])",
        "status       OrderStatus @default(PENDING)",
        "totalAmount  Decimal  @db.Decimal(12, 2)",
        "notes        String?",
        "createdAt    DateTime @default(now())",
        "updatedAt    DateTime @updatedAt",
      ],
    },
  },
  // ── Post / Article / Content ──
  {
    pattern: /(post|article|artikel|content|konten|blog)/i,
    entity: {
      modelName: "Post",
      fields: [
        "id           String   @id @default(cuid())",
        "title        String",
        "slug         String   @unique",
        "body         String   // markdown",
        "excerpt      String?",
        "coverImage   String?",
        "authorId     String",
        "author       User     @relation(fields: [authorId], references: [id])",
        "status       PostStatus @default(DRAFT)",
        "publishedAt  DateTime?",
        "createdAt    DateTime @default(now())",
        "updatedAt    DateTime @updatedAt",
      ],
    },
  },
  // ── Comment / Review ──
  {
    pattern: /(comment|review|ulasan|komentar|rating)/i,
    entity: {
      modelName: "Review",
      fields: [
        "id           String   @id @default(cuid())",
        "userId       String",
        "user         User     @relation(fields: [userId], references: [id])",
        "targetId     String   // polymorphic ref",
        "targetType   String   // 'Product', 'Post', etc.",
        "rating       Int      // 1-5",
        "content      String?",
        "createdAt    DateTime @default(now())",
      ],
    },
  },
  // ── Notification / Alert ──
  {
    pattern: /(notification|alert|notifikasi|pemberitahuan)/i,
    entity: {
      modelName: "Notification",
      fields: [
        "id           String   @id @default(cuid())",
        "userId       String",
        "user         User     @relation(fields: [userId], references: [id])",
        "type         NotificationType",
        "title        String",
        "message      String",
        "read         Boolean  @default(false)",
        "createdAt    DateTime @default(now())",
      ],
    },
  },
  // ── Category / Tag ──
  {
    pattern: /(category|kategori|tag|label)/i,
    entity: {
      modelName: "Category",
      fields: [
        "id           String   @id @default(cuid())",
        "name         String",
        "slug         String   @unique",
        "description  String?",
        "parentId     String?",
        "parent       Category? @relation(fields: [parentId], references: [id])",
        "createdAt    DateTime @default(now())",
      ],
    },
  },
  // ── Settings / Preference ──
  {
    pattern: /(setting|preferensi|prefer|config|konfigurasi)/i,
    entity: {
      modelName: "UserSetting",
      fields: [
        "id               String   @id @default(cuid())",
        "userId           String   @unique",
        "user             User     @relation(fields: [userId], references: [id])",
        "theme            Theme    @default(SYSTEM)",
        "language         String   @default('id')",
        "emailNotif       Boolean  @default(true)",
        "pushNotif        Boolean  @default(true)",
        "updatedAt        DateTime @updatedAt",
      ],
    },
  },
  // ── Exercise / Activity ──
  {
    pattern: /(exercise|latihan|activity|aktivitas|workout|breathing|meditation)/i,
    entity: {
      modelName: "Activity",
      fields: [
        "id           String   @id @default(cuid())",
        "userId       String",
        "user         User     @relation(fields: [userId], references: [id])",
        "type         ActivityType // BREATHING, EXERCISE, MEDITATION",
        "name         String",
        "durationSec  Int",
        "calories     Int?",
        "completed    Boolean  @default(false)",
        "createdAt    DateTime @default(now())",
      ],
    },
  },
  // ── Payment / Billing ──
  {
    pattern: /(payment|billing|pembayaran|tagihan|subscription)/i,
    entity: {
      modelName: "Payment",
      fields: [
        "id           String   @id @default(cuid())",
        "userId       String",
        "user         User     @relation(fields: [userId], references: [id])",
        "amount       Decimal  @db.Decimal(12, 2)",
        "currency     String   @default('IDR')",
        "method       PaymentMethod",
        "status       PaymentStatus @default(PENDING)",
        "stripeId     String?  @unique",
        "createdAt    DateTime @default(now())",
      ],
    },
  },
  // ── Dashboard / Analytics (aggregation, no own model) ──
  {
    pattern: /(dashboard|analytic|stats|laporan|report)/i,
    entity: {
      modelName: "", // no dedicated model — uses aggregation
      fields: [],
    },
  },
];

function inferDomainEntity(label: string): DomainEntity {
  for (const { pattern, entity } of ENTITY_REGISTRY) {
    if (pattern.test(label)) return entity;
  }
  // Fallback: PascalCase from label
  const fallback = label
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
  return {
    modelName: fallback || "Item",
    fields: [
      "id          String   @id @default(cuid())",
      "name        String",
      "createdAt   DateTime @default(now())",
      "updatedAt   DateTime @updatedAt",
    ],
  };
}

// ─── Sub-task generators (high-density, feature-specific) ──────────

interface TaskSections {
  database: string[];
  api: string[];
  ui: string[];
  controller: string[];
  edgeCases: string[];
}

function inferTaskSections(
  label: string,
  nodeType: string | undefined,
  techStack: TechStackItem[],
): TaskSections {
  const lower = label.toLowerCase();
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const hasFrontend = techStack.some((t) => t.category === "frontend");
  const hasBackend = techStack.some(
    (t) => t.category === "backend" || t.category === "orm",
  );
  const isBackendOnly = hasBackend && !hasFrontend;
  const ormName =
    techStack.find((t) => t.category === "orm")?.name ?? "Prisma";

  // ── Resolve domain entity ──
  const entity = inferDomainEntity(label);

  // ── Database & DTO ──
  const database: string[] = [];
  if (ormName === "Prisma") {
    if (entity.modelName) {
      database.push(
        `Create Prisma model \`${entity.modelName}\` in \`prisma/schema.prisma\`:`,
      );
      for (const field of entity.fields) {
        database.push(`  - \`${field}\``);
      }
    } else {
      database.push(
        `No dedicated model needed — use Prisma \`aggregate\` and \`groupBy\` queries`,
      );
    }
    database.push(
      `Run \`npx prisma migrate dev --name add_${entity.modelName || slug}\``,
    );
  } else {
    database.push(
      `Define \`${entity.modelName || slug}\` table in \`drizzle/schema.ts\` with columns: id, createdAt, updatedAt`,
    );
    database.push(`Create Drizzle migration via \`npx drizzle-kit generate\``);
  }
  database.push(
    `Create DTO class in \`src/modules/${slug}/dto/create-${slug}.dto.ts\` with class-validator (@IsString, @IsNotEmpty, etc) and class-transformer decorators`,
  );
  database.push(
    `Add input sanitization at API boundary: strip HTML, trim whitespace, enforce max length`,
  );

  // ── Business Logic & API ──
  const api: string[] = [];

  if (
    lower.includes("auth") ||
    lower.includes("login") ||
    lower.includes("sign")
  ) {
    api.push(
      `Create \`POST /api/auth/signin\` route: validate credentials, create session cookie via next-auth`,
    );
    api.push(
      `Create \`POST /api/auth/signup\` route: hash password with bcrypt (12 rounds), store in DB`,
    );
    api.push(
      `Add \`middleware.ts\` matcher for protected routes: \`/dashboard\`, \`/settings\``,
    );
    api.push(
      `Implement rate limiting: max 5 login attempts per 15-minute window per IP`,
    );
    api.push(
      `Add CSRF token validation on sign-in/sign-up form actions`,
    );
  } else if (
    lower.includes("dashboard") ||
    lower.includes("analytic") ||
    lower.includes("chart") ||
    lower.includes("report")
  ) {
    api.push(
      `Create \`GET /api/${slug}/stats\` route: aggregate data with Prisma \`groupBy\` and \`_count\``,
    );
    api.push(
      `Implement date-range filtering: accept \`from\` and \`to\` query params (ISO 8601)`,
    );
    api.push(
      `Add pagination: \`cursor\`-based with \`take\` limit (default 20, max 100)`,
    );
    api.push(
      `Create \`GET /api/${slug}/chart-data\` route: return time-series data grouped by day/week/month`,
    );
    api.push(
      `Cache response with \`unstable_cache\` (60s TTL) for dashboard metrics`,
    );
  } else if (
    lower.includes("crud") ||
    lower.includes("list") ||
    lower.includes("table")
  ) {
    api.push(
      `Create \`GET /api/${slug}\` route: list with pagination, search, and sort params`,
    );
    api.push(
      `Create \`POST /api/${slug}\` route: validate DTO with class-validator, return 201 + created entity`,
    );
    api.push(
      `Create \`PATCH /api/${slug}/[id]\` route: partial update, return 404 if not found`,
    );
    api.push(
      `Create \`DELETE /api/${slug}/[id]\` route: soft-delete if model has \`deletedAt\`, hard-delete otherwise`,
    );
    api.push(
      `Add ownership check: verify \`session.userId === entity.userId\` before mutate operations`,
    );
  } else if (
    lower.includes("search") ||
    lower.includes("filter")
  ) {
    api.push(
      `Create \`GET /api/${slug}/search\` route: accept \`q\` param, use Prisma \`contains\` + \`mode: 'insensitive'\``,
    );
    api.push(
      `Implement multi-field search: query across name, description, and tags columns`,
    );
    api.push(
      `Add debounce on frontend search input (300ms) to avoid excessive API calls`,
    );
    api.push(
      `Return faceted results: include \`total\`, \`facets\` (category counts) in response`,
    );
  } else if (
    lower.includes("upload") ||
    lower.includes("file") ||
    lower.includes("image")
  ) {
    api.push(
      `Create \`POST /api/${slug}/upload\` route: accept multipart/form-data, validate file type and size (max 5MB)`,
    );
    api.push(
      `Store file via S3-compatible storage or local \`public/uploads/\` with UUID filename`,
    );
    api.push(
      `Create \`DELETE /api/${slug}/[id]/file\` route: remove file from storage and DB reference`,
    );
    api.push(
      `Generate signed URL for private files with 1-hour expiry`,
    );
  } else {
    api.push(
      `Create \`GET /api/${slug}\` route: return list with cursor-based pagination`,
    );
    api.push(
      `Create \`POST /api/${slug}\` route: validate DTO, return 201`,
    );
    api.push(
      `Create \`GET /api/${slug}/[id]\` route: return single entity or 404`,
    );
    api.push(
      `Add ownership/authorization check on all mutate endpoints`,
    );
  }

  // ── UI & Component (frontend) or Controller & NestJS Architecture (backend-only) ──
  const ui: string[] = [];
  const controller: string[] = [];

  if (isBackendOnly) {
    // Task 2: Backend-specific NestJS architecture items
    controller.push(
      `Create \`${slug}.module.ts\` — register ${entity.modelName || slug}Module in AppModule`,
    );
    controller.push(
      `Create \`${slug}.service.ts\` — inject PrismaClient, implement CRUD methods for \`${entity.modelName}\``,
    );
    controller.push(
      `Create \`${slug}.controller.ts\` — define REST endpoints: @Get, @Post, @Patch, @Delete with @UseGuards`,
    );
    controller.push(
      `Create DTOs: \`create-${slug}.dto.ts\` and \`update-${slug}.dto.ts\` with class-validator decorators`,
    );
    controller.push(
      `Add \`JwtAuthGuard\` on all routes; add \`RolesGuard\` for admin-only endpoints`,
    );
    controller.push(
      `Create \`${slug}.spec.ts\` — unit tests for service with mocked PrismaClient`,
    );
  }

  if (hasFrontend) {
    if (
      lower.includes("form") ||
      lower.includes("create") ||
      lower.includes("edit") ||
      lower.includes("register")
    ) {
      ui.push(
        `Create \`${slug}-form.tsx\` using \`react-hook-form\` + \`zodResolver\` for validation`,
      );
      ui.push(
        `Use shadcn \`<Form>\`, \`<FormField>\`, \`<FormItem>\`, \`<FormLabel>\`, \`<FormControl>\` components`,
      );
      ui.push(
        `Add shadcn \`<Input>\`, \`<Textarea>\`, \`<Select>\` based on field types`,
      );
      ui.push(
        `Implement optimistic UI: call \`mutate()\` from \`swr\` or \`react-query\` before server confirms`,
      );
      ui.push(
        `Show \`<sonner>\` toast on success/error with descriptive message`,
      );
    } else if (
      lower.includes("table") ||
      lower.includes("list") ||
      lower.includes("grid")
    ) {
      ui.push(
        `Create \`${slug}-table.tsx\` using \`@tanstack/react-table\` with column definitions`,
      );
      ui.push(
        `Add shadcn \`<Table>\`, \`<TableHeader>\`, \`<TableRow>\`, \`<TableCell>\` components`,
      );
      ui.push(
        `Implement column sorting, pagination with shadcn \`<Pagination>\`, and row selection`,
      );
      ui.push(
        `Add empty state with shadcn \`<EmptyState>\` illustration when no data`,
      );
    } else if (
      lower.includes("dashboard") ||
      lower.includes("analytic") ||
      lower.includes("chart")
    ) {
      ui.push(
        `Create \`${slug}-stats.tsx\` with \`<StatsCard>\` component using shadcn \`<Card>\`, \`<CardContent>\``,
      );
      ui.push(
        `Add recharts \`<BarChart>\` or \`<LineChart>\` for time-series data visualization`,
      );
      ui.push(
        `Implement date range picker with shadcn \`<DateRangePicker>\` component`,
      );
      ui.push(
        `Add loading skeleton with shadcn \`<Skeleton>\` during data fetch`,
      );
    } else {
      ui.push(
        `Create \`${slug}/page.tsx\` as Server Component, fetch data in \`async\` component`,
      );
      ui.push(
        `Create \`${slug}-card.tsx\` as Client Component with \`"use client"\` directive`,
      );
      ui.push(
        `Use shadcn \`<Card>\`, \`<CardHeader>\`, \`<CardContent>\`, \`<CardFooter>\` layout`,
      );
      ui.push(
        `Add shadcn \`<Badge>\` for status indicators and \`<Avatar>\` for user references`,
      );
    }

    ui.push(
      `Connect to API via \`fetch\` wrapper in \`src/lib/api.ts\` with proper error handling`,
    );
    ui.push(
      `Add \`loading.tsx\` and \`error.tsx\` route boundary files for Next.js App Router`,
    );
  }

  // ── Edge Cases (from Q&A patterns) ──
  const edgeCases: string[] = [];
  edgeCases.push(
    `Handle 401 unauthorized: redirect to \`/auth/signin\` with \`callbackUrl\` param`,
  );
  edgeCases.push(
    `Handle 429 rate limit: show retry-after message, disable submit button`,
  );
  edgeCases.push(
    `Handle network errors: show toast with \`<AlertCircle>\` icon, allow manual retry`,
  );
  edgeCases.push(
    `Validate all user input at API boundary: never trust client-side validation alone`,
  );

  if (
    lower.includes("soft-delete") ||
    lower.includes("trash") ||
    lower.includes("archive")
  ) {
    edgeCases.push(
      `Implement 30-day retention: cron job via \`node-cron\` hard-deletes records past \`deletedAt + 30d\``,
    );
    edgeCases.push(
      `Add "Undo" action within 5 minutes of soft-delete: show reversible toast notification`,
    );
  }

  if (
    lower.includes("notification") ||
    lower.includes("alert") ||
    lower.includes("email")
  ) {
    edgeCases.push(
      `Implement 24-hour batching window: group notifications sent within 24h into single email digest`,
    );
    edgeCases.push(
      `Add \`<NotificationPreferences>\` toggle: user can opt-out per notification type`,
    );
  }

  if (
    lower.includes("payment") ||
    lower.includes("billing") ||
    lower.includes("subscription")
  ) {
    edgeCases.push(
      `Handle webhook idempotency: check \`stripe-event-id\` before processing to prevent duplicate charges`,
    );
    edgeCases.push(
      `Implement grace period: allow 3-day window after subscription expiry before revoking access`,
    );
  }

  return { database, api, ui, controller, edgeCases };
}

function inferAcceptance(
  label: string,
  files: string[],
  techStack: TechStackItem[],
): string[] {
  const criteria: string[] = [];
  const lower = label.toLowerCase();
  const hasFrontend = techStack.some((t) => t.category === "frontend");

  if (
    lower.includes("api") ||
    lower.includes("route") ||
    lower.includes("endpoint")
  ) {
    criteria.push(
      "API returns 200/201 for valid requests, 400 for bad input, 404 for missing resources, 500 for unexpected errors",
    );
    criteria.push(
      "Request body validated with class-validator decorators: reject missing required fields, wrong types, empty strings",
    );
    criteria.push(
      "Response follows consistent envelope: `{ data, error, meta }` shape",
    );
  }

  if (lower.includes("auth") || lower.includes("login")) {
    criteria.push(
      "Unauthenticated API calls return 401 with `{ error: 'Unauthorized' }`",
    );
    criteria.push(
      "Session cookie is httpOnly, secure, sameSite=Lax, maxAge=30d",
    );
    criteria.push(
      "Password hashing uses bcrypt with 12 salt rounds; plain-text passwords never stored",
    );
    criteria.push(
      "Rate limit: >5 failed login attempts within 15min locks account for 15min",
    );
  }

  if (hasFrontend && !lower.includes("api")) {
    criteria.push(
      "Component renders without hydration mismatch errors in browser console",
    );
    criteria.push(
      "Form fields show inline validation errors on blur, not just on submit",
    );
    criteria.push(
      "Loading state shown via \`<Skeleton>\` or \`<Spinner>\` during async operations",
    );
    criteria.push(
      "All interactive elements are keyboard-navigable and have proper \`aria-label\` attributes",
    );
  }

  if (
    lower.includes("table") ||
    lower.includes("list") ||
    lower.includes("grid")
  ) {
    criteria.push(
      "Pagination shows correct total count and handles edge cases: empty list, single item, last page",
    );
    criteria.push(
      "Sort indicators update correctly; URL query params reflect current sort/filter state",
    );
  }

  if (files.some((f) => f.includes("prisma") || f.includes("drizzle"))) {
    criteria.push(
      "Schema migration runs cleanly on fresh DB: \`npx prisma migrate dev\` exits 0",
    );
    criteria.push(
      "All model relations resolve without N+1 queries: use \`include\` or \`select\` appropriately",
    );
  }

  criteria.push("All tests pass: `pnpm test` exits 0 with 0 failures");

  return criteria;
}

// ─── Main generator ─────────────────────────────────────────────────

export function generateTASKS(input: TASKSInput): string {
  const { title, techStack, nodeTree } = input;
  const lines: string[] = [];

  lines.push(`# Tasks: ${title}`, "");
  lines.push("> Auto-generated by MonoArchitect", "");

  // --- Feature tasks from node tree ---
  if (nodeTree) {
    const features = nodeTree.nodes.filter((n) => {
      if (n.type !== "feature" && n.type !== "root") return false;
      const label = ((n.data?.label as string) ?? "").toLowerCase();
      // Skip infra-deploy nodes masquerading as features
      return !INFRA_KEYWORDS.some((kw) => label.includes(kw));
    });

    lines.push("## Feature Tasks", "");
    let featureIdx = 1;

    const hasFrontend = techStack.some((t) => t.category === "frontend");
    const hasBackend = techStack.some(
      (t) => t.category === "backend" || t.category === "orm",
    );
    const isBackendOnly = hasBackend && !hasFrontend;

    for (const n of features) {
      const label = (n.data?.label as string) ?? n.id;
      const files =
        n.type === "feature" ? inferFeatureFiles(label, techStack) : ["src/"];
      const sections = inferTaskSections(label, n.type, techStack);
      const acceptance = inferAcceptance(label, files, techStack);

      lines.push(`### Task ${featureIdx}: ${label}`, "");
      lines.push(`- [ ] **${label}**`);
      lines.push(
        `  - **Target Files:** ${files.map((f) => `\`${f}\``).join(", ")}`,
      );
      lines.push("");

      lines.push("  **Database & DTO:**");
      for (const item of sections.database) {
        lines.push(`  - [ ] ${item}`);
      }
      lines.push("");

      lines.push("  **Business Logic & API:**");
      for (const item of sections.api) {
        lines.push(`  - [ ] ${item}`);
      }
      lines.push("");

      if (isBackendOnly && sections.controller.length > 0) {
        lines.push("  **Controller & NestJS Architecture:**");
        for (const item of sections.controller) {
          lines.push(`  - [ ] ${item}`);
        }
        lines.push("");
      }

      if (sections.ui.length > 0) {
        lines.push("  **UI & Component:**");
        for (const item of sections.ui) {
          lines.push(`  - [ ] ${item}`);
        }
        lines.push("");
      }

      if (sections.edgeCases.length > 0) {
        lines.push("  **Edge Cases & Constraints:**");
        for (const item of sections.edgeCases) {
          lines.push(`  - [ ] ${item}`);
        }
        lines.push("");
      }

      lines.push("  **Acceptance Criteria:**");
      for (const c of acceptance) {
        lines.push(`  - [ ] ${c}`);
      }
      lines.push("");
      featureIdx++;
    }
  }

  // --- Infrastructure tasks from tech stack ---
  if (techStack.length) {
    lines.push("## Infrastructure Tasks", "");
    let infraIdx = 1;

    for (const t of techStack) {
      const targetFiles = inferInfraFiles(t.category, t.name);

      lines.push(`### Infra ${infraIdx}: ${t.name} (${t.category})`, "");
      lines.push(`- [ ] **Set up ${t.name}**`);
      lines.push(
        `  - **Target Files:** ${targetFiles.map((f) => `\`${f}\``).join(", ")}`,
      );
      lines.push("");
      lines.push(`  - [ ] Install and configure ${t.name}`);
      lines.push(`  - [ ] Add ${t.name} setup to project README`);
      lines.push(`  - [ ] Write tests for ${t.name} integration`);
      lines.push("");
      lines.push("  **Acceptance Criteria:**");
      lines.push(`  - [ ] ${t.name} is installed and configured`);
      lines.push(`  - [ ] Existing tests still pass`);
      lines.push(`  - [ ] New integration tests pass`);
      lines.push("");
      infraIdx++;
    }
  }

  return lines.join("\n");
}
