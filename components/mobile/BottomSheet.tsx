"use client";

import { ReactNode, useEffect } from "react";

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
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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

      {/* Bottom Sheet */}
      <div
        className="relative w-full bg-white rounded-t-3xl shadow-2xl safe-area-bottom overflow-hidden flex flex-col"
        style={{
          maxHeight,
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-12 h-1.5 bg-sage/30 rounded-full" />
        </div>

        {/* Title */}
        {title && (
          <div className="px-4 py-3 border-b border-mist flex-shrink-0">
            <h3 className="text-lg font-serif font-bold text-forest">
              {title}
            </h3>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
