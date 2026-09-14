"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import confetti from "canvas-confetti";
import { Download, Loader2, ArrowLeft, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/store/wizard";
import { generatePRD } from "@/lib/generators/prd";
import { generateTASKS } from "@/lib/generators/tasks";
import { generateAGENTS } from "@/lib/generators/agents";
import { isSplitStack, filterBySide } from "@/lib/generators/split-stack";

export function StepExport() {
  const [busy, setBusy] = useState(false);
  const store = useWizardStore();
  const router = useRouter();

  async function handleDownload() {
    setBusy(true);
    try {
      const zip = new JSZip();
      const prd = generatePRD(store);
      const split = isSplitStack(store.techStack);

      // PRD.md always at root
      zip.file("PRD.md", prd);

      if (split) {
        // Split-stack: separate frontend/ and backend/ folders
        const feStack = filterBySide(store.techStack, "frontend");
        const beStack = filterBySide(store.techStack, "backend");

        const feTasks = generateTASKS({
          ...store,
          techStack: feStack,
        });
        const feAgents = generateAGENTS({
          ...store,
          techStack: feStack,
        });
        const beTasks = generateTASKS({
          ...store,
          techStack: beStack,
        });
        const beAgents = generateAGENTS({
          ...store,
          techStack: beStack,
        });

        zip.file("frontend/TASKS.md", feTasks);
        zip.file("frontend/AGENTS.md", feAgents);
        zip.file("backend/TASKS.md", beTasks);
        zip.file("backend/AGENTS.md", beAgents);
      } else {
        // Single-stack: standard flat structure
        zip.file("TASKS.md", generateTASKS(store));
        zip.file("AGENTS.md", generateAGENTS(store));
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const slug = store.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      saveAs(blob, `${slug || "project"}-bundle.zip`);

      // Mark project as completed in DB
      if (store.projectId) {
        await fetch(`/api/projects/${store.projectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed" }),
        });
      }

      confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Export Bundle</CardTitle>
        <p className="text-sm text-muted-foreground">
          Unduh bundle berisi <code>PRD.md</code>, <code>TASKS.md</code>, dan{" "}
          <code>AGENTS.md</code>.
          {isSplitStack(store.techStack) && (
            <span className="block mt-1 text-indigo-400">
              Split-stack terdeteksi — file akan dipisah ke folder{" "}
              <code>frontend/</code> dan <code>backend/</code>.
            </span>
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border p-4 text-sm text-muted-foreground space-y-1">
          <p>
            <strong className="text-foreground">PRD.md</strong> — Spesifikasi
            lengkap proyek
          </p>
          <p>
            <strong className="text-foreground">TASKS.md</strong> — Checklist
            TDD untuk AI Agent
          </p>
          <p>
            <strong className="text-foreground">AGENTS.md</strong> — Instruksi
            operasional agent
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={store.prevStep}>
            ← Kembali
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button onClick={handleDownload} disabled={busy}>
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {busy ? "Membuat bundle…" : "Download ZIP"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
