"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useUser } from "@/components/auth/UserProvider";
import { getUserBadges, type UserBadge } from "@/lib/badgeEngine";
import { earnedBadgeDefinitions, getNextBadgeQuest } from "@/lib/mobile/badgeProgress";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useFavorites } from "@/hooks/useFavorites";

const BADGE_REFRESH_EVENT = "mixwise:badges-updated";

export function notifyBadgesUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BADGE_REFRESH_EVENT));
}

export function useUserBadges() {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const { ingredientIds } = useBarIngredients();
  const { favorites } = useFavorites();
  const [rows, setRows] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setRows([]);
      setIsLoading(false);
      return;
    }
    const supabase = getSupabaseClient();
    const data = await getUserBadges(supabase, user.id);
    setRows(data);
    setIsLoading(false);
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  useEffect(() => {
    const refresh = () => {
      void load();
    };
    window.addEventListener(BADGE_REFRESH_EVENT, refresh);
    return () => window.removeEventListener(BADGE_REFRESH_EVENT, refresh);
  }, [load]);

  const earned = useMemo(() => earnedBadgeDefinitions(rows), [rows]);
  const earnedIds = useMemo(() => new Set(rows.map((row) => row.badge_id)), [rows]);
  const nextQuest = useMemo(
    () =>
      getNextBadgeQuest({
        earnedIds,
        barCount: ingredientIds.length,
        favoriteCount: favorites.length,
      }),
    [earnedIds, ingredientIds.length, favorites.length]
  );

  return {
    rows,
    earned,
    earnedIds,
    nextQuest,
    isLoading,
    refresh: load,
  };
}
