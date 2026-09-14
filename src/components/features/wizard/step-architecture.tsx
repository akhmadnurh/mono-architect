"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/store/wizard";
import { layoutGraph } from "@/lib/dagre-layout";

export function StepArchitecture() {
  const {
    abstractIdea,
    answers,
    techStack,
    techStackMode,
    scale,
    setNodeTree,
    setTechStack,
    prevStep,
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

  // Auto-trigger on mount (run once via ref guard)
  useEffect(() => {
    if (autoFetched.current) return;
    autoFetched.current = true;
    fetchArchitecture();
  }, [fetchArchitecture]);

  const handleRegenerate = () => fetchArchitecture();

  const nodeTree = useWizardStore((s) => s.nodeTree);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Arsitektur Proyek</CardTitle>
          <p className="text-sm text-muted-foreground">
            Mindmap arsitektur yang dihasilkan AI.
          </p>
        </div>
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
      </CardHeader>
      <CardContent>
        {nodeTree && !isLoading && nodes.length > 0 ? (
          <div className="h-[500px] rounded-lg border">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              attributionPosition="bottom-left"
            >
              {/* Edge gradient definition */}
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
              <Controls />
              <MiniMap
                nodeColor={(n) => {
                  const bg = n.style?.background;
                  return typeof bg === "string" ? bg : "#94a3b8";
                }}
              />
            </ReactFlow>
          </div>
        ) : (
          <div className="flex h-[500px] items-center justify-center rounded-lg border border-dashed">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              {isLoading ? (
                <>
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-44 animate-pulse rounded bg-muted" />
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

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={prevStep}>
            ← Kembali
          </Button>
          {nodeTree && !isLoading && (
            <Button onClick={() => useWizardStore.getState().nextStep()}>
              Lanjut →
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
