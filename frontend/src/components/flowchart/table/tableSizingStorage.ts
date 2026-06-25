const VERSION = "v1";

/**
 * localStorage キーを生成する。
 * 列数 · スキーマ · バージョンを組み合わせてスキーマ変更時に自動リセット。
 */
export function makeSizingStorageKey(
  colCount: number,
  tableSchema?: string
): string {
  const schema = tableSchema ?? `${colCount}col`;
  return `fs:col-widths:${schema}:${VERSION}`;
}

export function saveColWidths(key: string, widths: number[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(widths));
  } catch {
    // quota exceeded など
  }
}

/**
 * 保存済み幅を読み込む。配列長が expectedLength と一致しない場合は null。
 */
export function loadColWidths(
  key: string,
  expectedLength: number
): number[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      !Array.isArray(parsed) ||
      parsed.length !== expectedLength ||
      !parsed.every((v) => typeof v === "number" && isFinite(v))
    ) {
      return null;
    }
    return parsed as number[];
  } catch {
    return null;
  }
}
