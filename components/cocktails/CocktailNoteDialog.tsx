"use client";

import { useEffect, useState } from "react";
import { XMarkIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cocktail-note-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-mist">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-forest/10 rounded-xl flex items-center justify-center">
                <PencilSquareIcon className="w-5 h-5 text-forest" />
              </div>
              <h2
                id="cocktail-note-title"
                className="text-xl font-display font-bold text-forest"
              >
                Your note
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-sage hover:text-forest transition-colors rounded-full hover:bg-mist"
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sage leading-relaxed">
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

        <div className="p-6 border-t border-mist bg-mist/30 flex flex-col-reverse sm:flex-row gap-3">
          {hasExisting && onDelete ? (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex-1 px-4 py-3 text-sage font-medium rounded-2xl border border-mist bg-white hover:bg-mist transition-all disabled:opacity-60"
            >
              Delete note
            </button>
          ) : (
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-3 text-sage font-medium rounded-2xl border border-mist bg-white hover:bg-mist transition-all disabled:opacity-60"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !notes.trim()}
            className="flex-1 px-4 py-3 bg-forest text-cream font-bold rounded-2xl hover:bg-olive transition-all disabled:opacity-60"
          >
            Save note
          </button>
        </div>
      </div>
    </div>
  );
}
