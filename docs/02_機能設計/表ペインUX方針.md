# 表ペイン UX 方針 — レイアウト統一 · 列リサイズ · 横スクロール

**状態:** 合意済（2026-06-25）· **実装:** 未着手 · handoffs §4 参照  
**関連:** [UI仕様.md](./UI仕様.md) · [ボタン一覧.md](./ボタン一覧.md) · [プレビュー上部chrome方針.md](./プレビュー上部chrome方針.md)

---

## 背景

| 現象                                               | 原因（コード）                                                                                                                     |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| モジュール選択前後で表ペインの見え方が大きく変わる | 未選択時は空状態のみ。選択後に取込パネル・ヒント・表本体が一括表示                                                                 |
| 横スクロールバーが見つけにくい                     | `FlowchartEditor` 表ペイン body と `fcTableScroll` の **二重 `overflow-auto`**。横バーは内側コンテナ最下部にあり、行が多いと画面外 |
| 長文セルが読めない                                 | `table-layout: auto` + `w-full` で列が均等縮小。セル `input` がクリップ                                                            |

---

## 決定事項

### A. レイアウト統一（モジュール選択前後）

| 論点                                 | 決定                                                                      | 理由                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| CSV / Excel 取込（`CsvPastePanel`）  | **`<details>` デフォルト閉**                                              | 選択後も上端を空状態に近づける。7月デモ用にラベル「CSV / Excel 取込」は常時見える         |
| 「表を編集したあとは…」ヒント        | **取込 `<details>` 内または初回のみ**                                     | 常時1行占有を避ける                                                                       |
| ステータス「クラウドから読み込み」等 | **ワークスペース全幅帯を廃止** → **表ペインヘッダー右ステータス行に統合** | 縦1行を回収（[プレビュー上部chrome方針](./プレビュー上部chrome方針.md) の表列移動と整合） |
| エラー・取込完了・オフライン警告     | ヘッダー統合または **一時表示**（`role="alert"` / `role="status"` 維持）  | 常時の「クラウドから読み込み」だけ非表示化                                                |

### B. 列幅リサイズ + リセット

| 論点         | 決定                                                                         | 理由                                                                          |
| ------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 方式         | **`table-layout: fixed` + `<colgroup>`** + カスタム hook（**新規依存なし**） | 既存 `onPasteCapture`・行編集 UI を維持。TanStack / React Aria 全面導入は過剰 |
| 操作         | ヘッダー右端 **ドラッグハンドル**（8px ヒット領域）                          | Excel / AG Grid 慣行                                                          |
| リセット     | ツールバー **「列幅をリセット」**（T4）→ デフォルト幅定数 SSOT               | AG Grid `resetColumnState` 型                                                 |
| デフォルト幅 | `lib/flowchart/table/tableColumnWidths.ts`                                   | 列別 px（ID 狭 · Text 広 等）                                                 |
| 長文         | `text-overflow: ellipsis` + `title` ツールチップ。列を広げれば編集時全文     | リサイズとセット                                                              |
| 永続化       | `localStorage`（キー: `moduleId + colCount + schema + v1`）                  | 手戻り許容前提で UX 向上                                                      |
| キーボード   | 列ヘッダーフォーカス → Enter → ←/→ 調整 → Esc/Enter 終了                     | Salesforce UX · React Aria 型（range を Tab 停止にしない）                    |

### C. 横スクロールバー常時表示

