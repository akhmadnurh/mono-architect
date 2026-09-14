"use client";

import Link from "next/link";
import {
  ChevronRight,
  Save,
  Download,
  Map,
  FileText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudioHeaderProps {
  projectTitle: string;
  projectId: string;
  view: "mindmap" | "preview";
  onViewChange: (view: "mindmap" | "preview") => void;
  onExport?: () => void;
  onToggleRefiner?: () => void;
  autoSaving?: boolean;
}

export function StudioHeader({
  projectTitle,
  projectId,
  view,
  onViewChange,
  onExport,
  onToggleRefiner,
  autoSaving,
}: StudioHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 backdrop-blur-md">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-white/50">
        <Link
          href="/dashboard"
          className="transition-colors hover:text-white/80"
        >
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate font-medium text-white/80 max-w-[200px]">
          {projectTitle}
        </span>
      </div>

      {/* Center: View switcher */}
      <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-0.5">
        <button
          onClick={() => onViewChange("mindmap")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            view === "mindmap"
              ? "bg-white/10 text-white"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          <Map className="h-3.5 w-3.5" />
          Mindmap
        </button>
        <button
          onClick={() => onViewChange("preview")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            view === "preview"
              ? "bg-white/10 text-white"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          Preview
        </button>
      </div>

      {/* Right: auto-save + AI Refiner + export */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-[11px] text-white/30">
          <Save className="h-3 w-3" />
          {autoSaving ? "Menyimpan..." : "Tersimpan"}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-300 hover:bg-indigo-500/20"
          onClick={onToggleRefiner}
        >
          <Sparkles className="h-3 w-3" />
          AI Refiner
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 border-white/10 bg-white/5 text-xs"
          onClick={onExport}
        >
          <Download className="h-3 w-3" />
          Export
        </Button>
      </div>
    </header>
  );
}
