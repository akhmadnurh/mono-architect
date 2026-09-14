# Graph Report - mono-architect  (2026-09-14)

## Corpus Check
- 60 files · ~15,421 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 391 nodes · 570 edges · 49 communities (18 shown, 31 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d6ca75b2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- step-idea.tsx
- project.ts
- devDependencies
- compilerOptions
- components.json
- ai-schemas.ts
- step-techstack.tsx
- studio-client.tsx
- app/layout.tsx
- ai
- tabs.tsx
- badge.tsx
- auth.ts
- dependencies
- @base-ui/react
- canvas-confetti
- class-variance-authority
- cn
- @dagrejs/dagre
- eslint.config.mjs
- hero.tsx
- README.md
- AGENTS.md
- jszip
- lucide-react
- next
- next.config.ts
- @prisma/client
- react
- react-dom
- react-hook-form
- shadcn
- @tailwindcss/typography
- @tanstack/react-query
- tw-animate-css
- @xyflow/react
- zod
- zustand
- postcss.config.mjs
- @ai-sdk/openai-compatible
- @auth/prisma-adapter
- next-auth
- react-markdown
- { GET, POST }

## God Nodes (most connected - your core abstractions)
1. `useWizardStore` - 17 edges
2. `compilerOptions` - 16 edges
3. `Button()` - 14 edges
4. `TechStackItem` - 12 edges
5. `generateTASKS()` - 9 edges
6. `ExportModal()` - 8 edges
7. `ProjectNodeTree` - 8 edges
8. `Card()` - 7 edges
9. `generatePRD()` - 7 edges
10. `prisma` - 7 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `generateQuestions()`  [EXTRACTED]
  src/app/api/generate/questions/route.ts → src/lib/ai.ts
- `ExportModal()` --calls--> `useWizardStore`  [EXTRACTED]
  src/components/studio/export-modal.tsx → src/store/wizard.ts
- `FloatingStepper()` --calls--> `useWizardStore`  [EXTRACTED]
  src/components/studio/floating-stepper.tsx → src/store/wizard.ts
- `AGENTSInput` --references--> `TechStackItem`  [EXTRACTED]
  src/lib/generators/agents.ts → src/types/project.ts
- `Wizard()` --calls--> `useWizardStore`  [EXTRACTED]
  src/components/features/wizard/index.tsx → src/store/wizard.ts

## Import Cycles
- None detected.

## Communities (49 total, 31 thin omitted)

### Community 0 - "step-idea.tsx"
Cohesion: 0.10
Nodes (27): DashboardPage(), fetchProjects(), Project, STEPS, Wizard(), StepArchitecture(), StepExport(), IdeaForm (+19 more)

### Community 1 - "project.ts"
Cohesion: 0.07
Nodes (36): model, provider, handleDownload(), ExportModal(), ExportModalProps, Dialog(), DialogContent(), DialogHeader() (+28 more)

### Community 2 - "devDependencies"
Cohesion: 0.06
Nodes (32): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss (+24 more)

### Community 3 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 4 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 5 - "ai-schemas.ts"
Cohesion: 0.13
Nodes (19): POST(), chat(), extractJson(), generateNodeTree(), generateQuestions(), EdgeSchema, EntitySchema, NodeSchema (+11 more)

### Community 6 - "step-techstack.tsx"
Cohesion: 0.16
Nodes (9): CATEGORIES, Selections, SelectContent(), SelectItem(), SelectTrigger(), SelectValue(), TECH_STACK_PRESETS, TechStackCategory (+1 more)

### Community 8 - "studio-client.tsx"
Cohesion: 0.14
Nodes (13): DocTab, PrdEditor(), PrdEditorProps, TABS, AiRefinerDrawer(), AiRefinerDrawerProps, Message, FloatingStepper() (+5 more)

### Community 10 - "app/layout.tsx"
Cohesion: 0.25
Nodes (7): geistMono, geistSans, metadata, getQueryClient(), makeQueryClient(), QueryProvider(), SessionProvider()

### Community 14 - "auth.ts"
Cohesion: 0.13
Nodes (9): RefineRequest, RouteContext, PageProps, Sidebar(), SidebarProps, StudioClient(), { handlers, auth, signIn, signOut }, globalForPrisma (+1 more)

### Community 15 - "dependencies"
Cohesion: 0.22
Nodes (9): @ai-sdk/react, file-saver, framer-motion, @hookform/resolvers, dependencies, @ai-sdk/react, file-saver, framer-motion (+1 more)

### Community 22 - "hero.tsx"
Cohesion: 0.33
Nodes (3): EDGES, Hero(), NODES

### Community 23 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **147 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+142 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`, `ai`, `@base-ui/react`, `canvas-confetti`, `class-variance-authority`, `cn`, `@dagrejs/dagre`, `jszip`, `lucide-react`, `next`, `@prisma/client`, `react`, `react-dom`, `react-hook-form`, `shadcn`, `@tailwindcss/typography`, `@tanstack/react-query`, `tw-animate-css`, `@xyflow/react`, `zod`, `zustand`, `@ai-sdk/openai-compatible`, `@auth/prisma-adapter`, `next-auth`, `react-markdown`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `Button()` connect `step-idea.tsx` to `project.ts`, `step-techstack.tsx`, `studio-client.tsx`, `sheet.tsx`, `auth.ts`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _147 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `step-idea.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10465116279069768 - nodes in this community are weakly interconnected._
- **Should `project.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06848357791754019 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._