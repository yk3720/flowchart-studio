# Excel 正規化（Python）

入力用 Excel（構成 + ユニットシート · 横並びテーブル）を `import.json` に変換します。

**SSOT:** [Excel取込.md](../docs/03_技術仕様/Excel取込.md)（パイプライン）· [Excel入力フォーマット\_v0.3.md](../docs/03_技術仕様/Excel入力フォーマット_v0.3.md)（v0.3 作者 xlsx）

## 作者 Excel の置き場所

**決定:** 2026-06-25 — 装置ごとの手書き xlsx · import.json は **`data/devices/`**（Python 層外）。

**Git（2026-06-21）:** 作者用 **`.xlsx` / `.xls` はコミットしない**（`.gitignore`）。リポジトリに載せるのは **`import.json`** と Python コード。テンプレ・pytest 用 xlsx は `npm run excel:template` / `excel:fixture` でローカルまたは CI 生成。

| 種別                 | パス（リポジトリルートから）                                                    |
| -------------------- | ------------------------------------------------------------------------------- |
| **装置ルート**       | `data/devices/{社内番号}_{装置名}/`                                             |
| **装置一式の正本**   | 上記 / `{社内番号}_{装置名}.xlsx`（フォルダ名と同名）                           |
| **正規化出力**       | 上記 / `import.json`                                                            |
| **1 動作の試行**     | 上記 / `_scratch/{動作名}.xlsx`（1 シート · 10 列 · Web 表タブの Excel 取込用） |
| **旧版退避**         | 上記 / `archive/`                                                               |
| **空テンプレ**       | `python/templates/入力用テンプレ_v0.2.xlsx`（v0.2 小規模用 · 生成 · Git 外）    |
| **共有フィクスチャ** | `python/testdata/fixtures/`（Z00001 等 · import.json · 生成 xlsx）              |

### v0.3（大規模装置 · A0001 で採用）

**入力仕様:** [Excel入力フォーマット\_v0.3.md](../docs/03_技術仕様/Excel入力フォーマット_v0.3.md)

| シート                             | 内容                                                     |
| ---------------------------------- | -------------------------------------------------------- |
| **構成**                           | **ユニット ↔ 動作の割当 SSOT**（6 列）                   |
| **装置名 / ユニット / モジュール** | マスター（`ユニット` = MID帯 · `モジュール` = 名前辞書） |
| **U0〜U9**                         | ユニット別フロー表（横並び Excel テーブル）              |

**A0001 コマンド（混同注意）**

| コマンド                         | 用途                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| `npm run excel:a0001:build`      | スクリプトから **xlsx 全再生成**（**手書きを上書き** · 旧 10×10 スキャフォールド）          |
| `npm run excel:a0001:normalize`  | 手書き済み xlsx → **`import.json` のみ**再生成（**手書き後はこちら**）                      |
| `npm run excel:inspect -- A0001` | xlsx 記入状況サマリー（正規化前の確認 · [Excel取込 §11](../docs/03_技術仕様/Excel取込.md)） |

> **段階手書き:** U0 のみ · フロー一部だけ記入でも `normalize` 可（未記入は警告）。**現行コード**は旧 `動作000` テーブル名を n 番目対応付け（[Excel取込 §11](../docs/03_技術仕様/Excel取込.md)）。**v0.3 新規フォーマットでは非採用**（入力フォーマット §10.1）。

> **移行期:** 旧名 `マスター.xlsx` も `normalize_device.py` / pytest が読み取れます。新規作成・全再生成は `{フォルダ名}.xlsx` のみ。

**現在の実装置（手書き作業）:** `A0001_塗布装置/` — 一覧は [`data/devices/README.md`](../data/devices/README.md)

```text
c:/yk-application/flowchart-studio/data/devices/A0001_塗布装置/   ← 移行先
  A0001_塗布装置.xlsx
  import.json
  _scratch/
  archive/
```

## 前提

- Python 3.10+
- 各動作ブロックは **Excel テーブル**（挿入 → テーブル）
- **v0.2 テンプレ:** テーブル名 `{ユニット短名}_{動作名}` · シート名 = ユニット名
- **v0.3（A0001）:** シート名 `U{n}` · テーブル名は [入力フォーマット §9 Q5](../docs/03_技術仕様/Excel入力フォーマット_v0.3.md) 未確定

## セットアップ

**リポジトリルート**（`flowchart-studio/`）から:

```powershell
cd c:\yk-application\flowchart-studio
python -m pip install -e "python[dev]"
```

または **本フォルダ**（`python/`）から:

```powershell
cd c:\yk-application\flowchart-studio\python
python -m pip install -e ".[dev]"
```

> `C:\Users\ykoba` など別の場所で `pip install -e "python[dev]"` を実行すると、ローカルパスではなく PyPI のパッケージ名として解釈されエラーになります。

## 作者向けテンプレ v0.2（現在の標準構成）

**配置:** [`templates/入力用テンプレ_v0.2.xlsx`](templates/入力用テンプレ_v0.2.xlsx)

- **構成:** 供給ユニット（取出 · 供給）+ 加工ユニット（プレス · 離脱）— DEMO-003 と同型
- 構成シート（4 列）+ ユニットシート 2 枚 · 各 2 動作（横並び Excel テーブル）
- テーブル名: `{ユニット短名}_{動作名}`（例: `供給_取出` · `加工_プレス`）
- `_使い方` シートに記入ルール（正規化対象外）

```powershell
python scripts/build_template.py
# またはリポジトリルート: npm run excel:template
```

### 新規装置フォルダを一括作成

```powershell
python scripts/scaffold_device.py Z00002 プレス機D --import-json
# または: npm run excel:new-device -- Z00002 プレス機D
```

`data/devices/Z00002_プレス機D/Z00002_プレス機D.xlsx` と `archive/` ができます。

## 作者向けテンプレ v0.1（旧 · 供給 + 収納）

`workbook_builder.build_workbook()` — Z00001 fixture 用。新規装置は **v0.2** を使用。

## テスト用 fixture 生成

```powershell
python scripts/build_fixture.py
```

`testdata/fixtures/input-device-z00001.xlsx` が出力されます（テンプレと同構成 · `_使い方` なし）。

## 正規化

```powershell
python -m excel_normalize.cli testdata/fixtures/input-device-z00001.xlsx -o testdata/fixtures/import-z00001.json
```

## テスト

```powershell
python -m pytest
python -m mypy excel_normalize
```

## npm（リポジトリルートから）

```powershell
cd c:\yk-application\flowchart-studio
npm run excel:template
npm run excel:fixture
npm run excel:normalize
npm run excel:test
```

## Web 取込（import.json）

1. 上記で `testdata/fixtures/import-z00001.json` を生成（または `-o` で任意パス）
2. dev Supabase に **`005_import_equipment_bundle.sql`** を適用（`docs/runbooks/DB2_MIGRATION_RUNBOOK.md`）
3. Web アプリ（editor ログイン）→ **その他 → import.jsonを取込…**
4. 左ナビに装置が追加され、各動作のフローが読み込めること

**再取込:** 追加・更新のみ。構成から行を消しても DB からは自動削除されない（ADR-014）。
