import { parseImportBundleJson } from "./importBundleSchema";
import type { ImportBundle } from "./importBundleSchema";

export type NormalizeEquipmentXlsxClientResult =
  | { ok: true; bundle: ImportBundle; warnings: string[] }
  | { ok: false; error: string; errors?: string[] };

function formatNormalizeClientError(error: string, errors?: string[]): string {
  if (errors?.length) {
    return errors.join("\n");
  }
  return error;
}

export async function normalizeEquipmentXlsxClient(
  file: File
): Promise<NormalizeEquipmentXlsxClientResult> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch("/api/equipment/normalize", {
      method: "POST",
      body: formData,
    });
  } catch {
    return {
      ok: false,
      error:
        "正規化 API に接続できませんでした。FastAPI が起動しているか確認してください。",
    };
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof body.error === "string"
    ) {
      const errors =
        "errors" in body && Array.isArray(body.errors)
          ? body.errors.filter(
              (item): item is string => typeof item === "string"
            )
          : undefined;
      return {
        ok: false,
        error: formatNormalizeClientError(body.error, errors),
        errors,
      };
    }
    return { ok: false, error: "正規化に失敗しました" };
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("bundle" in body) ||
    !body.bundle
  ) {
    return { ok: false, error: "正規化 API の応答形式が不正です" };
  }

  const warnings =
    "warnings" in body && Array.isArray(body.warnings)
      ? body.warnings.filter((item): item is string => typeof item === "string")
      : [];

  const jsonText = `${JSON.stringify(body.bundle, null, 2)}\n`;
  const parsed = parseImportBundleJson(jsonText);
  if (!parsed.ok) {
    return {
      ok: false,
      error: `正規化結果の検証に失敗しました: ${parsed.error}`,
    };
  }

  return { ok: true, bundle: parsed.bundle, warnings };
}
