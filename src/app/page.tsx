import Link from "next/link";
import { Hero } from "@/components/landing/hero";

function BottomCTABanner() {
  const artifacts = ["PRD.md", "TASKS.md", "AGENTS.md", "Mindmap"];
  return (
    <section className="my-16">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-purple-500/40 bg-gradient-to-b from-[#1a1435] to-[#120f24] p-10 text-center shadow-[0_0_50px_rgba(147,51,234,0.15)] md:p-14">
        {/* Background glow inside CTA */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[100px]" />

        {/* Floating artifact badges */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          {artifacts.map((a) => (
            <span
              key={a}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-purple-300/80 backdrop-blur-md"
            >
              {a}
            </span>
          ))}
        </div>

        <h2 className="mb-3 text-2xl font-extrabold text-slate-100 md:text-3xl">
          Siap Membangun Arsitektur Proyekmu?
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-sm text-slate-400 md:text-base">
          Transformasikan ide mentah jadi dokumen arsitektur siap eksekusi
          dalam hitungan menit.
        </p>
        <Link
          href="/studio/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition-all hover:opacity-90"
        >
          Mulai Proyek Baru
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-transparent text-slate-200">
      {/* Fixed SVG grid — locks to viewport, never scrolls away */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f293d25_1px,transparent_1px),linear-gradient(to_bottom,#1f293d25_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none z-0" />

      {/* 4 Ambient Glow Orbs */}
      {/* Hero Orb — top center, purple */}
      <div className="pointer-events-none absolute left-1/2 top-24 h-[350px] w-[600px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[140px] -z-10" />
      {/* Feature Grid Orb — middle left, cyan */}
      <div className="pointer-events-none absolute left-[5%] top-[40%] h-[350px] w-[500px] rounded-full bg-cyan-500/15 blur-[150px] -z-10" />
      {/* Workflow Orb — middle right, indigo */}
      <div className="pointer-events-none absolute right-[5%] top-[60%] h-[350px] w-[500px] rounded-full bg-indigo-600/15 blur-[150px] -z-10" />
      {/* CTA Banner Orb — bottom center, purple→pink→indigo gradient */}
      <div className="pointer-events-none absolute bottom-20 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600/20 via-pink-500/15 to-indigo-600/20 blur-[160px] -z-10" />

      <Hero />

      {/* CTA section — translucent to let grid show through */}
      <section className="relative z-10 my-16">
        <BottomCTABanner />
      </section>

      {/* Footer — transparent, merges with grid */}
      <footer className="relative z-10 bg-transparent py-8 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <span>© 2026 MonoArchitect. Built for Vibe Coding &amp; AI Agents.</span>
          <span>Next.js • NestJS • Prisma • Tailwind CSS</span>
        </div>
      </footer>
    </main>
  );
}
