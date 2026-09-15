import type { ProjectNodeTree } from "@/types/project";

/**
 * Parse PRD markdown sections 4 (Architecture Nodes) & 5 (Connections)
 * back into a ProjectNodeTree structure.
 *
 * Format expected:
 *   Section 4: `- **nodeId** (type): label`
 *   Section 5: `- \`source\` → \`target\` (optional label)`
 */
export function parsePrdToNodeTree(prdContent: string): ProjectNodeTree | null {
  const sections = extractSections(prdContent);
  const nodes = parseNodes(sections.get("4") ?? "");
  const edges = parseEdges(sections.get("5") ?? "");

  if (nodes.length === 0) return null;
  return { nodes, edges };
}

// ── Extract numbered ## sections ───────────────────────────────────

function extractSections(prd: string): Map<string, string> {
  const map = new Map<string, string>();
  const lines = prd.split("\n");
  let currentKey = "";
  const buf: string[] = [];

  for (const line of lines) {
    const m = line.match(/^##\s+(\d+)\.\s+/);
    if (m) {
      if (currentKey) map.set(currentKey, buf.join("\n"));
      currentKey = m[1];
      buf.length = 0;
    } else if (currentKey) {
      buf.push(line);
    }
  }
  if (currentKey) map.set(currentKey, buf.join("\n"));
  return map;
}

// ── Parse `- **id** (type): label` lines ───────────────────────────

function parseNodes(
  section: string,
): Array<{ id: string; type: string; data: { label: string } }> {
  const nodes: Array<{ id: string; type: string; data: { label: string } }> = [];
  for (const line of section.split("\n")) {
    const m = line.match(/^- \*\*(.+?)\*\*\s*\((.+?)\):\s*(.+)$/);
    if (m) {
      nodes.push({
        id: m[1].trim(),
        type: m[2].trim(),
        data: { label: m[3].trim() },
      });
    }
  }
  return nodes;
}

// ── Parse `- \`source\` → \`target\` (label)` lines ────────────────

function parseEdges(
  section: string,
): Array<{ id: string; source: string; target: string; label?: string }> {
  const edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
  }> = [];
  for (const line of section.split("\n")) {
    const m = line.match(
      /^- `(.+?)`\s*→\s*`(.+?)`(?:\s*\((.+?)\))?$/,
    );
    if (m) {
      edges.push({
        id: `${m[1]}-${m[2]}`,
        source: m[1].trim(),
        target: m[2].trim(),
        label: m[3]?.trim() ?? undefined,
      });
    }
  }
  return edges;
}
