"use client";

import { useEffect, useRef, useState } from "react";

export type LearnPhotoSlide = {
  src: string;
  alt: string;
  label: string;
  note: string;
  tone?: "good" | "bad" | "neutral";
};

type Props = {
  slides: LearnPhotoSlide[];
  /** Accessible name for the pager region */
  label?: string;
};

const SWIPE_HINT_KEY = "mw-learn-photo-swipe-hint-v1";

function hasSeenSwipeHint(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.sessionStorage.getItem(SWIPE_HINT_KEY) === "1";
  } catch {
    return false;
  }
}

function markSwipeHintSeen() {
  try {
    window.sessionStorage.setItem(SWIPE_HINT_KEY, "1");
  } catch {
    /* ignore */
  }
}

/**
 * App-first photo compare: one full-bleed slide at a time, snap-swipe.
 * Flat — no nested cards, no arrow chrome.
 */
export function LearnPhotoPager({ slides, label = "Photo gallery" }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const count = slides.length;

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || count === 0) return;

    const sync = () => {
      const width = root.clientWidth || 1;
      const next = Math.round(root.scrollLeft / width);
      setIndex(Math.max(0, Math.min(count - 1, next)));
      if (root.scrollLeft > 10) {
        setShowSwipeHint(false);
        markSwipeHintSeen();
      }
    };

    sync();
    root.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      root.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [count]);

  // First time the pager enters view on a touch/phone session — nudge to swipe.
  useEffect(() => {
    if (count < 2 || hasSeenSwipeHint()) return;
    if (typeof window === "undefined") return;
    // Desktop prefers a vertical stack — no swipe coaching.
    if (window.matchMedia("(min-width: 768px)").matches) return;

    const node = rootRef.current;
    if (!node) return;

    let armed = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || armed) return;
        armed = true;
        setShowSwipeHint(true);
        observer.disconnect();
      },
      { threshold: 0.45, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [count]);

  // Auto-dismiss the chip after a beat if they never swipe.
  useEffect(() => {
    if (!showSwipeHint) return;
    const timer = window.setTimeout(() => {
      setShowSwipeHint(false);
      markSwipeHintSeen();
    }, 5200);
    return () => window.clearTimeout(timer);
  }, [showSwipeHint]);

  if (count === 0) return null;

  return (
    <div
      ref={rootRef}
      className={`learn-photo-pager${showSwipeHint ? " learn-photo-pager--hint" : ""}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div ref={scrollerRef} className="learn-photo-pager__scroller" tabIndex={0}>
        {slides.map((slide, i) => {
          const toneClass =
            slide.tone === "good"
              ? "learn-photo-pager__meta--good"
              : slide.tone === "bad"
                ? "learn-photo-pager__meta--bad"
                : "";
          return (
            <div
              key={`${slide.src}-${slide.label}`}
              className="learn-photo-pager__slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}: ${slide.label}`}
            >
              <div className="learn-photo-pager__media">
                {/* eslint-disable-next-line @next/next/no-img-element -- Learn stills; plain img is WKWebView-safe */}
                <img src={slide.src} alt={slide.alt} loading={i === 0 ? "eager" : "lazy"} decoding="async" />
                {i === 0 && showSwipeHint ? (
                  <div className="learn-photo-pager__nudge" aria-hidden>
                    <span className="learn-photo-pager__nudge-pill">
                      Swipe
                      <span className="learn-photo-pager__nudge-arrow">→</span>
                    </span>
                  </div>
                ) : null}
              </div>
              <div className={`learn-photo-pager__meta ${toneClass}`.trim()}>
                <p className="learn-photo-pager__label">{slide.label}</p>
                <p className="learn-photo-pager__note">{slide.note}</p>
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 ? (
        <div className="learn-photo-pager__footer">
          <div className="learn-photo-pager__track" aria-hidden>
            <div
              className="learn-photo-pager__fill"
              style={{ width: `${((index + 1) / count) * 100}%` }}
            />
          </div>
          <p className="learn-photo-pager__status">
            {index + 1} of {count}
            {showSwipeHint ? (
              <span className="learn-photo-pager__hint learn-photo-pager__hint--pulse"> · swipe for more</span>
            ) : (
              <span className="learn-photo-pager__hint"> · swipe</span>
            )}
          </p>
        </div>
      ) : null}
    </div>
  );
}
