"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWizardStore } from "@/store/wizard";
import type { TechStackItem } from "@/types/project";
import type { TechStackCategory } from "@/lib/constants/tech-stack";
import { TECH_STACK_PRESETS } from "@/lib/constants/tech-stack";

type Selections = Record<string, string | null>;

const CATEGORIES: Array<{
  key: TechStackCategory;
  label: string;
  icon: string;
}> = [
  { key: "frontend", label: "Frontend", icon: "🖥️" },
  { key: "backend", label: "Backend", icon: "⚙️" },
  { key: "database", label: "Database", icon: "🗄️" },
  { key: "deployment", label: "Deployment", icon: "🚀" },
  { key: "orm", label: "ORM", icon: "🔌" },
  { key: "uiLibrary", label: "UI Library", icon: "🎨" },
  { key: "stateManagement", label: "State Management", icon: "📦" },
] as const;

export function StepTechStack() {
  const { setTechStack, setTechStackMode, nextStep, prevStep } =
    useWizardStore();
  const [mode, setMode] = useState<"ai" | "manual" | null>(null);
  const [selections, setSelections] = useState<Selections>({});

  const handleSelect = (category: string, value: string | null) => {
    setSelections((prev) => ({
      ...prev,
      [category]: value === "__none__" || value === null ? null : value,
    }));
  };

  const handleProceedAI = () => {
    setTechStackMode("ai");
    setTechStack([]);
    nextStep();
  };

  const handleProceedManual = () => {
    const stack: TechStackItem[] = [];
    for (const cat of CATEGORIES) {
      const picked = selections[cat.key];
      if (picked) {
        const presets = TECH_STACK_PRESETS[cat.key] ?? [];
        const match = presets.find((p) => p.name === picked);
        stack.push({
          category: cat.key,
          name: picked,
          reason: match?.reason ?? "",
        });
      }
    }
    setTechStackMode("manual");
    setTechStack(stack);
    nextStep();
  };

  const hasSelections = Object.values(selections).some(Boolean);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Tech Stack</CardTitle>
        <p className="text-sm text-muted-foreground">
          Pilih teknologi untuk proyek Anda.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {mode === null && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Bagaimana Anda ingin menentukan tech stack?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode("ai")}
                className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:bg-accent"
              >
                <span className="text-2xl">🤖</span>
                <span className="font-medium">Biarkan AI Pilih</span>
                <span className="text-xs text-muted-foreground">
                  AI menentukan stack terbaik di Step 4
                </span>
              </button>
              <button
                onClick={() => setMode("manual")}
                className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:bg-accent"
              >
                <span className="text-2xl">✋</span>
                <span className="font-medium">Pilih Sendiri</span>
                <span className="text-xs text-muted-foreground">
                  Pilih dari preset populer
                </span>
              </button>
            </div>
          </div>
        )}

        {mode === "ai" && (
          <div className="space-y-3">
            <div className="rounded-lg border bg-muted/50 p-4 text-sm">
              <p className="font-medium">
                AI akan memilih tech stack untuk Anda
              </p>
              <p className="mt-1 text-muted-foreground">
                Berdasarkan ide proyek dan jawaban Q&A, AI akan merekomendasikan
                stack terbaik saat menghasilkan arsitektur di Step berikutnya.
              </p>
            </div>
          </div>
        )}

        {mode === "manual" && (
          <div className="space-y-4">
            {CATEGORIES.map((cat) => {
              const presets = TECH_STACK_PRESETS[cat.key] ?? [];
              const selectedMatch = presets.find(
                (p) => p.name === selections[cat.key],
              );
              return (
                <div key={cat.key} className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </Label>
                  <Select
                    value={selections[cat.key] ?? "__none__"}
                    onValueChange={(v) => handleSelect(cat.key, v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih teknologi…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {presets.map((item) => (
                        <SelectItem key={item.name} value={item.name}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedMatch && (
                    <p className="text-xs text-muted-foreground">
                      {selectedMatch.reason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            onClick={mode === null ? prevStep : () => setMode(null)}
          >
            ← Kembali
          </Button>
          {mode === "ai" && <Button onClick={handleProceedAI}>Lanjut →</Button>}
          {mode === "manual" && (
            <Button onClick={handleProceedManual} disabled={!hasSelections}>
              Lanjut →
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
