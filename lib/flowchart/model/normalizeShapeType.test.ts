import { describe, expect, it } from "vitest";
import { isOvalType, normalizeShapeType } from "./normalizeShapeType";

describe("normalizeShapeType", () => {
  it("maps oval aliases to 〇", () => {
    expect(normalizeShapeType("〇")).toBe("〇");
    expect(normalizeShapeType("○")).toBe("〇");
    expect(normalizeShapeType("省略記号")).toBe("〇");
  });

  it("keeps existing shape aliases", () => {
    expect(normalizeShapeType("開始")).toBe("端子");
    expect(normalizeShapeType("データ")).toBe("入出力");
    expect(normalizeShapeType("")).toBe("処理");
  });

  it("isOvalType matches oval tokens", () => {
    expect(isOvalType("〇")).toBe(true);
    expect(isOvalType("処理")).toBe(false);
  });
});
