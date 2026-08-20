import { formatCocktailName } from "@/lib/formatters";
import { getCurrentLocalDateString } from "@/lib/dailyCocktail";
import { seededRandom } from "@/lib/randomization";

export type DailyDrinkContext = {
  name: string;
  slug: string;
  dateKey?: string;
  baseSpirit?: string | null;
  categories?: string[];
  shortDescription?: string | null;
};

export type CabinetNotificationContext = {
  cabinetReadyCount?: number;
  canMakeTonight?: boolean;
};

export type NotificationCopy = {
  title: string;
  body: string;
};

type Variant = {
  match?: (ctx: DailyDrinkContext) => boolean;
  title: (ctx: DailyDrinkContext) => string;
  body: (ctx: DailyDrinkContext) => string;
};

function displayName(ctx: DailyDrinkContext): string {
  return formatCocktailName(ctx.name);
}

function utcDay(dateKey: string): number {
  return new Date(`${dateKey}T12:00:00.000Z`).getUTCDay();
}

function spirit(ctx: DailyDrinkContext): string {
  return (ctx.baseSpirit || "").toLowerCase();
}

function hasCategory(ctx: DailyDrinkContext, ...tokens: string[]): boolean {
  const bag = (ctx.categories || []).map((c) => c.toLowerCase());
  return tokens.some((t) => bag.some((c) => c.includes(t)));
}

function hasSpirit(ctx: DailyDrinkContext, ...tokens: string[]): boolean {
  const s = spirit(ctx);
  return tokens.some((t) => s.includes(t));
}

