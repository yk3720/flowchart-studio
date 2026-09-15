import { isDecisionType } from "../model/normalizeShapeType";
import { assignEdgePathOffsets } from "./assignEdgePathOffsets";
import type {
  ConnectorSite,
  FlowEdge,
  FlowNode,
  PlacedNode,
} from "../model/types";

function labelForDecision(
  source: FlowNode,
  direction: "down" | "right"
): "Yes" | "No" | undefined {
  if (!isDecisionType(source.type)) return undefined;
  return direction === "down" ? "Yes" : "No";
}

export function nodeTier(n: FlowNode): number {
  return n.tier ?? n.rowIndex;
}

export function buildEdges(
  nodes: FlowNode[],
  placed: PlacedNode[]
): FlowEdge[] {
  const placedById = new Map(placed.map((p) => [p.id, p]));
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const edges: FlowEdge[] = [];
  let edgeIndex = 0;

  const inboundDownCount = new Map<string, number>();
  for (const n of nodes) {
    for (const did of n.destsDown) {
      inboundDownCount.set(did, (inboundDownCount.get(did) ?? 0) + 1);
    }
  }

  for (const n of nodes) {
    const source = placedById.get(n.id);
    if (!source) continue;

    for (const [direction, dests] of [
      ["down", n.destsDown] as const,
      ["right", n.destsRight] as const,
    ]) {
      for (const did of dests) {
        const target = placedById.get(did);
        const tNode = nodeById.get(did);
        if (!target || !tNode) continue;

        const isLoop = nodeTier(tNode) < nodeTier(n);
        const levelDiff = tNode.level - n.level;
        const tierDiff = nodeTier(tNode) - nodeTier(n);
        const isMerge =
          direction === "down" && (inboundDownCount.get(did) ?? 0) > 1;
        const forwardDown = direction === "down" && tierDiff > 0;

        let sourceSide: ConnectorSite = "bottom";
        let targetSide: ConnectorSite = "top";
        let route: "straight" | "elbow" = "straight";

        if (direction === "down") {
          if (forwardDown) {
            // 接続先(下) · 先が下段 — top-to-bottom 慣例（合流も top 入口）
            sourceSide = "bottom";
            targetSide = "top";
            route =
              Math.abs(source.x - target.x) < 5 && !isMerge
                ? "straight"
                : "elbow";
          } else {
            // ループ（上へ戻る）— source=right / target=left 固定
            // （本線は bottom→top を使うため、ここで top に入ると重なる。
            //   ノードには source 側 bottom/right・target 側 top/left の 4 ハンドルしかなく、
            //   right は target ハンドルとして使えないため target 側の逃げ場は left のみ）
            route = "elbow";
            sourceSide = "right";
            targetSide = "left";
          }
        } else {
          sourceSide = "right";
          targetSide = "top";
          route = "elbow";
          if (levelDiff === 0 && isLoop) targetSide = "left";
          else if (levelDiff < 0) targetSide = "left";
        }

        edges.push({
          id: `e-${edgeIndex++}`,
          sourceId: n.id,
          targetId: did,
          direction,
          sourceSide,
          targetSide,
          route,
          label: labelForDecision(n, direction),
        });
      }
    }
  }

  assignEdgePathOffsets(edges, placedById);
  return edges;
}
