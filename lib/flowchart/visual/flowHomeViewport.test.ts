import type { Node } from "@xyflow/react";
import { describe, expect, it } from "vitest";

import { computeHomeViewport, zoomToPercent } from "./flowHomeViewport";

const sampleNodes: Node[] = [
  {
    id: "a",
    position: { x: 100, y: 200 },
    data: { label: "開始" },
    width: 120,
    height: 48,
  },
  {
    id: "b",
    position: { x: 100, y: 300 },
    data: { label: "処理" },
    width: 120,
    height: 48,
  },
];

describe("computeHomeViewport", () => {
  it("上段に揃え、開始ノードが viewport 上端より下に来る", () => {
    const vp = computeHomeViewport(sampleNodes, 800, 600);
    expect(vp).not.toBeNull();
    const topScreenY = vp!.y + 200 * vp!.zoom;
    expect(topScreenY).toBeGreaterThanOrEqual(40);
    expect(topScreenY).toBeLessThanOrEqual(45);
  });

  it("横方向はおおよそ中央", () => {
    const vp = computeHomeViewport(sampleNodes, 800, 600);
    const centerScreenX = vp!.x + (100 + 60) * vp!.zoom;
    expect(centerScreenX).toBeGreaterThan(350);
    expect(centerScreenX).toBeLessThan(450);
  });
});

describe("zoomToPercent", () => {
  it("rounds zoom to integer percent", () => {
    expect(zoomToPercent(1)).toBe(100);
    expect(zoomToPercent(0.855)).toBe(86);
  });
});
