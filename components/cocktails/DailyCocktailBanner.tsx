"use client";

import { useEffect, useState } from "react";
import { isTodaysDailyCocktail } from "@/lib/dailyCocktail";

interface DailyCocktailBannerProps {
  cocktailId: string;
  allCocktails: Array<{ id: string; slug: string }>;
  isInitiallyDaily: boolean;
}

export function DailyCocktailBanner({
  cocktailId,
  allCocktails,
  isInitiallyDaily
}: DailyCocktailBannerProps) {
  const [isDaily, setIsDaily] = useState(isInitiallyDaily);

  useEffect(() => {
    // Check if this is actually today's daily cocktail using browser time
    const checkIfDaily = () => {
      const actuallyDaily = isTodaysDailyCocktail(cocktailId, allCocktails);
      setIsDaily(actuallyDaily);
    };

    checkIfDaily();

    // Check again at midnight (in case user keeps the page open)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    const midnightTimer = setTimeout(() => {
      checkIfDaily();
      // Set up daily checks
      setInterval(checkIfDaily, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);

    return () => clearTimeout(midnightTimer);
  }, [cocktailId, allCocktails]);

  if (!isDaily) return null;

  return (
    <div className="mb-8">
      <div className="inline-flex items-center gap-2 bg-terracotta/10 text-terracotta px-4 py-2 rounded-full text-sm font-medium">
        <span>⭐</span>
        <span>Cocktail of the Day</span>
        <span className="text-xs opacity-75">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </span>
      </div>
    </div>
  );
}
