import type { FlowEdge, PlacedNode } from "../model/types";

/** 並列エッジ 1 本あたりの横（または縦）ずらし量 */
export const EDGE_PARALLEL_LANE_SPACING_PX = 12;

function fanoutGroupKey(e: FlowEdge): string | null {
  return `${e.sourceId}|${e.sourceSide}|${e.direction}`;
}

function mergeGroupKey(e: FlowEdge): string | null {
  return `${e.targetId}|${e.targetSide}|${e.sourceSide}|${e.direction}`;
}

/** source/target の x が揃っている（横移動が不要な）エッジか */
function isXAligned(
  edge: FlowEdge,
  placedById: Map<string, PlacedNode> | undefined
): boolean {
  if (!placedById) return false;
  const source = placedById.get(edge.sourceId);
  const target = placedById.get(edge.targetId);
  if (!source || !target) return false;
  return Math.abs(source.x - target.x) < 5;
}

function assignGroupOffsets(
  edges: FlowEdge[],
  keyFn: (e: FlowEdge) => string | null,
  placedById: Map<string, PlacedNode> | undefined
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
    // x が揃っているエッジ（横移動不要でまっすぐ本線を降りるだけ）は
    // 車線分け（横方向オフセット）の対象から除外する。これを含めてしまうと
    // 本来まっすぐで良いはずの合流エッジに不要な折れが入る。
    const laned = list.filter(
      (edge) => edge.route === "elbow" && !isXAligned(edge, placedById)
    );
    if (laned.length < 2) continue;
    const sorted = [...laned].sort((a, b) => a.id.localeCompare(b.id));
    const n = sorted.length;
    sorted.forEach((edge, index) => {
      const laneOffset = (index - (n - 1) / 2) * EDGE_PARALLEL_LANE_SPACING_PX;
      edge.pathOffset = (edge.pathOffset ?? 0) + laneOffset;
    });
  }
}

/** 同一出口・入口の並列 elbow エッジに pathOffset を付与する */
export function assignEdgePathOffsets(
  edges: FlowEdge[],
  placedById?: Map<string, PlacedNode>
): void {
  assignGroupOffsets(edges, fanoutGroupKey, placedById);
  assignGroupOffsets(edges, mergeGroupKey, placedById);
}
