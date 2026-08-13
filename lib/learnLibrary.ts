/**
 * MixWise Learn library — paths, guides, and methods for home mixologists.
 */

export type LearnSection = {
  heading: string;
  body: string[];
  /** Visual treatment — rule / mistakes / tip stand out from prose */
  kind?: "default" | "rule" | "mistakes" | "tip";
};

export type LearnGuide = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  readingMinutes: number;
  topics: string[];
  sections: LearnSection[];
  /** Hero / card cover under /public */
  coverImage: string;
  coverAlt: string;
  /** Catalog cocktail slugs to practice after reading */
  practiceSlugs: string[];
  /** Soft accent when cover is missing */
  accentClass: string;
};

export type LearnPathStep =
  | { type: "guide"; slug: string }
  | { type: "method"; slug: string }
  | { type: "technique"; slug: string }
  | { type: "swaps" };

export type LearnPath = {
  slug: string;
  title: string;
  summary: string;
  eyebrow: string;
  estimatedMinutes: number;
  coverImage: string;
  coverAlt: string;
  steps: LearnPathStep[];
};

export type LearnMethod = {
  slug: string;
  label: string;
  cue: string;
  summary: string;
  tip: string;
  /** Keys that map from cocktail.technique / METHOD_TIPS */
  techniqueKeys: string[];
  sections: LearnSection[];
  practiceSlugs: string[];
  relatedTechniqueSlugs: string[];
  relatedGuideSlug?: string;
  coverImage: string;
  coverAlt: string;
};

