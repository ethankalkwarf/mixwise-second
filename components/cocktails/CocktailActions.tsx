"use client";

import { useEffect } from "react";
import { FavoriteButton } from "./FavoriteButton";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

interface CocktailActionsProps {
  cocktail: {
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
  };
}

/**
 * Client component for cocktail actions (favorite, track view)
 */
export function CocktailActions({ cocktail }: CocktailActionsProps) {
  const { recordView } = useRecentlyViewed();

  // Record view when component mounts
  useEffect(() => {
    recordView({
      id: cocktail.id,
      name: cocktail.name,
      slug: cocktail.slug,
      imageUrl: cocktail.imageUrl,
    });
  }, [cocktail, recordView]);

  return (
    <div className="flex items-center gap-2">
      <FavoriteButton
        cocktail={{
          id: cocktail.id,
          name: cocktail.name,
          slug: cocktail.slug,
          imageUrl: cocktail.imageUrl,
        }}
        size="lg"
        showLabel
      />
    </div>
  );
}





