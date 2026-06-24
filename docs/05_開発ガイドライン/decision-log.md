# Decision Log — フローチャート Web

**更新:** 2026-06-24（docs 整理 · archive 分離）  
**役割:** 開発経緯の **入口**。本ファイルは **リンクと1行要約のみ** — 確定事項の正本は ADR、実行の正本は handoffs §4。

---

## 読み方

| 読者                | 読む範囲                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **経緯を辿りたい**  | **テーマチェーン**（論点単位）または **タイムライン**（日付順）                                                                                  |
| **最終報告を書く**  | タイムライン → [00\_テーマ/](c:/yk-memo/00.ai-driven-school/個人テーマ_フローチャートアプリ/00_テーマ/)（将来 `報告書_2026年度_*.md`）へ要約転記 |
| **今やる1件**       | [HANDOFF.md](c:/yk-memo/handoffs/flowchart-studio/HANDOFF.md) → 最新セッション **§4**                                                            |
| **1つの決定の全文** | タイムラインのリンク → ADR / grill-me / handoff                                                                                                  |

---

## 更新ルール

| イベント           | やること                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| **grill-me 終了**  | タイムライン1行追加 · `grill-me_` または `相談_` ファイルへリンク · Accepted なら ADR 行も追加 |
| **ADR 確定**       | タイムライン1行 · [意思決定記録(ADR).md](<../03_技術仕様/意思決定記録(ADR).md>) が正本         |
| **調査のみ**       | タイムライン1行 · `01_要求定義/調査_*.md` へリンク（ADR 化で凍結可）                           |
| **実装計画**       | `計画_*.md` 作成時に1行 · §4 候補の出所として記載                                              |
| **セッション終了** | handoff 1行 · **本文コピー禁止** · §4 の1行要約のみ                                            |
| **ADR 変更**       | 旧 ADR を書き換えない · 新 ADR + **Superseded チェーン** に追記                                |

**命名（新規）:** grill-me 記録は `01_要求定義/grill-me_YYYY-MM-DD_{論題}.md` を推奨。既存 `相談_*` はリネーム不要（本ログからリンク）。

---

## 種別凡例

| 種別         | 意味                                     | 正本                                                                            |
| ------------ | ---------------------------------------- | ------------------------------------------------------------------------------- |
| **theme**    | 個人テーマ選定 · 提出                    | `c:/yk-memo/.../00_テーマ/`                                                     |
| **調査**     | Web 調査 · 比較（ADR 化後は archive 可） | `docs/archive/01_要求定義/調査_*.md` · `c:/yk-memo/.../99_アーカイブ/research/` |
| **grill-me** | 対話深掘り · 優先順位 · 未決             | `docs/archive/01_要求定義/grill-me_*` · `相談_*`                                |
| **計画**     | 相談→実装の分解                          | `docs/archive/01_要求定義/計画_*.md`                                            |
| **ADR**      | Accepted 技術・プロダクト決定            | `03_技術仕様/意思決定記録(ADR).md`                                              |
| **handoff**  | 実装セッション · 次の1件                 | `c:/yk-memo/handoffs/flowchart-studio/`                                         |
| **evidence** | 完了証跡                                 | `c:/yk-memo/.../99_アーカイブ/evidence/`                                        |

---

## 戦略 vs 戦術（ズレても正常）

| 軸               | 正本                                                          | 現状（2026-06-24）                 |
| ---------------- | ------------------------------------------------------------- | ---------------------------------- |
| **戦略優先**     | [製品戦略.md](../01_要求定義/製品戦略.md)                     | UX · **作る操作の手間削減** 最優先 |
| **戦術次タスク** | [HANDOFF §6](c:/yk-memo/handoffs/flowchart-studio/HANDOFF.md) | **U0 動作001 本文**（§4）          |

**開発ログイン（2026-06-24）:** Magic Link は `/auth/confirm` + token_hash テンプレ · OAuth は `/auth/callback` · パスワードは Server Action — **開発 Supabase（`flowchart-dev`）で3方式共存**。Vercel 本番 URL（`-dun`）は現状この dev プロジェクトに接続。**専用本番 Supabase 分離後**は Email 無効 · Google/Azure のみ（`SUPABASE_RULES` §6）。

---

