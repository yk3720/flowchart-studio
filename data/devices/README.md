# 装置ごとの作者データ（置き場 SSOT）

**決定:** 2026-06-25（grill-me）  
**正本詳細:** [Excel取込.md §3](../docs/03_技術仕様/Excel取込.md) · [構成詳細.md §data](../docs/04_リポジトリ構造/構成詳細.md)

---

## ルート

`c:/yk-application/flowchart-studio/data/devices/`

コード参照: `lib/paths/devicesRoot.ts` · `python/src/excel_normalize/devices_root.py`

## フォルダ名

`{社内番号}_{装置名}/`（例: `A0001_塗布装置`）

## フォルダ内

| パス                       | Git        | 用途                                           |
| -------------------------- | ---------- | ---------------------------------------------- |
| `{社内番号}_{装置名}.xlsx` | **対象外** | 装置一式の正本（構成 + 全ユニット・全動作）    |
| `import.json`              | **対象**   | Python 正規化出力 → Web「import.json を取込…」 |
| `README.md`                | 任意       | 装置メモ                                       |

**xlsx 中身の確認（エージェント · 作者共通）:** `npm run excel:inspect -- {社内番号}` — ワンライナー Python 禁止 · SSOT は [Excel取込 §11](../docs/03_技術仕様/Excel取込.md)
| `archive/` | 任意 | 旧版退避 |
| `_scratch/{動作名}.xlsx` | **対象外** | 1 動作だけ Web 表タブで試す用 |

## 登録装置一覧

| 社内番号      | 装置名     | フォルダ             | 備考                                                |
| ------------- | ---------- | -------------------- | --------------------------------------------------- |
| A0001         | 塗布装置   | `A0001_塗布装置/`    | 手書き作業中（2026-06-19〜）                        |
| DEMO-003〜012 | （各名称） | `DEMO-00x_…/`        | ダミー seed · `npm run excel:demo-devices` で再生成 |
| TEST-001      | 試験装置   | `TEST-001_試験装置/` | 試走用                                              |

## 将来（実運）

会社ルールの **装置ごと設計フォルダ**（社内サーバー）に xlsx · import.json を置く。Git には載せない。Web 取込はファイル選択で実施。

## 新規装置

```powershell
cd c:\yk-application\flowchart-studio
npm run excel:new-device -- {社内番号} {装置名}
```

作成後、本 README の「登録装置一覧」に 1 行追加する。
