/** import.json バリデーション上限（SSOT） */
export const IMPORT_BUNDLE_MAX_BYTES = 5 * 1024 * 1024;
/** 装置 xlsx アップロード上限（FastAPI · Next プロキシ · ADR-019 ガードレール 4） */
export const EQUIPMENT_XLSX_MAX_BYTES = 10 * 1024 * 1024;
/** Next → FastAPI normalize プロキシのタイムアウト（ms） */
export const EQUIPMENT_NORMALIZE_TIMEOUT_MS = 60_000;
export const IMPORT_BUNDLE_MAX_LABEL_LEN = 200;
/** 設計メモ（devices / units / modules.memo） */
export const IMPORT_BUNDLE_MAX_MEMO_LEN = 4000;
export const IMPORT_BUNDLE_MAX_UNITS = 100;
export const IMPORT_BUNDLE_MAX_MODULES_PER_UNIT = 50;
export const IMPORT_BUNDLE_MAX_FLOWS = 500;
export const IMPORT_BUNDLE_MAX_TABLE_ROWS = 500;
