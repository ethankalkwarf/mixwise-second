"use client";

import { FavoriteButton } from "./FavoriteButton";
import { ShareButtons } from "./ShareButtons";

interface RecipeActionsProps {
  cocktail: {
    id: string;
    name: string;
    slug: string;
    image_url?: string | null;
  };
}

export function RecipeActions({ cocktail }: RecipeActionsProps) {
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/cocktails/${cocktail.slug}`;

  return (
    <div className="flex items-center gap-3">
      <FavoriteButton
        cocktail={{
          id: cocktail.id,
          name: cocktail.name,
          slug: cocktail.slug,
          imageUrl: cocktail.image_url,
        }}
        size="lg"
        showLabel={false}
        className="flex-shrink-0"
      />

      <ShareButtons
        url={shareUrl}
        title={`${cocktail.name} Cocktail Recipe`}
        description={`Learn how to make a ${cocktail.name} cocktail with ingredients and instructions.`}
      />
    </div>
  );
}
