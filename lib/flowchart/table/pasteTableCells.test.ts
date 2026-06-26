import { describe, expect, it } from "vitest";
import {
  applyPartialPaste,
  parseClipboardGrid,
  parsePasteCellValue,
} from "./pasteTableCells";
import { normalizeRow } from "./tableColumns";
import type { FlowTableRow } from "../model/types";

const COL = 10;

function row(id: number, text1 = "", text2 = "", text3 = ""): FlowTableRow {
  return normalizeRow([id, "処理", "", "", 1, 0, text1, text2, text3, ""], COL);
}

describe("parseClipboardGrid", () => {
  it("parses tab-separated multi-cell range", () => {
    const grid = parseClipboardGrid("A\tB\nC\tD");
    expect(grid).toEqual([
      ["A", "B"],
      ["C", "D"],
    ]);
  });

  it("returns empty for blank clipboard", () => {
    expect(parseClipboardGrid("  \n  ")).toEqual([]);
  });
});

describe("applyPartialPaste", () => {
  it("overwrites from focused cell without replacing whole table", () => {
    const table = [row(10, "開始"), row(20, "処理A"), row(30, "終了")];
    const next = applyPartialPaste(
      table,
      1,
      6,
      [
        ["新A", "新B"],
        ["行3A", ""],
      ],
      COL
    );
    expect(next[0][6]).toBe("開始");
    expect(next[1][6]).toBe("新A");
    expect(next[1][7]).toBe("新B");
    expect(next[2][6]).toBe("行3A");
  });

  it("appends rows when paste extends beyond table", () => {
    const table = [row(10, "のみ")];
    const next = applyPartialPaste(table, 0, 6, [["A"], ["B"], ["C"]], COL);
    expect(next).toHaveLength(3);
    expect(next[2][6]).toBe("C");
    expect(next[2][0]).toBe(30);
  });

  it("parses numeric columns in pasted range", () => {
    const table = [row(10)];
    const next = applyPartialPaste(table, 0, 0, [["99", "判断"]], COL);
    expect(next[0][0]).toBe(99);
    expect(next[0][1]).toBe("判断");
    const tierCol = applyPartialPaste(table, 0, 4, [["3", "2"]], COL);
    expect(tierCol[0][4]).toBe(3);
    expect(tierCol[0][5]).toBe(2);
  });
});

describe("parsePasteCellValue", () => {
  it("matches table editor numeric rules (v1 / no schema)", () => {
    expect(parsePasteCellValue(4, COL, "3")).toBe(3);
    expect(parsePasteCellValue(6, COL, "text")).toBe("text");
  });

  it("v2 schema: 段(index 5) と 列(index 6) が数値、接続先(右)(index 4) は文字列", () => {
    const S = "table-10col-v2";
    expect(parsePasteCellValue(4, COL, "20", S)).toBe("20"); // 接続先(右) → string
    expect(parsePasteCellValue(5, COL, "2", S)).toBe(2); // 段 → number
    expect(parsePasteCellValue(6, COL, "1", S)).toBe(1); // 列 → number
    expect(parsePasteCellValue(2, COL, "黄", S)).toBe("黄"); // 色 → string
  });

  it("v2 schema: applyPartialPaste が 接続先(右) を文字列として保持する", () => {
    const S = "table-10col-v2";
    const table = [
      normalizeRow([10, "処理", "", "", "", 1, 0, "", "", ""], COL),
    ];
    const next = applyPartialPaste(table, 0, 4, [["20"]], COL, S);
    expect(next[0][4]).toBe("20"); // 接続先(右) はスキーマなし時に数値変換されていたバグの再現
  });
});
