import type { FitViewOptions } from "@xyflow/react";

import { cn } from "@/lib/utils";

/** 表ペイン : プレビュー = 2fr : 3fr（12カラムではなく比率グリッド） */
export const FC_WORKSPACE_MAIN_GRID = "lg:grid-cols-[2fr_3fr]";

/* ── サーフェス・枠（@theme flow-* · globals.css） ── */

export const fcSurface = "bg-flow-surface text-flow-text";
export const fcSurfaceMuted = "bg-flow-surface-muted";
export const fcBorderB = "border-b border-flow-border";
export const fcBorderR = "border-r border-flow-border";
export const fcBorderStrong = "border-flow-border-strong";

/* ── アクセシビリティ（A11Y_RULES §4 · flowchartUiClasses SSOT） ── */

/** WCAG 2.4.7 — chrome 共通フォーカスリング */
export const fcFocusRing =
  "outline-none focus-visible:outline-3 focus-visible:outline-flow-accent focus-visible:outline-offset-2";

/** WCAG 2.5.8 — 最小タップ領域 24px（`min-h-6` / `min-w-6`） */
export const fcTargetMin =
  "inline-flex min-h-6 min-w-6 items-center justify-center";

/** 操作 UI 本文 — 14px（WCAG 実務推奨 · ボタン・表・メニュー） */
export const fcTextUi = "text-[length:var(--flow-font-ui)] leading-normal";

/** 補助ラベル — 12px 下限（キャプション・セクション説明のみ） */
export const fcTextHint = "text-[length:var(--flow-font-hint)] leading-snug";

/** ズーム等の正方形コントロール — 32px */
export const fcControlSquare = cn(
  fcFocusRing,
  "inline-flex size-[var(--flow-control-size)] shrink-0 items-center justify-center"
);

/* ── ボタン ── */

export const fcBtn = cn(
  fcFocusRing,
  fcTargetMin,
  fcTextUi,
  "min-h-[var(--flow-control-size)] rounded-md px-3 py-1.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
);

export const fcBtnPrimary = cn(
  fcBtn,
  "bg-flow-accent text-white hover:bg-flow-accent-hover"
);

export const fcBtnSecondary = cn(
  fcBtn,
  "border border-flow-border-strong text-flow-text-body hover:bg-flow-surface-muted"
);

export const fcBtnAccent = cn(
  fcBtn,
  "border border-flow-accent-muted-border bg-flow-accent-muted text-flow-accent-muted-text hover:bg-flow-accent-selected-bg"
);

export const fcBtnCancel = fcBtnSecondary;

export const fcBtnDanger = cn(
  fcBtn,
  "bg-flow-danger text-white hover:bg-flow-danger-hover"
);

export const fcBtnDangerOutline = cn(
  fcBtn,
  "border border-flow-danger-border text-flow-danger-text hover:bg-flow-danger-muted"
);

/** CSV 貼り付けパネル内の小さめボタン */
export const fcBtnCompactPrimary = cn(
  fcBtn,
  "bg-flow-accent px-2.5 py-1 text-white hover:bg-flow-accent-hover disabled:opacity-40"
);

export const fcBtnCompactSecondary = cn(
  fcFocusRing,
  fcTargetMin,
  fcTextUi,
  "min-h-[var(--flow-control-size)] cursor-pointer rounded-md border border-flow-border-input bg-flow-surface px-2.5 py-1 font-medium text-flow-text-body hover:bg-flow-surface-subtle"
);

export const fcBtnCompactWarning = cn(
  fcTextUi,
  "min-h-[var(--flow-control-size)] rounded-md bg-flow-warning px-2.5 py-1 font-medium text-white hover:bg-flow-warning-emphasis"
);

/* ── ダイアログ ── */

export const fcDialogOverlay =
  "fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4";

export const fcDialogPanel = cn(
  "w-full max-w-md rounded-lg border border-flow-border bg-flow-surface p-5 shadow-xl"
);

export const fcDialogTitle = "text-base font-semibold text-flow-text";
export const fcDialogBody = "mt-2 text-sm text-flow-text-muted";

/* ── バナー・強調 ── */

export const fcStatusBanner = "px-3 py-2 text-sm";