const VARIANTS: Variant[] = [
  {
    match: (ctx) => utcDay(ctx.dateKey || "") === 1,
    title: () => "Monday, but make it a cocktail",
    body: (ctx) => `Soft launch the week with a ${displayName(ctx)}.`,
  },
  {
    match: (ctx) => utcDay(ctx.dateKey || "") === 2,
    title: () => "No reason needed",
    body: (ctx) => `Pour a ${displayName(ctx)} tonight.`,
  },
  {
    match: (ctx) => utcDay(ctx.dateKey || "") === 3,
    title: () => "Hump day helper",
    body: (ctx) => `Midweek treat: shake (or stir) a ${displayName(ctx)}.`,
  },
  {
    match: (ctx) => utcDay(ctx.dateKey || "") === 4,
    title: () => "Almost Friday",
    body: (ctx) => `Pre-game with a ${displayName(ctx)}. You've got this.`,
  },
  {
    match: (ctx) => utcDay(ctx.dateKey || "") === 4,
    title: () => "Thirsty Thursday",
    body: (ctx) => `Thursday calls for a ${displayName(ctx)}.`,
  },
  {
    match: (ctx) => utcDay(ctx.dateKey || "") === 5,
    title: () => "Friday's here 🍹",
    body: (ctx) => `Celebrate with a ${displayName(ctx)}. You earned it.`,
  },
  {
    match: (ctx) => utcDay(ctx.dateKey || "") === 6,
    title: () => "Weekend mode: on",
    body: (ctx) => `Saturday plans? Start with a ${displayName(ctx)}.`,
  },
  {
    match: (ctx) => utcDay(ctx.dateKey || "") === 0,
    title: () => "Sunday slow pour",
    body: (ctx) => `Easy does it — today's pick is a ${displayName(ctx)}.`,
  },
  {
    match: (ctx) => hasSpirit(ctx, "gin"),
    title: () => "Something gin-forward",
    body: (ctx) => `Botanical hour: the ${displayName(ctx)} is today's pick.`,
  },
  {
    match: (ctx) => hasSpirit(ctx, "whiskey", "bourbon", "rye", "scotch"),
    title: () => "Whiskey weather",
    body: (ctx) => `Pour a ${displayName(ctx)} — today's featured serve.`,
  },
  {
    match: (ctx) => hasSpirit(ctx, "rum"),
    title: () => "Rum run",
    body: (ctx) => `Island energy without the flight: make a ${displayName(ctx)}.`,
  },
  {
    match: (ctx) => hasSpirit(ctx, "tequila", "mezcal"),
    title: () => "Agave alert",
    body: (ctx) => `Lime probably involved. Today's pick: ${displayName(ctx)}.`,
  },
  {
    match: (ctx) => hasSpirit(ctx, "vodka"),
    title: () => "Clean and cold",
    body: (ctx) => `Today's spotlight: a ${displayName(ctx)}.`,
  },
  {
    match: (ctx) => hasCategory(ctx, "tiki", "tropical"),
    title: () => "Vacation in a glass",
    body: (ctx) => `Crushed-ice energy — today's ${displayName(ctx)}.`,
  },
  {
    match: (ctx) => hasCategory(ctx, "brunch"),
    title: () => "Brunch-adjacent",
    body: (ctx) => `Before noon or well after: a ${displayName(ctx)}.`,
  },
  {
    match: (ctx) => hasCategory(ctx, "summer"),
    title: () => "Patio weather",
    body: (ctx) => `Bright and pourable: the ${displayName(ctx)}.`,
  },
  {
    match: (ctx) => hasCategory(ctx, "classic"),
    title: () => "Canon pick",
    body: (ctx) => `A classic for a reason — today's ${displayName(ctx)}.`,
  },
  {
    match: (ctx) => hasCategory(ctx, "zero-proof", "mocktail"),
    title: () => "All flavor, no proof",
    body: (ctx) => `Today's zero-proof pick: ${displayName(ctx)}.`,
  },
  {
    title: () => "Your shaker is lonely",
    body: (ctx) => `Give it purpose — make a ${displayName(ctx)} tonight.`,
  },
  {
    title: () => "Ice. Spirit. Done.",
    body: (ctx) => `Today's featured recipe: the ${displayName(ctx)}.`,
  },
  {
    title: () => "Bar's open (at your place)",
    body: (ctx) => `MixWise pick of the day: ${displayName(ctx)}.`,
  },
  {
    title: () => "Couch called",
    body: (ctx) => `It wants you to make a ${displayName(ctx)}. Who are we to argue?`,
  },
  {
    title: () => "Tiny adventure",
    body: (ctx) => `Try something new: today's ${displayName(ctx)}.`,
  },
  {
    title: () => "Drink of the Day",
    body: (ctx) => {
      const desc = ctx.shortDescription?.trim();
      if (desc && desc.length <= 90) {
        return `Today: ${displayName(ctx)} — ${desc}`;
      }
      return `Today's pick: ${displayName(ctx)}. Tap for the recipe.`;
    },
  },
];

function pickVariant(ctx: DailyDrinkContext): Variant {
  const dateKey = ctx.dateKey || getCurrentLocalDateString();
  const eligible = VARIANTS.filter((v) => !v.match || v.match({ ...ctx, dateKey }));
  const count = eligible.length || 1;
  const index = Math.floor(
    seededRandom(`${dateKey}:${ctx.slug}`, "daily-notif-variant") * count
  );
  return eligible[Math.min(index, count - 1)] ?? VARIANTS[VARIANTS.length - 1]!;
}

/** Friendly, varied copy for the daily local notification. Stable for a given UTC day + drink. */
export function buildDailyNotificationCopy(
  ctx: DailyDrinkContext,
  cabinet?: CabinetNotificationContext
): NotificationCopy {
  const dateKey = ctx.dateKey || getCurrentLocalDateString();
  const enriched = { ...ctx, dateKey };

  if (cabinet?.canMakeTonight) {
    return {
      title: "Ready from your cabinet",
      body: `Tonight's pick — ${displayName(enriched)} — is one you can pour now.`,
    };
  }

  const variant = pickVariant(enriched);
  const copy: NotificationCopy = {
    title: variant.title(enriched),
    body: variant.body(enriched),
  };

  const ready = cabinet?.cabinetReadyCount ?? 0;
  if (ready > 0 && !cabinet?.canMakeTonight) {
    copy.body = `${copy.body} (${ready} drink${ready === 1 ? "" : "s"} ready at home.)`;
  }

  return copy;
}
