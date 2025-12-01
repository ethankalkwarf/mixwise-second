/**
 * Badge Evaluation Engine
 * 
 * Evaluates user actions and awards badges accordingly.
 * This engine is called after specific user actions.
 */

import { createClient } from "@/lib/supabase/client";
import { BADGES, BadgeDefinition } from "./badges";

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  metadata?: Record<string, unknown>;
}

export interface BadgeCheckResult {
  awarded: BadgeDefinition[];
  alreadyHad: BadgeDefinition[];
}

/**
 * Awards a badge to a user if they don't already have it
 */
async function awardBadge(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  badgeId: string,
  metadata?: Record<string, unknown>
): Promise<boolean> {
  try {
    const { error } = await supabase.from("user_badges").upsert(
      {
        user_id: userId,
        badge_id: badgeId,
        metadata,
      },
      { onConflict: "user_id,badge_id" }
    );

    if (error) {
      console.error("Error awarding badge:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error awarding badge:", err);
    return false;
  }
}

/**
 * Gets all badges a user has earned
 */
export async function getUserBadges(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user badges:", error);
    return [];
  }

  return data || [];
}

/**
 * Checks and awards badges based on favorites count
 */
export async function checkFavoritesBadges(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  favoritesCount: number
): Promise<BadgeCheckResult> {
  const awarded: BadgeDefinition[] = [];
  const alreadyHad: BadgeDefinition[] = [];

  const existingBadges = await getUserBadges(supabase, userId);
  const existingBadgeIds = new Set(existingBadges.map((b) => b.badge_id));

  // Check starter_mixer (3 favorites)
  if (favoritesCount >= 3) {
    if (!existingBadgeIds.has("starter_mixer")) {
      if (await awardBadge(supabase, userId, "starter_mixer")) {
        awarded.push(BADGES.starter_mixer);
      }
    } else {
      alreadyHad.push(BADGES.starter_mixer);
    }
  }

  // Check cocktail_enthusiast (10 favorites)
  if (favoritesCount >= 10) {
    if (!existingBadgeIds.has("cocktail_enthusiast")) {
      if (await awardBadge(supabase, userId, "cocktail_enthusiast")) {
        awarded.push(BADGES.cocktail_enthusiast);
      }
    } else {
      alreadyHad.push(BADGES.cocktail_enthusiast);
    }
  }

  // Check for meta-badges
  await checkMetaBadges(supabase, userId, awarded);

  return { awarded, alreadyHad };
}

/**
 * Checks and awards badges based on bar ingredient count
 */
export async function checkBarBadges(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  ingredientCount: number
): Promise<BadgeCheckResult> {
  const awarded: BadgeDefinition[] = [];
  const alreadyHad: BadgeDefinition[] = [];

  const existingBadges = await getUserBadges(supabase, userId);
  const existingBadgeIds = new Set(existingBadges.map((b) => b.badge_id));

  // Check bar_builder (10 ingredients)
  if (ingredientCount >= 10) {
    if (!existingBadgeIds.has("bar_builder")) {
      if (await awardBadge(supabase, userId, "bar_builder")) {
        awarded.push(BADGES.bar_builder);
      }
    } else {
      alreadyHad.push(BADGES.bar_builder);
    }
  }

  // Check well_stocked (25 ingredients)
  if (ingredientCount >= 25) {
    if (!existingBadgeIds.has("well_stocked")) {
      if (await awardBadge(supabase, userId, "well_stocked")) {
        awarded.push(BADGES.well_stocked);
      }
    } else {
      alreadyHad.push(BADGES.well_stocked);
    }
  }

  // Check for meta-badges
  await checkMetaBadges(supabase, userId, awarded);

  return { awarded, alreadyHad };
}

/**
 * Checks and awards badges based on cocktail views by category/spirit
 */
