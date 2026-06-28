import { describe, expect, it } from "vitest";

import {
  buildEquipmentImportPreview,
  verifyEquipmentImportPreviewBatchId,
} from "./equipmentImportPreview";
import {
  computeImportBatchIdFromBundle,
  formatImportBundleJson,
} from "./importBatchId";
import type { ImportBundle } from "./importBundleSchema";

const SAMPLE_BUNDLE: ImportBundle = {
  internal_code: "Z00001",
  display_name: "プレス機B",
  units: [
    {
      label: "供給ユニット",
      sort_order: 0,
      modules: [
        { label: "取出", sort_order: 0 },
        { label: "供給", sort_order: 1 },
      ],
    },
  ],
  flows: [
    {
      unit_label: "供給ユニット",
      module_label: "取出",
      title: "取出",
      payload: {
        version: 1,
        schema: "table-10col-v2",
        table: [["1", "開始", "", "", "", "0", "0", "開始", "", ""]],
      },
    },
  ],
};

describe("importBatchId", () => {
  it("produces stable batch id for the same bundle", async () => {
    const first = await computeImportBatchIdFromBundle(SAMPLE_BUNDLE);
    const second = await computeImportBatchIdFromBundle(SAMPLE_BUNDLE);
    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });

  it("formats import json with trailing newline", () => {
    expect(formatImportBundleJson(SAMPLE_BUNDLE).endsWith("\n")).toBe(true);
  });
});

describe("buildEquipmentImportPreview", () => {
  it("summarizes bundle counts and warnings", async () => {
    const preview = await buildEquipmentImportPreview({
      bundle: SAMPLE_BUNDLE,
      sourceKind: "json",
      sourceName: "import.json",
      warnings: ["フロー未登録の警告"],
    });

    expect(preview.internalCode).toBe("Z00001");
    expect(preview.unitCount).toBe(1);
    expect(preview.moduleCount).toBe(2);
    expect(preview.flowCount).toBe(1);
    expect(preview.warnings).toEqual(["フロー未登録の警告"]);
    expect(preview.errors).toEqual([]);
    expect(preview.batchId).toMatch(/^[a-f0-9]{64}$/);
  });

  it("verifies preview batch id against parsed bundle", async () => {
    const preview = await buildEquipmentImportPreview({
      bundle: SAMPLE_BUNDLE,
      sourceKind: "json",
      sourceName: "import.json",
    });
    const matches = await verifyEquipmentImportPreviewBatchId(
      preview,
      SAMPLE_BUNDLE
    );
    expect(matches).toBe(true);
  });
});
