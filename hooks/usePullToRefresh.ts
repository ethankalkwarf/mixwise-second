"use client";

import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  enabled?: boolean;
}

const PULL_PREVENT_PX = 12;
const REFRESH_PX = 72;
const HOLD_PX = 56;
const MAX_PULL_PX = 132;
const MIN_REFRESH_MS = 420;

function windowScrollTop() {
  return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
}

function isOverflowScroller(element: HTMLElement) {
  return element.scrollHeight > element.clientHeight + 1;
}

function isAtScrollTop(element: HTMLElement) {
  if (isOverflowScroller(element)) {
    return element.scrollTop <= 0;
  }
  return windowScrollTop() <= 0 && element.scrollTop <= 0;
}

/** iOS-style resistance so the page follows the finger, then eases. */
function rubberBand(raw: number) {
  if (raw <= 0) return 0;
  return MAX_PULL_PX * (1 - Math.exp(-raw / 90));
}

/**
 * Pull-to-refresh for native. Reports a resisted pull distance so the
 * page content can translate with the gesture.
 */
export function usePullToRefresh({
  onRefresh,
  enabled = true,
}: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef<number | null>(null);
  const startX = useRef<number | null>(null);
  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  const shouldEnable = enabled && Capacitor.isNativePlatform();

  useEffect(() => {
    isRefreshingRef.current = isRefreshing;
  }, [isRefreshing]);

  useEffect(() => {
    if (!shouldEnable) return;

    const element = elementRef.current;
    if (!element) return;

    const resetPull = () => {
      startY.current = null;
      startX.current = null;
      pullDistanceRef.current = 0;
      setIsDragging(false);
      if (!isRefreshingRef.current) setPullDistance(0);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (isRefreshingRef.current) return;
      if (!isAtScrollTop(element)) return;
      startY.current = e.touches[0].clientY;
      startX.current = e.touches[0].clientX;
      pullDistanceRef.current = 0;
      setIsDragging(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current === null) return;
      if (isRefreshingRef.current) {
        resetPull();
        return;
      }
      if (!isAtScrollTop(element)) {
        resetPull();
        return;
      }

      const dx = e.touches[0].clientX - (startX.current ?? e.touches[0].clientX);
      const dy = e.touches[0].clientY - startY.current;

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
        resetPull();
        return;
      }

      const visual = rubberBand(Math.max(0, dy));
      pullDistanceRef.current = visual;
      setPullDistance(visual);

      if (dy > PULL_PREVENT_PX) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      if (startY.current === null) return;

      const distance = pullDistanceRef.current;
      startY.current = null;
      startX.current = null;
      setIsDragging(false);

      if (distance > rubberBand(REFRESH_PX) && !isRefreshingRef.current) {
        setPullDistance(HOLD_PX);
        pullDistanceRef.current = HOLD_PX;
        setIsRefreshing(true);
        isRefreshingRef.current = true;
        const started = Date.now();
        try {
          await onRefreshRef.current();
        } finally {
          const wait = MIN_REFRESH_MS - (Date.now() - started);
          if (wait > 0) await new Promise((resolve) => window.setTimeout(resolve, wait));
          setIsRefreshing(false);
          isRefreshingRef.current = false;
          pullDistanceRef.current = 0;
          setPullDistance(0);
        }
        return;
      }

      pullDistanceRef.current = 0;
      setPullDistance(0);
    };

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd);
    element.addEventListener("touchcancel", resetPull);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", resetPull);
    };
  }, [shouldEnable]);

  return {
    isRefreshing,
    isDragging,
    pullDistance,
    elementRef,
    shouldShowIndicator: pullDistance > 0 || isRefreshing,
  };
}
