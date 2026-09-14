"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Markdown from "react-markdown";
import { cn } from "cn";
import { FileText, Save } from "lucide-react";

type DocTab = "prd" | "tasks" | "agents";

const TABS: { key: DocTab; label: string }[] = [
  { key: "prd", label: "PRD" },
  { key: "tasks", label: "TASKS" },
  { key: "agents", label: "AGENTS" },
];

interface PrdEditorProps {
  projectId: string;
  initialContent?: string;
  externalContent?: string | null;
}

export function PrdEditor({
  projectId,
  initialContent = "",
  externalContent,
}: PrdEditorProps) {
  const [activeTab, setActiveTab] = useState<DocTab>("prd");
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Apply external content from AI refiner
  useEffect(() => {
    if (externalContent !== null && externalContent !== undefined) {
      setContent(externalContent);
    }
  }, [externalContent]);

  // Fetch content when tab changes
  useEffect(() => {
    if (activeTab !== "prd") {
      // For TASKS.md and AGENTS.md, fetch from a generic endpoint or show placeholder
      setContent(
        `# ${activeTab.toUpperCase()} Editor\n\nComing soon — direct file editing.`,
      );
      return;
    }
    let cancelled = false;
    fetch(`/api/projects/${projectId}/prd`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.content !== undefined) setContent(data.content);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [activeTab, projectId]);

  // Debounced auto-save
  const debouncedSave = useCallback(
    (value: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setSaving(true);
        fetch(`/api/projects/${projectId}/prd`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: value }),
        }).finally(() => setSaving(false));
      }, 800);
    },
    [projectId],
  );

  const handleChange = (value: string) => {
    setContent(value);
    if (activeTab === "prd") debouncedSave(value);
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-white/10 bg-white/[0.02] px-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-xs font-medium transition-colors",
              activeTab === t.key
                ? "border-b-2 border-indigo-500 bg-white/5 text-white"
                : "text-white/40 hover:text-white/60",
            )}
          >
            <FileText className="h-3 w-3" />
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5 pr-2 text-[11px] text-white/30">
          <Save className="h-3 w-3" />
          {saving ? "Menyimpan..." : "Tersimpan"}
        </div>
      </div>

      {/* Split pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Editor */}
        <div className="flex w-1/2 flex-col border-r border-white/10">
          <textarea
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            spellCheck={false}
            className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm text-white/80 outline-none placeholder:text-white/20"
            placeholder="Tulis konten markdown di sini..."
          />
        </div>

        {/* Right: Preview */}
        <div className="w-1/2 overflow-y-auto p-4">
          <div className="prose prose-invert prose-sm max-w-none">
            {content ? (
              <Markdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="mb-4 text-2xl font-bold text-white/90">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mb-3 mt-6 text-lg font-semibold text-white/85">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mb-2 mt-4 text-base font-medium text-white/80">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-3 text-sm leading-relaxed text-white/60">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-3 list-disc pl-5 text-sm text-white/60">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-3 list-decimal pl-5 text-sm text-white/60">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  code: ({ children, className }) => (
                    <code
                      className={cn(
                        "rounded bg-white/10 px-1.5 py-0.5 text-xs text-indigo-300",
                        className,
                      )}
                    >
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="mb-3 overflow-x-auto rounded-lg bg-white/5 p-3 text-xs text-white/70">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="mb-3 border-l-2 border-indigo-500/40 pl-4 text-sm italic text-white/50">
                      {children}
                    </blockquote>
                  ),
                  hr: () => <hr className="my-6 border-white/10" />,
                  strong: ({ children }) => (
                    <strong className="font-semibold text-white/80">
                      {children}
                    </strong>
                  ),
                }}
              >
                {content}
              </Markdown>
            ) : (
              <p className="text-sm text-white/20 italic">
                Mulai menulis untuk melihat preview...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