## テーマチェーン（論点ごと · 深掘り用）

タイムラインは日付順。同じ論点を **調査 / 合意 → ADR → 実装** の順で辿るときはこちら（本文は各リンク先 · 本節はリンクのみ）。**チェーン内の「次 §4」は当時のスナップショット** — 今やる1件は [HANDOFF §4](c:/yk-memo/handoffs/flowchart-studio/HANDOFF.md) のみ。

### 立ち上げ · MVP · Web完成（2026-05-20〜26）

[調査\_使いやすい](../archive/01_要求定義/調査_使いやすいフローチャート.md) → [ADR-007〜009](<../03_技術仕様/意思決定記録(ADR).md>) → [製品要求](../01_要求定義/製品要求.md) → [C-2 記録](c:/yk-memo/00.ai-driven-school/個人テーマ_フローチャートアプリ/99_アーカイブ/evidence/C-2_実務PNG貼付_記録_2026-05-26.md)

### 9列 · M002 レイアウト（2026-05-24〜26）

[調査\_表列設計](../archive/01_要求定義/調査_表列設計とレイアウト再現.md) → [ADR-012](<../03_技術仕様/意思決定記録(ADR).md#adr-012-9-列モデル段--列ドラフト>) → [M002 サンプル](../archive/03_技術仕様/M002_9列サンプル表.md) → [handoff \_4](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-05-26_4_web-complete-tier-layout-session-end.md)

### Supabase · DB-1（2026-05-27〜29）

[調査\_永続化](c:/yk-memo/00.ai-driven-school/個人テーマ_フローチャートアプリ/99_アーカイブ/research/調査_永続化とセキュリティ_Web公開.md) → [ADR-013](<../03_技術仕様/意思決定記録(ADR).md#adr-013-永続化supabase認証公開--db-1>) → [handoff \_6](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-05-27_6_supabase-db1-session-end.md) · [\_7](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-05-29_7_supabase-dev-setup-session-end.md)

### UX ブラッシュアップ · 3ペイン（2026-05-30）

[製品戦略](../01_要求定義/製品戦略.md) → [計画\_2026-05-30](../archive/01_要求定義/計画_2026-05-30_図の見た目と装置階層.md) → [ADR-011](<../03_技術仕様/意思決定記録(ADR).md#adr-011-phase-3-画面--3-ペイン装置階層ナビ表図>) · [ADR-012](<../03_技術仕様/意思決定記録(ADR).md#adr-012-9-列モデル段--列ドラフト>)（菱形枠等）→ [handoff \_8](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-05-30_8_tauri-spike-architecture-session-end.md) · [\_9](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-05-30_9_vercel-prod-deploy-session-end.md)

### 色列（10列目 · 2026-06-06）

[計画\_2026-05-30 §B](../archive/01_要求定義/計画_2026-05-30_図の見た目と装置階層.md) → [作者ガイド §3](../03_技術仕様/作者ガイド.md) → 10列実装済

### DB-2 装置階層（2026-05-31〜）

[grill-me_2026-05-31](../archive/01_要求定義/grill-me_2026-05-31_DB-2装置階層.md) → [DB設計](../03_技術仕様/DB設計.md) → [ADR-014](<../03_技術仕様/意思決定記録(ADR).md#adr-014-永続化--装置階層-db-2草案--2026-05-31>) → [handoff \_10](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-05-31_10_db2-schema-design-session-end.md) · [\_11](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-05-31_11_db2-dev-migration-docs-session-end.md)

### 企画 SSOT 整理（2026-05-31）

[grill-me\_企画SSOT整理](../archive/01_要求定義/grill-me_2026-05-31_企画SSOT整理.md) → README/AGENTS/decision-log 委譲 · 調査\_永続化→archive → [handoff \_12](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-05-31_12_planning-ssot-cleanup-session-end.md)

---

## タイムライン

| 日付            | 種別     | タイトル                                                                        | リンク                                                                                                                                                                                                                              | 状態                              | 昇格先 / 備考                                                                                                                        |
| --------------- | -------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-05（提出） | theme    | 個人テーマ選定 · フローチャート作成システム                                     | [選定表\_記入稿](c:/yk-memo/00.ai-driven-school/個人テーマ_フローチャートアプリ/00_テーマ/選定表_記入稿.md)                                                                                                                         | 提出済                            | 背景: [テーマ.md](c:/yk-memo/00.ai-driven-school/個人テーマ_フローチャートアプリ/00_テーマ/テーマ.md)                                |
| 2026-05-20      | 調査     | UX 改善方向（MZ0000 参照廃止）                                                  | [調査\_使いやすいフローチャート](../01_要求定義/調査_使いやすいフローチャート.md)                                                                                                                                                   | 凍結                              | → ADR-007 · ADR-009                                                                                                                  |
| 2026-05-20      | ADR      | MVP 入力・バリデーション・RF 派生ビュー等                                       | [ADR-001〜006](<../03_技術仕様/意思決定記録(ADR).md#adr-001-mvp-の入力経路>)                                                                                                                                                        | Accepted                          | 実装済                                                                                                                               |
| 2026-05-20      | ADR      | MZ0000 参照廃止 · P0 UX 強化                                                    | [ADR-007](<../03_技術仕様/意思決定記録(ADR).md#adr-007-デスクトップ-mz0000-の参照廃止>) · [ADR-008](<../03_技術仕様/意思決定記録(ADR).md#adr-008-p0-ux再生成契約の強化>)                                                            | Accepted                          | 実装済                                                                                                                               |
| 2026-05-20      | ADR      | 調査項目一括実装（CSV · 下書き等）                                              | [ADR-009](<../03_技術仕様/意思決定記録(ADR).md#adr-009-調査項目の一括実装実用版>)                                                                                                                                                   | Accepted                          | 実装済                                                                                                                               |
| 2026-05-23      | handoff  | ADR-010 · flowchart-web リネーム                                                | [2026-05-23_adr010](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-05-23_adr010-rename-handoff.md)                                                                                                                             | 完了                              | → ADR-010                                                                                                                            |
| 2026-05-24      | ADR      | React Flow / Mermaid 二系統比較                                                 | [ADR-010](<../03_技術仕様/意思決定記録(ADR).md#adr-010-二系統比較react-flow--mermaidとリネーム>)                                                                                                                                    | Accepted                          | `flowchart-studio` · `flowchart-web-mermaid`                                                                                         |
| 2026-05-24      | handoff  | Excel 取込 · PoC レイアウト調査                                                 | [2026-05-24_2](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-05-24_2_excel-import-session-end.md) · [2026-05-24_3](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-05-24_3_poc-layout-schema-research-session-end.md)     | 完了                              | ADR-012 へ                                                                                                                           |
| 2026-05-24      | grill-me | 3 ペイン画面（Nav｜表｜図）                                                     | （記録なし · handoff 要約のみ）                                                                                                                                                                                                     | Accepted                          | → ADR-011                                                                                                                            |
| 2026-05-26      | 調査     | 9 列（段+列）· M002 レイアウト                                                  | [調査\_表列設計とレイアウト再現](../01_要求定義/調査_表列設計とレイアウト再現.md)                                                                                                                                                   | 凍結                              | → ADR-012                                                                                                                            |
| 2026-05-26      | ADR      | 9 列モデル · 段→tier · 列→level                                                 | [ADR-012](<../03_技術仕様/意思決定記録(ADR).md#adr-012-9-列モデル段--列ドラフト>)                                                                                                                                                   | Accepted · layoutGrid tier 実装済 | [M002 サンプル](../archive/03_技術仕様/M002_9列サンプル表.md)                                                                        |
| 2026-05-26      | handoff  | Web 完成 · layoutGrid 段ベース着手                                              | [2026-05-26_4](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-05-26_4_web-complete-tier-layout-session-end.md)                                                                                                                 | 完了                              | [C-2 記録](c:/yk-memo/00.ai-driven-school/個人テーマ_フローチャートアプリ/99_アーカイブ/evidence/C-2_実務PNG貼付_記録_2026-05-26.md) |
| 2026-05-27      | 調査     | 永続化 · Supabase vs Neon                                                       | [調査\_永続化](c:/yk-memo/00.ai-driven-school/個人テーマ_フローチャートアプリ/99_アーカイブ/research/調査_永続化とセキュリティ_Web公開.md)                                                                                          | 凍結 · archive                    | → ADR-013                                                                                                                            |
| 2026-05-27      | grill-me | Supabase · editor/viewer · オフライン閲覧                                       | （記録なし · ADR 本文に要約）                                                                                                                                                                                                       | Accepted                          | → ADR-013                                                                                                                            |
| 2026-05-27      | ADR      | DB-1 · Supabase Auth · flow_documents                                           | [ADR-013](<../03_技術仕様/意思決定記録(ADR).md#adr-013-永続化supabase認証公開--db-1>)                                                                                                                                               | Accepted                          | 実装済                                                                                                                               |
| 2026-05-27      | handoff  | Supabase DB-1 実装                                                              | [2026-05-27_6](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-05-27_6_supabase-db1-session-end.md)                                                                                                                             | 完了                              | `docs/runbooks/SUPABASE_SETUP.md`                                                                                                    |
| 2026-05-29      | handoff  | Supabase dev プロジェクト整備                                                   | [2026-05-29_7](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-05-29_7_supabase-dev-setup-session-end.md)                                                                                                                       | 完了                              | Preview/本番 DB 分離                                                                                                                 |
| 2026-05-30      | grill-me | Web 版ブラッシュアップ · UX 優先順位                                            | [相談\_2026-05-30](../01_要求定義/相談_2026-05-30_Web版ブラッシュアップ方針.md)                                                                                                                                                     | 部分確定                          | 戦略優先 SSOT                                                                                                                        |
| 2026-05-30      | 計画     | 図の見た目 · 装置階層 · 3 ペイン実装順                                          | [計画\_2026-05-30](../01_要求定義/計画_2026-05-30_図の見た目と装置階層.md)                                                                                                                                                          | 進行中                            | §4 候補の出所                                                                                                                        |
| 2026-05-30      | ADR      | 3 ペイン UX · 装置セレクタ                                                      | [ADR-011](<../03_技術仕様/意思決定記録(ADR).md#adr-011-phase-3-画面--3-ペイン装置階層ナビ表図>)                                                                                                                                     | Accepted                          | mock → ADR-013 接続                                                                                                                  |
| 2026-05-30      | handoff  | Tauri スパイク · Vercel 本番デプロイ                                            | [2026-05-30_8](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-05-30_8_tauri-spike-architecture-session-end.md) · [2026-05-30_9](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-05-30_9_vercel-prod-deploy-session-end.md) | 完了                              | 本番 URL 稼働                                                                                                                        |
| 2026-05-31      | grill-me | DB-2 装置階層 · legacy_key · DELETE 方針                                        | [grill-me_2026-05-31](../01_要求定義/grill-me_2026-05-31_DB-2装置階層.md)                                                                                                                                                           | Accepted                          | ADR-014                                                                                                                              |
| 2026-05-31      | ADR      | DB-2 · 装置4表 + flow_documents 分離                                            | [ADR-014](<../03_技術仕様/意思決定記録(ADR).md#adr-014-永続化--装置階層-db-2草案--2026-05-31>)                                                                                                                                      | Accepted · dev/本番適用済         | [DB設計](../03_技術仕様/DB設計.md)                                                                                                   |
| 2026-05-31      | handoff  | DB-2 dev へ 003+004 適用                                                        | [2026-05-31_11](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-05-31_11_db2-dev-migration-docs-session-end.md)                                                                                                                 | ✅ 完了                           | 次: #2 アプリ uuid 化                                                                                                                |
| 2026-05-31      | grill-me | 企画 SSOT 整理 · 第1–3フェーズ                                                  | [grill-me*2026-05-31*企画SSOT整理](../01_要求定義/grill-me_2026-05-31_企画SSOT整理.md)                                                                                                                                              | 確定                              | README/AGENTS/新チャット/再開メモ/decision-log · 調査\_永続化→archive                                                                |
| 2026-05-31      | handoff  | 企画 SSOT commit · 別件5件削除 · 引き継ぎ \_12                                  | [2026-05-31_12 §4](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-05-31_12_planning-ssot-cleanup-session-end.md)                                                                                                               | 完了                              | 次: #2 uuid 化 · `5d591f0` · `b61d8fd`                                                                                               |
| 2026-05-31      | handoff  | uuid 化 · LOCAL_DEV · 要望 D · 引き継ぎ \_13                                    | [2026-05-31_13 §4](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-05-31_13_uuid-localdev-layout-req-session-end.md)                                                                                                            | 完了                              | 次: D レイアウト                                                                                                                     |
| 2026-05-31      | handoff  | Yes/No ラベル · Playwright E2E · 引き継ぎ \_14                                  | [2026-05-31_14 §4](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-05-31_14_edge-label-playwright-e2e-session-end.md)                                                                                                           | 完了                              | 次: 色列                                                                                                                             |
| 2026-05-31      | handoff  | 9列デフォルト（段+列）· 雛形/fixtures · 引き継ぎ \_15                           | [2026-05-31_15 §4](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-05-31_15_tier9-default-columns-session-end.md)                                                                                                               | 完了                              | 次: 計画 B 色列                                                                                                                      |
| 2026-06-06      | 計画     | 10列目「色」— データ源 · 表示 · flowColors 整理 · **着手可**                    | [作者ガイド §3](../03_技術仕様/作者ガイド.md)                                                                                                                                                                                       | 確定                              | 実装は次 §4 · ADR-012 追記は実装後                                                                                                   |
| 2026-06-10      | handoff  | Excel テンプレ · import E2E · CI build/mypy · 本番 deploy                       | [2026-06-10_23 §4](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-06-10_23_excel-import-ci-deploy-session-end.md)                                                                                                              | 完了                              | 次: admin M-3                                                                                                                        |
| 2026-06-11      | handoff  | §5.6 レース/プレビュー · M-3 admin · 006 · 本番 deploy                          | [2026-06-11_26 §4](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-06-11_26_admin-m3-session-end.md)                                                                                                                            | 完了                              | 次: document.ts Zod                                                                                                                  |
| 2026-06-15      | ADR      | フロー共同編集 — 編集は全 editor · 削除は所有者/admin                           | [ADR-015](<../03_技術仕様/意思決定記録(ADR).md#adr-015-フロー共同編集--編集は全-editor--削除は所有者admin2026-06-15>)                                                                                                               | Accepted · 本番適用済             | `016` · handoff #5                                                                                                                   |
| 2026-06-21      | handoff  | A0001 Excel v0.3 · 正規化 · Vercel import.json 取込                             | [2026-06-21_11 §4](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-06-21_11_a0001-excel-v03-session-end.md)                                                                                                                     | 完了                              | 次: U0 動作001 本文（1個ずつ）                                                                                                       |
| 2026-06-23      | 運用     | `flowchart-studio` — yk-tool から yk-application へ独立リポ移行                 | [リポジトリ構造](../04_リポジトリ構造/リポジトリ構造.md)                                                                                                                                                                            | 完了                              | `c:/yk-application/flowchart-studio/`                                                                                                |
| 2026-06-23      | 運用     | spec-in-repo 移行後 doc-sync（リンク · ロードマップ）                           | [現状とロードマップ](../02_機能設計/現状とロードマップ.md) · [handoff \_16](c:/yk-memo/handoffs/flowchart-web/archive/2026/2026-06-23_16_doc-sync-session-end.md)                                                                   | 完了                              | `7432afe` · フェーズ計画 Historical 化                                                                                               |
| 2026-06-24      | 運用     | Magic Link / PKCE — `/auth/confirm` + メールテンプレ整合                        | [SUPABASE_SETUP.md](../../docs/runbooks/SUPABASE_SETUP.md) §1-1 · `8593089`                                                                                                                                                         | 完了                              | 本番 `-dun` 確認済                                                                                                                   |
| 2026-06-24      | 運用     | doc-sync 矛盾解消（AGENTS · yk-skill · Excel · archive 注記）                   | [handoff \_18](c:/yk-memo/handoffs/flowchart-studio/2026-06-24_18_doc-sync-contradiction-cleanup-session-end.md)                                                                                                                    | 完了                              | 次: U0 動作001 §4                                                                                                                    |
| 2026-06-24      | 運用     | repo-layout v2 — 系統別整理（samples · scripts/\* · docs/runbooks · stub 削除） | [リポジトリ構造.md](../04_リポジトリ構造/リポジトリ構造.md) · [YK テンプレ](c:/yk-skill/templates/independent-app-repo/STRUCTURE.md)                                                                                                | 完了                              | テンプレ正本化                                                                                                                       |
| 2026-06-24      | 運用     | Google OAuth（flowchart-dev）— GCP + Supabase Providers                         | [handoff \_17](c:/yk-memo/handoffs/flowchart-studio/archive/2026/2026-06-24_17_magic-link-google-oauth-session-end.md)                                                                                                              | dev 完了                          | 本番 Supabase 分離 · Microsoft はバックログ                                                                                          |
| 2026-06-24      | 運用     | UX パック — 名称統一・内部キー・再生成 UX・凡例 chrome・handoffs slug           | [handoff \_19](c:/yk-memo/handoffs/flowchart-studio/archive/2026/2026-06-24_19_ux-rename-scroll-legend-handoff.md)                                                                                                                  | 完了                              | archive                                                                                                                              |
| 2026-06-24      | 運用     | 四層レイアウト v3.2 — `docs/` · frontend/backend/database/python + `src/`       | [リポジトリ構造.md](../04_リポジトリ構造/リポジトリ構造.md) · [handoff \_21](c:/yk-memo/handoffs/flowchart-studio/2026-06-24_21_four-layer-layout-session-end.md)                                                                   | 完了                              | 次: フォルダ中身協議 §4                                                                                                              |

---

## ADR 索引（クイック参照）

| ADR     | タイトル（短）                 | 状態                              |
| ------- | ------------------------------ | --------------------------------- |
| 001–006 | MVP · バリデーション · RF 派生 | Accepted · 実装済                 |
| 007     | MZ0000 参照廃止                | Accepted                          |
| 008     | P0 UX（再生成契約）            | Accepted                          |
| 009     | 実用版 UX 一括                 | Accepted                          |
| 010     | RF / Mermaid 比較 · リネーム   | Accepted                          |
| 011     | 3 ペイン · 装置 Nav            | Accepted                          |
| 012     | 9 列（段+列）· 10列色          | Accepted · layoutGrid tier 実装済 |
| 013     | Supabase DB-1                  | Accepted · 実装済                 |
| 014     | 装置階層 DB-2                  | Accepted · dev/本番適用済         |
| 015     | フロー共同編集 RLS             | Accepted · 本番適用済（`016`）    |

全文: [意思決定記録(ADR).md](<../03_技術仕様/意思決定記録(ADR).md>)

---

## 未決論点（1行）

| 論点                                                            | 出所                                                                                                                                               | 備考                                                                        |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| OAuth（Microsoft）· 本番 Supabase 分離 · Email 無効化（分離後） | [相談\_2026-05-30 §4](../01_要求定義/相談_2026-05-30_Web版ブラッシュアップ方針.md) · [HANDOFF §6](c:/yk-memo/handoffs/flowchart-studio/HANDOFF.md) | Google OAuth（dev）は #17 完了 · Microsoft · 専用本番 Supabase はバックログ |
| Excel 1ファイル=1社内番号 · シートレイアウト                    | ADR-014 · DB-2 草案                                                                                                                                | 試作は後回し                                                                |
| `legacy_key` NULL 化タイミング                                  | ADR-014                                                                                                                                            | 移行完了後                                                                  |
| `admin` ロール · 管理 UI（M-3）                                 | ADR-014                                                                                                                                            | M-1 Runbook 先行                                                            |
| ADR-010 比較後の一本化                                          | ADR-010                                                                                                                                            | Mermaid 版は比較用                                                          |
| オンライン同時編集 · 競合                                       | ADR-013 · ADR-015                                                                                                                                  | **編集は共同可**（015）· 競合解決（ロック等）は未決                         |

---

## Superseded チェーン（ADR のみ）

| 旧  | 新  | 日付 | 理由（1行）             |
| --- | --- | ---- | ----------------------- |
| —   | —   | —    | 現時点で supersede なし |

---

## 関連

- [意思決定記録(ADR).md](<../03_技術仕様/意思決定記録(ADR).md>) — 決定の正本
- [完成に向けた進め方.md](../01_要求定義/完成に向けた進め方.md) §3 — 課題→調査→ADR→実装サイクル
- [HANDOFF.md](c:/yk-memo/handoffs/flowchart-studio/HANDOFF.md) — セッション運用 · §4 実行正本
