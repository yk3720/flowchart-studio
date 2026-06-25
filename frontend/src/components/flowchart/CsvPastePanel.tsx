"use client";

import { useRef, useState } from "react";
import { parseCsvPaste } from "@/lib/flowchart/table/parseCsv";
import type { FlowTableRow } from "@/lib/flowchart/model/types";
import {
  fcBtnCompactPrimary,
  fcBtnCompactSecondary,
  fcPastePanel,
  fcPastePanelTitle,
  fcPasteTextarea,
  fcStatusText,
} from "./flowchartUiClasses";

type Props = {
  onApply: (table: FlowTableRow[]) => void;
};

export function CsvPastePanel({ onApply }: Props) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyTable = (table: FlowTableRow[], detail: string) => {
    if (table.length === 0) {
      setMessage("表にできる行がありません");
      return;
    }
    onApply(table);
    setMessage(`${detail} — ${table.length} 行を表に反映しました`);
    setText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePasteApply = () => {
    const { table, errors } = parseCsvPaste(text);
    if (errors.length > 0) {
      setMessage(errors.join(" / "));
      return;
    }
    applyTable(table, "貼り付け");
  };

  const handleExcelFile = async (file: File | undefined) => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (ext !== "xlsx" && ext !== "xls") {
      setMessage(".xlsx または .xls を選んでください");
      return;
    }
    try {
      const buffer = await file.arrayBuffer();
      const { parseExcelBuffer } =
        await import("@/lib/flowchart/table/parseExcel");
      const { table, errors, sheetName } = parseExcelBuffer(buffer);
      if (errors.length > 0) {
        setMessage(errors.join(" / "));
        return;
      }
      applyTable(table, `Excel（シート: ${sheetName}）`);
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Excel ファイルの読み込みに失敗しました"
      );
    }
  };

  return (
    <div className={fcPastePanel}>
      <p className={fcPastePanelTitle}>CSV / Excel 取込</p>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setMessage(null);
        }}
        placeholder="Excel やスプレッドシートから表をコピーして貼り付け（タブ区切り）"
        rows={3}
        className={fcPasteTextarea}
        aria-label="CSV 貼り付け"
      />
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handlePasteApply}
          disabled={!text.trim()}
          className={fcBtnCompactPrimary}
        >
          表に貼り付け
        </button>
        <label className={fcBtnCompactSecondary}>
          Excelから取込…
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="sr-only"
            onChange={(e) => {
              setMessage(null);
              void handleExcelFile(e.target.files?.[0]);
            }}
          />
        </label>
        {message ? (
          <span className={`text-xs ${fcStatusText}`} role="status">
            {message}
          </span>
        ) : null}
      </div>
    </div>
  );
}
