import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { NextConfig } from "next";

import { assertProductionSupabaseEnv } from "./backend/src/lib/supabase/env";

assertProductionSupabaseEnv();

const pkg = JSON.parse(
  readFileSync(join(__dirname, "package.json"), "utf8")
) as { version: string };

const buildPublicEnv = {
  NEXT_PUBLIC_APP_VERSION: pkg.version,
  NEXT_PUBLIC_BUILD_SHA:
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
  NEXT_PUBLIC_BUILD_ENV: process.env.VERCEL_ENV ?? "local",
  NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
} as const;

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  env: buildPublicEnv,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
