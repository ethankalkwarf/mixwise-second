"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/components/auth/UserProvider";

export type FeaturedDrinkSlot = {
  cocktail_id: string;
  cocktail_name: string | null;
  cocktail_slug: string | null;
  cocktail_image_url: string | null;
  rank?: number;
};

type UseFeaturedDrinksResult = {
  slots: FeaturedDrinkSlot[];
  isLoading: boolean;
  isSaving: boolean;
  saveSlots: (slots: Array<FeaturedDrinkSlot | null>) => Promise<boolean>;
  refresh: () => Promise<void>;
};

export function useFeaturedDrinks(): UseFeaturedDrinksResult {
  const { isAuthenticated, isLoading: authLoading } = useUser();
  const [slots, setSlots] = useState<FeaturedDrinkSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setSlots([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/profile/featured-drinks");
      if (!res.ok) {
        setSlots([]);
        return;
      }
      const data = await res.json();
      setSlots(Array.isArray(data.slots) ? data.slots : []);
    } catch {
      setSlots([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;
    void refresh();
  }, [authLoading, refresh]);

  const saveSlots = useCallback(
    async (next: Array<FeaturedDrinkSlot | null>) => {
      if (!isAuthenticated) return false;
      setIsSaving(true);
      try {
        const res = await fetch("/api/profile/featured-drinks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slots: next }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        setSlots(Array.isArray(data.slots) ? data.slots : []);
        return true;
      } catch {
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [isAuthenticated]
  );

  return { slots, isLoading, isSaving, saveSlots, refresh };
}
