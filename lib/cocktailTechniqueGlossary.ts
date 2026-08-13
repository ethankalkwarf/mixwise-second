/**
 * Short beginner-friendly glossary for cocktail technique jargon.
 * learnPath is reserved for a future /learn library — leave undefined for now.
 */

export type GlossaryTerm = {
  /** Canonical display label */
  label: string;
  /** Match patterns (longer phrases first when sorting) */
  patterns: string[];
  /** One-sentence plain-language explanation */
  explanation: string;
  /** Optional "why it matters" line */
  why?: string;
  /** Future education deep-link */
  learnPath?: string;
};

export type MethodTip = {
  label: string;
  summary: string;
  tip: string;
};

/** Inline-highlight jargon (not every "shake"/"stir" — those use method tips). */
export const TECHNIQUE_TERMS: GlossaryTerm[] = [
  {
    label: "dry shake",
    patterns: ["dry-shake", "dry shake"],
    explanation:
      "Shake the drink without ice first — usually to foam egg white or aquafaba.",
    why: "Ice can stop foam from building; dry shake first, then shake again with ice to chill.",
    learnPath: "/learn/techniques/dry-shake",
  },
  {
    label: "fine-strain",
    patterns: ["fine-strain", "fine strain", "double-strain", "double strain"],
    explanation:
      "Pour through a regular strainer and a fine mesh strainer to catch ice chips and pulp.",
    why: "Gives a smoother texture in drinks served without ice (up).",
    learnPath: "/learn/techniques/fine-strain",
  },
  {
    label: "express",
    patterns: ["expressed", "express"],
    explanation:
      "Squeeze a citrus peel over the drink so the oils spray onto the surface, then often wipe the rim.",
    why: "Adds aroma without much extra juice or bitterness.",
    learnPath: "/learn/techniques/express",
  },
  {
    label: "muddle",
    patterns: ["muddling", "muddle", "muddled"],
    explanation:
      "Gently press herbs or fruit with a muddler (or spoon) to release oils and juice.",
    why: "Press — don’t pulverize — mint or you’ll release bitter chlorophyll.",
    learnPath: "/learn/techniques/muddle",
  },
  {
    label: "swizzle",
    patterns: ["swizzling", "swizzle", "swizzled"],
    explanation:
      "Spin a swizzle stick or barspoon between your palms in crushed ice to chill and dilute fast.",
    why: "Frosts the glass and mixes without shaking out the crushed-ice texture.",
    learnPath: "/learn/techniques/swizzle",
  },
  {
    label: "rinse",
    patterns: ["rinsed", "rinse"],
    explanation:
      "Coat the inside of the glass with a small amount of spirit (often absinthe), then discard the excess.",
    why: "Adds aroma and a light flavor accent without making the drink taste strongly of that spirit.",
    learnPath: "/learn/techniques/rinse",
  },
  {
    label: "float",
    patterns: ["floating", "floated", "float"],
    explanation:
      "Gently layer a liquid on top by pouring slowly over the back of a spoon.",
    why: "Keeps denser and lighter liquids in bands for looks and staged sipping.",
    learnPath: "/learn/techniques/float",
  },
  {
    label: "layer",
    patterns: ["layering", "layered", "layer"],
    explanation:
      "Pour liquids slowly in density order so they stack in visible bands instead of mixing.",
    why: "Common in shooters and cream drinks; pour over a spoon and go slowly.",
    learnPath: "/learn/techniques/layer",
  },
  {
    label: "build",
    patterns: ["building", "built"],
    explanation:
      "Make the drink directly in the serving glass — usually over ice — instead of shaking or stirring in a separate vessel.",
    why: "Best for highballs and simple mixes where you want bubbles and speed.",
    learnPath: "/learn/techniques/build",
  },
];

