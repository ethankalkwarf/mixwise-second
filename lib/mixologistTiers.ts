/**
 * Public mixologist levels = how many achievement badges you've earned.
 *
 * Any badge counts toward your level EXCEPT the milestone badges
 * `mixologist` and `master_mixologist` — those are awarded automatically
 * when you hit the matching level, so they don't double-count.
 */

import { BADGE_LIST, type BadgeDefinition } from "@/lib/badges";

export type MixologistTierId =
  | "beginner"
  | "home_bartender"
  | "enthusiast"
  | "mixologist"
  | "master_mixologist";

export interface MixologistTier {
  id: MixologistTierId;
  name: string;
  /** Inclusive minimum counting-badge total to reach this level */
  minBadges: number;
  description: string;
  /** Shown next to the level name on public profiles */
  emoji: string;
}

/** Milestone badges awarded when you reach a level — do not count toward the total. */
export const TIER_MILESTONE_BADGE_IDS = new Set(["mixologist", "master_mixologist"]);

export const MIXOLOGIST_TIERS: MixologistTier[] = [
  {
    id: "beginner",
    name: "Beginner",
    minBadges: 0,
    description: "Just getting started behind the bar",
    emoji: "🌱",
  },
  {
    id: "home_bartender",
    name: "Home Bartender",
    minBadges: 1,
    description: "Earn any 1 achievement badge",
    emoji: "🏠",
  },
  {
    id: "enthusiast",
    name: "Cocktail Enthusiast",
    minBadges: 3,
    description: "Earn any 3 achievement badges",
    emoji: "🍸",
  },
  {
    id: "mixologist",
    name: "Mixologist",
    minBadges: 5,
    description: "Earn any 5 achievement badges",
    emoji: "🏆",
  },
  {
    id: "master_mixologist",
    name: "Master Mixologist",
    minBadges: 10,
    description: "Earn any 10 achievement badges",
    emoji: "👑",
  },
];

export function isTierCountingBadge(badgeId: string): boolean {
  return !TIER_MILESTONE_BADGE_IDS.has(badgeId);
}

/** Badges that progress your public level. */
export function getTierCountingBadges(): BadgeDefinition[] {
  return BADGE_LIST.filter((b) => isTierCountingBadge(b.id));
}

export function countTierBadges(badgeIds: string[]): number {
  return badgeIds.filter((id) => isTierCountingBadge(id)).length;
}

export function getMixologistTier(badgeIdsOrCount: string[] | number): MixologistTier {
  const count =
    typeof badgeIdsOrCount === "number"
      ? badgeIdsOrCount
      : countTierBadges(badgeIdsOrCount);

  let current = MIXOLOGIST_TIERS[0];
  for (const tier of MIXOLOGIST_TIERS) {
    if (count >= tier.minBadges) {
      current = tier;
    }
  }
  return current;
}

export function getNextMixologistTier(
  badgeIdsOrCount: string[] | number
): MixologistTier | null {
  const current = getMixologistTier(badgeIdsOrCount);
  const idx = MIXOLOGIST_TIERS.findIndex((t) => t.id === current.id);
  return MIXOLOGIST_TIERS[idx + 1] ?? null;
}

/** Legacy alias used by older imports */
export const META_BADGE_IDS = TIER_MILESTONE_BADGE_IDS;
