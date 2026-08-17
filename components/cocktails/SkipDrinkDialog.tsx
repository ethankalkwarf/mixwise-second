"use client";

import { useEffect, useState } from "react";
import { XMarkIcon, HandThumbDownIcon } from "@heroicons/react/24/outline";

type Props = {
  isOpen: boolean;
  cocktailName: string;
  isSkipped: boolean;
  onClose: () => void;
  onSkip: () => Promise<void> | void;
  onRestore?: () => Promise<void> | void;
};

export function SkipDrinkDialog({
  isOpen,
  cocktailName,
  isSkipped,
  onClose,
  onSkip,
  onRestore,
}: Props) {
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSkip = async () => {
    setSaving(true);
    try {
      await onSkip();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async () => {
    if (!onRestore) return;
    setSaving(true);
    try {
      await onRestore();
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
        aria-labelledby="skip-drink-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-mist">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-terracotta/20 rounded-xl flex items-center justify-center">
                <HandThumbDownIcon className="w-5 h-5 text-terracotta" />
              </div>
              <h2
                id="skip-drink-title"
                className="text-xl font-display font-bold text-forest"
              >
                {isSkipped ? "Skipped drink" : "Won't make again?"}
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
            {isSkipped
              ? `We'll keep ${cocktailName} off Mix and your recommendations. Restore it anytime.`
              : `We'll hide ${cocktailName} from Mix, your dashboard, and emails. You can undo this anytime.`}
          </p>
        </div>

        <div className="p-6 border-t border-mist bg-mist/30 flex flex-col-reverse sm:flex-row gap-3">
          {isSkipped && onRestore ? (
            <button
              onClick={handleRestore}
              disabled={saving}
              className="flex-1 px-4 py-3 bg-terracotta text-cream font-bold rounded-2xl hover:bg-terracotta-dark transition-all shadow-lg shadow-terracotta/20 disabled:opacity-60"
            >
              Restore
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                disabled={saving}
                className="flex-1 px-4 py-3 text-sage font-medium rounded-2xl border border-mist bg-white hover:bg-mist transition-all disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleSkip}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-terracotta text-cream font-bold rounded-2xl hover:bg-terracotta-dark transition-all shadow-lg shadow-terracotta/20 disabled:opacity-60"
              >
                Skip this drink
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
