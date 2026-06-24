"use server";

import { revalidatePath } from "next/cache";

import { parseImportBundleJson } from "@/lib/flowchart/import/importBundleSchema";
import { prepareImportBundleForRpc } from "@/lib/flowchart/import/prepareImportBundle";
import { isAuthDisabled } from "@/lib/supabase/env";
import { isPlaywrightActionStubEnabled } from "@/lib/supabase/e2eStub";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { requireEditor } from "../documents/flowDocumentsAuth";

export type ImportEquipmentResult =
  | {
      ok: true;
      internal_code: string;
      modules_upserted: number;
      flows_upserted: number;
    }
  | { ok: false; error: string };

function mapRpcError(message: string): string {
  if (message.includes("not_authenticated")) {
    return "?????????";
  }
  if (message.includes("editor_required")) {
    return "??????????";
  }
  if (message.includes("import_existing_device_forbidden")) {
    return "????????????????????????????";
  }
  if (message.includes("module not found")) {
    return `?????????????: ${message}`;
  }
  return message;
}

function isImportE2eStubEnabled(): boolean {
  return isPlaywrightActionStubEnabled("IMPORT_E2E_STUB");
}

export async function importEquipmentBundle(
  jsonText: string
): Promise<ImportEquipmentResult> {
  const parsed = parseImportBundleJson(jsonText);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  if (isImportE2eStubEnabled()) {
    const flowCount = parsed.bundle.flows.length;
    const moduleCount = parsed.bundle.units.reduce(
      (sum, unit) => sum + unit.modules.length,
      0
    );
    return {
      ok: true,
      internal_code: parsed.bundle.internal_code,
      modules_upserted: moduleCount,
      flows_upserted: flowCount,
    };
  }

  if (isAuthDisabled()) {
    return { ok: false, error: "????????AUTH_DISABLED?" };
  }

  const prepared = prepareImportBundleForRpc(parsed.bundle);
  if (!prepared.ok) {
    return { ok: false, error: prepared.errors.join("\n") };
  }

  try {
    await requireEditor();

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("import_equipment_bundle", {
      p_bundle: prepared.bundle,
    });

    if (error) {
      return { ok: false, error: mapRpcError(error.message) };
    }

    const row = data as {
      ok?: boolean;
      error?: string;
      internal_code?: string;
      modules_upserted?: number;
      flows_upserted?: number;
    };

    if (row.ok === false) {
      return {
        ok: false,
        error: mapRpcError(row.error ?? "import_equipment_bundle ???????"),
      };
    }

    revalidatePath("/", "layout");

    return {
      ok: true,
      internal_code: row.internal_code ?? prepared.bundle.internal_code,
      modules_upserted: row.modules_upserted ?? 0,
      flows_upserted: row.flows_upserted ?? 0,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
