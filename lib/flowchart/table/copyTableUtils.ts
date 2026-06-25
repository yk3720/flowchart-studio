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

/** 10 列ヘッダー行のみの TSV。Excel シートへ列構造を貼り付けるときに使う（T3 ヘッダーをコピー）。 */
export function columnFormatTsv(): string {
  return TABLE_HEADERS_10.join("\t");
}
