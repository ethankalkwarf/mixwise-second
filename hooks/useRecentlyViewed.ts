"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useUser } from "@/components/auth/UserProvider";
import { trackCocktailView } from "@/lib/analytics";
import {
  clearGuestRecent,
  loadGuestRecent,
  saveGuestRecent,
  type GuestRecent,
} from "@/lib/mobile/guestData";
import type { RecentlyViewed } from "@/lib/supabase/database.types";

const MAX_RECENT_ITEMS = 20;

interface UseRecentlyViewedResult {
  recentlyViewed: RecentlyViewed[];
  isLoading: boolean;
  recordView: (cocktail: {
    id: string;
    name: string;
    slug?: string;
    imageUrl?: string;
  }) => Promise<void>;
  clearHistory: () => Promise<void>;
}

function guestToRecent(item: GuestRecent, index: number): RecentlyViewed {
  return {
    id: index,
    user_id: "guest",
    cocktail_id: item.cocktail_id,
    cocktail_name: item.cocktail_name,
    cocktail_slug: item.cocktail_slug,
    cocktail_image_url: item.cocktail_image_url,
    viewed_at: item.viewed_at,
  };
}

function recordGuestView(cocktail: {
  id: string;
  name: string;
  slug?: string;
  imageUrl?: string;
}): RecentlyViewed[] {
  const current = loadGuestRecent();
  const entry: GuestRecent = {
    cocktail_id: cocktail.id,
    cocktail_name: cocktail.name,
    cocktail_slug: cocktail.slug || null,
    cocktail_image_url: cocktail.imageUrl || null,
    viewed_at: new Date().toISOString(),
  };
  const next = [entry, ...current.filter((v) => v.cocktail_id !== cocktail.id)].slice(
    0,
    MAX_RECENT_ITEMS
  );
  saveGuestRecent(next);
  return next.map(guestToRecent);
}

/**
 * Hook to manage recently viewed cocktails.
 * Guests store history locally; authenticated users sync to Supabase.
 */
