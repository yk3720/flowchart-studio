import { describe, expect, it } from "vitest";
import {
  createEmptyRow,
  ensureNineColumnTable,
  getHeaders,
  getHelpEntries,
  inferTableLayout,
  isNumericTableColumn,
  normalizeRow,
  legacy8TableToTier9,
  resolveColumnCount,
  suggestNextId,
  TABLE_HEADERS_9,
  TABLE_HEADERS_10,
  TABLE_HEADERS_10_V2,
  TIER10_SCHEMA,
  TIER10_V1_SCHEMA,
  TIER9_SCHEMA,
  isColorTableColumn,
  migrateTable10ColV1ToV2,
} from "./tableColumns";

describe("tableColumns", () => {
  it("getHeaders returns 9 columns with 段 and 列", () => {
    expect(getHeaders(9)).toEqual([...TABLE_HEADERS_9]);
    expect(getHeaders(9)[4]).toBe("段");
    expect(getHeaders(9)[5]).toBe("列");
    expect(getHeaders(9)[6]).toBe("Text1");
  });

  it("getHeaders keeps 8-column headers for legacy tables", () => {
    expect(getHeaders(8)).toHaveLength(8);
    expect(getHeaders(8)[4]).toBe("Level");
    expect(getHeaders(8)[5]).toBe("Text1");
  });

  it("getHelpEntries covers 9-column layout columns", () => {
    const headers = getHelpEntries(9).map((e) => e.header);
    expect(headers).toContain("段");
    expect(headers).toContain("列");
    expect(headers).toContain("Text1");
  });

  it("isNumericTableColumn treats 段 and 列 as numeric in 9-col", () => {
    expect(isNumericTableColumn(4, 9)).toBe(true);
    expect(isNumericTableColumn(5, 9)).toBe(true);
    expect(isNumericTableColumn(6, 9)).toBe(false);
  });

  it("inferTableLayout detects 8-wide tier9 rows (Text3 column missing)", () => {
    const table = [
      [1, "端子", "2", "", 1, 0, "開始", ""],
      [3, "処理", "6", "", 3, 0, "取付経路A", ""],
      [4, "処理", "6", "", 3, 1, "取付経路B", ""],
    ];
    expect(inferTableLayout(table)).toBe("tier9");
    expect(resolveColumnCount(table)).toBe(10);
    expect(getHeaders(resolveColumnCount(table))[4]).toBe("段");
    expect(getHeaders(resolveColumnCount(table))[9]).toBe("色");
  });

  it("ensureNineColumnTable pads tier9 to 10 with empty 色", () => {
    const table = [[3, "処理", "6", "", 3, 0, "取付経路A", ""]];
    const next = ensureNineColumnTable(table);
    expect(next[0]).toHaveLength(10);
    expect(next[0][5]).toBe(0);
    expect(next[0][6]).toBe("取付経路A");
    expect(next[0][9]).toBe("");
  });

  it("legacy8TableToTier9 maps Level to 列 and increments 段 on level 0", () => {
    const table = [
      [10, "端子", "20", "", 0, "開始", "", ""],
      [30, "判断", "40", "50", 0, "条件?", "", ""],
      [40, "処理", "", "", 0, "Yes側", "", ""],
      [50, "処理", "", "", 1, "No側", "", ""],
    ];
    const next = legacy8TableToTier9(table);
    expect(next[0]).toEqual([10, "端子", "20", "", 1, 0, "開始", "", ""]);
    expect(next[2]).toEqual([40, "処理", "", "", 3, 0, "Yes側", "", ""]);
    expect(next[3]).toEqual([50, "処理", "", "", 3, 1, "No側", "", ""]);
    expect(inferTableLayout(next, TIER9_SCHEMA)).toBe("tier9");
  });

  it("inferTableLayout keeps legacy 8-col sample-basic pattern", () => {
    const table = [[10, "端子", "20", "", 0, "開始", "", ""]];
    expect(inferTableLayout(table)).toBe("legacy8");
    expect(getHeaders(resolveColumnCount(table))[4]).toBe("Level");
  });

  it("suggestNextId returns max+10", () => {
    expect(
      suggestNextId([
        [10, "端子"],
        [50, "処理"],
      ])
    ).toBe(60);
  });

  it("normalizeRow pads and trims", () => {
    expect(normalizeRow([10, "処理"], 4)).toEqual([10, "処理", "", ""]);
    expect(normalizeRow([10, "処理", "a", "b", "c"], 3)).toEqual([
      10,
      "処理",
      "a",
    ]);
  });

  it("createEmptyRow for 9 columns", () => {
    const row = createEmptyRow(9, 70);
    expect(row[0]).toBe(70);
    expect(row[1]).toBe("処理");
    expect(row[4]).toBe(0);
    expect(row[5]).toBe(0);
    expect(row).toHaveLength(9);
  });

  it("createEmptyRow for 8 columns", () => {
    const row = createEmptyRow(8, 70);
    expect(row[0]).toBe(70);
    expect(row[1]).toBe("処理");
    expect(row[4]).toBe(0);
    expect(row).toHaveLength(8);
  });

  it("getHeaders returns v2 column order for TIER10_SCHEMA (table-10col-v2)", () => {
    expect(getHeaders(10, TIER10_SCHEMA)).toEqual([...TABLE_HEADERS_10_V2]);
    expect(getHeaders(10, TIER10_SCHEMA)[2]).toBe("色");
    expect(getHeaders(10, TIER10_SCHEMA)[3]).toBe("接続先(下)");
  });

  it("getHeaders returns v1 column order for TIER10_V1_SCHEMA", () => {
    expect(getHeaders(10, TIER10_V1_SCHEMA)).toEqual([...TABLE_HEADERS_10]);
    expect(getHeaders(10, TIER10_V1_SCHEMA)[9]).toBe("色");
  });

  it("resolveColumnCount uses 10 for v2 schema", () => {
    expect(resolveColumnCount([], TIER10_SCHEMA)).toBe(10);
  });

  it("isColorTableColumn: v2 uses index 2, v1 uses index 9", () => {
    expect(isColorTableColumn(2, 10, TIER10_SCHEMA)).toBe(true);
    expect(isColorTableColumn(9, 10, TIER10_SCHEMA)).toBe(false);
    expect(isColorTableColumn(9, 10, TIER10_V1_SCHEMA)).toBe(true);
    expect(isColorTableColumn(2, 10, TIER10_V1_SCHEMA)).toBe(false);
    expect(isColorTableColumn(9, 9)).toBe(false);
  });

  it("createEmptyRow for 10 columns v2 places 段/列 at index 5/6", () => {
    const row = createEmptyRow(10, 80, TIER10_SCHEMA);
    expect(row).toHaveLength(10);
    expect(row[5]).toBe(0); // 段
    expect(row[6]).toBe(0); // 列
    expect(row[2]).toBe(""); // 色（空）
  });

  it("migrateTable10ColV1ToV2 reorders v1 row to v2", () => {
    // v1: [ID, 種別, 下先, 右先, 段, 列, T1, T2, T3, 色]
    const v1row = ["1", "処理", "2", "3", "1", "0", "A", "B", "C", "橙"];
    const v2row = migrateTable10ColV1ToV2(v1row);
    // v2: [ID, 種別, 色, 下先, 右先, 段, 列, T1, T2, T3]
    expect(v2row).toEqual([
      "1",
      "処理",
      "橙",
      "2",
      "3",
      "1",
      "0",
      "A",
      "B",
      "C",
    ]);
  });
});
