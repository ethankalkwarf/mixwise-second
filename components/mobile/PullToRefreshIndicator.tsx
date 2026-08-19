"use client";

interface PullToRefreshIndicatorProps {
  distance: number;
  isRefreshing: boolean;
}

/** Spinner that lives in the gap opened by pulling the page down. */
export function PullToRefreshIndicator({
  distance,
  isRefreshing,
}: PullToRefreshIndicatorProps) {
  if (distance <= 0 && !isRefreshing) return null;

  const progress = Math.min(1, distance / 56);
  const opacity = isRefreshing ? 1 : Math.min(1, (distance - 8) / 28);

  return (
    <div
      className="flex items-center justify-center"
      style={{
        height: 56,
        marginTop: -56,
        opacity,
        pointerEvents: "none",
      }}
      aria-hidden
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md shadow-black/10"
        style={{
          transform: isRefreshing ? undefined : `scale(${0.72 + progress * 0.28}) rotate(${progress * 180}deg)`,
        }}
      >
        <div
          className={`h-4 w-4 rounded-full border-2 border-terracotta border-t-transparent ${
            isRefreshing ? "animate-spin" : ""
          }`}
        />
      </div>
    </div>
  );
}
