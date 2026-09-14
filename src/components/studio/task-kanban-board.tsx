"use client";

import { useState, useCallback } from "react";
import { Check, Copy, CheckCircle, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskItem {
  id: number;
  title: string;
  subtasks: { label: string; checked: boolean }[];
  targetFiles: string[];
  acceptanceCriteria: { label: string; checked: boolean }[];
}

function parseTasks(content: string): TaskItem[] {
  const tasks: TaskItem[] = [];
  if (!content) return tasks;

  const lines = content.split("\n");
  let current: Partial<TaskItem> | null = null;
  let section: "subtasks" | "acceptance" | null = null;

  const flush = () => {
    if (current?.title) {
      tasks.push({
        id: tasks.length + 1,
        title: current.title,
        subtasks: current.subtasks ?? [],
        targetFiles: current.targetFiles ?? [],
        acceptanceCriteria: current.acceptanceCriteria ?? [],
      });
    }
    current = null;
    section = null;
  };

  for (const line of lines) {
    // New task header: ### Task N: ... or ### Infra N: ...
    const taskMatch = line.match(/^###\s+(?:Task|Infra)\s+\d+:\s+(.+)/);
    if (taskMatch) {
      flush();
      current = { title: taskMatch[1].trim() };
      section = null;
      continue;
    }

    if (!current) continue;

    // Target files line: `- **Target Files:** ...`
    const targetMatch = line.match(
      /\*?\*?Target\s*(?:Files|File):\*?\*?\s*(.+)/i,
    );
    if (targetMatch) {
      const files = targetMatch[1]
        .match(/`([^`]+)`/g)
        ?.map((f) => f.replace(/`/g, ""));
      if (files) current.targetFiles = files;
      section = null;
      continue;
    }

    // Acceptance criteria header
    if (/^\*?\*?Acceptance\s+Criteria:?\*?\*?/i.test(line.trim())) {
      section = "acceptance";
      current.acceptanceCriteria ??= [];
      continue;
    }

    // Checklist item: `- [ ] label` or `- [x] label`
    const checkMatch = line.match(/^\s*- \[([ x])\]\s+(.+)/);
    if (checkMatch && current) {
      const checked = checkMatch[1] === "x";
      const label = checkMatch[2].trim();

      if (section === "acceptance") {
        current.acceptanceCriteria ??= [];
        current.acceptanceCriteria.push({ label, checked });
      } else {
        current.subtasks ??= [];
        // Skip the main task name line (first bold item)
        if (!current.subtasks.length && /^\*?\*?.+\*?\*?$/.test(label))
          continue;
        current.subtasks.push({ label, checked });
      }
      continue;
    }
  }

  flush();
  return tasks;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
        copied
          ? "bg-green-500/10 text-green-400"
          : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70",
      )}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied!" : "Copy Prompt"}
    </button>
  );
}

function TaskCard({ task }: { task: TaskItem }) {
  const promptText = [
    `## ${task.title}`,
    "",
    ...(task.targetFiles.length > 0
      ? ["**Target Files:**", ...task.targetFiles.map((f) => `- \`${f}\``), ""]
      : []),
    "**Sub-tasks:**",
    ...task.subtasks.map((s) => `- [ ] ${s.label}`),
    "",
    "**Acceptance Criteria:**",
    ...task.acceptanceCriteria.map((c) => `- [ ] ${c.label}`),
    "",
    "---",
    "Implement the task above following TDD. Write tests first, then code. Respect the target files.",
  ].join("\n");

  const doneCount =
    task.subtasks.filter((s) => s.checked).length +
    task.acceptanceCriteria.filter((c) => c.checked).length;
  const totalCount = task.subtasks.length + task.acceptanceCriteria.length;

  return (
    <div className="flex flex-col rounded-xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/20">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-white/5 px-4 pt-3 pb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="shrink-0 rounded bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-bold text-indigo-400">
              #{task.id}
            </span>
            <h3 className="truncate text-sm font-semibold text-white/85">
              {task.title}
            </h3>
          </div>
          {task.targetFiles.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
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
        </div>
        {totalCount > 0 && (
          <span className="shrink-0 text-[10px] text-white/30">
            {doneCount}/{totalCount}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 space-y-2 px-4 py-3">
        {/* Subtasks */}
        {task.subtasks.length > 0 && (
          <div className="space-y-1">
            {task.subtasks.map((st, i) => (
              <label
                key={i}
                className="flex cursor-pointer items-center gap-2 text-xs text-white/60 transition-colors hover:text-white/80"
              >
                <CheckCircle
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    st.checked ? "text-green-400" : "text-white/20",
                  )}
                />
                <span
                  className={st.checked ? "text-white/30 line-through" : ""}
                >
                  {st.label}
                </span>
              </label>
            ))}
          </div>
        )}

        {/* Acceptance Criteria */}
        {task.acceptanceCriteria.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">
              Acceptance Criteria
            </p>
            {task.acceptanceCriteria.map((ac, i) => (
              <label
                key={i}
                className="flex cursor-pointer items-center gap-2 text-xs text-white/60 transition-colors hover:text-white/80"
              >
                <CheckCircle
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    ac.checked ? "text-green-400" : "text-white/20",
                  )}
                />
                <span
                  className={ac.checked ? "text-white/30 line-through" : ""}
                >
                  {ac.label}
                </span>
              </label>
            ))}
          </div>
        )}

        {task.subtasks.length === 0 && task.acceptanceCriteria.length === 0 && (
          <p className="text-xs text-white/20 italic">
            No subtasks or criteria defined.
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 px-4 py-2">
        <CopyButton text={promptText} />
      </div>
    </div>
  );
}

export function TaskKanbanBoard({ content }: { content: string }) {
  const tasks = parseTasks(content);

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
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
