export type RulerSegment = {
  key: string;
  index: number;
  start: number;
  size: number;
};

/**
 * ノードを論理キー（段=tier・列=level）でグルーピングし、段・列ルーラーの区切りを求める
 * （FlowCanvas の段・列ルーラー用）。
 *
 * 表示座標（`start`/`size` の元になる getStart/getSize の戻り値）だけでグルーピングすると、
 * 〇（省略記号）は列内で中央寄せ・縮小され、判断（菱形）は行内で縦に拡大されるため、
 * 同じ段・列にいるはずのノードが別区画として分かれてしまう（`flowchart-excel` 2026-09-15
 * で列ルーラーの数字が重なる形で顕在化）。論理キー（tier/level の値そのもの）でグルーピング
 * し、区画の `start` はグループ内の最小値、`size` はグループ内の最大値を採用することで、
 * 中央寄せ・拡大された図形が単独でも区画の境界がズレない。
 */
export function computeRulerSegments<T>(
  nodes: T[],
  getGroupKey: (node: T) => number,
  getStart: (node: T) => number,
  getSize: (node: T) => number
): RulerSegment[] {
  const groups = new Map<number, { start: number; size: number }>();
  for (const n of nodes) {
    const key = getGroupKey(n);
    const start = getStart(n);
    const size = getSize(n);
    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, { start, size });
    } else {
      existing.start = Math.min(existing.start, start);
      existing.size = Math.max(existing.size, size);
    }
  }
  return [...groups.entries()]
    .sort(([, a], [, b]) => a.start - b.start)
    .map(([key, v], i) => ({
      key: String(key),
      // 表側の段・列は 0 始まり（ADR-012）。ルーラー表示もそれに合わせて 0 始まりにする。
      index: i,
      start: v.start,
      size: v.size,
    }));
}
