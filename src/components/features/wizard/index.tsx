"use client";

import { useWizardStore, type WizardStep } from "@/store/wizard";
import { StepIdea } from "./step-idea";
import { StepQuestions } from "./step-questions";
import { StepTechStack } from "./step-techstack";
import { StepArchitecture } from "./step-architecture";
import { StepExport } from "./step-export";

const STEPS: { label: string; step: WizardStep }[] = [
  { label: "Ide & Skala", step: 1 },
  { label: "Q&A", step: 2 },
  { label: "Tech Stack", step: 3 },
  { label: "Arsitektur", step: 4 },
  { label: "Export", step: 5 },
];

function ProgressBar({ currentStep }: { currentStep: WizardStep }) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {STEPS.map((s, i) => {
        const isDone = currentStep > s.step;
        const isCurrent = currentStep === s.step;
        return (
          <div key={s.step} className="flex items-center gap-1 sm:gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                isDone
                  ? "bg-primary text-primary-foreground"
                  : isCurrent
                    ? "bg-primary/10 text-primary ring-2 ring-primary/20"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {isDone ? "✓" : s.step}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-6 sm:w-10 ${isDone ? "bg-primary" : "bg-muted"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepContent({ step }: { step: WizardStep }) {
  switch (step) {
    case 1:
      return <StepIdea />;
    case 2:
      return <StepQuestions />;
    case 3:
      return <StepTechStack />;
    case 4:
      return <StepArchitecture />;
    case 5:
      return <StepExport />;
    default:
      return (
        <div className="flex items-center justify-center rounded-lg border border-dashed p-16 text-muted-foreground">
          Step {step} — Coming soon
        </div>
      );
  }
}

export function Wizard() {
  const { step, prevStep, nextStep } = useWizardStore();

  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-4 py-8">
      <div className="w-full max-w-2xl">
        <ProgressBar currentStep={step} />
      </div>

      <StepContent step={step} />

      {step > 1 && step < 5 && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={prevStep}
            className="rounded-lg border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            ← Kembali
          </button>
        </div>
      )}
    </div>
  );
}
