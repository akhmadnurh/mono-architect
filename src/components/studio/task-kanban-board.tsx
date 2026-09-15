"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Check,
  Copy,
  CheckCircle,
  FileCode,
  Eye,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// ─── Types ──────────────────────────────────────────────────────────

export interface TaskSection {
  heading: string;
  items: { label: string; checked: boolean; codeBlock?: string }[];
}

export interface TaskItem {
  id: number;
  title: string;
  sections: TaskSection[];
  targetFiles: string[];
  acceptanceCriteria: { label: string; checked: boolean; codeBlock?: string }[];
}

// ─── Parser ─────────────────────────────────────────────────────────

function parseTasks(content: string): TaskItem[] {
  const tasks: TaskItem[] = [];
  if (!content) return tasks;

  const lines = content.split("\n");
  let current: Partial<TaskItem> | null = null;
  let section: "acceptance" | null = null;
  let currentSection: TaskSection | null = null;

  const flush = () => {
    if (currentSection) {
      current?.sections?.push(currentSection);
      currentSection = null;
    }
    if (current?.title) {
      tasks.push({
        id: tasks.length + 1,
        title: current.title,
        sections: current.sections ?? [],
        targetFiles: current.targetFiles ?? [],
        acceptanceCriteria: current.acceptanceCriteria ?? [],
      });
    }
    current = null;
    section = null;
  };

  const subsectionRe = /^\s*\*{1,2}(.+?)\*{1,2}\s*:?\s*$/;

  for (const line of lines) {
    const taskMatch = line.match(/^###\s+(?:Task|Infra)\s+\d+:\s+(.+)/);
    if (taskMatch) {
      flush();
      current = { title: taskMatch[1].trim(), sections: [] };
      section = null;
      currentSection = null;
      continue;
    }

    if (!current) continue;

    const targetMatch = line.match(
      /\*?\*?Target\s*(?:Files|File):\*?\*?\s*(.+)/i,
    );
    if (targetMatch) {
      const files = targetMatch[1]
        .match(/`([^`]+)`/g)
        ?.map((f) => f.replace(/`/g, ""));
      if (files) current.targetFiles = files;
      section = null;
      currentSection = null;
      continue;
    }

    if (/^\*?\*?Acceptance\s+Criteria:?\*?\*?/i.test(line.trim())) {
      if (currentSection) {
        current.sections!.push(currentSection);
        currentSection = null;
      }
      section = "acceptance";
      current.acceptanceCriteria ??= [];
      continue;
    }

    const subMatch = line.match(subsectionRe);
    if (subMatch && current) {
      if (!line.trimStart().startsWith("- ")) {
        if (currentSection) {
          current.sections!.push(currentSection);
        }
        currentSection = { heading: subMatch[1].trim(), items: [] };
        section = null;
        continue;
      }
    }

    // Parent checklist items — check BEFORE children so `- [ ]` lines are consumed
    const checkMatch = line.match(/^\s*- \[([ x])\]\s+(.+)/);
    if (checkMatch && current) {
      const checked = checkMatch[1] === "x";
      const label = checkMatch[2].trim();

      if (section === "acceptance") {
        current.acceptanceCriteria ??= [];
        current.acceptanceCriteria.push({ label, checked });
      } else {
        if (currentSection === null && /^\*?\*?.+\*?\*?$/.test(label)) continue;

        if (currentSection) {
          currentSection.items.push({ label, checked });
        } else {
          currentSection = {
            heading: "Sub-tasks",
            items: [{ label, checked }],
          };
        }
      }
      continue;
    }

    // Indented child lines (2+ spaces before `- ` but NOT `[ ]`) → codeBlock on parent
    const childMatch = line.match(/^(\s{2,}-\s)(.+)/);
    if (childMatch && current) {
      const target =
        section === "acceptance"
          ? current.acceptanceCriteria
          : currentSection?.items;
      if (target && target.length > 0) {
        const last = target[target.length - 1];
        const childLine = childMatch[2].trim();
        last.codeBlock = last.codeBlock
          ? last.codeBlock + "\n" + childLine
          : childLine;
      }
      continue;
    }
  }

  flush();
  return tasks;
}

