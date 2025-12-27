"use client";

import { useEffect } from "react";
import { FavoriteButton } from "./FavoriteButton";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useUser } from "@/components/auth/UserProvider";
import { checkExplorationBadges } from "@/lib/badgeEngine";

interface CocktailActionsProps {
  cocktail: {
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
    base_spirit?: string;
    categories_all?: string[];
  };
}

/**
 * Client component for cocktail actions (favorite, track view)
 */
export function CocktailActions({ cocktail }: CocktailActionsProps) {
  const { recordView } = useRecentlyViewed();
  const { user, isAuthenticated } = useUser();
  const { supabaseClient: supabase } = useSessionContext();

  // Record view when component mounts
  useEffect(() => {
    recordView({
      id: cocktail.id,
      name: cocktail.name,
      slug: cocktail.slug,
      imageUrl: cocktail.imageUrl,
    });

    // Check for exploration badges
    if (isAuthenticated && user) {
      try {
        checkExplorationBadges(supabase, user.id, {
          primarySpirit: cocktail.base_spirit,
          categories: cocktail.categories_all,
        });
      } catch (badgeError) {
        console.error("Error checking exploration badges:", badgeError);
      }
    }
  }, [cocktail, recordView, isAuthenticated, user, supabase]);

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





