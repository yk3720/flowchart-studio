import { describe, expect, it } from "vitest";
import {
  assignEdgePathOffsets,
  EDGE_PARALLEL_LANE_SPACING_PX,
} from "./assignEdgePathOffsets";
import type { FlowEdge } from "../model/types";

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
});
