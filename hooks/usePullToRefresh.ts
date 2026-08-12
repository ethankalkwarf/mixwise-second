"use client";

import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  enabled?: boolean;
}

/**
 * usePullToRefresh
 * 
 * Hook for implementing pull-to-refresh on native platforms.
 * Provides visual feedback and triggers refresh callback.
 */
export function usePullToRefresh({
  onRefresh,
  enabled = true,
}: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef<number | null>(null);
  const currentY = useRef<number | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  // Only enable on native platforms
  const shouldEnable = enabled && Capacitor.isNativePlatform();

  useEffect(() => {
    if (!shouldEnable) return;

    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if at top of scroll
      if (element.scrollTop !== 0) return;

      startY.current = e.touches[0].clientY;
      currentY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current === null) return;
      if (element.scrollTop !== 0) {
        // Reset if scrolled down
        startY.current = null;
        setPullDistance(0);
        return;
      }

      currentY.current = e.touches[0].clientY;
      const distance = Math.max(0, currentY.current - startY.current);
      setPullDistance(distance);

      // Prevent default scrolling when pulling
      if (distance > 0) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      if (startY.current === null) return;

      const distance = pullDistance;
      setPullDistance(0);
      startY.current = null;
      currentY.current = null;

      // Trigger refresh if pulled far enough (80px threshold)
      if (distance > 80 && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    element.addEventListener("touchstart", handleTouchStart, { passive: false });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [shouldEnable, onRefresh, pullDistance, isRefreshing]);

  return {
    isRefreshing,
    pullDistance,
    elementRef,
    shouldShowIndicator: pullDistance > 0 || isRefreshing,
  };
}
