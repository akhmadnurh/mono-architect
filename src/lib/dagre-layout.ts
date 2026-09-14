import dagre from "@dagrejs/dagre";
import type { Node, Edge } from "@xyflow/react";

const NODE_W = 180;
const NODE_H = 40;

/**
 * Run dagre auto-layout and return positioned ReactFlow nodes + edges.
 * Original node data (styles, etc.) is preserved.
 */
export function layoutGraph(
  rawNodes: { id: string; type?: string; data: Record<string, unknown> }[],
  rawEdges: {
    id: string;
    source: string;
    target: string;
    label?: string | null;
  }[],
  direction: "LR" | "TB" = "TB",
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const n of rawNodes) {
    g.setNode(n.id, { width: NODE_W, height: NODE_H });
  }
  for (const e of rawEdges) {
    g.setEdge(e.source, e.target);
  }

  dagre.layout(g);

  const nodes: Node[] = rawNodes.map((n) => {
    const pos = g.node(n.id);
    const nodeType = n.type ?? "note";
    return {
      id: n.id,
      type: "default",
      position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 },
      data: { label: (n.data.label as string) ?? n.id },
      style: {
        background: NODE_COLORS[nodeType] ?? "#94a3b8",
        color: "#fff",
        borderRadius: 8,
        padding: "8px 16px",
        fontSize: 13,
        fontWeight: 500,
        border: `1px solid ${NODE_BORDER[nodeType] ?? "rgba(255,255,255,0.1)"}`,
        boxShadow: NODE_GLOW[nodeType] ?? "none",
      },
    };
  });

  const edges: Edge[] = rawEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label ?? undefined,
    animated: true,
    style: { stroke: "url(#edge-gradient)", strokeWidth: 2 },
  }));

  return { nodes, edges };
}

const NODE_COLORS: Record<string, string> = {
  root: "#0891b2",
  feature: "#6366f1",
  module: "#a855f7",
  note: "#f59e0b",
};

const NODE_BORDER: Record<string, string> = {
  root: "rgba(6,182,212,0.5)",
  feature: "rgba(99,102,241,0.5)",
  module: "rgba(168,85,247,0.5)",
  note: "rgba(245,158,11,0.3)",
};

const NODE_GLOW: Record<string, string> = {
  root: "0 0 15px rgba(6,182,212,0.25)",
  feature: "0 0 15px rgba(99,102,241,0.25)",
  module: "0 0 15px rgba(168,85,247,0.25)",
  note: "0 0 10px rgba(245,158,11,0.15)",
};
