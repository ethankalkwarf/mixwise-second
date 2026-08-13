"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { GlossaryTerm } from "@/lib/cocktailTechniqueGlossary";

interface EducationalTermProps {
  term: GlossaryTerm;
  children: string;
}

/**
 * Tap/click (and hover on desktop) definition for a jargon term in recipe steps.
 * learnPath is reserved for a future education library — not linked yet.
 */
export function EducationalTerm({ term, children }: EducationalTermProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <span ref={rootRef} className="relative inline">
      <button
        type="button"
        className="font-medium text-forest underline decoration-dotted decoration-olive/70 underline-offset-2 hover:text-olive focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/40 rounded-sm"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {children}
      </button>

      {open && (
        <span
          id={panelId}
          role="tooltip"
          className="absolute z-40 bottom-full left-1/2 mb-2 w-64 -translate-x-1/2 rounded-xl bg-forest px-3 py-2.5 text-left text-xs leading-relaxed text-cream shadow-lg"
        >
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-olive">
            {term.label}
          </span>
          <span className="block text-cream/95">{term.explanation}</span>
          {term.why && (
            <span className="mt-1.5 block text-cream/75">{term.why}</span>
          )}
          <span
            aria-hidden
            className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-6 border-t-6 border-x-transparent border-t-forest"
            style={{ borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 6 }}
          />
        </span>
      )}
    </span>
  );
}
