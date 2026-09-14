import { create } from "zustand";
import type {
  ProjectScale,
  ProjectAnswer,
  ProjectNodeTree,
} from "@/types/project";
import type { TechStackItem, TechStackMode } from "@/types/project";

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface WizardState {
  step: WizardStep;
  title: string;
  abstractIdea: string;
  scale: ProjectScale | "";
  answers: ProjectAnswer[];
  techStack: TechStackItem[];
  techStackMode: TechStackMode | "";
  nodeTree: ProjectNodeTree | null;

  // Persistence
  projectId: string | null;
  saveStatus: SaveStatus;

  setStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  setTitle: (title: string) => void;
  setAbstractIdea: (idea: string) => void;
  setScale: (scale: ProjectScale) => void;
  setAnswers: (answers: ProjectAnswer[]) => void;
  setTechStack: (stack: TechStackItem[]) => void;
  setTechStackMode: (mode: TechStackMode | "") => void;
  setNodeTree: (tree: ProjectNodeTree) => void;
  setProjectId: (id: string) => void;
  loadFromProject: (project: {
    id: string;
    title: string;
    abstractIdea: string;
    scale: ProjectScale;
    answers: ProjectAnswer[];
    techStack: TechStackItem[];
    techStackMode: TechStackMode | "";
    nodeTree: ProjectNodeTree | null;
    currentStep: WizardStep;
  }) => void;
  reset: () => void;
}

const INITIAL: Omit<
  WizardState,
  | "setStep"
  | "nextStep"
  | "prevStep"
  | "setTitle"
  | "setAbstractIdea"
  | "setScale"
  | "setAnswers"
  | "setTechStack"
  | "setTechStackMode"
  | "setNodeTree"
  | "setProjectId"
  | "loadFromProject"
  | "reset"
  | "projectId"
  | "saveStatus"
> = {
  step: 1,
  title: "",
  abstractIdea: "",
  scale: "",
  answers: [],
  techStack: [],
  techStackMode: "",
  nodeTree: null,
};

// Debounce auto-save
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  const state = useWizardStore.getState();

  // Don't save if title is empty (project not started yet)
  if (!state.title.trim()) return;

  useWizardStore.setState({ saveStatus: "saving" });

  saveTimer = setTimeout(async () => {
    const s = useWizardStore.getState();

    try {
      let projectId = s.projectId;

      // Create project if it doesn't exist yet
      if (!projectId) {
        const createRes = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: s.title,
            abstractIdea: s.abstractIdea,
            scale: s.scale,
            answers: s.answers,
            techStack: s.techStack,
            currentStep: s.step,
          }),
        });
        if (!createRes.ok) {
          useWizardStore.setState({ saveStatus: "error" });
          return;
        }
        const { id } = (await createRes.json()) as { id: string };
        useWizardStore.setState({ projectId: id });
        projectId = id;
      }

      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: s.title,
          abstractIdea: s.abstractIdea,
          scale: s.scale,
          answers: s.answers,
          techStack: s.techStack,
          nodeTree: s.nodeTree,
          currentStep: s.step,
        }),
      });
      useWizardStore.setState({
        saveStatus: res.ok ? "saved" : "error",
      });
    } catch {
      useWizardStore.setState({ saveStatus: "error" });
    }
  }, 800);
}

export const useWizardStore = create<WizardState>((set) => ({
  ...INITIAL,
  projectId: null,
  saveStatus: "idle",

  setStep: (step) => {
    set({ step });
    scheduleSave();
  },
  nextStep: () => {
    set((s) => ({ step: Math.min(s.step + 1, 5) as WizardStep }));
    scheduleSave();
  },
  prevStep: () => {
    set((s) => ({ step: Math.max(s.step - 1, 1) as WizardStep }));
    scheduleSave();
  },
  setTitle: (title) => {
    set({ title });
    scheduleSave();
  },
  setAbstractIdea: (abstractIdea) => {
    set({ abstractIdea });
    scheduleSave();
  },
  setScale: (scale) => {
    set({ scale });
    scheduleSave();
  },
  setAnswers: (answers) => {
    set({ answers });
    scheduleSave();
  },
  setTechStack: (techStack) => {
    set({ techStack });
    scheduleSave();
  },
  setTechStackMode: (techStackMode) => {
    set({ techStackMode });
    scheduleSave();
  },
  setNodeTree: (nodeTree) => {
    set({ nodeTree });
    scheduleSave();
  },
  setProjectId: (projectId) => set({ projectId }),
  loadFromProject: (project) =>
    set({
      projectId: project.id,
      title: project.title,
      abstractIdea: project.abstractIdea,
      scale: project.scale,
      answers: project.answers,
      techStack: project.techStack,
      techStackMode: project.techStackMode,
      nodeTree: project.nodeTree,
      step: project.currentStep,
      saveStatus: "idle",
    }),
  reset: () => {
    if (saveTimer) clearTimeout(saveTimer);
    set({ ...INITIAL, projectId: null, saveStatus: "idle" });
  },
}));
