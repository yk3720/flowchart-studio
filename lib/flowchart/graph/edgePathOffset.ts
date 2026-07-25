import { Position } from "@xyflow/react";

/** ソース直下で早めに折れて縦走させるための余白（px）。既定 gapV(=30) より小さく保つ */
const FORWARD_DOWN_BEND_MARGIN_PX = 18;

/** getSmoothStepPath の centerX / centerY 上書き（並列エッジのバス分離） */
export function smoothStepCenterWithPathOffset(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourcePosition: Position,
  targetPosition: Position,
  pathOffset: number
): { centerX?: number; centerY?: number } {
  if (sourcePosition === Position.Bottom && targetPosition === Position.Top) {
    // 中点で曲げると複数段をまたぐ接続先(下)が途中の段のノードを貫通するため、
    // ソース直後（次段の手前）で早めに折れてターゲット列を縦走させる。
    const bendMargin = Math.min(
      FORWARD_DOWN_BEND_MARGIN_PX,
      (targetY - sourceY) * 0.4
    );
    // 同じソースから複数本が近い高さで折れると、途中まで完全に重なって
    // 1本の太い線に見える（車線の横ずらしだけでは分離しきれない）。
    // 折れる高さ自体も pathOffset に応じてわずかにずらし、重なりを避ける。
    return {
      centerX: (sourceX + targetX) / 2 + pathOffset,
      centerY: sourceY + bendMargin + pathOffset,
    };
  }

  if (pathOffset === 0) return {};

  if (sourcePosition === Position.Right && targetPosition === Position.Top) {
    return { centerY: (sourceY + targetY) / 2 + pathOffset };
  }
  if (
    sourcePosition === Position.Bottom &&
    (targetPosition === Position.Left || targetPosition === Position.Right)
  ) {
    return { centerY: (sourceY + targetY) / 2 + pathOffset };
  }
  if (sourcePosition === Position.Right && targetPosition === Position.Right) {
    return { centerY: (sourceY + targetY) / 2 + pathOffset };
  }

  return { centerX: (sourceX + targetX) / 2 + pathOffset };
}
