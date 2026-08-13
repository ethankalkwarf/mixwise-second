"use client";

interface DailyCocktailBannerProps {
  isInitiallyDaily: boolean;
}

export function DailyCocktailBanner({ isInitiallyDaily }: DailyCocktailBannerProps) {
  if (!isInitiallyDaily) return null;

  return (
    <div className="mb-8">
      <div className="inline-flex items-center gap-2 bg-terracotta/10 text-terracotta px-4 py-2 rounded-full text-sm font-medium">
        <span>⭐</span>
        <span>Cocktail of the Day</span>
        <span className="text-xs opacity-75">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
