"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/store/wizard";
import { layoutGraph } from "@/lib/dagre-layout";
import { Maximize2, Minus, Plus } from "lucide-react";

/* ── Node color legend (mirrors dagre-layout.ts) ────────────────────── */

const NODE_LEGEND = [
  { label: "Root Node", color: "#0891b2" },
  { label: "Feature Group", color: "#6366f1" },
  { label: "Sub-Module", color: "#a855f7" },
  { label: "Note / Constraint", color: "#f59e0b" },
] as const;

function MindmapLegend() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute left-3 top-3 z-10">
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 shadow-lg backdrop-blur-md">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex w-full items-center justify-between text-xs font-medium text-white/70"
        >
          <span>Legend</span>
          {collapsed ? (
            <Plus className="h-3.5 w-3.5 text-white/40" />
          ) : (
            <Minus className="h-3.5 w-3.5 text-white/40" />
          )}
        </button>
        {!collapsed && (
          <div className="mt-2 space-y-1.5">
            {NODE_LEGEND.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[11px] text-white/50">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FitViewButton() {
  const { fitView } = useReactFlow();
  return (
    <button
      onClick={() => fitView({ padding: 0.2 })}
      className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/90 text-slate-300 backdrop-blur transition-colors hover:bg-slate-800"
      title="Fit View"
    >
      <Maximize2 className="h-4 w-4" />
    </button>
  );
}

export function StepArchitecture({ embedded = false }: { embedded?: boolean }) {
  const {
    abstractIdea,
    answers,
    techStack,
    techStackMode,
    scale,
    setNodeTree,
    setTechStack,
  } = useWizardStore();
  const autoFetched = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const fetchArchitecture = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setNodes([]);
    setEdges([]);
    try {
      const res = await fetch("/api/generate/node-tree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          abstractIdea,
          answers: answers.map((a) => ({
            question: a.questionId,
            value: a.value,
          })),
          techStack: techStackMode === "ai" ? [] : techStack,
          scale,
        }),
      });
      if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);

      const text = await res.text();

      // Extract JSON from the response (handles markdown fences)
      const trimmed = text.trim();
      const fenceMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
      const raw = fenceMatch ? fenceMatch[1].trim() : trimmed;
      const jsonStart = raw.search(/[[{]/);
      if (jsonStart === -1) throw new Error("No JSON found in AI response");

      let depth = 0;
      let inStr = false;
      let esc = false;
      let jsonEnd = jsonStart;
      for (let i = jsonStart; i < raw.length; i++) {
        const ch = raw[i];
        if (esc) {
          esc = false;
          continue;
        }
        if (ch === "\\") {
          esc = true;
          continue;
        }
        if (ch === '"') {
          inStr = !inStr;
          continue;
        }
        if (inStr) continue;
        if (ch === "{" || ch === "[") depth++;
        if (ch === "}" || ch === "]") depth--;
        if (depth === 0) {
          jsonEnd = i + 1;
          break;
        }
      }

      const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd)) as {
        nodes?: Array<{
          id?: string;
          type?: string;
          data?: Record<string, unknown>;
        }>;
        edges?: Array<{
          id?: string;
          source?: string;
          target?: string;
          label?: string | null;
        }>;
        techStack?: Array<{
          category?: string;
          name?: string;
          reason?: string;
        }>;
      };

      if (!parsed.nodes?.length) throw new Error("AI returned empty node tree");

      const rawNodes = parsed.nodes
        .filter((n) => n?.id != null)
        .map((n) => ({
          id: n.id!,
          type: n.type != null ? String(n.type) : undefined,
          data: (n.data ?? {}) as Record<string, unknown>,
        }));

      const rawEdges = (parsed.edges ?? [])
        .filter((e) => e?.id != null)
        .map((e) => ({
          id: e.id!,
          source: e.source!,
          target: e.target!,
          label: e.label ?? null,
        }));

      const { nodes: laid, edges: laidEdges } = layoutGraph(rawNodes, rawEdges);
      setNodes(laid);
      setEdges(laidEdges);
      setNodeTree({ nodes: rawNodes, edges: rawEdges });

      // If AI picked tech stack, save it
      if (techStackMode === "ai" && Array.isArray(parsed.techStack)) {
        setTechStack(
          parsed.techStack
            .filter((t): t is NonNullable<typeof t> => t != null)
            .map((t) => ({
              category: String(t.category ?? ""),
              name: String(t.name ?? ""),
              reason: String(t.reason ?? ""),
            })),
        );
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [
    abstractIdea,
    answers,
    techStack,
    techStackMode,
    scale,
    setNodeTree,
    setTechStack,
    setNodes,
    setEdges,
  ]);

  // Load persisted nodeTree on mount; only call AI if nothing stored
  useEffect(() => {
    if (autoFetched.current) return;
    autoFetched.current = true;

    const saved = useWizardStore.getState().nodeTree;
    if (saved?.nodes?.length) {
      const { nodes: laid, edges: laidEdges } = layoutGraph(
        saved.nodes,
        saved.edges,
      );
      setNodes(laid);
      setEdges(laidEdges);
      return;
    }
    fetchArchitecture();
  }, [fetchArchitecture, setNodes, setEdges]);

  const handleRegenerate = () => fetchArchitecture();

  const nodeTree = useWizardStore((s) => s.nodeTree);

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header bar */}
      <div className="flex shrink-0 items-center justify-between px-4 py-2">
        <div>
          <h2 className="text-base font-medium text-white/80">
            Arsitektur Proyek
          </h2>
          <p className="text-xs text-white/40">
            Mindmap arsitektur yang dihasilkan AI.
          </p>
        </div>
        {!embedded && (
          <div className="flex items-center gap-2">
            {nodeTree && !isLoading && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                disabled={isLoading}
              >
                Regenerate Mindmap
              </Button>
            )}
            {errorMsg && !nodeTree && (
              <Button onClick={handleRegenerate} disabled={isLoading}>
                Coba Lagi
              </Button>
            )}
            {nodeTree && !isLoading && (
              <Button onClick={() => useWizardStore.getState().nextStep()}>
                Lanjut →
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ReactFlow canvas fills remaining space */}
      <div className="relative flex-1 overflow-hidden">
        {nodeTree && !isLoading && nodes.length > 0 ? (
          <>
            <MindmapLegend />
            <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              attributionPosition="bottom-left"
            >
              <svg style={{ position: "absolute", width: 0, height: 0 }}>
                <defs>
                  <linearGradient
                    id="edge-gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.6} />
                    <stop offset="50%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </svg>
              <Background gap={16} size={1} />
              <div className="react-flow__controls-wrapper">
                <Controls className="react-flow__controls-dark" />
              </div>
              <FitViewButton />
              <MiniMap
                nodeColor={(n) => {
                  const bg = n.style?.background;
                  return typeof bg === "string" ? bg : "#94a3b8";
                }}
              />
            </ReactFlow>
          </ReactFlowProvider>
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-white/40">
              {isLoading ? (
                <>
                  <div className="h-4 w-48 animate-pulse rounded bg-white/5" />
                  <div className="h-4 w-36 animate-pulse rounded bg-white/5" />
                  <div className="h-4 w-44 animate-pulse rounded bg-white/5" />
                  <p className="text-sm mt-2">Sedang membuat diagram…</p>
                </>
              ) : errorMsg ? (
                <p className="text-sm text-destructive">{errorMsg}</p>
              ) : (
                <p>Menyiapkan arsitektur…</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
