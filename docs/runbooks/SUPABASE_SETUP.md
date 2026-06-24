# Supabase セットアップ（ADR-013 DB-1）

## 1. プロジェクト

1. [Supabase](https://supabase.com/) で **本番用** と **開発（プレビュー）用** の 2 プロジェクトを作成
2. 各プロジェクトで **Authentication → Providers** で **Google** と **Azure（Microsoft）** を有効化
3. **URL Configuration**（Authentication → URL Configuration）:
   - **Site URL:** 本番は `https://flowchart-studio-dun.vercel.app`（`-dun` 必須）· 開発は `http://localhost:3000`
   - **Redirect URLs** に次を追加（クエリなし · パスのみ）:
     - `http://localhost:3000/auth/callback` — OAuth（Google / Azure）
     - `http://localhost:3000/auth/confirm` — Magic Link（メール）
     - `https://YOUR_VERCEL_DOMAIN/auth/callback`
     - `https://YOUR_VERCEL_DOMAIN/auth/confirm`
   - Preview デプロイを使う場合は `https://*.vercel.app/auth/callback` と `.../auth/confirm` も追加

### 1-1. Magic Link メールテンプレ（PKCE / token_hash）

**Authentication → Email → Magic Link** で、デフォルトの `{{ .ConfirmationURL }}`（PKCE）ではなく **token_hash** リンクに差し替える。

```html
<h2>Flowchart Studio ログイン</h2>
<p>次のリンクをクリックしてログインしてください。</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">
    ログインする
  </a>
</p>
<p>心当たりがない場合はこのメールを無視してください。</p>
```

| ルート           | 用途                                | アプリ側                          |
| ---------------- | ----------------------------------- | --------------------------------- |
| `/auth/confirm`  | Magic Link · サインアップ確認メール | `verifyOtp({ type, token_hash })` |
| `/auth/callback` | OAuth（Google / Azure）             | `exchangeCodeForSession(code)`    |

**開発:** Email プロバイダー有効 · Magic Link / パスワード UI 表示（`SUPABASE_RULES` §6）。  
**専用本番 Supabase（未分離）:** 現行 Vercel 本番 URL（`-dun`）は **`flowchart-dev` に接続** — Email / Magic Link は有効のまま運用可。  
**本番 Supabase 分離後:** Email プロバイダーはダッシュボードで**無効化**（Google / Azure のみ · UI 非表示だけでは不十分）。

## 2. マイグレーション

### DB-1

SQL Editor で `database/migrations/001_db1_schema.sql` を実行。  
role 保護: `002_fix_profiles_role_protection.sql` を続けて実行。

### DB-2（003 → 004）

**開発 Supabase のみ。** 手順・検証・トラブルシュート: **[DB2_MIGRATION_RUNBOOK.md](./DB2_MIGRATION_RUNBOOK.md)**

1. `003_db2_schema.sql` — 装置 4 表 + RLS
2. `004_flow_documents_module_fk.sql` — デモ seed · uuid FK · `admin_delete_equipment()`
3. `database/sql/verify/verify_db2.sql` — 適用後チェック

**前提:** DB-1（001+002）適用済み · **アプリ変更は別タスク**（004 後に uuid 化）

## 3. 許可リスト（profiles）

ログイン前に、Table Editor → `profiles` に行を追加:

| email                | role     |
| -------------------- | -------- |
| `user@example.com`   | `editor` |
| `viewer@example.com` | `viewer` |

初回ログイン時に `user_id` が自動で紐づきます。

### 3-1. 試用用共有アカウント（開発プロジェクトのみ）

試用期に複数人へ URL + パスワードを配る運用。アプリ側の変更は不要。

1. **Authentication → Users → Add user** — 例: `dev-guest@flowchart-studio.local` · パスワード · **Auto Confirm User** ON
2. **Table Editor → `profiles`** — 同じメール · `role` = `editor` または `admin`
3. ログイン: `https://flowchart-studio-dun.vercel.app/login` → **パスワードでログイン**

| 注意                                     |                                                               |
| ---------------------------------------- | ------------------------------------------------------------- |
| Auth と profiles のメールは **完全一致** | typo すると `/login/no-access`                                |
| 全員同一 `user_id`                       | 編集者表示は共有 · 試用終了後はユーザー削除 or パスワード変更 |
| 本番 Supabase 分離後                     | 共有パスワードは **flowchart-dev のみ**（本番は OAuth 想定）  |

アカウント自己登録・パスワードリセット UI は **未実装**（バックログ）。

## 4. 環境変数

`.env.local`（git に含めない）:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

ローカルで Supabase なしで UI だけ試す場合:

```env
AUTH_DISABLED=1
```

## 5. Vercel

- Production: 本番 Supabase の URL / anon key
- Preview: 開発 Supabase の URL / anon key（本番 DB に書かない）

## 6. DB-1 完了チェック（ADR-013）

- [ ] editor / viewer でログインできる
- [ ] 許可外メールは `/login/no-access`
- [ ] editor がモジュール保存 → 再ログインで復元
- [ ] viewer は PNG/SVG のみ（JSON・表編集不可）
- [ ] オフラインでキャッシュしたフローを閲覧できる
