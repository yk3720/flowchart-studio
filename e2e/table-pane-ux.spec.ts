import { expect, test } from "@playwright/test";
import {
  ensureNavExpanded,
  ensureWorkspaceLoaded,
  selectModule,
} from "./helpers/flowchart";

test.describe("表ペイン UX（フェーズ1〜5）", () => {
  test.beforeEach(async ({ page }) => {
    await ensureWorkspaceLoaded(page);
    await ensureNavExpanded(page);
    await selectModule(page, "供給動作");
    await expect(page.getByLabel("行1 Text1")).toBeVisible({ timeout: 15_000 });
  });

  test("CSV / Excel 取込パネルはデフォルト閉じた <details> で表示される", async ({
    page,
  }) => {
    const details = page
      .locator("details")
      .filter({ has: page.getByText("CSV / Excel 取込") });
    await expect(details).toBeVisible();
    await expect(details).not.toHaveAttribute("open", "");
    await expect(
      page.getByRole("button", { name: "表に貼り付け" })
    ).not.toBeVisible();
  });

  test("CSV / Excel 取込 summary をクリックするとパネルが展開される", async ({
    page,
  }) => {
    await page.getByText("CSV / Excel 取込").click();
    await expect(
      page.getByRole("button", { name: "表に貼り付け" })
    ).toBeVisible();
  });

  test("「行を追加」ボタンは CSV details の上に表示される", async ({
    page,
  }) => {
    const addRowBtn = page.getByRole("button", { name: "行を追加" });
    const csvSummary = page
      .locator("summary")
      .filter({ hasText: "CSV / Excel 取込" });
    const addRowY = (await addRowBtn.boundingBox())!.y;
    const csvY = (await csvSummary.boundingBox())!.y;
    expect(addRowY).toBeLessThan(csvY);
  });

  test("「クラウドから読み込み」バナーが常時表示されない", async ({ page }) => {
    await expect(page.getByText("クラウドから読み込み")).not.toBeVisible();
  });
});
