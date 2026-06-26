import type { FlowEdge } from "../model/types";

/** 並列エッジ 1 本あたりの横（または縦）ずらし量 */
export const EDGE_PARALLEL_LANE_SPACING_PX = 12;

function fanoutGroupKey(e: FlowEdge): string | null {
  return `${e.sourceId}|${e.sourceSide}|${e.direction}`;
}

function mergeGroupKey(e: FlowEdge): string | null {
  return `${e.targetId}|${e.targetSide}|${e.sourceSide}|${e.direction}`;
}

function assignGroupOffsets(
  edges: FlowEdge[],
  keyFn: (e: FlowEdge) => string | null
): void {
  const groups = new Map<string, FlowEdge[]>();
  for (const edge of edges) {
    const key = keyFn(edge);
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(edge);
    groups.set(key, list);
  }

  for (const list of groups.values()) {
    if (list.length < 2) continue;
    const sorted = [...list].sort((a, b) => a.id.localeCompare(b.id));
    const n = sorted.length;
    sorted.forEach((edge, index) => {
      if (edge.route !== "elbow") return;
      const laneOffset = (index - (n - 1) / 2) * EDGE_PARALLEL_LANE_SPACING_PX;
      edge.pathOffset = (edge.pathOffset ?? 0) + laneOffset;
    });
  }
}

/** 同一出口・入口の並列 elbow エッジに pathOffset を付与する */
export function assignEdgePathOffsets(edges: FlowEdge[]): void {
  assignGroupOffsets(edges, fanoutGroupKey);
  assignGroupOffsets(edges, mergeGroupKey);
}
