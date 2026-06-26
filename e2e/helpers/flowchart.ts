import { expect, type Page } from "@playwright/test";

export const EMPTY_MODULE_MSG = "モジュールを選択してください";

export const DEVICE_PRESS_A_ID = "a0000001-0001-4001-8001-000000000001";
export const DEVICE_PRESS_B_ID = "a0000001-0001-4001-8001-000000000002";
export const MODULE_SUPPLY_FEED_A_ID = "c0000001-0001-4001-8001-000000001001";

/** ナビ内の動作選択ボタン（削除ボタンの aria-label との strict mode 衝突を避ける） */
export function moduleNavButton(page: Page, label: string) {
  return page
    .getByRole("navigation", { name: "ユニットと動作" })
    .getByRole("button", { name: label, exact: true });
}

/** ユニット折りたたみ時は動作ボタンが DOM に出ない — 未展開なら一括展開 */
export async function ensureUnitsExpanded(page: Page) {
  const toggleAll = page.getByTestId("toggle-all-units");
  if (!(await toggleAll.isVisible())) return;
  const label = await toggleAll.getAttribute("aria-label");
  if (label?.includes("すべてのユニットを展開")) {
    await toggleAll.click();
  }
}

export async function selectModule(page: Page, label: string) {
  await ensureUnitsExpanded(page);
  await moduleNavButton(page, label).click();
}

/** §E: 表ペイン header 内の再生成（canvas 内テキストリンクと区別） */
export function headerRegenerate(page: Page) {
  return page.locator("#table header").getByRole("button", { name: "再生成" });
}

export const IMPORT_JSON_MENU_ITEM = "import.jsonを取込…";

export async function openMoreMenu(page: Page) {
  await page.getByRole("button", { name: "その他" }).click();
}

export function importJsonFileInput(page: Page) {
  return page.getByTestId("import-bundle-file");
}

export async function importBundleJsonFile(
  page: Page,
  file: { name: string; buffer: Buffer }
) {
  await openMoreMenu(page);
  await importJsonFileInput(page).setInputFiles({
    name: file.name,
    mimeType: "application/json",
    buffer: file.buffer,
  });
}

export async function loadSampleFromMenu(page: Page, label: string) {
  await openMoreMenu(page);
  await page.getByRole("menuitem", { name: label }).click();
}

/** ワークスペース（認証済み）であること */
export async function ensureWorkspaceLoaded(page: Page) {
  await page.goto("/");
  await expect(page).not.toHaveURL(/\/login/);
  await expect(
    page.getByRole("heading", { name: "Flowchart Studio" })
  ).toBeVisible({
    timeout: 15_000,
  });
}

export async function ensureNavExpanded(page: Page) {
  const openNav = page.getByRole("button", { name: "ナビを開く" });
  if (await openNav.isVisible()) {
    await openNav.click();
  }
}

/** サンプル読込で表・プレビューを表示（モジュール未選択でも可） */
export async function openPreviewWithSample(
  page: Page,
  label = "例: カレーの作り方"
) {
  await ensureWorkspaceLoaded(page);
  await loadSampleFromMenu(page, label);
  await expect(page.getByText(/生成完了/)).toBeVisible({ timeout: 15_000 });
  await expect(page.locator(".react-flow__node")).not.toHaveCount(0, {
    timeout: 15_000,
  });
}
