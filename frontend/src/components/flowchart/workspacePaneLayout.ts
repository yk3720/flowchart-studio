/** localStorage キー（v2 が現行デフォルト） */
export const WORKSPACE_OUTER_LAYOUT_ID = "flowchart-studio:workspace-outer-v2";
export const WORKSPACE_INNER_LAYOUT_ID = "flowchart-studio:workspace-inner-v2";

/** リセット時に併せてクリアする旧キー */
const LEGACY_LAYOUT_IDS = [
  "flowchart-studio:workspace-outer-v1",
  "flowchart-studio:workspace-inner-v1",
] as const;

/** 外側 Group（nav | editor）— ナビ 18% 維持 */
export const DEFAULT_OUTER_LAYOUT = {
  nav: 18,
  editor: 82,
} as const;

/** 内側 Group（table | canvas）— §E: 52 : 48 */
export const DEFAULT_INNER_LAYOUT = {
  table: 52,
  canvas: 48,
} as const;

export type WorkspacePaneLayoutGroup = {
  setLayout: (layout: Record<string, number>) => void;
};

type LayoutStorage = Pick<Storage, "getItem" | "setItem">;

const SSR_SAFE_LAYOUT_STORAGE: LayoutStorage = {
  getItem: () => null,
  setItem: () => {},
};

/** useDefaultLayout 用 — SSR で localStorage 参照を避ける */
export function getWorkspaceLayoutStorage(): LayoutStorage {
  if (typeof window === "undefined") return SSR_SAFE_LAYOUT_STORAGE;
  return window.localStorage;
}

export function clearWorkspacePaneStorage(): void {
  if (typeof window === "undefined") return;
  for (const id of [
    WORKSPACE_OUTER_LAYOUT_ID,
    WORKSPACE_INNER_LAYOUT_ID,
    ...LEGACY_LAYOUT_IDS,
  ]) {
    window.localStorage.removeItem(id);
  }
}

export function resetWorkspacePaneLayouts(
  outerGroup: WorkspacePaneLayoutGroup | null,
  innerGroup: WorkspacePaneLayoutGroup | null
): void {
  clearWorkspacePaneStorage();
  outerGroup?.setLayout({ ...DEFAULT_OUTER_LAYOUT });
  innerGroup?.setLayout({ ...DEFAULT_INNER_LAYOUT });
}
