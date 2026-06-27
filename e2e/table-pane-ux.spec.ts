import { expect, test } from "@playwright/test";
import {
  ensureNavExpanded,
  ensureWorkspaceLoaded,
  openMoreMenu,
  selectModule,
} from "./helpers/flowchart";

test.describe("表ペイン UX（§D 継続 + §E デスクトップ）", () => {
  test.beforeEach(async ({ page }) => {
    await ensureWorkspaceLoaded(page);
    await ensureNavExpanded(page);
    await selectModule(page, "M002供給SUS板_取");
    await expect(page.getByLabel("行1 Text1")).toBeVisible({ timeout: 15_000 });
  });

  // §E: デスクトップでは「行を追加」がヘッダーに移動し、表グリッドより上になる
  test("§E デスクトップ: 「行を追加」ボタンは表グリッドより上（ヘッダー内）に表示される", async ({
    page,
  }) => {
    const firstCell = page.getByLabel("行1 Text1");
    const addRowBtn = page.getByRole("button", { name: "行を追加" });
    // loadModule 完了後のリマウントを待つ（beforeEach 直後に setLoadKey が走る場合がある）
    await expect(firstCell).toBeVisible({ timeout: 10_000 });
    await expect(addRowBtn).toBeVisible({ timeout: 10_000 });
    const cellY = (await firstCell.boundingBox())!.y;
    const addRowY = (await addRowBtn.boundingBox())!.y;
    expect(addRowY).toBeLessThan(cellY);
  });

  test("確認（警告）はデフォルト閉じた <details> で表ツールバーの下に表示される", async ({
    page,
  }) => {
    await page.getByLabel("行1 図形種別").selectOption("判断");
    await page.getByLabel("行1 接続先(下)").fill("");
    await page.getByLabel("行1 接続先(右)").fill("");

    const warningDetails = page
      .locator("details")
      .filter({ has: page.getByText("確認（警告）") });
    await expect(warningDetails).toBeVisible();
    await expect(warningDetails).not.toHaveAttribute("open", "");

    const addRowBtn = page.getByRole("button", { name: "行を追加" });
    const warningY = (await warningDetails.boundingBox())!.y;
    const addRowY = (await addRowBtn.boundingBox())!.y;
    expect(addRowY).toBeLessThan(warningY);
  });

  test("「クラウドから読み込み」バナーが常時表示されない", async ({ page }) => {
    await expect(page.getByText("クラウドから読み込み")).not.toBeVisible();
  });

  test("列幅をリセットボタンは表示されない", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "列幅をリセット" })
    ).not.toBeVisible();
  });

  // §E: T5 列幅を内容に合わせるボタン（デスクトップ横バー行）
  test("§E: 「列幅を内容に合わせる」ボタンが表示される", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "列幅を内容に合わせる" })
    ).toBeVisible();
  });

  // §E: N9 ペイン幅リセットがナビに存在する
  test("§E: ペイン幅リセットボタンがナビに表示される", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "ペイン幅をリセット" })
    ).toBeVisible();
  });

  // §E: select バグ再現テスト — 色選択後も他列の値が保持される
  test("§E: 色列で「黄」を選択しても他列の値が維持される", async ({ page }) => {
    const text1Before = await page.getByLabel("行1 Text1").inputValue();
    await page.getByLabel("行1 色").selectOption("黄");
    await expect(page.getByLabel("行1 色")).toHaveValue("黄");
    const text1After = await page.getByLabel("行1 Text1").inputValue();
    expect(text1After).toBe(text1Before);
  });

  // ADR-018 第2弾: CSV/Excel 取込はその他▼メニュー経由でモーダルから開ける
  test("その他▼メニューから CSV / Excel 取込モーダルを開ける（デモモード）", async ({
    page,
  }) => {
    await openMoreMenu(page);
    await page.getByRole("menuitem", { name: "CSV / Excel 取込…" }).click();
    await expect(
      page.getByRole("button", { name: "表に貼り付け" })
    ).toBeVisible();
  });
});