export const LEARN_GUIDES: LearnGuide[] = [
  {
    slug: "home-bar-fundamentals",
    title: "Home bar fundamentals",
    eyebrow: "Start here",
    summary:
      "What you actually need to make better drinks at home — tools, ice, citrus, and a short bottle list that covers most recipes.",
    readingMinutes: 8,
    topics: ["tools", "ice", "citrus", "bottles", "beginner"],
    coverImage: "/media/kitchen-shelf.webp",
    coverAlt: "Home bar bottles and glassware on a kitchen shelf",
    accentClass: "from-olive/30 via-cream to-cream",
    practiceSlugs: ["gin-and-tonic", "old-fashioned", "margarita", "negroni"],
    sections: [
      {
        heading: "Build a small kit that works hard",
        kind: "rule",
        body: [
          "You do not need a full bar cart to make serious drinks. A shaker (or jar with a tight lid), a strainer, a jigger or measuring spoons, a barspoon, and a peeler cover nearly every classic technique on MixWise.",
          "Add a fine mesh strainer when you start serving drinks “up” (no ice in the glass). That second strain keeps ice chips and pulp out of coupes and Nick & Noras.",
        ],
      },
      {
        heading: "Ice is an ingredient",
        body: [
          "Clear, hard cubes chill and dilute predictably. Soft freezer ice melts fast and can water a drink before it is cold.",
          "Use bigger cubes for stirred spirit-forward cocktails. Use smaller cubes or cracked ice when you want faster chill in a shaker. Crushed ice is for swizzles, juleps, and some tiki builds — not a default for every highball.",
        ],
      },
      {
        heading: "Fresh citrus changes everything",
        body: [
          "Bottled lemon and lime juice flatten sours. Squeeze to order when you can. Roll the fruit first, then strain out seeds.",
          "If a recipe tastes dull, check citrus before you blame the spirit. Underripe fruit and old juice are the usual culprits.",
        ],
      },
      {
        heading: "A starter bottle list",
        kind: "tip",
        body: [
          "One solid gin, one vodka, one blanco tequila, one whiskey you like neat, and a versatile rum cover a surprising amount of the catalog.",
          "Then add sweet vermouth, dry vermouth (keep refrigerated), a dry orange liqueur, and Angostura bitters. That set unlocks Manhattans, Martinis, Margaritas, Negronis (with Campari), and dozens of variations.",
        ],
      },
    ],
  },
  {
    slug: "shake-vs-stir",
    title: "When to shake vs stir",
    eyebrow: "Core technique",
    summary:
      "The rule of thumb, the exceptions, and how long to work the ice so dilution and texture land where you want them.",
    readingMinutes: 6,
    topics: ["shake", "stir", "technique", "dilution", "texture"],
    coverImage: "/media/bartender-home.webp",
    coverAlt: "Home bartender shaking a cocktail tin",
    accentClass: "from-forest/20 via-cream to-olive/15",
    practiceSlugs: ["daiquiri", "whiskey-sour", "manhattan", "martini"],
    sections: [
      {
        heading: "The rule of thumb",
        kind: "rule",
        body: [
          "Shake drinks that include citrus, egg, dairy, or anything cloudy you want fully integrated. Stir drinks that are all spirits and liqueurs — Manhattans, Martinis, Negronis — when you want clarity and a silky texture.",
          "Shaking adds air and more dilution; stirring keeps the drink denser and clearer. Neither is “fancier.” Match the method to the ingredients.",
        ],
      },
      {
        heading: "How hard and how long",
        body: [
          "Shake hard for about 10–15 seconds, until the tin is painfully cold. Short shakes leave drinks warm and syrupy; marathon shakes over-dilute.",
          "Stir 20–30 seconds with plenty of ice, tasting if you are unsure. You want the drink cold and slightly softened, not watery.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Shaking a Martini will not ruin it, but it will look cloudy and taste more diluted. Stirring a Whiskey Sour will leave egg white under-emulsified and the drink less lively.",
          "Always use enough ice. A half-empty shaker or mixing glass melts ice too fast and warms the drink unevenly.",
        ],
      },
    ],
  },
  {
    slug: "balance-and-taste",
    title: "Balance: sweet, sour, strong, weak",
    eyebrow: "Palate training",
    summary:
      "How to taste a drink like a bartender and fix it in the glass — without rewriting the whole recipe.",
    readingMinutes: 7,
    topics: ["balance", "tasting", "sweet", "sour", "fix"],
    coverImage: "/media/cocktails-overhead.webp",
    coverAlt: "Overhead view of mixed cocktails on a table",
    accentClass: "from-terracotta/15 via-cream to-olive/20",
    practiceSlugs: ["margarita", "whiskey-sour", "tom-collins", "negroni"],
    sections: [
      {
        heading: "Taste with a purpose",
        kind: "rule",
        body: [
          "Sip for temperature first, then aroma, then the mid-palate. Ask: is it bright enough? Too sweet? Flat? Hot with alcohol?",
          "Training your palate is mostly repetition. Make the same Margarita twice in one week and note what changed — citrus, salt, or orange liqueur brand.",
        ],
      },
      {
        heading: "Quick fixes",
        kind: "tip",
        body: [
          "Too sweet: add a few drops of citrus or a splash of soda if the drink can take length. Too tart: a barspoon of syrup. Too strong: more dilution (brief stir on ice) or a longer pour of the modifying ingredient.",
          "Too flat: check freshness of citrus and carbonation. Too bitter: a touch of sweetness or orange oil can round edges without hiding the bitter character entirely.",
        ],
      },
      {
        heading: "Trust structure, then tweak",
        body: [
          "Classic templates exist because they work: sour (spirit + citrus + sweet), highball (spirit + lengthener), old fashioned (spirit + sugar + bitters).",
          "When improvising, stay inside a template first. Wild creativity is easier after the drink already balances.",
        ],
      },
    ],
  },
  {
    slug: "garnish-with-intent",
    title: "Garnish with intent",
    eyebrow: "Presentation",
    summary:
      "Garnish is aroma and signal — not decoration for its own sake. How to express citrus, use mint, and know when to leave a drink naked.",
    readingMinutes: 5,
    topics: ["garnish", "citrus", "mint", "aroma"],
    coverImage: "/media/strainer-pour-poster.webp",
    coverAlt: "Cocktail being strained into a glass",
    accentClass: "from-olive/25 via-cream to-terracotta/10",
    practiceSlugs: ["old-fashioned", "mojito", "martini", "gin-gin-mule"],
    sections: [
      {
        heading: "Citrus peels are perfume",
        kind: "rule",
        body: [
          "Express a peel over the drink so oils hit the surface, then optionally wipe the rim. That aroma hit is often more important than the twist sitting in the glass.",
          "Avoid thick pithy peels when you can — bitter white pith muddies a Martini or Old Fashioned.",
        ],
      },
      {
        heading: "Mint and herbs",
        body: [
          "Slap mint gently between your palms to wake the oils, then place it so the drinker smells it on the first sip. Do not shred mint into a mojito muddle.",
          "Wilted herbs look and taste tired. Fresh garnish is part of the recipe, not an afterthought.",
        ],
      },
      {
        heading: "When no garnish is correct",
        kind: "tip",
        body: [
          "Many stirred equal-parts drinks and some sours are better ungarnished. If the recipe says none, trust it — clutter can fight the aroma of Chartreuse, mezcal, or bitters.",
        ],
      },
    ],
  },
  {
    slug: "spirit-primer-agave",
    title: "Agave primer: tequila & mezcal",
    eyebrow: "Spirits",
    summary:
      "Blanco, reposado, añejo, and mezcal — what changes in the glass and how to choose for Margaritas, Palomas, and spirit-forward serves.",
    readingMinutes: 9,
    topics: ["tequila", "mezcal", "agave", "margarita"],
    coverImage: "/occasions/summer.jpg",
    coverAlt: "Bright summer cocktail with citrus",
    accentClass: "from-terracotta/20 via-cream to-olive/15",
    practiceSlugs: ["margarita", "paloma", "mezcal-margarita", "tommy-s-margarita"],
    sections: [
      {
        heading: "Categories that matter at home",
        kind: "rule",
        body: [
          "Blanco (unaged or briefly rested) keeps bright agave and pepper — ideal for Margaritas and highballs. Reposado softens with light oak. Añejo leans dessert-spice and works in Old Fashioned builds.",
          "Mezcal adds smoke and earth. Espadín is the approachable workhorse; louder mezcals can dominate equal-parts drinks.",
        ],
      },
      {
        heading: "100% agave only",
        kind: "mistakes",
        body: [
          "Mixto tequilas (with added sugars) taste flatter and hangover-prone in cocktails. Look for “100% agave” on the label.",
        ],
      },
      {
        heading: "Matching drink to bottle",
        body: [
          "Bright citrus drinks want blanco or a restrained mezcal. Stirred vermouth drinks can handle reposado or softer mezcal. Spicy Margaritas still need a clean base — heat should come from chili, not harsh spirit.",
        ],
      },
    ],
  },
  {
    slug: "zero-proof-mindset",
    title: "Zero-proof without apology",
    eyebrow: "Hosting",
    summary:
      "How to build non-alcoholic drinks that feel composed — acid, bitter, texture, and length — instead of pouring soda and calling it done.",
    readingMinutes: 6,
    topics: ["zero-proof", "mocktail", "hosting", "balance"],
    coverImage: "/occasions/zero-proof.jpg",
    coverAlt: "Zero-proof cocktails styled for hosting",
    accentClass: "from-olive/30 via-cream to-forest/10",
    practiceSlugs: ["virgin-mojito", "shirley-temple", "zero-proof-margarita", "arnold-palmer"],
    sections: [
      {
        heading: "Use the same architecture",
        kind: "rule",
        body: [
          "A good zero-proof drink still needs structure: acidity, sweetness, bitterness or spice, and a satisfying texture. Ginger beer, hibiscus, coffee, tea, and citrus are your friends.",
          "Non-alcoholic spirits help when you want botanical weight, but they are optional. Many excellent NA drinks are built from pantry staples.",
        ],
      },
      {
        heading: "Serve it like a cocktail",
        kind: "tip",
        body: [
          "Proper ice, a real glass, and a thoughtful garnish signal intention. Guests notice presentation as much as proof.",
          "Offer NA options alongside alcoholic ones without making anyone announce why they chose which.",
        ],
      },
    ],
  },
];

