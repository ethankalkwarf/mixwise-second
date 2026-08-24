"use client";

import { useEffect, useState } from "react";
import { XMarkIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { useDialogA11y } from "@/hooks/useDialogA11y";

type Props = {
  isOpen: boolean;
  cocktailName: string;
  initialNotes?: string | null;
  onClose: () => void;
  onSave: (notes: string) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
};

export function CocktailNoteDialog({
  isOpen,
  cocktailName,
  initialNotes,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [saving, setSaving] = useState(false);
  const hasExisting = Boolean(initialNotes?.trim());
  const dialogRef = useDialogA11y({ isOpen, onClose });

  useEffect(() => {
    if (isOpen) setNotes(initialNotes || "");
  }, [isOpen, initialNotes]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(notes);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setSaving(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={(node) => {
          dialogRef.current = node;
        }}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cocktail-note-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-mist p-6">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10">
                <PencilSquareIcon className="h-5 w-5 text-forest" />
              </div>
              <h2
                id="cocktail-note-title"
                className="font-display text-xl font-bold text-forest"
              >
                Your note
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-sage transition-colors hover:bg-mist hover:text-forest"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <p className="leading-relaxed text-sage">
            Private tasting notes for {cocktailName}. Only you can see these.
          </p>
        </div>

        <div className="p-6">
          <label htmlFor="cocktail-notes" className="sr-only">
            Private note
          </label>
          <textarea
            id="cocktail-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            maxLength={1000}
            placeholder="What you'd change, who liked it, too sweet, try with rye..."
            className="w-full rounded-2xl border border-mist bg-cream/40 px-4 py-3 text-forest placeholder:text-sage/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-mist bg-mist/30 p-6 sm:flex-row">
          {hasExisting && onDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="flex-1 rounded-2xl border border-mist bg-white px-4 py-3 font-medium text-sage transition-all hover:bg-mist disabled:opacity-60"
            >
              Delete note
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-2xl border border-mist bg-white px-4 py-3 font-medium text-sage transition-all hover:bg-mist disabled:opacity-60"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !notes.trim()}
            className="flex-1 rounded-2xl bg-forest px-4 py-3 font-bold text-cream transition-all hover:bg-olive disabled:opacity-60"
          >
            Save note
          </button>
        </div>
      </div>
    </div>
  );
}
