# 装置 Excel 変換 exe — 設計（作者向け）

**目次:** [00\_目次.md](./00_目次.md)

**作成:** 2026-06-28  
**更新:** 2026-06-28（命名確定 · 実装着手）  
**状態:** **実装済 · Release v0.1.1 済**（2026-06-28 · [excel-converter-v0.1.1](https://github.com/yk3720/flowchart-studio/releases/tag/excel-converter-v0.1.1)）· **MID 照合修正入り**  
**関連:** [Excel取込.md](./Excel取込.md) · [暫定方針 grill](../01_要求定義/grill-me_2026-06-28_装置取込暫定方針.md) · [ADR-019 暫定](<./意思決定記録(ADR).md#adr-019-fastapi-装置-excel-ブラウザ取込草案--2026-06-28>) · `python/src/excel_normalize/`

---

## 1. 目的

| 項目            | 内容                                                                                 |
| --------------- | ------------------------------------------------------------------------------------ |
| **誰向け**      | Python / Node を入れていない**作者**（装置設計担当）                                 |
| **何をする**    | 入力用 **xlsx** を選び、Web 取込用 **`import.json`** を PC 上で生成する              |
| **何をしない**  | Web への直接アップロード · DB 書き込み · xlsx の内容検査 UI（`excel:inspect` 相当）  |
| **正規化 SSOT** | **`excel_normalize.normalize_workbook`** — CLI · pytest · FastAPI と**同一ロジック** |

**背景:** [暫定方針](../01_要求定義/grill-me_2026-06-28_装置取込暫定方針.md) — Web「装置を取込…」は **import.json のみ**。xlsx 正規化は作者 PC に集約し、FastAPI/Railway 月額を回避する。

---

## 2. 1 行決定

**PyInstaller で `excel_normalize` CLI を Windows 向け GUI exe に包む。** 作者は xlsx を選び、同フォルダへ `import.json` を出力する。Web 取込フローは暫定方針と同一。

### 2.1 命名（3 層 · 2026-06-28 確定）

Web 調査 · サブエージェントレビュー（作者 UX / エンジニアリング / 製品整合）の結果、**表示は日本語 · ファイル名は ASCII** のハイブリッドを採用。

| 層                       | 名称                                                             | 用途                                         |
| ------------------------ | ---------------------------------------------------------------- | -------------------------------------------- |
| **ユーザー向け（GUI）**  | `Flowchart Studio — Excel 変換`                                  | ウィンドウタイトル                           |
| **ユーザー向け（補足）** | `Web 取込用 import.json を出力`                                  | 画面サブタイトル                             |
| **exe ファイル名**       | `FlowchartStudio-ExcelConverter.exe`                             | 配布 · PATH · SmartScreen 互換               |
| **Release 資産**         | `FlowchartStudio-ExcelConverter-v0.1.1-win64.exe`                | GitHub Release 添付                          |
| **VERSIONINFO**          | ProductName=`Flowchart Studio` · FileDescription=`Excel 変換…`   | エクスプローラ「詳細」                       |
| **内部（Python）**       | `excel_converter_gui`                                            | モジュール · `python -m excel_converter_gui` |
| **内部（ビルド）**       | `excel_converter.spec` · `--name FlowchartStudio-ExcelConverter` | PyInstaller                                  |
| **内部（Git タグ）**     | `excel-converter-v0.1.1`                                         | Release と 1:1                               |

**却下:** exe ファイル名に日本語（`FlowchartStudio-Excel変換.exe`）— 社内 PATH/UNC での文字化けリスク。作者向け exe 名から「装置」を外す（Web 入口「装置を取込…」と混同しにくくするため GUI 補足で説明）。

---

## 3. 作者フロー（exe 利用時）

```text
(1) Excel で装置一式を編集（v0.3 入力用 xlsx）
(2) 本 exe を起動
      → xlsx を選択
      → import.json を出力（既存ファイルは上書き確認）
      → 成功 / エラー / 警告を画面で確認
(3) Web ログイン → 装置 workspace → その他 →「装置を取込…」
(4) import.json を選択 → プレビュー →「取込」
(5) 左ナビで確認
```

**開発者向け CLI 経路は維持:** `npm run excel:a0001:normalize` 等 — exe と**出力形式は同一**。

**実運（将来）:** 社内サーバーの装置フォルダに xlsx · import.json を置く運用でも、**(2) の出力先 = xlsx と同じフォルダ** を既定とする（[Excel取込 §3.1](./Excel取込.md) · [data/devices/README.md](../../data/devices/README.md)）。

---

## 4. 画面仕様（v1）

### 4.1 起動時

| 要素               | 内容                                                             |
| ------------------ | ---------------------------------------------------------------- |
| ウィンドウタイトル | `Flowchart Studio — Excel 変換`                                  |
| サブタイトル       | `Web 取込用 import.json を出力`                                  |
| 版表示             | `excel-normalize` のバージョン（例: `v0.1.1`）を右下または About |
| 主操作             | **「Excel ファイルを選ぶ…」** ボタン                             |

### 4.2 ファイル選択

| 項目       | 仕様                                                                      |
| ---------- | ------------------------------------------------------------------------- |
| ダイアログ | Windows 標準ファイル選択                                                  |
| フィルタ   | `*.xlsx` · `*.xls`（`.xlsx` を第一表示）                                  |
| 複数選択   | **不可**（v1 は 1 ファイルずつ）                                          |
| 入力       | 作者が選んだ **任意パス** の xlsx（`data/devices/` 外の社内フォルダも可） |

### 4.3 出力先

| 項目       | 仕様                                                        |
| ---------- | ----------------------------------------------------------- |
| **既定**   | 選択 xlsx と**同じフォルダ** · ファイル名 **`import.json`** |
| **変更**   | v1 では **既定のみ**（「別名で保存…」は **v2 候補**）       |
| **上書き** | 出力先に `import.json` が既にある → **確認ダイアログ**      |

**上書き確認（案文言）**

```text
import.json は既にあります。
上書きしますか？

  出力先: C:\...\import.json
```

- **はい** → 正規化実行 · 上書き
- **いいえ** → 処理中止（xlsx 選択からやり直し可）

### 4.4 実行中 · 完了

| 状態         | 表示                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| 処理中       | ボタン無効 · 「変換中…」ラベル（目安 数秒以内 · 大装置でも 30 秒以内想定） |
| **成功**     | 「変換が完了しました」+ 出力パス · フロー数（例: `12 フロー`）             |
| **警告あり** | 成功扱い · 警告一覧を別枠（黄色系）— 取込は Web 側でも警告表示             |
| **エラー**   | 赤枠 · エラー全文（スクロール可）· **出力ファイルは書かない**              |

### 4.5 画面技術

| 項目               | 決定                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| GUI フレームワーク | **tkinter**（Python 標準 · PyInstaller 同梱が容易）                                |
| 配置               | `python/src/excel_converter_gui/` · `python/packaging/excel_converter.spec`        |
| エントリ           | `python -m excel_converter_gui` · `npm run excel:converter:run`                    |
| ビルド             | `npm run excel:converter:build` → `python/dist/FlowchartStudio-ExcelConverter.exe` |
| smoke              | `npm run excel:converter:smoke`（module CLI + 凍結 exe · Z00001 fixture）          |
| 開発 CLI           | `FlowchartStudio-ExcelConverter.exe --convert INPUT.xlsx -o import.json -y`        |

---

## 5. 正規化・入出力（CLI との関係）

### 5.1 呼び出し

```text
normalize_workbook(input_xlsx_path)
  → bundle dict
  → json.dumps(..., ensure_ascii=False, indent=2)
  → output_path.write_text(...)
```

- **CLI 相当:** `python -m excel_normalize.cli INPUT.xlsx -o import.json`
- **装置フォルダ CLI:** `normalize_device.py` は社内番号解決付き — exe は**パス直指定**のみ（作者はエクスプローラで xlsx を選ぶ）

### 5.2 出力 JSON

- スキーマ · 検証 · 警告は [Excel取込 §4〜§5](./Excel取込.md) に従う
- Web プレビュー · `importEquipmentBundle` と**互換**（追加メタなし）

---

## 6. エラー表示（作者向け · Excel取込 §7 精神）

**形式:** **何が · どこで · どう直す** — 技術用語（RPC · batch_id 等）は出さない。

### 6.1 正規化エラー（`NormalizeError`）

`excel_normalize` が stderr に出す日本語メッセージを**そのまま GUI に表示**（文言 SSOT は Python · pytest で固定）。

| 例（既存 CLI）                                                     | 作者への意味                      |
| ------------------------------------------------------------------ | --------------------------------- |
| 構成に「供給 · 取出」がありますが、フロー表が未登録です            | 段階手書きの警告 — **変換は成功** |
| ユニットシート「加工」· テーブル「プレス」が構成シートにありません | 構成とシートの対応を直す          |
| V-B1: MID 12 がユニット0 の帯外です                                | v0.3 構成シートの MID 割当を直す  |

### 6.2 exe 固有のラップ

| 状況                            | 表示（案）                                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| ファイルが存在しない            | `選択した Excel ファイルが見つかりません:` + パス                                                    |
| 読み取り不可 · 他アプリでロック | `Excel ファイルを開けません。Excel で閉じてからもう一度お試しください。`                             |
| 出力先フォルダに書込不可        | `import.json を保存できません。フォルダの書き込み権限を確認してください:` + パス                     |
| 想定外の例外                    | `予期しないエラーが発生しました。開発者に連絡してください。` + 短い技術メモ（ログファイルパスは v2） |

### 6.3 Web 側との役割分担

| 層      | 検証                                                                        |
| ------- | --------------------------------------------------------------------------- |
| **exe** | xlsx → import.json 生成時の整合性（§5）                                     |
| **Web** | JSON スキーマ · batch_id · サイズ上限 · プレビュー → 取込（暫定方針どおり） |

---

## 7. 版管理 · 配布

### 7.1 バージョン番号

| 項目           | ルール                                                                               |
| -------------- | ------------------------------------------------------------------------------------ |
| **表示版**     | `python/pyproject.toml` の `excel-normalize` 版（現行 `0.1.1`）                      |
| **ビルド識別** | Git タグ `excel-converter-v{semver}` または Release 名と一致                         |
| **互換**       | exe 版 ≦ Web 本番が受け付ける import.json スキーマ — 破壊的変更時は **両方リリース** |

### 7.2 配布先（優先順）

| 順  | チャネル                                                 | 用途                       |
| --- | -------------------------------------------------------- | -------------------------- |
| 1   | **GitHub Release**（`flowchart-studio` リポ · 添付 exe） | 開発者 · 早期作者 · 版履歴 |
| 2   | **社内ファイルサーバー**（装置設計フォルダ横）           | Python なし作者の日常運用  |
| 3   | （任意）作者 PC への直接配布                             | 初期試用 · 1〜2 名         |

**Release 資産名:** `FlowchartStudio-ExcelConverter-v0.1.1-win64.exe`

### 7.3 更新告知

- Release Notes: 入力フォーマット v0.3 変更 · 既知の警告増減を 1 行
- Web バナー（xlsx 選択時）は **exe 名を表示**（`FlowchartWorkspace.tsx` · 2026-06-28）

### 7.4 対象 OS

| OS                      | v1                                   |
| ----------------------- | ------------------------------------ |
| **Windows 10/11 64bit** | **対象**                             |
| macOS · Linux           | **非対象**（作者 PC 想定が Windows） |

---

## 8. ビルド方針（実装フェーズ用メモ）

| 項目       | 方針                                                                                   |
| ---------- | -------------------------------------------------------------------------------------- |
| ツール     | **PyInstaller**（`pip install pyinstaller` · dev 依存に追加）                          |
| 形式       | **`--onefile`**（作者は exe 1 個だけ受け取る）                                         |
| 同梱       | `openpyxl` · `excel_normalize` · tkinter                                               |
| spec 配置  | `python/packaging/excel_converter.spec`                                                |
| CI         | **v1 は手動ビルド** — **`npm run excel:converter:verify`**（exe 停止 → build → smoke） |
| コード署名 | **未決** — 社内配布で SmartScreen 警告が出る場合は IT ポリシーに従う                   |

| **npm スクリプト:** `excel:converter:run` · **`excel:converter:verify`**（build+smoke 推奨）· **`excel:converter:release`**（verify → 版付き exe → タグ → GitHub Release）· `excel:converter:smoke` · `excel:converter:build`

### 8.1 トラブルシュート

| 症状                                         | 原因                             | 対処                                                                  |
| -------------------------------------------- | -------------------------------- | --------------------------------------------------------------------- |
| `ImportError: relative import … __main__.py` | PyInstaller 入口が `__main__.py` | `runner.py` + `packaging/*_entry.py` を正とする（`PYTHON_RULES` §13） |
| ビルド `PermissionError WinError 5`          | exe 起動中                       | exe を閉じる · **`npm run excel:converter:verify`**（自動 taskkill）  |
| smoke ハング                                 | 同上 · 旧ビルド                  | verify を再実行                                                       |
| 警告が大量                                   | 段階手書き                       | **正常** — 記入済み flows のみ JSON 化（Excel取込 §5 · §11）          |

---

## 9. スコープ外（v1 · 明示的にやらない）

| 項目                                | 理由                                                   |
| ----------------------------------- | ------------------------------------------------------ |
| Web から exe を呼ぶ                 | 暫定 JSON-only · ブラウザからローカル exe 起動は別 ADR |
| `excel:inspect` 相当 UI             | 開発者 CLI のまま · exe は変換特化                     |
| 複数 xlsx の一括変換                | 作者は 1 装置 = 1 xlsx                                 |
| FastAPI 代替                        | 本番 API **保留** — exe が第一経路                     |
| import.json の Web から DL          | 暫定方針バックログ · 別タスク                          |
| 自動ブラウザ起動 · Web 取込まで連続 | 作者フローは **ファイル選択** で十分（暫定方針 #5）    |

---

## 10. 受け入れ条件（実装完了の Definition of Done）

- [x] **凍結 exe** — `npm run excel:converter:smoke`（Z00001 fixture · module + exe）
- [x] **A0001 実機変換** — 開発 PC · exe · 16 flows · 段階手書き警告（2026-06-28）
- [ ] Windows 10/11 で **Python 未インストール** PC に exe だけコピーし、作者 xlsx から `import.json` が生成できる
- [x] GUI · 変換ロジック · pytest（`test_converter_gui.py` · `test_converter_cli.py`）
- [x] 既存 `import.json` があるとき **上書き確認**（GUI · CLI は `-y` で省略）
- [ ] 構成エラー時に **日本語** で修正ヒントが読める（pytest の fixture エラーと同等以上）
- [x] 生成 JSON を Web「装置を取込…」→ プレビュー → 取込まで通せる — `e2e/import-bundle-auth.spec.ts`（`npm run test:e2e:import-auth` · RPC スタブ · 本番 auth UI）
- [x] GitHub Release（または社内共有）に **版付き exe** が置ける — [excel-converter-v0.1.1](https://github.com/yk3720/flowchart-studio/releases/tag/excel-converter-v0.1.1) · `FlowchartStudio-ExcelConverter-v0.1.1-win64.exe`（2026-06-28 · MID 照合修正）
- [x] [Excel取込.md](./Excel取込.md) · [python/README.md](../../python/README.md) から本設計へリンクされている

---

## 11. 関連資料

| 資料                                                                                  | 用途                                |
| ------------------------------------------------------------------------------------- | ----------------------------------- |
| [Excel取込.md](./Excel取込.md)                                                        | パイプライン · 検証 · 作者エラー §7 |
| [Excel入力フォーマット\_v0.3.md](./Excel入力フォーマット_v0.3.md)                     | 作者 xlsx 入力 SSOT                 |
| [grill-me 暫定方針](../01_要求定義/grill-me_2026-06-28_装置取込暫定方針.md)           | 運用正本                            |
| [python/README.md](../../python/README.md)                                            | 開発者 CLI                          |
| [data/devices/A0001\_塗布装置/README.md](../../data/devices/A0001_塗布装置/README.md) | 手書き装置の normalize 手順         |

---

_実装済 · Release v0.1.1 済 · 次: Python なし PC 実機 · 設計メモ本番目視（[Runbook](../runbooks/DESIGN_MEMO_PRODUCTION_CHECK.md)）_
