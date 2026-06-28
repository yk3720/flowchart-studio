import {
  EQUIPMENT_NORMALIZE_TIMEOUT_MS,
  EQUIPMENT_XLSX_MAX_BYTES,
} from "@/lib/flowchart/import/importBundleLimits";

const XLSX_MAGIC = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const LEGACY_XLS_MIME = "application/vnd.ms-excel";

export type EquipmentNormalizeProxyResult =
  | { ok: true; bundle: unknown; warnings: string[] }
  | { ok: false; status: number; error: string; errors?: string[] };

export function validateEquipmentXlsxUpload(
  file: File
): { ok: true } | { ok: false; error: string } {
  const name = file.name.trim();
  if (!name.toLowerCase().endsWith(".xlsx")) {
    return { ok: false, error: "拡張子は .xlsx のみ対応しています" };
  }

  const mime = file.type.split(";", 1)[0]?.trim().toLowerCase() ?? "";
  if (mime && mime !== XLSX_MIME && mime !== LEGACY_XLS_MIME) {
    return { ok: false, error: "Excel（.xlsx）ファイルを選択してください" };
  }

  if (file.size > EQUIPMENT_XLSX_MAX_BYTES) {
    return { ok: false, error: "ファイルサイズが上限を超えています" };
  }

  return { ok: true };
}

export function validateEquipmentXlsxBytes(
  data: Uint8Array
): { ok: true } | { ok: false; error: string } {
  if (data.byteLength === 0) {
    return { ok: false, error: "空のファイルは処理できません" };
  }
  if (data.byteLength > EQUIPMENT_XLSX_MAX_BYTES) {
    return { ok: false, error: "ファイルサイズが上限を超えています" };
  }
  if (
    data.byteLength < XLSX_MAGIC.length ||
    !XLSX_MAGIC.every((byte, index) => data[index] === byte)
  ) {
    return { ok: false, error: "Excel（.xlsx）形式ではないファイルです" };
  }
  return { ok: true };
}

function getFastApiConfig():
  | { ok: true; baseUrl: string; apiKey: string }
  | { ok: false; error: string } {
  const baseUrl = process.env.FASTAPI_BASE_URL?.trim().replace(/\/+$/, "");
  const apiKey = process.env.FASTAPI_API_KEY?.trim();
  if (!baseUrl || !apiKey) {
    return {
      ok: false,
      error: "正規化 API が未設定です（FASTAPI_BASE_URL / FASTAPI_API_KEY）",
    };
  }
  return { ok: true, baseUrl, apiKey };
}

function mapFastApiErrorBody(
  status: number,
  body: unknown
): EquipmentNormalizeProxyResult {
  if (
    body &&
    typeof body === "object" &&
    "detail" in body &&
    body.detail &&
    typeof body.detail === "object" &&
    "errors" in body.detail &&
    Array.isArray(body.detail.errors)
  ) {
    const errors = body.detail.errors.filter(
      (item): item is string => typeof item === "string"
    );
    return {
      ok: false,
      status,
      error: errors.join("\n") || "正規化に失敗しました",
      errors,
    };
  }

  if (
    body &&
    typeof body === "object" &&
    "detail" in body &&
    typeof body.detail === "string"
  ) {
    return { ok: false, status, error: body.detail };
  }

  return { ok: false, status, error: "正規化 API からエラーが返されました" };
}

export async function proxyEquipmentNormalize(
  file: File
): Promise<EquipmentNormalizeProxyResult> {
  const uploadCheck = validateEquipmentXlsxUpload(file);
  if (!uploadCheck.ok) {
    return { ok: false, status: 400, error: uploadCheck.error };
  }

  const config = getFastApiConfig();
  if (!config.ok) {
    return { ok: false, status: 503, error: config.error };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const bytesCheck = validateEquipmentXlsxBytes(bytes);
  if (!bytesCheck.ok) {
    return { ok: false, status: 400, error: bytesCheck.error };
  }

  const formData = new FormData();
  formData.append("file", new Blob([bytes], { type: XLSX_MIME }), file.name);

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    EQUIPMENT_NORMALIZE_TIMEOUT_MS
  );

  try {
    const response = await fetch(`${config.baseUrl}/api/v1/normalize`, {
      method: "POST",
      headers: {
        "X-API-Key": config.apiKey,
      },
      body: formData,
      signal: controller.signal,
    });

    const body: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      return mapFastApiErrorBody(response.status, body);
    }

    if (
      !body ||
      typeof body !== "object" ||
      !("bundle" in body) ||
      !body.bundle ||
      typeof body.bundle !== "object"
    ) {
      return {
        ok: false,
        status: 502,
        error: "正規化 API の応答形式が不正です",
      };
    }

    const warnings =
      "warnings" in body && Array.isArray(body.warnings)
        ? body.warnings.filter(
            (item): item is string => typeof item === "string"
          )
        : [];

    return { ok: true, bundle: body.bundle, warnings };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        ok: false,
        status: 504,
        error: "正規化処理がタイムアウトしました",
      };
    }
    return {
      ok: false,
      status: 502,
      error: "正規化 API に接続できませんでした",
    };
  } finally {
    clearTimeout(timeout);
  }
}
