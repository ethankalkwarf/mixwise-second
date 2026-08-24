"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Options = {
  /** When true, Escape and focus trap are active. */
  isOpen: boolean;
  onClose: () => void;
  /** Prefer focusing this element first (e.g. close button or primary field). */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** Lock body scroll while open. Default true. */
  lockScroll?: boolean;
};

/**
 * Shared a11y for custom dialogs/sheets that aren't Headless UI:
 * Escape to close, initial focus, focus trap, restore focus, optional scroll lock.
 */
export function useDialogA11y({
  isOpen,
  onClose,
  initialFocusRef,
  lockScroll = true,
}: Options) {
  const containerRef = useRef<HTMLElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    if (lockScroll) {
      document.body.style.overflow = "hidden";
    }

    const focusInitial = () => {
      const preferred = initialFocusRef?.current;
      if (preferred && preferred.isConnected) {
        preferred.focus();
        return;
      }
      const root = containerRef.current;
      if (!root) return;
      const first = root.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    };

    // After paint so portal content exists.
    const frame = requestAnimationFrame(focusInitial);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const root = containerRef.current;
      if (!root) return;

      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);

      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !root.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !root.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown, true);
      if (lockScroll) {
        document.body.style.overflow = previousOverflow;
      }
      const restore = previouslyFocused.current;
      if (restore && restore.isConnected) {
        restore.focus();
      }
    };
  }, [isOpen, onClose, initialFocusRef, lockScroll]);

  return containerRef;
}
