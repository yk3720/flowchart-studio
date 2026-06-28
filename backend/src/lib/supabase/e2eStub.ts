/** Playwright E2E 用 Server Action スタブ — Vercel 本番では常に無効 */
export function isPlaywrightActionStubEnabled(envFlag: string): boolean {
  if (process.env.PLAYWRIGHT_E2E !== "1" || process.env[envFlag] !== "1") {
    return false;
  }
  if (process.env.VERCEL_ENV === "production") {
    return false;
  }
  return true;
}

/** 本番 auth UI（authDisabled=false）— Supabase なし · IMPORT 等と同様 Playwright 専用 */
export function isPlaywrightAuthStubEnabled(): boolean {
  if (process.env.PLAYWRIGHT_E2E !== "1" || process.env.AUTH_E2E_STUB !== "1") {
    return false;
  }
  if (process.env.VERCEL_ENV === "production") {
    return false;
  }
  if (process.env.AUTH_DISABLED === "1") {
    return false;
  }
  return true;
}
