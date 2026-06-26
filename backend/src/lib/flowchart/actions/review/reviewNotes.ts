"use server";

import { isModuleUuid } from "@/lib/flowchart/model/moduleUuid";
import { isAuthDisabled } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { requireViewerOrEditor } from "../documents/flowDocumentsAuth";

export type ReviewNote = {
  id: string;
  moduleId: string;
  body: string;
  authorEmail: string;
  createdAt: string;
  updatedAt: string;
};

type ReviewNoteRow = {
  id: string;
  module_id: string;
  body: string;
  author_email: string;
  created_at: string;
  updated_at: string;
};

function mapRow(row: ReviewNoteRow): ReviewNote {
  return {
    id: row.id,
    moduleId: row.module_id,
    body: row.body,
    authorEmail: row.author_email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeBody(body: string): string | null {
  const trimmed = body.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export type ReviewNotesListResult =
  | { ok: true; notes: ReviewNote[] }
  | { ok: false; error: string };

export type ReviewNoteMutationResult =
  | { ok: true; note?: ReviewNote }
  | { ok: false; error: string };

export async function loadReviewNotes(
  moduleUuid: string
): Promise<ReviewNotesListResult> {
  if (!isModuleUuid(moduleUuid)) {
    return { ok: false, error: "invalid_module_id" };
  }
  if (isAuthDisabled()) {
    return { ok: false, error: "auth_disabled" };
  }

  try {
    await requireViewerOrEditor();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("review_notes")
      .select("id, module_id, body, author_email, created_at, updated_at")
      .eq("module_id", moduleUuid)
      .order("created_at", { ascending: true });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, notes: (data ?? []).map(mapRow) };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function createReviewNote(
  moduleUuid: string,
  body: string
): Promise<ReviewNoteMutationResult> {
  if (!isModuleUuid(moduleUuid)) {
    return { ok: false, error: "invalid_module_id" };
  }
  if (isAuthDisabled()) {
    return { ok: false, error: "auth_disabled" };
  }

  const normalized = normalizeBody(body);
  if (!normalized) {
    return { ok: false, error: "empty_body" };
  }

  try {
    const ctx = await requireViewerOrEditor();
    const supabase = await createSupabaseServerClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("review_notes")
      .insert({
        module_id: moduleUuid,
        body: normalized,
        author_id: ctx.userId,
        author_email: ctx.email,
        created_at: now,
        updated_at: now,
      })
      .select("id, module_id, body, author_email, created_at, updated_at")
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, note: mapRow(data as ReviewNoteRow) };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function updateReviewNote(
  noteId: string,
  body: string
): Promise<ReviewNoteMutationResult> {
  if (isAuthDisabled()) {
    return { ok: false, error: "auth_disabled" };
  }

  const normalized = normalizeBody(body);
  if (!normalized) {
    return { ok: false, error: "empty_body" };
  }

  try {
    await requireViewerOrEditor();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("review_notes")
      .update({
        body: normalized,
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteId)
      .select("id, module_id, body, author_email, created_at, updated_at")
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, note: mapRow(data as ReviewNoteRow) };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function deleteReviewNote(
  noteId: string
): Promise<ReviewNoteMutationResult> {
  if (isAuthDisabled()) {
    return { ok: false, error: "auth_disabled" };
  }

  try {
    await requireViewerOrEditor();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("review_notes")
      .delete()
      .eq("id", noteId);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
