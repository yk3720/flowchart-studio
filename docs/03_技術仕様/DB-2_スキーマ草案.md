# DB-2 スキーマ草案 — 装置階層 + フロー表分離

**作成:** 2026-05-31  
**状態:** **草案**（grill-me 2026-05-31 合意 · 実装前）  
**関連:** [データモデル.md](./データモデル.md) · [ADR-014](<../03_技術仕様/意思決定記録(ADR).md>) · [ADR-013](<../03_技術仕様/意思決定記録(ADR).md>) · [001_db1_schema.sql](c:/yk-application/flowchart-studio/database/migrations/001_db1_schema.sql)

---

## 1. 目的

| 項目               | 内容                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| **DB-1（済）**     | `profiles` + `flow_documents`（`module_id text` · `payload jsonb`）         |
| **DB-2（本草案）** | **装置構成 4 テーブル**を追加し、**フロー表は `flow_documents` に分離維持** |
| **将来**           | 別アプリが **装置構成のみ** を参照可能にする（フロー表は読まなくてよい）    |

---

## 2. 合意済みの設計原則（grill-me 2026-05-31）

| #   | 原則                                                                                                                                                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **装置構成**と**フロー表（9列）**はテーブル分離                                                                                                          |
| 2   | 装置側は **3 テーブル**: 装置（`devices` · `internal_code` が社内番号 UK）→ ユニット → モジュール（動作）（`equipment_codes` は migration-012 で統合済） |
| 3   | **1 社内番号 = 1 装置**（フォルダ管理と同じ）                                                                                                            |
| 4   | `devices.internal_code` に **番号のみ**（客先名等・外部流出時に問題になる情報は載せない）                                                                |
| 5   | ユニット/動作に社内サブ番号は **ない**（キーは名称 · DB 内部は **uuid** で不変 ID）                                                                      |
| 6   | フロー表は **A: 1 動作 = `flow_documents` 1 行**（`payload jsonb` に `FlowchartDocument` 丸ごと）                                                        |
| 7   | 正本: **Excel 主 + Web 微修正** · 正規化は **Python 等の別ツール**（Excel マクロ回避）                                                                   |
| 8   | Web 構成編集: **理想 B**（追加/削除可）· 複雑なら **初版 A**（名称・並び順のみ）— **スキーマは B 見据え**                                                |
| 9   | **削除（2026-05-31 確定）:** Web（editor）は **フロー表の中身** のみ UPDATE。装置/ユニット/動作の **DB 行 DELETE は日常機能にしない**                    |
| 10  | **legacy_key（2026-05-31 確定）:** **`{社内番号}:{module_slug}`** · 左は必ず社内番号                                                                     |
| 11  | **誤登録削除（2026-05-31 確定）:** Supabase **プロジェクト管理者** → 最終形 **`admin` + 管理画面**                                                       |
| 12  | **viewer（2026-05-31 確定）:** 全閲覧可 · JSON DL 不可は UI のみ · **画面変更なし** · 社内限定                                                           |

---

## 3. ER 概要

```mermaid
erDiagram
  devices ||--o{ units : "1:N"
  units ||--o{ modules : "1:N"
  modules ||--o| flow_documents : "1:0..1"

  devices {
    uuid id PK
    text internal_code UK
    text display_name
    int sort_order
  }
  units {
    uuid id PK
    uuid device_id FK
    text label
    int sort_order
  }
  modules {
    uuid id PK
    uuid unit_id FK
    text label
    int sort_order
  }
  flow_documents {
    uuid module_id PK_FK
    text title
    jsonb payload
    timestamptz updated_at
    uuid updated_by
  }
```

---

## 4. テーブル定義（草案）

### ~~4.1 `equipment_codes`~~ — 廃止（migration-012 で統合済）

> `equipment_codes` テーブルは migration-012（2026-06-14）で廃止。`devices.internal_code` が社内番号 UK を兼ねる。

### 4.2 `devices` — 装置（社内番号 + 表示名）

