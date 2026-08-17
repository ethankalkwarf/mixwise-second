"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { useToast } from "@/components/ui/toast";
import type { CocktailSkip } from "@/lib/supabase/database.types";

export type SkipCocktailInput = {
  id: string;
  name: string;
  slug?: string;
  imageUrl?: string;
};

interface UseCocktailSkipsResult {
  skips: CocktailSkip[];
  skipIds: Set<string>;
  isLoading: boolean;
  isSkipped: (cocktailId: string) => boolean;
  getSkip: (cocktailId: string) => CocktailSkip | undefined;
  skipCocktail: (cocktail: SkipCocktailInput, notes?: string | null) => Promise<boolean>;
  unskipCocktail: (cocktailId: string) => Promise<boolean>;
  updateSkipNotes: (cocktailId: string, notes: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

/**
 * Private "won't make again" list for authenticated users.
 * Anonymous users are prompted to sign in.
 */
export function useCocktailSkips(): UseCocktailSkipsResult {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const supabase = getSupabaseClient();
  const { openAuthDialog } = useAuthDialog();
  const toast = useToast();
  const [skips, setSkips] = useState<CocktailSkip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const lastFetchedUserId = useRef<string | null>(null);
  const isFetching = useRef(false);

  const skipIds = useMemo(
    () => new Set(skips.map((skip) => skip.cocktail_id)),
    [skips]
  );

  const loadSkips = useCallback(
    async (userId: string) => {
      if (isFetching.current) return;
      isFetching.current = true;

      const { data, error } = await supabase
        .from("cocktail_skips")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading cocktail skips:", error);
      } else {
        setSkips(data || []);
        lastFetchedUserId.current = userId;
      }

      isFetching.current = false;
    },
    [supabase]
  );

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      setSkips([]);
      setIsLoading(false);
      lastFetchedUserId.current = null;
      return;
    }

    if (lastFetchedUserId.current !== user.id) {
      setIsLoading(true);
      loadSkips(user.id).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, user?.id, loadSkips]);

  const isSkipped = useCallback(
    (cocktailId: string) => skipIds.has(cocktailId),
    [skipIds]
  );

  const getSkip = useCallback(
    (cocktailId: string) => skips.find((skip) => skip.cocktail_id === cocktailId),
    [skips]
  );

  const requireAuth = useCallback(() => {
    if (isAuthenticated && user) return true;
    openAuthDialog({
      title: "Skip drinks you won't make",
      subtitle:
        "Log in or create a free account to hide drinks from Mix and keep private notes.",
    });
    return false;
  }, [isAuthenticated, user, openAuthDialog]);

  const skipCocktail = useCallback(
    async (cocktail: SkipCocktailInput, notes?: string | null) => {
      if (!requireAuth() || !user) return false;

      const trimmedNotes = notes?.trim() || null;
      const now = new Date().toISOString();
      const existing = skips.find((skip) => skip.cocktail_id === cocktail.id);

      const optimistic: CocktailSkip = existing
        ? { ...existing, notes: trimmedNotes, updated_at: now }
        : {
            id: -Date.now(),
            user_id: user.id,
            cocktail_id: cocktail.id,
            cocktail_name: cocktail.name,
            cocktail_slug: cocktail.slug || null,
            cocktail_image_url: cocktail.imageUrl || null,
            notes: trimmedNotes,
            created_at: now,
            updated_at: now,
          };

      setSkips((prev) => [
        optimistic,
        ...prev.filter((skip) => skip.cocktail_id !== cocktail.id),
      ]);

      const { data, error } = await supabase
        .from("cocktail_skips")
        .upsert(
          {
            user_id: user.id,
            cocktail_id: cocktail.id,
            cocktail_name: cocktail.name,
            cocktail_slug: cocktail.slug,
            cocktail_image_url: cocktail.imageUrl,
            notes: trimmedNotes,
            updated_at: now,
          },
          { onConflict: "user_id,cocktail_id" }
        )
        .select()
        .single();

      if (error) {
        console.error("Error skipping cocktail:", error);
        toast.error("Failed to skip this drink");
        lastFetchedUserId.current = null;
        await loadSkips(user.id);
        return false;
      }

      if (data) {
        setSkips((prev) => [
          data,
          ...prev.filter((skip) => skip.cocktail_id !== cocktail.id),
        ]);
      }

      if (!existing) {
        toast.info("Won't recommend this again");
      } else {
        toast.success("Note saved");
      }
      return true;
    },
    [requireAuth, user, skips, supabase, toast, loadSkips]
  );

  const unskipCocktail = useCallback(
    async (cocktailId: string) => {
      if (!requireAuth() || !user) return false;

      const previous = skips;
      setSkips((prev) => prev.filter((skip) => skip.cocktail_id !== cocktailId));

      const { error } = await supabase
        .from("cocktail_skips")
        .delete()
        .eq("user_id", user.id)
        .eq("cocktail_id", cocktailId);

      if (error) {
        console.error("Error restoring cocktail skip:", error);
        toast.error("Failed to restore this drink");
        setSkips(previous);
        return false;
      }

      toast.success("We'll recommend this again");
      return true;
    },
    [requireAuth, user, skips, supabase, toast]
  );

  const updateSkipNotes = useCallback(
    async (cocktailId: string, notes: string) => {
      if (!requireAuth() || !user) return false;

      const trimmedNotes = notes.trim() || null;
      const now = new Date().toISOString();

      setSkips((prev) =>
        prev.map((skip) =>
          skip.cocktail_id === cocktailId
            ? { ...skip, notes: trimmedNotes, updated_at: now }
            : skip
        )
      );

      const { error } = await supabase
        .from("cocktail_skips")
        .update({ notes: trimmedNotes, updated_at: now })
        .eq("user_id", user.id)
        .eq("cocktail_id", cocktailId);

      if (error) {
        console.error("Error updating skip notes:", error);
        toast.error("Failed to save note");
        lastFetchedUserId.current = null;
        await loadSkips(user.id);
        return false;
      }

      toast.success("Note saved");
      return true;
    },
    [requireAuth, user, supabase, toast, loadSkips]
  );

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    lastFetchedUserId.current = null;
    setIsLoading(true);
    await loadSkips(user.id);
    setIsLoading(false);
  }, [isAuthenticated, user, loadSkips]);

  return {
    skips,
    skipIds,
    isLoading,
    isSkipped,
    getSkip,
    skipCocktail,
    unskipCocktail,
    updateSkipNotes,
    refresh,
  };
}