| 論点           | 決定                                                                                                                          | 理由                                 |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| CSS のみ       | **不可**（縦長表で横バーを viewport 下端に固定できない — [W3C csswg #2252](https://github.com/w3c/csswg-drafts/issues/2252)） | ユーザー調査で確認                   |
| 採用方式       | **ドック型ネイティブ横スクロールバー** — 表ビューポート下端固定の別 `div` と `scrollLeft` 双方向同期                          | Stack Overflow 定番 · ResizeObserver |
| スクロール責務 | **表内部 1 か所のみ**（親ペイン `overflow-auto` 廃止）                                                                        | 二重スクロール解消                   |
| 横バー表示     | `overflow-x: scroll` + 必要なら `padding-bottom` ガター                                                                       | `scrollbar-gutter` は横非対応（MDN） |
| a11y           | ドック div は **`aria-hidden="true"`**（装飾用同期）。操作は表本体のネイティブスクロールバー                                  | fake scrollbar は使わない            |

---

## 目標レイアウト（モジュール選択済 · デスクトップ）

```
┌─ 表ペインヘッダー（固定）──────────────────────────────┐
│ Flowchart Studio · 文脈 · [生成完了… / クラウド読込]   │
│ [再生成] [その他 ▼]                                     │
├─ 表エリア（flex-1 · min-h-0）──────────────────────────┤
│ [行を追加] [列幅をリセット]  N行·10列                   │
│ ▶ CSV / Excel 取込          ← details・デフォルト閉    │
│ ▶ 列の意味（ヘルプ）                                    │
│ ┌ TableScrollViewport（縦横スクロール唯一）──────────┐ │
│ │ thead sticky                                      │ │
│ │ tbody … input/select                              │ │
│ └───────────────────────────────────────────────────┘ │
│ ═══════════ ドック型横スクロールバー ═══════════════ │ ← 常時見える
└──────────────────────────────────────────────────────┘
```

---

## 実装フェーズ（推奨順）

| #   | 内容                                            | 主なファイル                                                                                                        |
| --- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1   | スクロール一本化 + ドック型横バー               | `FlowchartEditor.tsx` · `FlowTableEditor.tsx` · `table/useSyncedHorizontalScroll.ts` · `FlowTableDockScrollbar.tsx` |
| 2   | `table-layout: fixed` + デフォルト幅 + ellipsis | `tableColumnWidths.ts` · `flowchartUiClasses.ts`                                                                    |
| 3   | ドラッグリサイズ + T4 リセット                  | `table/useTableColumnSizing.ts`                                                                                     |
| 4   | キーボードリサイズ + localStorage               | 同上 · `tableSizingStorage.ts`                                                                                      |
| 5   | 取込 `<details>` 化 + ステータスヘッダー統合    | `CsvPastePanel.tsx` · `FlowchartWorkspace.tsx` · `FlowchartEditor.tsx`                                              |
| 6   | `ボタン一覧.md` · E2E 最小追従                  | `e2e/*`                                                                                                             |

---

## 新規モジュール案

```
frontend/src/components/flowchart/table/
  useTableColumnSizing.ts
  useSyncedHorizontalScroll.ts
  FlowTableDockScrollbar.tsx
  tableColumnWidths.ts      ← lib/flowchart/table/ でも可
  tableSizingStorage.ts
```

---

## テスト（最低限）

| 層         | 内容                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| Vitest     | 幅 clamp · reset · storage key                                                       |
| Playwright | リサイズ反映 · ドック↔表 scroll 同期 · リセット · 部分貼り付け回帰 · sticky ヘッダー |

---

## 調査参照（Web）

| トピック                  | URL                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| 横バー sticky（CSS 不可） | https://github.com/w3c/csswg-drafts/issues/2252                                             |
| ドック型同期スクロール    | https://stackoverflow.com/questions/23206877/sticky-scrollbar-at-bottom-of-table            |
| スクロール wrapper SSOT   | https://cr0x.net/en/responsive-doc-tables/                                                  |
| TanStack 列幅             | https://tanstack.com/table/latest/docs/guide/column-sizing                                  |
| React Aria ColumnResizer  | https://react-aria.adobe.com/Table.md                                                       |
| a11y リサイズ             | https://medium.com/salesforce-ux/4-major-patterns-for-accessible-drag-and-drop-1d43f64ebf09 |
| AG Grid reset             | https://www.ag-grid.com/javascript-data-grid/column-state/                                  |

---

## 他資料との関係

| 資料                                                         | 関係                                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| [ボタン一覧.md](./ボタン一覧.md)                             | T4 追加 · 取込折りたたみは配置案どおり                                   |
| [プレビュー上部chrome方針.md](./プレビュー上部chrome方針.md) | ステータス表列化は本書 §A と同系。**実装順は本書を先**（表ペイン内完結） |
| [UI仕様.md](./UI仕様.md)                                     | 表操作契約の入口。本書はレイアウト・スクロール・列幅の SSOT              |

---

**最終更新:** 2026-06-25（方針合意 · 実装未着手）
