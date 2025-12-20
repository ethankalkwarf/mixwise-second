"use client";

import { XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

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
  title = "Clear Your Bar?",
  message = "Are you sure you want to clear your entire bar? This will restart the onboarding experience and remove all selected ingredients.",
  confirmText = "Clear Everything",
  cancelText = "Keep My Bar",
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-mist">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-terracotta/20 rounded-xl flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-terracotta" />
              </div>
              <h2 className="text-xl font-display font-bold text-forest">
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

          <p className="text-sage leading-relaxed">
            {message}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-cream/50 rounded-2xl p-4 border border-mist">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-olive/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm">🔄</span>
              </div>
              <div>
                <p className="text-sm font-medium text-forest mb-1">
                  What happens next?
                </p>
                <p className="text-xs text-sage leading-relaxed">
                  You'll restart with the guided onboarding to help you build your bar from scratch.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
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
