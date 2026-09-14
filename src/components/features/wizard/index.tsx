"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Cloud, CloudOff, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  useWizardStore,
  type WizardStep,
  type SaveStatus,
} from "@/store/wizard";
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

function SaveBadge({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  return (
    <span className="flex items-center gap-1 text-[11px] text-white/40">
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Menyimpan…
        </>
      )}
      {status === "saved" && (
        <>
          <Cloud className="h-3 w-3" />
          Tersimpan
        </>
      )}
      {status === "error" && (
        <>
          <CloudOff className="h-3 w-3 text-red-400" />
          Gagal menyimpan
        </>
      )}
    </span>
  );
}

function TopBar({ currentStep }: { currentStep: WizardStep }) {
  const saveStatus = useWizardStore((s) => s.saveStatus);
  const projectId = useWizardStore((s) => s.projectId);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white/90"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>
      </div>

      {/* Step progress */}
      <div className="hidden items-center gap-1.5 sm:flex">
        {STEPS.map((s, i) => {
          const isDone = currentStep > s.step;
          const isCurrent = currentStep === s.step;
          return (
            <div key={s.step} className="flex items-center gap-1.5">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium transition-all ${
                  isDone
                    ? "bg-indigo-500 text-white"
                    : isCurrent
                      ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30"
                      : "bg-white/5 text-white/25"
                }`}
              >
                {isDone ? "✓" : s.step}
              </div>
              <span
                className={`text-[11px] ${isCurrent ? "text-white/70" : "text-white/25"}`}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-1 h-px w-3 ${isDone ? "bg-indigo-500/50" : "bg-white/10"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {projectId && <SaveBadge status={saveStatus} />}
      {!projectId && <div className="w-16" />}
    </header>
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
  }
}

export function Wizard({ embedded = false }: { embedded?: boolean }) {
  const step = useWizardStore((s) => s.step);

  const isFullBleed = step === 4; // Architecture fills the entire canvas

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-950">
      {!embedded && <TopBar currentStep={step} />}

      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`h-full w-full ${isFullBleed ? "" : "flex items-center justify-center overflow-y-auto p-6"}`}
          >
            <StepContent step={step} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
