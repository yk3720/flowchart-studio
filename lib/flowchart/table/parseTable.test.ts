import { describe, expect, it } from "vitest";
import { parseTable } from "./parseTable";

describe("parseTable color column", () => {
  it("reads colorHint from column 10 when table has 10 columns", () => {
    const table = [
      [10, "処理", "", "", 1, 0, "A", "", "", "橙"],
      [20, "判断", "30", "40", 2, 0, "B", "", "", "黄"],
    ];
    const { nodes, colCount } = parseTable(table);
    expect(colCount).toBe(10);
    expect(nodes[0].colorHint).toBe("orange");
    expect(nodes[1].colorHint).toBe("yellow");
  });

  it("omits colorHint for 9-column tables", () => {
    const table = [[10, "処理", "", "", 1, 0, "A", "", ""]];
    const { nodes } = parseTable(table);
    expect(nodes[0].colorHint).toBeUndefined();
  });
});

describe("parseTable blank shape type", () => {
  it("excludes a row whose ID is set but shape type is blank", () => {
    const table = [
      [10, "端子", "", "20", "", 0, 0, "開始", "", ""],
      [15, "", "", "20", "", 0, 0, "空欄種別", "", ""],
      [20, "処理", "", "30", "", 1, 0, "手順A", "", ""],
    ];
    const { nodes } = parseTable(table);
    expect(nodes.map((n) => n.id)).toEqual(["10", "20"]);
  });
});

describe("parseTable duplicate id", () => {
  it("keeps only the first occurrence of a duplicate id", () => {
    const table = [
      [10, "端子", "", "20", "", 0, 0, "最初", "", ""],
      [10, "処理", "", "30", "", 1, 0, "重複", "", ""],
      [20, "処理", "", "", "", 1, 0, "手順A", "", ""],
    ];
    const { nodes } = parseTable(table, "table-10col-v2");
    expect(nodes.map((n) => n.id)).toEqual(["10", "20"]);
    expect(nodes[0].fullText).toBe("最初");
  });
});

describe("parseTable issues (ADR-019/022)", () => {
  it("records a duplicate_id issue for the skipped second occurrence", () => {
    const table = [
      [10, "端子", "", "20", "", 0, 0, "最初", "", ""],
      [10, "処理", "", "30", "", 1, 0, "重複", "", ""],
    ];
    const { issues } = parseTable(table, "table-10col-v2");
    expect(issues).toEqual([{ kind: "duplicate_id", id: "10", rowIndex: 1 }]);
  });

  it("records an empty_type issue for a row with an ID but no shape type", () => {
    const table = [[15, "", "", "20", "", 0, 0, "空欄種別", "", ""]];
    const { issues } = parseTable(table, "table-10col-v2");
    expect(issues).toEqual([{ kind: "empty_type", id: "15", rowIndex: 0 }]);
  });

  it("records an unknown_color issue for a color cell outside 黄/橙/青", () => {
    const table = [[10, "処理", "赤", "20", "", 0, 0, "A", "", ""]];
    const { issues } = parseTable(table, "table-10col-v2");
    expect(issues).toEqual([
      { kind: "unknown_color", id: "10", rowIndex: 0, detail: "赤" },
    ]);
  });

  it("does not flag an empty color cell as unknown", () => {
    const table = [[10, "処理", "", "20", "", 0, 0, "A", "", ""]];
    const { issues } = parseTable(table, "table-10col-v2");
    expect(issues).toEqual([]);
  });
});
