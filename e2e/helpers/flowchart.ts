import { expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

export const EMPTY_MODULE_MSG = "モジュールを選択してください";

/** ADR-018 第2弾: DEMO_DEVICES = [DEMO_DEVICE_COATING] (塗布装置) */
export const DEVICE_COATING_ID = "a0000000-0000-4001-8001-000000000000";
/** 塗布装置 供給部 M000 モジュール (E2E 削除テスト用) */
export const MODULE_COATING_M000_ID = "c0000000-0001-4001-8001-000000000001";

/** @deprecated ADR-018 以前のプレス機 A — DEMO_DEVICES から削除済み */
export const DEVICE_PRESS_A_ID = "a0000001-0001-4001-8001-000000000001";
/** @deprecated ADR-018 以前のプレス機 B — DEMO_DEVICES から削除済み */
export const DEVICE_PRESS_B_ID = "a0000001-0001-4001-8001-000000000002";
/** @deprecated ADR-018 以前のプレス機 A 供給動作 — DEMO_DEVICES から削除済み */
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

/** §E: 表ペイン内の再生成ボタン（workspace+desktop では <div.shrink-0> 内、standalone では <header> 内） */
export function headerRegenerate(page: Page) {
  return page.locator("#table").getByRole("button", { name: "再生成" });
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

/**
 * カレーサンプル JSON を隠し file input 経由で読み込む。
 * ADR-018 第2弾でメニューサンプルが workspace から削除されたため、
 * import-json-file testid の hidden input (display:none) に直接注入する。
 * Playwright の setInputFiles は visibility を要求するため page.evaluate 経由で回避。
 */
export async function loadCurrySampleViaFileInput(page: Page) {
  const json = fs.readFileSync(
    path.join(process.cwd(), "frontend/src/samples/sample-curry.json"),
    "utf-8"
  );
  // FlowchartEditor (Client Component) が DOM にマウントされるまで待機
  await page.waitForSelector('[data-testid="import-json-file"]', {
    state: "attached",
    timeout: 15_000,
  });
  // display:none の input に対して page.evaluate 経由でファイルを注入する
  // (setInputFiles は visible 要件があるため直接使えない)
  await page.evaluate(
    ({ content }) => {
      const input = document.querySelector(
        '[data-testid="import-json-file"]'
      ) as HTMLInputElement | null;
      if (!input) throw new Error("import-json-file input not found in DOM");
      const blob = new Blob([content], { type: "application/json" });
      const file = new File([blob], "sample-curry.json", {
        type: "application/json",
      });
      const dt = new DataTransfer();
      dt.items.add(file);
      Object.defineProperty(input, "files", {
        value: dt.files,
        configurable: true,
      });
      input.dispatchEvent(new Event("change", { bubbles: true }));
    },
    { content: json }
  );
}

/**
 * サンプル読込で表・プレビューを表示（モジュール未選択でも可）。
 * ADR-018 以降はメニューサンプルが非表示のため hidden input を使用する。
 */
export async function openPreviewWithSample(
  page: Page,
  _label = "例: カレーの作り方"
) {
  await ensureWorkspaceLoaded(page);
  await loadCurrySampleViaFileInput(page);
  await expect(page.getByText(/生成完了/)).toBeVisible({ timeout: 15_000 });
  await expect(page.locator(".react-flow__node")).not.toHaveCount(0, {
    timeout: 15_000,
  });
}
