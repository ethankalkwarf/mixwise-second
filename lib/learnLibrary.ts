/**
 * MixWise Learn library — longer-form guides for home mixologists.
 */

export type LearnGuide = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  readingMinutes: number;
  topics: string[];
  sections: Array<{ heading: string; body: string[] }>;
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
    sections: [
      {
        heading: "Build a small kit that works hard",
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
    sections: [
      {
        heading: "The rule of thumb",
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
    sections: [
      {
        heading: "Taste with a purpose",
        body: [
          "Sip for temperature first, then aroma, then the mid-palate. Ask: is it bright enough? Too sweet? Flat? Hot with alcohol?",
          "Training your palate is mostly repetition. Make the same Margarita twice in one week and note what changed — citrus, salt, or orange liqueur brand.",
        ],
      },
      {
        heading: "Quick fixes",
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
    sections: [
      {
        heading: "Citrus peels are perfume",
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
    sections: [
      {
        heading: "Categories that matter at home",
        body: [
          "Blanco (unaged or briefly rested) keeps bright agave and pepper — ideal for Margaritas and highballs. Reposado softens with light oak. Añejo leans dessert-spice and works in Old Fashioned builds.",
          "Mezcal adds smoke and earth. Espadín is the approachable workhorse; louder mezcals can dominate equal-parts drinks.",
        ],
      },
      {
        heading: "100% agave only",
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
    sections: [
      {
        heading: "Use the same architecture",
        body: [
          "A good zero-proof drink still needs structure: acidity, sweetness, bitterness or spice, and a satisfying texture. Ginger beer, hibiscus, coffee, tea, and citrus are your friends.",
          "Non-alcoholic spirits help when you want botanical weight, but they are optional. Many excellent NA drinks are built from pantry staples.",
        ],
      },
      {
        heading: "Serve it like a cocktail",
        body: [
          "Proper ice, a real glass, and a thoughtful garnish signal intention. Guests notice presentation as much as proof.",
          "Offer NA options alongside alcoholic ones without making anyone announce why they chose which.",
        ],
      },
    ],
  },
];

export function getLearnGuide(slug: string): LearnGuide | undefined {
  return LEARN_GUIDES.find((g) => g.slug === slug);
}

export function searchLearnLibrary(query: string): {
  guides: LearnGuide[];
  techniqueLabels: string[];
} {
  const q = query.trim().toLowerCase();
  if (!q) return { guides: LEARN_GUIDES, techniqueLabels: [] };

  const guides = LEARN_GUIDES.filter((g) => {
    const hay = [g.title, g.summary, g.eyebrow, ...g.topics, ...g.sections.flatMap((s) => [s.heading, ...s.body])]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });

  return { guides, techniqueLabels: [] };
}
