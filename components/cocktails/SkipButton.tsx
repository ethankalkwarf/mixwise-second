"use client";

import { useState } from "react";
import { HandThumbDownIcon } from "@heroicons/react/24/outline";
import { HandThumbDownIcon as HandThumbDownSolidIcon } from "@heroicons/react/24/solid";
import { useCocktailSkips } from "@/hooks/useCocktailSkips";
import { useUser } from "@/components/auth/UserProvider";
import { SkipDrinkDialog } from "./SkipDrinkDialog";

interface SkipButtonProps {
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

export function SkipButton({
  cocktail,
  size = "md",
  showLabel = false,
  className = "",
}: SkipButtonProps) {
  const { isAuthenticated } = useUser();
  const { isSkipped, isLoading, getSkip, skipCocktail, unskipCocktail } = useCocktailSkips();
  const [dialogOpen, setDialogOpen] = useState(false);
  const skipped = isSkipped(cocktail.id);
  const existing = getSkip(cocktail.id);

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

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      await skipCocktail(cocktail);
      return;
    }
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div className={`${iconSizes[size]} bg-sage/30 rounded animate-pulse`} />
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`
          ${sizeClasses[size]}
          ${className}
          group flex items-center gap-2 rounded-lg transition-all
          ${skipped
            ? "text-terracotta hover:text-terracotta-dark"
            : "text-slate-400 hover:text-terracotta"
          }
          hover:bg-terracotta/10
          focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50
        `}
        aria-label={
          skipped
            ? `Edit skip for ${cocktail.name}`
            : `Skip ${cocktail.name} so it won't be recommended`
        }
        aria-pressed={skipped}
      >
        {skipped ? (
          <HandThumbDownSolidIcon className={iconSizes[size]} />
        ) : (
          <HandThumbDownIcon className={iconSizes[size]} />
        )}
        {showLabel && (
          <span className="text-sm font-medium">
            {skipped ? "Skipped" : "Skip"}
          </span>
        )}
      </button>

      <SkipDrinkDialog
        isOpen={dialogOpen}
        cocktailName={cocktail.name}
        initialNotes={existing?.notes}
        isSkipped={skipped && isAuthenticated}
        onClose={() => setDialogOpen(false)}
        onSkip={async (notes) => {
          await skipCocktail(cocktail, notes);
        }}
        onRestore={
          skipped
            ? async () => {
                await unskipCocktail(cocktail.id);
              }
            : undefined
        }
      />
    </>
  );
}
