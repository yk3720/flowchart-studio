import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import {
  EQUIPMENT_IMPORT_MENU_ITEM,
  ensureNavExpanded,
  ensureWorkspaceLoaded,
  importBundleJsonFile,
  openMoreMenu,
} from "./helpers/flowchart";

const IMPORT_FIXTURE = path.join(
  process.cwd(),
  "python/testdata/fixtures/import-z00001.json"
);

const A0001_IMPORT = path.join(
  process.cwd(),
  "data/devices/A0001_塗布装置/import.json"
);

/**
 * 本番 auth UI（authDisabled=false）— Playwright 専用。
 * webServer: AUTH_DISABLED=0 · AUTH_E2E_STUB=1 · IMPORT_E2E_STUB=1
 * 実行: npm run test:e2e:import-auth
 */
test.describe("装置一括取込（import.json · auth UI）", () => {
  test.beforeEach(async ({ page }) => {
    await ensureWorkspaceLoaded(page);
  });

  test("その他メニューに装置取込が表示される", async ({ page }) => {
    await openMoreMenu(page);
    await expect(
      page.getByRole("menuitem", { name: EQUIPMENT_IMPORT_MENU_ITEM })
    ).toBeVisible();
    await expect(page.getByTestId("import-bundle-file")).toBeAttached();
  });

  test("右ペインに設計メモタブが表示される（本番 auth UI）", async ({
    page,
  }) => {
    await ensureNavExpanded(page);
    await expect(page.locator("#table [role='tablist']")).toBeVisible();
    await expect(
      page.getByRole("tab", { name: "設計メモ", exact: true })
    ).toBeVisible();
  });

  test("fixture import.json で取込成功バナーが表示される", async ({ page }) => {
    const json = fs.readFileSync(IMPORT_FIXTURE, "utf-8");
    await importBundleJsonFile(page, {
      name: "import-z00001.json",
      buffer: Buffer.from(json),
    });

    await expect(page.getByText("取込完了: Z00001（フロー 4 件）")).toBeVisible(
      { timeout: 15_000 }
    );
  });

  test("A0001 import.json で取込成功バナーが表示される", async ({ page }) => {
    test.skip(
      !fs.existsSync(A0001_IMPORT),
      "npm run excel:a0001:normalize で import.json を生成してください"
    );

    const json = fs.readFileSync(A0001_IMPORT, "utf-8");
    const bundle = JSON.parse(json) as {
      internal_code: string;
      flows: unknown[];
    };
    await importBundleJsonFile(page, {
      name: "import.json",
      buffer: Buffer.from(json),
    });

    await expect(
      page.getByText(
        `取込完了: ${bundle.internal_code}（フロー ${bundle.flows.length} 件）`
      )
    ).toBeVisible({
      timeout: 15_000,
    });
  });

  test("不正な JSON ではプレビュー前に失敗バナーが表示される", async ({
    page,
  }) => {
    await openMoreMenu(page);
    await page.getByTestId("import-bundle-file").setInputFiles({
      name: "broken.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"internal_code":"X"}'),
    });

    await expect(page.getByText(/取込プレビュー失敗/)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("equipment-import-preview")).toHaveCount(0);
  });
});
