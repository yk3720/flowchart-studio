/**
 * 右ペインタブ（設計メモ・コメント）の存在確認
 *
 * AUTH_DISABLED=1（デモ）: showRightTabs=false → タブなし
 * 本番（要ログイン）: showRightTabs=true → タブあり
 *
 * 本番手動確認チェックリスト（AUTH_DISABLED=0 · ログイン済み環境で確認）:
 *   1. デスクトップ(≥1024px): モジュール選択後に「表」「設計メモ」「コメント」タブが表示
 *   2. 「設計メモ」タブクリック → DesignMemoPanels（モジュール/ユニット/装置の3パネル）表示
 *   3. テキスト入力→保存→成功（保存ボタンが disabled でなくなる · dirty 判定）
 *   4. 「コメント」タブクリック → ReviewNotesPanel 表示（ノート一覧 + 追記フォーム）
 *   5. モバイル(<1024px): 上段タブ[図][表]・表ペイン内サブタブ[表][設計メモ][コメント]表示
 *   6. デモURL: タブなし・表のみ（下記テストでカバー）
 */

import { expect, test } from "@playwright/test";
import {
  ensureNavExpanded,
  ensureWorkspaceLoaded,
  selectModule,
} from "./helpers/flowchart";

test.describe("右ペインタブ — デモモード（AUTH_DISABLED=1）", () => {
  test.beforeEach(async ({ page }) => {
    await ensureWorkspaceLoaded(page);
    await ensureNavExpanded(page);
    await selectModule(page, "M002供給SUS板_取");
    await expect(page.getByLabel("行1 Text1")).toBeVisible({ timeout: 15_000 });
  });

  test("デモモードでは右ペインにタブが表示されない（showRightTabs=false）", async ({
    page,
  }) => {
    // デスクトップ: #table 内に tablist がないことを確認
    const tablist = page.locator("#table [role='tablist']");
    await expect(tablist).toHaveCount(0);
    // 「設計メモ」「コメント」ボタンは DOM にない
    await expect(
      page.locator("#table").getByRole("tab", { name: "設計メモ" })
    ).toHaveCount(0);
    await expect(
      page.locator("#table").getByRole("tab", { name: "コメント" })
    ).toHaveCount(0);
  });

  test("デモモードではモバイルサブタブが表示されない", async ({ page }) => {
    // mobilePanelTable セクション内に tablist がないことを確認（authDisabled=true）
    const mobileTabs = page.locator(
      "#flowchart-pane-panel-table [role='tablist']"
    );
    await expect(mobileTabs).toHaveCount(0);
  });
});
