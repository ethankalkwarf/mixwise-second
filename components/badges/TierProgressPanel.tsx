"use client";

import {
  MIXOLOGIST_TIERS,
  countTierBadges,
  getMixologistTier,
  getNextMixologistTier,
  getTierCountingBadges,
  isTierCountingBadge,
} from "@/lib/mixologistTiers";
import { BADGES } from "@/lib/badges";

type Props = {
  earnedIds: Set<string>;
  /** denser layout for native */
  compact?: boolean;
};

export function TierProgressPanel({ earnedIds, compact = false }: Props) {
  const earnedList = [...earnedIds];
  const progress = countTierBadges(earnedList);
  const tier = getMixologistTier(earnedList);
  const next = getNextMixologistTier(earnedList);
  const countingBadges = getTierCountingBadges();
  const totalCounting = countingBadges.length;
  const earnedCounting = countingBadges.filter((b) => earnedIds.has(b.id));
  const lockedCounting = countingBadges.filter((b) => !earnedIds.has(b.id));
  const toNext = next ? Math.max(0, next.minBadges - progress) : 0;

  const nextSuggestions = lockedCounting.slice(0, compact ? 3 : 6);

  return (
    <div
      className={
        compact
          ? "rounded-2xl border border-mist bg-white p-4"
          : "rounded-3xl border border-mist bg-white p-6 sm:p-7"
      }
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-sage">Your level</p>
      <p className={`mt-1 font-serif font-bold text-forest ${compact ? "text-xl" : "text-2xl"}`}>
        <span className="mr-1.5" aria-hidden>
          {tier.emoji}
        </span>
        {tier.name}
      </p>
      <p className="mt-1 text-sm text-sage">
        Levels come from collecting achievement badges — any badge counts except the automatic
        Mixologist / Master Mixologist milestones.
      </p>

      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-xs text-sage">
          <span>
            {progress} of {totalCounting} counting badges
          </span>
          {next && (
            <span className="text-olive">
              {toNext === 0
                ? next.name
                : `${toNext} more → ${next.name}`}
            </span>
          )}
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-mist">
          <div
            className="h-full rounded-full bg-olive transition-all"
            style={{
              width: `${Math.min(100, Math.round((progress / Math.max(next?.minBadges ?? totalCounting, 1)) * 100))}%`,
            }}
          />
        </div>
      </div>

      <ol className={`mt-5 grid gap-2 ${compact ? "grid-cols-1" : "sm:grid-cols-2"}`}>
        {MIXOLOGIST_TIERS.filter((t) => t.id !== "beginner").map((t) => {
          const reached = progress >= t.minBadges;
          const isCurrent = t.id === tier.id;
          return (
            <li
              key={t.id}
              className={`flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${
                isCurrent
                  ? "bg-olive/10 text-forest"
                  : reached
                    ? "text-forest"
                    : "text-sage"
              }`}
            >
              <span className="mt-0.5 tabular-nums font-semibold text-olive shrink-0">
                {t.minBadges}+
              </span>
              <span>
                <span className="font-semibold">{t.name}</span>
                <span className="block text-xs opacity-80">
                  {t.description}
                  {reached ? " · unlocked" : ""}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      {nextSuggestions.length > 0 && (
        <div className="mt-5 border-t border-mist/80 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-sage">
            Badges that raise your level
          </p>
          <ul className="mt-2 space-y-2.5">
            {nextSuggestions.map((b) => (
              <li key={b.id} className="flex items-start gap-2.5 text-sm text-forest">
                <span className="mt-0.5 shrink-0" aria-hidden>
                  {b.icon}
                </span>
                <span className="min-w-0">
                  <span className="block font-medium leading-snug">{b.name}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-sage">{b.criteria}</span>
                </span>
              </li>
            ))}
          </ul>
          {lockedCounting.length > nextSuggestions.length && (
            <p className="mt-2 text-xs text-sage">
              +{lockedCounting.length - nextSuggestions.length} more below in the gallery
            </p>
          )}
        </div>
      )}

      {earnedCounting.some((b) => isTierCountingBadge(b.id)) && !compact && (
        <p className="mt-4 text-xs text-sage">
          Milestone badges ({BADGES.mixologist.name}, {BADGES.master_mixologist.name}) unlock with
          your level and don&apos;t add extra progress.
        </p>
      )}
    </div>
  );
}
