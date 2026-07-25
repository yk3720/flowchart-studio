import { describe, expect, it } from "vitest";
import {
  assignEdgePathOffsets,
  EDGE_PARALLEL_LANE_SPACING_PX,
} from "./assignEdgePathOffsets";
import type { FlowEdge, PlacedNode } from "../model/types";

function placedAt(id: string, x: number): PlacedNode {
  return {
    id,
    type: "処理",
    fullText: "",
    destsDown: [],
    destsRight: [],
    level: 0,
    rowIndex: 0,
    x,
    y: 0,
    width: 160,
    height: 60,
    shapeKind: "rectangle",
  };
}

function edge(partial: Partial<FlowEdge> & Pick<FlowEdge, "id">): FlowEdge {
  return {
    sourceId: "s",
    targetId: "t",
    direction: "down",
    sourceSide: "bottom",
    targetSide: "top",
    route: "elbow",
    ...partial,
  };
}

describe("assignEdgePathOffsets", () => {
  it("offsets parallel fan-out edges from the same source", () => {
    const edges: FlowEdge[] = [
      edge({ id: "e-0", sourceId: "2", targetId: "3" }),
      edge({ id: "e-1", sourceId: "2", targetId: "4" }),
      edge({ id: "e-2", sourceId: "2", targetId: "5" }),
    ];
    assignEdgePathOffsets(edges);
    expect(edges.map((e) => e.pathOffset).sort((a, b) => a! - b!)).toEqual([
      -EDGE_PARALLEL_LANE_SPACING_PX,
      0,
      EDGE_PARALLEL_LANE_SPACING_PX,
    ]);
  });

  it("offsets parallel merge edges into the same target", () => {
    const edges: FlowEdge[] = [
      edge({ id: "e-0", sourceId: "3", targetId: "6" }),
      edge({ id: "e-1", sourceId: "4", targetId: "6" }),
      edge({ id: "e-2", sourceId: "5", targetId: "6" }),
    ];
    assignEdgePathOffsets(edges);
    expect(edges.map((e) => e.pathOffset).sort((a, b) => a! - b!)).toEqual([
      -EDGE_PARALLEL_LANE_SPACING_PX,
      0,
      EDGE_PARALLEL_LANE_SPACING_PX,
    ]);
  });

  it("skips straight edges and single-edge groups", () => {
    const edges: FlowEdge[] = [
      edge({ id: "e-0", route: "straight" }),
      edge({ id: "e-1", sourceId: "1", targetId: "2" }),
    ];
    assignEdgePathOffsets(edges);
    expect(edges.every((e) => e.pathOffset === undefined)).toBe(true);
  });

  it("keeps an x-aligned merge edge straight and offsets only the angled siblings", () => {
    const edges: FlowEdge[] = [
      edge({ id: "e-0", sourceId: "3", targetId: "6" }),
      edge({ id: "e-1", sourceId: "4", targetId: "6" }),
      edge({ id: "e-2", sourceId: "5", targetId: "6" }),
    ];
    const placedById = new Map([
      ["3", placedAt("3", 40)],
      ["4", placedAt("4", 300)],
      ["5", placedAt("5", 560)],
      ["6", placedAt("6", 40)],
    ]);
    assignEdgePathOffsets(edges, placedById);
    const bySource = new Map(edges.map((e) => [e.sourceId, e.pathOffset]));
    expect(bySource.get("3")).toBeUndefined();
    expect([bySource.get("4"), bySource.get("5")].sort((a, b) => a! - b!)).toEqual([
      -EDGE_PARALLEL_LANE_SPACING_PX / 2,
      EDGE_PARALLEL_LANE_SPACING_PX / 2,
    ]);
  });
});
