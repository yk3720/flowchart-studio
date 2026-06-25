import { join, resolve } from "node:path";

/** リポジトリルート（flowchart-studio/） */
export const REPO_ROOT = resolve(import.meta.dirname, "../..");

/** 作者装置データのルート（xlsx Git 外 · import.json Git 内） */
export const DEVICES_ROOT = join(REPO_ROOT, "data/devices");
