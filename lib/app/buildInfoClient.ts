import type { BuildInfo } from "./buildInfo";

/**
 * Client 向け — Next.js は `process.env.NEXT_PUBLIC_*` の静的参照だけを
 * build 時にインラインする。resolveBuildInfo(process.env) 経由だと常に default になる。
 */
export function readClientBuildInfo(): BuildInfo {
  return {
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0",
    sha: process.env.NEXT_PUBLIC_BUILD_SHA ?? "local",
    env: process.env.NEXT_PUBLIC_BUILD_ENV ?? "local",
    builtAt: process.env.NEXT_PUBLIC_BUILD_TIME ?? "",
  };
}