export const fcWarningBanner = cn(
  fcBorderB,
  "bg-flow-warning-bg px-4 py-2 text-sm text-flow-warning-text"
);

export const fcWarningBannerHint =
  "mt-0.5 text-xs text-flow-warning-text-subtle";

export const fcWarningCallout = cn(
  "rounded-md border border-flow-warning-border-strong bg-flow-warning-bg px-2.5 py-2 text-xs text-flow-warning-text"
);

export const fcErrorBanner = cn(
  fcBorderB,
  "bg-flow-danger-muted px-4 py-2 text-sm text-flow-danger-text"
);

export const fcErrorBannerLink = cn(
  fcFocusRing,
  "text-left underline hover:text-flow-danger-text-emphasis"
);

export const fcWarningBannerLink = cn(
  fcFocusRing,
  "text-left underline hover:text-flow-warning-text-emphasis"
);

export const fcStatusBannerSuccess = cn(
  fcBorderB,
  "border-flow-success-border bg-flow-success-bg text-flow-success-text"
);

export const fcStatusBannerError = cn(
  fcBorderB,
  "bg-flow-danger-muted text-flow-danger-text"
);

export const fcStatusBannerNeutral = cn(
  fcBorderB,
  "bg-flow-warning-bg text-flow-warning-text"
);

/* ── 認証バー（ワークスペース chrome） ── */

export const fcAuthBar = cn(
  fcBorderB,
  "flex flex-wrap items-center gap-3 bg-flow-surface-muted px-3 py-2 text-xs text-flow-text-muted"
);

export const fcAuthBarDevBadge = cn(
  "rounded bg-flow-warning-bg px-2 py-0.5 font-medium text-flow-warning-text"
);

export const fcAuthBarRoleBadge =
  "ml-2 rounded bg-flow-surface-subtle px-1.5 py-0.5 font-medium text-flow-text-body";

export const fcAuthBarAdminLink = cn(
  fcFocusRing,
  fcTargetMin,
  "rounded border border-flow-border-strong px-2 py-1 hover:bg-flow-surface"
);

export const fcAuthBarSignOutBtn = cn(
  fcFocusRing,
  fcTargetMin,
  "rounded border border-flow-border-strong px-2 py-1 hover:bg-flow-surface"
);

export const fcModuleLoadingOverlay =
  "absolute inset-0 z-20 flex items-center justify-center bg-flow-surface/85 text-sm font-medium text-flow-text-muted";

export const fcStaleRing = "ring-2 ring-flow-warning-ring ring-offset-1";
export const fcStaleRingInset = "ring-2 ring-inset ring-flow-warning-ring";

export const fcStaleOverlay =
  "pointer-events-none absolute inset-0 flex items-start justify-center bg-flow-warning-bg/70 p-4";

export const fcStaleCallout = cn(
  "pointer-events-auto max-w-md rounded-md border border-flow-warning-border-strong bg-flow-surface px-3 py-2 text-center text-sm text-flow-warning-text shadow-sm"
);

/* ── リンク・バッジ ── */

export const fcLink = cn(
  fcFocusRing,
  "font-medium text-flow-accent underline hover:text-flow-accent-emphasis"
);

export const fcBadgeAccent =
  "rounded-full bg-flow-accent-selected-bg px-2 py-0.5 text-xs font-medium text-flow-accent-muted-text";

export const fcBadgeMuted =
  "rounded bg-flow-surface-subtle px-2 py-0.5 text-xs text-flow-text-muted";

/* ── モバイルタブ ── */

export const fcMobileTabBase = cn(
  fcFocusRing,
  fcTargetMin,
  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
);

export const fcMobileTabGroup = cn(
  "inline-flex rounded-md border border-flow-border-strong p-0.5 text-xs"
);

export const fcMobileTabActive = cn(
  fcFocusRing,
  fcTargetMin,
  "rounded-md bg-flow-nav-active px-3 py-1.5 text-white"
);

export const fcMobileTabIdle = cn(
  fcMobileTabBase,
  "text-flow-text-muted hover:bg-flow-surface-muted"
);

/* ── 左ナビ ── */

