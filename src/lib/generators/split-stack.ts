import type { TechStackItem } from "@/types/project";

/**
 * Detect if FE and BE frameworks differ (split-stack mode).
 * Returns true when frontend and backend categories exist with different names.
 */
export function isSplitStack(techStack: TechStackItem[]): boolean {
  const fe = techStack.find((t) => t.category === "frontend");
  const be = techStack.find((t) => t.category === "backend");
  if (!fe || !be) return false;
  return fe.name !== be.name;
}

/** Filter tech stack for a specific stack side. */
export function filterBySide(
  techStack: TechStackItem[],
  side: "frontend" | "backend",
): TechStackItem[] {
  if (side === "frontend") {
    return techStack.filter((t) => {
      // Keep frontend-specific + shared categories (deployment, orm) only if no backend split
      return (
        t.category === "frontend" ||
        t.category === "uiLibrary" ||
        t.category === "stateManagement"
      );
    });
  }
  // backend side
  return techStack.filter((t) => {
    return (
      t.category === "backend" ||
      t.category === "database" ||
      t.category === "orm"
    );
  });
}
