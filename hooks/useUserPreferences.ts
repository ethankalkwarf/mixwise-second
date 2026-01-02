"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useUser } from "@/components/auth/UserProvider";
import { UserPreferences } from "@/lib/supabase/database.types";

/**
 * Hook to manage user preferences
 * 
 * IMPORTANT: Uses the shared Supabase client from SessionContext
 * to ensure session cookies are properly synced after login.
 * 
 * CRITICAL FIX: Uses refs to prevent re-fetch loops when auth state updates
 */
export function useUserPreferences() {
  const { user, isAuthenticated } = useUser();
  const { supabaseClient: supabase } = useSessionContext();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track the last fetched user ID to prevent duplicate fetches
  const lastFetchedUserId = useRef<string | null>(null);
  const isFetching = useRef(false);

  const fetchPreferences = useCallback(async (userId: string) => {
    // Prevent duplicate fetches for the same user
    if (isFetching.current || lastFetchedUserId.current === userId) {
      return;
    }
    
    isFetching.current = true;

    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching preferences:", error);
        setError(error.message);
        setPreferences(null);
      } else {
        setError(null);
        setPreferences(data || null);
        lastFetchedUserId.current = userId;
      }
    } catch (err) {
      console.error("Error fetching preferences:", err);
      setError("Network error");
      setPreferences(null);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, [supabase]);

  // Only fetch when user ID changes, not on every user object change
  useEffect(() => {
    if (!user) {
      setPreferences(null);
      setError(null);
      setIsLoading(false);
      lastFetchedUserId.current = null;
      return;
    }
    
    // Only fetch if user ID changed
    if (lastFetchedUserId.current !== user.id) {
      fetchPreferences(user.id);
    } else {
      // User ID same, just ensure loading is false
      setIsLoading(false);
    }
  }, [user?.id, fetchPreferences]);

  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      if (!user) return { error: "Not authenticated" };

      console.log("Updating preferences for user:", user.id, "Updates:", updates);

      try {
        // First try to update existing row
        const { data: existing, error: selectError } = await supabase
          .from("user_preferences")
          .select("id")
          .eq("user_id", user.id)
          .single();

        console.log("Existing preferences check:", { existing, selectError });

        if (existing) {
          // Update existing row
          console.log("Updating existing preferences row");
          const { error } = await supabase
            .from("user_preferences")
            .update(updates)
            .eq("user_id", user.id);

          if (error) {
            console.error("Update error:", error);
            throw error;
          }
        } else {
          // Insert new row
          console.log("Inserting new preferences row");
          const { error } = await supabase
            .from("user_preferences")
            .insert({
              user_id: user.id,
              ...updates,
            });

          if (error) {
            console.error("Insert error:", error);
            throw error;
          }
        }

      // Refresh by clearing the last fetched user ID and re-fetching
      if (user) {
        lastFetchedUserId.current = null;
        await fetchPreferences(user.id);
      }
      return { success: true };
      } catch (err) {
        console.error("Error updating preferences:", err);
        return { error: "Failed to update preferences" };
      }
    },
    [user, supabase, fetchPreferences]
  );

  // Redirect to onboarding if:
  // 1. No preferences record exists (new user), OR
  // 2. Preferences exist but onboarding_completed is false/null
  // Don't redirect if preferences failed to load (assume user has completed onboarding)
  // Only redirect to onboarding if we successfully determined the user hasn't completed it
  // Don't redirect if preferences failed to load (assume user has completed onboarding)
  const needsOnboarding = isAuthenticated && !isLoading && !error && (preferences === null || !preferences.onboarding_completed);

  return {
    preferences,
    isLoading,
    error,
    needsOnboarding,
    updatePreferences,
    refreshPreferences: useCallback(() => {
      if (user) {
        lastFetchedUserId.current = null;
        return fetchPreferences(user.id);
      }
      return Promise.resolve();
    }, [user, fetchPreferences]),
  };
}