export const fcNavSelect = cn(
  fcFocusRing,
  "w-full rounded-md border border-flow-border-strong bg-flow-surface px-3 py-1.5 text-sm text-flow-text-body"
);

/** ユニット行（▶ + ラベル + 削除）— 背景帯で動作行と対比 */
export const fcNavUnitRow = cn(
  "flex items-center gap-0.5 rounded-md bg-flow-surface-subtle"
);

export const fcNavUnitToggle = cn(
  fcFocusRing,
  fcTargetMin,
  "justify-start flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm font-semibold text-flow-text-body hover:bg-flow-surface-muted/60"
);

/** 動作リスト — ユニットラベル開始 + 約1文字分のインデント */
export const fcNavModuleList =
  "flex flex-col gap-0.5 pl-[calc(0.5rem+1rem+0.375rem+0.25em)]";

export const fcNavModuleBtn = cn(
  fcFocusRing,
  fcTargetMin,
  "justify-start min-w-0 flex-1 rounded-md px-2 py-1.5 text-left text-sm transition-colors"
);

export function fcNavModuleBtnState(selected: boolean): string {
  return selected
    ? "border-l-2 border-flow-accent bg-flow-accent-selected-bg pl-[calc(0.5rem-2px)] font-medium text-flow-accent-selected-text"
    : "text-flow-text-muted hover:bg-flow-surface-subtle hover:text-flow-text-body";
}

export const fcNavToggleAllBtn = cn(
  fcFocusRing,
  fcTargetMin,
  "rounded-md p-1.5 text-flow-text-muted hover:bg-flow-surface-subtle"
);

/** 表ペイン内の小さめアイコンボタン（T5・列幅リセット等） */
export const fcTableIconBtn = cn(
  fcFocusRing,
  fcTargetMin,
  "shrink-0 rounded-md p-1.5 text-flow-text-muted hover:bg-flow-surface-subtle"
);

export const fcNavAside = cn(
  "flex h-full min-h-0 w-full flex-col bg-flow-surface-muted"
);

export const fcNavAsideCollapsed = cn(
  "flex h-full min-h-0 w-full flex-col items-center bg-flow-surface-muted py-3"
);

export const fcNavHeader = cn(
  "flex items-center justify-between gap-2 border-b border-flow-border px-3 py-2"
);

export const fcNavTitle = "truncate text-sm font-semibold text-flow-text-body";

export const fcNavIconBtn = cn(
  fcFocusRing,
  fcTargetMin,
  "rounded-md p-1.5 text-flow-text-muted hover:bg-flow-surface-subtle lg:hidden"
);

export const fcNavCollapseBtn = cn(
  fcFocusRing,
  fcTargetMin,
  "rounded-md p-2 text-flow-text-muted hover:bg-flow-surface-subtle"
);

export const fcNavDeleteBtn = cn(
  fcFocusRing,
  fcTargetMin,
  "shrink-0 rounded-md p-1.5 text-flow-text-muted hover:bg-flow-danger-muted hover:text-flow-danger-text"
);

export const fcNavChevron = "size-4 shrink-0 text-flow-text-muted";

export const fcNavLabel = cn(fcTextHint, "font-medium text-flow-text-muted");

export const fcNavBuildFootnote = cn(
  fcTextHint,
  "shrink-0 border-t border-flow-border px-3 py-2 text-[10px] leading-snug text-flow-text-muted tabular-nums"
);

/* ── その他メニュー ── */

/** §E: position:fixed でナビペインの overflow を抜ける。top/right は JS で注入 */
export const fcMenuDropdown = cn(
  "fixed z-30 min-w-[16rem] rounded-md border border-flow-border bg-flow-surface py-1 text-left shadow-lg"
);

export const fcMenuItem = cn(
  fcFocusRing,
  fcTargetMin,
  fcTextUi,
  "flex w-full items-center justify-start gap-2 px-3 py-2 text-left text-flow-text-body hover:bg-flow-surface-subtle"
);

export const fcMenuItemDanger = cn(
  fcFocusRing,
  fcTargetMin,
  fcTextUi,
  "flex w-full items-center justify-start gap-2 px-3 py-2 text-left text-flow-danger-text hover:bg-flow-danger-muted"
);

