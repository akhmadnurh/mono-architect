"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, ArrowRight, Calendar, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Project {
  id: string;
  title: string;
  scale: string;
  createdAt: string;
  status: string;
  currentStep: number;
}

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) return [];
  return res.json();
}

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white/90">Dashboard</h1>
          <p className="mt-1 text-sm text-white/40">
            Kelola proyek arsitektur Anda
          </p>
        </div>
        <Button render={<Link href="/studio/new" />}>
          <Plus className="mr-1.5 h-4 w-4" />
          Proyek Baru
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <Input
          placeholder="Cari proyek..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30"
        />
      </div>

      {/* Project Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20">
          <Layers className="mb-4 h-10 w-10 text-white/20" />
          <p className="text-sm text-white/40">
            {search
              ? "Tidak ada proyek yang cocok"
              : "Belum ada proyek. Mulai dari ide!"}
          </p>
          {!search && (
            <Button
              variant="outline"
              className="mt-4"
              render={<Link href="/studio/new" />}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Buat Proyek Pertama
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <Link key={project.id} href={`/studio/${project.id}`}>
              <Card className="group cursor-pointer border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-indigo-500/30 hover:bg-white/[0.07]">
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <ArrowRight className="h-4 w-4 shrink-0 text-white/20 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-400" />
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(project.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 font-mono text-xs">
                    {project.scale}
                  </span>
                  {project.status === "completed" && (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-400">
                      Selesai
                    </span>
                  )}
                  {project.status === "draft" && (
                    <span className="rounded-full bg-white/5 px-2 py-0.5">
                      Draft · Step {project.currentStep}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