export const LEARN_METHODS: LearnMethod[] = [
  {
    slug: "shake",
    label: "Shake",
    cue: "Shake hard · 10–15 seconds",
    summary: "Chill, dilute, and integrate citrus, egg, dairy, or any cloudy mix.",
    tip: "Shake hard until the tin is painfully cold. Short shakes leave drinks warm; marathon shakes over-dilute.",
    techniqueKeys: ["shake", "shaken"],
    coverImage: "/media/bartender-home.webp",
    coverAlt: "Shaking a cocktail",
    practiceSlugs: ["daiquiri", "whiskey-sour", "margarita", "clover-club"],
    relatedTechniqueSlugs: ["dry-shake", "fine-strain"],
    relatedGuideSlug: "shake-vs-stir",
    sections: [
      {
        heading: "When to shake",
        kind: "rule",
        body: [
          "Shake when the drink includes citrus, egg, cream, or anything you want fully emulsified. Air and ice do the work — you get chill, dilution, and texture in one motion.",
        ],
      },
      {
        heading: "How to do it",
        body: [
          "Fill the tin with ice, seal hard, and shake vigorously for about 10–15 seconds. Aim for a loud, even rattle — not a gentle rock.",
          "Strain promptly. If the recipe is served up, fine-strain to catch chips and pulp.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Too little ice melts fast and warms the drink. A loose seal sprays. Shaking spirit-only classics (Martini, Manhattan) clouds them and softens the texture more than stirring would.",
        ],
      },
    ],
  },
  {
    slug: "stir",
    label: "Stir",
    cue: "Stir · 20–30 seconds",
    summary: "Clear, silky chill for all-spirit drinks.",
    tip: "Plenty of ice, smooth circles, taste if unsure — cold and slightly softened, not watery.",
    techniqueKeys: ["stir", "stirred"],
    coverImage: "/media/three-cocktails-dark.webp",
    coverAlt: "Spirit-forward cocktails",
    practiceSlugs: ["manhattan", "martini", "negroni", "boulevardier"],
    relatedTechniqueSlugs: ["express", "rinse"],
    relatedGuideSlug: "shake-vs-stir",
    sections: [
      {
        heading: "When to stir",
        kind: "rule",
        body: [
          "Stir spirit-forward drinks — Manhattans, Martinis, Negronis, Boulevardiers — when you want clarity and a denser mouthfeel. No citrus, no egg, no dairy.",
        ],
      },
      {
        heading: "How to do it",
        body: [
          "Pack a mixing glass with ice, pour ingredients, and stir with a barspoon in smooth circles for 20–30 seconds. Keep the spoon against the glass so you don’t churn air in.",
          "Strain into a chilled glass. Express citrus oils over the top when the recipe calls for it.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Under-stirring leaves the drink warm and hot with alcohol. Over-stirring waters it out. Using wet, soft ice dilutes unpredictably.",
        ],
      },
    ],
  },
  {
    slug: "build",
    label: "Build",
    cue: "Build in the glass · brief stir",
    summary: "Assemble directly in the serving glass — highballs and simple mixes.",
    tip: "Add in order, brief stir, keep lengtheners cold so bubbles stay lively.",
    techniqueKeys: ["build", "built"],
    coverImage: "/media/ice-mojito-poster.webp",
    coverAlt: "Built drink over ice",
    practiceSlugs: ["gin-and-tonic", "paloma", "dark-n-stormy", "americano"],
    relatedTechniqueSlugs: ["build", "muddle"],
    relatedGuideSlug: "home-bar-fundamentals",
    sections: [
      {
        heading: "When to build",
        kind: "rule",
        body: [
          "Build when speed and bubbles matter — G&Ts, Palomas, highballs, many spritzes. You’re mixing in the glass you’ll drink from.",
        ],
      },
      {
        heading: "How to do it",
        body: [
          "Add ice first (or spirit first if the recipe prefers), then modifiers, then the lengthener last so carbonation stays bright. A brief stir is enough.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Warm soda or ginger beer goes flat fast. Over-stirring knocks out bubbles. Skipping proper ice makes the drink taste thin almost immediately.",
        ],
      },
    ],
  },
  {
    slug: "blend",
    label: "Blend",
    cue: "Blend until smooth",
    summary: "Frozen texture with crushed or small ice.",
    tip: "Don’t pulverize herbs unless the recipe asks for a puree.",
    techniqueKeys: ["blend", "blended"],
    coverImage: "/occasions/tiki.jpg",
    coverAlt: "Frozen or blended tropical cocktail",
    practiceSlugs: ["pina-colada", "frozen-margarita", "strawberry-daiquiri"],
    relatedTechniqueSlugs: ["fine-strain"],
    sections: [
      {
        heading: "When to blend",
        kind: "rule",
        body: [
          "Blend for frozen drinks — Piña Coladas, frozen Margaritas, and similar. Texture is the point.",
        ],
      },
      {
        heading: "How to do it",
        body: [
          "Use crushed or small cubes so the blender doesn’t struggle. Pulse to start, then blend until smooth. Serve immediately before it separates.",
        ],
      },
    ],
  },
  {
    slug: "layer",
    label: "Layer",
    cue: "Layer slowly over a spoon",
    summary: "Stack liquids by density for bands of flavor and color.",
    tip: "Heavier (usually sweeter) liquids first; pour cream and spirits slowly over a spoon.",
    techniqueKeys: ["layer", "layered"],
    coverImage: "/media/cocktails-overhead.webp",
    coverAlt: "Layered cocktail presentation",
    practiceSlugs: ["new-york-sour", "black-and-tan"],
    relatedTechniqueSlugs: ["float", "layer"],
    sections: [
      {
        heading: "When to layer",
        kind: "rule",
        body: [
          "Layer for visual drama and staged sipping — floats on sours, pousse-cafés, and cream-topped builds.",
        ],
      },
      {
        heading: "How to do it",
        body: [
          "Pour the densest liquid first. Rest a barspoon on the surface and pour the next liquid slowly over the back of the spoon so it spreads instead of plunging.",
        ],
      },
    ],
  },
  {
    slug: "swizzle",
    label: "Swizzle",
    cue: "Swizzle in crushed ice until frosted",
    summary: "Spin crushed ice in the glass until the outside frosts.",
    tip: "Pack crushed ice, then spin a stick or barspoon between your palms.",
    techniqueKeys: ["swizzle"],
    coverImage: "/occasions/tiki.jpg",
    coverAlt: "Crushed-ice tropical drink",
    practiceSlugs: ["queens-park-swizzle", "chartreuse-swizzle"],
    relatedTechniqueSlugs: ["swizzle", "muddle"],
    sections: [
      {
        heading: "When to swizzle",
        kind: "rule",
        body: [
          "Swizzle crushed-ice drinks that want rapid chill without shaking out the ice texture — classic Caribbean and tiki builds.",
        ],
      },
      {
        heading: "How to do it",
        body: [
          "Pack the glass with crushed ice, add ingredients, then spin a swizzle stick or barspoon between your palms until the glass frosts. Top with more ice if needed.",
        ],
      },
    ],
  },
  {
    slug: "muddle",
    label: "Muddle",
    cue: "Muddle gently · press, don’t shred",
    summary: "Press herbs or fruit to release oils and juice.",
    tip: "For mint, press — don’t pulverize — or the drink tastes grassy.",
    techniqueKeys: ["muddle", "muddled"],
    coverImage: "/media/ice-mojito-poster.webp",
    coverAlt: "Muddled mint cocktail",
    practiceSlugs: ["mojito", "whiskey-smash", "caipirinha", "gin-basil-smash"],
    relatedTechniqueSlugs: ["muddle", "build"],
    relatedGuideSlug: "garnish-with-intent",
    sections: [
      {
        heading: "When to muddle",
        kind: "rule",
        body: [
          "Muddle when herbs or fruit need to release aroma and juice in the glass — Mojitos, smashes, Caipirinhas.",
        ],
      },
      {
        heading: "How to do it",
        body: [
          "Use a muddler or the back of a spoon. Press firmly but briefly. For mint, a few presses wake the oils; shredding releases bitter chlorophyll.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Over-muddling mint turns the drink grassy. Under-muddling fruit leaves the drink thin and under-flavored.",
        ],
      },
    ],
  },
];

