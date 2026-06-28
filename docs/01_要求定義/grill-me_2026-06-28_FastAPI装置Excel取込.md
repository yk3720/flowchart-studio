# grill-me — FastAPI 装置 Excel ブラウザ取込（2026-06-28）

**種別:** grill-me（設計深掘り · 実装前）  
**正本:** [ADR-019 草案](<../03_技術仕様/意思決定記録(ADR).md#adr-019-fastapi-装置-excel-ブラウザ取込草案--2026-06-28>) · [Excel取込.md](../03_技術仕様/Excel取込.md)  
**経緯:** session 71 → 本 grill（Q1〜Q5）→ 実装 → **[暫定方針（第2回）](./grill-me_2026-06-28_装置取込暫定方針.md)** — Web JSON-only · FastAPI デプロイ保留

> **最新の運用方針:** [grill-me*2026-06-28*装置取込暫定方針.md](./grill-me_2026-06-28_装置取込暫定方針.md) — 本書の Q5（xlsx + json）は **Web では JSON のみに縮小**（FastAPI 本番は保留）。

---

## 背景

装置全体の作者 xlsx は **Python CLI → import.json → Web 一括取込** が正本。作者は PC で normalize が必要。Excel取込 §3.1 の将来像「Web 取込はファイル選択」とずれる。

---

## 決まったこと（Q1〜Q5）

| #   | 論点             | 決定                                                            |
| --- | ---------------- | --------------------------------------------------------------- |
| Q1  | FastAPI を足すか | **追加（限定）** — 装置 xlsx のブラウザ取込 · 1 フロー/CLI 並行 |
| Q2  | 正規化           | **同 Python スクリプト**（FastAPI から呼ぶ）                    |
| Q3  | DB 保存          | **FastAPI=変換のみ** · **Web=importEquipmentBundle**            |
| Q4  | 取込前           | **プレビュー →「取込」** · エラー不可 · 警告可                  |
| Q5  | メニュー         | **「装置を取込…」**（xlsx + import.json 統合）                  |

**1 行:** FastAPI で装置 xlsx を同 Python 変換 → Web プレビュー → 既存 RPC で DB 保存。

---

## ガードレール（再レビュー合意 · ADR-019 に反映）

1. FastAPI は **Next プロキシ経由のみ**（ブラウザ直叩き不可）
2. normalize **SSOT**（CLI · pytest · FastAPI で同一モジュール）
3. プレビューと取込で **batch_id / ハッシュ** 一致
4. アップロード **上限 · MIME · タイムアウト**
5. 作者向け **平易なエラーメッセージ**

---

## 却下

- Web 内 xlsx 横並び正規化（ADR-014 踏襲）
- FastAPI から Supabase 直接書込
- CLI / import.json 経路の廃止
- 変換成功の自動 DB 保存（プレビューなし）

---

## 未決（実装フェーズ）

- ~~FastAPI ホスト（Railway 等）~~ → **本番デプロイ保留**（[暫定方針](./grill-me_2026-06-28_装置取込暫定方針.md)）
- **変換 exe 配布**（作者 PC · Python なし想定）
- import.json ダウンロード（任意 · 推奨）
- 非同期/進捗 UI（大ファイル）
- FastAPI 再開条件

---

## 関連

- [暫定方針（第2回 · 正本）](./grill-me_2026-06-28_装置取込暫定方針.md)

- [handoff session 71 §4](c:/yk-memo/handoffs/flowchart-studio/2026-06-27_71_fastapi-discussion-session-end.md)
- [FASTAPI_RULES.md](c:/yk-skill/rule/40_python/FASTAPI_RULES.md)
