# Graph Report - mono-architect  (2026-09-11)

## Corpus Check
- Corpus is ~7,196 words - fits in a single context window. You may not need a graph.

## Summary
- 297 nodes · 392 edges · 22 communities (13 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.65)
- Token cost: 850 input · 2,200 output

## Community Hubs (Navigation)
- Core Dependencies & UI Libraries
- AI Generation API Routes
- Wizard UI Components
- TypeScript Type Definitions
- Component System Config
- Dev Dependencies & Linting
- Documentation & Static Assets
- Package Configuration
- App Layout & Providers
- Tabs Component
- Monorepo Workspace Config
- Badge Component
- Database Client
- ESLint Configuration
- Next.js Configuration
- PostCSS Configuration
- File Icon
- Globe Icon

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `useWizardStore` - 11 edges
3. `ProjectScale` - 9 edges
4. `Button()` - 8 edges
5. `TechStackItem` - 7 edges
6. `include` - 7 edges
7. `tailwind` - 6 edges
8. `aliases` - 6 edges
9. `scripts` - 6 edges
10. `Next.js Project` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Next.js Logotype` --semantically_similar_to--> `Next.js Project`  [INFERRED] [semantically similar]
  public/next.svg → README.md
- `Vercel Triangle Logo` --semantically_similar_to--> `Vercel Deployment`  [INFERRED] [semantically similar]
  public/vercel.svg → README.md
- `Next.js Breaking Changes Warning` --conceptually_related_to--> `Next.js Project`  [INFERRED]
  AGENTS.md → README.md
- `POST()` --calls--> `generateNodeTree()`  [EXTRACTED]
  src/app/api/generate/node-tree/route.ts → src/lib/ai.ts
- `POST()` --calls--> `generateQuestions()`  [EXTRACTED]
  src/app/api/generate/questions/route.ts → src/lib/ai.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Next.js and Vercel Project Branding Assets** — public_next_svg, public_vercel_svg, readme_md_nextjs_project, readme_md_vercel_deployment [INFERRED 0.65]
- **Next.js AI Agent Documentation System** — agents_md, agents_md_nextjs_breaking_changes_warning, agents_md_agent_file_generation [EXTRACTED 1.00]
- **Project Scaffolding and Deployment Chain** — readme_md_create_next_app, readme_md_nextjs_project, readme_md_vercel_deployment, readme_md_geist_font [EXTRACTED 1.00]

## Communities (22 total, 9 thin omitted)

### Community 0 - "Core Dependencies & UI Libraries"
Cohesion: 0.04
Nodes (45): ai, @ai-sdk/openai-compatible, @base-ui/react, class-variance-authority, cn, file-saver, @hookform/resolvers, jszip (+37 more)

### Community 1 - "AI Generation API Routes"
Cohesion: 0.09
Nodes (31): POST(), POST(), POST(), chat(), extractJson(), generateNodeTree(), generateQuestions(), generateTechStack() (+23 more)

### Community 2 - "Wizard UI Components"
Cohesion: 0.12
Nodes (22): STEPS, Wizard(), NODE_COLORS, StepArchitecture(), toRFEdges(), toRFNodes(), IdeaForm, ideaSchema (+14 more)

### Community 3 - "TypeScript Type Definitions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 4 - "Component System Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 6 - "Dev Dependencies & Linting"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss (+13 more)

### Community 8 - "Documentation & Static Assets"
Cohesion: 0.25
Nodes (8): Agent File Auto-Generation Rule, Next.js Breaking Changes Warning, Next.js Logotype, Vercel Triangle Logo, create-next-app, Geist Font, Next.js Project, Vercel Deployment

### Community 9 - "Package Configuration"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, postinstall, start (+1 more)

### Community 11 - "App Layout & Providers"
Cohesion: 0.31
Nodes (6): geistMono, geistSans, metadata, getQueryClient(), makeQueryClient(), QueryProvider()

## Knowledge Gaps
- **111 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+106 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Core Dependencies & UI Libraries` to `Package Configuration`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Dependencies & Linting` to `Package Configuration`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `Button()` connect `Wizard UI Components` to `Dialog Component`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _111 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Core Dependencies & UI Libraries` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Should `AI Generation API Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.09446693657219973 - nodes in this community are weakly interconnected._
- **Should `Wizard UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.11875843454790823 - nodes in this community are weakly interconnected._