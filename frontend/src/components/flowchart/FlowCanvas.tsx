"use client";

import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useStore,
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
  type KeyboardEvent,
} from "react";
import type { FlowNodeData } from "@/lib/flowchart/graph/toReactFlow";
import {
  computeHomeViewport,
  FC_HOME_VIEW,
  zoomToPercent,
} from "@/lib/flowchart/visual/flowHomeViewport";
import { flowPreviewAriaLabel } from "@/lib/flowchart/visual/flowPreviewA11y";
import { cn } from "@/lib/utils";
import {
  fcCanvasA11y,
  fcFitViewOptions,
  fcPreviewCanvasLg,
  fcPreviewCanvasMd,
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
};

const PAN_STEP = 50;

function FlowCanvasInner(
  {
    nodes,
    edges,
    fillContainer = false,
    onViewportZoomChange,
  }: FlowCanvasProps,
  ref: React.Ref<FlowCanvasHandle>
) {
  const { fitView, getViewport, setViewport, zoomIn, zoomOut } = useReactFlow();
  const width = useStore((s) => s.width);
  const height = useStore((s) => s.height);
  const nodeCount = nodes.length;
  const edgeCount = edges.length;
  const previewLabel = flowPreviewAriaLabel(nodeCount, edgeCount);

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

  useEffect(() => {
    if (nodes.length > 0 && width > 0 && height > 0) {
      const t = window.setTimeout(() => applyHomeViewport(true), 50);
      return () => window.clearTimeout(t);
    }
  }, [nodes, edges, width, height, applyHomeViewport]);

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
    <div
      data-flowchart-export-root
      data-testid="flow-preview-canvas"
      className={fillContainer ? fcPreviewCanvasLg : fcPreviewCanvasMd}
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
          <Background gap={16} size={1} color="var(--flow-border)" />
        </ReactFlow>
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
