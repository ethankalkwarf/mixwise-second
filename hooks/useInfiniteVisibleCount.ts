"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_PAGE_SIZE = 24;
const LOAD_LOCK_MS = 300;

type Options = {
  /** `infinite` auto-loads via IntersectionObserver; `manual` requires `loadMore()`. */
  mode?: "infinite" | "manual";
};

/**
 * Caps list rendering so IntersectionObserver cannot dump the full catalog
 * into the DOM in one frame (Chrome RESULT_CODE_HUNG).
 */
export function useInfiniteVisibleCount<T>(
  items: T[],
  pageSize = DEFAULT_PAGE_SIZE,
  options: Options = {}
) {
  const mode = options.mode ?? "infinite";
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [items, pageSize]);

  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + pageSize, items.length));
  }, [pageSize, items.length]);

  useEffect(() => {
    if (mode !== "infinite") return;

    const node = loadMoreRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        setVisibleCount((prev) => Math.min(prev + pageSize, items.length));
      },
      { threshold: 0.1, rootMargin: "0px" }
    );

    // Delay re-observe so a still-visible sentinel cannot cascade every frame.
    const delay = visibleCount <= pageSize ? 0 : LOAD_LOCK_MS;
    const startId = window.setTimeout(() => observer.observe(node), delay);

    return () => {
      window.clearTimeout(startId);
      observer.disconnect();
    };
  }, [mode, visibleCount, hasMore, items.length, pageSize]);

  return {
    visibleItems: items.slice(0, visibleCount),
    hasMore,
    loadMore,
    loadMoreRef,
    visibleCount,
  };
}
