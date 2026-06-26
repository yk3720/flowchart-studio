import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { TIER10_SCHEMA } from "../table/tableColumns";
import { parseFlowchartDocument } from "./document";
import { snapshotFromFlowchartDocument } from "./snapshotFromDocument";
import type { FlowchartDocument } from "./types";

const A0001_IMPORT_JSON = join(
  process.cwd(),
  "data/devices/A0001_塗布装置/import.json"
);

const A0001_M005_M006 = ["M005供給搬送1_取", "M006供給搬送1_置"] as const;

describe("A0001 M005/M006 — 再生成（snapshotFromFlowchartDocument）", () => {
  const bundle = JSON.parse(readFileSync(A0001_IMPORT_JSON, "utf-8"));

  for (const moduleLabel of A0001_M005_M006) {
    it(`${moduleLabel}: 表読込 → normalize → グラフ生成がエラーなく通る`, () => {
      const flow = bundle.flows.find(
        (f: { module_label: string }) => f.module_label === moduleLabel
      );
      expect(flow).toBeDefined();

      const { doc, errors } = parseFlowchartDocument(
        JSON.stringify(flow.payload)
      );
      expect(errors).toEqual([]);
      expect(doc?.schema).toBe(TIER10_SCHEMA);

      const result = snapshotFromFlowchartDocument(doc as FlowchartDocument);
      expect(result.ok, result.ok ? "" : result.errors.join("\n")).toBe(true);
      if (!result.ok) return;

      expect(result.snapshot.nodes.length).toBeGreaterThan(0);
      expect(result.snapshot.edges.length).toBeGreaterThan(0);

      const saved = JSON.parse(result.snapshot.jsonText) as FlowchartDocument;
      expect(saved.schema).toBe(TIER10_SCHEMA);
      expect(saved.table.length).toBe(flow.payload.table.length);
      expect(saved.table[0]?.[7]).toMatch(/^MR/);
    });
  }
});