export function useRecentlyViewed(): UseRecentlyViewedResult {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const supabase = getSupabaseClient();
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewed[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const lastFetchedUserId = useRef<string | null>(null);
  const isFetching = useRef(false);
  const hasSyncedGuest = useRef(false);

  const loadRecentlyViewed = useCallback(
    async (userId: string) => {
      if (isFetching.current || lastFetchedUserId.current === userId) return;

      isFetching.current = true;

      const { data, error } = await supabase
        .from("recently_viewed_cocktails")
        .select("*")
        .eq("user_id", userId)
        .order("viewed_at", { ascending: false })
        .limit(MAX_RECENT_ITEMS);

      if (error) {
        console.error("Error loading recently viewed:", error);
      } else {
        setRecentlyViewed(data || []);
        lastFetchedUserId.current = userId;
      }

      isFetching.current = false;
    },
    [supabase]
  );

  const syncGuestRecent = useCallback(
    async (userId: string) => {
      const guestItems = loadGuestRecent();
      if (guestItems.length === 0) return;

      for (const item of guestItems) {
        await supabase.rpc("upsert_recently_viewed", {
          p_user_id: userId,
          p_cocktail_id: item.cocktail_id,
          p_cocktail_name: item.cocktail_name,
          p_cocktail_slug: item.cocktail_slug ?? undefined,
          p_cocktail_image_url: item.cocktail_image_url ?? undefined,
        });
      }

      clearGuestRecent();
    },
    [supabase]
  );

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      setRecentlyViewed(loadGuestRecent().map(guestToRecent));
      setIsLoading(false);
      lastFetchedUserId.current = null;
      hasSyncedGuest.current = false;
      return;
    }

    if (lastFetchedUserId.current !== user.id) {
      setIsLoading(true);
      (async () => {
        if (!hasSyncedGuest.current) {
          await syncGuestRecent(user.id);
          hasSyncedGuest.current = true;
        }
        await loadRecentlyViewed(user.id);
      })().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, user?.id, loadRecentlyViewed, syncGuestRecent]);

  const recordView = useCallback(
    async (cocktail: {
      id: string;
      name: string;
      slug?: string;
      imageUrl?: string;
    }) => {
      if (!cocktail.id) return;

      trackCocktailView(user?.id || null, cocktail.id, cocktail.name);

      if (!isAuthenticated || !user) {
        setRecentlyViewed(recordGuestView(cocktail));
        return;
      }

      const newEntry: RecentlyViewed = {
        id: Date.now(),
        user_id: user.id,
        cocktail_id: cocktail.id,
        cocktail_name: cocktail.name,
        cocktail_slug: cocktail.slug || null,
        cocktail_image_url: cocktail.imageUrl || null,
        viewed_at: new Date().toISOString(),
      };

      setRecentlyViewed((prev) => {
        const filtered = prev.filter((v) => v.cocktail_id !== cocktail.id);
        return [newEntry, ...filtered].slice(0, MAX_RECENT_ITEMS);
      });

      const { error } = await supabase.rpc("upsert_recently_viewed", {
        p_user_id: user.id,
        p_cocktail_id: cocktail.id,
        p_cocktail_name: cocktail.name,
        p_cocktail_slug: cocktail.slug,
        p_cocktail_image_url: cocktail.imageUrl,
      });

      if (error) {
        console.error("Error recording view:", error);
        await supabase.from("recently_viewed_cocktails").upsert(
          {
            user_id: user.id,
            cocktail_id: cocktail.id,
            cocktail_name: cocktail.name,
            cocktail_slug: cocktail.slug,
            cocktail_image_url: cocktail.imageUrl,
            viewed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,cocktail_id" }
        );
      }
    },
    [isAuthenticated, user, supabase]
  );

  const clearHistory = useCallback(async () => {
    if (!isAuthenticated || !user) {
      saveGuestRecent([]);
      setRecentlyViewed([]);
      return;
    }

    setRecentlyViewed([]);
    lastFetchedUserId.current = null;

    const { error } = await supabase
      .from("recently_viewed_cocktails")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Error clearing history:", error);
      loadRecentlyViewed(user.id);
    }
  }, [isAuthenticated, user, supabase, loadRecentlyViewed]);

  return {
    recentlyViewed,
    isLoading,
    recordView,
    clearHistory,
  };
}

/**
 * Record a cocktail view without loading the recently-viewed list.
 */
export function useRecordCocktailView() {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const supabase = getSupabaseClient();
  const recordedId = useRef<string | null>(null);

  const recordView = useCallback(
    async (cocktail: {
      id: string;
      name: string;
      slug?: string;
      imageUrl?: string;
    }) => {
      if (!cocktail.id) return;

      trackCocktailView(user?.id || null, cocktail.id, cocktail.name);

      if (authLoading || !isAuthenticated || !user) {
        recordGuestView(cocktail);
        return;
      }

      const viewKey = `${user.id}:${cocktail.id}`;
      if (recordedId.current === viewKey) return;
      recordedId.current = viewKey;

      const { error } = await supabase.rpc("upsert_recently_viewed", {
        p_user_id: user.id,
        p_cocktail_id: cocktail.id,
        p_cocktail_name: cocktail.name,
        p_cocktail_slug: cocktail.slug,
        p_cocktail_image_url: cocktail.imageUrl,
      });

      if (error) {
        console.error("Error recording view:", error);
        const { error: upsertError } = await supabase.from("recently_viewed_cocktails").upsert(
          {
            user_id: user.id,
            cocktail_id: cocktail.id,
            cocktail_name: cocktail.name,
            cocktail_slug: cocktail.slug,
            cocktail_image_url: cocktail.imageUrl,
            viewed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,cocktail_id" }
        );
        if (upsertError) {
          recordedId.current = null;
          console.error("Error recording view (upsert fallback):", upsertError);
        }
      }
    },
    [authLoading, isAuthenticated, user, supabase]
  );

  return recordView;
}
