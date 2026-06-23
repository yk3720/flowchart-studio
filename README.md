# flowchart-studio

表データからフローチャートを自動生成する Web アプリ（**React Flow 描画** · `yk-application` 独立リポジトリ）。

**旧名:** `flowchart-web` → `flowchart-web-reactflow`（2026-05-23）→ **`flowchart-studio`**（2026-06-23 · [ADR-010](<c:/yk-application/flowchart-studio/specs/03_技術仕様/意思決定記録(ADR).md>)）

## Product Spec（正本）

[`specs/`](./specs/) — 要求定義〜開発ガイドライン（コードリポに同居 · SDD）。索引: [`specs/README.md`](./specs/README.md)

**エージェント憲法:** [`AGENTS.md`](./AGENTS.md) · **セッション:** [`handoffs/flowchart-web`](c:/yk-memo/handoffs/flowchart-web/HANDOFF.md)

本アプリは **表 JSON → React Flow**（Level・行順ベースのレイアウト）。スタック rule: [`REACTFLOW_RULES.md`](c:/yk-skill/rule/35_reactflow/REACTFLOW_RULES.md)

## 起動（ダブルクリック）

`フローチャートを開く.bat` をダブルクリック → **外部ブラウザ**で http://localhost:3000/login（終了は窓で Ctrl+C）

> **Cursor 利用時:** チャットの localhost リンクはクリックしない。Settings → Tools & MCP → **Show Localhost Links in Browser → OFF** 推奨。詳細: [docs/LOCAL_DEV.md](./docs/LOCAL_DEV.md)

## コマンド

```bash
npm install
npm run dev      # http://localhost:3000/login — 外部ブラウザに貼り付け
npm run build
npm run start    # 本番同等（PC が重いとき）
npm run test     # lib/flowchart
npm run test:e2e # Playwright（Cursor 内部ブラウザ設定と無関係）
```

ローカル確認の正本: [docs/LOCAL_DEV.md](./docs/LOCAL_DEV.md)

## MVP（Phase 1）機能

- [x] 表 JSON 編集（内部）+ 表 UI + 再生成（自動レイアウト）
- [x] 5 種ノード（端子・処理・判断・入出力・手動入力）
- [x] Yes/No ラベル付きエッジ
- [x] JSON をダウンロード / 表を読込（JSON）
- [x] 画像を保存（PNG）
- [x] 「プレビューは古い」表示
- [x] P0 UX: stale 時 PNG ブロック、表編集→再生成、エラー時プレビュー維持、閲覧専用表示

## ディレクトリ

| パス                    | 内容                                       |
| ----------------------- | ------------------------------------------ |
| `lib/flowchart/`        | ドメイン層（React 非依存）                 |
| `fixtures/`             | サンプル JSON                              |
| `components/flowchart/` | UI（client）                               |
| `specs/`                | Product Spec（要求定義〜開発ガイドライン） |
| `docs/adr/`             | ADR 索引（正本は `specs/03_技術仕様/`）    |
| `docs/design-system.md` | **スタイルガイド索引（入口 SSOT）**        |

列の意味: `docs/列の意味.md`  
スタイル・UI の正本索引: [docs/design-system.md](./docs/design-system.md)

## DB-1（ADR-013 · Supabase）

- [x] Supabase Auth（Google / Microsoft）
- [x] `profiles` 許可リスト · editor / viewer
- [x] `flow_documents` クラウド保存（Server Actions）
- [x] オフライン閲覧キャッシュ（IndexedDB · 開いたフロー + ピン）
- セットアップ: [docs/SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md)

## 実用版（2026-05-20）

- [x] 表 UI・CSV 貼り付け・列ヘルプ
- [x] localStorage 下書き（自動保存・起動復元）
- [x] 雛形2種 · PNG / SVG 出力
- [x] エラー行ハイライト・ジャンプ・警告表示
- [x] 表 UI のみ（テーマ/サイズ/JSON タブは削除 · レイアウト・色は固定）

スタイル・UI 索引: [docs/design-system.md](./docs/design-system.md) · 列の意味: [docs/列の意味.md](./docs/列の意味.md)  
開発時スタイル見本: `http://localhost:3000/dev/style`（本番 404）
