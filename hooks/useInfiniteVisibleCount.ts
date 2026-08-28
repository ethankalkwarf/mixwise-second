"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_PAGE_SIZE = 24;
const LOAD_LOCK_MS = 300;

type Options = {
  /** `infinite` auto-loads via IntersectionObserver; `manual` requires `loadMore()`. */
  mode?: "infinite" | "manual";
  /** One-shot restore (e.g. returning to Search/Mix after viewing a recipe). */
  initialVisibleCount?: number;
};

function itemsFingerprint(items: unknown[]): string {
  const len = items.length;
  if (len === 0) return "0";
  const first = items[0] as { id?: string; slug?: string; _id?: string };
  const last = items[len - 1] as { id?: string; slug?: string; _id?: string };
  const a = first?.id ?? first?.slug ?? first?._id ?? "";
  const b = last?.id ?? last?.slug ?? last?._id ?? "";
  return `${len}:${a}:${b}`;
}

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
  const restoreCount = options.initialVisibleCount;
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.max(pageSize, restoreCount ?? pageSize)
  );
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const pendingRestoreRef = useRef<number | null>(
    restoreCount != null && restoreCount > pageSize ? restoreCount : null
  );
  const stickyMinRef = useRef<number | null>(
    restoreCount != null && restoreCount > pageSize ? restoreCount : null
  );
  const itemsFpRef = useRef<string>("");

  // Pick up restore targets that arrive after mount.
  useEffect(() => {
    if (restoreCount == null || restoreCount <= pageSize) return;
    pendingRestoreRef.current = restoreCount;
    stickyMinRef.current = Math.max(stickyMinRef.current ?? 0, restoreCount);
    setVisibleCount((prev) => Math.max(prev, restoreCount));
  }, [restoreCount, pageSize]);

  useEffect(() => {
    const fp = itemsFingerprint(items);

    if (pendingRestoreRef.current != null) {
      const target = pendingRestoreRef.current;
      if (items.length === 0) {
        setVisibleCount(Math.max(pageSize, target));
        return;
      }
      const applied = Math.min(Math.max(pageSize, target), items.length);
      setVisibleCount(applied);
      stickyMinRef.current = applied;
      pendingRestoreRef.current = null;
      itemsFpRef.current = fp;
      return;
    }

    // Same catalog, new array reference (async reload) — keep restored floor.
    if (fp === itemsFpRef.current && stickyMinRef.current != null) {
      setVisibleCount(
        Math.min(Math.max(stickyMinRef.current, pageSize), Math.max(items.length, pageSize))
      );
      return;
    }

    itemsFpRef.current = fp;
    stickyMinRef.current = null;
    setVisibleCount(pageSize);
  }, [items, pageSize]);

  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => {
      const next = Math.min(prev + pageSize, items.length);
      stickyMinRef.current = Math.max(stickyMinRef.current ?? 0, next);
      return next;
    });
  }, [pageSize, items.length]);

  useEffect(() => {
    if (mode !== "infinite") return;

    const node = loadMoreRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        setVisibleCount((prev) => {
          const next = Math.min(prev + pageSize, items.length);
          stickyMinRef.current = Math.max(stickyMinRef.current ?? 0, next);
          return next;
        });
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
