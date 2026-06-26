"use server";

import { IMPORT_BUNDLE_MAX_MEMO_LEN } from "@/lib/flowchart/import/importBundleLimits";
import { isModuleUuid } from "@/lib/flowchart/model/moduleUuid";
import { isAuthDisabled } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  requireEditor,
  requireViewerOrEditor,
} from "../documents/flowDocumentsAuth";

export type DesignMemos = {
  deviceMemo: string;
  unitMemo: string;
  moduleMemo: string;
};

export type DesignMemosResult =
  | { ok: true; memos: DesignMemos }
  | { ok: false; error: string };

export type DesignMemoSaveResult =
  | { ok: true; memo: string }
  | { ok: false; error: string };

export type DesignMemoTarget = "device" | "unit" | "module";

function normalizeMemoInput(memo: string): string | null {
  if (memo.length > IMPORT_BUNDLE_MAX_MEMO_LEN) {
    return null;
  }
  return memo.trim();
}

const TABLE_BY_TARGET = {
  device: "devices",
  unit: "units",
  module: "modules",
} as const;

export async function loadDesignMemos(params: {
  deviceId: string;
  unitId: string;
  moduleId: string;
}): Promise<DesignMemosResult> {
  if (!isModuleUuid(params.moduleId)) {
    return { ok: false, error: "invalid_module_id" };
  }
  if (isAuthDisabled()) {
    return { ok: false, error: "auth_disabled" };
  }

  try {
    await requireViewerOrEditor();
    const supabase = await createSupabaseServerClient();

    const [deviceRes, unitRes, moduleRes] = await Promise.all([
      supabase
        .from("devices")
        .select("memo")
        .eq("id", params.deviceId)
        .maybeSingle(),
      supabase
        .from("units")
        .select("memo")
        .eq("id", params.unitId)
        .maybeSingle(),
      supabase
        .from("modules")
        .select("memo")
        .eq("id", params.moduleId)
        .maybeSingle(),
    ]);

    if (deviceRes.error) {
      return { ok: false, error: deviceRes.error.message };
    }
    if (unitRes.error) {
      return { ok: false, error: unitRes.error.message };
    }
    if (moduleRes.error) {
      return { ok: false, error: moduleRes.error.message };
    }

    return {
      ok: true,
      memos: {
        deviceMemo: deviceRes.data?.memo ?? "",
        unitMemo: unitRes.data?.memo ?? "",
        moduleMemo: moduleRes.data?.memo ?? "",
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function saveDesignMemo(
  target: DesignMemoTarget,
  id: string,
  memo: string
): Promise<DesignMemoSaveResult> {
  if (target === "module" && !isModuleUuid(id)) {
    return { ok: false, error: "invalid_module_id" };
  }
  if (isAuthDisabled()) {
    return { ok: false, error: "auth_disabled" };
  }

  const normalized = normalizeMemoInput(memo);
  if (normalized === null) {
    return { ok: false, error: "memo_too_long" };
  }

  try {
    await requireEditor();
    const supabase = await createSupabaseServerClient();
    const table = TABLE_BY_TARGET[target];
    const { error } = await supabase
      .from(table)
      .update({ memo: normalized, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, memo: normalized };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
