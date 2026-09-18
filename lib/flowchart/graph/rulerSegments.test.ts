import { describe, expect, it } from "vitest";
import { computeRulerSegments } from "./rulerSegments";

type Shape = {
  level: number;
  tier: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

function shape(
  level: number,
  tier: number,
  x: number,
  y: number,
  width = 160,
  height = 60
): Shape {
  return { level, tier, x, y, width, height };
}

const byLevel = (n: Shape) => n.level;
const byTier = (n: Shape) => n.tier;
const byX = (n: Shape) => n.x;
const byY = (n: Shape) => n.y;
const byWidth = (n: Shape) => n.width;
const byHeight = (n: Shape) => n.height;

describe("computeRulerSegments", () => {
  it("groups nodes sharing the same logical level into one segment", () => {
    const nodes = [shape(0, 0, 0, 0), shape(0, 1, 0, 90), shape(1, 0, 260, 0)];
    const cols = computeRulerSegments(nodes, byLevel, byX, byWidth);
    expect(cols.map((s) => s.index)).toEqual([0, 1]);
    expect(cols[0]).toMatchObject({ start: 0, size: 160 });
    expect(cols[1]).toMatchObject({ start: 260, size: 160 });
  });

  it("orders segments by ascending start position, not input order", () => {
    const nodes = [shape(2, 0, 260, 0), shape(0, 0, 0, 0), shape(1, 0, 130, 0)];
    const cols = computeRulerSegments(nodes, byLevel, byX, byWidth);
    expect(cols.map((s) => s.start)).toEqual([0, 130, 260]);
    expect(cols.map((s) => s.index)).toEqual([0, 1, 2]);
  });

  it("keeps the min start and max size for a shared logical key even when a centered/enlarged shape offsets its own position", () => {
    // 〇（省略記号）は列内で中央寄せ・縮小されるため x が列の左端よりずれる。
    // 同じ level のノードのうち、区切りは左端(min)・幅は最大(max)を採用すること。
    const nodes = [
      shape(0, 0, 0, 0, 160, 60), // 通常の矩形（列の左端 = 0、幅160）
      shape(0, 1, 57, 90, 45, 45), // 〇（省略記号）: 中央寄せで x=57・幅45に縮小
    ];
    const cols = computeRulerSegments(nodes, byLevel, byX, byWidth);
    expect(cols).toHaveLength(1);
    expect(cols[0].start).toBe(0);
    expect(cols[0].size).toBe(160);
  });

  it("keeps the min start for a shared tier even when a diamond is vertically offset above the row top", () => {
    // 判断（菱形）は行より縦に拡大され top が行の上端よりマイナス方向にずれる。
    const nodes = [
      shape(0, 3, 0, 200, 160, 60), // 通常の矩形（行の上端 = 200）
      shape(1, 3, 200, 191, 160, 78), // 判断（菱形）: 行より高さが1.3倍で上に9pxはみ出す
    ];
    const rows = computeRulerSegments(nodes, byTier, byY, byHeight);
    expect(rows).toHaveLength(1);
    expect(rows[0].start).toBe(191);
  });

  it("returns an empty array for no nodes", () => {
    expect(computeRulerSegments([], byLevel, byX, byWidth)).toEqual([]);
  });
});
