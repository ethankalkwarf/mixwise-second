"use client";

import { BADGE_LIST, RARITY_COLORS, type BadgeDefinition } from "@/lib/badges";

export type BadgeDisplayItem = BadgeDefinition & {
  locked: boolean;
  earnedAt?: string;
};

const CATEGORY_LABELS: Record<BadgeDefinition["category"], string> = {
  milestone: "Milestones",
  exploration: "Exploration",
  social: "Social",
  mastery: "Learn & mastery",
};

type Props = {
  badges: BadgeDisplayItem[];
  groupByCategory?: boolean;
};

function BadgeTile({ badge }: { badge: BadgeDisplayItem }) {
  return (
    <div
      className={`relative flex flex-col items-center rounded-2xl border border-mist/80 bg-white p-3 text-center ${
        badge.locked ? "opacity-70" : ""
      }`}
    >
      <div
        className={`mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br text-xl shadow-sm ${
          badge.locked ? "from-stone-300 to-stone-400" : RARITY_COLORS[badge.rarity]
        }`}
      >
        {badge.icon}
      </div>
      <p className={`text-xs font-semibold leading-tight ${badge.locked ? "text-sage" : "text-forest"}`}>
        {badge.name}
      </p>
      <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-sage">{badge.criteria}</p>
      {badge.locked ? (
        <span className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-sage/70">Locked</span>
      ) : badge.earnedAt ? (
        <span className="mt-1.5 text-[10px] text-olive">
          {new Date(badge.earnedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      ) : null}
    </div>
  );
}

export function BadgeGalleryGrid({ badges, groupByCategory = true }: Props) {
  if (!groupByCategory) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {badges.map((badge) => (
          <BadgeTile key={badge.id} badge={badge} />
        ))}
      </div>
    );
  }

  const categories = [...new Set(badges.map((b) => b.category))];

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const items = badges.filter((b) => b.category === category);
        if (items.length === 0) return null;
        return (
          <section key={category}>
            <h2 className="mb-3 font-display text-lg font-bold text-forest">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {items.map((badge) => (
                <BadgeTile key={badge.id} badge={badge} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function buildBadgeDisplayList(earnedIds: Set<string>, earnedTimes?: Map<string, string>): BadgeDisplayItem[] {
  return BADGE_LIST.map((badge) => ({
    ...badge,
    locked: !earnedIds.has(badge.id),
    earnedAt: earnedTimes?.get(badge.id),
  }));
}
