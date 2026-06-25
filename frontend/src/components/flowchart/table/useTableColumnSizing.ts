import { useCallback, useEffect, useRef, useState } from "react";
import { getDefaultColWidths } from "@/lib/flowchart/table/tableColumnWidths";
import {
  loadColWidths,
  makeSizingStorageKey,
  saveColWidths,
} from "./tableSizingStorage";

const MIN_COL_WIDTH = 40;

/**
 * 列幅リサイズ管理 hook。
 * colWidths は [# インデックス, ...データ列, アクション] の全列幅。
 * colIdx は colWidths 配列のインデックスと対応する（# = 0）。
 */
function loadWidthsForSizing(colCount: number, tableSchema?: string): number[] {
  const defaults = getDefaultColWidths(colCount, tableSchema);
  const key = makeSizingStorageKey(colCount, tableSchema);
  return loadColWidths(key, defaults.length) ?? defaults;
}

export function useTableColumnSizing(colCount: number, tableSchema?: string) {
  const [prevSizing, setPrevSizing] = useState({ colCount, tableSchema });
  const [colWidths, setColWidths] = useState<number[]>(() =>
    loadWidthsForSizing(colCount, tableSchema)
  );

  // colCount / schema 変化時: 対応する保存値 or デフォルト幅をロード
  if (
    prevSizing.colCount !== colCount ||
    prevSizing.tableSchema !== tableSchema
  ) {
    setPrevSizing({ colCount, tableSchema });
    setColWidths(loadWidthsForSizing(colCount, tableSchema));
  }

  // 幅変化を localStorage に保存
  useEffect(() => {
    const key = makeSizingStorageKey(colCount, tableSchema);
    saveColWidths(key, colWidths);
  }, [colCount, tableSchema, colWidths]);

  // startResize が安定参照を持てるよう、最新幅を ref で保持
  const colWidthsRef = useRef(colWidths);
  useEffect(() => {
    colWidthsRef.current = colWidths;
  }, [colWidths]);

  const dragRef = useRef<{
    colIdx: number;
    startX: number;
    startWidth: number;
  } | null>(null);

  const startResize = useCallback((colIdx: number, e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = {
      colIdx,
      startX: e.clientX,
      startWidth: colWidthsRef.current[colIdx],
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (ev: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const delta = ev.clientX - drag.startX;
      const newWidth = Math.max(MIN_COL_WIDTH, drag.startWidth + delta);
      setColWidths((prev) => {
        const next = [...prev];
        next[drag.colIdx] = newWidth;
        return next;
      });
    };

    const onMouseUp = () => {
      dragRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  /** キーボード操作用: 指定列を delta px 調整（min 40px クランプ） */
  const adjustWidth = useCallback((colIdx: number, delta: number) => {
    setColWidths((prev) => {
      const next = [...prev];
      next[colIdx] = Math.max(MIN_COL_WIDTH, (next[colIdx] ?? 0) + delta);
      return next;
    });
  }, []);

  const resetWidths = useCallback(() => {
    setColWidths(getDefaultColWidths(colCount, tableSchema));
  }, [colCount, tableSchema]);

  return { colWidths, startResize, adjustWidth, resetWidths };
}
