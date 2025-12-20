"use client";

import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { useFavorites } from "@/hooks/useFavorites";

interface FavoriteButtonProps {
  cocktail: {
    id: string;
    name: string;
    slug?: string;
    imageUrl?: string;
  };
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function FavoriteButton({
  cocktail,
  size = "md",
  showLabel = false,
  className = "",
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();
  const favorited = isFavorite(cocktail.id);

  // Debug logging
  console.log(`[FavoriteButton] ${cocktail.name}: isLoading=${isLoading}, favorited=${favorited}`);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(cocktail);
  };

  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div className={`${iconSizes[size]} bg-red-200 rounded animate-pulse`} />
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        ${className}
        group flex items-center gap-2 rounded-lg transition-all
        ${favorited 
          ? "text-red-400 hover:text-red-300" 
          : "text-slate-400 hover:text-red-400"
        }
        hover:bg-red-500/10
        focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50
      `}
      aria-label={favorited ? `Remove ${cocktail.name} from favorites` : `Add ${cocktail.name} to favorites`}
      aria-pressed={favorited}
    >
      {favorited ? (
        <HeartSolidIcon className={`${iconSizes[size]} drop-shadow-glow`} />
      ) : (
        <HeartIcon className={iconSizes[size]} />
      )}
      {showLabel && (
        <span className="text-sm font-medium">
          {favorited ? "Saved" : "Save"}
        </span>
      )}
    </button>
  );
}





