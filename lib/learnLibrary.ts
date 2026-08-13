/**
 * MixWise Learn library — paths, guides, and methods for home mixologists.
 */

export type { LearnSection } from "@/lib/learnTypes";
export type { LearnGuide } from "@/lib/learnGuides";
export {
  LEARN_GUIDES,
  getLearnGuide,
  getNextLearnGuide,
} from "@/lib/learnGuides";

import type { LearnSection } from "@/lib/learnTypes";
import type { LearnGuide } from "@/lib/learnGuides";
import { LEARN_GUIDES, getLearnGuide } from "@/lib/learnGuides";

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

export const LEARN_METHODS: LearnMethod[] = [
  {
    slug: "shake",
    label: "Shake",
    cue: "Shake hard · 10–15 seconds",
    summary: "Chill, dilute, and integrate citrus, egg, dairy, or any cloudy mix.",
    tip: "Shake hard until the tin is painfully cold. Short shakes leave drinks warm; marathon shakes over-dilute.",
    techniqueKeys: ["shake", "shaken"],
    coverImage: "/learn/method-shake.webp",
    coverAlt: "Hands shaking a condensed cocktail tin at home",
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
    coverImage: "/learn/method-stir.webp",
    coverAlt: "Barspoon stirring a clear cocktail in a mixing glass",
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
    coverImage: "/learn/method-build.webp",
    coverAlt: "Soda poured into a tall highball glass packed with ice",
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
    coverImage: "/learn/method-blend.webp",
    coverAlt: "Blender with crushed ice making a frozen cocktail",
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
    coverImage: "/learn/method-layer.webp",
    coverAlt: "Layered cocktail with distinct color bands in a cordial glass",
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
    coverImage: "/learn/technique-swizzle.webp",
    coverAlt: "Swizzle stick spinning crushed ice in a frosted tall glass",
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
    coverImage: "/learn/technique-muddle.webp",
    coverAlt: "Wooden muddler pressing mint in a glass",
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
    coverImage: "/learn/shake-vs-stir.webp",
    coverAlt: "Shaken cocktail preparation at home",
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
    coverImage: "/learn/spirit-primer-agave.webp",
    coverAlt: "Agave fields for tequila and mezcal",
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


export function getLearnMethod(slug: string): LearnMethod | undefined {
  return LEARN_METHODS.find((m) => m.slug === slug);
}

export function getLearnPath(slug: string): LearnPath | undefined {
  return LEARN_PATHS.find((p) => p.slug === slug);
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

const TECHNIQUE_STEP_COVERS: Record<string, { src: string; alt: string }> = {
  "dry-shake": { src: "/learn/technique-dry-shake.webp", alt: "Dry shaking a cocktail tin without ice" },
  "fine-strain": { src: "/learn/technique-fine-strain.webp", alt: "Double-straining a cocktail through fine mesh into a coupe" },
  express: { src: "/learn/technique-express.webp", alt: "Expressing citrus oils over a cocktail" },
  muddle: { src: "/learn/technique-muddle.webp", alt: "Muddling mint with a wooden muddler" },
  swizzle: { src: "/learn/technique-swizzle.webp", alt: "Swizzling crushed ice until the glass frosts" },
  rinse: { src: "/learn/technique-rinse.webp", alt: "Rinsing a glass with absinthe" },
  float: { src: "/learn/technique-float.webp", alt: "Floating wine over a sour with a barspoon" },
  layer: { src: "/learn/method-layer.webp", alt: "Layered cocktail with density bands" },
  build: { src: "/learn/method-build.webp", alt: "Building a highball over ice" },
};

export function pathStepMedia(step: LearnPathStep): {
  title: string;
  blurb: string;
  kind: string;
  image: string;
  imageAlt: string;
  href: string;
} {
  const href = pathStepHref(step);
  switch (step.type) {
    case "guide": {
      const g = getLearnGuide(step.slug);
      return {
        title: g?.title ?? step.slug,
        blurb: g?.summary ?? "",
        kind: g?.eyebrow ?? "Guide",
        image: g?.coverImage ?? "/media/kitchen-shelf.webp",
        imageAlt: g?.coverAlt ?? g?.title ?? "Guide",
        href,
      };
    }
    case "method": {
      const m = getLearnMethod(step.slug);
      return {
        title: m?.label ?? step.slug,
        blurb: m?.summary ?? m?.tip ?? "",
        kind: "Core method",
        image: m?.coverImage ?? "/learn/method-shake.webp",
        imageAlt: m?.coverAlt ?? m?.label ?? "Method",
        href,
      };
    }
    case "technique": {
      const cover = TECHNIQUE_STEP_COVERS[step.slug];
      const blurbs: Record<string, string> = {
        "dry-shake": "Shake without ice first to build foam — then chill with a wet shake.",
        "fine-strain": "Hawthorne plus fine mesh — catch chips and pulp for drinks served up.",
        express: "Oils over the surface beat juice in the glass.",
        muddle: "Press to release — don’t shred herbs into bitterness.",
        swizzle: "Spin crushed ice until the glass frosts.",
        rinse: "Coat the glass, discard the excess — aroma, not a pour.",
        float: "Slow pour over a spoon so layers hold.",
        layer: "Density order and a steady hand.",
        build: "Made in the glass you’ll drink from.",
      };
      return {
        title: step.slug.replace(/-/g, " "),
        blurb: blurbs[step.slug] ?? "A focused technique deep-dive — short, practical, then practice on a recipe.",
        kind: "Technique",
        image: cover?.src ?? "/learn/method-shake.webp",
        imageAlt: cover?.alt ?? step.slug,
        href,
      };
    }
    case "swaps":
      return {
        title: "Smart swaps",
        blurb: "Bottle substitutions when you’re mid-shop or mid-mix.",
        kind: "Reference",
        image: "/media/kitchen-shelf.webp",
        imageAlt: "Bar bottles on a shelf",
        href,
      };
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
    const hay = [
      g.title,
      g.summary,
      g.eyebrow,
      g.bigIdea,
      ...g.topics,
      ...g.keyTakeaways,
      ...g.sections.flatMap((s) => [s.heading, ...s.body]),
      ...(g.deepDive ?? []).flatMap((s) => [s.heading, ...s.body]),
    ]
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
