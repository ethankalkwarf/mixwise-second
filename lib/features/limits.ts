/**
 * Feature Limits Module
 * 
 * This module provides a foundation for implementing usage limits and quotas.
 * Currently, it allows all actions but provides hooks for future limit enforcement.
 * 
 * Future implementation might include:
 * - Free tier: Limited number of saved ingredients, favorites
 * - Paid tier: Unlimited access
 * - Admin tier: Full access
 */

import type { Profile } from "@/lib/supabase/database.types";

// Feature limits by role
const LIMITS = {
  free: {
    maxBarIngredients: 50,
    maxFavorites: 20,
    maxRecentlyViewed: 50,
  },
  paid: {
    maxBarIngredients: Infinity,
    maxFavorites: Infinity,
    maxRecentlyViewed: 100,
  },
  admin: {
    maxBarIngredients: Infinity,
    maxFavorites: Infinity,
    maxRecentlyViewed: Infinity,
  },
};

/**
 * Check if a user can add an ingredient to their bar.
 * 
 * @param profile - User profile (null for anonymous)
 * @param currentCount - Current number of bar ingredients
 * @returns Whether the action is allowed
 */
export function canAddIngredient(
  profile: Profile | null,
  currentCount: number
): boolean {
  // Anonymous users can always add locally
  if (!profile) return true;
  
  const role = profile.role || "free";
  const limit = LIMITS[role as keyof typeof LIMITS]?.maxBarIngredients || LIMITS.free.maxBarIngredients;
  
  // For now, always allow (no strict enforcement)
  // Future: return currentCount < limit;
  return true;
}

/**
 * Check if a user can favorite a cocktail.
 * 
 * @param profile - User profile (null for anonymous)
 * @param currentCount - Current number of favorites
 * @returns Whether the action is allowed
 */
export function canFavoriteCocktail(
  profile: Profile | null,
  currentCount: number
): boolean {
  // Anonymous users must sign in
  if (!profile) return false;
  
  const role = profile.role || "free";
  const limit = LIMITS[role as keyof typeof LIMITS]?.maxFavorites || LIMITS.free.maxFavorites;
  
  // For now, always allow (no strict enforcement)
  // Future: return currentCount < limit;
  return true;
}

/**
 * Get the limit for a specific feature based on role.
 * 
 * @param role - User role
 * @param feature - Feature name
 * @returns The limit value
 */
export function getLimit(
  role: "free" | "paid" | "admin",
  feature: keyof typeof LIMITS.free
): number {
  return LIMITS[role]?.[feature] || LIMITS.free[feature];
}

/**
 * Check if a user is at or near their limit for a feature.
 * Useful for showing upgrade prompts.
 * 
 * @param profile - User profile
 * @param feature - Feature name
 * @param currentCount - Current usage count
 * @returns Object with limit status
 */
export function checkLimitStatus(
  profile: Profile | null,
  feature: keyof typeof LIMITS.free,
  currentCount: number
): {
  isAtLimit: boolean;
  isNearLimit: boolean;
  remaining: number;
  limit: number;
} {
  if (!profile) {
    return {
      isAtLimit: false,
      isNearLimit: false,
      remaining: Infinity,
      limit: Infinity,
    };
  }
  
  const role = (profile.role || "free") as keyof typeof LIMITS;
  const limit = LIMITS[role]?.[feature] || LIMITS.free[feature];
  const remaining = Math.max(0, limit - currentCount);
  
  return {
    isAtLimit: currentCount >= limit,
    isNearLimit: remaining <= 5 && remaining > 0,
    remaining,
    limit,
  };
}

/**
 * Feature usage tracking placeholder.
 * 
 * In the future, this would increment the usage counter in the database.
 * Currently just logs for debugging.
 * 
 * @param userId - User ID
 * @param feature - Feature name
 */
export async function trackFeatureUsage(
  userId: string,
  feature: string
): Promise<void> {
  // TODO: Implement actual tracking
  // Would call the increment_feature_usage RPC function
  console.log(`[Features] Tracking usage: ${feature} for user ${userId}`);
}

