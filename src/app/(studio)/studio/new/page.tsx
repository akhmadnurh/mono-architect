"use client";

import { useEffect } from "react";
import { Wizard } from "@/components/features/wizard";
import { useWizardStore } from "@/store/wizard";

export default function NewProjectPage() {
  const reset = useWizardStore((s) => s.reset);

  // Reset wizard store so stale state from a previous project doesn't carry over
  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <div className="h-screen w-screen overflow-hidden">
      <Wizard />
    </div>
  );
}
