import { normalizeShapeType } from "../model/normalizeShapeType";
import { normalizeColorHint } from "../visual/flowColors";
import { isTenColV2Schema } from "./tableColumns";
import type { FlowNode, FlowTableRow, ParseResult } from "../model/types";

function normId(v: unknown): string {
  if (v === null || v === undefined || v === "") return "";
  return String(v).split(".")[0].trim();
}

function parseLevel(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

function splitDests(v: unknown): string[] {
  if (v === null || v === undefined || v === "") return [];
  return String(v)
    .split(",")
    .map((d) => normId(d))
    .filter(Boolean);
}

export function parseTable(
  table: FlowTableRow[],
  schema?: string
): ParseResult {
  const nodes: FlowNode[] = [];
  const rowMap = new Map<number, FlowNode[]>();
  const colCount = table[0]?.length ?? 0;
  const isV2 = isTenColV2Schema(schema);

  for (let i = 0; i < table.length; i++) {
    const row = table[i] ?? [];
    const nid = normId(row[0]);
    if (!nid || !/^\d+$/.test(nid)) continue;

    let txts: string[];
    let destsDown: string[];
    let destsRight: string[];
    let level: number;
    let tier: number | undefined;
    let colorHintRaw: unknown = undefined;

    if (colCount >= 9 && isV2) {
      // v2: [ID, 種別, 色, 接続先(下), 接続先(右), 段, 列, Text1, Text2, Text3]
      txts = [];
      for (let j = 7; j < Math.min(10, row.length); j++) {
        if (row[j] !== null && row[j] !== undefined && row[j] !== "") {
          txts.push(String(row[j]));
        }
      }
      colorHintRaw = row[2];
      destsDown = splitDests(row[3]);
      destsRight = splitDests(row[4]);
      tier = parseLevel(row[5]);
      level = parseLevel(row[6]);
    } else if (colCount >= 9) {
      // v1: [ID, 種別, 接続先(下), 接続先(右), 段, 列, Text1, Text2, Text3, 色]
      txts = [];
      for (let j = 6; j < Math.min(9, row.length); j++) {
        if (row[j] !== null && row[j] !== undefined && row[j] !== "") {
          txts.push(String(row[j]));
        }
      }
      destsDown = splitDests(row[2]);
      destsRight = splitDests(row[3]);
      tier = parseLevel(row[4]);
      level = parseLevel(row[5]);
      if (colCount >= 10) colorHintRaw = row[9];
    } else if (colCount >= 8) {
      txts = [];
      for (let j = 5; j < Math.min(8, row.length); j++) {
        if (row[j] !== null && row[j] !== undefined && row[j] !== "") {
          txts.push(String(row[j]));
        }
      }
      destsDown = splitDests(row[2]);
      destsRight = splitDests(row[3]);
      level = parseLevel(row[4]);
    } else if (colCount === 7) {
      txts = [];
      for (let j = 4; j < Math.min(7, row.length); j++) {
        if (row[j] !== null && row[j] !== undefined && row[j] !== "") {
          txts.push(String(row[j]));
        }
      }
      destsDown = splitDests(row[2]);
      destsRight = [];
      level = parseLevel(row[3]);
    } else {
      txts =
        row.length > 2 &&
        row[2] !== null &&
        row[2] !== undefined &&
        row[2] !== ""
          ? [String(row[2])]
          : [];
      destsDown = splitDests(row[3]);
      destsRight = [];
      level = row.length > 4 ? parseLevel(row[4]) : 0;
    }

    const rawType = row[1] != null && row[1] !== "" ? String(row[1]) : "処理";
    const node: FlowNode = {
      id: nid,
      type: normalizeShapeType(rawType),
      fullText: txts.join("\n"),
      destsDown,
      destsRight,
      level,
      ...(tier !== undefined ? { tier } : {}),
      ...(colorHintRaw !== undefined
        ? { colorHint: normalizeColorHint(colorHintRaw).hint }
        : {}),
      rowIndex: i,
    };
    nodes.push(node);
    const bucket = rowMap.get(i) ?? [];
    bucket.push(node);
    rowMap.set(i, bucket);
  }

  return { nodes, rowMap, colCount };
}
