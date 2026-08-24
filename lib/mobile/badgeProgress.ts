import { BADGES, type BadgeDefinition } from "@/lib/badges";
import type { UserBadge } from "@/lib/badgeEngine";

export type NextBadgeQuest = {
  badge: BadgeDefinition;
  current: number;
  target: number;
  remaining: number;
  href: string;
  cta: string;
};

const NATIVE_QUESTS: Array<{
  id: string;
  target: number;
  href: string;
  cta: string;
  progress: (ctx: { barCount: number; favoriteCount: number }) => number;
}> = [
  // Soft first quest after getting started — save a few drinks, then stock the bar.
  {
    id: "starter_mixer",
    target: 3,
    href: "/cocktails",
    cta: "Save a drink",
    progress: (ctx) => ctx.favoriteCount,
  },
  {
    id: "bar_builder",
    target: 10,
    href: "/mix?shelf=1",
    cta: "Add bottles",
    progress: (ctx) => ctx.barCount,
  },
  {
    id: "well_stocked",
    target: 25,
    href: "/mix?shelf=1",
    cta: "Keep stocking",
    progress: (ctx) => ctx.barCount,
  },
  {
    id: "cocktail_enthusiast",
    target: 10,
    href: "/cocktails",
    cta: "Save more",
    progress: (ctx) => ctx.favoriteCount,
  },
];

export function getNextBadgeQuest({
  earnedIds,
  barCount,
  favoriteCount,
}: {
  earnedIds: Set<string>;
  barCount: number;
  favoriteCount: number;
}): NextBadgeQuest | null {
  for (const quest of NATIVE_QUESTS) {
    if (earnedIds.has(quest.id)) continue;
    const current = Math.min(quest.progress({ barCount, favoriteCount }), quest.target);
    const badge = BADGES[quest.id];
    if (!badge) continue;
    return {
      badge,
      current,
      target: quest.target,
      remaining: Math.max(0, quest.target - current),
      href: quest.href,
      cta: quest.cta,
    };
  }
  return null;
}

export function earnedBadgeDefinitions(rows: UserBadge[]): BadgeDefinition[] {
  return rows
    .map((row) => BADGES[row.badge_id])
    .filter((badge): badge is BadgeDefinition => Boolean(badge));
}
