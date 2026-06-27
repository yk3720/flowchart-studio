import { expect, test } from "@playwright/test";

import {
  ensureNavExpanded,
  ensureWorkspaceLoaded,
  loadCurrySampleViaFileInput,
  openMoreMenu,
  selectModule,
} from "./helpers/flowchart";

test.describe("フロー中身リセット", () => {
  test.beforeEach(async ({ page }) => {
    await ensureWorkspaceLoaded(page);
  });

  test("モジュール選択 → リセット確認 → 成功バナーと雛形表", async ({
    page,
  }) => {
    // ADR-018 第2弾: "フローをリセット…" は EditorMoreMenu の「危険」セクション内だが、
    // AUTH_DISABLED=1 (authDisabled=true) 時は !authDisabled 条件で非表示になる。
    // デモ環境では UI 経由のリセットは不可 — ユーザー向けフローではないため。
    test.skip(
      true,
      "ADR-018: authDisabled=true 時は「危険」セクションが非表示のためスキップ"
    );
    await ensureNavExpanded(page);
    await selectModule(page, "M002供給SUS板_取");
    await loadCurrySampleViaFileInput(page);
    await expect(page.getByText(/生成完了/)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("レシピを確認")).toBeVisible();

    await openMoreMenu(page);
    const resetItem = page.getByRole("menuitem", {
      name: "フローをリセット…",
    });
    await resetItem.dispatchEvent("click");
    await expect(
      page.getByRole("heading", { name: "フローを雛形にリセットしますか？" })
    ).toBeVisible();
    await page.getByTestId("reset-flow-confirm").click();

    await expect(page.getByText("フローを雛形にリセットしました")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("ここに処理名")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("レシピを確認")).toHaveCount(0);
  });
});
