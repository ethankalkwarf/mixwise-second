"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/auth/UserProvider";

export interface UserPreferences {
  id: string;
  user_id: string;
  preferred_spirits: string[];
  flavor_profiles: string[];
  skill_level: string;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useUserPreferences() {
  const { user, isAuthenticated } = useUser();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setPreferences(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching preferences:", error);
      }

      setPreferences(data || null);
    } catch (err) {
      console.error("Error fetching preferences:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      if (!user) return { error: "Not authenticated" };

      try {
        const { error } = await supabase
          .from("user_preferences")
          .upsert({
            user_id: user.id,
            ...updates,
          });

        if (error) throw error;

        await fetchPreferences();
        return { success: true };
      } catch (err) {
        console.error("Error updating preferences:", err);
        return { error: "Failed to update preferences" };
      }
    },
    [user, supabase, fetchPreferences]
  );

  const needsOnboarding = isAuthenticated && !isLoading && (!preferences || !preferences.onboarding_completed);

  return {
    preferences,
    isLoading,
    needsOnboarding,
    updatePreferences,
    refreshPreferences: fetchPreferences,
  };
}

