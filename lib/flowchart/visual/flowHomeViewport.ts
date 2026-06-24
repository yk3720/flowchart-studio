import { getNodesBounds, type Node } from "@xyflow/react";

export type FlowViewport = { x: number; y: number; zoom: number };

/** 動作切替・ホームボタン用 — 横フィット + 上段揃え（開始ノードが切れない） */
export const FC_HOME_VIEW = {
  topPad: 40,
  sidePad: 40,
  minZoom: 0.25,
  maxZoom: 1.25,
  animateMs: 200,
} as const;

export function zoomToPercent(zoom: number): number {
  return Math.round(zoom * 100);
}

export function computeHomeViewport(
  nodes: Node[],
  width: number,
  height: number,
  opts: {
    topPad?: number;
    sidePad?: number;
    minZoom?: number;
    maxZoom?: number;
  } = {}
): FlowViewport | null {
  if (nodes.length === 0 || width <= 0 || height <= 0) return null;

  const topPad = opts.topPad ?? FC_HOME_VIEW.topPad;
  const sidePad = opts.sidePad ?? FC_HOME_VIEW.sidePad;
  const minZoom = opts.minZoom ?? FC_HOME_VIEW.minZoom;
  const maxZoom = opts.maxZoom ?? FC_HOME_VIEW.maxZoom;

  const bounds = getNodesBounds(nodes);
  if (bounds.width <= 0 || bounds.height <= 0) return null;

  const zoom = Math.min(
    Math.max((width - sidePad * 2) / bounds.width, minZoom),
    maxZoom
  );
  const x = (width - bounds.width * zoom) / 2 - bounds.x * zoom;
  const y = topPad - bounds.y * zoom;

  return { x, y, zoom };
}