| 列              | 型            | 制約                             | 説明                                                                |
| --------------- | ------------- | -------------------------------- | ------------------------------------------------------------------- |
| `id`            | `uuid`        | **PK** DEFAULT gen_random_uuid() | 内部 ID（FK 用 · 将来 API）                                         |
| `internal_code` | `text`        | **UNIQUE NOT NULL**              | 社内番号（旧 `equipment_codes.internal_code` · 客先特定名は避ける） |
| `display_name`  | `text`        | NOT NULL                         | 表示名（Web で名称変更可 · 客先特定名は避ける）                     |
| `sort_order`    | `int`         | NOT NULL DEFAULT 0               | Nav 並び（将来複数一覧用）                                          |
| `created_at`    | `timestamptz` | NOT NULL DEFAULT now()           |                                                                     |
| `updated_at`    | `timestamptz` | NOT NULL DEFAULT now()           |                                                                     |

### 4.3 `units` — ユニット

| 列           | 型            | 制約                                | 説明                           |
| ------------ | ------------- | ----------------------------------- | ------------------------------ |
| `id`         | `uuid`        | **PK**                              |                                |
| `device_id`  | `uuid`        | **FK → devices ON DELETE RESTRICT** |                                |
| `label`      | `text`        | NOT NULL                            | ユニット名（Excel / Nav 表示） |
| `sort_order` | `int`         | NOT NULL DEFAULT 0                  | 同一装置内の並び               |
| `created_at` | `timestamptz` | NOT NULL DEFAULT now()              |                                |
| `updated_at` | `timestamptz` | NOT NULL DEFAULT now()              |                                |

- **ユニーク:** `UNIQUE (device_id, label)` — 同一装置内で同名ユニット禁止（Excel 往復の行特定用）
- 10 ユニット上限等の業務ルールは **アプリ/取込バリデーション**（DB 制約は初版スキップ · 保留）

### 4.4 `modules` — 動作モジュール

| 列           | 型            | 制約                              | 説明                                                                       |
| ------------ | ------------- | --------------------------------- | -------------------------------------------------------------------------- |
| `id`         | `uuid`        | **PK**                            | **`flow_documents.module_id` の参照先**                                    |
| `unit_id`    | `uuid`        | **FK → units ON DELETE RESTRICT** |                                                                            |
| `label`      | `text`        | NOT NULL                          | 動作名                                                                     |
| `sort_order` | `int`         | NOT NULL DEFAULT 0                | 同一ユニット内の並び                                                       |
| `legacy_key` | `text`        | NULL                              | **移行用** · 旧 `moduleDraftKey` / DB-1 `module_id text`（移行後 NULL 可） |
| `created_at` | `timestamptz` | NOT NULL DEFAULT now()            |                                                                            |
| `updated_at` | `timestamptz` | NOT NULL DEFAULT now()            |                                                                            |

- **ユニーク:** `UNIQUE (unit_id, label)`
- **`legacy_key`（2026-05-31 確定）:** 移行用 · 形式 **`{社内番号}:{module_slug}`** · 左は **必ず `devices.internal_code`**

### 4.4.1 `legacy_key` 規約（移行用 · 2026-05-31 確定）

| 部分                  | 内容                                | 例                  |
| --------------------- | ----------------------------------- | ------------------- |
| **左（社内番号）**    | `devices.internal_code` と同一      | `12345`             |
| **右（module_slug）** | コード上の安定 ID（表示名ではない） | `supply-feed`       |
| **合成**              | `{社内番号}:{module_slug}`          | `12345:supply-feed` |

- **DB-1 の `flow_documents.module_id text`** を backfill するときの対応表
- **デモ seed:** `press-01` 等は使わず、仮の社内番号（例: `DEMO-001`）を `equipment_codes` に登録してから合成
- **旧形式** `press-01:supply-feed` や bare `supply-feed` は移行 SQL で **社内番号付き composite に変換**してから照合
- 移行完了後 **`legacy_key` を NULL** にできる（タイミングは未決）
- 正本キー（運用）: Excel **名称** + DB **uuid** — `legacy_key` は引っ越し用シール

