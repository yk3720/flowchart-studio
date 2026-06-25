import { describe, expect, it } from "vitest";
import { columnFormatTsv, tableToTsv } from "./copyTableUtils";
import { TABLE_HEADERS_10 } from "./tableColumns";

describe("tableToTsv", () => {
  it("converts single row to tab-separated values", () => {
    const table = [[10, "端子", "20", "", 1, 0, "開始", "", ""]];
    expect(tableToTsv(table)).toBe("10\t端子\t20\t\t1\t0\t開始\t\t");
  });

  it("joins multiple rows with newline", () => {
    const table = [
      [10, "端子", "20", ""],
      [20, "処理", "", ""],
    ];
    expect(tableToTsv(table)).toBe("10\t端子\t20\t\n20\t処理\t\t");
  });

  it("treats null and undefined as empty string", () => {
    const table = [[10, null, undefined, ""]];
    expect(tableToTsv(table)).toBe("10\t\t\t");
  });

  it("returns empty string for empty table", () => {
    expect(tableToTsv([])).toBe("");
  });
});

describe("columnFormatTsv", () => {
  it("first line is 10-column header joined by tabs", () => {
    const firstLine = columnFormatTsv().split("\n")[0];
    expect(firstLine).toBe(TABLE_HEADERS_10.join("\t"));
  });

  it("has 4 lines: header + 3 sample rows", () => {
    expect(columnFormatTsv().split("\n")).toHaveLength(4);
  });

  it("sample rows follow 端子→処理→端子 pattern", () => {
    const [, r1, r2, r3] = columnFormatTsv().split("\n");
    expect(r1.split("\t")[1]).toBe("端子");
    expect(r2.split("\t")[1]).toBe("処理");
    expect(r3.split("\t")[1]).toBe("端子");
  });

  it("each sample row has 10 columns", () => {
    const [, ...rows] = columnFormatTsv().split("\n");
    for (const row of rows) {
      expect(row.split("\t")).toHaveLength(10);
    }
  });
});
