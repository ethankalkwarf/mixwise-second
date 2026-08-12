"use client";

import { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ActionSheetOption {
  label: string;
  action: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  options: ActionSheetOption[];
  cancelLabel?: string;
}

/**
 * ActionSheet
 * 
 * iOS-style action sheet component for native app feel.
 * Slides up from bottom with options.
 */
export function ActionSheet({
  isOpen,
  onClose,
  title,
  options,
  cancelLabel = "Cancel",
}: ActionSheetProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Action Sheet */}
      <div
        className="relative w-full bg-white rounded-t-3xl shadow-2xl safe-area-bottom"
        style={{
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-sage/30 rounded-full" />
        </div>

        {/* Title */}
        {title && (
          <div className="px-4 py-3 border-b border-mist">
            <h3 className="text-sm font-semibold text-forest text-center">
              {title}
            </h3>
          </div>
        )}

        {/* Options */}
        <div className="py-2">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                if (!option.disabled) {
                  option.action();
                  onClose();
                }
              }}
              disabled={option.disabled}
              className={`
                w-full px-4 py-3 text-left text-base
                transition-colors
                ${option.destructive
                  ? "text-red-600 hover:bg-red-50"
                  : "text-forest hover:bg-mist/50"
                }
                ${option.disabled ? "opacity-50 cursor-not-allowed" : ""}
                ${index < options.length - 1 ? "border-b border-mist/50" : ""}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Cancel button */}
        <div className="px-4 pt-2 pb-4 border-t border-mist">
          <button
            onClick={onClose}
            className="w-full py-3 text-center text-base font-semibold text-forest bg-mist/30 hover:bg-mist/50 rounded-xl transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
