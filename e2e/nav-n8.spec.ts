import { expect, test } from "@playwright/test";

import {
  DEVICE_PRESS_A_ID,
  ensureNavExpanded,
  ensureWorkspaceLoaded,
  moduleNavButton,
} from "./helpers/flowchart";

/** DEMO-001 プレス機 A — 3 ユニット · 5 動作 */
const DEMO_A_MODULES = [
  "供給動作",
  "検知動作",
  "プレス動作",
  "離脱動作",
  "排出動作",
] as const;

const DEMO_A_UNITS = [
  "供給ユニット",
  "プレスユニット",
  "収納ユニット",
] as const;

function toggleAllUnits(page: import("@playwright/test").Page) {
  return page.getByTestId("toggle-all-units");
}

test.describe("ナビ N8 — ユニット一括展開", () => {
  test.beforeEach(async ({ page }) => {
    await ensureWorkspaceLoaded(page);
    await ensureNavExpanded(page);
    await page
      .getByRole("combobox", { name: "装置を選択" })
      .selectOption(DEVICE_PRESS_A_ID);
  });

  test("初期は全ユニット折りたたみ — 折りたたみ中の動作ボタンは DOM に出ない", async ({
    page,
  }) => {
    const n8 = toggleAllUnits(page);
    await expect(n8).toHaveAttribute("aria-label", "すべてのユニットを展開");

    for (const unit of DEMO_A_UNITS) {
      await expect(page.getByText(unit, { exact: true })).toBeVisible();
    }
    await expect(moduleNavButton(page, "プレス動作")).toHaveCount(0);
    await expect(moduleNavButton(page, "排出動作")).toHaveCount(0);
  });

  test("N8 クリックで全ユニット展開 — 全動作ボタンが表示される", async ({
    page,
  }) => {
    await toggleAllUnits(page).click();
    await expect(toggleAllUnits(page)).toHaveAttribute(
      "aria-label",
      "すべてのユニットを折りたたみ"
    );

    for (const label of DEMO_A_MODULES) {
      await expect(moduleNavButton(page, label)).toBeVisible();
    }
  });

  test("N8 再クリックで全ユニット折りたたみ — 動作ボタンが隠れる", async ({
    page,
  }) => {
    const n8 = toggleAllUnits(page);
    await n8.click();
    await expect(moduleNavButton(page, "供給動作")).toBeVisible();

    await n8.click();
    await expect(n8).toHaveAttribute("aria-label", "すべてのユニットを展開");
    await expect(moduleNavButton(page, "供給動作")).toHaveCount(0);
    await expect(moduleNavButton(page, "プレス動作")).toHaveCount(0);
  });
});