### 4.5 `flow_documents` — フロー表（DB-1 から変更）

| 列           | 型            | 制約                                        | 説明                                                         |
| ------------ | ------------- | ------------------------------------------- | ------------------------------------------------------------ |
| `module_id`  | `uuid`        | **PK**, **FK → modules ON DELETE RESTRICT** | 1 動作 = 1 行                                                |
| `title`      | `text`        | NULL                                        | 任意タイトル                                                 |
| `payload`    | `jsonb`       | NOT NULL                                    | **`FlowchartDocument`**（`version` · `table` · `layout` 等） |
| `updated_at` | `timestamptz` | NOT NULL DEFAULT now()                      |                                                              |
| `updated_by` | `uuid`        | FK → auth.users                             |                                                              |

**`payload` の形（アプリ型 · 変更なし）:**

```typescript
export type FlowchartDocument = {
  version: 1;
  /** 例: table-9col-v1 · table-10col-v1（ADR-012 + 色列） */
  schema?: string;
  title?: string;
  table: FlowTableRow[]; // 9列〜10列（段+列+色）
  layout: LayoutConfig;
  createdAt: string;
};
```

- フロー **行ごとの正規化テーブルは作らない**（A 確定）
- jsonb 部分インデックス / GIN は **横断検索要件が出るまで不要**

---

## 4.6 削除・更新の方針（2026-05-31 確定 · レビュー #1）

| 操作                                  | Web（初版）               | DB                                                                |
| ------------------------------------- | ------------------------- | ----------------------------------------------------------------- |
| フロー表の **工程行を1〜2個削除**     | **可**                    | `flow_documents.payload` を **UPDATE**（表配列から行を減らす）    |
| フロー表の行追加・文言変更            | 可                        | 同上                                                              |
| **動作（モジュール）1本まるごと削除** | 不可                      | `modules` / `flow_documents` 行の **DELETE 禁止**（RLS · editor） |
| **ユニット・装置の削除**              | 不可                      | 同上                                                              |
| 装置構成の **追加**                   | Excel + Python 取込（主） | editor の **INSERT**（取込パイプライン）                          |
| **誤登録装置の削除**                  | **通常 UI なし**          | **Supabase プロジェクト管理者**のみ（§4.7）                       |

- **物理 DELETE 禁止（editor）** = 装置階層および `flow_documents` **行**を Web から消さない（工程行削除は payload の UPDATE）
- FK は **ON DELETE RESTRICT**（editor 経路では連鎖消失しない）

---

## 4.7 誤登録装置の削除 — 管理者救済（2026-05-31 確定）

**前提:** 装置の誤登録は **それなりに起きうる**。日常 editor には削除 UI を出さない。

### 段階的実装

| 段階                   | 手段                                              | 手間   | タイミング                    |
| ---------------------- | ------------------------------------------------- | ------ | ----------------------------- |
| **M-1（早め · 軽量）** | Supabase Dashboard / SQL Editor + **Runbook**     | 小     | DB-2 と同時または直後         |
| **M-2（中）**          | DB 関数 `admin_delete_equipment(internal_code)`   | 小〜中 | M-1 の次 · 運用開始後早め推奨 |
| **M-3（最終形）**      | `profiles.role` に **`admin`** + **管理専用画面** | 中     | 運用が続くなら早め着手可      |

**初版の管理者:** **Supabase プロジェクト管理者**（ダッシュボード権限）のみ — **手間が少ない**。

**最終形:** アプリ内 **`admin` ロール** + 管理画面（SQL 不要 · 確認 UI · 監査ログ）。

### 削除順序（RESTRICT 前提）

対象 `internal_code` について **子 → 親**: `flow_documents` → `modules` → `units` → `devices`。

**M-2 草案:** `admin_delete_equipment(internal_code)` — `004_flow_documents_module_fk.sql` · SQL Editor から実行（`authenticated` 非公開）。

