import * as fs from "node:fs";
import * as path from "node:path";
import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import {
  MAX_EXCEL_BYTES,
  parseExcelBuffer,
  pickFlowchartSheetName,
} from "./parseExcel";

const A0001_SCRATCH_XLSX = path.join(
  process.cwd(),
  "data/devices/A0001_塗布装置/_scratch/取出.xlsx"
);

function buildWorkbookBuffer(
  sheets: Record<string, (string | number)[][]>
): ArrayBuffer {
  const wb = XLSX.utils.book_new();
  for (const [name, data] of Object.entries(sheets)) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), name);
  }
  return XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}

describe("parseExcelBuffer", () => {
  it("reads 8-column table from preferred sheet name", () => {
    const buffer = buildWorkbookBuffer({
      図形: [["ignored"]],
      表: [
        [
          "ID",
          "図形種別",
          "接続先(下)",
          "接続先(右)",
          "Level",
          "Text1",
          "Text2",
          "Text3",
        ],
        [10, "端子", 20, "", 0, "開始", "", ""],
        [20, "処理", 30, "", 0, "処理A", "", ""],
      ],
    });
    const { table, errors, sheetName } = parseExcelBuffer(buffer);
    expect(errors).toHaveLength(0);
    expect(sheetName).toBe("表");
    expect(table).toHaveLength(2);
    expect(table[0][0]).toBe(10);
    expect(table[0][1]).toBe("端子");
  });

  it("rejects files larger than MAX_EXCEL_BYTES", () => {
    const oversized = new ArrayBuffer(MAX_EXCEL_BYTES + 1);
    const { table, errors } = parseExcelBuffer(oversized);
    expect(table).toHaveLength(0);
    expect(errors[0]).toMatch(/大きすぎます/);
  });

  it("picks sheet with most data rows when name is generic", () => {
    const buffer = buildWorkbookBuffer({
      Sheet1: [["a"]],
      Sheet2: [
        ["10", "端子", "20", "", "0", "開始", "", ""],
        ["20", "処理", "30", "", "0", "処理A", "", ""],
      ],
    });
    expect(pickFlowchartSheetName(XLSX.read(buffer, { type: "array" }))).toBe(
      "Sheet2"
    );
  });

  it("reads A0001 _scratch/取出.xlsx (10列 · 3行 · v2 列順)", () => {
    if (!fs.existsSync(A0001_SCRATCH_XLSX)) {
      throw new Error("fixture missing — run: npm run excel:a0001:scratch");
    }
    const buffer = fs.readFileSync(A0001_SCRATCH_XLSX).buffer;
    const { table, errors, sheetName } = parseExcelBuffer(buffer);
    expect(errors).toHaveLength(0);
    expect(sheetName).toBe("表");
    expect(table).toHaveLength(3);
    // v2: index 7 = Text1（v1 では index 6）
    expect(table[1][7]).toBe("ワーク取出");
    expect(table[1][6]).toBe(0);
    expect(table[2][7]).toBe("終了");
    expect(table[2][6]).toBe(0);
  });

  it("migrates 10-column v1 Excel rows to v2 column order", () => {
    const buffer = buildWorkbookBuffer({
      表: [
        [
          "ID",
          "図形種別",
          "接続先(下)",
          "接続先(右)",
          "段",
          "列",
          "Text1",
          "Text2",
          "Text3",
          "色",
        ],
        [10, "端子", 20, "", 1, 0, "MR42000", "開始", "", "黄"],
      ],
    });
    const { table, errors } = parseExcelBuffer(buffer);
    expect(errors).toHaveLength(0);
    expect(table[0]).toEqual([
      10,
      "端子",
      "黄",
      "20",
      "",
      1,
      0,
      "MR42000",
      "開始",
      "",
    ]);
  });
});
