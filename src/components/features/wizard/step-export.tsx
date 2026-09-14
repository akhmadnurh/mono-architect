"use client";

import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import confetti from "canvas-confetti";
import { Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/store/wizard";
import { generatePRD } from "@/lib/generators/prd";
import { generateTASKS } from "@/lib/generators/tasks";
import { generateAGENTS } from "@/lib/generators/agents";

export function StepExport() {
  const [busy, setBusy] = useState(false);
  const store = useWizardStore();

  async function handleDownload() {
    setBusy(true);
    try {
      const zip = new JSZip();
      zip.file("PRD.md", generatePRD(store));
      zip.file("TASKS.md", generateTASKS(store));
      zip.file("AGENTS.md", generateAGENTS(store));

      const blob = await zip.generateAsync({ type: "blob" });
      const slug = store.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      saveAs(blob, `${slug || "project"}-bundle.zip`);

      // Fire confetti on successful export
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-xl">Export Bundle</CardTitle>
        <p className="text-sm text-muted-foreground">
          Unduh bundle berisi <code>PRD.md</code>, <code>TASKS.md</code>, dan{" "}
          <code>AGENTS.md</code>.
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
          <Button onClick={handleDownload} disabled={busy}>
            {busy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {busy ? "Membuat bundle…" : "Download ZIP"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
