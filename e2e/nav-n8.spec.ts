import { expect, test } from "@playwright/test";

import {
  DEVICE_COATING_ID,
  ensureNavExpanded,
  ensureWorkspaceLoaded,
  moduleNavButton,
} from "./helpers/flowchart";

/** ADR-018 第2弾: DEMO_DEVICES = [塗布装置] — 3 ユニット代表サンプル */
const DEMO_A_MODULES = [
  "M002供給SUS板_取", // 供給部
  "M016塗布1搬送1_取1(供給搬送2)", // 塗布1部
  "M114収納SUS板搬送_取", // 収納部
] as const;

const DEMO_A_UNITS = [
  "供給部",
  "塗布1部",
  "塗布2部",
  "塗布3部",
  "収納部",
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
      .selectOption(DEVICE_COATING_ID);
  });

  test("初期は全ユニット折りたたみ — 折りたたみ中の動作ボタンは DOM に出ない", async ({
    page,
  }) => {
    const n8 = toggleAllUnits(page);
    await expect(n8).toHaveAttribute("aria-label", "すべてのユニットを展開");

    for (const unit of DEMO_A_UNITS) {
      await expect(page.getByText(unit, { exact: true })).toBeVisible();
    }
    await expect(moduleNavButton(page, "M002供給SUS板_取")).toHaveCount(0);
    await expect(moduleNavButton(page, "M114収納SUS板搬送_取")).toHaveCount(0);
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
    await expect(moduleNavButton(page, "M002供給SUS板_取")).toBeVisible();

    await n8.click();
    await expect(n8).toHaveAttribute("aria-label", "すべてのユニットを展開");
    await expect(moduleNavButton(page, "M002供給SUS板_取")).toHaveCount(0);
    await expect(moduleNavButton(page, "M114収納SUS板搬送_取")).toHaveCount(0);
  });
});
