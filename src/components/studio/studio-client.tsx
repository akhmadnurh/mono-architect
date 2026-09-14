"use client";

import { useState, useCallback } from "react";
import { Wizard } from "@/components/features/wizard";
import { StudioHeader } from "@/components/studio/studio-header";
import { FloatingStepper } from "@/components/studio/floating-stepper";
import { PrdEditor } from "@/components/editor/prd-editor";
import { AiRefinerDrawer } from "@/components/studio/ai-refiner-drawer";
import { ExportModal } from "@/components/studio/export-modal";

interface StudioPageProps {
  project: {
    id: string;
    title: string;
  };
}

export function StudioClient({ project }: StudioPageProps) {
  const [view, setView] = useState<"mindmap" | "prd">("mindmap");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [refinedContent, setRefinedContent] = useState<string | null>(null);

  const handleRefined = useCallback((content: string) => {
    if (content) {
      setRefinedContent(content);
      setView("prd");
    }
  }, []);

  return (
    <div className="flex h-full w-full flex-col">
      <StudioHeader
        projectTitle={project.title}
        projectId={project.id}
        view={view}
        onViewChange={setView}
        onToggleRefiner={() => setDrawerOpen((o) => !o)}
        onExport={() => setExportOpen(true)}
      />

      {/* Full-screen wizard canvas */}
      <main className="relative flex-1 overflow-hidden">
        {view === "mindmap" ? (
          <div className="flex h-full w-full items-center justify-center">
            <Wizard />
          </div>
        ) : (
          <PrdEditor projectId={project.id} externalContent={refinedContent} />
        )}
      </main>

      <FloatingStepper />

      {/* AI Refiner Drawer */}
      <AiRefinerDrawer
        projectId={project.id}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onRefined={handleRefined}
      />

      {/* Export Modal */}
      <ExportModal open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  );
}