export const LEARN_PATHS: LearnPath[] = [
  {
    slug: "first-month-home",
    title: "Your first month at home",
    eyebrow: "Beginner path",
    summary: "Stock a small kit, learn shake vs stir, then taste for balance — four stops that unlock most of the catalog.",
    estimatedMinutes: 35,
    coverImage: "/media/kitchen-shelf.webp",
    coverAlt: "Home bar starter kit",
    steps: [
      { type: "guide", slug: "home-bar-fundamentals" },
      { type: "method", slug: "shake" },
      { type: "method", slug: "stir" },
      { type: "guide", slug: "shake-vs-stir" },
      { type: "guide", slug: "balance-and-taste" },
    ],
  },
  {
    slug: "sours-mastery",
    title: "Sours mastery",
    eyebrow: "Technique path",
    summary: "Own the sour template — shake technique, dry shake foam, and palate fixes that make citrus drinks sing.",
    estimatedMinutes: 28,
    coverImage: "/media/bartender-home.webp",
    coverAlt: "Shaken sour cocktail",
    steps: [
      { type: "guide", slug: "shake-vs-stir" },
      { type: "method", slug: "shake" },
      { type: "technique", slug: "dry-shake" },
      { type: "technique", slug: "fine-strain" },
      { type: "guide", slug: "balance-and-taste" },
    ],
  },
  {
    slug: "agave-deep-dive",
    title: "Agave deep dive",
    eyebrow: "Spirits path",
    summary: "Choose the right tequila or mezcal, garnish with intent, then practice on Margaritas and Palomas.",
    estimatedMinutes: 30,
    coverImage: "/occasions/summer.jpg",
    coverAlt: "Agave cocktail with citrus",
    steps: [
      { type: "guide", slug: "spirit-primer-agave" },
      { type: "guide", slug: "garnish-with-intent" },
      { type: "method", slug: "shake" },
      { type: "technique", slug: "express" },
      { type: "swaps" },
    ],
  },
];

