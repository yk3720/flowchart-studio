# スタイルガイド索引（flowchart-studio）

**状態:** Phase 2 完了（2026-06-19）— 人間・エージェント向けの**唯一の入口**  
**方針:** 正本ファイルは役割ごとに分離する。本書は「どこを触るか」の索引。

---

## 1. このドキュメントの役割

| やること                     | やらないこと                                        |
| ---------------------------- | --------------------------------------------------- |
| レイヤーごとの正本へのリンク | 全色・全 class の一覧（コード SSOT が正）           |
| 変更時の更新順序             | Figma / JSON トークン CI の手順（現段階では対象外） |
| Phase 1–2 の実装記録         | 操作 UI の未着手項目（Phase 2 完了）                |

**「スタイルガイドはどこ？」→ 本ファイル**

---

## 2. レイヤー（統合しない理由つき）

```
┌─────────────────────────────────────────────────────────┐
│  A. 作者向け「意味」  … 企画仕様（黄＝重要な判断 等）      │
├─────────────────────────────────────────────────────────┤
│  B. フロー図キャンバス … 固定色・PNG/SVG 出力再現        │
├─────────────────────────────────────────────────────────┤
│  C. 操作 UI（chrome）… ツールバー・ナビ・ダイアログ      │
├─────────────────────────────────────────────────────────┤
│  D. shadcn 基盤 … ログイン等の汎用 UI（フロー編集とは別） │
├─────────────────────────────────────────────────────────┤
│  E. 横断 … 枠線太さ 2px 等（全 YK プロジェクト）         │
└─────────────────────────────────────────────────────────┘
```

| レイヤ              | 正本                                                                                                                                                              | 触るタイミング                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **A. 作者向け意味** | [作者ガイド.md](./03_技術仕様/作者ガイド.md)                                                                                                                      | 図形・色の**意味**を変えるとき（先に仕様）       |
| **B. キャンバス**   | [`lib/flowchart/visual/flowColors.ts`](../lib/flowchart/visual/flowColors.ts) · [`FlowColorLegend.tsx`](../frontend/src/components/flowchart/FlowColorLegend.tsx) | ノード色・矢印色・枠太さ・凡例                   |
| **C. 操作 UI**      | [`frontend/src/components/flowchart/flowchartUiClasses.ts`](../frontend/src/components/flowchart/flowchartUiClasses.ts)                                           | ボタン・ナビ・バナー・ワークスペース比率         |
| **D. shadcn 基盤**  | [`app/globals.css`](../app/globals.css) · [`frontend/src/components/ui/`](../frontend/src/components/ui/)                                                         | ログイン・admin 等（**フロー編集 chrome は C**） |
| **E. 横断**         | [VISUAL_DESIGN_RULES.md](c:/yk-skill/rule/10_meta/VISUAL_DESIGN_RULES.md)                                                                                         | 枠・ストロークの太さ方針                         |

### なぜ 1 ファイルに統合しないか

| 分離   | 理由                                                                       |
| ------ | -------------------------------------------------------------------------- |
| A と B | 作者向けの説明（文章）は企画 MD。コードは描画用 hex のみ                   |
| B と C | キャンバスはテーマ非追従・エクスポート再現優先。操作 UI は Tailwind chrome |
| C と D | `fcBtn*`（青系）と shadcn `--primary`（neutral）は**別系統**。混在注意     |
| E      | yk-skill 横断。本リポジトリだけに閉じない                                  |

---

## 3. 変更マップ（何を変えたいとき）

| 変えたいもの                   | 更新順                        | 主なファイル                                                                                     |
| ------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------ |
| 表「色」列の意味（黄・橙・青） | 仕様 → コード → 凡例          | `docs/03_技術仕様/作者ガイド.md` → `lib/flowchart/visual/flowColors.ts` → `FlowColorLegend`      |
| ノード枠・菱形の太さ           | 横断ルール確認 → コード → E2E | `VISUAL_DESIGN_RULES` → `lib/flowchart/visual/flowColors.ts` → `e2e/`                            |
| 矢印・Yes/No ラベル色          | コード                        | `lib/flowchart/visual/flowColors.ts` · `lib/flowchart/graph/edgeLabelPlacement.ts`               |
| 再生成ボタン・その他メニュー   | class SSOT                    | `flowchartUiClasses.ts`（新規はここに追加）                                                      |
| 左ナビ・装置 select            | class SSOT + コンポーネント   | `flowchartUiClasses.ts` · `ModuleNavPane.tsx`                                                    |
| 表 : プレビュー比率            | レイアウト定数                | `FC_WORKSPACE_MAIN_GRID` · [REACTFLOW §5.6-2a](c:/yk-skill/rule/35_reactflow/REACTFLOW_RULES.md) |
| ログイン画面                   | shadcn                        | `globals.css` · `frontend/src/components/ui/` · `LoginForm.tsx`                                  |
| 10 列表の列ヘルプ              | 列定義                        | `lib/flowchart/table/tableColumns.ts` · `docs/03_技術仕様/作者ガイド.md`                         |

