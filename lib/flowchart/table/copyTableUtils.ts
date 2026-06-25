import type { FlowTableRow } from "../model/types";
import { TABLE_HEADERS_10 } from "./tableColumns";

function cellStr(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

/** 表データ行のみを TSV 文字列に変換（ヘッダーなし）。Web → Excel 貼付用。 */
export function tableToTsv(table: FlowTableRow[]): string {
  return table.map((row) => row.map(cellStr).join("\t")).join("\n");
}

/**
 * 10 列ヘッダー + サンプル 3 行（端子→処理→端子）の TSV。
 * 空白 Excel シートへ表の型を貼り付けるときに使う。
 */
export function columnFormatTsv(): string {
  const header = TABLE_HEADERS_10.join("\t");
  const samples: FlowTableRow[] = [
    [10, "端子", "20", "", 1, 0, "開始", "", "", ""],
    [20, "処理", "30", "", 2, 0, "処理ステップ", "", "", ""],
    [30, "端子", "", "", 3, 0, "終了", "", "", ""],
  ];
  const rows = samples.map((row) => row.map(cellStr).join("\t")).join("\n");
  return `${header}\n${rows}`;
}
