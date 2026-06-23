# AGENTS.md — flowchart-studio

エージェント向け憲法。**境界 · SSOT · 再開手順**を1か所に集約する（500行未満 · 毎セッション Read 可）。

| 項目                  | 値                                                                          |
| --------------------- | --------------------------------------------------------------------------- |
| **handoffs slug**     | `flowchart-web`                                                             |
| **Product Spec 正本** | 本リポ `specs/`（コードと同居 · SDD）                                       |
| **講座・提出**        | `c:/yk-memo/00.ai-driven-school/個人テーマ_フローチャートアプリ/00_テーマ/` |
| **更新**              | 2026-06-23（specs を実装リポへ移行）                                        |

---

## プロダクトの一文

表からフローチャートを自動生成し、ブラウザで表示・JSON 保存・PNG/SVG 出力できる Web アプリ。

---

## 再開（毎セッション · この順）

1. [`handoffs/flowchart-web/HANDOFF.md`](c:/yk-memo/handoffs/flowchart-web/HANDOFF.md) — 最新セッションリンク
2. **最新セッション MD §4 だけ**実行（ロードマップ全体に広げない）
3. 本ファイル（境界確認）

```text
@c:/yk-memo/handoffs/flowchart-web/HANDOFF.md
@c:/yk-memo/handoffs/flowchart-web/2026-06-23_14_login-restore-complete-session-end.md
@c:/yk-application/flowchart-studio/AGENTS.md
続きから。§4 の1件だけ。終わったら止めて報告。
```

> セッション MD が更新されたら、2行目を HANDOFF の「最新セッション」に差し替える。

**仕様疑問時のみ追加 Read:** `specs/03_技術仕様/データモデル.md` · `specs/03_技術仕様/意思決定記録(ADR).md` · `specs/05_開発ガイドライン/decision-log.md`

---

## 引き継ぎ終了時（毎回 · `handoff-session-work`）

| #   | 更新するファイル                                                                     |
| --- | ------------------------------------------------------------------------------------ |
| 1   | `handoffs/flowchart-web/` — 新規セッション MD · HANDOFF「最新セッション」· §6        |
| 2   | 本ファイル — 再開ブロック2行目の `@`                                                 |
| 3   | `c:/yk-memo/.../新チャット依頼.md` — コピペ2行目（本ファイルと同じセッション MD）    |
| 4   | `specs/05_開発ガイドライン/decision-log.md` — タイムライン **1行**（本文コピー禁止） |

**更新しない:** handoffs 以外への §4 書き戻し

---

## 文書種

| 種別         | 正本                                        | いつ書く                           |
| ------------ | ------------------------------------------- | ---------------------------------- |
| decision-log | `specs/05_開発ガイドライン/decision-log.md` | 合意 · ADR · セッション終了時に1行 |
| grill-me     | `specs/01_要求定義/grill-me_*` · `相談_*`   | 方針深掘り後                       |
| ADR          | `specs/03_技術仕様/意思決定記録(ADR).md`    | 採用決定時（`docs/adr/` と同期）   |
| §4           | handoffs 最新                               | 毎セッション                       |
| 運用手順     | `docs/`（LOCAL_DEV · Runbook 等）           | 実装隣接                           |

**現状 · 次の1件:** [HANDOFF §6](c:/yk-memo/handoffs/flowchart-web/HANDOFF.md)

---

## コード · ドキュメント配置

| 用途                      | パス                                  |
| ------------------------- | ------------------------------------- |
| **本リポ（実装 + 仕様）** | `c:/yk-application/flowchart-studio/` |
| **Product Spec**          | `specs/`                              |
| **運用 · セットアップ**   | `docs/`                               |
| **起動 bat**              | `フローチャートを開く.bat`            |

```powershell
cd c:\yk-application\flowchart-studio
npm run dev
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

| やる                                      | やらない                           |
| ----------------------------------------- | ---------------------------------- |
| 表 → IR → 格子レイアウト → React Flow     | Excel COM · Office Add-in          |
| JSON / CSV / Excel 取込 · 表 UI · PNG/SVG | 図解管理 WS との統合               |
| 1 セッション = §4 の **1 件**             | 完成チェックリスト全項目の一括実装 |
| 変更前に ADR → specs → コードの順         | dagre でノード位置決定             |

---

## SSOT マップ

| ドメイン                     | 正本                                                        |
| ---------------------------- | ----------------------------------------------------------- |
| **セッション進捗 · 次の1件** | `c:/yk-memo/handoffs/flowchart-web/`                        |
| **講座提出**                 | `yk-memo/.../00_テーマ/選定表_記入稿.md`                    |
| 概要 · 境界                  | `specs/01_要求定義/プロジェクト概要.md`                     |
| MVP                          | `specs/01_要求定義/MVP定義.md`                              |
| 完成の定義                   | `specs/01_要求定義/完成チェックリスト.md`                   |
| データモデル                 | `specs/03_技術仕様/データモデル.md`                         |
| 図形・色                     | `specs/03_技術仕様/フローチャート記述ルール.md`             |
| 開発経緯                     | `specs/05_開発ガイドライン/decision-log.md`                 |
| ADR                          | `specs/03_技術仕様/意思決定記録(ADR).md`                    |
| 列ヘルプ（実装同期）         | `specs/03_技術仕様/列の意味.md` · `docs/列の意味.md` は索引 |

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

- [specs/README.md](./specs/README.md) — Product Spec 索引
- [README.md](./README.md) — 実装 · 起動
- [APP_PROJECT_RULES.md](c:/yk-skill/rule/10_meta/APP_PROJECT_RULES.md)