**禁止（手戻りの元）**

- キャンバス色を `globals.css` の shadcn 変数だけに寄せる（PNG 出力が変わる）
- フロー編集画面に `blue-600` 等を直書き（`flowchartUiClasses.ts` を経由する）
- 仕様未更新で `flowColors.ts` の凡例意味だけ変える

---

## 4. 操作 UI の部品一覧（class SSOT）

定義: [`flowchartUiClasses.ts`](../frontend/src/components/flowchart/flowchartUiClasses.ts)

| 名前                                                     | 用途                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------ |
| `fcBtnPrimary`                                           | 主操作（再生成など）                                         |
| `fcBtnSecondary`                                         | 副操作                                                       |
| `fcBtnAccent`                                            | 強調枠付き                                                   |
| `fcBtnCancel`                                            | キャンセル                                                   |
| `fcBtnDanger` / `fcBtnDangerOutline`                     | 削除・危険操作                                               |
| `fcStatusBanner`                                         | 取込・保存バナー                                             |
| `fcNavSelect` / `fcNavModuleBtn` + `fcNavModuleBtnState` | 左ナビ                                                       |
| `FC_WORKSPACE_MAIN_GRID`                                 | 表ペイン 2fr : プレビュー 3fr                                |
| `fcTextUi` / `fcTextHint`                                | 操作 UI 14px / 補助 12px（`globals.css` の `--flow-font-*`） |
| `fcZoomBtn` / `fcZoomPercent` / `fcControlSquare`        | ズーム列 32px 正方形 · 倍率表示                              |
| `flowHomeViewport.ts`                                    | プレビュー初期位置（上段揃え）· ホームボタン                 |

**既知の技術的負債:** `FlowShapeNode` · `LabeledEdge` のノードラベル色はキャンバス層（`flowColors` 参照）。操作 chrome は Phase 1–2 で `flow-*` 化済み。

### 操作 UI の文字サイズ（2026-06）

