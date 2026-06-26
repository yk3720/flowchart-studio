import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  importBundleSchema,
  parseImportBundleJson,
} from "./importBundleSchema";
import { prepareImportBundleForRpc } from "./prepareImportBundle";

const FIXTURE_JSON = join(
  process.cwd(),
  "python/testdata/fixtures/import-z00001.json"
);

const A0001_IMPORT_JSON = join(
  process.cwd(),
  "data/devices/A0001_塗布装置/import.json"
);

const A0001_M004_M006 = [
  "M004供給SUS板_検査_x001F_",
  "M005供給搬送1_取_x001F_",
  "M006供給搬送1_置_x001F_",
] as const;

describe("importBundleSchema", () => {
  it("parses fixture import.json", () => {
    const raw = readFileSync(FIXTURE_JSON, "utf-8");
    const parsed = parseImportBundleJson(raw);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.bundle.internal_code).toBe("Z00001");
    expect(parsed.bundle.flows).toHaveLength(4);
  });

  it("prepareImportBundleForRpc builds ModuleSnapshot payloads", () => {
    const raw = readFileSync(FIXTURE_JSON, "utf-8");
    const parsed = parseImportBundleJson(raw);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const prepared = prepareImportBundleForRpc(parsed.bundle);
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;

    expect(prepared.bundle.flows[0]?.payload.jsonText).toContain('"table"');
    expect(prepared.bundle.flows[0]?.payload.nodes.length).toBeGreaterThan(0);
    expect(prepared.bundle.flows[0]?.payload.edges.length).toBeGreaterThan(0);
  });

  it("rejects invalid bundle shape", () => {
    const result = importBundleSchema.safeParse({ internal_code: "X" });
    expect(result.success).toBe(false);
  });

  it("rejects oversized json text", () => {
    const huge = " ".repeat(5 * 1024 * 1024 + 1);
    const parsed = parseImportBundleJson(huge);
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.error).toMatch(/大きすぎます/);
    }
  });

  it("A0001 M004〜M006: prepareImportBundleForRpc がフロー生成エラーなく通る", () => {
    const raw = readFileSync(A0001_IMPORT_JSON, "utf-8");
    const parsed = parseImportBundleJson(raw);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    for (const moduleLabel of A0001_M004_M006) {
      const flow = parsed.bundle.flows.find(
        (f) => f.module_label === moduleLabel
      );
      expect(flow, moduleLabel).toBeDefined();
    }

    const subset = {
      ...parsed.bundle,
      flows: parsed.bundle.flows.filter((f) =>
        A0001_M004_M006.includes(
          f.module_label as (typeof A0001_M004_M006)[number]
        )
      ),
    };
    const prepared = prepareImportBundleForRpc(subset);
    expect(prepared.ok, prepared.ok ? "" : prepared.errors.join("\n")).toBe(
      true
    );
    if (!prepared.ok) return;

    for (const flow of prepared.bundle.flows) {
      expect(flow.payload.nodes.length).toBeGreaterThan(0);
      expect(flow.payload.edges.length).toBeGreaterThan(0);
    }
  });
});
