import { describe, expect, it } from "vitest";
import { validateTable } from "./validate";

describe("validateTable — silent failure visualization (ADR-019/022)", () => {
  it("reports a duplicate ID as a blocking error with the row number", () => {
    const table = [
      [10, "端子", "", "20", "", 0, 0, "最初", "", ""],
      [10, "処理", "", "", "", 1, 0, "重複", "", ""],
      [20, "処理", "", "", "", 1, 1, "手順A", "", ""],
    ];
    const errors = validateTable(table, "table-10col-v2");
    expect(errors).toContain("ID 10 が重複しています（2行目）");
  });

  it("reports a blank shape type as a blocking error with the row number", () => {
    const table = [
      [10, "端子", "", "20", "", 0, 0, "開始", "", ""],
      [15, "", "", "20", "", 0, 1, "空欄種別", "", ""],
      [20, "処理", "", "", "", 1, 0, "手順A", "", ""],
    ];
    const errors = validateTable(table, "table-10col-v2");
    expect(errors).toContain("ID 15: 図形種別が空欄です（2行目）");
  });

  it("reports an unknown color value as a blocking error with the offending value", () => {
    const table = [
      [10, "処理", "赤", "20", "", 0, 0, "A", "", ""],
      [20, "処理", "", "", "", 1, 1, "B", "", ""],
    ];
    const errors = validateTable(table, "table-10col-v2");
    expect(errors).toContain(
      'ID 10: 色 "赤" は未対応の値です（黄/橙/青のみ有効、1行目）'
    );
  });

  it("does not flag a valid or empty color value", () => {
    const table = [
      [10, "処理", "黄", "20", "", 0, 0, "A", "", ""],
      [20, "処理", "", "", "", 1, 1, "B", "", ""],
    ];
    const errors = validateTable(table, "table-10col-v2");
    expect(errors.some((e) => e.includes("未対応の値"))).toBe(false);
  });

  it("reports a tier/level collision as a blocking error listing both IDs", () => {
    const table = [
      [10, "処理", "", "", "", 0, 0, "A", "", ""],
      [20, "処理", "", "", "", 0, 0, "B", "", ""],
    ];
    const errors = validateTable(table, "table-10col-v2");
    expect(errors).toContain(
      "ID 10, 20: 段・列が重複しています（座標が重なり図形が隠れます）"
    );
  });

  it("does not flag distinct tier/level combinations", () => {
    const table = [
      [10, "処理", "", "", "", 0, 0, "A", "", ""],
      [20, "処理", "", "", "", 0, 1, "B", "", ""],
    ];
    const errors = validateTable(table, "table-10col-v2");
    expect(errors.some((e) => e.includes("段・列が重複"))).toBe(false);
  });

  it("still reports missing destinations alongside the new checks", () => {
    const table = [
      [10, "処理", "", "999", "", 0, 0, "A", "", ""],
      [20, "処理", "", "", "", 0, 1, "B", "", ""],
    ];
    const errors = validateTable(table, "table-10col-v2");
    expect(errors).toContain("ID 10: 接続先 999 が見つかりません");
  });

  it("returns no errors for a fully valid table", () => {
    const table = [
      [10, "端子", "", "20", "", 0, 0, "開始", "", ""],
      [20, "処理", "黄", "", "", 1, 0, "手順A", "", ""],
    ];
    expect(validateTable(table, "table-10col-v2")).toEqual([]);
  });
});
