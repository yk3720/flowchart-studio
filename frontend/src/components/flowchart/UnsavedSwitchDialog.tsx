"use client";

import { useEffect, useRef } from "react";
import {
  fcBtnAccent,
  fcBtnCancel,
  fcBtnSecondary,
  fcDialogBody,
  fcDialogOverlay,
  fcDialogPanel,
  fcDialogTitle,
} from "./flowchartUiClasses";

function getFocusables(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  );
}

type Props = {
  open: boolean;
  /** 「保存して切替」ボタン */
  onSave: () => void;
  /** 「破棄して切替」ボタン */
  onDiscard: () => void;
  onCancel: () => void;
  pending?: boolean;
};

/** 未保存切替確認ダイアログ（保存 / 破棄 / キャンセル） */
export function UnsavedSwitchDialog({
  open,
  onSave,
  onDiscard,
  onCancel,
  pending = false,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement;
    const panel = panelRef.current;
    if (!panel) return;

    const focusables = getFocusables(panel);
    focusables[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (!pending) onCancel();
        return;
      }
      if (e.key !== "Tab") return;

      const currentFocusables = getFocusables(panel);
      if (currentFocusables.length === 0) return;

      const first = currentFocusables[0];
      const last = currentFocusables[currentFocusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [open, onCancel, pending]);

  if (!open) return null;

  return (
    <div
      className={fcDialogOverlay}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !pending) onCancel();
      }}
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unsaved-switch-title"
        className={fcDialogPanel}
      >
        <h2 id="unsaved-switch-title" className={fcDialogTitle}>
          未保存の変更があります
        </h2>
        <p className={fcDialogBody}>
          保存してから切り替えますか？保存せずに切り替えると、編集内容は破棄されます。
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
            disabled={pending}
            onClick={onDiscard}
            data-testid="unsaved-switch-discard"
            className={fcBtnSecondary}
          >
            破棄して切替
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onSave}
            data-testid="unsaved-switch-save"
            className={fcBtnAccent}
          >
            保存して切替
          </button>
        </div>
      </div>
    </div>
  );
}
