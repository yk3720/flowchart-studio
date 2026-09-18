import { parseTable } from "../table/parseTable";
import type { FlowTableRow } from "./types";

export function validateTable(
  table: FlowTableRow[],
  schema?: string
): string[] {
  const errors: string[] = [];
  if (!table.length) {
    errors.push("表が空です");
    return errors;
  }

  const colCount = table[0]?.length ?? 0;
  if (colCount < 6) {
    errors.push(`列数が不足しています（${colCount}列）。6列以上が必要です`);
  }

  for (let i = 0; i < table.length; i++) {
    const len = table[i]?.length ?? 0;
    if (len !== colCount) {
      errors.push(
        `行 ${i + 1}: 列数が先頭行（${colCount}）と一致しません（${len}列）`
      );
    }
  }

  const { nodes, issues } = parseTable(table, schema);
  if (nodes.length === 0) {
    errors.push("有効なノードが 1 件もありません（ID 列を確認してください）");
    return errors;
  }

  // サイレントに消えていた4点（ID重複/種別空欄/色未知値/段列重複）を可視化する（ADR-019/022）
  for (const issue of issues) {
    const at = `${issue.rowIndex + 1}行目`;
    switch (issue.kind) {
      case "duplicate_id":
        errors.push(`ID ${issue.id} が重複しています（${at}）`);
        break;
      case "empty_type":
        errors.push(`ID ${issue.id}: 図形種別が空欄です（${at}）`);
        break;
      case "unknown_color":
        errors.push(
          `ID ${issue.id}: 色 "${issue.detail}" は未対応の値です（黄/橙/青のみ有効、${at}）`
        );
        break;
    }
  }

  const ids = new Set(nodes.map((n) => n.id));
  for (const n of nodes) {
    for (const did of [...n.destsDown, ...n.destsRight]) {
      if (!ids.has(did)) {
        errors.push(`ID ${n.id}: 接続先 ${did} が見つかりません`);
      }
    }
  }

  const tierLevelGroups = new Map<string, string[]>();
  for (const n of nodes) {
    const tier = n.tier ?? n.rowIndex;
    const key = `${tier}:${n.level}`;
    const bucket = tierLevelGroups.get(key) ?? [];
    bucket.push(n.id);
    tierLevelGroups.set(key, bucket);
  }
  for (const groupIds of tierLevelGroups.values()) {
    if (groupIds.length > 1) {
      errors.push(
        `ID ${groupIds.join(", ")}: 段・列が重複しています（座標が重なり図形が隠れます）`
      );
    }
  }

  return errors;
}
