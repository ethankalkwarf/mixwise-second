"use client";

import { useEffect, useRef } from "react";
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
 * CRITICAL FIX: Uses refs to prevent duplicate view recordings on auth state changes
 */
export function CocktailActions({ cocktail }: CocktailActionsProps) {
  const { recordView } = useRecentlyViewed();
  const { user, isAuthenticated } = useUser();
  const { supabaseClient: supabase } = useSessionContext();
  
  // Track if we've already recorded the view for this cocktail
  const hasRecordedView = useRef<string | null>(null);

  // Record view when component mounts - only once per cocktail
  useEffect(() => {
    // Skip if we've already recorded this cocktail
    if (hasRecordedView.current === cocktail.id) return;
    hasRecordedView.current = cocktail.id;
    
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
  }, [cocktail.id, cocktail.name, cocktail.slug, cocktail.imageUrl, cocktail.base_spirit, cocktail.categories_all, recordView, isAuthenticated, user?.id, supabase]);

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





