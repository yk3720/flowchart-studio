"use client";

import {
  createEmptyRow,
  getColumnHelp,
  getHeaders,
  getHelpEntries,
  isColorTableColumn,
  normalizeRow,
  resolveColumnCount,
  SHAPE_TYPE_OPTIONS,
  suggestNextId,
} from "@/lib/flowchart/table/tableColumns";
import { COLOR_HINT_SELECT_OPTIONS } from "@/lib/flowchart/visual/flowColors";
import {
  applyPartialPaste,
  parseClipboardGrid,
  parsePasteCellValue,
} from "@/lib/flowchart/table/pasteTableCells";
import type { FlowTableRow } from "@/lib/flowchart/model/types";
import { cn } from "@/lib/utils";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useSyncedHorizontalScroll } from "./table/useSyncedHorizontalScroll";
import { FlowTableDockScrollbar } from "./table/FlowTableDockScrollbar";
import { useTableColumnSizing } from "./table/useTableColumnSizing";
import {
  fcTableAddRowBtn,
  fcTableCell,
  fcTableCellIndex,
  fcTableCellInput,
  fcTableCellInputMono,
  fcTableDeleteBtn,
  fcTableHead,
  fcTableHeadCell,
  fcTableHeadCellAction,
  fcTableHeadCellIndex,
  fcTableHeadHelpMark,
  fcTableHelpDetails,
  fcTableHelpSummary,
  fcTableMeta,
  fcTableRow,
  fcTableRowError,
  fcTableScroll,
  fcTable,
  fcTableHeadCellText,
  fcTableResizeHandle,
  fcFocusRing,
} from "./flowchartUiClasses";

export type FlowTableEditorHandle = {
  scrollToRow: (rowIndex: number) => void;
};

type Props = {
  table: FlowTableRow[];
  onChange: (table: FlowTableRow[]) => void;
  errorRowIndices?: Set<number>;
  readOnly?: boolean;
  /** table-9col-v1 等 — 9列ヘッダー判定に使用 */
  tableSchema?: string;
  /** 表ペイン内ツールバー直下に挿入するスロット（CSV 取込 details 等） */
  csvPane?: React.ReactNode;
};

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