export const fcMenuSectionTitle = cn(
  fcTextUi,
  "px-3 pb-0.5 pt-1.5 text-left font-semibold text-flow-text-muted"
);

export const fcMenuSectionHint = cn(
  fcTextHint,
  "px-3 pb-1 text-left text-flow-text-muted"
);

export const fcMenuDivider = "my-1 border-t border-flow-border";

export const fcMenuChevron =
  "size-5 shrink-0 text-flow-text-muted transition-transform";

/* ── ペイン・セクション ── */

/** ペインリサイズハンドル — Separator 外枠 */
export const fcPaneResizeHandle =
  "group flex w-1.5 shrink-0 cursor-col-resize items-center justify-center bg-transparent transition-colors hover:bg-flow-surface-muted/60";

/** ペインリサイズハンドル — 中央バー（視覚インジケーター） */
export const fcPaneResizeHandleBar =
  "h-8 w-0.5 rounded-full bg-flow-border group-hover:bg-flow-accent transition-colors";

export const fcPaneHeader = "shrink-0 border-b border-flow-border px-4 py-2";

export const fcSectionTitle = "text-sm font-medium text-flow-text-body";

export const fcWorkspaceShell =
  "flex min-h-screen flex-col bg-flow-surface text-flow-text";

export const fcWorkspaceLoading =
  "flex min-h-screen items-center justify-center bg-flow-surface text-flow-text-body";

/* ── プレビュー領域 ── */

export const fcPreviewCanvasLg = cn(
  "h-full min-h-[280px] w-full bg-flow-surface-muted lg:min-h-0 lg:border-0 lg:border-l lg:border-flow-border"
);

export const fcPreviewCanvasMd = cn(
  "h-full min-h-[420px] w-full rounded-lg border border-flow-border bg-flow-surface-muted"
);

/** プレビュー canvas — keyboard pan/zoom フォーカス面 */
export const fcCanvasA11y = cn("relative outline-none", fcFocusRing);

export const fcEmptyState = cn(
  "flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-flow-border-strong bg-flow-surface-muted p-6 text-center text-sm text-flow-text-muted"
);

export const fcEmptyStateLg = cn(
  "flex min-h-[280px] flex-1 flex-col items-center justify-center gap-2 border border-dashed border-flow-border-strong bg-flow-surface-muted text-sm text-flow-text-muted lg:min-h-0 lg:border-0 lg:border-l"
);

export const fcEmptyStateMd = cn(
  "flex min-h-[420px] flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-flow-border-strong bg-flow-surface-muted text-sm text-flow-text-muted"
);

export const fcEmptyHint = "text-xs text-flow-text-muted";

/* ── CSV / 表ペイン ── */

export const fcPastePanel = cn(
  "rounded-md border border-dashed border-flow-border-strong bg-flow-surface-muted/80 p-2"
);

export const fcPastePanelTitle = cn(
  fcTextUi,
  "mb-1 font-medium text-flow-text-body"
);

export const fcPasteTextarea = cn(
  "w-full resize-y rounded border border-flow-border-strong p-2 font-mono text-xs"
);

export const fcStatusText = "text-flow-text-muted";
export const fcStatusStaleLabel = "mr-2 font-medium text-flow-warning";
export const fcStatusDraftHint = "ml-2 text-xs text-flow-text-muted";

/* ── 表エディタ ── */

export const fcTableHelpDetails = cn(
  fcTextHint,
  "rounded-md border border-flow-border bg-flow-surface-muted/90 px-2 py-1 text-flow-text-muted"
);

export const fcTableHelpSummary = cn(
  fcFocusRing,
  "cursor-pointer font-medium text-flow-text-body"
);

export const fcTableAddRowBtn = cn(
  fcFocusRing,
  fcTargetMin,
  fcTextUi,
  "min-h-[var(--flow-control-size)] rounded-md border border-flow-border-strong px-2.5 py-1 font-medium hover:bg-flow-surface-muted"
);

export const fcTableMeta = cn(fcTextHint, "text-flow-text-muted");

export const fcTableScroll = cn(
  "min-h-0 flex-1 overflow-auto scroll-pt-10 rounded-md border border-flow-border-strong"
);

export const fcTable = cn(fcTextUi, "border-collapse table-fixed");

