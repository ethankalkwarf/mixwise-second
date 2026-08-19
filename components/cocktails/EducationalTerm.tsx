"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import type { GlossaryTerm } from "@/lib/cocktailTechniqueGlossary";

interface EducationalTermProps {
  term: GlossaryTerm;
  children: string;
}

const GUTTER = 12;
const PANEL_MAX_WIDTH = 280;
const HEADER_OFFSET = 72;

type PanelPos = {
  top: number;
  left: number;
  width: number;
  arrowLeft: number;
  placeBelow: boolean;
};

function tabBarOffset(): number {
  if (typeof window === "undefined") return 16;
  if (document.documentElement.classList.contains("native-app")) return 88;
  if (window.innerWidth >= 1024) return 16;
  return 80;
}

function computePosition(trigger: DOMRect, panelHeight: number): PanelPos {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(PANEL_MAX_WIDTH, vw - GUTTER * 2);
  const bottomReserve = tabBarOffset();

  let left = trigger.left + trigger.width / 2 - width / 2;
  left = Math.max(GUTTER, Math.min(left, vw - width - GUTTER));

  const spaceAbove = trigger.top - HEADER_OFFSET;
  const spaceBelow = vh - trigger.bottom - bottomReserve;
  const placeBelow = spaceAbove < panelHeight + 10 && spaceBelow >= spaceAbove;

  let top = placeBelow ? trigger.bottom + 8 : trigger.top - panelHeight - 8;
  const minTop = HEADER_OFFSET;
  const maxTop = Math.max(minTop, vh - panelHeight - bottomReserve);
  top = Math.max(minTop, Math.min(top, maxTop));

  const arrowLeft = Math.max(
    16,
    Math.min(trigger.left + trigger.width / 2 - left, width - 16)
  );

  return { top, left, width, arrowLeft, placeBelow };
}

/**
 * Tap/click definition for a jargon term in recipe steps.
 * The panel is portaled and clamped to the viewport so it stays readable on phones.
 * learnPath is reserved for a future education library — not linked yet.
 */
export function EducationalTerm({ term, children }: EducationalTermProps) {
  const nativeShell = useNativeShell();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<PanelPos | null>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);
  const panelId = `mw-term-${term.label}-${children}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const trigger = rootRef.current?.getBoundingClientRect();
    if (!trigger) return;
    const height = panelRef.current?.offsetHeight || 132;
    setPos(computePosition(trigger, height));
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    updatePosition();
  }, [open, updatePosition, term.explanation, term.why]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  return (
    <span ref={rootRef} className="relative inline">
      <button
        type="button"
        className="mw-inline-term font-medium text-forest underline decoration-dotted decoration-olive/70 underline-offset-2 hover:text-olive focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/40 rounded-sm"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {children}
      </button>

      {open && mounted
        ? createPortal(
            <span
              ref={panelRef}
              id={panelId}
              role="tooltip"
              className="fixed z-[1300] w-[min(280px,calc(100vw-24px))] rounded-xl bg-forest px-3 py-2.5 text-left text-xs leading-relaxed text-cream shadow-lg"
              style={
                pos
                  ? {
                      top: pos.top,
                      left: pos.left,
                      width: pos.width,
                    }
                  : { visibility: "hidden", top: 0, left: GUTTER }
              }
            >
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-olive">
                {term.label}
              </span>
              <span className="block text-cream/95">{term.explanation}</span>
              {term.why && (
                <span className="mt-1.5 block text-cream/75">{term.why}</span>
              )}
              {term.learnPath && !nativeShell && (
                <a
                  href={term.learnPath}
                  className="mw-inline-term mt-2 inline-block text-[11px] font-semibold uppercase tracking-wide text-olive hover:text-cream"
                  onClick={(e) => e.stopPropagation()}
                >
                  Learn more →
                </a>
              )}
              {pos && (
                <span
                  aria-hidden
                  className={`absolute h-0 w-0 -translate-x-1/2 border-x-transparent ${
                    pos.placeBelow
                      ? "bottom-full border-b-forest"
                      : "top-full border-t-forest"
                  }`}
                  style={{
                    left: pos.arrowLeft,
                    borderLeftWidth: 6,
                    borderRightWidth: 6,
                    ...(pos.placeBelow
                      ? { borderBottomWidth: 6 }
                      : { borderTopWidth: 6 }),
                  }}
                />
              )}
            </span>,
            document.body
          )
        : null}
    </span>
  );
}
