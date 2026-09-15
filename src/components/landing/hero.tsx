"use client";

import { Fragment } from "react";
import { signIn, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Layers,
  Sparkles,
  ArrowRight,
  Zap,
  BrainCircuit,
  GitBranch,
  Network,
  Rocket,
  Lightbulb,
  Bot,
  Boxes,
  Database,
  Server,
  Container,
  Palette,
} from "lucide-react";
import Link from "next/link";

/* ── Navbar ────────────────────────────────────────────────────────── */

function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-white/5 bg-[#0d1117]/60 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center px-6 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            <span className="text-sm font-bold text-white/90 tracking-tight">
              MonoArchitect
            </span>
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
              v1.0
            </span>
          </Link>
        </div>
        <div className="ml-10 hidden items-center gap-8 md:flex">
          <a href="#fitur" className="text-sm text-white/50 transition-colors hover:text-white/80">
            Fitur
          </a>
          <a href="#workflow" className="text-sm text-white/50 transition-colors hover:text-white/80">
            Workflow
          </a>
          <a href="#stack" className="text-sm text-white/50 transition-colors hover:text-white/80">
            Stack
          </a>
        </div>
        <div className="ml-auto">
          {session ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-400"
            >
              Buka Dashboard
            </Link>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-400"
            >
              Buka Dashboard
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ── Hero ──────────────────────────────────────────────────────────── */

function HeroSection() {
  const { data: session } = useSession();

  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-20">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/8 blur-[140px]" />
        <div className="absolute top-1/2 left-1/4 h-[300px] w-[300px] rounded-full bg-pink-500/5 blur-[120px]" />
        {/* Centered ambient purple glow behind headline */}
        <div className="absolute left-1/2 top-[35%] h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/15 blur-[120px]" />
      </div>

      {/* Badge pill */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-medium text-purple-300 backdrop-blur-sm"
      >
        <Sparkles className="h-3.5 w-3.5" />
        AI-Powered Architecture Studio for Developers
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-4xl text-center text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
      >
        <span className="bg-gradient-to-r from-white via-slate-100 to-purple-400 bg-clip-text text-transparent">
          Transform Ideas into
        </span>
        <br />
        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
          Production-Ready Architecture
        </span>
      </motion.h1>

      {/* Sub-headline */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-6 max-w-2xl text-center text-base leading-relaxed text-slate-400 sm:text-lg"
      >
        Dari PRD, Mindmap, Kanban TASKS.md, hingga AGENTS.md — seluruh alur
        Vibe Coding dalam satu workspace AI yang terintegrasi.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-10"
      >
        {session ? (
          <Link
            href="/studio/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/40"
          >
            <Zap className="h-4 w-4" />
            Mulai Proyek Baru
          </Link>
        ) : (
          <button
            onClick={() => signIn("github")}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/40"
          >
            <Zap className="h-4 w-4" />
            Mulai Proyek Baru
          </button>
        )}
      </motion.div>
    </section>
  );
}

/* ── Studio Preview Card ───────────────────────────────────────────── */

function StudioPreview() {
  return (
    <section className="relative mx-auto w-full max-w-5xl px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative rounded-2xl border border-white/10 bg-slate-900/40 p-1 shadow-2xl backdrop-blur-xl"
      >
        {/* Glow border effect */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent" />

        <div className="relative overflow-hidden rounded-xl bg-slate-950/80">
          {/* Fake window chrome */}
          <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5">
            <div className="h-3 w-3 rounded-full bg-red-500/60" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
            <div className="h-3 w-3 rounded-full bg-green-500/60" />
            <span className="ml-2 text-[11px] font-medium text-white/30">
              MonoArchitect Studio
            </span>
          </div>

          {/* Fake content area */}
          <div className="flex h-[320px] sm:h-[380px]">
            {/* Left: PRD Preview */}
            <div className="flex-1 border-r border-white/5 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  PRD.md
                </span>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-3/4 rounded bg-white/10" />
                <div className="h-2.5 w-full rounded bg-white/5" />
                <div className="h-2.5 w-5/6 rounded bg-white/5" />
                <div className="h-2.5 w-2/3 rounded bg-white/5" />
                <div className="mt-3 h-2.5 w-full rounded bg-white/5" />
                <div className="h-2.5 w-4/5 rounded bg-white/5" />
                <div className="mt-3 flex gap-2">
                  <div className="h-5 w-16 rounded-full bg-indigo-500/20" />
                  <div className="h-5 w-20 rounded-full bg-purple-500/20" />
                </div>
              </div>
            </div>

            {/* Center: Mindmap nodes */}
            <div className="hidden flex-1 items-center justify-center p-4 sm:flex">
              <div className="relative h-full w-full">
                {/* Edges */}
                <svg className="absolute inset-0 h-full w-full" aria-hidden>
                  <line
                    x1="50%"
                    y1="30%"
                    x2="25%"
                    y2="55%"
                    stroke="#818cf8"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  <line
                    x1="50%"
                    y1="30%"
                    x2="75%"
                    y2="55%"
                    stroke="#a78bfa"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  <line
                    x1="50%"
                    y1="30%"
                    x2="50%"
                    y2="60%"
                    stroke="#c084fc"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  <line
                    x1="25%"
                    y1="55%"
                    x2="15%"
                    y2="80%"
                    stroke="#818cf8"
                    strokeWidth="1"
                    opacity="0.2"
                  />
                  <line
                    x1="75%"
                    y1="55%"
                    x2="85%"
                    y2="80%"
                    stroke="#a78bfa"
                    strokeWidth="1"
                    opacity="0.2"
                  />
                </svg>

                {/* Root node */}
                <div className="absolute left-1/2 top-[25%] flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-xs font-semibold text-indigo-300">
                  App
                </div>
                <div className="absolute left-[22%] top-[50%] flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[10px] text-white/60">
                  Auth
                </div>
                <div className="absolute left-1/2 top-[55%] flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[10px] text-white/60">
                  API
                </div>
                <div className="absolute left-[78%] top-[50%] flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[10px] text-white/60">
                  DB
                </div>
                <div className="absolute left-[12%] top-[75%] flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded border border-white/10 bg-white/5 text-[9px] text-white/40">
                  UI
                </div>
                <div className="absolute left-[88%] top-[75%] flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded border border-white/10 bg-white/5 text-[9px] text-white/40">
                  Cache
                </div>
              </div>
            </div>

            {/* Right: AI Refiner Panel */}
            <div className="hidden w-[180px] border-l border-white/5 p-3 lg:block">
              <div className="mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-purple-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-300">
                  AI Refiner
                </span>
              </div>
              <div className="space-y-2">
                <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                  <div className="h-2 w-full rounded bg-white/10" />
                  <div className="mt-1 h-2 w-3/4 rounded bg-white/5" />
                </div>
                <div className="ml-4 rounded-lg bg-indigo-500/15 p-2">
                  <div className="h-2 w-full rounded bg-indigo-300/20" />
                  <div className="mt-1 h-2 w-2/3 rounded bg-indigo-300/10" />
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                  <div className="h-2 w-5/6 rounded bg-white/10" />
                  <div className="mt-1 h-2 w-1/2 rounded bg-white/5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ── Feature Showcase (#fitur) ──────────────────────────────────────── */

function FeatureShowcase() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24" id="fitur">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12 text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Architecture Engine
        </h2>
        <p className="mt-3 text-base text-slate-400">
          Seluruh alur arsitektur dari ide hingga export dalam satu workspace.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Card 1: Context-Aware Q&A — Violet */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="group rounded-2xl border border-slate-800 bg-[#121723]/80 p-6 transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]"
        >
          <div className="mb-4 inline-flex rounded-lg border border-violet-500/30 bg-violet-500/10 p-2.5">
            <BrainCircuit className="h-5 w-5 text-violet-400" />
          </div>
          <h3 className="text-base font-semibold text-white/90">Context-Aware Q&A</h3>
          <p className="mb-4 text-xs text-slate-500">AI Refiner &middot; PRD Generator</p>
          {/* Visual: prompt bar */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <div className="h-2.5 w-3/4 rounded bg-white/10" />
            </div>
            <div className="mt-2 flex gap-2">
              <div className="h-2 w-1/3 rounded bg-violet-500/20" />
              <div className="h-2 w-1/4 rounded bg-purple-500/20" />
            </div>
          </div>
        </motion.div>

        {/* Card 2: Split-Stack Generator — Cyan */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="group rounded-2xl border border-slate-800 bg-[#121723]/80 p-6 transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]"
        >
          <div className="mb-4 inline-flex rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-2.5">
            <GitBranch className="h-5 w-5 text-cyan-400" />
          </div>
          <h3 className="text-base font-semibold text-white/90">Split-Stack Generator</h3>
          <p className="mb-4 text-xs text-slate-500">FE &amp; BE Task Separation</p>
          {/* Visual: tab badges */}
          <div className="flex gap-2">
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
              Frontend
            </span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              Backend
            </span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 rounded bg-white/5 px-2 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <div className="h-2 w-2/3 rounded bg-white/10" />
            </div>
            <div className="flex items-center gap-2 rounded bg-white/5 px-2 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <div className="h-2 w-1/2 rounded bg-white/10" />
            </div>
          </div>
        </motion.div>

        {/* Card 3: Mindmap Auto-Sync — Pink */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="group rounded-2xl border border-slate-800 bg-[#121723]/80 p-6 transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]"
        >
          <div className="mb-4 inline-flex rounded-lg border border-pink-500/30 bg-pink-500/10 p-2.5">
            <Network className="h-5 w-5 text-pink-400" />
          </div>
          <h3 className="text-base font-semibold text-white/90">Mindmap Auto-Sync</h3>
          <p className="mb-4 text-xs text-slate-500">Dagre Layout Graph</p>
          {/* Visual: mini node graph */}
          <div className="relative h-24 rounded-lg border border-white/10 bg-white/5">
            <svg className="absolute inset-0 h-full w-full" aria-hidden>
              <line x1="50%" y1="20%" x2="25%" y2="55%" stroke="#f472b6" strokeWidth="1" opacity="0.4" />
              <line x1="50%" y1="20%" x2="75%" y2="55%" stroke="#c084fc" strokeWidth="1" opacity="0.4" />
              <line x1="50%" y1="20%" x2="50%" y2="65%" stroke="#818cf8" strokeWidth="1" opacity="0.3" />
            </svg>
            <div className="absolute left-1/2 top-[15%] flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded border border-pink-500/30 bg-pink-500/10 text-[8px] font-semibold text-pink-300">
              PRD
            </div>
            <div className="absolute left-[20%] top-[50%] flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded border border-white/10 bg-white/5 text-[7px] text-white/50">
              Tasks
            </div>
            <div className="absolute left-1/2 top-[60%] flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded border border-white/10 bg-white/5 text-[7px] text-white/50">
              Agents
            </div>
            <div className="absolute left-[80%] top-[50%] flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded border border-white/10 bg-white/5 text-[7px] text-white/50">
              Tree
            </div>
          </div>
        </motion.div>

        {/* Card 4: Agent Export — Emerald */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="group rounded-2xl border border-slate-800 bg-[#121723]/80 p-6 transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]"
        >
          <div className="mb-4 inline-flex rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5">
            <Bot className="h-5 w-5 text-emerald-400" />
          </div>
          <h3 className="text-base font-semibold text-white/90">Agent Export</h3>
          <p className="mb-4 text-xs text-slate-500">Cursor &amp; Claude Code Ready</p>
          {/* Visual: code snippet box */}
          <div className="rounded-lg border border-white/10 bg-slate-950/80 p-3 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-400/60">AGENTS.md</span>
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] text-white/40">Copy</span>
            </div>
            <div className="mt-2 space-y-1">
              <div className="h-1.5 w-4/5 rounded bg-emerald-500/15" />
              <div className="h-1.5 w-3/5 rounded bg-white/5" />
              <div className="h-1.5 w-2/3 rounded bg-white/5" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Workflow Stepper (#workflow) ──────────────────────────────────── */

const WORKFLOW_STEPS = [
  {
    icon: Lightbulb,
    step: "01",
    title: "Input & Refine",
    desc: "Tulis ide atau prompt mentah. AI Refiner memperjelas scope & constraints.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: Network,
    step: "02",
    title: "Visual Architecture",
    desc: "Dagre node graph otomatis — PRD, TASKS, AGENTS, Node Tree tersinkronisasi.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Feed to Agent",
    desc: "Export ke format Cursor atau Claude Code. Siap dieksekusi langsung.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
];

function WorkflowStepper() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-24" id="workflow">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12 text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          How It Works
        </h2>
        <p className="mt-3 text-base text-slate-400">
          Tiga langkah dari ide mentah hingga agent siap eksekusi.
        </p>
      </motion.div>

      <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-3">
        {WORKFLOW_STEPS.map((s, i) => (
          <Fragment key={s.title}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="w-full flex-1"
            >
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-purple-500/40 hover:shadow-purple-500/10">
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${s.bg} border ${s.border}`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-purple-400">
                    Step {s.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white/90">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.desc}</p>
              </div>
            </motion.div>
            {i < WORKFLOW_STEPS.length - 1 && (
              <div className="hidden shrink-0 items-center justify-center px-2 md:flex">
                <ArrowRight className="h-7 w-7 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </section>
  );
}

/* ── Tech Stacks (#dokumentasi) ────────────────────────────────────── */

const TECH_STACKS = [
  { name: "Next.js", icon: Boxes, color: "text-white" },
  { name: "NestJS", icon: Server, color: "text-red-400" },
  { name: "Prisma", icon: Database, color: "text-indigo-400" },
  { name: "PostgreSQL", icon: Database, color: "text-blue-400" },
  { name: "Docker", icon: Container, color: "text-sky-400" },
  { name: "Tailwind CSS", icon: Palette, color: "text-cyan-400" },
];

function TechStacks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24" id="stack">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12 text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Supported Tech Stacks
        </h2>
        <p className="mt-3 text-base text-slate-400">
          Integrasi native dengan framework dan tools populer.
        </p>
      </motion.div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {TECH_STACKS.map((tech, i) => (
          <motion.div
            key={tech.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/40 px-6 py-4 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-purple-500/40 hover:shadow-purple-500/10"
          >
            <tech.icon className={`h-5 w-5 ${tech.color}`} />
            <span className="text-sm font-medium text-white/80">
              {tech.name}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ── Exported Hero (full landing page) ─────────────────────────────── */

export function Hero() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <StudioPreview />
      <FeatureShowcase />
      <WorkflowStepper />
      <TechStacks />
    </div>
  );
}
