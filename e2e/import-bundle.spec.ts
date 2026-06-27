import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import {
  IMPORT_JSON_MENU_ITEM,
  importBundleJsonFile,
  ensureWorkspaceLoaded,
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

test.describe("import.json 装置一括取込", () => {
  test.beforeEach(async ({ page }) => {
    await ensureWorkspaceLoaded(page);
  });

  // ADR-018 第2弾: AUTH_DISABLED (デモ) モードでは「取込」セクション自体が非表示
  test("AUTH_DISABLED 時は import.json 取込項目がメニューに表示されない", async ({
    page,
  }) => {
    await openMoreMenu(page);
    await expect(
      page.getByRole("menuitem", { name: IMPORT_JSON_MENU_ITEM })
    ).toHaveCount(0);
  });

  test("fixture import.json で取込成功バナーが表示される", async ({ page }) => {
    // ADR-018 第2弾: AUTH_DISABLED モードでは import-bundle-file input が非表示
    test.skip(
      true,
      "AUTH_DISABLED モードでは import.json 取込 input が DOM に存在しないためスキップ"
    );
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
      true,
      "AUTH_DISABLED モードでは import.json 取込 input が DOM に存在しないためスキップ"
    );
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

  test("不正な JSON では取込失敗バナーが表示される", async ({ page }) => {
    test.skip(
      true,
      "AUTH_DISABLED モードでは import.json 取込 input が DOM に存在しないためスキップ"
    );
    await importBundleJsonFile(page, {
      name: "broken.json",
      buffer: Buffer.from('{"internal_code":"X"}'),
    });

    await expect(page.getByText(/取込失敗/)).toBeVisible({ timeout: 15_000 });
  });
});
