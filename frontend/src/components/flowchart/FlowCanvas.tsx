"use client";

import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useStore,
  useViewport,
  type Edge,
  type Node,
  type Viewport,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type KeyboardEvent,
} from "react";
import type { FlowNodeData } from "@/lib/flowchart/graph/toReactFlow";
import { computeRulerSegments } from "@/lib/flowchart/graph/rulerSegments";
import {
  computeHomeViewport,
  FC_HOME_VIEW,
  zoomToPercent,
} from "@/lib/flowchart/visual/flowHomeViewport";
import { flowPreviewAriaLabel } from "@/lib/flowchart/visual/flowPreviewA11y";
import { cn } from "@/lib/utils";
import {
  FC_RULER_SIZE,
  fcBorderB,
  fcBorderR,
  fcCanvasA11y,
  fcFitViewOptions,
  fcPreviewCanvasLg,
  fcPreviewCanvasMd,
  fcRulerCell,
  fcRulerCorner,
  fcRulerTrack,
} from "./flowchartUiClasses";
import { flowEdgeTypes, flowNodeTypes } from "./flowTypes";

export type FlowCanvasHandle = {
  /** ホーム位置（上段・横フィット）へ戻す */
  fitView: () => void;
  /** PNG/SVG — 全体が収まる従来のセンター fit */
  fitViewFull: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  getZoomPercent: () => number;
  getExportElement: () => HTMLElement | null;
};

type FlowCanvasProps = {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  /** workspace プレビュー列: 縦いっぱい・左ボーダーのみ */
  fillContainer?: boolean;
  onViewportZoomChange?: (percent: number) => void;
  /** nodes/edges 変更時にビューポートを自動リセットするか（デフォルト true） */
  autoFitView?: boolean;
};

const PAN_STEP = 50;

