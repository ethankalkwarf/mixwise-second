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

import type { LearnPracticeDrink, LearnSection } from "@/lib/learnTypes";
import type { LearnGuide } from "@/lib/learnGuides";
import { LEARN_GUIDES, getLearnGuide } from "@/lib/learnGuides";
import { getTechniqueTermBySlug, formatTechniqueLabel } from "@/lib/cocktailTechniqueGlossary";

export type LearnPathStep =
  | { type: "guide"; slug: string; why?: string }
  | { type: "method"; slug: string; why?: string }
  | { type: "technique"; slug: string; why?: string }
  | { type: "swaps"; why?: string };

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
  practice: LearnPracticeDrink[];
  relatedTechniqueSlugs: string[];
  relatedGuideSlug?: string;
  coverImage: string;
  coverAlt: string;
  /** When false, hide from the Methods browse tab (canonical lesson is the technique page). */
  listedInLibrary?: boolean;
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
    practice: [
      {
        slug: "daiquiri",
        notice:
          "Shake until the tin hurts. Make one at ~8 seconds and one at ~15 — taste warmth versus water, then lock in the painfully-cold cue.",
      },
      {
        slug: "whiskey-sour",
        notice:
          "Citrus plus optional egg. If you add white, dry-shake first; the wet shake is what chills. Foam should sit, not scum.",
      },
      {
        slug: "margarita",
        notice:
          "Hard shake, fine-strain if it’s up. If it tastes dull, check the lime before the tequila.",
      },
      {
        slug: "clover-club",
        notice:
          "Raspberry and egg want a vigorous shake. Thin pink liquid means the foam stage was rushed.",
      },
    ],
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
        figure: "shake-how",
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
    practice: [
      {
        slug: "manhattan",
        notice:
          "Pack the mixing glass. Stir until the whiskey heat drops and the drink feels slightly softened — not thin. If it’s dusty, suspect the vermouth.",
      },
      {
        slug: "martini",
        notice:
          "Smooth circles, spoon on the glass. You want jewel-clear, dense, and cold. Cloudiness means you churned air (or shook it).",
      },
      {
        slug: "negroni",
        notice:
          "Equal parts still need dilution. Stir until it’s refreshing, not hot-candy bitter. Express orange on top.",
      },
      {
        slug: "boulevardier",
        notice:
          "Same stir as a Negroni, whiskey instead of gin. Taste for cold and silk before you strain.",
      },
    ],
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
        figure: "stir-how",
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
    practice: [
      {
        slug: "gin-and-tonic",
        notice:
          "Ice first, gin, fridge-cold tonic last, brief stir. If it’s dull in a minute, you under-iced or the tonic was warm.",
      },
      {
        slug: "paloma",
        notice:
          "Keep grapefruit and soda cold. Lengthener last — don’t stir the bubbles out.",
      },
      {
        slug: "dark-n-stormy",
        notice:
          "Ginger beer last over packed ice. A long stir knocks spice and fizz together.",
      },
      {
        slug: "americano",
        notice:
          "Campari, vermouth, cold soda. Dusty bitterness is usually tired vermouth, not the build.",
      },
    ],
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
        figure: "build-order",
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
    practice: [
      {
        slug: "pina-colada",
        notice:
          "Ice is the body. It should mound on a spoon, not pour like juice. Serve immediately before it weeps.",
      },
      {
        slug: "frozen-margarita",
        notice:
          "Pulse, then blend smooth. Taste sweetness cold — frozen drinks read sweeter; don’t chase with extra syrup until you sip.",
      },
      {
        slug: "strawberry-daiquiri",
        notice:
          "Fruit plus ice. If herbs or leaves are in the spec, don’t obliterate them into bitterness unless you want a puree.",
      },
    ],
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
          figure: "ice-types",
          body: [
            "Use crushed or small cubes so the blender doesn’t struggle. Pulse to start, then blend until smooth. Serve immediately before it separates.",
          ],
        },
        {
          heading: "Common mistakes",
          kind: "mistakes",
          body: [
            "Too little ice makes soup; too much mutes flavor under freeze. Letting a pitcher sit separates the drink. Obliterating mint or herbs turns a frozen cocktail grassy unless the recipe wants a puree.",
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
    listedInLibrary: false,
    practice: [
      {
        slug: "new-york-sour",
        notice:
          "Shake the sour, let the foam settle a beat, then slow-pour wine over a spoon. First sips should alternate citrus and tannin.",
      },
      {
        slug: "black-and-tan",
        notice:
          "Heavier beer last, slowly over a spoon. A fast pour is just brown beer.",
      },
    ],
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
          figure: "layer-density",
          body: [
            "Pour the densest liquid first. Rest a barspoon on the surface and pour the next liquid slowly over the back of the spoon so it spreads instead of plunging.",
          ],
        },
        {
          heading: "Common mistakes",
          kind: "mistakes",
          body: [
            "Fast pours pierce layers. Wrong density order (light first) collapses the stack. Waiting too long before serving lets diffusion blur the bands you just built.",
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
    listedInLibrary: false,
    practice: [
      {
        slug: "queens-park-swizzle",
        notice:
          "Pack crushed ice, spin until the glass frosts, top with more ice. Cubes will not frost the same way.",
      },
      {
        slug: "chartreuse-swizzle",
        notice:
          "Stop when the outside is opaque with frost. Hot means too short; watery means the ice was already wet.",
      },
    ],
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
          figure: "ice-types",
          body: [
            "Pack the glass with crushed ice, add ingredients, then spin a swizzle stick or barspoon between your palms until the glass frosts. Top with more ice if needed.",
          ],
        },
        {
          heading: "Common mistakes",
          kind: "mistakes",
          body: [
            "Cubes won’t frost the glass — crush or crack them first. Undissolved sugar sits at the bottom if you didn’t use syrup. Stopping before the glass frosts leaves the drink hot in the middle.",
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
    listedInLibrary: false,
    practice: [
      {
        slug: "mojito",
        notice:
          "Press the mint a few times in syrup — don’t shred. Make a second one gentler if the first smells like lawn.",
      },
      {
        slug: "whiskey-smash",
        notice:
          "Lemon needs juice; mint still wants a press, not a puree. Taste the build before you shake.",
      },
      {
        slug: "caipirinha",
        notice:
          "Lime wedges and sugar need a thorough muddle. Under-muddling leaves this one thin — the opposite of mint.",
      },
      {
        slug: "gin-basil-smash",
        notice:
          "Basil bruises into perfume quickly. If the drink is khaki-green and bitter, you pulverized the leaves.",
      },
    ],
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
        figure: "muddle-press",
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
    eyebrow: "Beginner",
    summary:
      "Stock a small kit, learn the sour and old-fashioned templates, shake a Daiquiri, stir a Manhattan or Negroni, then taste for balance.",
    estimatedMinutes: 15,
    coverImage: "/media/kitchen-gathering.webp",
    coverAlt: "Friends measuring and mixing cocktails in a home kitchen",
    steps: [
      {
        type: "guide",
        slug: "home-bar-fundamentals",
        why: "A short kit, ice you trust, and fresh citrus — before you buy another novelty bottle.",
      },
      {
        type: "guide",
        slug: "cocktail-templates",
        why: "Sour, old fashioned, highball, equal parts. Stay inside a family when you improvise.",
      },
      {
        type: "method",
        slug: "shake",
        why: "Make a Daiquiri until the tin hurts. That’s the move behind most citrus drinks.",
      },
      {
        type: "method",
        slug: "stir",
        why: "Then a Manhattan or Negroni — clear, cold, and slightly softened, not watery.",
      },
      {
        type: "guide",
        slug: "balance-and-taste",
        why: "Name the imbalance (sweet, sour, hot, thin) and fix the smallest lever.",
      },
    ],
  },
  {
    slug: "sours-mastery",
    title: "Sours mastery",
    eyebrow: "Technique",
    summary:
      "Own the 2:1:1 skeleton, a hard shake, egg-white foam, a clean coupe, and the fixes for thin, sweet, or lifeless citrus drinks.",
    estimatedMinutes: 15,
    coverImage: "/learn/cocktail-templates.webp",
    coverAlt: "Three template drinks: a sour, an old fashioned, and a highball",
    steps: [
      {
        type: "guide",
        slug: "cocktail-templates",
        why: "Start with the sour template so every tweak has a name.",
      },
      {
        type: "method",
        slug: "shake",
        why: "Chill, dilute, and aerate — stop when the tin is painfully cold.",
      },
      {
        type: "technique",
        slug: "dry-shake",
        why: "Foam first, then ice. Skip this and egg sours come out warm and thin-capped.",
      },
      {
        type: "technique",
        slug: "fine-strain",
        why: "Hawthorne plus mesh so chips don’t keep watering a drink served up.",
      },
      {
        type: "guide",
        slug: "balance-and-taste",
        why: "Too sweet, too thin, no foam — diagnose in the glass, don’t rewrite the recipe.",
      },
    ],
  },
  {
    slug: "agave-deep-dive",
    title: "Agave primer: tequila & mezcal",
    eyebrow: "Spirits",
    summary:
      "Choose blanco or mezcal, shake a Margarita, express citrus, then build a Paloma — garnish with intent, not extra fruit.",
    estimatedMinutes: 15,
    coverImage: "/learn/spirit-primer-agave.webp",
    coverAlt: "Agave fields for tequila and mezcal",
    steps: [
      {
        type: "guide",
        slug: "spirit-primer-agave",
        why: "Blanco for brightness, oak when you want softness, mezcal when you want smoke — 100% agave.",
      },
      {
        type: "method",
        slug: "shake",
        why: "A Margarita is a sour. Hard shake, fresh lime, stop when the tin hurts.",
      },
      {
        type: "technique",
        slug: "express",
        why: "Lime or grapefruit oil on the surface beats another wedge in the glass.",
      },
      {
        type: "method",
        slug: "build",
        why: "A Paloma is a highball: packed ice, cold lengthener last, brief stir.",
      },
      {
        type: "guide",
        slug: "garnish-with-intent",
        why: "Salt, peel, or nothing — match the aroma to the drink, don’t clutter it.",
      },
    ],
  },
  {
    slug: "whiskey-deep-dive",
    title: "Whiskey: from bottle to classics",
    eyebrow: "Spirits",
    summary:
      "Five short lessons — family and buying myth, how whiskey is made, history that shows up in the glass, tasting styles, and four classics that teach. About 20 minutes.",
    estimatedMinutes: 20,
    coverImage: "/learn/whiskey-deep-dive.webp",
    coverAlt: "An Old Fashioned in a rocks glass with a large ice cube and orange peel",
    steps: [
      {
        type: "guide",
        slug: "whiskey-family-buying",
        why: "Styles aren’t interchangeable. One solid bourbon first; rye when Manhattans start.",
      },
      {
        type: "guide",
        slug: "whiskey-how-its-made",
        why: "Grain, still, and cask explain sweetness, spice, and smoke better than the label font.",
      },
      {
        type: "guide",
        slug: "whiskey-history-in-glass",
        why: "Recipe era often tells you which bottle to pour — rye bars, then bourbon as “whiskey.”",
      },
      {
        type: "guide",
        slug: "whiskey-learn-to-taste",
        why: "Smell first, taste, write two words — then name the style.",
      },
      {
        type: "guide",
        slug: "whiskey-four-classics",
        why: "Old Fashioned, Manhattan, Whiskey Sour, Boulevardier — each one trains a different judgment.",
      },
    ],
  },
  {
    slug: "stirred-classics",
    title: "Stirred classics",
    eyebrow: "Technique",
    summary:
      "Keep vermouth cold, know when to stir, chill a Manhattan or Negroni clear and silky, then finish with citrus oil — not a fruit salad.",
    estimatedMinutes: 15,
    coverImage: "/learn/vermouth-and-modifiers.webp",
    coverAlt: "Vermouth and modifier bottles stored cold on a refrigerator shelf",
    steps: [
      {
        type: "guide",
        slug: "vermouth-and-modifiers",
        why: "Half the drink is wine. Fridge it, finish it, and stop blaming the gin or whiskey.",
      },
      {
        type: "guide",
        slug: "shake-vs-stir",
        why: "All-spirit drinks want a stir. Shaking clouds them and adds more water than the template asks for.",
      },
      {
        type: "method",
        slug: "stir",
        why: "Hard cubes, full glass, taste for silk — stop before it turns thin.",
      },
      {
        type: "guide",
        slug: "ice-and-dilution",
        why: "Soft freezer ice ruins Manhattans before the spoon does. Match ice to the method.",
      },
      {
        type: "technique",
        slug: "express",
        why: "Orange or lemon oil on the surface is the last seasoning — not a muddled orange wheel.",
      },
    ],
  },
  {
    slug: "highballs-and-builds",
    title: "Highballs & lengthened drinks",
    eyebrow: "Technique",
    summary:
      "Pack the glass with ice, build spirit and modifiers, then add a cold lengthener last — and garnish for aroma, not clutter.",
    estimatedMinutes: 12,
    coverImage: "/learn/method-build.webp",
    coverAlt: "A highball glass packed with ice and a cold lengthened drink",
    steps: [
      {
        type: "guide",
        slug: "ice-and-dilution",
        why: "Sparse ice is why highballs die in two minutes. Pack the glass on purpose.",
      },
      {
        type: "method",
        slug: "build",
        why: "Ice first, spirit and modifiers next, cold soda or ginger beer last — brief stir only.",
      },
      {
        type: "guide",
        slug: "cocktail-templates",
        why: "Highballs are the lengthened family. Know the skeleton so you can swap spirit and soda without inventing chaos.",
      },
      {
        type: "guide",
        slug: "garnish-with-intent",
        why: "Lime, mint, or nothing — match the aroma to the lengthener, don’t bury the glass in fruit.",
      },
      {
        type: "guide",
        slug: "balance-and-taste",
        why: "Thin, sweet, or flat? Fix ice, measure, or acid before you abandon the bottle.",
      },
    ],
  },
  {
    slug: "spirit-labels-decoded",
    title: "Spirit labels decoded",
    eyebrow: "Shopping",
    summary:
      "Learn which words on a bottle are law vs marketing — then read American whiskey, agave, and Scotch labels like a bartender shopping for Manhattans and Margaritas.",
    estimatedMinutes: 20,
    coverImage: "/learn/spirit-labels-decoded.webp",
    coverAlt: "Home bar shelf with several spirit bottles at soft angles",
    steps: [
      {
        type: "guide",
        slug: "spirit-labels-intro",
        why: "Proof, age, origin, and the two languages every label speaks — before you pick a spirit family.",
      },
      {
        type: "guide",
        slug: "spirit-labels-whiskey",
        why: "Bourbon, rye, straight, bonded — and why Canadian “rye” is not US rye.",
      },
      {
        type: "guide",
        slug: "spirit-labels-agave",
        why: "100% de agave, NOM, CRT tiers — the Margarita shopping checklist.",
      },
      {
        type: "guide",
        slug: "spirit-labels-scotch",
        why: "Single malt vs blend, what “12 Years” means, peat as intensity — for Rob Roys and Penicillins.",
      },
    ],
  },
  {
    slug: "gin-primer",
    title: "Gin: from bottle to classics",
    eyebrow: "Spirits",
    summary:
      "Five short lessons — family and buying myth, how gin is made, history that shows up in the glass, tasting styles, and four classics that teach. About 20 minutes.",
    estimatedMinutes: 20,
    coverImage: "/learn/spirit-primer-gin.webp",
    coverAlt: "A gin and tonic with ice and lime, gin bottle softly blurred behind",
    steps: [
      {
        type: "guide",
        slug: "gin-family-buying",
        why: "Juniper is the legal spine. Buy for tonic, vermouth, or citrus — not bottle art.",
      },
      {
        type: "guide",
        slug: "gin-how-its-made",
        why: "Base, botanicals, and still choices explain why two gins drink differently in a Martini.",
      },
      {
        type: "guide",
        slug: "gin-history-in-glass",
        why: "History only when it changes the pour — genever to London dry, then Martini, Negroni, G&T.",
      },
      {
        type: "guide",
        slug: "gin-learn-to-taste",
        why: "Smell first, taste, write two words — then name the style.",
      },
      {
        type: "guide",
        slug: "gin-four-classics",
        why: "G&T, Martini, Negroni, Last Word — each one trains a different gin judgment.",
      },
    ],
  },
  {
    slug: "rum-primer",
    title: "Rum: from bottle to classics",
    eyebrow: "Spirits",
    summary:
      "Five short lessons — buying myths, how rum’s made, history that matters, tasting styles, and four classics that teach. About 20 minutes.",
    estimatedMinutes: 20,
    coverImage: "/learn/spirit-primer-rum.webp",
    coverAlt: "A classic Daiquiri in a coupe with a lime wheel",
    steps: [
      {
        type: "guide",
        slug: "rum-family-buying",
        why: "Don’t buy rum by color. A clean mixing white and one aged bottle cover the classics.",
      },
      {
        type: "guide",
        slug: "rum-how-its-made",
        why: "Base, ferment, still, oak, and sugar show up in the glass more honestly than label color.",
      },
      {
        type: "guide",
        slug: "rum-history-in-glass",
        why: "A few true stories explain why classics call for clean white, navy weight, or a funky blend.",
      },
      {
        type: "guide",
        slug: "rum-learn-to-taste",
        why: "Smell first, taste, write two words — then name the style.",
      },
      {
        type: "guide",
        slug: "rum-four-classics",
        why: "Daiquiri, Mojito, Dark ’n’ Stormy, Mai Tai — each one trains a different rum skill.",
      },
    ],
  },
  {
    slug: "zero-proof-hosting",
    title: "Zero-proof hosting",
    eyebrow: "Hosting",
    summary:
      "Build non-alcoholic drinks with real cocktail architecture — then balance, lengthen, and garnish so guests never get the consolation-prize glass.",
    estimatedMinutes: 12,
    coverImage: "/learn/zero-proof-hosting.webp",
    coverAlt: "A mint highball packed with crushed ice and fresh mint",
    steps: [
      {
        type: "guide",
        slug: "zero-proof-mindset",
        why: "Acid, bitter, texture, length — rebuild what ethanol was doing.",
      },
      {
        type: "guide",
        slug: "cocktail-templates",
        why: "Borrow sour, highball, and old-fashioned skeletons instead of inventing from soda.",
      },
      {
        type: "guide",
        slug: "balance-and-taste",
        why: "If it tastes like juice, name the missing job — usually bitter, spice, or dilution.",
      },
      {
        type: "method",
        slug: "build",
        why: "Many NA hosts live as highballs: packed ice, cold lengthener last.",
      },
      {
        type: "guide",
        slug: "garnish-with-intent",
        why: "Same glass and garnish standard as the alcoholic menu.",
      },
    ],
  },
  {
    slug: "batching-for-guests",
    title: "Batching for guests",
    eyebrow: "Hosting",
    summary:
      "Scale a Negroni or sour for a table — pre-dilute stirred drinks, protect citrus, and set a service station so you are not stuck shaking all night.",
    estimatedMinutes: 12,
    coverImage: "/learn/batching-and-hosting.webp",
    coverAlt: "Several guest cocktails and a pitcher on a bright kitchen table",
    steps: [
      {
        type: "guide",
        slug: "batching-and-hosting",
        why: "Ratio × dilution × chill. Spirit-forward batches first; citrus close to service.",
      },
      {
        type: "guide",
        slug: "ice-and-dilution",
        why: "Pre-dilution replaces the shake/stir — get the water intentional.",
      },
      {
        type: "guide",
        slug: "vermouth-and-modifiers",
        why: "Batched Negronis die on oxidized vermouth. Fridge and finish.",
      },
      {
        type: "guide",
        slug: "glassware-and-service",
        why: "Cold glassware and a garnish tray finish a batch like a bar, not a buffet.",
      },
    ],
  },
  {
    slug: "equal-parts-workshop",
    title: "Equal parts & bitter drinks",
    eyebrow: "Templates",
    summary:
      "Own the Negroni family: equal-parts math, Campari vs Aperol, fresh vermouth, a proper stir, and orange oil — plus the Americano as a lengthened cousin.",
    estimatedMinutes: 15,
    coverImage: "/learn/equal-parts-bitters.webp",
    coverAlt: "A Negroni in a rocks glass with orange peel",
    steps: [
      {
        type: "guide",
        slug: "equal-parts-bitters",
        why: "Equal parts is a skeleton — bitter intensity and dilution decide if it sings.",
      },
      {
        type: "guide",
        slug: "vermouth-and-modifiers",
        why: "Half the Negroni is wine. Counter vermouth is the usual villain.",
      },
      {
        type: "method",
        slug: "stir",
        why: "Silk and cold — shaking a Negroni is the wrong kind of texture.",
      },
      {
        type: "technique",
        slug: "express",
        why: "Orange oil is the finish; a muddled wheel is not.",
      },
      {
        type: "method",
        slug: "build",
        why: "Americano: same bitter-sweet idea, lengthened with cold soda.",
      },
    ],
  },
  {
    slug: "citrus-syrup-lab",
    title: "Citrus & syrup lab",
    eyebrow: "Ingredients",
    summary:
      "A compact lab: fresh juice vs bottled, 1:1 vs rich syrup, then shake a sour and taste for thin, sweet, or dull — fixing the smallest lever.",
    estimatedMinutes: 10,
    coverImage: "/learn/citrus-and-syrups.webp",
    coverAlt: "A whole lemon and lime on a light surface",
    steps: [
      {
        type: "guide",
        slug: "citrus-and-syrups",
        why: "Acid and sugar are ingredients with aroma and strength — not afterthoughts.",
      },
      {
        type: "method",
        slug: "shake",
        why: "Make one sour with fresh citrus. The tin teaches dilution; the juice teaches brightness.",
      },
      {
        type: "guide",
        slug: "balance-and-taste",
        why: "Name the fault (sweet, sharp, thin, dull) and move one dial.",
      },
    ],
  },
  {
    slug: "glassware-service",
    title: "Glassware & service",
    eyebrow: "Service",
    summary:
      "Pick coupe, rocks, or highball on purpose, chill what is served up, pack ice for long drinks, and garnish to the glass — not the Instagram prop table.",
    estimatedMinutes: 10,
    coverImage: "/learn/glassware-and-service.webp",
    coverAlt: "Rows of chilled cocktail glasses ready for service on a bar",
    steps: [
      {
        type: "guide",
        slug: "glassware-and-service",
        why: "The vessel is equipment — temperature, aroma, and melt depend on it.",
      },
      {
        type: "guide",
        slug: "ice-and-dilution",
        why: "Rocks and highballs are ice systems as much as glass shapes.",
      },
      {
        type: "guide",
        slug: "garnish-with-intent",
        why: "Scale the garnish to the bowl. Perfume beats clutter.",
      },
    ],
  },
  {
    slug: "smart-swaps-course",
    title: "Swap with intent",
    eyebrow: "Improvisation",
    summary:
      "Learn to change one variable inside a template, taste what happened, then use Smart swaps to explore catalog-aware options without breaking the drink.",
    estimatedMinutes: 12,
    coverImage: "/learn/cocktail-templates.webp",
    coverAlt: "Template drinks representing cocktail families",
    steps: [
      {
        type: "guide",
        slug: "cocktail-templates",
        why: "Name the family before you swap — sour, old fashioned, equal parts, highball.",
      },
      {
        type: "guide",
        slug: "swap-with-intent",
        why: "One knob at a time. Open Smart swaps from the lesson when you want catalog-aware options.",
      },
      {
        type: "guide",
        slug: "balance-and-taste",
        why: "If the swap broke, fix sweet/acid/dilution before adding another bottle.",
      },
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

/** Methods shown in the Learn library browse tab (techniques own the overlapping moves). */
export const LEARN_LIBRARY_METHODS: LearnMethod[] = LEARN_METHODS.filter(
  (m) => m.listedInLibrary !== false
);

export function getLearnPath(slug: string): LearnPath | undefined {
  return LEARN_PATHS.find((p) => p.slug === slug);
}

/** Hub featured paths — keep this short so desktop doesn’t open as a wall of cards. */
export const LEARN_FEATURED_PATH_SLUGS = [
  "first-month-home",
  "sours-mastery",
  "agave-deep-dive",
  "whiskey-deep-dive",
] as const;

export function getFeaturedLearnPaths(): LearnPath[] {
  return LEARN_FEATURED_PATH_SLUGS.map((slug) =>
    LEARN_PATHS.find((p) => p.slug === slug)
  ).filter((p): p is LearnPath => Boolean(p));
}

export function getMoreLearnPaths(): LearnPath[] {
  const featured = new Set<string>(LEARN_FEATURED_PATH_SLUGS);
  return LEARN_PATHS.filter((p) => !featured.has(p.slug));
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
    case "technique": {
      const raw = getTechniqueTermBySlug(step.slug)?.label ?? step.slug;
      return formatTechniqueLabel(raw);
    }
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
        blurb: step.why ?? g?.summary ?? "",
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
        blurb: step.why ?? m?.summary ?? m?.tip ?? "",
        kind: "Skill",
        image: m?.coverImage ?? "/learn/method-shake.webp",
        imageAlt: m?.coverAlt ?? m?.label ?? "Skill",
        href,
      };
    }
    case "technique": {
      const cover = TECHNIQUE_STEP_COVERS[step.slug];
      const term = getTechniqueTermBySlug(step.slug);
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
        title: formatTechniqueLabel(term?.label ?? step.slug),
        blurb: step.why ?? blurbs[step.slug] ?? "A focused skill — then practice on a recipe.",
        kind: "Skill",
        image: cover?.src ?? "/learn/method-shake.webp",
        imageAlt: cover?.alt ?? step.slug,
        href,
      };
    }
    case "swaps": {
      const g = getLearnGuide("swap-with-intent");
      return {
        title: "Smart swaps",
        blurb: step.why ?? "Bottle substitutions when you’re mid-shop or mid-mix.",
        kind: "Reference",
        image: g?.coverImage ?? "/media/kitchen-shelf.webp",
        imageAlt: g?.coverAlt ?? "Bar bottles on a shelf",
        href,
      };
    }
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