export const fcTableHead = "sticky top-0 z-10 bg-flow-surface-subtle";

export const fcTableHeadCell = cn(
  "relative border-b border-flow-border px-2 py-1.5 text-left font-medium text-flow-text-body"
);

/** 列ヘッダー内のテキスト切り詰め（リサイズハンドルのスペースを確保） */
export const fcTableHeadCellText =
  "block overflow-hidden text-ellipsis whitespace-nowrap pr-2";

/** 列リサイズハンドル — ヘッダーセル右端 8px ヒット領域 */
export const fcTableResizeHandle = cn(
  "absolute inset-y-0 right-0 z-10 w-2 cursor-col-resize touch-none select-none",
  "border-r border-transparent hover:border-flow-accent"
);

export const fcTableHeadCellIndex = cn(
  "w-10 border-b border-flow-border px-1 py-1.5 text-center font-medium text-flow-text-muted"
);

export const fcTableHeadCellAction = cn(
  "w-16 border-b border-flow-border px-1 py-1.5"
);

export const fcTableHeadHelpMark = "ml-0.5 font-normal text-flow-text-muted";

export const fcTableRow =
  "odd:bg-flow-surface even:bg-flow-surface-muted/80 hover:bg-flow-accent-muted/40";

export const fcTableRowError =
  "bg-flow-danger-muted/90 ring-1 ring-inset ring-flow-danger-border";

export const fcTableCell = "border-b border-flow-border/60 px-0.5 py-0.5";

export const fcTableCellIndex = cn(
  fcTableCell,
  "px-1 text-center text-flow-text-muted"
);

export const fcTableCellInput = cn(
  fcFocusRing,
  fcTextUi,
  "scroll-mt-10 w-full text-ellipsis rounded border-0 bg-transparent px-1.5 py-1 focus:bg-flow-surface disabled:cursor-default disabled:opacity-90"
);

export const fcTableCellInputMono = cn(fcTableCellInput, "font-mono");

export const fcTableDeleteBtn = cn(
  fcFocusRing,
  fcTargetMin,
  fcTextHint,
  "rounded px-1 text-flow-danger hover:bg-flow-danger-muted disabled:cursor-not-allowed disabled:opacity-30"
);

/* ── プレビュー凡例（chrome 帯に inline 表示） ── */

export const fcColorLegend = cn(
  fcTextHint,
  "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-flow-border bg-flow-surface/95 px-2.5 py-1.5 text-flow-text-body shadow-sm"
);

/** @deprecated キャンバス内 absolute 配置は廃止。fcPreviewChrome 内に inline 配置 */
export const fcColorLegendFloating = cn(
  fcColorLegend,
  "pointer-events-none absolute bottom-2 left-2 z-10"
);

/* ── プレビュー列 chrome（凡例・ズームボタン帯 — スタンドアロン専用） ── */

export const fcPreviewChrome = cn(
  fcBorderB,
  "flex shrink-0 items-center justify-between gap-2 px-3 py-1.5"
);

/** ワークスペース用ズームオーバーレイ: キャンバス右上 absolute */
export const fcZoomOverlay = cn(
  "pointer-events-none absolute top-2 right-2 z-10",
  "flex items-center gap-1 rounded-md border border-flow-border bg-flow-surface/85 px-1.5 py-1 shadow-sm"
);

export const fcZoomBtn = cn(
  fcControlSquare,
  "rounded border border-flow-border-strong text-base font-medium text-flow-text-body hover:bg-flow-surface-muted"
);

export const fcZoomPercent = cn(
  fcTextUi,
  "flex h-[var(--flow-control-size)] min-w-12 shrink-0 items-center justify-center tabular-nums text-flow-text-body"
);

export type FcFitViewMode = "full";

/** PNG/SVG エクスポート — 全体が収まるセンター fit */
export function fcFitViewOptions(nodeCount: number): FitViewOptions {
  const maxZoom = 1.25;
  const duration = 200;
  const padding =
    nodeCount <= 5
      ? { top: 0.1, bottom: 0.16, left: 0.15, right: 0.15 }
      : { top: 0.1, bottom: 0.18, left: 0.15, right: 0.15 };
  return { padding, duration, maxZoom };
}
