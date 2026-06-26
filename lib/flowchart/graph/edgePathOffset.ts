import { Position } from "@xyflow/react";

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
  if (pathOffset === 0) return {};

  if (sourcePosition === Position.Bottom && targetPosition === Position.Top) {
    return { centerX: (sourceX + targetX) / 2 + pathOffset };
  }
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
