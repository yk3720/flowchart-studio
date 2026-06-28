import { defineConfig } from "@playwright/test";

/**
 * E2E は :3001 で起動（日常 dev の :3000 と衝突しない）。
 * Next 16 は同一ディレクトリで dev を二重起動できないため、既定は `next start`。
 */
const devPort = process.env.PLAYWRIGHT_DEV_PORT ?? "3001";
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${devPort}`;
const useDevServer = process.env.PLAYWRIGHT_USE_DEV === "1";

function isAuthImportRun(): boolean {
  if (process.env.PLAYWRIGHT_AUTH_IMPORT === "1") {
    return true;
  }
  const args = process.argv.map((a) => a.replace(/\\/g, "/"));
  const hasAuthSpec = args.some((a) => a.includes("import-bundle-auth"));
  const runsWholeDir = args.some(
    (a) => a === "e2e" || a.endsWith("/e2e") || a === "./e2e"
  );
  return hasAuthSpec && !runsWholeDir;
}

const authImportMode = isAuthImportRun();

const playwrightE2eEnv = {
  PLAYWRIGHT_E2E: "1",
  IMPORT_E2E_STUB: "1",
  RESET_FLOW_E2E_STUB: "1",
  MODULE_DELETE_E2E_STUB: "1",
} as const;

export default defineConfig({
  testDir: "./e2e",
  testIgnore: authImportMode ? undefined : "**/import-bundle-auth.spec.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    headless: true,
    viewport: { width: 1280, height: 720 },
    trace: "retain-on-failure",
  },
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: useDevServer
          ? `npm run dev -- --port ${devPort}`
          : `npm run start -- -p ${devPort}`,
        url: baseURL,
        reuseExistingServer: !process.env.PLAYWRIGHT_FORCE_WEBSERVER,
        timeout: 120_000,
        env: {
          ...process.env,
          ...playwrightE2eEnv,
          ...(authImportMode
            ? { AUTH_DISABLED: "0", AUTH_E2E_STUB: "1" }
            : { AUTH_DISABLED: "1", AUTH_E2E_STUB: "0" }),
        },
      },
});
