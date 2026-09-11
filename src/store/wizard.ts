import { create } from "zustand";
import type {
  ProjectScale,
  ProjectAnswer,
  ProjectNodeTree,
} from "@/types/project";
import type { TechStackItem } from "@/types/project";

export type WizardStep = 1 | 2 | 3 | 4 | 5;

interface WizardState {
  step: WizardStep;
  title: string;
  abstractIdea: string;
  scale: ProjectScale | "";
  answers: ProjectAnswer[];
  techStack: TechStackItem[];
  nodeTree: ProjectNodeTree | null;

  setStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  setTitle: (title: string) => void;
  setAbstractIdea: (idea: string) => void;
  setScale: (scale: ProjectScale) => void;
  setAnswers: (answers: ProjectAnswer[]) => void;
  setTechStack: (stack: TechStackItem[]) => void;
  setNodeTree: (tree: ProjectNodeTree) => void;
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
  | "setNodeTree"
  | "reset"
> = {
  step: 1,
  title: "",
  abstractIdea: "",
  scale: "",
  answers: [],
  techStack: [],
  nodeTree: null,
};

export const useWizardStore = create<WizardState>((set) => ({
  ...INITIAL,

  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 5) as WizardStep })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) as WizardStep })),
  setTitle: (title) => set({ title }),
  setAbstractIdea: (abstractIdea) => set({ abstractIdea }),
  setScale: (scale) => set({ scale }),
  setAnswers: (answers) => set({ answers }),
  setTechStack: (techStack) => set({ techStack }),
  setNodeTree: (nodeTree) => set({ nodeTree }),
  reset: () => set(INITIAL),
}));