/** Tips keyed by normalized technique field values. */
export const METHOD_TIPS: Record<string, MethodTip> = {
  shake: {
    label: "Shake",
    summary: "This drink is shaken with ice to chill, dilute, and mix.",
    tip: "Shake hard for about 10–15 seconds, until the shaker feels very cold. Use a shake for citrus, dairy, egg, or any cloudy mix.",
  },
  shaken: {
    label: "Shake",
    summary: "This drink is shaken with ice to chill, dilute, and mix.",
    tip: "Shake hard for about 10–15 seconds, until the shaker feels very cold. Use a shake for citrus, dairy, egg, or any cloudy mix.",
  },
  stir: {
    label: "Stir",
    summary: "This drink is stirred with ice for a clear, silky chill.",
    tip: "Stir for about 20–30 seconds with plenty of ice. Stir spirit-forward drinks (Manhattan, Martini, Negroni) so they stay clear.",
  },
  stirred: {
    label: "Stir",
    summary: "This drink is stirred with ice for a clear, silky chill.",
    tip: "Stir for about 20–30 seconds with plenty of ice. Stir spirit-forward drinks (Manhattan, Martini, Negroni) so they stay clear.",
  },
  build: {
    label: "Build",
    summary: "This drink is built in the glass over ice.",
    tip: "Add ingredients in order, then give a brief stir. Keep sodas and ginger beer cold so you don’t flatten the drink.",
  },
  built: {
    label: "Build",
    summary: "This drink is built in the glass over ice.",
    tip: "Add ingredients in order, then give a brief stir. Keep sodas and ginger beer cold so you don’t flatten the drink.",
  },
  blend: {
    label: "Blend",
    summary: "This drink is blended with ice for a frozen texture.",
    tip: "Use crushed or small ice and blend until smooth. Don’t over-blend herbs into a puree unless the recipe calls for it.",
  },
  blended: {
    label: "Blend",
    summary: "This drink is blended with ice for a frozen texture.",
    tip: "Use crushed or small ice and blend until smooth. Don’t over-blend herbs into a puree unless the recipe calls for it.",
  },
  layer: {
    label: "Layer",
    summary: "This drink is layered by density in the glass.",
    tip: "Pour slowly over the back of a spoon. Heavier (usually sweeter) liquids go first; cream and spirits often sit on top.",
  },
  layered: {
    label: "Layer",
    summary: "This drink is layered by density in the glass.",
    tip: "Pour slowly over the back of a spoon. Heavier (usually sweeter) liquids go first; cream and spirits often sit on top.",
  },
  swizzle: {
    label: "Swizzle",
    summary: "This drink is swizzled with crushed ice in the glass.",
    tip: "Pack crushed ice, then spin a swizzle stick or barspoon between your palms until the glass frosts.",
  },
  muddle: {
    label: "Muddle",
    summary: "This drink starts by muddling herbs or fruit in the glass.",
    tip: "Press gently to release oils and juice. For mint, press — don’t shred — or the drink can taste grassy.",
  },
  muddled: {
    label: "Muddle",
    summary: "This drink starts by muddling herbs or fruit in the glass.",
    tip: "Press gently to release oils and juice. For mint, press — don’t shred — or the drink can taste grassy.",
  },
};

export function normalizeTechniqueKey(technique: string | null | undefined): string | null {
  if (!technique) return null;
  const key = technique.trim().toLowerCase();
  return key || null;
}

export function getMethodTip(technique: string | null | undefined): MethodTip | null {
  const key = normalizeTechniqueKey(technique);
  if (!key) return null;
  return METHOD_TIPS[key] ?? null;
}

/** Terms sorted longest-pattern-first for safe regex matching. */
export function getSortedTechniqueTerms(): GlossaryTerm[] {
  return [...TECHNIQUE_TERMS].sort((a, b) => {
    const aLen = Math.max(...a.patterns.map((p) => p.length));
    const bLen = Math.max(...b.patterns.map((p) => p.length));
    return bLen - aLen;
  });
}

export function findTermsInText(text: string): GlossaryTerm[] {
  const found: GlossaryTerm[] = [];
  for (const term of getSortedTechniqueTerms()) {
    const matched = term.patterns.some((pattern) => {
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(?<![A-Za-z])${escaped}(?![A-Za-z])`, "i").test(text);
    });
    if (matched) found.push(term);
  }
  return found;
}