WCAG 2.2 は最小フォント px を規定しない（[SC 1.4.4 200% 拡大](https://www.w3.org/WAI/WCAG22/Understanding/resize-text)）。本ツールの実務下限:

| トークン（`globals.css`） | 既定 | 使う場所                                         |
| ------------------------- | ---- | ------------------------------------------------ |
| `--flow-font-ui`          | 14px | ボタン · 表 · メニュー                           |
| `--flow-font-hint`        | 12px | 凡例 · 行数 · セクション説明（**これ未満禁止**） |
| `--flow-control-size`     | 32px | ツールバー · ズームコントロールの一辺            |

新規 chrome は `text-xs`（12px 未満になりうる）を直書きせず `fcTextUi` / `fcTextHint` を使う。

---

## 5. キャンバス色（固定・テーマ非追従）

定義: [`flowColors.ts`](../lib/flowchart/visual/flowColors.ts)

| 定数                                               | 役割                 |
| -------------------------------------------------- | -------------------- |
| `FLOW_EDGE_STROKE`                                 | 矢印                 |
| `FLOW_NODE_FRAME_STROKE` / `FLOW_NODE_FRAME_WIDTH` | ノード枠（既定 2px） |
| `FLOW_NODE_FILL_BY_HINT`                           | 表「色」列 → 背景    |
| `COLOR_HINT_LEGEND_ITEMS`                          | 凡例（UI）           |

検証: Vitest `flowColors.test.ts` · Playwright `e2e/curry-loop.spec.ts`（stroke hex）

---

## 6. shadcn の位置づけ

| 項目                    | 決定（Phase 0）                                                                  |
| ----------------------- | -------------------------------------------------------------------------------- |
| 導入状態                | `components.json` · `globals.css` · `frontend/src/components/ui/button.tsx` あり |
| フロー編集 chrome       | **shadcn `Button` は使わない**。`fcBtn*` が正                                    |
| ログイン・将来の汎用 UI | shadcn + `globals.css` の `--primary` 等                                         |
| テーマ切替 / dark       | **現仕様では却下**（キャンバス固定色と整合）                                     |

---

## 7. エージェント・実装者向けルール

1. UI を触る前に **本ファイルでレイヤーを確認**
2. フロー編集画面のボタン → `flowchartUiClasses.ts` に追加してから使う
3. キャンバス色 → `flowColors.ts` のみ（chrome に波及させない）
4. 意味の変更 → `docs/03_技術仕様/作者ガイド.md` 先
5. 枠太さ → [VISUAL_DESIGN_RULES](c:/yk-skill/rule/10_meta/VISUAL_DESIGN_RULES.md) §2
6. 実装詳細 → [REACTFLOW_RULES §5.6](c:/yk-skill/rule/35_reactflow/REACTFLOW_RULES.md) · [flowchart-practical-ux-yk.mdc](../.cursor/rules/flowchart-practical-ux-yk.mdc)

---

## 8. Phase 1（完了 · 2026-06-19）

| 項目                    | 内容                                                                              |
| ----------------------- | --------------------------------------------------------------------------------- |
| `@theme` セマンティック | `app/globals.css` の `--flow-*` → Tailwind `flow-*` ユーティリティ                |
| `flowchartUiClasses.ts` | 操作 UI class の正本（`fcBtn*` · ダイアログ · バナー · ナビ等）                   |
| 主要コンポーネント      | Editor · Workspace · Nav · Canvas · CsvPaste · MoreMenu を `flow-*` 経由に移行    |
| 未移行（意図的）        | `FlowShapeNode` · `LabeledEdge` のノード内ラベル色（キャンバス層 · `flowColors`） |

## 9. Phase 2（完了 · 2026-06-19）

| 項目           | 内容                                                                              |
| -------------- | --------------------------------------------------------------------------------- |
| 開発用カタログ | `app/dev/style/page.tsx` — `npm run dev` 時のみ `http://localhost:3000/dev/style` |
| 表 UI          | `FlowTableEditor` → `fcTable*`（`flowchartUiClasses.ts`）                         |
| 色凡例 chrome  | `FlowColorLegend` → `fcColorLegendFloating`                                       |

## 10. Phase 3（完了 · 2026-06-19）

| 項目             | 内容                                                                           |
| ---------------- | ------------------------------------------------------------------------------ |
| ステータスバナー | `lib/flowchart/visual/statusBanner.ts` → `flow-*`（success / error / neutral） |
| 認証バー         | `AppAuthBar` → `fcAuthBar*`                                                    |
| 読込オーバーレイ | `moduleLoading` + `fcModuleLoadingOverlay`                                     |
| カタログ拡充     | `/dev/style` に status · auth 見本                                             |

本番ビルドでは `/dev/style` は **404**。

## 11. 関連ドキュメント

| ドキュメント                                                                            | 用途                                       |
| --------------------------------------------------------------------------------------- | ------------------------------------------ |
| [作者ガイド.md](./03_技術仕様/作者ガイド.md)                                            | 表列 · 図形 · 色（作者向け）               |
| [LOCAL_DEV.md](./LOCAL_DEV.md)                                                          | ローカル確認                               |
| [flowchart-practical-ux-yk.mdc](../.cursor/rules/flowchart-practical-ux-yk.mdc)         | エージェント L0                            |
| [USABILITY_HEURISTICS_RULES.md](c:/yk-skill/rule/10_meta/USABILITY_HEURISTICS_RULES.md) | ニールセン10原則 · UI/UX レビュー（No 20） |
| [testdata/devices/README.md](../python/testdata/devices/README.md)                      | 作者 Excel 置き場                          |

---

*入口 SSOT: 本ファイル · キャンバス: `lib/flowchart/visual/flowColors.ts` · 操作 UI: `flowchartUiClasses.ts` · 意味: `docs/03*技術仕様/作者ガイド.md`\_
