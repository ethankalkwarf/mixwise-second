"use client";

interface PullToRefreshIndicatorProps {
  distance: number;
  isRefreshing: boolean;
}

/**
 * PullToRefreshIndicator
 * 
 * Visual indicator for pull-to-refresh gesture.
 * Shows at top of scrollable content.
 */
export function PullToRefreshIndicator({
  distance,
  isRefreshing,
}: PullToRefreshIndicatorProps) {
  if (distance === 0 && !isRefreshing) return null;

  const opacity = Math.min(1, distance / 80);
  const rotation = Math.min(180, (distance / 80) * 180);

  return (
    <div
      className="fixed top-0 left-0 right-0 flex items-center justify-center z-40 pointer-events-none"
      style={{
        opacity,
        transform: `translateY(${Math.min(distance, 80)}px)`,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <div
        className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center"
        style={{
          transform: `rotate(${isRefreshing ? 0 : rotation}deg)`,
        }}
      >
        {isRefreshing ? (
          <div className="w-5 h-5 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            className="w-5 h-5 text-terracotta"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
