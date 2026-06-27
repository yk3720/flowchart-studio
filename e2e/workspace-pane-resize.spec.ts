import { expect, test } from "@playwright/test";
import {
  ensureNavExpanded,
  ensureWorkspaceLoaded,
  selectModule,
} from "./helpers/flowchart";

test.describe("ワークスペース ペイン幅（§E）", () => {
  test.beforeEach(async ({ page }) => {
    await ensureWorkspaceLoaded(page);
    await ensureNavExpanded(page);
    await selectModule(page, "M002供給SUS板_取");
    await expect(page.getByLabel("行1 Text1")).toBeVisible({ timeout: 15_000 });
  });

  test("§E: ペイン幅リセット icon がナビに表示される", async ({ page }) => {
    const resetBtn = page.getByTestId("reset-pane-widths");
    await expect(resetBtn).toBeVisible();
    await expect(resetBtn).toHaveAttribute("aria-label", "ペイン幅をリセット");
  });

  test("ペイン幅をリセットをクリックしてもエラーにならない", async ({
    page,
  }) => {
    const resetBtn = page.getByTestId("reset-pane-widths");
    await resetBtn.click();
    await expect(resetBtn).toBeVisible();
    await expect(page.getByLabel("行1 Text1")).toBeVisible();
  });
});