export const FlowTableEditor = forwardRef<FlowTableEditorHandle, Props>(
  function FlowTableEditor(
    { table, onChange, errorRowIndices, readOnly, tableSchema, csvPane },
    ref
  ) {
    const colCount = resolveColumnCount(table, tableSchema);
    const headers = getHeaders(colCount, tableSchema);
    const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
    const focusCellRef = useRef<{ row: number; col: number } | null>(null);
    const { colWidths, startResize, adjustWidth, resetWidths } =
      useTableColumnSizing(colCount, tableSchema);
    const { viewportRef, dockRef, innerRef, syncInnerWidth } =
      useSyncedHorizontalScroll();
    const [keyboardResizingIdx, setKeyboardResizingIdx] = useState<
      number | null
    >(null);

    // 列幅変化後に dock スクロールバー幅を同期
    useEffect(() => {
      syncInnerWidth();
    }, [colWidths, syncInnerWidth]);

    const handleHeaderKeyDown = (
      colIdx: number,
      e: KeyboardEvent<HTMLTableCellElement>
    ) => {
      if (keyboardResizingIdx === null) {
        if (e.key === "Enter") {
          e.preventDefault();
          setKeyboardResizingIdx(colIdx);
        }
      } else if (keyboardResizingIdx === colIdx) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          adjustWidth(colIdx, -10);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          adjustWidth(colIdx, 10);
        } else if (e.key === "Enter" || e.key === "Escape") {
          e.preventDefault();
          setKeyboardResizingIdx(null);
        }
      }
    };

    useImperativeHandle(ref, () => ({
      scrollToRow: (rowIndex: number) => {
        rowRefs.current[rowIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      },
    }));

    const updateTable = (next: FlowTableRow[]) => {
      onChange(next.map((row) => normalizeRow(row, colCount)));
    };

    const updateCell = (rowIndex: number, colIndex: number, raw: string) => {
      const next = table.map((row, ri) => {
        if (ri !== rowIndex) return normalizeRow(row, colCount);
        const cells = normalizeRow(row, colCount);
        cells[colIndex] = parsePasteCellValue(colIndex, colCount, raw);
        return cells;
      });
      updateTable(next);
    };

    const addRow = () => {
      const id = suggestNextId(table);
      updateTable([...table, createEmptyRow(colCount, id)]);
    };

    const deleteRow = (rowIndex: number) => {
      if (table.length <= 1) return;
      updateTable(table.filter((_, i) => i !== rowIndex));
    };

    const isShapeColumn = (colIndex: number) =>
      colCount >= 8 ? colIndex === 1 : colIndex === 1 && colCount >= 2;

    const isSelectColumn = (colIndex: number) =>
      isShapeColumn(colIndex) || isColorTableColumn(colIndex, colCount);

    const handlePaste = (e: React.ClipboardEvent) => {
      if (readOnly) return;
      const text = e.clipboardData.getData("text/plain");
      const grid = parseClipboardGrid(text);
      if (grid.length === 0) return;

      e.preventDefault();
      const startRow = focusCellRef.current?.row ?? 0;
      const startCol = focusCellRef.current?.col ?? 0;
      updateTable(applyPartialPaste(table, startRow, startCol, grid, colCount));
    };

    const bindCellFocus = (rowIndex: number, colIndex: number) => ({
      onFocus: () => {
        focusCellRef.current = { row: rowIndex, col: colIndex };
      },
    });

    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {!readOnly ? (
            <button type="button" onClick={addRow} className={fcTableAddRowBtn}>
              行を追加
            </button>
          ) : null}
          <button
            type="button"
            onClick={resetWidths}
            className={fcTableAddRowBtn}
          >
            列幅をリセット
          </button>
          <span className={fcTableMeta}>
            {table.length} 行 · {colCount} 列
          </span>
        </div>

        {csvPane}

        <details className={fcTableHelpDetails}>
          <summary className={fcTableHelpSummary}>列の意味（ヘルプ）</summary>
          {colCount >= 8 ? (
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              {getHelpEntries(colCount, tableSchema).map(({ header, help }) => (
                <li key={header}>
                  <strong>{header}</strong> — {help}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1">
              9 列形式（段・列）を推奨します。判断の No
              分岐には接続先(右)が必要です。
            </p>
          )}
          {!readOnly ? (
            <p className="mt-2 text-flow-text-muted">
              Excel からコピーした範囲は、貼り付け先のセルを選んで Ctrl+V
              で部分貼り付けできます。
            </p>
          ) : null}
        </details>

        <div
          ref={viewportRef}
          className={fcTableScroll}
          onPasteCapture={handlePaste}
        >
          <table className={fcTable}>
            <colgroup>
              {colWidths.map((w, i) => (
                <col key={i} style={{ width: w }} />
              ))}
            </colgroup>
            <thead className={fcTableHead}>
              <tr>
                <th className={fcTableHeadCellIndex}>#</th>
                {headers.map((h, colIndex) => {
                  const fullIdx = colIndex + 1;
                  const help = getColumnHelp(h, colCount);
                  const isKbResizing = keyboardResizingIdx === fullIdx;
                  return (
                    <th
                      key={h}
                      className={cn(
                        fcTableHeadCell,
                        fcFocusRing,
                        isKbResizing && "ring-2 ring-inset ring-flow-accent"
                      )}
                      tabIndex={0}
                      onKeyDown={(e) => handleHeaderKeyDown(fullIdx, e)}
                    >
                      <span className={fcTableHeadCellText} title={help ?? h}>
                        {h}
                        {help && <span className={fcTableHeadHelpMark}>?</span>}
                      </span>
                      <span
                        className={fcTableResizeHandle}
                        onMouseDown={(e) => startResize(fullIdx, e)}
                      />
                    </th>
                  );
                })}
                <th className={fcTableHeadCellAction} />
              </tr>
            </thead>
            <tbody>
              {table.map((row, rowIndex) => {
                const hasError = errorRowIndices?.has(rowIndex);
                return (
                  <tr
                    key={rowIndex}
                    ref={(el) => {
                      rowRefs.current[rowIndex] = el;
                    }}
                    data-row-index={rowIndex}
                    className={cn(fcTableRow, hasError && fcTableRowError)}
                  >
                    <td className={fcTableCellIndex}>{rowIndex + 1}</td>
                    {headers.map((h, colIndex) => (
                      <td key={colIndex} className={fcTableCell}>
                        {isSelectColumn(colIndex) ? (
                          <select
                            value={
                              isColorTableColumn(colIndex, colCount)
                                ? cellToString(row[colIndex])
                                : cellToString(row[colIndex]) || "処理"
                            }
                            onChange={(e) =>
                              updateCell(rowIndex, colIndex, e.target.value)
                            }
                            disabled={readOnly}
                            className={fcTableCellInput}
                            aria-label={`行${rowIndex + 1} ${h}`}
                            title={cellToString(row[colIndex])}
                            {...bindCellFocus(rowIndex, colIndex)}
                          >
                            {(isColorTableColumn(colIndex, colCount)
                              ? COLOR_HINT_SELECT_OPTIONS
                              : SHAPE_TYPE_OPTIONS.map((opt) => ({
                                  value: opt,
                                  label: opt,
                                }))
                            ).map((opt) => (
                              <option
                                key={opt.value || "__empty"}
                                value={opt.value}
                              >
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={cellToString(row[colIndex])}
                            onChange={(e) =>
                              updateCell(rowIndex, colIndex, e.target.value)
                            }
                            readOnly={readOnly}
                            className={fcTableCellInputMono}
                            aria-label={`行${rowIndex + 1} ${h}`}
                            title={cellToString(row[colIndex])}
                            {...bindCellFocus(rowIndex, colIndex)}
                          />
                        )}
                      </td>
                    ))}
                    <td className={fcTableCellIndex}>
                      {!readOnly ? (
                        <button
                          type="button"
                          onClick={() => deleteRow(rowIndex)}
                          disabled={table.length <= 1}
                          className={fcTableDeleteBtn}
                          aria-label={`行${rowIndex + 1}を削除`}
                        >
                          行を削除
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <FlowTableDockScrollbar dockRef={dockRef} innerRef={innerRef} />
      </div>
    );
  }
);
