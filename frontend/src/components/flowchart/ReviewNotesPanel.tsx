"use client";

import {
  createReviewNote,
  deleteReviewNote,
  loadReviewNotes,
  updateReviewNote,
  type ReviewNote,
} from "@/lib/flowchart/actions/review/reviewNotes";
import { isAuthDisabled } from "@/lib/supabase/env";
import { useCallback, useEffect, useState } from "react";
import {
  fcBtnCompactPrimary,
  fcBtnCompactSecondary,
  fcPasteTextarea,
  fcStatusText,
  fcTableDeleteBtn,
  fcTableHelpDetails,
  fcTableHelpSummary,
} from "./flowchartUiClasses";

type Props = {
  moduleId: string;
  authorEmail: string;
};

function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function ReviewNotesPanel({ moduleId, authorEmail }: Props) {
  const [notes, setNotes] = useState<ReviewNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (isAuthDisabled()) {
      setNotes([]);
      setLoading(false);
      setError(null);
      return;
    }

    setError(null);
    const result = await loadReviewNotes(moduleId);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      setNotes([]);
      return;
    }
    setNotes(result.notes);
  }, [moduleId]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (isAuthDisabled()) {
        if (!cancelled) {
          setNotes([]);
          setLoading(false);
          setError(null);
        }
        return;
      }

      setError(null);
      const result = await loadReviewNotes(moduleId);
      if (cancelled) return;

      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        setNotes([]);
        return;
      }
      setNotes(result.notes);
    })();

    return () => {
      cancelled = true;
    };
  }, [moduleId]);

  const handlePost = async () => {
    const trimmed = draft.trim();
    if (!trimmed || posting) return;

    setPosting(true);
    setError(null);
    const result = await createReviewNote(moduleId, trimmed);
    setPosting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.note) {
      setNotes((prev) => [...prev, result.note!]);
    } else {
      await refresh();
    }
    setDraft("");
  };

  const startEdit = (note: ReviewNote) => {
    setEditingId(note.id);
    setEditingBody(note.body);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingBody("");
  };

  const handleSaveEdit = async (noteId: string) => {
    const trimmed = editingBody.trim();
    if (!trimmed || savingId) return;

    setSavingId(noteId);
    setError(null);
    const result = await updateReviewNote(noteId, trimmed);
    setSavingId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.note) {
      setNotes((prev) => prev.map((n) => (n.id === noteId ? result.note! : n)));
    } else {
      await refresh();
    }
    cancelEdit();
  };

  const handleDelete = async (noteId: string) => {
    if (deletingId) return;

    setDeletingId(noteId);
    setError(null);
    const result = await deleteReviewNote(noteId);
    setDeletingId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    if (editingId === noteId) {
      cancelEdit();
    }
  };

  if (isAuthDisabled()) {
    return (
      <details className={fcTableHelpDetails} data-testid="review-notes-panel">
        <summary className={fcTableHelpSummary}>回覧（質問・回答）</summary>
        <p className={fcStatusText}>
          認証無効モードでは回覧メモは利用できません。
        </p>
      </details>
    );
  }

  return (
    <details className={fcTableHelpDetails} data-testid="review-notes-panel">
      <summary className={fcTableHelpSummary}>
        回覧（質問・回答）
        {notes.length > 0 ? ` — ${notes.length} 件` : ""}
      </summary>

      {loading ? (
        <p className={fcStatusText}>読み込み中…</p>
      ) : (
        <div className="mt-2 space-y-3">
          {notes.length === 0 ? (
            <p className={fcStatusText}>まだメモはありません。</p>
          ) : (
            <ul className="space-y-3">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className="rounded border border-flow-border p-3"
                  data-testid={`review-note-${note.id}`}
                >
                  <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-flow-text-muted">
                    <span className="font-medium text-flow-text">
                      {note.authorEmail}
                    </span>
                    <time dateTime={note.updatedAt}>
                      {formatTimestamp(note.updatedAt)}
                    </time>
                  </div>

                  {editingId === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingBody}
                        onChange={(e) => setEditingBody(e.target.value)}
                        rows={3}
                        className={fcPasteTextarea}
                        aria-label="回覧メモを編集"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void handleSaveEdit(note.id)}
                          disabled={!editingBody.trim() || savingId === note.id}
                          className={fcBtnCompactPrimary}
                          data-testid={`review-note-save-${note.id}`}
                        >
                          保存
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className={fcBtnCompactSecondary}
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap text-sm">{note.body}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(note)}
                          className={fcBtnCompactSecondary}
                          data-testid={`review-note-edit-${note.id}`}
                        >
                          編集
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(note.id)}
                          disabled={deletingId === note.id}
                          className={fcTableDeleteBtn}
                          data-testid={`review-note-delete-${note.id}`}
                        >
                          削除
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-2 border-t border-flow-border pt-3">
            <label
              htmlFor={`review-note-draft-${moduleId}`}
              className="text-xs text-flow-text-muted"
            >
              追記（{authorEmail || "ログイン中"}）
            </label>
            <textarea
              id={`review-note-draft-${moduleId}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              className={fcPasteTextarea}
              placeholder="質問や回答を入力…"
              data-testid="review-note-draft"
            />
            <button
              type="button"
              onClick={() => void handlePost()}
              disabled={!draft.trim() || posting}
              className={fcBtnCompactPrimary}
              data-testid="review-note-post"
            >
              投稿
            </button>
          </div>
        </div>
      )}

      {error ? (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </details>
  );
}
