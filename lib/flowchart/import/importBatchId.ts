import type { ImportBundle } from "./importBundleSchema";

/** bundle 内容の正規 JSON（batch_id 用 · キー順は Zod 出力に依存） */
export function canonicalImportBundleJson(bundle: ImportBundle): string {
  return JSON.stringify(bundle);
}

export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** ADR-019 ガードレール 3 — プレビューと取込の同一性検証 */
export async function computeImportBatchIdFromBundle(
  bundle: ImportBundle
): Promise<string> {
  return sha256Hex(canonicalImportBundleJson(bundle));
}

export function formatImportBundleJson(bundle: ImportBundle): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}
