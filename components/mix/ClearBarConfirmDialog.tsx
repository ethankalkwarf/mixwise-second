"use client";

import { XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useDialogA11y } from "@/hooks/useDialogA11y";

type Props = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
};

export function ClearBarConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = "Start Over?",
  message = "This will clear all ingredients and restart from the beginning.",
  confirmText = "Start Over",
  cancelText = "Keep Ingredients",
}: Props) {
  const dialogRef = useDialogA11y({ isOpen, onClose: onCancel });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={(node) => {
          dialogRef.current = node;
        }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="clear-bar-title"
      >
        <div className="p-6 border-b border-mist">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-terracotta/20 rounded-xl flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-terracotta" />
              </div>
              <h2
                id="clear-bar-title"
                className="text-xl font-display font-bold text-forest"
              >
                {title}
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-sage hover:text-forest transition-colors rounded-full hover:bg-mist"
              aria-label="Cancel"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sage leading-relaxed">{message}</p>
        </div>

        <div className="p-6 border-t border-mist bg-mist/30">
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 text-sage font-medium rounded-2xl border border-mist bg-white hover:bg-mist transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-terracotta text-cream font-bold rounded-2xl hover:bg-terracotta-dark transition-all shadow-lg shadow-terracotta/20"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
