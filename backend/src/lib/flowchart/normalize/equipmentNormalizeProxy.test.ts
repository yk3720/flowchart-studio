import { describe, expect, it } from "vitest";

import {
  validateEquipmentXlsxBytes,
  validateEquipmentXlsxUpload,
} from "@/backend/src/lib/flowchart/normalize/equipmentNormalizeProxy";
import { EQUIPMENT_XLSX_MAX_BYTES } from "@/lib/flowchart/import/importBundleLimits";

describe("validateEquipmentXlsxUpload", () => {
  it("accepts .xlsx under size limit", () => {
    const file = new File([new Uint8Array([1])], "device.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    expect(validateEquipmentXlsxUpload(file)).toEqual({ ok: true });
  });

  it("rejects non-xlsx extension", () => {
    const file = new File([new Uint8Array([1])], "device.json", {
      type: "application/json",
    });
    expect(validateEquipmentXlsxUpload(file)).toEqual({
      ok: false,
      error: "拡張子は .xlsx のみ対応しています",
    });
  });

  it("rejects oversize files", () => {
    const file = new File(
      [new Uint8Array(EQUIPMENT_XLSX_MAX_BYTES + 1)],
      "big.xlsx",
      {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );
    expect(validateEquipmentXlsxUpload(file)).toEqual({
      ok: false,
      error: "ファイルサイズが上限を超えています",
    });
  });
});

describe("validateEquipmentXlsxBytes", () => {
  it("accepts xlsx magic bytes", () => {
    const data = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00]);
    expect(validateEquipmentXlsxBytes(data)).toEqual({ ok: true });
  });

  it("rejects invalid magic bytes", () => {
    const data = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
    expect(validateEquipmentXlsxBytes(data)).toEqual({
      ok: false,
      error: "Excel（.xlsx）形式ではないファイルです",
    });
  });
});
