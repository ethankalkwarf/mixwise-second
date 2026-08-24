"use client";

import { Fragment, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDialogA11y } from "@/hooks/useDialogA11y";

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
 * iOS-style action sheet. Portaled to document.body so it isn't trapped by
 * PullToRefreshContainer's transform (which breaks position:fixed).
 */
export function ActionSheet({
  isOpen,
  onClose,
  title,
  options,
  cancelLabel = "Cancel",
}: ActionSheetProps) {
  const [mounted, setMounted] = useState(false);
  const dialogRef = useDialogA11y({ isOpen, onClose });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-end"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        ref={(node) => {
          dialogRef.current = node;
        }}
        className="relative w-full rounded-t-3xl bg-white shadow-2xl"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Actions"}
      >
        <div className="flex justify-center pb-2 pt-3">
          <div className="h-1.5 w-12 rounded-full bg-sage/30" />
        </div>

        {title ? (
          <div className="border-b border-mist px-4 py-3">
            <h3 className="text-center text-sm font-semibold text-forest">{title}</h3>
          </div>
        ) : null}

        <div className="py-2">
          {options.map((option, index) => (
            <Fragment key={`${option.label}-${index}`}>
              <button
                type="button"
                onClick={() => {
                  if (option.disabled) return;
                  option.action();
                  onClose();
                }}
                disabled={option.disabled}
                className={`w-full px-4 py-3.5 text-left text-base transition-colors ${
                  option.destructive
                    ? "text-red-600 active:bg-red-50"
                    : "text-forest active:bg-mist/50"
                } ${option.disabled ? "cursor-not-allowed opacity-50" : ""} ${
                  index < options.length - 1 ? "border-b border-mist/50" : ""
                }`}
              >
                {option.label}
              </button>
            </Fragment>
          ))}
        </div>

        <div className="border-t border-mist px-4 pb-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-mist/30 py-3 text-center text-base font-semibold text-forest transition-colors active:bg-mist/50"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
