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

/** source/target の縦距離（span）。placedById が無ければ 0 扱い */
function verticalSpan(
  edge: FlowEdge,
  placedById: Map<string, PlacedNode> | undefined
): number {
  if (!placedById) return 0;
  const source = placedById.get(edge.sourceId);
  const target = placedById.get(edge.targetId);
  if (!source || !target) return 0;
  return Math.abs(target.y - source.y);
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
    // 縦距離が長いエッジほど手前（浅い高さ）で折れさせ、縦距離が短いエッジ
    // ほど奥（深い高さ）で折れさせる。逆にすると、遠い側の水平区間が
    // 近い側エッジの「ターゲットへ降りる縦区間」を横切ってしまう
    // （階段状の分岐/合流で発生）。placedById が無いときは従来通り id 順。
    const sorted = [...laned].sort((a, b) => {
      const spanDiff = verticalSpan(b, placedById) - verticalSpan(a, placedById);
      return spanDiff !== 0 ? spanDiff : a.id.localeCompare(b.id);
    });
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
