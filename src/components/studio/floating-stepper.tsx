"use client";

import { useWizardStore, type WizardStep } from "@/store/wizard";
import { motion } from "framer-motion";

const STEPS: { label: string; step: WizardStep }[] = [
  { label: "Ide & Skala", step: 1 },
  { label: "Q&A", step: 2 },
  { label: "Tech Stack", step: 3 },
  { label: "Arsitektur", step: 4 },
  { label: "Export", step: 5 },
];

export function FloatingStepper() {
  const { step: currentStep } = useWizardStore();

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-slate-900/90 px-5 py-2.5 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const isDone = currentStep > s.step;
          const isCurrent = currentStep === s.step;
          return (
            <div key={s.step} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-medium transition-all ${
                    isDone
                      ? "bg-indigo-500 text-white"
                      : isCurrent
                        ? "bg-indigo-500/20 text-indigo-300 ring-2 ring-indigo-500/30"
                        : "bg-white/5 text-white/30"
                  }`}
                >
                  {isDone ? "✓" : s.step}
                </div>
                <span
                  className={`hidden text-xs sm:inline ${
                    isCurrent ? "font-medium text-white/80" : "text-white/30"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-1 h-px w-4 ${
                    isDone ? "bg-indigo-500/60" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
