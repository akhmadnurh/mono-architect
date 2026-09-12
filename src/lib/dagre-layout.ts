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
  rawEdges: { id: string; source: string; target: string; label?: string | null }[],
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
    return {
      id: n.id,
      type: "default",
      position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 },
      data: { label: (n.data.label as string) ?? n.id },
      style: {
        background: NODE_COLORS[n.type ?? "note"] ?? "#94a3b8",
        color: "#fff",
        borderRadius: 8,
        padding: "8px 16px",
        fontSize: 13,
        fontWeight: 500,
      },
    };
  });

  const edges: Edge[] = rawEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label ?? undefined,
    animated: true,
    style: { stroke: "#94a3b8" },
  }));

  return { nodes, edges };
}

const NODE_COLORS: Record<string, string> = {
  root: "#6366f1",
  feature: "#3b82f6",
  module: "#22c55e",
  note: "#f59e0b",
};
