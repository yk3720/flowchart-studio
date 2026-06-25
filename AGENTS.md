# AGENTS.md — flowchart-studio

エージェント向け憲法。**境界 · SSOT · 再開手順**を1か所に集約する（500行未満 · 毎セッション Read 可）。

| 項目                  | 値                                                                          |
| --------------------- | --------------------------------------------------------------------------- |
| **handoffs slug**     | `flowchart-studio`                                                          |
| **Product Spec 正本** | 本リポ `docs/`（コードと同居 · SDD）                                        |
| **講座・提出**        | `c:/yk-memo/00.ai-driven-school/個人テーマ_フローチャートアプリ/00_テーマ/` |
| **更新**              | 2026-06-25（UX改善パック §D〜§E 実装済）                                    |

---

## プロダクトの一文

表からフローチャートを自動生成し、ブラウザで表示・JSON 保存・PNG/SVG 出力できる Web アプリ。

---

## 再開（毎セッション · この順）

1. [`handoffs/flowchart-studio/HANDOFF.md`](c:/yk-memo/handoffs/flowchart-studio/HANDOFF.md) — 最新セッションリンク
2. **最新セッション MD §4 だけ**実行（ロードマップ全体に広げない）
3. 本ファイル（境界確認）

```text
@c:/yk-memo/handoffs/flowchart-studio/HANDOFF.md
@c:/yk-memo/handoffs/flowchart-studio/2026-06-25_45_ux-improvement-pack-impl-session-end.md
@c:/yk-application/flowchart-studio/AGENTS.md
続きから。§4 の A0001 供給部 M004〜 Web 目視だけ。一つずつ順番に進めてください。
```

> セッション MD が更新されたら、2行目を HANDOFF の「最新セッション」に差し替える。

**仕様疑問時のみ追加 Read:** `docs/**/00_目次.md` → 該当フォルダの**1ファイル**だけ（例: `03_技術仕様/00_目次.md` → `データモデル.md`）

---

## 引き継ぎ終了時（毎回 · `handoff-session-work`）

| #   | 更新するファイル                                                                    |
| --- | ----------------------------------------------------------------------------------- |
| 1   | `handoffs/flowchart-studio/` — 新規セッション MD · HANDOFF「最新セッション」· §6    |
| 2   | 本ファイル — 再開ブロック2行目の `@`                                                |
| 3   | `c:/yk-memo/.../新チャット依頼.md` — コピペ2行目（本ファイルと同じセッション MD）   |
| 4   | `docs/05_開発ガイドライン/decision-log.md` — タイムライン **1行**（本文コピー禁止） |

**RUN 最小:** Phase C は **Bash 1 本/リポ**（add+commit+push）。Post-C 専用 commit 禁止 — `handoff-session-work` · `git-save.md` · `AGENT_SHELL_RULES` D-2。

**更新しない:** handoffs 以外への §4 書き戻し

---

## 文書種

| 種別         | 正本                                             | いつ書く                           |
| ------------ | ------------------------------------------------ | ---------------------------------- |
| decision-log | `docs/05_開発ガイドライン/decision-log.md`       | 合意 · ADR · セッション終了時に1行 |
| grill-me     | `docs/archive/01_要求定義/grill-me_*` · `相談_*` | 方針深掘り後                       |
| ADR          | `docs/03_技術仕様/意思決定記録(ADR).md`          | 採用決定時                         |
| §4           | handoffs 最新                                    | 毎セッション                       |
| 運用手順     | `docs/`（LOCAL_DEV · Runbook 等）                | 実装隣接                           |

**現状 · 次の1件:** [HANDOFF §6](c:/yk-memo/handoffs/flowchart-studio/HANDOFF.md) — **A0001 供給部 M004〜 Web 目視**（HANDOFF #14）

---

## コード · ドキュメント配置

| 層                 | パス                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| **フロントエンド** | `app/` · `frontend/src/components/`                                             |
| **バックエンド**   | `backend/src/lib/` · `app/**/route.ts`                                          |
| **データベース**   | `database/migrations/` · `database/sql/` · `database/src/seed/`                 |
| **Python**         | `python/src/excel_normalize/` · `python/testdata/fixtures/` · `python/scripts/` |
| **作者データ**     | `data/devices/`（xlsx Git 外 · import.json Git 内）                             |
| **共有**           | `lib/flowchart/`                                                                |
| **仕様 · 運用**    | `docs/`                                                                         |

