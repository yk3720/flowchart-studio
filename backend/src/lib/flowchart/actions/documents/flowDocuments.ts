"use server";

import type { ModuleSnapshot } from "@/lib/flowchart/browser/moduleDraftRepository";
import { moduleSnapshotSchema } from "@/lib/flowchart/model/moduleSnapshotSchema";
import { isModuleUuid } from "@/lib/flowchart/model/moduleUuid";
import { isAuthDisabled } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { requireEditor, requireViewerOrEditor } from "./flowDocumentsAuth";

export type FlowDocumentResult =
  | { ok: true; snapshot: ModuleSnapshot }
  | { ok: false; error: string };

export type SaveFlowResult = { ok: true } | { ok: false; error: string };

export type FlowDocumentsBatchResult =
  | { ok: true; documents: Record<string, ModuleSnapshot> }
  | { ok: false; error: string };

export async function loadFlowDocumentsBatch(
  moduleIds: string[]
): Promise<FlowDocumentsBatchResult> {
  const validIds = [...new Set(moduleIds.filter(isModuleUuid))];
  if (validIds.length === 0) {
    return { ok: true, documents: {} };
  }
  if (isAuthDisabled()) {
    return { ok: false, error: "???????" };
  }

  try {
    await requireViewerOrEditor();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("flow_documents")
      .select("module_id, payload")
      .in("module_id", validIds);

    if (error) {
      return { ok: false, error: error.message };
    }

    const documents: Record<string, ModuleSnapshot> = {};
    for (const row of data ?? []) {
      const moduleId = row.module_id as string;
      const parsed = moduleSnapshotSchema.safeParse(row.payload);
      if (parsed.success) {
        documents[moduleId] = parsed.data as ModuleSnapshot;
      }
    }

    return { ok: true, documents };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function loadFlowDocument(
  moduleUuid: string
): Promise<FlowDocumentResult> {
  if (!isModuleUuid(moduleUuid)) {
    return { ok: false, error: "invalid_module_id" };
  }
  if (isAuthDisabled()) {
    return { ok: false, error: "???????" };
  }

  try {
    await requireViewerOrEditor();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("flow_documents")
      .select("payload")
      .eq("module_id", moduleUuid)
      .maybeSingle();

    if (error) {
      return { ok: false, error: error.message };
    }
    if (!data?.payload) {
      return { ok: false, error: "not_found" };
    }

    const parsed = moduleSnapshotSchema.safeParse(data.payload);
    if (!parsed.success) {
      return { ok: false, error: "?????????????" };
    }

    return { ok: true, snapshot: parsed.data as ModuleSnapshot };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function saveFlowDocument(
  moduleUuid: string,
  snapshot: ModuleSnapshot
): Promise<SaveFlowResult> {
  if (!isModuleUuid(moduleUuid)) {
    return { ok: false, error: "invalid_module_id" };
  }
  if (isAuthDisabled()) {
    return { ok: false, error: "???????" };
  }

  try {
    const ctx = await requireEditor();
    const parsed = moduleSnapshotSchema.safeParse(snapshot);
    if (!parsed.success) {
      return { ok: false, error: "?????????????" };
    }

    let title = "??";
    try {
      const doc = JSON.parse(parsed.data.jsonText) as { title?: string };
      if (doc.title) title = doc.title;
    } catch {
      /* ignore */
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("flow_documents").upsert(
      {
        module_id: moduleUuid,
        title,
        payload: parsed.data,
        updated_at: new Date().toISOString(),
        updated_by: ctx.userId,
      },
      { onConflict: "module_id" }
    );

    if (error) {
      return { ok: false, error: error.message };
    }

    // ????????? revalidate ?????????????? refresh ? UI ??????????
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