function FlowCanvasInner(
  {
    nodes,
    edges,
    fillContainer = false,
    onViewportZoomChange,
    autoFitView = true,
  }: FlowCanvasProps,
  ref: React.Ref<FlowCanvasHandle>
) {
  const { fitView, getViewport, setViewport, zoomIn, zoomOut } = useReactFlow();
  const width = useStore((s) => s.width);
  const height = useStore((s) => s.height);
  const nodeCount = nodes.length;
  const edgeCount = edges.length;
  const previewLabel = flowPreviewAriaLabel(nodeCount, edgeCount);

  const { x: viewportX, y: viewportY, zoom: viewportZoom } = useViewport();
  const colSegments = useMemo(
    () =>
      computeRulerSegments(
        nodes,
        (n) => n.data.level,
        (n) => n.position.x,
        (n) => n.width ?? 0
      ),
    [nodes]
  );
  const rowSegments = useMemo(
    () =>
      computeRulerSegments(
        nodes,
        (n) => n.data.tier,
        (n) => n.position.y,
        (n) => n.height ?? 0
      ),
    [nodes]
  );

  const applyHomeViewport = useCallback(
    (animated = true) => {
      const viewport = computeHomeViewport(nodes, width, height);
      if (!viewport) return;
      void setViewport(viewport, {
        duration: animated ? FC_HOME_VIEW.animateMs : 0,
      });
      onViewportZoomChange?.(zoomToPercent(viewport.zoom));
    },
    [nodes, width, height, setViewport, onViewportZoomChange]
  );

  const handleViewportChange = useCallback(
    (viewport: Viewport) => {
      onViewportZoomChange?.(zoomToPercent(viewport.zoom));
    },
    [onViewportZoomChange]
  );

  useImperativeHandle(
    ref,
    () => ({
      fitView: () => applyHomeViewport(true),
      fitViewFull: () => {
        void fitView(fcFitViewOptions(nodeCount));
      },
      zoomIn: () => zoomIn(),
      zoomOut: () => zoomOut(),
      getZoomPercent: () => zoomToPercent(getViewport().zoom),
      getExportElement: () =>
        document.querySelector("[data-flowchart-export-root]"),
    }),
    [applyHomeViewport, fitView, nodeCount, zoomIn, zoomOut, getViewport]
  );

  const isInitialFit = useRef(true);
  useEffect(() => {
    if (nodes.length > 0 && width > 0 && height > 0) {
      if (!autoFitView && !isInitialFit.current) return;
      isInitialFit.current = false;
      const t = window.setTimeout(() => applyHomeViewport(true), 50);
      return () => window.clearTimeout(t);
    }
  }, [nodes, edges, width, height, applyHomeViewport, autoFitView]);

  const defaultEdgeOptions = useMemo(
    () => ({
      type: "labeled" as const,
    }),
    []
  );

  const handlePanZoomKey = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.closest(".react-flow__controls button")) return;

      switch (e.key) {
        case "ArrowLeft": {
          e.preventDefault();
          const v = getViewport();
          setViewport({ x: v.x + PAN_STEP, y: v.y, zoom: v.zoom });
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          const v = getViewport();
          setViewport({ x: v.x - PAN_STEP, y: v.y, zoom: v.zoom });
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const v = getViewport();
          setViewport({ x: v.x, y: v.y + PAN_STEP, zoom: v.zoom });
          break;
        }
        case "ArrowDown": {
          e.preventDefault();
          const v = getViewport();
          setViewport({ x: v.x, y: v.y - PAN_STEP, zoom: v.zoom });
          break;
        }
        case "+":
        case "=":
          e.preventDefault();
          zoomIn();
          break;
        case "-":
        case "_":
          e.preventDefault();
          zoomOut();
          break;
        case "0":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            applyHomeViewport(true);
          }
          break;
        default:
          break;
      }
    },
    [applyHomeViewport, getViewport, setViewport, zoomIn, zoomOut]
  );

  return (
    <div className={fillContainer ? fcPreviewCanvasLg : fcPreviewCanvasMd}>
      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `${FC_RULER_SIZE}px 1fr`,
          gridTemplateRows: `${FC_RULER_SIZE}px 1fr`,
        }}
      >
        <div className={fcRulerCorner} aria-hidden="true" />
        <div className={cn(fcRulerTrack, fcBorderB)} aria-hidden="true">
          {colSegments.map((seg) => (
            <div
              key={seg.key}
              className={cn(
                fcRulerCell,
                "top-0 h-full border-r border-flow-border/60"
              )}
              style={{
                left: viewportX + seg.start * viewportZoom,
                width: Math.max(1, seg.size * viewportZoom),
              }}
            >
              {seg.index}
            </div>
          ))}
        </div>
        <div className={cn(fcRulerTrack, fcBorderR)} aria-hidden="true">
          {rowSegments.map((seg) => (
            <div
              key={seg.key}
              className={cn(
                fcRulerCell,
                "left-0 w-full border-b border-flow-border/60"
              )}
              style={{
                top: viewportY + seg.start * viewportZoom,
                height: Math.max(1, seg.size * viewportZoom),
              }}
            >
              {seg.index}
            </div>
          ))}
        </div>
        <div
          data-flowchart-export-root
          data-testid="flow-preview-canvas"
          className="relative h-full w-full"
        >
          <div
            role="group"
            aria-label={previewLabel}
            tabIndex={0}
            onKeyDown={handlePanZoomKey}
            className={cn(fcCanvasA11y, "h-full w-full")}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={flowNodeTypes}
              edgeTypes={flowEdgeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              edgesReconnectable={false}
              panOnDrag
              zoomOnScroll
              onViewportChange={handleViewportChange}
              proOptions={{ hideAttribution: true }}
            >
              <Background
                gap={16}
                size={1.5}
                color="var(--flow-border-strong)"
              />
            </ReactFlow>
          </div>
        </div>
      </div>
    </div>
  );
}

const FlowCanvasWithRef = memo(forwardRef(FlowCanvasInner));

export function FlowCanvas(
  props: FlowCanvasProps & { canvasRef?: React.Ref<FlowCanvasHandle> }
) {
  const { canvasRef, ...rest } = props;
  return (
    <ReactFlowProvider>
      <FlowCanvasWithRef ref={canvasRef} {...rest} />
    </ReactFlowProvider>
  );
}
