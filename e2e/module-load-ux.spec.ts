import { expect, test } from "@playwright/test";

import {
  ensureNavExpanded,
  ensureWorkspaceLoaded,
  loadCurrySampleViaFileInput,
  selectModule,
} from "./helpers/flowchart";

test.describe("モジュール読込 UX", () => {
  test("モジュール切替後は「読み込み中」バナーが残らない", async ({ page }) => {
    await ensureWorkspaceLoaded(page);
    await ensureNavExpanded(page);
    await selectModule(page, "M002供給SUS板_取");
    await expect(page.getByLabel("行1 Text1")).toBeVisible({ timeout: 15_000 });

    await selectModule(page, "M003供給SUS板_置");

    await expect(page.getByText("モジュールを読み込み中")).toHaveCount(0, {
      timeout: 5_000,
    });
    await expect(page.getByLabel("行1 Text1")).toBeVisible({ timeout: 15_000 });
  });

  test("モジュール選択後は雛形プレースホルダが残らない", async ({ page }) => {
    await ensureWorkspaceLoaded(page);
    await ensureNavExpanded(page);
    await selectModule(page, "M002供給SUS板_取");
    await expect(page.getByLabel("行1 Text1")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("module-loading-overlay")).toHaveCount(0);
  });

  test("JSON読込後に別モジュールへ切替するとカレー表が残らない", async ({
    page,
  }) => {
    await ensureWorkspaceLoaded(page);
    await ensureNavExpanded(page);
    await selectModule(page, "M002供給SUS板_取");
    await expect(page.getByLabel("行1 Text1")).toBeVisible({ timeout: 15_000 });

    await loadCurrySampleViaFileInput(page);
    await expect(page.getByText("レシピを確認")).toBeVisible({
      timeout: 15_000,
    });

    await selectModule(page, "M003供給SUS板_置");
    await expect(page.getByText("レシピを確認")).toHaveCount(0, {
      timeout: 15_000,
    });
    await expect(page.getByLabel("行1 Text1")).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("サンプルプレビュー（モジュール未選択）", () => {
  test("例を見たあとプレビューを終了できる", async ({ page }) => {
    await ensureWorkspaceLoaded(page);
    await loadCurrySampleViaFileInput(page);
    await expect(page.getByText("レシピを確認")).toBeVisible({
      timeout: 15_000,
    });

    await page.getByTestId("cancel-sample-preview").click();
    await expect(page.getByText("レシピを確認")).toHaveCount(0);
    await expect(page.getByText("モジュールを選択してください")).toHaveCount(2);
  });
});
