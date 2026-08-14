"use client";

import { useEffect, useState } from "react";

interface DailyCocktailBannerProps {
  isInitiallyDaily: boolean;
}

export function DailyCocktailBanner({ isInitiallyDaily }: DailyCocktailBannerProps) {
  const [dateLabel, setDateLabel] = useState<string | null>(null);

  useEffect(() => {
    setDateLabel(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    );
  }, []);

  if (!isInitiallyDaily) return null;

  return (
    <div className="mb-8">
      <div className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 bg-terracotta/10 text-terracotta px-4 py-2 rounded-2xl sm:rounded-full text-sm font-medium max-w-full">
        <span>⭐</span>
        <span>Cocktail of the Day</span>
        {dateLabel ? <span className="text-xs opacity-75">{dateLabel}</span> : null}
      </div>
    </div>
  );
}
