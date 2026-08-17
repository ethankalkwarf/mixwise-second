"use client";

import { useEffect, useRef } from "react";
import { FavoriteButton } from "./FavoriteButton";
import { SkipButton } from "./SkipButton";
import { ShareButtons } from "./ShareButtons";
import { useCocktailSkips } from "@/hooks/useCocktailSkips";
import { useRecordCocktailView } from "@/hooks/useRecentlyViewed";
import { useUser } from "@/components/auth/UserProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { checkExplorationBadges } from "@/lib/badgeEngine";

interface RecipeActionsProps {
  cocktail: {
    id: string;
    name: string;
    slug: string;
    image_url?: string | null;
    base_spirit?: string | null;
    categories_all?: string[] | null;
  };
}

export function RecipeActions({ cocktail }: RecipeActionsProps) {
  const recordView = useRecordCocktailView();
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const { isSkipped, getSkip } = useCocktailSkips();
  const skipped = isSkipped(cocktail.id);
  const skipNote = getSkip(cocktail.id)?.notes;
  const supabase = getSupabaseClient();
  const checkedBadgesFor = useRef<string | null>(null);
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/cocktails/${cocktail.slug}`;

  useEffect(() => {
    if (authLoading) return;

    recordView({
      id: cocktail.id,
      name: cocktail.name,
      slug: cocktail.slug,
      imageUrl: cocktail.image_url ?? undefined,
    });

    if (isAuthenticated && user) {
      const badgeKey = `${user.id}:${cocktail.id}`;
      if (checkedBadgesFor.current !== badgeKey) {
        checkedBadgesFor.current = badgeKey;
        checkExplorationBadges(supabase, user.id, {
          primarySpirit: cocktail.base_spirit ?? undefined,
          categories: cocktail.categories_all ?? undefined,
        }).catch((badgeError) => {
          console.error("Error checking exploration badges:", badgeError);
        });
      }
    }
  }, [
    authLoading,
    cocktail.id,
    cocktail.name,
    cocktail.slug,
    cocktail.image_url,
    cocktail.base_spirit,
    cocktail.categories_all,
    recordView,
    isAuthenticated,
    user,
    supabase,
  ]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <FavoriteButton
          cocktail={{
            id: cocktail.id,
            name: cocktail.name,
            slug: cocktail.slug,
            imageUrl: cocktail.image_url ?? undefined,
          }}
          size="lg"
          showLabel={false}
          className="flex-shrink-0"
        />
        <SkipButton
          cocktail={{
            id: cocktail.id,
            name: cocktail.name,
            slug: cocktail.slug,
            imageUrl: cocktail.image_url ?? undefined,
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
      {skipped ? (
        <p className="text-sm text-sage">
          Hidden from your recommendations.
          {skipNote ? ` Note: ${skipNote}` : ""}
        </p>
      ) : null}
    </div>
  );
}
