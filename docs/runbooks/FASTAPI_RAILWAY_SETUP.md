# FastAPI 正規化 API — Railway デプロイ Runbook（ADR-019）

> **状態（2026-06-28 暫定）:** 本 Runbook の手順は **保留**。運用正本は [grill-me 暫定方針](../01_要求定義/grill-me_2026-06-28_装置取込暫定方針.md) — Web は **import.json のみ** · Vercel **`FASTAPI_*` 不要**。再開時に本 Runbook を適用する。

**目的:** 装置 xlsx 正規化 API（`normalize_api`）を **Railway** に載せ、**Vercel 本番**の Next プロキシから呼べるようにする。

**正本:** [ADR-019](<../03_技術仕様/意思決定記録(ADR).md#adr-019-fastapi-装置-excel-ブラウザ取込草案--2026-06-28>) · `python/src/normalize_api/` · `python/Dockerfile`

**更新:** 2026-06-28

---

## 1. 構成

```
作者ブラウザ
  → Vercel（Next.js）POST /api/equipment/normalize  … editor セッション
      → Railway FastAPI POST /api/v1/normalize     … X-API-Key
          → excel_normalize.normalize_workbook（CLI と同一）
  → プレビュー → importEquipmentBundle → Supabase
```

| 項目                   | 方針                                                     |
| ---------------------- | -------------------------------------------------------- |
| **FastAPI ホスト**     | Railway（本リポ `python/` を Root Directory）            |
| **Next ホスト**        | Vercel（従来どおり）                                     |
| **ブラウザ → FastAPI** | **禁止**（Next プロキシのみ）                            |
| **共有秘密**           | `FASTAPI_API_KEY`（Railway · Vercel 本番で同一値）       |
| **デモ Vercel**        | **env 不要**（`AUTH_DISABLED` で装置取込メニュー非表示） |

---

## 2. 事前準備

1. [Railway](https://railway.app/) アカウント
2. 共有 API キー生成（例）:

```powershell
# PowerShell
-join ((1..32 | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) }))
```

または `openssl rand -hex 32`

3. 本リポを GitHub に push 済みであること

---

## 3. Railway プロジェクト作成

### 3-1. 新規サービス

1. Railway Dashboard → **New Project** → **Deploy from GitHub repo**
2. リポジトリ: `flowchart-studio`（本アプリ）
3. **Settings → Root Directory:** `python`（必須）
4. **Settings → Build:** Dockerfile（`python/railway.toml` が自動検出）

### 3-2. 環境変数（Production）

| 変数              | 値                    | 備考                                  |
| ----------------- | --------------------- | ------------------------------------- |
| `FASTAPI_API_KEY` | （§2 で生成した秘密） | Next の `FASTAPI_API_KEY` と **同一** |
| `CORS_ORIGINS`    | （空で可）            | ブラウザ直叩きなし · 空 = CORS 無効   |
| `ENABLE_DOCS`     | `0`                   | 本番 `/docs` 非公開                   |

任意:

| 変数                  | 既定       | 備考                                 |
| --------------------- | ---------- | ------------------------------------ |
| `MAX_UPLOAD_BYTES`    | `10485760` | TS `EQUIPMENT_XLSX_MAX_BYTES` と同期 |
| `PROCESS_TIMEOUT_SEC` | `60`       | 正規化タイムアウト                   |

### 3-3. デプロイ確認

1. Deploy 成功後、**Settings → Networking → Generate Domain** で公開 URL を取得  
   例: `https://flowchart-normalize-api-production.up.railway.app`
2. ヘルスチェック:

```powershell
curl.exe https://YOUR-RAILWAY-DOMAIN/health
# → {"status":"ok"}
```

3. normalize（API キー必須 · ローカル fixture 例）:

```powershell
curl.exe -X POST "https://YOUR-RAILWAY-DOMAIN/api/v1/normalize" `
  -H "X-API-Key: YOUR_FASTAPI_API_KEY" `
  -F "file=@python/testdata/fixtures/input-device-z00001.xlsx;type=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
```

> fixture xlsx 未生成時: リポジトリルートで `npm run excel:fixture`

---

## 4. Vercel 本番 env

**対象:** 本番プロジェクトのみ（[PUBLIC_URL_SETUP.md](./PUBLIC_URL_SETUP.md) URL 1 · Supabase 接続あり）

Settings → Environment Variables → **Production**:

| 変数               | 値                                             |
| ------------------ | ---------------------------------------------- |
| `FASTAPI_BASE_URL` | `https://YOUR-RAILWAY-DOMAIN`（末尾 `/` なし） |
| `FASTAPI_API_KEY`  | Railway と **同一** の秘密                     |

- **Preview / Development** に載せる場合は、別 Railway サービスまたはローカル URL を使う（本番キーを Preview に混在させない）。
- デモ Vercel プロジェクト（`AUTH_DISABLED=1`）には **設定不要**。

設定後 **Redeploy**（Production）。

---

## 5. 本番スモーク（editor ログイン）

1. https://flowchart-studio-dun.vercel.app に editor でログイン
2. **その他 → 装置を取込…**
3. `python/testdata/fixtures/input-device-z00001.xlsx` を選択（または手元の装置 xlsx）
4. プレビュー（社内番号 · ユニット/フロー数）→ **取込**
5. 左ナビに装置が反映されること

失敗時:

| 症状                    | 確認                                          |
| ----------------------- | --------------------------------------------- |
| 「正規化 API が未設定」 | Vercel `FASTAPI_BASE_URL` / `FASTAPI_API_KEY` |
| 502 / 接続不可          | Railway 稼働 · ドメイン · デプロイログ        |
| 401                     | 両側の `FASTAPI_API_KEY` 不一致               |
| 504                     | xlsx サイズ · `PROCESS_TIMEOUT_SEC`           |

---

## 6. ローカル開発（再掲）

`.env.local`（Next · リポジトリルート）:

```env
FASTAPI_BASE_URL=http://localhost:8000
FASTAPI_API_KEY=dev-local-api-key-change-me
```

`python/.env`（任意 · FastAPI 単体起動）:

```env
FASTAPI_API_KEY=dev-local-api-key-change-me
ENABLE_DOCS=1
```

```powershell
npm run excel:api:dev   # :8000
npm run dev             # :3000
```

---

## 7. 運用メモ

| 項目           | 方針                                                         |
| -------------- | ------------------------------------------------------------ |
| **スケール**   | 初期は Railway 1 レプリカで可 · CPU 正規化は sync+threadpool |
| **ログ**       | Railway Logs · アップロード内容は出さない                    |
| **秘密ローテ** | Railway + Vercel を **同時** 更新 → Redeploy 両方            |
| **CLI 経路**   | `npm run excel:*:normalize` は **維持**（Railway 不要）      |

---

## 参照

- [LOCAL_DEV.md](../LOCAL_DEV.md)
- [python/README.md](../../python/README.md) § FastAPI
- [Excel取込.md](../03_技術仕様/Excel取込.md)
