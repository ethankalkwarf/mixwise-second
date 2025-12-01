"use client";

import { useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { useRatings } from "@/hooks/useRatings";

interface RatingStarsProps {
  cocktailId: string;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export function RatingStars({ cocktailId, size = "md", showCount = true }: RatingStarsProps) {
  const { rating, isLoading, setRating } = useRatings(cocktailId);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const starSize = sizeClasses[size];

  if (isLoading) {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star} className={`${starSize} bg-slate-700 rounded animate-pulse`} />
        ))}
      </div>
    );
  }

  const displayRating = hoverRating ?? rating.userRating ?? Math.round(rating.averageRating);

  return (
    <div className="flex items-center gap-3">
      {/* Stars */}
      <div 
        className="flex items-center gap-0.5"
        role="group"
        aria-label={`Rate this cocktail. Current average: ${rating.averageRating} stars from ${rating.totalRatings} ratings`}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          const isUserRating = rating.userRating !== null && star <= rating.userRating;
          
          return (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              className={`
                transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-lime-500/50 rounded
                ${isUserRating ? "text-lime-400" : isFilled ? "text-amber-400" : "text-slate-600"}
                hover:scale-110
              `}
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              {isFilled ? (
                <StarIcon className={starSize} />
              ) : (
                <StarOutlineIcon className={starSize} />
              )}
            </button>
          );
        })}
      </div>

      {/* Rating info */}
      {showCount && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          {rating.averageRating > 0 && (
            <>
              <span className="font-medium text-slate-300">{rating.averageRating.toFixed(1)}</span>
              <span className="text-slate-500">•</span>
            </>
          )}
          <span>
            {rating.totalRatings} {rating.totalRatings === 1 ? "rating" : "ratings"}
          </span>
          {rating.userRating !== null && (
            <>
              <span className="text-slate-500">•</span>
              <span className="text-lime-400">Your rating: {rating.userRating}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for cards
export function RatingStarsCompact({ cocktailId }: { cocktailId: string }) {
  const { rating, isLoading } = useRatings(cocktailId);

  if (isLoading || rating.totalRatings === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <StarIcon className="w-4 h-4 text-amber-400" />
      <span className="text-slate-300 font-medium">{rating.averageRating.toFixed(1)}</span>
      <span className="text-slate-500">({rating.totalRatings})</span>
    </div>
  );
}