| 用途              | パス                                                |
| ----------------- | --------------------------------------------------- |
| **本リポ**        | `c:/yk-application/flowchart-studio/`               |
| **サンプル JSON** | `frontend/src/samples/`                             |
| **起動 bat**      | `フローチャートを開く.bat` → `scripts/dev/open.bat` |

```powershell
cd c:\yk-application\flowchart-studio
npm run dev
npm run excel:inspect -- A0001
npm run test
npm run build
npm run test:e2e
```

### ローカル確認

| 項目       | 正本                                                               |
| ---------- | ------------------------------------------------------------------ |
| **手順**   | [docs/LOCAL_DEV.md](./docs/LOCAL_DEV.md)                           |
| **Cursor** | Settings → Tools & MCP → **Show Localhost Links in Browser → OFF** |
| **URL**    | `http://localhost:3000/login`（アドレスバーに貼り付け）            |

---

## やる / やらない

| やる                                         | やらない                     |
| -------------------------------------------- | ---------------------------- |
| 表 → IR → 格子レイアウト → React Flow        | Excel COM · Office Add-in    |
| JSON / CSV / Excel 取込 · 表 UI · PNG/SVG    | 図解管理 WS との統合         |
| 1 セッション = §4 の **1 件**                | 要求定義書の全項目の一括実装 |
| 変更前に ADR → docs → コードの順             | dagre でノード位置決定       |
| UI ボタン増減時は `ボタン一覧.md` を同時更新 | —                            |

---

## SSOT マップ

| ドメイン                     | 正本                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| **セッション進捗 · 次の1件** | `c:/yk-memo/handoffs/flowchart-studio/`                                              |
| **講座提出**                 | `yk-memo/.../00_テーマ/選定表_記入稿.md`                                             |
| 要求定義                     | `docs/01_要求定義/00_目次.md` → 必要時 `要求定義書.md`（§単位）                      |
| 機能設計                     | `docs/02_機能設計/00_目次.md` → 必要時 `現状とロードマップ.md` / `UI仕様.md`         |
| UI ボタン（棚卸し）          | `docs/02_機能設計/ボタン一覧.md` — 増減時は同一作業で更新                            |
| 技術仕様                     | `docs/03_技術仕様/00_目次.md` → 必要時1本                                            |
| リポジトリ構成               | `docs/04_リポジトリ構造/構成詳細.md`（入口: `00_目次.md`）                           |
| 開発経緯                     | `docs/05_開発ガイドライン/00_目次.md` → `decision-log.md`                            |
| ユビキタス言語               | `docs/06_ユビキタス言語/00_目次.md`                                                  |
| データモデル                 | `docs/03_技術仕様/データモデル.md`                                                   |
| 図形・色 · 列（作者向け）    | `docs/03_技術仕様/作者ガイド.md` · `lib/flowchart/table/tableColumns.ts`             |
| 作者 Excel · import.json     | `docs/03_技術仕様/Excel取込.md` · `data/devices/README.md` · `npm run excel:inspect` |
| ADR                          | `docs/03_技術仕様/意思決定記録(ADR).md`                                              |

---

## ルール · スキル

索引: `c:/yk-skill/rule/RULE_INDEX.md` · No **17** `APP_PROJECT_RULES` · No **25** `PROJECT_DOCUMENT_RULES`

| 触るもの            | L1 / スキル                                    |
| ------------------- | ---------------------------------------------- |
| React Flow · 表駆動 | `REACTFLOW_RULES.md` · `creating-reactflow-yk` |
| Next.js `app/`      | `NEXTJS_RULES.md`                              |
| 引き継ぎ            | `handoff-session-work`                         |

---

## 禁止 · 注意

- **commit / push** — ユーザー明示までしない
- **handoffs に恒久仕様全文をコピーしない** — パスリンクのみ
- **履歴調査**（`デスクトップからWeb化_*` 等）— ADR-007 判断に使わない

---

## 関連

- [docs/README.md](./docs/README.md) — Product Spec 索引
- [README.md](./README.md) — 実装 · 起動
- [APP_PROJECT_RULES.md](c:/yk-skill/rule/10_meta/APP_PROJECT_RULES.md)