export function getLearnMethodByTechniqueKey(technique: string | null | undefined): LearnMethod | undefined {
  const key = technique?.trim().toLowerCase();
  if (!key) return undefined;
  return LEARN_METHODS.find((m) => m.techniqueKeys.includes(key));
}

export function getLearnGuide(slug: string): LearnGuide | undefined {
  return LEARN_GUIDES.find((g) => g.slug === slug);
}

export function getLearnMethod(slug: string): LearnMethod | undefined {
  return LEARN_METHODS.find((m) => m.slug === slug);
}

export function getLearnPath(slug: string): LearnPath | undefined {
  return LEARN_PATHS.find((p) => p.slug === slug);
}

export function getNextLearnGuide(slug: string): LearnGuide | undefined {
  const index = LEARN_GUIDES.findIndex((g) => g.slug === slug);
  if (index < 0 || index >= LEARN_GUIDES.length - 1) return undefined;
  return LEARN_GUIDES[index + 1];
}

export function pathStepHref(step: LearnPathStep): string {
  switch (step.type) {
    case "guide":
      return `/learn/guides/${step.slug}`;
    case "method":
      return `/learn/methods/${step.slug}`;
    case "technique":
      return `/learn/techniques/${step.slug}`;
    case "swaps":
      return "/learn/swaps";
  }
}