export async function checkExplorationBadges(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  cocktailData: {
    primarySpirit?: string;
    categories?: string[];
  }
): Promise<BadgeCheckResult> {
  const awarded: BadgeDefinition[] = [];
  const alreadyHad: BadgeDefinition[] = [];

  const existingBadges = await getUserBadges(supabase, userId);
  const existingBadgeIds = new Set(existingBadges.map((b) => b.badge_id));

  // Get recently viewed cocktails to count by category/spirit
  const { data: recentViews } = await supabase
    .from("recently_viewed_cocktails")
    .select("cocktail_id")
    .eq("user_id", userId);

  const viewCount = recentViews?.length || 0;

  // Spirit master badges (checking based on primary spirit)
  const spiritBadgeMap: Record<string, string> = {
    gin: "spirit_master_gin",
    whiskey: "spirit_master_whiskey",
    bourbon: "spirit_master_whiskey",
    rum: "spirit_master_rum",
    vodka: "spirit_master_vodka",
    tequila: "spirit_master_tequila",
  };

  if (cocktailData.primarySpirit) {
    const spirit = cocktailData.primarySpirit.toLowerCase();
    const badgeId = spiritBadgeMap[spirit];

    if (badgeId && viewCount >= 5 && !existingBadgeIds.has(badgeId)) {
      if (await awardBadge(supabase, userId, badgeId)) {
        awarded.push(BADGES[badgeId]);
      }
    }
  }

  // Category badges
  if (cocktailData.categories?.includes("tiki") && viewCount >= 3) {
    if (!existingBadgeIds.has("tiki_explorer")) {
      if (await awardBadge(supabase, userId, "tiki_explorer")) {
        awarded.push(BADGES.tiki_explorer);
      }
    }
  }

  if (cocktailData.categories?.includes("classic") && viewCount >= 5) {
    if (!existingBadgeIds.has("classic_connoisseur")) {
      if (await awardBadge(supabase, userId, "classic_connoisseur")) {
        awarded.push(BADGES.classic_connoisseur);
      }
    }
  }

  // Check for meta-badges
  await checkMetaBadges(supabase, userId, awarded);

  return { awarded, alreadyHad };
}

/**
 * Awards sharing badges
 */
export async function awardSharingBadge(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  type: "cocktail" | "bar"
): Promise<BadgeCheckResult> {
  const awarded: BadgeDefinition[] = [];
  const alreadyHad: BadgeDefinition[] = [];

  const existingBadges = await getUserBadges(supabase, userId);
  const existingBadgeIds = new Set(existingBadges.map((b) => b.badge_id));

  if (type === "cocktail") {
    if (!existingBadgeIds.has("sharer")) {
      if (await awardBadge(supabase, userId, "sharer")) {
        awarded.push(BADGES.sharer);
      }
    } else {
      alreadyHad.push(BADGES.sharer);
    }
  }

  if (type === "bar") {
    if (!existingBadgeIds.has("bar_host")) {
      if (await awardBadge(supabase, userId, "bar_host")) {
        awarded.push(BADGES.bar_host);
      }
    } else {
      alreadyHad.push(BADGES.bar_host);
    }
  }

  // Check for meta-badges
  await checkMetaBadges(supabase, userId, awarded);

  return { awarded, alreadyHad };
}

/**
 * Checks and awards meta-badges (mixologist, master_mixologist)
 */
async function checkMetaBadges(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  newlyAwarded: BadgeDefinition[]
): Promise<void> {
  const existingBadges = await getUserBadges(supabase, userId);
  const totalBadges = existingBadges.length + newlyAwarded.length;
  const existingBadgeIds = new Set(existingBadges.map((b) => b.badge_id));

  // Check mixologist (5 badges)
  if (totalBadges >= 5 && !existingBadgeIds.has("mixologist")) {
    if (await awardBadge(supabase, userId, "mixologist")) {
      newlyAwarded.push(BADGES.mixologist);
    }
  }

  // Check master_mixologist (10 badges)
  if (totalBadges >= 10 && !existingBadgeIds.has("master_mixologist")) {
    if (await awardBadge(supabase, userId, "master_mixologist")) {
      newlyAwarded.push(BADGES.master_mixologist);
    }
  }
}




