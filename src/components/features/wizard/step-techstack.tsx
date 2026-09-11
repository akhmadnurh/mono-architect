"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/store/wizard";
import type { TechStackItem, ProjectScale } from "@/types/project";

export function StepTechStack() {
  const {
    abstractIdea,
    answers,
    scale,
    techStack,
    setTechStack,
    nextStep,
    prevStep,
  } = useWizardStore();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(techStack.map((t) => `${t.category}:${t.name}`)),
  );

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
      const data = await res.json();
      setTechStack(data);
      setSelected(
        new Set(
          data.map(
            (t: { category: string; name: string }) =>
              `${t.category}:${t.name}`,
          ),
        ),
      );
    } catch (err) {
      console.error("Failed to generate tech stack:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleProceed = () => {
    const filtered = techStack.filter((t) =>
      selected.has(`${t.category}:${t.name}`),
    );
    setTechStack(filtered);
    nextStep();
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Tech Stack</CardTitle>
        <p className="text-sm text-muted-foreground">
          AI merekomendasikan teknologi yang sesuai. Pilih yang ingin Anda
          gunakan.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {techStack.length === 0 && (
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Merekomendasikan tech stack…" : "Generate Tech Stack"}
          </Button>
        )}

        {techStack.length > 0 && (
          <div className="space-y-3">
            {techStack.map((item) => {
              const key = `${item.category}:${item.name}`;
              const isActive = selected.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggle(key)}
                  className={`w-full rounded-lg border p-4 text-left transition-all ${
                    isActive
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border opacity-60 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase text-muted-foreground">
                      {item.category}
                    </span>
                    <span
                      className={`text-xs ${isActive ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {isActive ? "✓ Selected" : "Click to select"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium">{item.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.reason}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={prevStep}>
            ← Kembali
          </Button>
          <Button onClick={handleProceed} disabled={selected.size === 0}>
            Lanjut →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
