# Graph Report - mono-architect  (2026-09-14)

## Corpus Check
- Corpus is ~10,736 words - fits in a single context window. You may not need a graph.

## Summary
- 323 nodes · 452 edges · 42 communities (13 shown, 29 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Wizard UI & Steps
- API Routes & Generators
- Dev Dependencies Config
- TypeScript Config
- Shadcn UI Config
- AI Generation Pipeline
- Tech Stack Selection
- App Layout & Providers
- AI SDK Integration
- Tabs Component
- Badge Component
- Prisma Client
- Package 15
- Package 16
- Package 17
- Package 18
- Package 19
- Package 20
- Package 21
- Package 22
- Package 23
- Package 24
- Package 25
- Package 26
- Package 27
- Package 28
- Package 29
- Package 30
- Package 31
- Package 32
- Package 33
- Package 34
- Package 35
- Package 36
- Package 37
- Package 38
- Package 39
- Package 40

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `useWizardStore` - 13 edges
3. `TechStackItem` - 12 edges
4. `Button()` - 9 edges
5. `ProjectNodeTree` - 8 edges
6. `generateTASKS()` - 7 edges
7. `include` - 7 edges
8. `tailwind` - 6 edges
9. `aliases` - 6 edges
10. `scripts` - 6 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `generateQuestions()`  [EXTRACTED]
  src/app/api/generate/questions/route.ts → src/lib/ai.ts
- `AGENTSInput` --references--> `TechStackItem`  [EXTRACTED]
  src/lib/generators/agents.ts → src/types/project.ts
- `Wizard()` --calls--> `useWizardStore`  [EXTRACTED]
  src/components/features/wizard/index.tsx → src/store/wizard.ts
- `StepArchitecture()` --calls--> `layoutGraph()`  [EXTRACTED]
  src/components/features/wizard/step-architecture.tsx → src/lib/dagre-layout.ts
- `StepArchitecture()` --calls--> `useWizardStore`  [EXTRACTED]
  src/components/features/wizard/step-architecture.tsx → src/store/wizard.ts

## Import Cycles
- None detected.

## Communities (42 total, 29 thin omitted)

### Community 0 - "Wizard UI & Steps"
Cohesion: 0.10
Nodes (25): STEPS, Wizard(), StepArchitecture(), StepExport(), IdeaForm, ideaSchema, SCALE_LABELS, StepIdea() (+17 more)

### Community 1 - "API Routes & Generators"
Cohesion: 0.10
Nodes (30): model, provider, handleDownload(), AGENTSInput, generateAGENTS(), slugify(), formatAnswer(), generatePRD() (+22 more)

### Community 2 - "Dev Dependencies Config"
Cohesion: 0.06
Nodes (32): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss (+24 more)

### Community 3 - "TypeScript Config"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 4 - "Shadcn UI Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 5 - "AI Generation Pipeline"
Cohesion: 0.13
Nodes (19): POST(), chat(), extractJson(), generateNodeTree(), generateQuestions(), EdgeSchema, EntitySchema, NodeSchema (+11 more)

### Community 6 - "Tech Stack Selection"
Cohesion: 0.16
Nodes (9): CATEGORIES, Selections, SelectContent(), SelectItem(), SelectTrigger(), SelectValue(), TECH_STACK_PRESETS, TechStackCategory (+1 more)

### Community 10 - "App Layout & Providers"
Cohesion: 0.31
Nodes (6): geistMono, geistSans, metadata, getQueryClient(), makeQueryClient(), QueryProvider()

### Community 11 - "AI SDK Integration"
Cohesion: 0.29
Nodes (7): ai, @ai-sdk/openai-compatible, dependencies, ai, @ai-sdk/openai-compatible, react-markdown, react-markdown

## Knowledge Gaps
- **124 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+119 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `AI SDK Integration` to `Dev Dependencies Config`, `Package 15`, `Package 16`, `Package 17`, `Package 18`, `Package 19`, `Package 20`, `Package 22`, `Package 23`, `Package 24`, `Package 25`, `Package 26`, `Package 27`, `Package 29`, `Package 30`, `Package 31`, `Package 32`, `Package 33`, `Package 34`, `Package 35`, `Package 36`, `Package 37`, `Package 38`, `Package 39`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `Button()` connect `Wizard UI & Steps` to `Dialog Component`, `Sheet Component`, `Tech Stack Selection`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _124 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Wizard UI & Steps` be split into smaller, more focused modules?**
  _Cohesion score 0.10299003322259136 - nodes in this community are weakly interconnected._
- **Should `API Routes & Generators` be split into smaller, more focused modules?**
  _Cohesion score 0.09815078236130868 - nodes in this community are weakly interconnected._
- **Should `Dev Dependencies Config` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._