"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { useToast } from "@/components/ui/toast";

interface RatingData {
  averageRating: number;
  totalRatings: number;
  userRating: number | null;
}

interface UseRatingsResult {
  rating: RatingData;
  isLoading: boolean;
  setRating: (rating: number) => Promise<void>;
  removeRating: () => Promise<void>;
}

export function useRatings(cocktailId: string): UseRatingsResult {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const { openAuthDialog } = useAuthDialog();
  const toast = useToast();
  const [rating, setRatingState] = useState<RatingData>({
    averageRating: 0,
    totalRatings: 0,
    userRating: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClient();

  // Load ratings
  const loadRatings = useCallback(async () => {
    // Get average rating
    const { data: avgData } = await supabase
      .from("ratings")
      .select("rating")
      .eq("cocktail_id", cocktailId);
    
    let averageRating = 0;
    let totalRatings = 0;
    
    if (avgData && avgData.length > 0) {
      totalRatings = avgData.length;
      averageRating = avgData.reduce((sum, r) => sum + r.rating, 0) / totalRatings;
    }
    
    // Get user's rating if authenticated
    let userRating = null;
    if (user) {
      const { data: userData } = await supabase
        .from("ratings")
        .select("rating")
        .eq("cocktail_id", cocktailId)
        .eq("user_id", user.id)
        .single();
      
      if (userData) {
        userRating = userData.rating;
      }
    }
    
    setRatingState({
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
      userRating,
    });
  }, [cocktailId, user, supabase]);

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      if (authLoading) return;
      
      setIsLoading(true);
      await loadRatings();
      setIsLoading(false);
    };
    
    initialize();
  }, [authLoading, loadRatings]);

  // Set rating
  const setRating = useCallback(async (newRating: number) => {
    if (!isAuthenticated || !user) {
      openAuthDialog({
        mode: "signup",
        title: "Rate this cocktail",
        subtitle: "Log in or create a free account to rate cocktails and see personalized recommendations.",
      });
      return;
    }
    
    // Validate rating
    if (newRating < 1 || newRating > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }
    
    // Optimistic update
    const previousRating = rating;
    const isNewRating = rating.userRating === null;
    
    setRatingState(prev => ({
      ...prev,
      userRating: newRating,
      totalRatings: isNewRating ? prev.totalRatings + 1 : prev.totalRatings,
      // Recalculate average (approximate)
      averageRating: isNewRating
        ? (prev.averageRating * prev.totalRatings + newRating) / (prev.totalRatings + 1)
        : prev.averageRating,
    }));
    
    // Save to server
    const { error } = await supabase
      .from("ratings")
      .upsert({
        user_id: user.id,
        cocktail_id: cocktailId,
        rating: newRating,
      }, {
        onConflict: "user_id,cocktail_id",
      });
    
    if (error) {
      console.error("Error saving rating:", error);
      toast.error("Failed to save rating");
      setRatingState(previousRating);
      return;
    }
    
    // Reload to get accurate average
    await loadRatings();
    toast.success("Rating saved!");
  }, [isAuthenticated, user, rating, cocktailId, openAuthDialog, supabase, loadRatings, toast]);

  // Remove rating
  const removeRating = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    const previousRating = rating;
    
    // Optimistic update
    setRatingState(prev => ({
      ...prev,
      userRating: null,
      totalRatings: prev.totalRatings - 1,
    }));
    
    const { error } = await supabase
      .from("ratings")
      .delete()
      .eq("user_id", user.id)
      .eq("cocktail_id", cocktailId);
    
    if (error) {
      console.error("Error removing rating:", error);
      toast.error("Failed to remove rating");
      setRatingState(previousRating);
      return;
    }
    
    await loadRatings();
    toast.info("Rating removed");
  }, [isAuthenticated, user, rating, cocktailId, supabase, loadRatings, toast]);

  return {
    rating,
    isLoading,
    setRating,
    removeRating,
  };
}

