"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { useToast } from "@/components/ui/toast";
import {
  trackCocktailFavorited,
  trackCocktailUnfavorited,
} from "@/lib/analytics";
import { checkFavoritesBadges } from "@/lib/badgeEngine";
import { notifyBadgesUpdated } from "@/hooks/useUserBadges";
import { isNativeApp } from "@/lib/mobile/platform";
import {
  clearGuestFavorites,
  loadGuestFavorites,
  saveGuestFavorites,
  type GuestFavorite,
} from "@/lib/mobile/guestData";
import type { Favorite } from "@/lib/supabase/database.types";

const GUEST_AUTH_NUDGE_AT = 5;

interface UseFavoritesResult {
  favorites: Favorite[];
  favoriteIds: Set<string>;
  isLoading: boolean;
  isGuest: boolean;
  isFavorite: (cocktailId: string) => boolean;
  toggleFavorite: (cocktail: {
    id: string;
    name: string;
    slug?: string;
    imageUrl?: string;
  }) => Promise<void>;
  removeFavorite: (cocktailId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

function guestToFavorite(item: GuestFavorite, index: number): Favorite {
  return {
    id: -(index + 1),
    user_id: "guest",
    cocktail_id: item.cocktail_id,
    cocktail_name: item.cocktail_name,
    cocktail_slug: item.cocktail_slug,
    cocktail_image_url: item.cocktail_image_url,
    created_at: item.created_at,
  };
}

/**
 * Hook to manage user's favorite cocktails.
 * Guests store hearts locally; authenticated users sync to Supabase.
 */
export function useFavorites(): UseFavoritesResult {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const supabase = getSupabaseClient();
  const { openAuthDialog } = useAuthDialog();
  const toast = useToast();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const lastFetchedUserId = useRef<string | null>(null);
  const isFetching = useRef(false);
  const hasSyncedGuest = useRef(false);

  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.cocktail_id)), [favorites]);
  const isGuest = !isAuthenticated;

  const loadFavorites = useCallback(
    async (userId: string) => {
      if (isFetching.current) return;

      isFetching.current = true;

      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading favorites:", error);
      } else {
        setFavorites(data || []);
        lastFetchedUserId.current = userId;
      }

      isFetching.current = false;
    },
    [supabase]
  );

  const syncGuestFavorites = useCallback(
    async (userId: string) => {
      const guestItems = loadGuestFavorites();
      if (guestItems.length === 0) return;

      const { data: serverData } = await supabase
        .from("favorites")
        .select("cocktail_id")
        .eq("user_id", userId);

      const serverIds = new Set((serverData || []).map((row) => row.cocktail_id));
      const toInsert = guestItems.filter((item) => !serverIds.has(item.cocktail_id));

      if (toInsert.length > 0) {
        const { error } = await supabase.from("favorites").upsert(
          toInsert.map((item) => ({
            user_id: userId,
            cocktail_id: item.cocktail_id,
            cocktail_name: item.cocktail_name,
            cocktail_slug: item.cocktail_slug,
            cocktail_image_url: item.cocktail_image_url,
          })),
          { onConflict: "user_id,cocktail_id" }
        );

        if (error) {
          console.error("[useFavorites] Guest sync failed:", error);
          return;
        }
      }

      clearGuestFavorites();
    },
    [supabase]
  );

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      setFavorites(loadGuestFavorites().map(guestToFavorite));
      setIsLoading(false);
      lastFetchedUserId.current = null;
      hasSyncedGuest.current = false;
      return;
    }

    if (lastFetchedUserId.current !== user.id) {
      setIsLoading(true);
      (async () => {
        if (!hasSyncedGuest.current) {
          await syncGuestFavorites(user.id);
          hasSyncedGuest.current = true;
        }
        await loadFavorites(user.id);
      })().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, user?.id, loadFavorites, syncGuestFavorites]);

  const isFavorite = useCallback(
    (cocktailId: string) => favoriteIds.has(cocktailId),
    [favoriteIds]
  );

  const toggleGuestFavorite = useCallback(
    (
      cocktail: { id: string; name: string; slug?: string; imageUrl?: string },
      isCurrentlyFavorite: boolean
    ) => {
      const current = loadGuestFavorites();
      let next: GuestFavorite[];

      if (isCurrentlyFavorite) {
        next = current.filter((f) => f.cocktail_id !== cocktail.id);
        void trackCocktailUnfavorited(null, cocktail.id, {
          cocktail_name: cocktail.name,
          guest: true,
        });
        toast.info("Removed from favorites");
      } else {
        next = [
          {
            cocktail_id: cocktail.id,
            cocktail_name: cocktail.name,
            cocktail_slug: cocktail.slug || null,
            cocktail_image_url: cocktail.imageUrl || null,
            created_at: new Date().toISOString(),
          },
          ...current.filter((f) => f.cocktail_id !== cocktail.id),
        ];
        toast.success("Saved on this device");

        if (next.length >= GUEST_AUTH_NUDGE_AT && isNativeApp()) {
          openAuthDialog({
            gate: "guest_favorites_nudge",
            title: "Keep your favorites",
            subtitle: "Create a free account to sync saved drinks across devices.",
            dismissible: true,
          });
        }
      }

      saveGuestFavorites(next);
      setFavorites(next.map(guestToFavorite));
    },
    [openAuthDialog, toast]
  );

  const toggleFavorite = useCallback(
    async (cocktail: { id: string; name: string; slug?: string; imageUrl?: string }) => {
      if (!isAuthenticated || !user) {
        toggleGuestFavorite(cocktail, favoriteIds.has(cocktail.id));
        return;
      }

      const isCurrentlyFavorite = favoriteIds.has(cocktail.id);

      if (isCurrentlyFavorite) {
        setFavorites((prev) => prev.filter((f) => f.cocktail_id !== cocktail.id));

        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("cocktail_id", cocktail.id);

        if (error) {
          console.error("Error removing favorite:", error);
          toast.error("Failed to remove from favorites");
          lastFetchedUserId.current = null;
          await loadFavorites(user.id);
        } else {
          void trackCocktailUnfavorited(user.id, cocktail.id, {
            cocktail_name: cocktail.name,
          });
          toast.info("Removed from favorites");
        }
      } else {
        const newFavorite: Omit<Favorite, "id"> = {
          user_id: user.id,
          cocktail_id: cocktail.id,
          cocktail_name: cocktail.name,
          cocktail_slug: cocktail.slug || null,
          cocktail_image_url: cocktail.imageUrl || null,
          created_at: new Date().toISOString(),
        };

        setFavorites((prev) => [newFavorite as Favorite, ...prev]);

        const { data, error } = await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
            cocktail_id: cocktail.id,
            cocktail_name: cocktail.name,
            cocktail_slug: cocktail.slug,
            cocktail_image_url: cocktail.imageUrl,
          })
          .select()
          .single();

        if (error) {
          console.error("Error adding favorite:", error);
          toast.error("Failed to add to favorites");
          lastFetchedUserId.current = null;
          await loadFavorites(user.id);
        } else if (data) {
          setFavorites((prev) => [data, ...prev.filter((f) => f.cocktail_id !== cocktail.id)]);
          trackCocktailFavorited(user.id, cocktail.id, cocktail.name);
          toast.success("Added to favorites");

          try {
            const result = await checkFavoritesBadges(supabase, user.id, favorites.length + 1);
            result.awarded.forEach((badge) => {
              toast.success(`${badge.icon} ${badge.name} unlocked`);
            });
            if (result.awarded.length > 0) notifyBadgesUpdated();
          } catch (badgeError) {
            console.error("Error checking favorites badges:", badgeError);
          }
        }
      }
    },
    [
      isAuthenticated,
      user,
      favoriteIds,
      toggleGuestFavorite,
      supabase,
      loadFavorites,
      toast,
      favorites.length,
    ]
  );

  const removeFavorite = useCallback(
    async (cocktailId: string) => {
      if (!isAuthenticated || !user) {
        const next = loadGuestFavorites().filter((f) => f.cocktail_id !== cocktailId);
        saveGuestFavorites(next);
        setFavorites(next.map(guestToFavorite));
        void trackCocktailUnfavorited(null, cocktailId, { guest: true });
        toast.info("Removed from favorites");
        return;
      }

      setFavorites((prev) => prev.filter((f) => f.cocktail_id !== cocktailId));

      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("cocktail_id", cocktailId);

      if (error) {
        console.error("Error removing favorite:", error);
        toast.error("Failed to remove from favorites");
        lastFetchedUserId.current = null;
        loadFavorites(user.id);
      } else {
        void trackCocktailUnfavorited(user.id, cocktailId);
        toast.info("Removed from favorites");
      }
    },
    [isAuthenticated, user, supabase, loadFavorites, toast]
  );

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setFavorites(loadGuestFavorites().map(guestToFavorite));
      return;
    }

    lastFetchedUserId.current = null;
    setIsLoading(true);
    await loadFavorites(user.id);
    setIsLoading(false);
  }, [isAuthenticated, user, loadFavorites]);

  return {
    favorites,
    favoriteIds,
    isLoading,
    isGuest,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    refresh,
  };
}
