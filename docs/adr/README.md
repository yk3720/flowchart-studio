# ADR

**正本:** [`specs/03_技術仕様/意思決定記録(ADR).md`](<../../specs/03_技術仕様/意思決定記録(ADR).md>)

本フォルダは索引・履歴用。Accepted 決定の編集は `specs/` 側で行う。

- ADR-001: MVP 入力は JSON/fixture のみ
- ADR-002: バリデーションエラー時は生成停止
- ADR-003: Yes/No は direction から導出、接続サイトを FlowEdge に保持
- ADR-004: measureHeights の層分離
- ADR-005: MVP 完了 = AC-1〜8、Phase 0 = generate golden
- ADR-006: React Flow は派生ビュー（読取専用）
- ADR-007: MZ0000 非参照・UX 調査を SSOT
- ADR-008: P0 UX（stale PNG ブロック、タブ同期、エラー時プレビュー維持）
- ADR-009: 調査項目一括（CSV・下書き・雛形・テーマ・SVG・列ヘルプ等）
- ADR-010: React Flow 本線 · `flowchart-studio`（旧 `flowchart-web-reactflow`）
- ADR-011: Phase 3 — 3 ペイン（ユニット→モジュールナビ｜表｜図）、モジュール単位の退避・stale
- ADR-012: 9 列モデル（段 + 列）— ドラフト
- ADR-013: 永続化（Supabase）· 認証 · Vercel 公開 — DB-1
- ADR-014: 装置階層 DB-2（4表 + flow_documents 分離）— dev/本番適用済
- ADR-015: フロー共同編集 — 編集は全 editor · 削除は所有者/admin
