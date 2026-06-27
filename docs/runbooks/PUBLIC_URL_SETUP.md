# 公開 URL 3 本 — セットアップ Runbook（ADR-017）

**目的:** 本番 · 技術者向けデモ · 一般向けデモの **固定 URL** を運用する。  
**正本:** [ADR-017](<../03_技術仕様/意思決定記録(ADR).md#adr-017-公開-url-3-本--vercel-b-案--デモ階層>) · [grill-me 記録](../01_要求定義/grill-me_2026-06-27_公開URL3本.md)

**更新:** 2026-06-27（設計合意 · 実装前）

---

## 1. 構成概要（B 案）

| URL # | 用途           | Vercel プロジェクト      | 主な env                        |
| ----- | -------------- | ------------------------ | ------------------------------- |
| 1     | 本番           | 現行（`-dun`）           | Supabase URL/anon · ログイン ON |
| 2     | 技術者向けデモ | **デモ共通（新規）**     | `AUTH_DISABLED=1`               |
| 3     | 一般向けデモ   | **同上（同一デプロイ）** | `AUTH_DISABLED=1`               |

- URL 2 と 3 は **同じビルド**。アプリが **リクエストのホスト名** でデモデータ（装置 vs 日常）を選ぶ。
- デモ URL では **Supabase env は不要**（未設定でも `AUTH_DISABLED=1` なら起動可）。

```
main へ push
  ├─ 本番プロジェクト → URL 1 更新
  └─ デモプロジェクト → URL 2 · 3 同時更新（同一 commit）
```

---

## 2. 本番プロジェクト（既存）

1. [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) — **現行 Supabase = 本番**。
2. Production env:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **`AUTH_DISABLED` は設定しない**（または `0`）
3. URL 例: `https://flowchart-studio-dun.vercel.app`

---

## 3. デモプロジェクト（新規）

### 3-1. プロジェクト作成

1. Vercel Dashboard → Add New Project → **同一 GitHub repo**（`flowchart-studio`）
2. Production Branch: **`main`**（本番プロジェクトと同じ）
3. Framework: Next.js（自動検出）

### 3-2. ドメイン 2 本

Settings → Domains で **2 つの `.vercel.app` またはカスタムドメイン** を追加（実装後）:

| ホスト                                 | デモ種別             |
| -------------------------------------- | -------------------- |
| （例）`flowchart-tech-….vercel.app`    | technical · 装置デモ |
| （例）`flowchart-general-….vercel.app` | general · 日常の作業 |

**確定 URL は本 Runbook 冒頭表に追記すること**（初回デプロイ後）。

### 3-3. 環境変数（Production）

```env
AUTH_DISABLED=1
```

- `NEXT_PUBLIC_SUPABASE_*` は **不要**。
- 本番用の service role 等を **絶対に載せない**。

---

## 4. ローカル確認（実装後）

| 確認                     | 手順                                                               |
| ------------------------ | ------------------------------------------------------------------ |
| 本番相当                 | `.env.local` に Supabase · `AUTH_DISABLED` なし                    |
| デモ                     | `AUTH_DISABLED=1`                                                  |
| technical / general 切替 | 実装の `PUBLIC_DEMO_PROFILE` または hosts — **コード SSOT を参照** |

日常 dev: [LOCAL_DEV.md](../LOCAL_DEV.md)

---

## 5. 配布用 URL 一覧（テンプレ）

| 読者         | URL                                         | 備考                                      |
| ------------ | ------------------------------------------- | ----------------------------------------- |
| 社内編集者   | https://flowchart-studio-dun.vercel.app     | ログイン必要                              |
| 技術レビュー | https://flowchart-studio-demo.vercel.app    | ログイン不要                              |
| 一般レビュー | https://flowchart-studio-general.vercel.app | ログイン不要 · 日常の作業 → 料理 → カレー |

---

## 6. ズレ防止

| リスク              | 対策                                               |
| ------------------- | -------------------------------------------------- |
| 本番だけ古い commit | 両プロジェクトとも **`main` 監視**                 |
| env だけ不一致      | env 変更時は **本番/デモ両方** を Runbook 表で確認 |
| デモ 2 URL 間のズレ | **同一デプロイ** のためコードは常に一致            |

---

## 7. 実装チェックリスト（未完了）

- [x] ホスト名 → `technical` | `general` 解決（`lib/demo/demoProfile.ts` · 2026-06-27）
- [x] 一般デモ階層（日常の作業 → 料理 → カレーを作る）（`GENERAL_DEMO_DEVICES` · 2026-06-27）
- [x] 技術デモ階層（既存 `DEMO_DEVICES` · プレス機 A/B）
- [x] デモ Vercel プロジェクト作成 · URL 2 本（`flowchart-studio-demo` · 2026-06-27）
- [x] 本 Runbook §5 URL 確定値の記入（2026-06-27）

---

## 関連

- [VERCEL_RULES §6-2](c:/yk-skill/rule/30_web_stack/VERCEL_RULES.md) — flowchart-studio 3 URL パターン
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) §5
