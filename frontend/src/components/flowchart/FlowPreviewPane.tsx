"use client";

import { Home } from "lucide-react";
import { memo, useRef, useState } from "react";
import type { Edge, Node } from "@xyflow/react";

import type { FlowNodeData } from "@/lib/flowchart/graph/toReactFlow";
import { cn } from "@/lib/utils";
import { FlowCanvas, type FlowCanvasHandle } from "./FlowCanvas";
import { FlowColorLegend } from "./FlowColorLegend";
import {
  fcLink,
  fcPreviewChrome,
  fcStaleCallout,
  fcStaleOverlay,
  fcStaleRing,
  fcStaleRingInset,
  fcZoomBtn,
  fcZoomOverlay,
  fcZoomPercent,
} from "./flowchartUiClasses";

type Props = {
  canvasRef: React.RefObject<FlowCanvasHandle | null>;
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  isStale: boolean;
  fullBleed: boolean;
  showColorLegend: boolean;
  onRegenerate: () => void;
};

export const FlowPreviewPane = memo(function FlowPreviewPane({
  canvasRef,
  nodes,
  edges,
  isStale,
  fullBleed,
  showColorLegend,
  onRegenerate,
}: Props) {
  const [zoomPercent, setZoomPercent] = useState(100);
  const regenerateRef = useRef(onRegenerate);
  regenerateRef.current = onRegenerate;

  return (
    <div
      className={
        fullBleed
          ? "flex min-h-0 flex-1 flex-col lg:min-h-0"
          : "flex flex-1 flex-col"
      }
    >
      {!fullBleed && (
        <div className={fcPreviewChrome}>
          {showColorLegend ? <FlowColorLegend /> : <span />}
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="縮小"
              className={fcZoomBtn}
              onClick={() => canvasRef.current?.zoomOut()}
            >
              −
            </button>
            <span
              className={fcZoomPercent}
              aria-live="polite"
              data-testid="flow-zoom-percent"
            >
              {zoomPercent}%
            </span>
            <button
              type="button"
              aria-label="拡大"
              className={fcZoomBtn}
              onClick={() => canvasRef.current?.zoomIn()}
            >
              +
            </button>
            <button
              type="button"
              aria-label="ホーム位置に戻す"
              className={fcZoomBtn}
              data-testid="flow-zoom-home"
              onClick={() => canvasRef.current?.fitView()}
            >
              <Home className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      )}
      <div
        className={cn(
          "relative flex-1",
          fullBleed ? "min-h-[280px] lg:min-h-0" : "min-h-[420px]",
          isStale && (fullBleed ? fcStaleRingInset : fcStaleRing)
        )}
      >
        <FlowCanvas
          canvasRef={canvasRef}
          nodes={nodes}
          edges={edges}
          fillContainer={fullBleed}
          onViewportZoomChange={setZoomPercent}
        />
        {isStale ? (
          <div className={fcStaleOverlay}>
            <p className={fcStaleCallout}>
              入力が変更されています。{" "}
              <button
                type="button"
                onClick={() => regenerateRef.current()}
                className={fcLink}
              >
                再生成
              </button>
              でプレビューを更新してください。
            </p>
          </div>
        ) : null}
        {fullBleed && (
          <div className={fcZoomOverlay}>
            <button
              type="button"
              aria-label="縮小"
              className={cn(fcZoomBtn, "pointer-events-auto")}
              onClick={() => canvasRef.current?.zoomOut()}
            >
              −
            </button>
            <span
              className={fcZoomPercent}
              aria-live="polite"
              data-testid="flow-zoom-percent"
            >
              {zoomPercent}%
            </span>
            <button
              type="button"
              aria-label="拡大"
              className={cn(fcZoomBtn, "pointer-events-auto")}
              onClick={() => canvasRef.current?.zoomIn()}
            >
              +
            </button>
            <button
              type="button"
              aria-label="ホーム位置に戻す"
              className={cn(fcZoomBtn, "pointer-events-auto")}
              data-testid="flow-zoom-home"
              onClick={() => canvasRef.current?.fitView()}
            >
              <Home className="size-4" aria-hidden />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
