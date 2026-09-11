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
import type { TechStackOptions } from "@/lib/ai-schemas";

type Selections = Record<string, string | null>;

const CATEGORIES = [
  { key: "frontend", label: "Frontend", icon: "🖥️" },
  { key: "backend", label: "Backend", icon: "⚙️" },
  { key: "database", label: "Database", icon: "🗄️" },
  { key: "deployment", label: "Deployment", icon: "🚀" },
] as const;

export function StepTechStack() {
  const { abstractIdea, answers, scale, setTechStack, nextStep, prevStep } =
    useWizardStore();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<TechStackOptions | null>(null);
  const [selections, setSelections] = useState<Selections>({});

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate/tech-stack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          abstractIdea,
          answers: answers.map((a) => ({
            question: a.questionId,
            value: a.value,
          })),
          scale,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: TechStackOptions = await res.json();
      setOptions(data);
      // Auto-select first (AI-recommended) per category
      const init: Selections = {};
      for (const cat of Object.keys(data) as Array<keyof TechStackOptions>) {
        init[cat] = data[cat].length > 0 ? data[cat][0] : null;
      }
      setSelections(init);
    } catch (err) {
      console.error("Failed to generate tech stack:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (category: string, value: string) => {
    setSelections((prev) => ({
      ...prev,
      [category]: value === "__none__" ? null : value,
    }));
  };

  const handleProceed = () => {
    if (!options) return;
    const stack: TechStackItem[] = [];
    for (const cat of CATEGORIES) {
      const picked = selections[cat.key];
      if (picked) {
        stack.push({ category: cat.key, name: picked, reason: "" });
      }
    }
    setTechStack(stack);
    nextStep();
  };

  const hasSelections = Object.values(selections).some(Boolean);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Tech Stack</CardTitle>
        <p className="text-sm text-muted-foreground">
          Pilih teknologi untuk setiap kategori. Pilih &quot;None&quot; jika
          tidak diperlukan.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!options && (
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Merekomendasikan tech stack…" : "Generate Tech Stack"}
          </Button>
        )}

        {options && (
          <div className="space-y-4">
            {CATEGORIES.map((cat) => {
              const items = options[cat.key] ?? [];
              const hasOptions = items.length > 0;
              return (
                <div key={cat.key} className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    {!hasOptions && (
                      <span className="text-xs text-muted-foreground">
                        (tidak diperlukan)
                      </span>
                    )}
                  </Label>
                  <Select
                    value={selections[cat.key] ?? "__none__"}
                    onValueChange={(v) =>
                      handleSelect(cat.key, v ?? "__none__")
                    }
                    disabled={!hasOptions}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          hasOptions ? "Pilih teknologi…" : "Tidak diperlukan"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {hasOptions && (
                        <SelectItem value="__none__">None</SelectItem>
                      )}
                      {items.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={prevStep}>
            ← Kembali
          </Button>
          <Button onClick={handleProceed} disabled={!hasSelections}>
            Lanjut →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
