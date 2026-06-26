import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { parsePasteCellValue } from "../table/pasteTableCells";
import { migrateTable10ColV1ToV2, TIER10_SCHEMA } from "../table/tableColumns";
import { normalizeFlowchartDocument, parseFlowchartDocument } from "./document";

const A0001_IMPORT_JSON = join(
  process.cwd(),
  "data/devices/A0001_塗布装置/import.json"
);

describe("normalizeFlowchartDocument — 色列 desync 修復", () => {
  it("A0001 M002 v1 読込後は v2 列順になり、色を index 2 に書ける", () => {
    const bundle = JSON.parse(readFileSync(A0001_IMPORT_JSON, "utf-8"));
    const flow = bundle.flows.find(
      (f: { module_label: string }) =>
        f.module_label === "M002供給SUS板_取_x001F_"
    );
    expect(flow).toBeDefined();

    const { doc, errors } = parseFlowchartDocument(
      JSON.stringify(flow.payload)
    );
    expect(errors).toEqual([]);
    expect(doc?.schema).toBe(TIER10_SCHEMA);
    expect(doc?.table[0]?.[6]).toBe("0");
    expect(doc?.table[0]?.[7]).toMatch(/^MR/);

    const row = [...doc!.table[0]!];
    row[2] = parsePasteCellValue(2, 10, "黄", TIER10_SCHEMA);
    const next = normalizeFlowchartDocument({
      ...doc!,
      table: [row, ...doc!.table.slice(1)],
    });
    expect(next.table[0]?.[2]).toBe("黄");
    expect(next.table[0]?.[3]).toBe("2");
    expect(next.table[0]?.[7]).toBe("MR42000");
  });

  it("schema v2 + v1 列順 desync を読込時に修復", () => {
    const v1Table = [
      ["1", "端子", "2", "", "1", "0", "MR42000", "text", "", ""],
    ];
    const desync = normalizeFlowchartDocument({
      version: 1,
      schema: TIER10_SCHEMA,
      title: "desync",
      table: v1Table,
      layout: {
        width: 160,
        heightMin: 60,
        gapV: 30,
        gapH: 100,
        baseLeft: 40,
        baseTop: 40,
      },
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    expect(desync.table[0]).toEqual(migrateTable10ColV1ToV2(v1Table[0]!));
  });

  it("v2 表で色を編集しても normalize で列がずれない", () => {
    const v2Table = [
      migrateTable10ColV1ToV2([
        "1",
        "端子",
        "2",
        "",
        "1",
        "0",
        "MR42000",
        "text",
        "",
        "",
      ]),
    ];
    const row = [...v2Table[0]!];
    row[2] = "黄";
    const next = normalizeFlowchartDocument({
      version: 1,
      schema: TIER10_SCHEMA,
      title: "v2",
      table: [row],
      layout: {
        width: 160,
        heightMin: 60,
        gapV: 30,
        gapH: 100,
        baseLeft: 40,
        baseTop: 40,
      },
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    expect(next.table[0]?.[2]).toBe("黄");
    expect(next.table[0]?.[3]).toBe("2");
    expect(next.table[0]?.[7]).toBe("MR42000");
  });
});