export function pathStepLabel(step: LearnPathStep): string {
  switch (step.type) {
    case "guide":
      return getLearnGuide(step.slug)?.title ?? step.slug;
    case "method":
      return getLearnMethod(step.slug)?.label ?? step.slug;
    case "technique":
      return step.slug.replace(/-/g, " ");
    case "swaps":
      return "Smart swaps";
  }
}

export function searchLearnLibrary(query: string): {
  guides: LearnGuide[];
  methods: LearnMethod[];
  paths: LearnPath[];
} {
  const q = query.trim().toLowerCase();
  if (!q) return { guides: LEARN_GUIDES, methods: LEARN_METHODS, paths: LEARN_PATHS };

  const guides = LEARN_GUIDES.filter((g) => {
    const hay = [g.title, g.summary, g.eyebrow, ...g.topics, ...g.sections.flatMap((s) => [s.heading, ...s.body])]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });

  const methods = LEARN_METHODS.filter((m) => {
    const hay = [m.label, m.summary, m.tip, m.cue, ...m.sections.flatMap((s) => [s.heading, ...s.body])]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });

  const paths = LEARN_PATHS.filter((p) => {
    const hay = [p.title, p.summary, p.eyebrow].join(" ").toLowerCase();
    return hay.includes(q);
  });

  return { guides, methods, paths };
}
