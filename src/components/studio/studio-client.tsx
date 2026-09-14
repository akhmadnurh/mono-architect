"use client";

import { useEffect, useState, useCallback } from "react";
import { Wizard } from "@/components/features/wizard";
import { StudioHeader } from "@/components/studio/studio-header";
import { PrdEditor } from "@/components/editor/prd-editor";
import { AiRefinerDrawer } from "@/components/studio/ai-refiner-drawer";
import { ExportModal } from "@/components/studio/export-modal";
import { Badge } from "@/components/ui/badge";
import { TaskKanbanBoard } from "@/components/studio/task-kanban-board";
import { useWizardStore } from "@/store/wizard";
import { generatePRD } from "@/lib/generators/prd";
import { generateTASKS } from "@/lib/generators/tasks";
import { generateAGENTS } from "@/lib/generators/agents";
import { isSplitStack, filterBySide } from "@/lib/generators/split-stack";
import type {
  ProjectAnswer,
  TechStackItem,
  ProjectNodeTree,
} from "@/types/project";

interface StudioPageProps {
  project: {
    id: string;
    title: string;
    abstractIdea: string;
    scale: "weekend" | "startup";
    answers: ProjectAnswer[];
    techStack: TechStackItem[];
    nodeTree: ProjectNodeTree | null;
    prdContent: string | null;
    tasksContent: string | null;
    agentsContent: string | null;
    currentStep: number;
    status: string;
  };
}

type PreviewTab =
  | "prd"
  | "tasks"
  | "agents"
  | "fe-tasks"
  | "be-tasks"
  | "fe-agents"
  | "be-agents";

export function StudioClient({ project }: StudioPageProps) {
  const [view, setView] = useState<"mindmap" | "preview">(
    project.currentStep >= 5 ? "preview" : "mindmap",
  );
  const [previewTab, setPreviewTab] = useState<PreviewTab>("prd");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [refinedContent, setRefinedContent] = useState<string | null>(null);
  const loadFromProject = useWizardStore((s) => s.loadFromProject);
  const saveStatus = useWizardStore((s) => s.saveStatus);

  // Hydrate wizard store from server project data
  useEffect(() => {
    loadFromProject({
      id: project.id,
      title: project.title,
      abstractIdea: project.abstractIdea,
      scale: project.scale,
      answers: project.answers,
      techStack: project.techStack,
      techStackMode: project.techStack.length > 0 ? "manual" : "ai",
      nodeTree: project.nodeTree,
      currentStep: project.currentStep as 1 | 2 | 3 | 4 | 5,
    });
  }, [
    project.id,
    project.title,
    project.abstractIdea,
    project.scale,
    project.answers,
    project.techStack,
    project.nodeTree,
    project.currentStep,
    loadFromProject,
  ]);

  const handleRefined = useCallback((content: string) => {
    if (content) {
      setRefinedContent(content);
      setPreviewTab("prd");
      setView("preview");
    }
  }, []);

  // Generate preview content from store, falling back to DB-saved content
  const store = useWizardStore();
  const split = isSplitStack(store.techStack);
  const feStack = filterBySide(store.techStack, "frontend");
  const beStack = filterBySide(store.techStack, "backend");
  const previewContent = {
    prd: refinedContent ?? project.prdContent ?? generatePRD(store),
    tasks: project.tasksContent ?? generateTASKS(store),
    agents: project.agentsContent ?? generateAGENTS(store),
    "fe-tasks": generateTASKS({ ...store, techStack: feStack }),
    "be-tasks": generateTASKS({ ...store, techStack: beStack }),
    "fe-agents": generateAGENTS({ ...store, techStack: feStack }),
    "be-agents": generateAGENTS({ ...store, techStack: beStack }),
  };

  const tabs = split
    ? ([
        { key: "prd", label: "PRD.md" },
        { key: "fe-tasks", label: "FE TASKS" },
        { key: "be-tasks", label: "BE TASKS" },
        { key: "fe-agents", label: "FE AGENTS" },
        { key: "be-agents", label: "BE AGENTS" },
      ] as const)
    : ([
        { key: "prd", label: "PRD.md" },
        { key: "tasks", label: "TASKS.md" },
        { key: "agents", label: "AGENTS.md" },
      ] as const);

  return (
    <div className="flex h-full w-full flex-col">
      <StudioHeader
        projectTitle={project.title}
        projectId={project.id}
        view={view}
        onViewChange={setView}
        onToggleRefiner={() => setDrawerOpen((o) => !o)}
        onExport={() => setExportOpen(true)}
        autoSaving={saveStatus === "saving"}
      />

      <main className="relative flex-1 overflow-hidden">
        {view === "mindmap" ? (
          <Wizard embedded />
        ) : (
          <div className="flex h-full flex-col">
            {/* Preview tabs */}
            <div className="flex shrink-0 items-center gap-1 border-b border-white/10 bg-slate-950/80 px-4">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setPreviewTab(tab.key)}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${
                    previewTab === tab.key
                      ? "border-b-2 border-indigo-500 text-white/80"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              {isSplitStack(store.techStack) && (
                <span className="ml-2 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-400">
                  Split-Stack
                </span>
              )}
            </div>

            {/* Project Metadata Header */}
            <div className="shrink-0 border-b border-white/10 bg-slate-950/60 px-4 py-2.5">
              <div className="flex items-center gap-3">
                <h2 className="truncate text-sm font-semibold text-white/90">
                  {project.title}
                </h2>
                <Badge
                  variant="secondary"
                  className="shrink-0 text-[10px] capitalize"
                >
                  {project.scale}
                </Badge>
              </div>
              {project.abstractIdea && (
                <p className="mt-0.5 line-clamp-2 text-xs text-white/40">
                  {project.abstractIdea}
                </p>
              )}
              {project.techStack.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {project.techStack.map((ts) => (
                    <span
                      key={ts.name}
                      className="inline-flex items-center rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50"
                    >
                      {ts.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {previewTab === "tasks" ||
              previewTab === "fe-tasks" ||
              previewTab === "be-tasks" ? (
                <TaskKanbanBoard content={previewContent[previewTab]} />
              ) : (
                <PrdEditor content={previewContent[previewTab]} />
              )}
            </div>
          </div>
        )}
      </main>

      {view === "preview" && (
        <>
          <AiRefinerDrawer
            projectId={project.id}
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            onRefined={handleRefined}
          />
          <ExportModal open={exportOpen} onOpenChange={setExportOpen} />
        </>
      )}
    </div>
  );
}
