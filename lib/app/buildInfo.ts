/** ビルド識別子 — next.config.ts が build 時に NEXT_PUBLIC_* を注入 */

export type BuildInfo = {
  version: string;
  sha: string;
  env: string;
  builtAt: string;
};

export function resolveBuildInfo(
  env: Record<string, string | undefined> = process.env
): BuildInfo {
  return {
    version: env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0",
    sha: env.NEXT_PUBLIC_BUILD_SHA ?? "local",
    env: env.NEXT_PUBLIC_BUILD_ENV ?? "local",
    builtAt: env.NEXT_PUBLIC_BUILD_TIME ?? "",
  };
}

export function formatDeployEnvLabel(env: string): string {
  if (env === "production") return "本番";
  if (env === "preview") return "preview";
  return "local";
}

/** ナビ footnote 用 1 行（例: v0.1.0 · c92f345 · 本番） */
export function formatBuildLabel(info: BuildInfo): string {
  return `v${info.version} · ${info.sha} · ${formatDeployEnvLabel(info.env)}`;
}

export function formatBuildTitle(info: BuildInfo): string {
  const parts = [
    `アプリ v${info.version}`,
    `commit ${info.sha}`,
    formatDeployEnvLabel(info.env),
  ];
  if (info.builtAt) {
    parts.push(`build ${info.builtAt}`);
  }
  return parts.join(" · ");
}
