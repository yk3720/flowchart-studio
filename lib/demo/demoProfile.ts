export type DemoProfile = "technical" | "general";

/**
 * ホスト名から general / technical デモを判定する（ADR-017）。
 * ホスト名に "general" が含まれれば general、それ以外は technical。
 * ローカル開発では PUBLIC_DEMO_PROFILE env で強制指定可能。
 */
export function getDemoProfile(hostname: string): DemoProfile {
  const envOverride = process.env.PUBLIC_DEMO_PROFILE;
  if (envOverride === "general" || envOverride === "technical") {
    return envOverride;
  }
  return hostname.includes("general") ? "general" : "technical";
}
