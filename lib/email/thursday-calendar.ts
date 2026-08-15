/**
 * Thursday featured / event lineup. Event weeks replace the regular Thursday send.
 */

export type ThursdayIssue = {
  date: string;
  featuredSlug: string;
  featuredLabel: string;
  relatedSlugs: string[];
  relatedHeading: string;
  occasion?: { slug: string; label: string };
  headline: string;
  intro: string;
  subject: string;
  previewText: string;
  ctaLabel: string;
  signoff: string;
};

export const THURSDAY_ISSUES: ThursdayIssue[] = [
  {
    date: "2026-08-20",
    featuredSlug: "strawberry-daiquiri",
    featuredLabel: "Cold on purpose",
    relatedSlugs: ["gin-gin-mule", "whiskey-smash"],
    relatedHeading: "If you'd rather skip the blender",
    occasion: { slug: "summer", label: "More summer drinks" },
    headline: "Still too hot. Make a daiquiri.",
    intro:
      "August has one job left and it's heat. A Strawberry Daiquiri is rum, berries, lime, and a pile of ice. Blitz it, pour it, sit back down.",
    subject: "Still too hot. Make a daiquiri.",
    previewText: "Berries, rum, lime, ice. Last-of-summer in a glass.",
    ctaLabel: "Get the recipe",
    signoff: "Sit outside a little longer.",
  },
  {
    date: "2026-08-27",
    featuredSlug: "sangria",
    featuredLabel: "The one pitcher",
    relatedSlugs: ["electric-lemonade", "virgin-mojito"],
    relatedHeading: "Same weather, smaller glass",
    occasion: { slug: "summer", label: "More summer drinks" },
    headline: "Last big weekend of summer.",
    intro:
      "Labor Day is the last long weekend that still feels like July. Make one sangria. Wine, fruit, a pitcher. Fill glasses until the potato salad is gone. This is not the week to become the bartender.",
    subject: "Last chance for a summer pitcher",
    previewText: "Wine, fruit, ice. The last patio weekend of the year.",
    ctaLabel: "Get the pitcher recipe",
    signoff: "Don't become the bartender.",
  },
  {
    date: "2026-09-03",
    featuredSlug: "gin-gin-mule",
    featuredLabel: "Built in the glass",
    relatedSlugs: ["whiskey-smash", "strawberry-daiquiri"],
    relatedHeading: "More ice, same idea",
    occasion: { slug: "summer", label: "More summer drinks" },
    headline: "Labor Day. Last patio drinks of the year.",
    intro:
      "Monday is the holiday. After that the light changes and the drinks get quieter. A Gin Gin Mule is mint, ginger, lime, and gin over a lot of ice. Build it, take it outside, pretend it's still July.",
    subject: "Last patio drink of the year",
    previewText: "Gin, mint, ginger, lime. Take it outside while you still can.",
    ctaLabel: "Get the recipe",
    signoff: "Take it outside.",
  },
  {
    date: "2026-09-10",
    featuredSlug: "old-fashioned",
    featuredLabel: "After dark",
    relatedSlugs: ["maple-old-fashioned", "manhattan"],
    relatedHeading: "Same whiskey, different sweater",
    occasion: { slug: "fall", label: "Fall drinks" },
    headline: "The porch drinks got quieter.",
    intro:
      "September decided it was Bourbon Heritage Month, which mostly means we can stop pretending it's still spritz season. Sugar, bitters, bourbon. A cube that takes itself seriously.",
    subject: "Bourbon month. Big cube.",
    previewText: "Sugar, bitters, bourbon. September can be this quiet.",
    ctaLabel: "Make the Old Fashioned",
    signoff: "Lights on earlier is not a crisis.",
  },
  {
    date: "2026-09-17",
    featuredSlug: "paloma",
    featuredLabel: "Highball weather",
    relatedSlugs: ["ranch-water", "margarita"],
    relatedHeading: "Still tequila",
    occasion: { slug: "summer", label: "More highballs" },
    headline: "Yesterday was a holiday. Today is a Paloma.",
    intro:
      "Mexican Independence Day was Wednesday. The correct follow-up is not a themed menu. It's tequila, grapefruit, and enough ice that the glass sweats. Ranch Water if you want even less work.",
    subject: "Grapefruit, tequila, done",
    previewText: "Tequila, grapefruit, a stupid amount of ice.",
    ctaLabel: "I'll Paloma this",
    signoff: "Salt the rim if you must.",
  },
  {
    date: "2026-09-24",
    featuredSlug: "apple-cider-old-fashioned",
    featuredLabel: "First sweater drink",
    relatedSlugs: ["maple-old-fashioned", "stone-fence"],
    relatedHeading: "More orchard, less patio",
    occasion: { slug: "fall", label: "The fall collection" },
    headline: "Fall showed up on Tuesday.",
    intro:
      "Equinox was two days ago, which you could feel even if you didn't look it up. Cider in the Old Fashioned. Maple if you've got it. A glass you can hold without leaving a puddle.",
    subject: "The light changed. So did the drink.",
    previewText: "Bourbon and cider in a rocks glass. Fall without the cinnamon lecture.",
    ctaLabel: "Get the recipe",
    signoff: "Welcome to the other half of the year.",
  },
  {
    date: "2026-10-01",
    featuredSlug: "michelada",
    featuredLabel: "During the game",
    relatedSlugs: ["paloma", "sangria"],
    relatedHeading: "If the beer isn't happening",
    occasion: { slug: "party", label: "Crowd drinks" },
    headline: "Nobody is shaking a cocktail at 3rd and 8.",
    intro:
      "Football is on. Oktoberfest is still hanging around. A Michelada is beer, lime, and spice in a glass you can set down without a ceremony. Paloma if the beer people lose the vote.",
    subject: "Between plays, drink this",
    previewText: "Beer, lime, a little heat. Set it down. Watch the play.",
    ctaLabel: "I'll drink this during the game",
    signoff: "Mute the commercials.",
  },
  {
    date: "2026-10-08",
    featuredSlug: "black-magic",
    featuredLabel: "Early, on purpose",
    relatedSlugs: ["corpse-reviver-no-2", "blood-and-sand"],
    relatedHeading: "Same month, less costume",
    occasion: { slug: "halloween", label: "Halloween drinks" },
    headline: "Three weeks. Plenty of time to get weird.",
    intro:
      "Halloween is October 31, which means we have a minute. Black Magic is vodka, coffee liqueur, and lime. Dark enough for the party. Still a drink you'd finish in July. Save the plastic spiders for the porch.",
    subject: "Halloween drinks that aren't candy",
    previewText: "Vodka, coffee liqueur, lime. Costume-dark. Still drinkable.",
    ctaLabel: "Get the recipe",
    signoff: "The costume can wait.",
  },
];

export const FALLBACK_THURSDAY_SLUGS = [
  "daiquiri",
  "old-fashioned",
  "negroni",
  "paloma",
  "whiskey-smash",
  "manhattan",
  "margarita",
  "last-word",
] as const;

export const BLOCKED_THURSDAY_SLUGS = new Set(["limoncello-spritz"]);

export function utcDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function getThursdayIssue(date = new Date()): ThursdayIssue | undefined {
  const key = utcDateKey(date);
  return THURSDAY_ISSUES.find((issue) => issue.date === key);
}

export function fallbackThursdaySlug(date = new Date()): string {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - start.getTime()) / 86400000 + start.getUTCDay() + 1) / 7);
  return FALLBACK_THURSDAY_SLUGS[week % FALLBACK_THURSDAY_SLUGS.length];
}
