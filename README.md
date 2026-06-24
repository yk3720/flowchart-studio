# flowchart-studio

表データからフローチャートを自動生成する Web アプリ（**React Flow 描画** · `yk-application` 独立リポジトリ）。

**旧名:** `flowchart-web` → `flowchart-web-reactflow`（2026-05-23）→ **`flowchart-studio`**（2026-06-23 · [ADR-010](<./docs/03_技術仕様/意思決定記録(ADR).md>)）

## ドキュメント（正本）

[`docs/`](./docs/) — 要求定義〜開発ガイドライン · 運用手順。索引: [`docs/README.md`](./docs/README.md)

**エージェント憲法:** [`AGENTS.md`](./AGENTS.md) · **セッション:** [`handoffs/flowchart-studio`](c:/yk-memo/handoffs/flowchart-studio/HANDOFF.md)

## 起動（ダブルクリック）

`フローチャートを開く.bat` をダブルクリック → **外部ブラウザ**で http://localhost:3000/login（終了は窓で Ctrl+C）

## コマンド

```bash
npm install
npm run dev
npm run build
npm run test
npm run test:e2e
```

ローカル確認: [docs/LOCAL_DEV.md](./docs/LOCAL_DEV.md)

## ディレクトリ（四層）

構成 SSOT: [`docs/04_リポジトリ構造/リポジトリ構造.md`](./docs/04_リポジトリ構造/リポジトリ構造.md)

| 層                 | パス                                                            | 内容                             |
| ------------------ | --------------------------------------------------------------- | -------------------------------- |
| **フロントエンド** | `app/` · `frontend/src/`                                        | ページ · UI · デモ JSON          |
| **バックエンド**   | `backend/src/lib/` · `app/**/route.ts`                          | Server Actions · 認証 · Supabase |
| **データベース**   | `database/migrations/` · `database/sql/` · `database/src/seed/` | DDL · SQL · seed                 |
| **Python**         | `python/src/excel_normalize/` · `python/testdata/`              | Excel 正規化                     |
| **共有**           | `lib/flowchart/`                                                | ドメイン純粋関数                 |
| **仕様**           | `docs/`                                                         | 要求定義〜ADR · Runbook          |
| **E2E**            | `e2e/`                                                          | Playwright                       |

列の意味: [`docs/03_技術仕様/列の意味.md`](./docs/03_技術仕様/列の意味.md)  
スタイル索引: [docs/design-system.md](./docs/design-system.md)
