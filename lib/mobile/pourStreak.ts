"use client";

const POUR_DATES_KEY = "mixwise-pour-dates";
/** Per-cocktail mix ledger: slug → ISO date (YYYY-MM-DD) of last mix. */
const MIXED_SLUGS_KEY = "mixwise-mixed-slugs";
export const POUR_STREAK_EVENT = "mixwise:pour-streak";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadPourDates(): string[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(POUR_DATES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((d) => typeof d === "string") : [];
  } catch {
    return [];
  }
}

function savePourDates(dates: string[]): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(POUR_DATES_KEY, JSON.stringify(dates.slice(-60)));
  } catch {
    /* ignore */
  }
}

function loadMixedSlugs(): Record<string, string> {
  if (!canUseStorage()) return {};
  try {
    const raw = localStorage.getItem(MIXED_SLUGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [slug, date] of Object.entries(parsed)) {
      if (typeof slug === "string" && typeof date === "string") out[slug] = date;
    }
    return out;
  } catch {
    return {};
  }
}

function saveMixedSlugs(map: Record<string, string>): void {
  if (!canUseStorage()) return;
  try {
    // Keep the most recent ~200 mixes so storage stays bounded
    const entries = Object.entries(map).sort((a, b) => b[1].localeCompare(a[1]));
    localStorage.setItem(
      MIXED_SLUGS_KEY,
      JSON.stringify(Object.fromEntries(entries.slice(0, 200)))
    );
  } catch {
    /* ignore */
  }
}

function computeStreak(sortedUniqueDates: string[]): number {
  if (sortedUniqueDates.length === 0) return 0;
  const today = todayKey();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  const latest = sortedUniqueDates[sortedUniqueDates.length - 1]!;
  if (latest !== today && latest !== yesterdayKey) return 0;

  let streak = 1;
  for (let i = sortedUniqueDates.length - 2; i >= 0; i--) {
    const current = new Date(`${sortedUniqueDates[i + 1]}T12:00:00`);
    const prev = new Date(`${sortedUniqueDates[i]}T12:00:00`);
    const diffDays = Math.round((current.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getPourStreak(): number {
  const dates = [...new Set(loadPourDates())].sort();
  return computeStreak(dates);
}

/** True if this cocktail was marked mixed (any day). */
export function hasMixedCocktail(slug: string): boolean {
  if (!slug) return false;
  return Boolean(loadMixedSlugs()[slug]);
}

/**
 * Record that the user mixed this cocktail.
 * Streak still advances once per calendar day; mix state is per-slug.
 */
export function markDrinkMade(slug: string): {
  streak: number;
  isNewToday: boolean;
  isNewForCocktail: boolean;
} {
  const today = todayKey();
  const dates = [...new Set(loadPourDates())].sort();
  const isNewToday = !dates.includes(today);
  if (isNewToday) {
    dates.push(today);
    savePourDates(dates);
  }

  const mixed = loadMixedSlugs();
  const isNewForCocktail = mixed[slug] !== today;
  mixed[slug] = today;
  saveMixedSlugs(mixed);

  const streak = computeStreak(dates);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(POUR_STREAK_EVENT, { detail: { streak } }));
    if (isNewToday) {
      void import("@/lib/analytics").then(({ trackPourStreakUpdated }) => {
        void trackPourStreakUpdated(streak);
      });
    }
  }
  return { streak, isNewToday, isNewForCocktail };
}

/** @deprecated Prefer hasMixedCocktail(slug) — this was global “any pour today”. */
export function madeDrinkToday(): boolean {
  return loadPourDates().includes(todayKey());
}
