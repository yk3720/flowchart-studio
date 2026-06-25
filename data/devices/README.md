# 装置ごとの作者データ（置き場 SSOT）

**決定:** 2026-06-25（grill-me）  
**正本詳細:** [Excel取込.md §3](../docs/03_技術仕様/Excel取込.md) · [構成詳細.md §data](../docs/04_リポジトリ構造/構成詳細.md)

> **移行中:** 実装パスはまだ `python/testdata/devices/`。次セッションで本フォルダへ移行予定。

---

## ルート

`c:/yk-application/flowchart-studio/data/devices/`

## フォルダ名

`{社内番号}_{装置名}/`（例: `A0001_塗布装置`）

## フォルダ内

| パス                       | Git        | 用途                                           |
| -------------------------- | ---------- | ---------------------------------------------- |
| `{社内番号}_{装置名}.xlsx` | **対象外** | 装置一式の正本（構成 + 全ユニット・全動作）    |
| `import.json`              | **対象**   | Python 正規化出力 → Web「import.json を取込…」 |
| `README.md`                | 任意       | 装置メモ                                       |
| `archive/`                 | 任意       | 旧版退避                                       |
| `_scratch/{動作名}.xlsx`   | **対象外** | 1 動作だけ Web 表タブで試す用                  |

## 将来（実運）

会社ルールの **装置ごと設計フォルダ**（社内サーバー）に xlsx · import.json を置く。Git には載せない。Web 取込はファイル選択で実施。

## 新規装置

```powershell
cd c:\yk-application\flowchart-studio
npm run excel:new-device -- {社内番号} {装置名}
```

（移行完了後は出力先が `data/devices/` に切り替わる）
