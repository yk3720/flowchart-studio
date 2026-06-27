import { expect, test } from "@playwright/test";

import {
  ensureNavExpanded,
  ensureWorkspaceLoaded,
  headerRegenerate,
  selectModule,
} from "./helpers/flowchart";

test.describe("サンプルプレビューと上書き防止", () => {
  test("編集後: 例を見る → プレビュー終了で元の表が残る", async ({ page }) => {
    // ADR-018 第2弾: workspace からサンプルメニューが削除されたため、
    // moduleSamplePreviewActive は menu 経由でしか設定できなくなった。
    // cancel-sample-preview ボタンはモジュール選択中のサンプルプレビューモードでのみ表示される。
    test.skip(
      true,
      "ADR-018: workspace サンプルメニュー削除により moduleSamplePreviewActive 経路が閉鎖"
    );
    await ensureWorkspaceLoaded(page);
    await ensureNavExpanded(page);
    await selectModule(page, "M002供給SUS板_取");
    const editCell = page.getByLabel("行2 Text1");
    await expect(editCell).toBeVisible({ timeout: 15_000 });
    await editCell.fill("自作フロー");
    await headerRegenerate(page).click();
    await expect(page.getByText(/生成完了/)).toBeVisible({ timeout: 15_000 });

    await page.getByTestId("cancel-sample-preview").click();
    await expect(page.getByText("自作フロー")).toBeVisible({ timeout: 5_000 });
  });

  test("編集後: 雛形適用は確認ダイアログでキャンセルできる", async ({
    page,
  }) => {
    // ADR-018 第2弾: starters/samples が workspace で非表示になったためスキップ。
    test.skip(
      true,
      "ADR-018: workspace の雛形・例がすべて非表示になったため starters メニューが存在しない"
    );
    await ensureWorkspaceLoaded(page);
    await ensureNavExpanded(page);
    await selectModule(page, "M002供給SUS板_取");
    await page.getByLabel("行2 Text1").fill("残したい");
    await headerRegenerate(page).click();
    await expect(page.getByText(/生成完了/)).toBeVisible({ timeout: 15_000 });

    await expect(
      page.getByRole("alertdialog", { name: "表を雛形で始め直しますか？" })
    ).toBeVisible();
    await page.getByRole("button", { name: "キャンセル" }).click();

    await expect(page.getByText("残したい")).toBeVisible();
    await expect(page.getByText("ステップ1")).toHaveCount(0);
  });
});