// ─── Agent Prompt Wrapper (Task 3) ──────────────────────────────────

function buildAgentPromptWrapper(taskContent: string): string {
  return [
    "# System Instructions",
    "",
    "You are an AI coding agent. Follow these rules strictly:",
    "- **Scope**: Only modify files listed in Target Files. Do not touch unrelated files.",
    "- **TDD**: Write tests FIRST, then implement. Run `pnpm test` after each change.",
    "- **Type Safety**: All code must pass `pnpm exec tsc --noEmit` with zero errors.",
    "- **No Regressions**: Run full test suite before finishing. All existing tests must pass.",
    "- **Commit Style**: Use conventional commits (`feat:`, `fix:`, `refactor:`, `test:`).",
    "",
    "---",
    "",
    taskContent,
    "",
    "---",
    "",
    "After implementation, verify:",
    "1. `pnpm exec tsc --noEmit` exits 0",
    "2. `pnpm test` exits 0 with 0 failures",
    "3. All target files exist and are syntactically valid",
  ].join("\n");
}

// ─── Copy Button with Feedback ──────────────────────────────────────

function CopyButton({
  text,
  className,
  size = "sm",
}: {
  text: string;
  className?: string;
  size?: "sm" | "full";
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  if (size === "full") {
    return (
      <Button
        onClick={handleCopy}
        className={cn(
          "w-full gap-2 transition-all duration-200",
          copied ? "bg-green-500/15 text-green-400 hover:bg-green-500/20" : "",
          className,
        )}
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <ClipboardList className="h-4 w-4" />
        )}
        {copied ? "Copied to Clipboard!" : "Copy Task Prompt"}
      </Button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy Prompt"
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200",
        copied
          ? "bg-green-500/15 text-green-400"
          : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70",
        className,
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

// ─── Task Item Renderer (used in both card summary and modal) ───────

function TaskItemRender({
  item,
  showAll = false,
}: {
  item: { label: string; checked: boolean; codeBlock?: string };
  showAll?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle
        className={cn(
          "mt-0.5 h-3.5 w-3.5 shrink-0",
          item.checked ? "text-green-400" : "text-white/20",
        )}
      />
      <div className="min-w-0 flex-1">
        <span
          className={cn(
            "text-sm leading-normal text-slate-200",
            item.checked && "text-white/30 line-through",
          )}
        >
          {item.label}
        </span>
        {showAll && item.codeBlock && (
          <pre className="mt-1.5 overflow-x-auto rounded-md border border-slate-800/80 bg-slate-950 p-2.5 font-mono text-xs leading-snug text-purple-300">
            {item.codeBlock}
          </pre>
        )}
      </div>
    </div>
  );
}

// ─── Task Detail Modal (Task 2) ─────────────────────────────────────

function TaskDetailModal({
  task,
  open,
  onClose,
}: {
  task: TaskItem;
  open: boolean;
  onClose: () => void;
}) {
  const promptText = buildAgentPromptWrapper(buildTaskPrompt(task));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[85vh] w-[50vw] min-w-[650px] max-w-5xl flex-col overflow-hidden bg-slate-950 text-white/80">
        {/* Header */}
        <DialogHeader className="shrink-0 border-b border-white/10 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="text-xl font-bold text-white/90">
                <span className="mr-2 inline-flex h-5 items-center rounded bg-indigo-500/15 px-1.5 text-[10px] font-bold text-indigo-400">
                  #{task.id}
                </span>
                {task.title}
              </DialogTitle>
            </div>
          </div>

          {/* Target Files */}
          {task.targetFiles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {task.targetFiles.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/40"
                >
                  <FileCode className="h-2.5 w-2.5" />
                  {f}
                </span>
              ))}
            </div>
          )}
        </DialogHeader>

        {/* Scrollable Body — Task 2: custom dark scrollbar */}
        <div className="flex-1 space-y-5 overflow-y-auto py-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-900 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700">
          {/* Sections */}
          {task.sections.map((sec, si) => (
            <div key={si} className="space-y-2">
              <h4 className="rounded-md bg-indigo-500/10 px-2.5 py-1 text-xs font-bold tracking-wider uppercase text-purple-400 mb-2">
                {sec.heading}
              </h4>
              <div className="space-y-1.5 pl-1">
                {sec.items.map((item, ii) => (
                  <TaskItemRender key={ii} item={item} showAll />
                ))}
              </div>
            </div>
          ))}

          {/* Acceptance Criteria */}
          {task.acceptanceCriteria.length > 0 && (
            <div className="space-y-2">
              <h4 className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold tracking-wider uppercase text-emerald-400 mb-2">
                Acceptance Criteria
              </h4>
              <div className="space-y-1.5 pl-1">
                {task.acceptanceCriteria.map((ac, i) => (
                  <TaskItemRender key={i} item={ac} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-white/10 pt-3">
          <CopyButton text={promptText} size="full" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Task Prompt Builder ────────────────────────────────────────────

function buildTaskPrompt(task: TaskItem): string {
  const lines: string[] = [];

  lines.push(`## ${task.title}`, "");

  if (task.targetFiles.length > 0) {
    lines.push("**Target Files:**");
    for (const f of task.targetFiles) lines.push(`- \`${f}\``);
    lines.push("");
  }

  for (const g of task.sections) {
    lines.push(`**${g.heading}:**`);
    for (const item of g.items) {
      lines.push(`- [ ] ${item.label}`);
      if (item.codeBlock) {
        for (const codeLine of item.codeBlock.split("\n")) {
          lines.push(`    ${codeLine}`);
        }
      }
    }
    lines.push("");
  }

  if (task.acceptanceCriteria.length > 0) {
    lines.push("**Acceptance Criteria:**");
    for (const c of task.acceptanceCriteria) lines.push(`- [ ] ${c.label}`);
    lines.push("");
  }

  lines.push("---");
  lines.push(
    "Implement the task above following TDD. Write tests first, then code. Respect the target files.",
  );

  return lines.join("\n");
}

// ─── Compact Card (Task 1: no progress bar) ─────────────────────────

function TaskCard({
  task,
  onSelect,
}: {
  task: TaskItem;
  onSelect: () => void;
}) {
  const promptText = buildAgentPromptWrapper(buildTaskPrompt(task));

  return (
    <div className="group flex flex-col rounded-xl border border-white/10 bg-white/[0.03] transition-all duration-200 hover:border-white/20">
      {/* Top row: # badge, title, copy */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <span className="shrink-0 rounded bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-bold text-indigo-400">
          #{task.id}
        </span>
        <h3 className="min-w-0 flex-1 truncate text-base font-semibold text-slate-100">
          {task.title}
        </h3>
        <CopyButton text={promptText} />
      </div>

      {/* Target files */}
      {task.targetFiles.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 pb-2">
          {task.targetFiles.map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 text-xs font-mono text-white/40"
            >
              <FileCode className="h-2.5 w-2.5" />
              {f}
            </span>
          ))}
        </div>
      )}

      {/* Section tags */}
      {task.sections.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 pb-2">
          {task.sections.map((s, i) => (
            <span
              key={i}
              className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-white/30"
            >
              {s.heading} ({s.items.length})
            </span>
          ))}
        </div>
      )}

      {/* Footer: View Detail */}
      <div className="mt-auto border-t border-white/5 px-3 py-2">
        <button
          onClick={onSelect}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/50 transition-colors hover:bg-white/10 hover:text-white/70"
        >
          <Eye className="h-3 w-3" />
          Lihat Detail Task
        </button>
      </div>
    </div>
  );
}

// ─── Exported Board ─────────────────────────────────────────────────

export function TaskKanbanBoard({ content }: { content: string }) {
  const [tasks, setTasks] = useState<TaskItem[]>(() => parseTasks(content));
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // Re-parse and reset selection whenever content changes (tab switch)
  useEffect(() => {
    setTasks(parseTasks(content));
    setSelectedTask(null);
  }, [content]);

  if (tasks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-white/30">
        No tasks found.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onSelect={() => setSelectedTask(task)}
        />
      ))}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          open
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
