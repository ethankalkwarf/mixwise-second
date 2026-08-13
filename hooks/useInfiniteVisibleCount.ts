"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_PAGE_SIZE = 24;
const LOAD_LOCK_MS = 300;

/**
 * Caps list rendering so IntersectionObserver cannot dump the full catalog
 * into the DOM in one frame (Chrome RESULT_CODE_HUNG).
 */
export function useInfiniteVisibleCount<T>(items: T[], pageSize = DEFAULT_PAGE_SIZE) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [items, pageSize]);

  const hasMore = visibleCount < items.length;

  useEffect(() => {
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
  }, [visibleCount, hasMore, items.length, pageSize]);

  return {
    visibleItems: items.slice(0, visibleCount),
    hasMore,
    loadMoreRef,
    visibleCount,
  };
}
