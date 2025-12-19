"use client";

import { useState, useEffect, useCallback } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useUser } from "@/components/auth/UserProvider";
import { UserPreferences } from "@/lib/supabase/database.types";

/**
 * Hook to manage user preferences
 * 
 * IMPORTANT: Uses the shared Supabase client from SessionContext
 * to ensure session cookies are properly synced after login.
 */
export function useUserPreferences() {
  const { user, isAuthenticated } = useUser();
  const { supabaseClient: supabase } = useSessionContext();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Only redirect to onboarding if we explicitly know the user hasn't completed it
  // This prevents redirecting users who have completed onboarding but whose preferences fail to load
  const needsOnboarding = isAuthenticated && !isLoading && preferences && !preferences.onboarding_completed;

  return {
    preferences,
    isLoading,
    needsOnboarding,
    updatePreferences,
    refreshPreferences: fetchPreferences,
  };
}

