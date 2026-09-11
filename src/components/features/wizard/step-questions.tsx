"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWizardStore } from "@/store/wizard";
import type { Question } from "@/lib/ai-schemas";
import type { ProjectAnswer } from "@/types/project";

export function StepQuestions() {
  const { abstractIdea, answers, setAnswers, nextStep, prevStep } =
    useWizardStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const a of answers) map[a.questionId] = String(a.value);
    return map;
  });

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abstractIdea }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      setQuestions(data.questions);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Failed to generate questions:", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    const mapped: ProjectAnswer[] = questions.map((q) => ({
      questionId: q.questionId,
      value: values[q.questionId] ?? "",
    }));
    setAnswers(mapped);
    nextStep();
  };

  const allAnswered =
    questions.length > 0 &&
    questions.every((q) => (values[q.questionId] ?? "").trim().length > 0);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Pertanyaan Klarifikasi</CardTitle>
        <p className="text-sm text-muted-foreground">
          AI akan menghasilkan pertanyaan berdasarkan ide Anda.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {questions.length === 0 && (
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Menghasilkan pertanyaan…" : "Generate Pertanyaan"}
          </Button>
        )}

        {questions.map((q, i) => (
          <div key={q.questionId} className="space-y-2">
            <Label>
              {i + 1}. {q.question}
            </Label>
            {q.options ? (
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt: string) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      setValues((prev) => ({ ...prev, [q.questionId]: opt }))
                    }
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      values[q.questionId] === opt
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <Input
                value={values[q.questionId] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    [q.questionId]: e.target.value,
                  }))
                }
                placeholder="Jawaban Anda…"
              />
            )}
          </div>
        ))}

        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={prevStep}>
            ← Kembali
          </Button>
          <Button onClick={handleProceed} disabled={!allAnswered}>
            Lanjut →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
