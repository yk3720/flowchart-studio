import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import {
  ensureNavExpanded,
  ensureWorkspaceLoaded,
  headerRegenerate,
  openMoreMenu,
  selectModule,
} from "./helpers/flowchart";

const A0001_SCRATCH_XLSX = path.join(
  process.cwd(),
  "data/devices/A0001_塗布装置/_scratch/取出.xlsx"
);

function excelFileInput(page: import("@playwright/test").Page) {
  return page
    .locator("label")
    .filter({ hasText: "Excelから取込…" })
    .locator('input[type="file"]');
}

/**
 * ADR-018 第2弾: CSV/Excel 取込はその他▼ → "CSV / Excel 取込…" → モーダル経由
 * （旧: 表ペイン内 <details> クリック）
 */
async function importScratchExcel(page: import("@playwright/test").Page) {
  await openMoreMenu(page);
  await page.getByRole("menuitem", { name: "CSV / Excel 取込…" }).click();

  const buffer = fs.readFileSync(A0001_SCRATCH_XLSX);
  await excelFileInput(page).setInputFiles({
    name: "取出.xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer,
  });

  // モーダルは onApply 直後に閉じるため CsvPastePanel のメッセージは消える。
  // editor のステータス行に出る "CSV を表に反映しました" で代替確認する。
  await expect(page.getByText(/CSV を表に反映しました/)).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(3);
}

test.describe("A0001 1 動作 Excel Web 取込", () => {
  test.beforeEach(async ({ page }) => {
    await ensureWorkspaceLoaded(page);
    await ensureNavExpanded(page);
    await selectModule(page, "M002供給SUS板_取");
    await expect(page.getByLabel("行1 Text1")).toBeVisible({ timeout: 15_000 });
  });

  test("_scratch/取出.xlsx → 表反映 → 再生成で 3 ノード", async ({ page }) => {
    test.skip(
      !fs.existsSync(A0001_SCRATCH_XLSX),
      "npm run excel:a0001:scratch で xlsx を生成してください"
    );

    await importScratchExcel(page);
    await headerRegenerate(page).click();

    await expect(page.getByText(/生成完了/)).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(".react-flow__node")).toHaveCount(3, {
      timeout: 15_000,
    });
    await expect(page.getByText("ワーク取出")).toBeVisible();
  });

  test("取込後にヘッダ再生成でも同じ 3 ノード", async ({ page }) => {
    test.skip(
      !fs.existsSync(A0001_SCRATCH_XLSX),
      "npm run excel:a0001:scratch で xlsx を生成してください"
    );

    await importScratchExcel(page);
    await headerRegenerate(page).click();
    await expect(page.getByText(/生成完了/)).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(".react-flow__node")).toHaveCount(3, {
      timeout: 15_000,
    });
  });
});