### やらないこと

- editor / viewer 向け通常 UI に「装置削除」
- service role をブラウザに出す

---

## 5. DB-1 からの移行（案）

| 段階 | 内容                                                                                                        |
| ---- | ----------------------------------------------------------------------------------------------------------- |
| M1   | 新 3 テーブル作成（`devices` · `units` · `modules`）· RLS 追加（`equipment_codes` は migration-012 で廃止） |
| M2   | デモ seed · `legacy_key` = **`{internal_code}:{module_slug}`** · **`004` で seed + backfill**               |
| M3   | `flow_documents.module_id` text → uuid FK — **`004_flow_documents_module_fk.sql`**                          |
| M4   | アプリの `moduleDraftRepository` を uuid ベースに差し替え · Nav は join で取得                              |

**互換:** 移行期間のみ Server Actions が `legacy_key` フォールバックを許容可（1 リリース限り）。

---

## 6. RLS（方針 · DB-1 踏襲 + DELETE 制限）

| テーブル         | SELECT                   | INSERT           | UPDATE                   | DELETE           |
| ---------------- | ------------------------ | ---------------- | ------------------------ | ---------------- |
| `devices`        | authenticated + profiles | editor           | editor                   | **なし**         |
| `units`          | 同上                     | editor           | editor                   | **なし**         |
| `modules`        | 同上                     | editor           | editor                   | **なし**         |
| `flow_documents` | 同上                     | editor（取込等） | **editor（Web 表編集）** | **なし（初版）** |

- **viewer:** 装置構成 + フロー **閲覧可**（ADR-013 · **2026-05-31 確定**）。JSON DL 不可は **UI**（ボタンなし）— DB/RLS は変更しない。社内メンバー限定 · 画面は editor/viewer 同型。
- **将来の別アプリ:** 装置 4 テーブルに対する **読取専用 API**（Server Actions / Route Handler · service role はサーバーのみ）

---

## 7. 将来 API（参考 · 未実装）

```
GET /api/equipment/{internal_code}/tree
→ { internal_code, display_name, units: [{ label, modules: [{ id, label }] }] }
```

- フロー表が要る場合のみ `GET .../modules/{id}/flow` で `flow_documents.payload` を返す
- **社内番号**が外部連携の第一キー

---

## 8. Excel パイプライン（暫定 · スキーマ外）

| レイヤー   | 有力案                               | 状態           |
| ---------- | ------------------------------------ | -------------- |
| ファイル   | 1 ファイル = 1 社内番号              | 未確定（有力） |
| シート     | 1 シート = 1 ユニット                | 未確定（有力） |
| シート内   | 動作ごとに表を **横並び**（入力用）  | 未確定         |
| 正規化     | Python → **取込用シート**（縦 1 表） | 未確定         |
| アプリ取込 | 取込用シートのみ読む                 | 方針           |

取込時の DB 操作（案）:

1. `internal_code` で `devices` を upsert（`equipment_codes` は migration-012 で廃止済み）
2. シート名 → `units.label` upsert
3. 動作名列 → `modules.label` upsert（uuid は既存維持 · 新規は insert）
4. 各動作ブロック → `flow_documents.payload` upsert

---

## 9. 未決（実装前）

- Excel シート内レイアウト（横並び詳細）
- `legacy_key` を **NULL 化するタイミング**（移行から何リリース後か）
- ~~viewer データ境界~~ — **確定**（§2 #12 · ADR-014）
- ~~論理削除（`deleted_at`）~~ — 初版は物理 DELETE 禁止で代替（2026-05-31）

---

## 10. 参照 SQL

正本: `c:/yk-application/flowchart-studio/database/migrations/003_db2_schema.sql` · `004_flow_documents_module_fk.sql` · **dev 適用済（2026-05-31 Dashboard）** · 手順: `docs/runbooks/DB2_MIGRATION_RUNBOOK.md`

---

_レビュー後、指摘を反映して ADR-014 を Accepted に更新する。_
