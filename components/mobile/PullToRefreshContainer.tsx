"use client";

import type { ReactNode, RefObject } from "react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "@/components/mobile/PullToRefreshIndicator";

interface PullToRefreshContainerProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  className?: string;
  enabled?: boolean;
}

/**
 * Wraps native page content with pull-to-refresh.
 * The page translates with the finger; do not put overflow-y-auto / h-full
 * on this wrapper — the document is the scroller.
 */
export function PullToRefreshContainer({
  children,
  onRefresh,
  className,
  enabled = true,
}: PullToRefreshContainerProps) {
  const { isRefreshing, isDragging, pullDistance, elementRef } = usePullToRefresh({
    onRefresh,
    enabled,
  });

  const offset = pullDistance;

  return (
    <div ref={elementRef as RefObject<HTMLDivElement>} className={className}>
      <div
        className="native-ptr-sheet"
        style={{
          transform: `translate3d(0, ${offset}px, 0)`,
          transition: isDragging ? "none" : "transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: offset > 0 ? "transform" : "auto",
        }}
      >
        <PullToRefreshIndicator distance={offset} isRefreshing={isRefreshing} />
        {children}
      </div>
    </div>
  );
}
