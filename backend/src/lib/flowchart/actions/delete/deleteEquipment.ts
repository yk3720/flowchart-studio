"use server";

import { revalidatePath } from "next/cache";

import { canEditFlowchart } from "@/lib/auth/roles";
import { getAuthState } from "@/lib/auth/session";
import { canDeleteDevice } from "@/lib/flowchart/policy/deviceDeletePermissions";
import { isAuthDisabled } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DeleteEquipmentResult =
  | { ok: true; internal_code: string }
  | { ok: false; error: string };

function mapRpcError(message: string): string {
  if (message.includes("not_authenticated")) {
    return "?????????";
  }
  if (message.includes("editor_required")) {
    return "??????????";
  }
  if (message.includes("delete_equipment_forbidden")) {
    return "?????????????????";
  }
  if (message.includes("admin_required")) {
    return "???????????";
  }
  if (message.includes("device not found")) {
    return "???????????????????";
  }
  if (message.includes("internal_code required")) {
    return "?????????????";
  }
  return message;
}

export async function deleteEquipmentByInternalCode(
  internalCode: string
): Promise<DeleteEquipmentResult> {
  const code = internalCode.trim();
  if (!code) {
    return { ok: false, error: "?????????????" };
  }

  if (isAuthDisabled()) {
    return { ok: false, error: "????????AUTH_DISABLED?" };
  }

  const state = await getAuthState();
  if (state.kind !== "allowed") {
    return { ok: false, error: "?????????" };
  }

  if (!canEditFlowchart(state.context.role)) {
    return { ok: false, error: "?????????????????" };
  }

  const supabase = await createSupabaseServerClient();
  const { data: row, error: fetchError } = await supabase
    .from("devices")
    .select("internal_code, created_by")
    .eq("internal_code", code)
    .maybeSingle();

  if (fetchError) {
    return { ok: false, error: fetchError.message };
  }

  if (!row) {
    return { ok: false, error: "???????????????????" };
  }

  if (
    !canDeleteDevice(state.context.role, state.context.userId, {
      createdBy: row.created_by ?? undefined,
    })
  ) {
    return { ok: false, error: "?????????????????" };
  }

  try {
    const { error } = await supabase.rpc("rpc_delete_equipment", {
      p_internal_code: code,
    });

    if (error) {
      return { ok: false, error: mapRpcError(error.message) };
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin");

    return { ok: true, internal_code: code };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "?????????",
    };
  }
}
