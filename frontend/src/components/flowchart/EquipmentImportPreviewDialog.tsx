"use client";

import { useEffect, useRef } from "react";

import type { EquipmentImportPreviewState } from "@/lib/flowchart/import/equipmentImportPreview";
import { cn } from "@/lib/utils";

import {
  fcBtnCancel,
  fcBtnPrimary,
  fcDialogBody,
  fcDialogOverlay,
  fcDialogPanel,
  fcDialogTitle,
  fcStatusText,
} from "./flowchartUiClasses";

type EquipmentImportPreviewDialogProps = {
  preview: EquipmentImportPreviewState;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function EquipmentImportPreviewDialog({
  preview,
  pending,
  onCancel,
  onConfirm,
}: EquipmentImportPreviewDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const canCommit = preview.errors.length === 0;

  useEffect(() => {
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("button")?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel, pending]);

  const sourceLabel =
    preview.sourceKind === "xlsx" ? "Excel（正規化済み）" : "import.json";

  return (
    <div
      className={fcDialogOverlay}
      role="presentation"
      onMouseDown={(e) => {
        if (!pending && e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="equipment-import-preview-title"
        className={cn(fcDialogPanel, "max-w-lg")}
        data-testid="equipment-import-preview"
      >
        <h2 id="equipment-import-preview-title" className={fcDialogTitle}>
          装置取込の確認
        </h2>

        <p className={cn("mt-2 text-sm", fcStatusText)}>
          内容を確認してから取込してください。警告がある場合も続行できます。
        </p>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 font-medium text-flow-text-body">
              ファイル
            </dt>
            <dd className={fcStatusText}>{preview.sourceName}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 font-medium text-flow-text-body">
              種別
            </dt>
            <dd className={fcStatusText}>{sourceLabel}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 font-medium text-flow-text-body">
              社内番号
            </dt>
            <dd className="font-medium text-flow-text-body">
              {preview.internalCode}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 font-medium text-flow-text-body">
              装置名
            </dt>
            <dd className={fcStatusText}>{preview.displayName}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 font-medium text-flow-text-body">
              構成
            </dt>
            <dd className={fcStatusText}>
              ユニット {preview.unitCount} · 動作 {preview.moduleCount} · フロー{" "}
              {preview.flowCount}
            </dd>
          </div>
        </dl>

        {preview.warnings.length > 0 ? (
          <div
            role="status"
            className="mt-4 rounded-md border border-flow-warning-text/30 bg-flow-warning-bg px-3 py-2 text-sm text-flow-warning-text"
          >
            <p className="font-medium">警告（取込は続行できます）</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {preview.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {preview.errors.length > 0 ? (
          <div
            role="alert"
            className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            <p className="font-medium">エラー（取込できません）</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {preview.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className={cn("mt-4 text-xs", fcDialogBody, fcStatusText)}>
          取込すると既存装置のフロー表が更新されます。構成から削除した項目は DB
          からは自動削除されません。
        </p>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={onCancel}
            className={fcBtnCancel}
          >
            キャンセル
          </button>
          <button
            type="button"
            disabled={pending || !canCommit}
            onClick={onConfirm}
            data-testid="equipment-import-commit"
            className={fcBtnPrimary}
          >
            {pending ? "取込中…" : "取込"}
          </button>
        </div>
      </div>
    </div>
  );
}
