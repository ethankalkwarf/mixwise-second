"use client";

import { useMemo, type ReactNode } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { AppLink } from "@/components/mobile/AppLink";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { usePreferredAuthMode } from "@/lib/auth/returning-user";
import { useUserBadges } from "@/hooks/useUserBadges";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useFavorites } from "@/hooks/useFavorites";
import { getNextBadgeQuest } from "@/lib/mobile/badgeProgress";
import { BADGE_LIST, type BadgeDefinition } from "@/lib/badges";
import { getMixologistTier, getNextMixologistTier } from "@/lib/mixologistTiers";

type Props = {
  compact?: boolean;
  /** Home: quest only, no emoji strip. */
  hidePreview?: boolean;
};

/**
 * Home / Saved badge progress — matches other native home sections.
 */
export function NativeBadgeProgressCard({ compact = false, hidePreview = false }: Props) {
  const { isAuthenticated, isLoading: authLoading } = useUser();
  const { openAuthDialog } = useAuthDialog();
  const preferredAuthMode = usePreferredAuthMode();
  const { ingredientIds } = useBarIngredients();
  const { favorites } = useFavorites();
  const { earnedIds, earned, rows, nextQuest, isLoading } = useUserBadges();

  const guestQuest = getNextBadgeQuest({
    earnedIds: new Set(),
    barCount: ingredientIds.length,
    favoriteCount: favorites.length,
  });

  const quest = isAuthenticated ? nextQuest : guestQuest;
  const earnedCount = isAuthenticated ? earned.length : 0;
  const previewEarnedIds = isAuthenticated ? earnedIds : new Set<string>();

  const previewBadges = useMemo(() => BADGE_LIST.slice(0, 8), []);

  const showcaseBadges = useMemo(() => {
    if (!isAuthenticated || rows.length === 0) return [] as BadgeDefinition[];
    const byId = new Map(earned.map((badge) => [badge.id, badge]));
    const ordered = [...rows]
      .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
      .map((row) => byId.get(row.badge_id))
      .filter((badge): badge is BadgeDefinition => Boolean(badge));
    return ordered.slice(0, 7);
  }, [earned, isAuthenticated, rows]);

  const tier = useMemo(
    () => getMixologistTier(isAuthenticated ? [...earnedIds] : []),
    [earnedIds, isAuthenticated]
  );
  const nextTier = useMemo(
    () => getNextMixologistTier(isAuthenticated ? [...earnedIds] : []),
    [earnedIds, isAuthenticated]
  );

  if (authLoading) return null;
  if (isLoading && isAuthenticated) return null;
  if (!quest && earnedCount === 0) return null;

  const pct = quest ? Math.min(100, Math.round((quest.current / quest.target) * 100)) : 100;
  const margin = compact ? "mb-5" : "mb-10";

  return (
    <section className={margin}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
            Your shelf
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-forest">Badges</h2>
        </div>
        <AppLink
          href="/badges"
          className="shrink-0 pb-0.5 text-xs font-semibold tabular-nums text-terracotta"
        >
          {earnedCount}/{BADGE_LIST.length}
        </AppLink>
      </div>

      {!hidePreview ? (
        <AppLink
          href="/badges"
          className="native-card-link mb-4 flex flex-row gap-2 overflow-x-auto overscroll-x-contain pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="View all badges"
        >
          {previewBadges.map((badge) => {
            const unlocked = previewEarnedIds.has(badge.id);
            return (
              <span
                key={badge.id}
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-base ${
                  unlocked ? "bg-cream" : "bg-mist/60 opacity-50 grayscale"
                }`}
                aria-hidden
              >
                {badge.icon}
              </span>
            );
          })}
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-mist/50 text-xs font-semibold text-sage">
            +{BADGE_LIST.length - previewBadges.length}
          </span>
        </AppLink>
      ) : null}

      {quest ? (
        <QuestBoard
          quest={quest}
          pct={pct}
          href={quest.href}
          secondaryAction={
            isAuthenticated ? null : (
              <button
                type="button"
                onClick={() =>
                  openAuthDialog({
                    mode: preferredAuthMode,
                    title: "Save your progress",
                    subtitle: "Create a free account to earn badges and keep your bar in sync.",
                  })
                }
                className="text-left text-xs font-semibold text-terracotta"
              >
                Join free to keep progress
              </button>
            )
          }
        />
      ) : (
        <CollectionBoard
          earnedCount={earnedCount}
          total={BADGE_LIST.length}
          tierName={tier.name}
          tierEmoji={tier.emoji}
          nextTierName={nextTier?.name ?? null}
          badges={showcaseBadges}
        />
      )}
    </section>
  );
}

function CollectionBoard({
  earnedCount,
  total,
  tierName,
  tierEmoji,
  nextTierName,
  badges,
}: {
  earnedCount: number;
  total: number;
  tierName: string;
  tierEmoji: string;
  nextTierName: string | null;
  badges: BadgeDefinition[];
}) {
  const complete = earnedCount >= total;
  const overflow = Math.max(0, earnedCount - badges.length);

  return (
    <AppLink
      href="/badges"
      className="native-card-link block overflow-hidden rounded-2xl bg-white shadow-sm"
    >
      <div className="flex items-center gap-3 px-4 py-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream text-2xl"
          aria-hidden
        >
          {tierEmoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-tight text-forest">{tierName}</p>
          <p className="mt-0.5 text-xs leading-snug text-sage">
            {complete
              ? `All ${total} badges earned`
              : nextTierName
                ? `${earnedCount} of ${total} · Next: ${nextTierName}`
                : `${earnedCount} of ${total} badges`}
          </p>
        </div>
        <ChevronRightIcon className="h-4 w-4 shrink-0 text-sage/60" aria-hidden />
      </div>

      {badges.length > 0 ? (
        <div
          className="flex items-center gap-2 border-t border-mist/70 px-4 py-3"
          aria-hidden
        >
          {badges.map((badge) => (
            <span
              key={badge.id}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream text-base"
              title={badge.name}
            >
              {badge.icon}
            </span>
          ))}
          {overflow > 0 ? (
            <span className="px-1 text-xs font-semibold tabular-nums text-sage">+{overflow}</span>
          ) : null}
        </div>
      ) : null}
    </AppLink>
  );
}

function QuestBoard({
  quest,
  pct,
  href,
  secondaryAction,
}: {
  quest: NonNullable<ReturnType<typeof getNextBadgeQuest>>;
  pct: number;
  href: string;
  secondaryAction?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <AppLink href={href} className="native-card-link block px-4 py-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
          Up next
        </p>
        <div className="mt-2 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-xl font-bold leading-tight text-forest">
              {quest.badge.name}
            </h3>
            <p className="mt-1 text-sm leading-snug text-sage">{quest.cta}</p>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cream text-xl">
            {quest.badge.icon}
          </span>
        </div>

        <div className="mt-4 h-1 overflow-hidden rounded-full bg-mist">
          <div
            className="h-full rounded-full bg-terracotta transition-all duration-500"
            style={{ width: `${Math.max(pct, pct > 0 ? 4 : 0)}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-medium tabular-nums text-sage">
          {quest.current} of {quest.target}
        </p>
      </AppLink>

      {secondaryAction ? (
        <div className="border-t border-mist/70 px-4 py-3">{secondaryAction}</div>
      ) : null}
    </div>
  );
}
