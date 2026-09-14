"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWizardStore } from "@/store/wizard";
import type { Question } from "@/lib/ai-schemas";
import type { ProjectAnswer } from "@/types/project";

export function StepQuestions() {
  const {
    abstractIdea,
    answers,
    setAnswers,
    qaRound,
    setQaRound,
    nextStep,
    prevStep,
  } = useWizardStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoFetched = useRef(false);
  const MAX_ROUNDS = 3;
  const [values, setValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const a of answers) map[a.questionId] = String(a.value);
    return map;
  });

  const handleGenerate = useCallback(
    async (
      previousAnswers?: Array<{ question: string; value: string | string[] }>,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/generate/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ abstractIdea, previousAnswers }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Unknown error");
        if (previousAnswers && previousAnswers.length > 0) {
          // Follow-up round: append new questions
          setQuestions((prev) => [...prev, ...data.questions]);
        } else {
          setQuestions(data.questions);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Failed to generate questions:", msg);
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [abstractIdea],
  );

  // Auto-trigger: fetch on mount when questions are empty
  // State guard: if answers already exist (navigating back), restore from store
  useEffect(() => {
    if (answers.length > 0 && questions.length === 0) {
      const restored: Question[] = answers.map((a) => ({
        questionId: a.questionId,
        question: a.question ?? "",
      }));
      setQuestions(restored);
      return;
    }
    if (questions.length === 0 && !loading && !autoFetched.current) {
      autoFetched.current = true;
      handleGenerate();
    }
  }, [answers, questions.length, loading, handleGenerate]);

  const handleProceed = () => {
    const mapped: ProjectAnswer[] = questions.map((q) => ({
      questionId: q.questionId,
      question: q.question,
      value: values[q.questionId] ?? "",
    }));
    setAnswers(mapped);
    nextStep();
  };

  const handleAskMore = () => {
    // Save current answers, then fetch follow-up questions
    const mapped: ProjectAnswer[] = questions.map((q) => ({
      questionId: q.questionId,
      question: q.question,
      value: values[q.questionId] ?? "",
    }));
    setAnswers(mapped);
    setQaRound(qaRound + 1);

    // Build previous answers for context
    const previousAnswers = mapped.map((a) => ({
      question: a.question ?? "",
      value: a.value,
    }));
    handleGenerate(previousAnswers);
  };

  const allAnswered =
    questions.length > 0 &&
    questions.every((q) => (values[q.questionId] ?? "").trim().length > 0);

  const canAskMore = qaRound < MAX_ROUNDS - 1 && allAnswered && !loading;

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

        {questions.length === 0 && !error && (
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
                  </div>
                ))}
                <p className="text-sm text-muted-foreground">
                  Menghasilkan pertanyaan…
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Menyiapkan pertanyaan…
              </p>
            )}
          </div>
        )}
        {questions.length === 0 && error && (
          <Button
            onClick={() => {
              void handleGenerate();
            }}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Menghasilkan pertanyaan…" : "Coba Lagi"}
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
          <div className="flex gap-2">
            {canAskMore && (
              <Button
                variant="outline"
                onClick={() => {
                  void handleAskMore();
                }}
              >
                {loading ? "Menghasilkan…" : "Tanya Lagi…"}
              </Button>
            )}
            <Button onClick={handleProceed} disabled={!allAnswered}>
              Lanjut →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
