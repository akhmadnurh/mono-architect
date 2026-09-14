"use client";

import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import confetti from "canvas-confetti";
import {
  Download,
  Copy,
  Check,
  FileText,
  ClipboardList,
  Bot,
  ClipboardCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/store/wizard";
import { generatePRD } from "@/lib/generators/prd";
import { generateTASKS } from "@/lib/generators/tasks";
import { generateAGENTS } from "@/lib/generators/agents";
import { isSplitStack, filterBySide } from "@/lib/generators/split-stack";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportModal({ open, onOpenChange }: ExportModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const store = useWizardStore();

  const prd = generatePRD(store);
  const tasks = generateTASKS(store);
  const agents = generateAGENTS(store);

  const files: Record<
    string,
    { icon: typeof FileText; label: string; desc: string; content: string }
  > = {
    "PRD.md": {
      icon: FileText,
      label: "PRD.md",
      desc: "Spesifikasi proyek",
      content: prd,
    },
    "TASKS.md": {
      icon: ClipboardList,
      label: "TASKS.md",
      desc: "Checklist TDD",
      content: tasks,
    },
    "AGENTS.md": {
      icon: Bot,
      label: "AGENTS.md",
      desc: "Instruksi agent",
      content: agents,
    },
  };

  async function handleCopyFile(label: string) {
    const f = files[label];
    if (!f) return;
    await navigator.clipboard.writeText(f.content);
    setCopiedFile(label);
    setTimeout(() => setCopiedFile(null), 2000);
  }

  async function handleCopyPrompt() {
    const prompt = [
      "# Project Context",
      "",
      "## PRD",
      prd,
      "",
      "---",
      "",
      "## TASKS",
      tasks,
      "",
      "---",
      "",
      "## AGENTS",
      agents,
      "",
      "---",
      "",
      "Use the above PRD, TASKS, and AGENTS as context for this project.",
      "Follow the TASKS checklist. Respect AGENTS.md conventions.",
      "Implement features described in the PRD.",
    ].join("\n");

    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownloadZip() {
    setDownloading(true);
    try {
      const zip = new JSZip();
      zip.file("PRD.md", prd);

      const split = isSplitStack(store.techStack);
      if (split) {
        const feStack = filterBySide(store.techStack, "frontend");
        const beStack = filterBySide(store.techStack, "backend");
        zip.file(
          "frontend/TASKS.md",
          generateTASKS({ ...store, techStack: feStack }),
        );
        zip.file(
          "frontend/AGENTS.md",
          generateAGENTS({ ...store, techStack: feStack }),
        );
        zip.file(
          "backend/TASKS.md",
          generateTASKS({ ...store, techStack: beStack }),
        );
        zip.file(
          "backend/AGENTS.md",
          generateAGENTS({ ...store, techStack: beStack }),
        );
      } else {
        zip.file("TASKS.md", tasks);
        zip.file("AGENTS.md", agents);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const slug = store.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      saveAs(blob, `${slug || "project"}-bundle.zip`);

      confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } });
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white/90">Export Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* File preview cards */}
          <div className="grid grid-cols-3 gap-2">
            {Object.values(files).map((f) => (
              <button
                key={f.label}
                onClick={() => handleCopyFile(f.label)}
                className="flex flex-col items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:border-indigo-500/40 hover:bg-white/10 cursor-pointer"
              >
                {copiedFile === f.label ? (
                  <ClipboardCheck className="h-5 w-5 text-green-400" />
                ) : (
                  <f.icon className="h-5 w-5 text-indigo-400" />
                )}
                <span className="text-xs font-medium text-white/80">
                  {f.label}
                </span>
                <span className="text-[10px] text-white/40">
                  {copiedFile === f.label ? "Tersalin!" : f.desc}
                </span>
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handleCopyPrompt}
              className="w-full gap-2 bg-indigo-500 hover:bg-indigo-400"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Tersalin!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Vibe Coding Prompt
                </>
              )}
            </Button>
            <p className="text-[10px] text-center text-white/30 -mt-1">
              Salin Gabungan Semua Berkas (System Prompt)
            </p>

            <Button
              variant="outline"
              onClick={handleDownloadZip}
              disabled={downloading}
              className="w-full gap-2 border-white/10"
            >
              <Download className="h-4 w-4" />
              {downloading ? "Membuat bundle…" : "Download ZIP"}
            </Button>
          </div>

          <p className="text-[11px] text-white/30 text-center">
            Prompt gabungan siap pakai untuk Cursor, Claude Code, atau GitHub
            Copilot.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
