"use client";

import {
  loadDesignMemos,
  saveDesignMemo,
  type DesignMemoTarget,
  type DesignMemos,
} from "@/lib/flowchart/actions/design/designMemos";
import { isAuthDisabled } from "@/lib/supabase/env";
import { useState } from "react";
import {
  fcBtnCompactPrimary,
  fcBtnCompactSecondary,
  fcPasteTextarea,
  fcStatusText,
  fcTableHelpDetails,
  fcTableHelpSummary,
} from "./flowchartUiClasses";

type MemoFieldProps = {
  label: string;
  value: string;
  savedValue: string;
  readOnly: boolean;
  saving: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
  testId: string;
};

function MemoField({
  label,
  value,
  savedValue,
  readOnly,
  saving,
  onChange,
  onSave,
  testId,
}: MemoFieldProps) {
  const dirty = value !== savedValue;

  if (readOnly) {
    if (!savedValue) {
      return (
        <p className={fcStatusText} data-testid={`${testId}-empty`}>
          {label} — 未記入
        </p>
      );
    }
    return (
      <div data-testid={testId}>
        <p className="mb-1 text-xs font-medium text-flow-text-muted">{label}</p>
        <p className="whitespace-pre-wrap text-sm">{savedValue}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2" data-testid={testId}>
      <label className="text-xs font-medium text-flow-text-muted">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className={fcPasteTextarea}
        placeholder={`${label}を入力…`}
        data-testid={`${testId}-input`}
      />
      <button
        type="button"
        onClick={onSave}
        disabled={!dirty || saving}
        className={fcBtnCompactPrimary}
        data-testid={`${testId}-save`}
      >
        保存
      </button>
    </div>
  );
}

export type DesignMemoPanelsProps = {
  deviceId: string;
  deviceName: string;
  unitId: string;
  unitLabel: string;
  moduleId: string;
  initialMemos: DesignMemos;
  readOnly: boolean;
  onMemoSaved: (target: DesignMemoTarget, memo: string) => void;
};

export function DesignMemoPanels({
  deviceId,
  deviceName,
  unitId,
  unitLabel,
  moduleId,
  initialMemos,
  readOnly,
  onMemoSaved,
}: DesignMemoPanelsProps) {
  const [moduleMemo, setModuleMemo] = useState(initialMemos.moduleMemo);
  const [unitMemo, setUnitMemo] = useState(initialMemos.unitMemo);
  const [deviceMemo, setDeviceMemo] = useState(initialMemos.deviceMemo);
  const [savedModuleMemo, setSavedModuleMemo] = useState(
    initialMemos.moduleMemo
  );
  const [savedUnitMemo, setSavedUnitMemo] = useState(initialMemos.unitMemo);
  const [savedDeviceMemo, setSavedDeviceMemo] = useState(
    initialMemos.deviceMemo
  );
  const [savingTarget, setSavingTarget] = useState<DesignMemoTarget | null>(
    null
  );
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveTarget = async (
    target: DesignMemoTarget,
    id: string,
    value: string
  ) => {
    if (savingTarget) return;
    setSavingTarget(target);
    setError(null);
    const result = await saveDesignMemo(target, id, value);
    setSavingTarget(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onMemoSaved(target, result.memo);
    if (target === "module") {
      setSavedModuleMemo(result.memo);
      setModuleMemo(result.memo);
    } else if (target === "unit") {
      setSavedUnitMemo(result.memo);
      setUnitMemo(result.memo);
    } else {
      setSavedDeviceMemo(result.memo);
      setDeviceMemo(result.memo);
    }
  };

  const handleRefresh = async () => {
    if (refreshing || isAuthDisabled()) return;
    setRefreshing(true);
    setError(null);
    const result = await loadDesignMemos({ deviceId, unitId, moduleId });
    setRefreshing(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setModuleMemo(result.memos.moduleMemo);
    setUnitMemo(result.memos.unitMemo);
    setDeviceMemo(result.memos.deviceMemo);
    setSavedModuleMemo(result.memos.moduleMemo);
    setSavedUnitMemo(result.memos.unitMemo);
    setSavedDeviceMemo(result.memos.deviceMemo);
  };

  if (isAuthDisabled()) {
    return (
      <>
        <details
          className={fcTableHelpDetails}
          data-testid="design-memo-module-panel"
        >
          <summary className={fcTableHelpSummary}>設計メモ（動作）</summary>
          <p className={fcStatusText}>
            認証無効モードでは設計メモは利用できません。
          </p>
        </details>
        <details
          className={fcTableHelpDetails}
          data-testid="design-memo-context-panel"
        >
          <summary className={fcTableHelpSummary}>
            設計メモ（ユニット/装置）
          </summary>
          <p className={fcStatusText}>
            認証無効モードでは設計メモは利用できません。
          </p>
        </details>
      </>
    );
  }

  const hasModuleContent = Boolean(savedModuleMemo);
  const hasContextContent = Boolean(savedUnitMemo || savedDeviceMemo);

  return (
    <>
      <details
        className={fcTableHelpDetails}
        data-testid="design-memo-module-panel"
      >
        <summary className={fcTableHelpSummary}>
          設計メモ（動作）
          {hasModuleContent ? " — あり" : ""}
        </summary>
        <div className="mt-2 space-y-2">
          <MemoField
            label="動作の設計意図 · PLC 向け注意"
            value={moduleMemo}
            savedValue={savedModuleMemo}
            readOnly={readOnly}
            saving={savingTarget === "module"}
            onChange={setModuleMemo}
            onSave={() => void saveTarget("module", moduleId, moduleMemo)}
            testId="design-memo-module"
          />
        </div>
      </details>

      <details
        className={fcTableHelpDetails}
        data-testid="design-memo-context-panel"
      >
        <summary className={fcTableHelpSummary}>
          設計メモ（ユニット/装置）
          {hasContextContent ? " — あり" : ""}
        </summary>
        <div className="mt-2 space-y-4">
          <MemoField
            label={`ユニット — ${unitLabel}`}
            value={unitMemo}
            savedValue={savedUnitMemo}
            readOnly={readOnly}
            saving={savingTarget === "unit"}
            onChange={setUnitMemo}
            onSave={() => void saveTarget("unit", unitId, unitMemo)}
            testId="design-memo-unit"
          />
          <MemoField
            label={`装置 — ${deviceName}`}
            value={deviceMemo}
            savedValue={savedDeviceMemo}
            readOnly={readOnly}
            saving={savingTarget === "device"}
            onChange={setDeviceMemo}
            onSave={() => void saveTarget("device", deviceId, deviceMemo)}
            testId="design-memo-device"
          />
          {!readOnly ? (
            <button
              type="button"
              onClick={() => void handleRefresh()}
              disabled={refreshing}
              className={fcBtnCompactSecondary}
            >
              {refreshing ? "再読込中…" : "再読込"}
            </button>
          ) : null}
        </div>
      </details>

      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
