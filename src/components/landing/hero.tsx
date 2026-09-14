"use client";

import { signIn, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowRight, Layers, Sparkles } from "lucide-react";
import Link from "next/link";

/* ── Animated Mindmap Preview ─────────────────────────────────────── */

const NODES = [
  { id: "root", x: 0, y: 0, label: "App", size: "lg" },
  { id: "auth", x: -120, y: 60, label: "Auth", size: "sm" },
  { id: "api", x: 0, y: 70, label: "API", size: "sm" },
  { id: "db", x: 120, y: 60, label: "DB", size: "sm" },
  { id: "ui", x: -60, y: 130, label: "UI", size: "xs" },
  { id: "cache", x: 60, y: 130, label: "Cache", size: "xs" },
] as const;

const EDGES: [string, string][] = [
  ["root", "auth"],
  ["root", "api"],
  ["root", "db"],
  ["auth", "ui"],
  ["api", "cache"],
];

function MindmapPreview() {
  return (
    <div className="relative mx-auto h-[220px] w-[280px] sm:h-[260px] sm:w-[320px]">
      {/* edges */}
      <svg className="absolute inset-0 h-full w-full" aria-hidden>
        {EDGES.map(([from, to]) => {
          const a = NODES.find((n) => n.id === from)!;
          const b = NODES.find((n) => n.id === to)!;
          return (
            <motion.line
              key={`${from}-${to}`}
              x1={140 + a.x}
              y1={30 + a.y}
              x2={140 + b.x}
              y2={30 + b.y}
              stroke="url(#edgeGrad)"
              strokeWidth={1.5}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          );
        })}
        <defs>
          <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>

      {/* nodes */}
      {NODES.map((n, i) => {
        const sizeMap = {
          lg: "h-10 w-10 text-xs",
          sm: "h-8 w-8 text-[10px]",
          xs: "h-6 w-6 text-[9px]",
        };
        return (
          <motion.div
            key={n.id}
            className={`absolute flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 backdrop-blur-sm ${sizeMap[n.size]}`}
            style={{
              left: `calc(50% + ${n.x}px - ${n.size === "lg" ? 20 : n.size === "sm" ? 16 : 12}px)`,
              top: `${30 + n.y}px`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", delay: 0.2 + i * 0.1 }}
          >
            {n.label}
          </motion.div>
        );
      })}

      {/* pulse glow on root */}
      <motion.div
        className="absolute left-1/2 top-[30px] h-10 w-10 -translate-x-1/2 rounded-lg bg-indigo-500/20 blur-xl"
        animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0.15, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </div>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────── */

export function Hero() {
  const { data: session } = useSession();

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-20">
      {/* decorative glow orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-violet-500/10 blur-[120px]" />
      </div>

      {/* badge */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/60 backdrop-blur-sm"
      >
        <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
        AI-Powered Architecture Studio
      </motion.div>

      {/* heading */}
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-3xl text-center text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
      >
        <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          MonoArchitect
        </span>
        <br />
        <span className="text-white/90">Full-Stack Vibe Coding</span>
      </motion.h1>

      {/* tagline */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-5 max-w-xl text-center text-base text-white/50 sm:text-lg"
      >
        Transform your idea into a production-ready architecture with AI.
        <br className="hidden sm:block" />
        Visualize, refine, and export — all in one workspace.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
      >
        {session ? (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/40"
          >
            <Layers className="h-4 w-4" />
            Buka Dashboard
          </Link>
        ) : (
          <button
            onClick={() => signIn("github")}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/40"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Mulai Gratis dengan GitHub
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </motion.div>

      {/* animated mindmap preview */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-16 w-full max-w-md"
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <MindmapPreview />
        </div>
      </motion.div>

      {/* feature pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 flex flex-wrap justify-center gap-3"
      >
        {[
          "AI Q&A Engine",
          "React Flow Diagram",
          "PRD Generator",
          "One-Click Export",
        ].map((f) => (
          <span
            key={f}
            className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs text-white/50 backdrop-blur-sm"
          >
            {f}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
