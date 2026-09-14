import { isDecisionType, isOvalType } from "../model/normalizeShapeType";
import type {
  Bounds,
  FlowNode,
  LayoutConfig,
  PlacedNode,
  ShapeKind,
} from "../model/types";

/**
 * 段（tier）をまたいで列（level）が変わる接続がある場合にだけ使う、その段の
 * 直後の最小垂直マージン(px)。config.gapV がこれより小さければこちらを使う。
 * ここを変えると、保存済みドキュメント（layout.gapV が既定値のまま）も含めて
 * 次回生成時に即座に反映される。
 *
 * 目的: 接続先(下)が別の列（＝横に大きくオフセットする弧、buildEdges の
 * forwardDown 分岐）になる場合、段間が狭いと react-flow の getSmoothStepPath が
 * 角を1つの丸めで描けず「くの字」の二重の折れになる。同じ列にまっすぐ繋ぐだけの
 * 1対1接続にはこのマージンは不要なため、その段の直後には適用しない。
 *
 * 元に戻す場合は DEFAULT_LAYOUT.gapV（types.ts）と同じ値に戻す。
 */
export const MIN_TIER_GAP_V = 45;

/** 接続先(下)が別列になる段（＝直後に MIN_TIER_GAP_V を要する段）の集合 */
function tiersNeedingWideGap(rowMap: Map<number, FlowNode[]>): Set<number> {
  const allNodes: FlowNode[] = [];
  for (const nodes of rowMap.values()) allNodes.push(...nodes);
  const byId = new Map(allNodes.map((n) => [n.id, n]));

  const wide = new Set<number>();
  for (const n of allNodes) {
    const tier = n.tier ?? n.rowIndex;
    for (const did of n.destsDown) {
      const target = byId.get(did);
      if (!target) continue;
      const targetTier = target.tier ?? target.rowIndex;
      if (targetTier > tier && target.level !== n.level) {
        wide.add(tier);
      }
    }
  }
  return wide;
}

function shapeKindFor(type: FlowNode["type"]): ShapeKind {
  if (type === "判断") return "diamond";
  if (type === "〇") return "oval";
  if (type === "端子") return "rounded";
  if (type === "入出力") return "parallelogram";
  if (type === "手動入力") return "manual";
  return "rectangle";
}

export function layoutGrid(
  rowMap: Map<number, FlowNode[]>,
  rowHeights: Record<number, number>,
  config: LayoutConfig
): { placed: PlacedNode[]; bounds: Bounds } {
  const placed: PlacedNode[] = [];
  const lefts: number[] = [];
  const tops: number[] = [];
  const rights: number[] = [];
  const bottoms: number[] = [];

  // ADR-012: 9 列（段 + 列）対応
  // - 9 列では n.tier（段）が Y の正本になる（同じ段 = 同じ高さ）
  // - 8 列以下は従来どおり rowIndex（表行）を段の代わりに使う
  type TierBucket = {
    tier: number;
    nodes: FlowNode[];
    height: number;
  };
  const tierMap = new Map<number, TierBucket>();
  for (const ri of rowMap.keys()) {
    for (const n of rowMap.get(ri) ?? []) {
      const tier = n.tier ?? ri;
      const bucket = tierMap.get(tier) ?? {
        tier,
        nodes: [],
        height: 0,
      };
      bucket.nodes.push(n);
      bucket.height = Math.max(
        bucket.height,
        rowHeights[ri] ?? config.heightMin
      );
      tierMap.set(tier, bucket);
    }
  }

  const wideGapAfterTier = tiersNeedingWideGap(rowMap);
  let currentTop = config.baseTop;
  let lastTier: number | null = null;

  for (const tier of [...tierMap.keys()].sort((a, b) => a - b)) {
    const bucket = tierMap.get(tier);
    if (!bucket) continue;
    if (lastTier !== null) {
      const prev = tierMap.get(lastTier);
      const gapV = wideGapAfterTier.has(lastTier)
        ? Math.max(config.gapV, MIN_TIER_GAP_V)
        : config.gapV;
      currentTop += (prev?.height ?? config.heightMin) + gapV;
    }

    for (const n of bucket.nodes.sort(
      (a, b) => a.level - b.level || a.id.localeCompare(b.id)
    )) {
      const cellLeft = config.baseLeft + n.level * (config.width + config.gapH);
      const rowH = bucket.height || config.heightMin;
      const isDiamond = isDecisionType(n.type);
      const isOval = isOvalType(n.type);
      let width = config.width;
      let shpH = isDiamond ? rowH * 1.3 : rowH;
      let leftPos = cellLeft;
      let top = currentTop;
      if (isOval) {
        width = Math.min(config.width, rowH);
        shpH = width;
        leftPos = cellLeft + (config.width - width) / 2;
      } else if (isDiamond) {
        top = currentTop - (shpH - rowH) / 2;
      }

      const node: PlacedNode = {
        ...n,
        x: leftPos,
        y: top,
        width,
        height: shpH,
        shapeKind: shapeKindFor(n.type),
      };
      placed.push(node);
      lefts.push(leftPos);
      tops.push(top);
      rights.push(leftPos + width);
      bottoms.push(top + shpH);
    }
    lastTier = tier;
  }

  const bounds: Bounds =
    lefts.length > 0
      ? {
          left: lefts.reduce((a, b) => Math.min(a, b), Infinity),
          top: tops.reduce((a, b) => Math.min(a, b), Infinity),
          right: rights.reduce((a, b) => Math.max(a, b), -Infinity),
          bottom: bottoms.reduce((a, b) => Math.max(a, b), -Infinity),
        }
      : { left: 0, top: 0, right: 0, bottom: 0 };

  return { placed, bounds };
}
