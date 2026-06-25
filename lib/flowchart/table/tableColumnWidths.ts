/** 表エディタ — 列デフォルト幅 SSOT（px） */

/** # (インデックス) 列 */
export const COL_WIDTH_INDEX = 40;

/** アクション (削除ボタン) 列 */
export const COL_WIDTH_ACTION = 72;

/**
 * データ列のデフォルト幅 (px)。
 * 順序は TABLE_HEADERS_8 / 9 / 10 / 10_V2 に対応。
 */
const DATA_COL_WIDTHS_8 = [
  48, // ID
  72, // 図形種別
  80, // 接続先(下)
  80, // 接続先(右)
  56, // Level
  160, // Text1
  160, // Text2
  160, // Text3
] as const;

const DATA_COL_WIDTHS_9 = [
  48, // ID
  72, // 図形種別
  80, // 接続先(下)
  80, // 接続先(右)
  48, // 段
  48, // 列
  160, // Text1
  160, // Text2
  160, // Text3
] as const;

const DATA_COL_WIDTHS_10 = [
  48, // ID
  72, // 図形種別
  80, // 接続先(下)
  80, // 接続先(右)
  48, // 段
  48, // 列
  160, // Text1
  160, // Text2
  160, // Text3
  72, // 色
] as const;

/** 10列 v2 列幅（ADR-016: 接続先 80px → 48px） */
const DATA_COL_WIDTHS_10_V2 = [
  48, // ID
  72, // 図形種別
  72, // 色
  48, // 接続先(下)  ← 80px → 48px
  48, // 接続先(右)  ← 80px → 48px
  48, // 段
  48, // 列
  160, // Text1
  160, // Text2
  160, // Text3
] as const;

/**
 * colCount と tableSchema から全列幅配列を返す。
 * [# インデックス, ...データ列, アクション] の順。
 * colgroup の <col> 要素に対応する。
 */
export function getDefaultColWidths(
  colCount: number,
  tableSchema?: string
): number[] {
  let dataWidths: readonly number[];
  if (colCount >= 10) {
    dataWidths =
      tableSchema === "table-10col-v2"
        ? DATA_COL_WIDTHS_10_V2
        : DATA_COL_WIDTHS_10;
  } else if (colCount >= 9) {
    dataWidths = DATA_COL_WIDTHS_9;
  } else {
    dataWidths = DATA_COL_WIDTHS_8;
  }
  return [COL_WIDTH_INDEX, ...dataWidths, COL_WIDTH_ACTION];
}

/** デフォルト幅の合計 (px) — スクロール基準幅として参照可 */
export function getTotalDefaultWidth(
  colCount: number,
  tableSchema?: string
): number {
  return getDefaultColWidths(colCount, tableSchema).reduce((s, w) => s + w, 0);
}
