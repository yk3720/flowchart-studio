# A0001 塗布装置 — 作者 Excel

| 項目     | 値                                                                |
| -------- | ----------------------------------------------------------------- |
| 社内番号 | `A0001`                                                           |
| 装置名   | 塗布装置                                                          |
| フォルダ | `c:/yk-application/flowchart-studio/data/devices/A0001_塗布装置/` |

## ファイル

| ファイル                                       | 用途                                            |
| ---------------------------------------------- | ----------------------------------------------- |
| [`A0001_塗布装置.xlsx`](./A0001_塗布装置.xlsx) | 装置一式の正本（v0.3 · 5 ユニット · 帯 128 枠） |
| [`import.json`](./import.json)                 | 正規化済み bundle                               |
| `_scratch/{動作名}.xlsx`                       | 1 動作だけ Web で試す表（例: `取出.xlsx`）      |
| `archive/`                                     | 旧版退避                                        |

## 作業の進め方

1. **記入状況の確認** — `npm run excel:inspect -- A0001`（[Excel取込 §11](../../docs/03_技術仕様/Excel取込.md)）
2. **1 動作の確認** — `_scratch/` に 10 列表を置き、Web 表タブ → **Excel ファイル…** → **再生成**
   - 試行用 xlsx 再生成: リポジトリルートで `npm run excel:a0001:scratch` → `_scratch/取出.xlsx`
3. **装置一式** — `A0001_塗布装置.xlsx` を手書き更新 → 正規化 → **import.jsonを取込…**
   - **手書き後:** リポジトリルートで `npm run excel:a0001:normalize` のみ（`import.json` 再生成）
   - **段階手書き:** U0 のみ · フロー一部だけでも normalize 可（U1〜 はシート追加後に追記）
   - **初回スキャフォールド / xlsx 全再生成:** `npm run excel:a0001:build`（**手編集を上書きする** — 手書き後は使わない）
   - Supabase 実取込: `npm run seed:a0001`（要 `SUPABASE_SERVICE_ROLE_KEY` または生成 SQL を SQL Editor で Run）

置き場所の共通ルール: [`../README.md`](../README.md)
