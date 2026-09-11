"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import type { ProjectScale, TechStackItem } from "@/types/project";

const NODE_COLORS: Record<string, string> = {
  root: "#6366f1",
  feature: "#3b82f6",
  module: "#22c55e",
  note: "#f59e0b",
};

function toRFNodes(
  nodes: {
    id: string;
    type?: string;
    position: { x: number; y: number };
    data: Record<string, unknown>;
  }[],
): Node[] {
  return nodes.map((n) => ({
    id: n.id,
    position: n.position,
    data: { label: (n.data.label as string) ?? n.id },
    type: "default",
    style: {
      background: NODE_COLORS[n.type ?? "note"] ?? "#94a3b8",
      color: "#fff",
      borderRadius: 8,
      padding: "8px 16px",
      fontSize: 13,
      fontWeight: 500,
    },
  }));
}

function toRFEdges(
  edges: { id: string; source: string; target: string; label?: string }[],
): Edge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: true,
    style: { stroke: "#94a3b8" },
  }));
}

export function StepArchitecture() {
  const {
    abstractIdea,
    answers,
    techStack,
    scale,
    nodeTree,
    setNodeTree,
    prevStep,
  } = useWizardStore();
  const [loading, setLoading] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
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
          techStack,
          scale,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const tree = await res.json();
      setNodeTree(tree);
    } catch (err) {
      console.error("Failed to generate node tree:", err);
    } finally {
      setLoading(false);
    }
  }, [abstractIdea, answers, techStack, scale, setNodeTree]);

  useEffect(() => {
    if (nodeTree) {
      setNodes(toRFNodes(nodeTree.nodes));
      setEdges(toRFEdges(nodeTree.edges));
    }
  }, [nodeTree, setNodes, setEdges]);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Arsitektur Proyek</CardTitle>
          <p className="text-sm text-muted-foreground">
            Mindmap arsitektur yang dihasilkan AI.
          </p>
        </div>
        {!nodeTree && (
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Menghasilkan arsitektur…" : "Generate Arsitektur"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {nodeTree ? (
          <div className="h-[500px] rounded-lg border">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              attributionPosition="bottom-left"
            >
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
          <div className="flex h-[500px] items-center justify-center rounded-lg border border-dashed text-muted-foreground">
            {loading ? "Sedang membuat diagram…" : "Klik tombol untuk generate"}
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={prevStep}>
            ← Kembali
          </Button>
          {nodeTree && (
            <Button onClick={() => useWizardStore.getState().nextStep()}>
              Lanjut →
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
