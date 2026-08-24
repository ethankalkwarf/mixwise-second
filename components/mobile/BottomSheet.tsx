"use client";

import { ReactNode, useId } from "react";
import { useDialogA11y } from "@/hooks/useDialogA11y";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxHeight?: string;
}

/**
 * BottomSheet
 *
 * iOS-style bottom sheet modal that slides up from bottom.
 * Perfect for forms, details, or additional content.
 */
export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = "90vh",
}: BottomSheetProps) {
  const titleId = useId();
  const dialogRef = useDialogA11y({ isOpen, onClose });

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
      role="presentation"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        ref={(node) => {
          dialogRef.current = node;
        }}
        className="relative flex w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl safe-area-bottom"
        style={{
          maxHeight,
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "Sheet"}
      >
        <div className="flex flex-shrink-0 justify-center pb-2 pt-3">
          <div className="h-1.5 w-12 rounded-full bg-sage/30" />
        </div>

        {title ? (
          <div className="flex-shrink-0 border-b border-mist px-4 py-3">
            <h3 id={titleId} className="font-serif text-lg font-bold text-forest">
              {title}
            </h3>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
