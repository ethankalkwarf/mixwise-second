/**
 * Enriched Learn guides — layered lessons (big idea → core → deep dive → sources).
 */

import type { LearnPracticeDrink, LearnSection, LearnSource } from "@/lib/learnTypes";

export type LearnGuide = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  readingMinutes: number;
  topics: string[];
  coverImage: string;
  coverAlt: string;
  accentClass: string;
  practice: LearnPracticeDrink[];
  bigIdea: string;
  keyTakeaways: string[];
  sections: LearnSection[];
  deepDive: LearnSection[];
  sources: LearnSource[];
};

export const LEARN_GUIDES: LearnGuide[] = [
  {
    slug: "home-bar-fundamentals",
    title: "Home bar fundamentals",
    eyebrow: "Start here",
    summary:
      "What you actually need to make better drinks at home — tools, ice, citrus, and a short bottle list that covers most recipes.",
    readingMinutes: 4,
    topics: ["tools", "ice", "citrus", "bottles", "beginner"],
    coverImage: "/media/kitchen-shelf.webp",
    coverAlt: "Home bartender preparing cocktails at a bright kitchen counter",
    accentClass: "from-olive/30 via-cream to-cream",
    practice: [
      {
        slug: "gin-and-tonic",
        notice:
          "Pack the glass with ice and use fridge-cold tonic. If it tastes thin in two minutes, you under-iced it.",
      },
      {
        slug: "old-fashioned",
        notice:
          "Measure the sugar and bitters. Taste before the garnish — you want whiskey, not candy.",
      },
      {
        slug: "margarita",
        notice:
          "Squeeze the lime to order. If it tastes dull, the citrus is the first suspect — not the tequila.",
      },
      {
        slug: "negroni",
        notice:
          "Equal parts, stirred cold. If it tastes dusty or sharp, check the vermouth date.",
      },
    ],
    bigIdea:
      "A small, intentional kit — tools that measure and chill, ice you trust, fresh citrus, and a short bottle list — outperforms a crowded cart of half-used novelty bottles.",
    keyTakeaways: [
      "Five core tools cover almost every MixWise technique: shaker, strainer, jigger, barspoon, peeler.",
      "Ice size and quality control chill and dilution more than brand of spirit does for most home drinks.",
      "Squeeze citrus to order; dull juice is the most common reason a classic tastes “off.”",
      "One solid bottle per base spirit plus vermouth, orange liqueur, and Angostura unlocks most of the catalog.",
      "Buy for templates (sour, highball, old fashioned), not for one viral recipe.",
    ],
    sections: [
      {
        heading: "Build a small kit that works hard",
        kind: "rule",
        figure: "home-kit",
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
            "Think in templates, not viral recipes: a sour (spirit + citrus + sweet), a highball (spirit + cold lengthener), and an old fashioned (spirit + sugar + bitters) will teach you more than a seventh liqueur.",
          ],
        },
        {
          heading: "Why measuring beats freestyle early",
          body: [
            "Embury’s classic ratios and DeGroff’s bar math both assume precision: a half-ounce swing in citrus or syrup can flip a sour from bright to flabby. Until your eye and pour are calibrated, a jigger is not pedantry — it is how you learn what “balanced” feels like.",
            "Once you can taste a 2:1:1 Daiquiri and know it is right, free-pouring becomes a controlled choice, not a guess. Build muscle memory on measured drinks first.",
          ],
        },
      ],
    deepDive: [
      {
        heading: "Ice surface area and dilution",
        kind: "tip",
        body: [
          "Cold is transfer; dilution is melt. Large, dense cubes have less surface area relative to volume, so stirred drinks chill with less water. Cracked or small cubes dump chill (and melt) faster — useful in a hard shake, risky if you leave a built highball sitting.",
          "If your freezer ice is cloudy and brittle, favor shorter contact times or buy clearer bag ice for stirred serves. Soft ice is the silent reason home Manhattans taste thin.",
        ],
      },
      {
        heading: "Glassware that earns its shelf space",
        body: [
          "Start with a rocks glass, a highball or Collins, and a coupe or Nick & Nora. Chill glassware for drinks served up — a warm coupe undoes careful stirring. Skip specialty shapes until a drink family you love actually needs them.",
        ],
      },
    ],
    sources: [
      {
        label: "Dale DeGroff, The Craft of the Cocktail",
        note: "Home bar setup, measuring, and classic templates from a working-bar perspective.",
      },
      {
        label: "Jeffrey Morgenthaler, The Bar Book",
        note: "Practical tool and ice guidance grounded in modern bar technique.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Kit, mise en place, and how professionals think about a small, efficient station.",
      },
      {
        label: "David A. Embury, The Fine Art of Mixing Drinks",
        note: "Foundational ratios and the argument for precision over ornament.",
      },
    ],
  },
  {
    slug: "cocktail-templates",
    title: "Cocktail templates",
    eyebrow: "Structure",
    summary:
      "Most drinks are families, not one-offs. Learn three skeletons — plus equal parts — and improvisation stops being a guess.",
    readingMinutes: 3,
    topics: ["templates", "sour", "old-fashioned", "highball", "ratios", "beginner"],
    coverImage: "/learn/cocktail-templates.webp",
    coverAlt: "Three template drinks on a kitchen counter: a sour in a coupe, an old fashioned on a rock, and a highball",
    accentClass: "from-terracotta/15 via-cream to-olive/20",
    practice: [
      {
        slug: "daiquiri",
        notice:
          "Taste the 2:1:1 skeleton (rum, lime, syrup). If it’s flabby, the lime is tired or the syrup heavy — don’t add more rum first.",
      },
      {
        slug: "old-fashioned",
        notice:
          "Spirit, sugar, bitters, ice. Stir until the heat drops. The drink should still taste like whiskey.",
      },
      {
        slug: "gin-and-tonic",
        notice:
          "Ice first, gin, cold tonic last. A brief stir. If it dies in a minute, you under-iced or used warm tonic.",
      },
      {
        slug: "negroni",
        notice:
          "Equal parts still need a stir. If bitterness is harsh, the vermouth is often older than the Campari.",
      },
    ],
    bigIdea:
      "Stay inside a template first — sour, old fashioned, highball, or equal parts — then change one variable. Creativity lands on a balanced base, not a pile of bottles.",
    keyTakeaways: [
      "A sour is spirit + citrus + sweet. 2:1:1 (Daiquiri) is the home default; drier specs exist once you can taste it.",
      "An old fashioned is spirit + sugar + bitters + dilution. The whiskey should still be the point.",
      "A highball is spirit + a cold lengthener. Ice volume and fridge-cold bubbles matter more than the garnish.",
      "Equal parts (Negroni family) still need stirring and fresh vermouth — “equal” is not “skip the method.”",
      "When you invent, name the family first. Then change one thing.",
    ],
    sections: [
      {
        heading: "Name the family before you pour",
        kind: "rule",
        figure: "templates",
        body: [
          "If the drink has citrus, you are in sour territory. If it’s a spirit seasoned with sugar and bitters, it’s an old fashioned. If a cold soda, tonic, or ginger beer does the stretching, it’s a highball. If three modifiers share the glass in equal ounces, you’re in Negroni country.",
          "That name tells you the method (usually shake / stir / build), what “balanced” means, and which lever to touch when it tastes wrong.",
        ],
      },
      {
        heading: "The sour skeleton",
        body: [
          "Spirit, citrus, and sweetener. A Daiquiri at 2 oz rum / 1 oz lime / 1 oz syrup (or a tighter 2:¾:¾) is the fastest way to calibrate your palate. Embury’s older, drier 8:2:1 is a destination, not a first pour — you need to know what 2:1:1 tastes like before you start subtracting sugar.",
          "Egg white, fruit, and liqueurs are decorations on this frame. Fix sweet/sour before you add another modifier.",
        ],
      },
      {
        heading: "Old fashioned and highball",
        body: [
          "Old fashioned: a little sugar, a few dashes of bitters, a lot of spirit, and enough stir to take the ethanol heat off. If it tastes like candy, you oversweetened; if it burns, you under-diluted.",
          "Highball: packed ice, measured spirit, fridge-cold lengthener last, brief stir. The “recipe” is mostly temperature and bubbles. A Paloma, G&T, and Dark ’n Stormy are the same job in different bottles.",
        ],
      },
      {
        heading: "Change one variable",
        kind: "tip",
        body: [
          "Swap the spirit in a Daiquiri and you still have a sour. Swap the lengthener in a highball and you still have a highball. Change spirit, citrus, and sweetener at once and you can’t tell what worked.",
          "MixWise’s catalog is easier to shop once you think this way: gin + citrus + sweet covers a family; gin + vermouth + Campari covers another.",
        ],
      },
    ],
    deepDive: [
      {
        heading: "Embury, 2:1:1, and why both can be right",
        body: [
          "David Embury argued for a very dry sour — a lot of spirit, a little citrus, less sugar still. Modern bars often serve something closer to 2:1:1 or 2:¾:¾ because today’s palates (and today’s citrus) expect more brightness. Neither is dogma. The point is to pick a skeleton, taste it, and know which direction you moved.",
        ],
      },
      {
        heading: "Equal parts are a template too",
        kind: "tip",
        body: [
          "Negroni, Boulevardier, Last Word, Paper Plane: the ounces match so the method and the modifiers do the talking. They still need dilution (stir or shake, depending on citrus) and fresh bottles. “Equal parts” is a recipe shape, not an excuse to skip ice.",
        ],
      },
    ],
    sources: [
      {
        label: "David A. Embury, The Fine Art of Mixing Drinks",
        note: "The sour as a skeleton and the argument for knowing your ratios.",
      },
      {
        label: "Dale DeGroff, The Craft of the Cocktail",
        note: "Classic templates from a working-bar perspective.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Families of drinks and how bartenders think in structures.",
      },
    ],
  },
  {
    slug: "ice-and-dilution",
    title: "Ice and dilution",
    eyebrow: "Ingredients",
    summary:
      "Cold is heat leaving the drink; dilution is melt. Ice size, hardness, and contact time control both — more than the brand of spirit for most home cocktails.",
    readingMinutes: 3,
    topics: ["ice", "dilution", "temperature", "technique"],
    coverImage: "/learn/ice-and-dilution.webp",
    coverAlt: "Mixing glass packed with hard ice cubes and a barspoon on a kitchen counter",
    accentClass: "from-forest/20 via-cream to-olive/15",
    practice: [
      {
        slug: "manhattan",
        notice:
          "Hard cubes, full mixing glass. Taste at 20 seconds and at 30. You want the burn gone without the drink tasting thin.",
      },
      {
        slug: "daiquiri",
        notice:
          "Pack the tin. Stop when it hurts to hold. Extra shaking after that is mostly water.",
      },
      {
        slug: "gin-and-tonic",
        notice:
          "Fill the glass with ice, then tonic. Sparse ice is why highballs die in two minutes.",
      },
      {
        slug: "queens-park-swizzle",
        notice:
          "Crushed ice only. The frost on the glass is the cue you’ve diluted in place.",
      },
    ],
    bigIdea:
      "Ice is an ingredient: large hard cubes chill stirred drinks with less water; smaller or cracked ice dumps chill (and melt) faster in a shake; crushed ice is a texture, not a default.",
    keyTakeaways: [
      "Cold is transfer; dilution is melt. You want both, on purpose, in the right amount.",
      "Pack the tin or mixing glass — sparse ice melts too fast and never gets the drink cold.",
      "Soft freezer ice over-dilutes stirred drinks before they’re cold; use harder cubes or taste sooner.",
      "Once a shaker tin is painfully cold, extra time is mostly water.",
      "Crushed ice is for swizzles, juleps, and some tiki builds — not every highball.",
    ],
    sections: [
      {
        heading: "Treat ice like juice",
        kind: "rule",
        body: [
          "You wouldn’t use week-old lime without noticing. Wet, hollow freezer cubes are the same kind of ingredient failure. They dump water before they dump cold, which is why home Manhattans taste thin and home Daiquiris taste weak even when the bottles are good.",
          "Clearer, denser cubes have less surface area for their volume, so stirred drinks can get cold without turning into whiskey-flavored water.",
        ],
      },
      {
        heading: "Match the ice to the method",
        figure: "ice-types",
        body: [
          "Stirred spirit-forward drinks want large, hard cubes and a full mixing glass. Shaken sours want enough ice that the tin is packed — smaller or cracked cubes are fine because you want fast chill in 10–15 seconds.",
          "Built highballs want the glass packed so the drink stays cold while you sip. Crushed ice belongs in swizzles and juleps, where the texture is the point and the frost on the glass is your timer.",
        ],
      },
      {
        heading: "Taste, don’t worship the clock",
        kind: "tip",
        body: [
          "Dave Arnold’s chill curves show that most useful cooling happens early. After the tin frosts and hurts to hold, you are mostly adding water. Soft home ice reaches that over-dilution point faster than bar ice — shorten the shake if the drink tastes thin.",
          "For stirred drinks, taste: hot alcohol means keep going; watery means you overshot. Note your ice and your time so the next round isn’t a guess.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "A half-empty shaker. Warm soda over two cubes. Stirring for a full minute on wet ice. Using crushed ice in a Martini. Leaving a blender drink to “rest.” All of these are dilution mistakes dressed up as technique.",
        ],
      },
    ],
    deepDive: [
      {
        heading: "Surface area is the hidden spec",
        body: [
          "Melt rate tracks surface area. One big rock in a rocks glass keeps an Old Fashioned drinkable. The same ounces of pebble ice would wash it out. In a shake, high surface area is useful — you want the drink cold now, then out of the tin.",
          "If your freezer only makes brittle cubes, crack them for the shaker and save the best-looking ones for stirring — or buy a bag of denser ice for Manhattan night.",
        ],
      },
      {
        heading: "Dilution is the fourth ingredient",
        kind: "tip",
        body: [
          "Embury called it “weak”: water, soda, wine. A drink that tastes hot is often under-weakened, not over-proofed. A drink that tastes thin is over-weakened. Map the ice to that job instead of treating water as an accident.",
        ],
      },
    ],
    sources: [
      {
        label: "Dave Arnold, Liquid Intelligence",
        note: "Chill curves, dilution, and why the painful-tin cue beats a stopwatch.",
      },
      {
        label: "Jeffrey Morgenthaler, The Bar Book",
        note: "Practical ice guidance for working bars that translates at home.",
      },
      {
        label: "David A. Embury, The Fine Art of Mixing Drinks",
        note: "“Weak” as a structural part of the drink, not a flaw.",
      },
    ],
  },
  {
    slug: "shake-vs-stir",
    title: "When to shake vs stir",
    eyebrow: "Core technique",
    summary:
      "The rule of thumb, the exceptions, and how long to work the ice so dilution and texture land where you want them.",
    readingMinutes: 3,
    topics: ["shake", "stir", "technique", "dilution", "texture"],
    coverImage: "/learn/shake-vs-stir.webp",
    coverAlt: "Home bartender with a cocktail shaker, jigger, and lime on a wooden counter",
    accentClass: "from-forest/20 via-cream to-olive/15",
    practice: [
      {
        slug: "daiquiri",
        notice:
          "This is the shake. Stop when the tin hurts. If you stir it “to be fancy,” it will taste dense and less bright.",
      },
      {
        slug: "whiskey-sour",
        notice:
          "Citrus and egg want a shake (often dry, then wet). Stirring leaves the egg under-emulsified and the drink less lively.",
      },
      {
        slug: "manhattan",
        notice:
          "All spirits. Stir for clarity and silk. Shaking it won’t ruin it — it will cloud it and add more water than the template wants.",
      },
      {
        slug: "martini",
        notice:
          "Same rule as the Manhattan. Taste cold and dense, not frothy. Express lemon after you strain.",
      },
    ],
    bigIdea:
      "Shake to integrate and aerate cloudy or acidic mixes; stir to chill all-spirit drinks while preserving clarity and denser texture — time and ice control dilution either way.",
    keyTakeaways: [
      "Citrus, egg, and dairy almost always want a shake; all-spirit drinks usually want a stir.",
      "Shaking adds air and faster dilution; stirring keeps the drink denser and clearer.",
      "Aim for ~10–15 seconds hard shake or ~20–30 seconds stir with plenty of ice.",
      "Not enough ice melts too fast and warms the drink unevenly — pack the tin or mixing glass.",
      "Taste temperature and softness, not the clock alone; ice quality changes timing.",
    ],
    sections: [
      {
        heading: "Cloudy or clear?",
        kind: "rule",
        figure: "shake-or-stir",
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
        {
          heading: "What shaking actually does",
          body: [
            "A hard shake is simultaneous heat exchange, dilution, and aeration. Tiny air bubbles lighten mouthfeel and help emulsify citrus oils, egg proteins, and cream. That is why a Daiquiri tastes brighter shaken than stirred — not only colder.",
            "Most of the useful cooling happens early. After the tin is painfully cold, extra shaking mostly adds water. Stop when the outside frosts and your hands hurt — that sensory cue beats a stopwatch with soft home ice.",
          ],
        },
      ],
    deepDive: [
      {
        heading: "Stirring for clarity and density",
        kind: "tip",
        body: [
          "Stirring minimizes foam and keeps dissolved solids from scattering light — spirit-forward drinks stay jewel-clear. Smooth circles with the spoon against the glass avoid whipping air in.",
          "Target roughly 20–25% dilution by volume for many stirred classics (Embury-era ratios assume this softening). If the drink still burns, keep stirring; if it tastes thin, you overshot — note your ice and time for next round.",
        ],
      },
      {
        heading: "Exceptions worth knowing",
        body: [
          "Some modern bars shake certain spirit-forward drinks for texture on purpose. Some egg drinks get a dry shake (no ice) first to build foam, then a wet shake to chill. The rule of thumb is a default, not dogma — understand the physics, then break it intentionally.",
        ],
      },
    ],
    sources: [
      {
        label: "Dave Arnold, Liquid Intelligence",
        note: "Dilution, chill curves, and the science behind shake vs stir timing.",
      },
      {
        label: "Dale DeGroff, The Craft of the Cocktail",
        note: "Classic technique cues for shaken sours and stirred spirit drinks.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Method selection and professional stirring/shaking standards.",
      },
      {
        label: "Difford's Guide — Shake vs stir",
        note: "Accessible reference on when each method is preferred.",
        href: "https://www.diffordsguide.com/",
      },
    ],
  },
  {
    slug: "balance-and-taste",
    title: "Balance: sweet, sour, strong, weak",
    eyebrow: "Palate training",
    summary:
      "How to taste a drink like a bartender and fix it in the glass — without rewriting the whole recipe.",
    readingMinutes: 3,
    topics: ["balance", "tasting", "sweet", "sour", "fix"],
    coverImage: "/learn/balance-and-taste.webp",
    coverAlt: "Overhead flat lay of citrus, spirits, and ice while slicing lime for cocktails",
    accentClass: "from-terracotta/15 via-cream to-olive/20",
    practice: [
      {
        slug: "margarita",
        notice:
          "Too sweet? Add citrus (and check it’s fresh). Too hot? A longer shake or a splash more lime — not another ounce of tequila first.",
      },
      {
        slug: "whiskey-sour",
        notice:
          "Taste temperature, then bright vs sweet. Fix with drops and barspoons, then re-taste. Don’t rewrite the whole pour.",
      },
      {
        slug: "tom-collins",
        notice:
          "A sour with length. If it’s flat, the soda died or the lemon is tired — not “the recipe.”",
      },
      {
        slug: "negroni",
        notice:
          "Bitter should be framed, not buried. If it’s dusty-sharp, check vermouth before you add syrup.",
      },
    ],
    bigIdea:
      "Balance is a conversation among strong (spirit), sour (acid), sweet (sugar), and weak (dilution or length) — taste in that order, then fix the smallest lever first.",
    keyTakeaways: [
      "Taste temperature and aroma before judging sweetness or bitterness.",
      "Embury’s sour skeleton (spirit + citrus + sweet) is still the fastest mental model for citrus drinks.",
      "Fix with drops and barspoons, not whole new ounces — small levers, re-taste.",
      "Flat drinks are often dead citrus or lost carbonation, not “wrong recipe.”",
      "Stay inside a template when improvising; creativity lands better on a balanced base.",
    ],
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
        {
          heading: "Embury’s four parts in practice",
          figure: "four-parts",
          body: [
            "David Embury framed cocktails as strong, sour, sweet, and weak. “Weak” is dilution, soda, wine, or water — the softening agent. A drink that tastes hot is often under-diluted, not over-proofed; a drink that tastes thin is over-weakened.",
            "Map every tweak to one of the four. Adding syrup without acid tips sweet; adding citrus without sugar tips sour. Name the imbalance before you reach for the bottle.",
          ],
        },
      ],
    deepDive: [
      {
        heading: "Acid type and perceived sweetness",
        kind: "tip",
        body: [
          "Lemon and lime are not interchangeable by volume alone — lime often reads sharper and more aromatic, lemon broader and softer. Switching fruit can feel like changing the sugar ratio even when ounces stay fixed.",
          "Salt (a pinch in a Margarita, or a salted rim) suppresses bitterness and lifts fruit without adding sugar. Use it as a seasoning, not a garnish gimmick.",
        ],
      },
      {
        heading: "Bitter drinks and the “round, don’t erase” rule",
        body: [
          "Negronis and other bitter builds want sweetness and dilution to frame Campari or amaro — not to bury them. If bitterness is harsh, check vermouth freshness and ice first; oxidized sweet vermouth makes bitter drinks taste dusty and sharp.",
        ],
      },
    ],
    sources: [
      {
        label: "David A. Embury, The Fine Art of Mixing Drinks",
        note: "The strong / sour / sweet / weak framework still used to diagnose balance.",
      },
      {
        label: "Dale DeGroff, The Craft of the Cocktail",
        note: "Palate training and classic template thinking for working bartenders.",
      },
      {
        label: "Jeffrey Morgenthaler, The Bar Book",
        note: "Practical notes on syrups, citrus, and fixing drinks in service.",
      },
      {
        label: "Difford's Guide — Cocktail balance",
        note: "Reference ratios and style notes across classic templates.",
        href: "https://www.diffordsguide.com/",
      },
    ],
  },
  {
    slug: "garnish-with-intent",
    title: "Garnish with intent",
    eyebrow: "Presentation",
    summary:
      "Garnish is aroma and signal — not decoration for its own sake. How to express citrus, use mint, and know when to leave a drink naked.",
    readingMinutes: 3,
    topics: ["garnish", "citrus", "mint", "aroma"],
    coverImage: "/learn/garnish-with-intent.webp",
    coverAlt: "Hand placing a grapefruit wedge garnish on a rocks cocktail",
    accentClass: "from-olive/25 via-cream to-terracotta/10",
    practice: [
      {
        slug: "old-fashioned",
        notice:
          "Express orange over the surface, then wipe the rim. Smell before you sip — the oil should hit first.",
      },
      {
        slug: "mojito",
        notice:
          "Slap the mint for the garnish. Don’t shred it into the muddle. If it smells like lawn, you overdid the leaves in the glass.",
      },
      {
        slug: "martini",
        notice:
          "A thin lemon peel, pith side down. If it tastes pithy, the cut was too thick.",
      },
      {
        slug: "gin-gin-mule",
        notice:
          "Mint should perfume the first sip. Place it so the drinker’s nose hits the sprig.",
      },
    ],
    bigIdea:
      "Garnish is the first aroma the guest gets — citrus oils, slapped herbs, or deliberate absence — and it should match the drink’s flavor architecture, not just look pretty.",
    keyTakeaways: [
      "Express peel oils over the surface; the aroma hit often matters more than the twist left in the glass.",
      "Minimize pith — bitter white pith muddies delicate stirred drinks.",
      "Slap mint to wake oils; don’t shred it into grassy bitterness.",
      "Fresh garnish is part of the recipe; wilted herbs signal carelessness.",
      "Some drinks are better naked — clutter can fight mezcal, Chartreuse, or bitters.",
    ],
    sections: [
      {
        heading: "Citrus peels are perfume",
        kind: "rule",
        figure: "garnish-citrus",
        body: [
          "Express a peel over the drink so oils hit the surface, then optionally wipe the rim. That aroma hit is often more important than the twist sitting in the glass.",
          "Avoid thick pithy peels when you can — bitter white pith muddies a Martini or Old Fashioned.",
        ],
      },
      {
        heading: "Mint and herbs",
        figure: "garnish-mint",
        body: [
          "Slap mint gently between your palms to wake the oils, then place it so the drinker smells it on the first sip. Do not shred mint into a mojito muddle.",
          "Wilted herbs look and taste tired. Fresh garnish is part of the recipe, not an afterthought.",
        ],
      },
      {
        heading: "When no garnish is correct",
        kind: "tip",
        figure: "garnish-none",
        body: [
          "Many stirred equal-parts drinks and some sours are better ungarnished. If the recipe says none, trust it — clutter can fight the aroma of Chartreuse, mezcal, or bitters.",
        ],
      },
    ],
    deepDive: [
      {
        heading: "What “expressing” oils actually does",
        body: [
          "Citrus flavedo holds aromatic oils (limonene and related terpenes). Pinching the peel skin-out over the glass sprays a fine mist onto the surface; those volatiles hit the nose before the liquid hits the tongue, so the first impression is brighter and more citrus-forward than juice alone can achieve.",
          "A rim wipe deposits oil where the lip meets the glass — useful on Martinis and Old Fashioneds. Dropping an unexpressed twist in the drink adds slower, milder aroma and a little bitterness as it sits.",
        ],
      },
      {
        heading: "Herb handling without chlorophyll bitterness",
        kind: "mistakes",
        body: [
          "Crushing mint cell walls releases grassy green notes that read as bitter and vegetal. A slap bruises just enough to perfume; a few gentle muddle presses in syrup are enough for a Mojito. If the drink smells like lawn clippings, you overdid it.",
          "Store herbs upright in water or wrapped loosely in the fridge. Garnish last, after the drink is strained — heat and time wilt aroma fast.",
        ],
      },
      {
        heading: "Choosing the signal",
        body: [
          "Orange oil flatters whiskey and sweet vermouth; lemon lifts gin and dry profiles; grapefruit suits agave and bitter highballs. Match the peel to the drink’s dominant aromatic family so garnish reinforces, rather than argues with, the sip.",
        ],
      },
    ],
    sources: [
      {
        label: "Dale DeGroff, The Craft of the Cocktail",
        note: "Expressing citrus and garnish as aroma, not ornament.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Herb handling, twists, and when to skip garnish.",
      },
      {
        label: "Jeffrey Morgenthaler, The Bar Book",
        note: "Practical citrus prep and presentation standards.",
      },
      {
        label: "Dave Arnold, Liquid Intelligence",
        note: "Volatile aromatics and why surface oils change perception.",
      },
    ],
  },
  {
    slug: "vermouth-and-modifiers",
    title: "Vermouth, wine & modifiers",
    eyebrow: "Bottles",
    summary:
      "The silent reason home Manhattans and Negronis taste dusty — how to buy, fridge, and season with vermouth, aperitivi, and bitters.",
    readingMinutes: 3,
    topics: ["vermouth", "bitters", "campari", "modifiers", "oxidation"],
    coverImage: "/learn/vermouth-and-modifiers.webp",
    coverAlt: "Vermouth and modifier bottles stored cold on a refrigerator shelf",
    accentClass: "from-olive/25 via-cream to-terracotta/10",
    practice: [
      {
        slug: "manhattan",
        notice:
          "If it tastes flat, nutty-stale, or dusty, the vermouth is the suspect — not the whiskey. Open a fresher bottle and stir again.",
      },
      {
        slug: "negroni",
        notice:
          "Equal parts. Harsh, dusty bitterness is often oxidized sweet vermouth. Campari is stable; the wine is not.",
      },
      {
        slug: "martini",
        notice:
          "Dry vermouth belongs in the fridge. A “dry” Martini with tired vermouth just tastes like cold gin and dust.",
      },
      {
        slug: "americano",
        notice:
          "Campari, vermouth, cold soda. The build is simple so the vermouth has nowhere to hide.",
      },
    ],
    bigIdea:
      "Vermouth is fortified wine — it oxidizes. Refrigerate after opening, finish it in weeks, and treat bitters and bitter aperitivi as seasoning, not as bottles that last forever in flavor.",
    keyTakeaways: [
      "Sweet, dry, and blanc vermouth are different modifiers, not a flavor slider on one bottle.",
      "Fridge after opening. Counter vermouth is why last month’s Manhattan tasted stale.",
      "Campari and most bitters are more stable; the wine in the drink is the perishable part.",
      "Aperol is not stealth Campari — sweeter, lighter, less bitter. Taste and adjust.",
      "Bitters are salt and spice: dashes, not ounces, unless the recipe is a bitter build.",
    ],
    sections: [
      {
        heading: "Refrigerate vermouth after you open it",
        kind: "rule",
        figure: "vermouth-care",
        body: [
          "Vermouth is aromatized, fortified wine. The fortification helps it last longer than a table white, not forever. Oxygen and heat dull the herbs and leave a nutty, stale edge that reads as “this cocktail is bad” when the whiskey was fine.",
          "Buy a bottle you will finish in a few weeks of actual mixing. Split a 375 ml if Manhattans are a sometimes drink. Refrigerate the moment you open it.",
        ],
      },
      {
        heading: "Sweet, dry, blanc — pick the job",
        body: [
          "Sweet (rosso) vermouth is the Manhattan and Negroni partner — caramel, spice, bitter-sweet herbs. Dry vermouth is the Martini’s whisper of wine and botanicals. Blanc/bianco sits in between: sweeter than dry, paler than rosso, useful in modern gin drinks.",
          "They are not interchangeable by the ounce. Swapping dry into a Manhattan makes a different, leaner drink; swapping sweet into a Martini makes a wet, clumsy one.",
        ],
      },
      {
        heading: "Bitter modifiers and bitters",
        kind: "tip",
        body: [
          "Campari, other red bitter aperitivi, and amari are closer to liqueurs than to wine — they keep. They still aren’t 1:1 with each other. Aperol in a Negroni is a softer, sweeter cousin; don’t expect Campari’s grip.",
          "Aromatic bitters (Angostura and friends) are seasoning. A few dashes frame whiskey and vermouth. Dumping a tablespoon in an Old Fashioned is a different recipe, not a louder version of the same one.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Vermouth on a warm cart for six months. Using the same bottle for Martinis and Manhattans because “it’s vermouth.” Fixing a dusty Negroni with more sugar instead of a fresher rosso. Measuring bitters like a liqueur.",
        ],
      },
    ],
    deepDive: [
      {
        heading: "How long is “fresh enough”?",
        body: [
          "There is no single date stamp, but working bartenders treat opened vermouth as a perishable measured in weeks, not seasons. If it smells like leftover white wine and walnuts instead of herbs and fruit, it’s done. Write the open date on the label.",
          "Unopened bottles still fade slowly. Don’t hoard a “good” vermouth for years before cracking it for one Manhattan.",
        ],
      },
      {
        heading: "Orange liqueur is a modifier too",
        kind: "tip",
        body: [
          "A dry orange liqueur (Cointreau-style) is structural in a Margarita — it’s the sweet side of a sour, plus aroma. A cheap, syrupy triple sec shifts the template toward candy. Stay dry unless you taste and cut the syrup elsewhere.",
        ],
      },
    ],
    sources: [
      {
        label: "Adam Ford, Vermouth: The Revival of the Spirit that Created America's Cocktail Culture",
        note: "Category history and why vermouth belongs in the fridge.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Modifier selection and service standards for wine-based bottles.",
      },
      {
        label: "Dale DeGroff, The Craft of the Cocktail",
        note: "Manhattan/Martini construction when the vermouth is actually alive.",
      },
      {
        label: "Jeffrey Morgenthaler, The Bar Book",
        note: "Practical notes on syrups, citrus, and the bottles that season a drink.",
      },
    ],
  },
  {
    slug: "spirit-primer-agave",
    title: "Agave primer: tequila & mezcal",
    eyebrow: "Spirits",
    summary:
      "Blanco, reposado, añejo, and mezcal — what changes in the glass and how to choose for Margaritas, Palomas, and spirit-forward serves.",
    readingMinutes: 4,
    topics: ["tequila", "mezcal", "agave", "margarita"],
    coverImage: "/learn/spirit-primer-agave.webp",
    coverAlt: "Blue agave field in Jalisco with mountains beyond",
    accentClass: "from-terracotta/20 via-cream to-olive/15",
    practice: [
      {
        slug: "margarita",
        notice:
          "Blanco 100% agave, fresh lime. If it tastes oaky-dessert, you used a reposado or añejo that wants a different template.",
      },
      {
        slug: "paloma",
        notice:
          "A highball: packed ice, cold grapefruit lengthener last. Blanco still fits; loud mezcal can take over.",
      },
      {
        slug: "mezcal-margarita",
        notice:
          "Start with Espadín. If smoke buries the lime, split with blanco tequila instead of pouring more citrus.",
      },
      {
        slug: "tommy-s-margarita",
        notice:
          "Tequila, lime, agave syrup — no orange liqueur. This is the blanco-purity test. Mixto will taste flat here.",
      },
    ],
    bigIdea:
      "Agave spirits are defined by plant, process, and aging — choose blanco for brightness, oak-aged tequila for softness and spice, and mezcal for smoke and earth, always preferring 100% agave.",
    keyTakeaways: [
      "Blanco keeps bright agave and pepper — default for Margaritas and highballs.",
      "Reposado and añejo add oak; use them when you want softness or Old Fashioned-style builds.",
      "Mezcal’s smoke comes largely from pit-roasting agave; Espadín is the versatile starting point.",
      "Buy 100% agave — mixtos taste flatter and behave worse in cocktails.",
      "Match intensity: loud mezcal can overwhelm equal-parts drinks; restrained bottles play nicer with citrus.",
    ],
    sections: [
      {
        heading: "Categories that matter at home",
        kind: "rule",
        figure: "agave-ages",
        body: [
          "Blanco (unaged or briefly rested) keeps bright agave and pepper — ideal for Margaritas and highballs. Reposado softens with light oak. Añejo leans dessert-spice and works in Old Fashioned builds.",
          "Mezcal adds smoke and earth. Espadín is the approachable workhorse; louder mezcals can dominate equal-parts drinks.",
        ],
      },
      {
        heading: "100% agave only",
        kind: "mistakes",
        body: [
          "Mixto tequilas (up to 49% of fermentable sugars from sources other than agave) taste flatter and sweeter in cocktails. Look for “100% agave” on the label.",
        ],
      },
      {
        heading: "Matching drink to bottle",
        body: [
          "Bright citrus drinks want blanco or a restrained mezcal. Stirred vermouth drinks can handle reposado or softer mezcal. Spicy Margaritas still need a clean base — heat should come from chili, not harsh spirit.",
        ],
      },
    ],
    deepDive: [
      {
        heading: "Tequila aging categories, usefully",
        body: [
          "Mexican CRT categories, usefully: blanco is unaged or aged less than two months in oak (often also rested in stainless); reposado ages in oak from two months up to a year; añejo from one to three years; extra añejo longer than three. Oak adds vanilla, caramel, and spice while rounding raw pepper — it also mutes some fresh agave snap.",
          "Tommy’s-style Margaritas (tequila, lime, agave syrup) showcase blanco purity. A reposado Margarita tastes rounder and dessert-adjacent; an añejo “Margarita” often wants less citrus sweetness and more Old Fashioned thinking.",
        ],
      },
      {
        heading: "Mezcal vs tequila — process, not just “smoke”",
        kind: "tip",
        body: [
          "Most tequila (blue Weber agave, defined regions) is typically cooked in above-ground ovens or autoclaves. Traditional mezcal often roasts agave in earthen pits, which lays down the phenolic smoke people notice in the glass — though not every mezcal is aggressively smoky.",
          "Espadín is the widely planted workhorse and a smart house mezcal. Other agaves (Tobalá, Tepeztate, etc.) can be floral, savory, or wild — beautiful neat, trickier when citrus and sugar compete. Start Espadín in cocktails; graduate to louder bottles when you know the template.",
        ],
      },
      {
        heading: "Additive-aware shopping (without paranoia)",
        body: [
          "Some commercial tequilas use permitted additives for smoothness and aroma. If a bottle tastes like vanilla candy or perfume more than cooked agave, it may not shine in a simple Margarita. Favor producers known for agave-forward profiles when the spirit is the drink’s backbone.",
        ],
      },
    ],
    sources: [
      {
        label: "Emma Janzen, Mezcal: The History, Craft & Cocktails of the World's Ultimate Artisanal Spirit",
        note: "Accessible deep dive on mezcal production, agave varieties, and drinking culture.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Agave spirits in a cocktail context — selection and classic serves.",
      },
      {
        label: "Difford's Guide — Tequila & mezcal",
        note: "Category overviews and cocktail applications.",
        href: "https://www.diffordsguide.com/",
      },
      {
        label: "IBA — Official cocktail references",
        note: "Canonical specs for classics like the Margarita when you want a shared baseline.",
        href: "https://iba-world.com/",
      },
    ],
  },
  {
    slug: "spirit-primer-whiskey",
    title: "Whiskey primer: bourbon, rye & beyond",
    eyebrow: "Spirits",
    summary:
      "Bourbon, rye, Scotch, and Irish — how they differ, how American whiskey history shaped the classics, and which bottle to pour for Old Fashioneds, Manhattans, and whiskey sours.",
    readingMinutes: 5,
    topics: [
      "whiskey",
      "bourbon",
      "rye",
      "scotch",
      "irish",
      "history",
      "old-fashioned",
      "manhattan",
    ],
    coverImage: "/learn/spirit-primer-whiskey.webp",
    coverAlt: "Charred oak whiskey barrels stacked in a quiet aging warehouse",
    accentClass: "from-terracotta/25 via-cream to-olive/15",
    practice: [
      {
        slug: "old-fashioned",
        notice:
          "Bourbon for round vanilla-oak; rye when you want spice and a drier finish. Measure sugar and bitters — taste before the peel.",
      },
      {
        slug: "manhattan",
        notice:
          "Rye is the classic snap against sweet vermouth. Bourbon works, but the drink reads sweeter. Fridge the vermouth.",
      },
      {
        slug: "whiskey-sour",
        notice:
          "Bourbon or a soft Irish blend both fit. Fresh lemon. If it tastes thin, check citrus and shake length before blaming the whiskey.",
      },
      {
        slug: "boulevardier",
        notice:
          "Equal parts whiskey, Campari, sweet vermouth. Bourbon softens the bitter; rye keeps it lean. Stir cold.",
      },
    ],
    bigIdea:
      "Whiskey styles are not interchangeable seasoning — mash bill, cask, and history decide sweetness, spice, and smoke, so choose the bottle for the template you are pouring.",
    keyTakeaways: [
      "When a recipe says only “whiskey,” American tradition usually means bourbon or rye.",
      "Bourbon (corn + new charred oak) is rounder — default for Old Fashioneds and many sours.",
      "Rye is drier and spicier — the classic Manhattan and Sazerac spine; it nearly vanished after Prohibition and came back with the cocktail revival.",
      "Blended Scotch and Irish blends are lighter mixing pours; peat is aroma, not a silent swap for bourbon.",
      "Buy a solid ~45–50% ABV bottle you like neat — timid 40% whiskey disappears under sugar and citrus.",
    ],
    sections: [
      {
        heading: "Four styles that matter at home",
        kind: "rule",
        figure: "whiskey-styles",
        body: [
          "Bourbon is at least 51% corn and aged in new charred oak — vanilla, caramel, corn sweetness. It is the usual home pour for Old Fashioneds and whiskey sours. It may be made anywhere in the United States; Kentucky is tradition, not a legal requirement.",
          "Rye is at least 51% rye grain — pepper, baking spice, a drier finish. Manhattans and Boulevardiers were written for that snap; bourbon softens them. US rye also ages in new charred oak, so it shares bourbon’s vanilla frame with a leaner grain center.",
          "Scotch must be distilled and aged in Scotland (at least three years in oak). Blended Scotch is the cocktail workhorse — highballs, Rob Roy, Penicillin base. Heavily peated malt is seasoning — a float or rinse — unless the recipe wants smoke up front.",
          "Irish whiskey is often lighter and softer, especially everyday blends (often triple-distilled). Single pot still — malted and unmalted barley, unique to Ireland — carries more body for stirred drinks; light blends shine in highballs and gentle sours.",
        ],
      },
      {
        heading: "How American whiskey history shows up in your glass",
        body: [
          "Nineteenth-century American bars poured mostly rye. The Manhattan (New York, 1870s–80s) and the Sazerac (New Orleans — cognac first, then rye) were built on that spice. The whiskey cocktail that became the Old Fashioned — spirit, sugar, bitters, water or ice — and the whiskey sour are the same era’s templates.",
          "After Prohibition, bourbon’s corn economics and broader distribution made it the default supermarket whiskey. Rye nearly left the back bar. Mid-century American recipes that say only “whiskey” often silently assume bourbon.",
          "The cocktail revival of the 2000s brought rye back because Manhattans and Sazeracs taste flabby when corn sweetness is the only whiskey in the glass. Reading a recipe’s era is often enough to choose a bottle.",
        ],
      },
      {
        heading: "Match the bottle to the template",
        figure: "whiskey-drinks",
        body: [
          "Old fashioned family (spirit + sugar + bitters): bourbon for round oak, rye when you want spice without extra sweetness. Fruit muddled in the glass is a later restaurant habit — not the structure.",
          "Manhattan family (whiskey + sweet vermouth + bitters): rye keeps vermouth from turning the drink into dessert; bourbon is a legitimate softer cousin. A Rob Roy is the same idea on Scotch.",
          "Whiskey sour: bourbon or a friendly Irish blend. Peated Scotch will usually bury the lemon unless you are building a Penicillin-style drink on purpose.",
          "If the line only says “whiskey,” pour bourbon or rye — not Scotch — unless the drink’s name or notes point elsewhere.",
        ],
      },
      {
        heading: "Proof and one good bottle",
        kind: "tip",
        body: [
          "Mixing whiskey around 45–50% ABV holds up when sugar, citrus, or vermouth enter the glass. A shy 40% pour can taste thin the moment you add sweetener.",
          "You do not need a whiskey library to start. One solid bourbon you enjoy neat covers Old Fashioneds and sours; add rye when Manhattans become a habit. Scotch and Irish can wait until a recipe names them.",
        ],
      },
      {
        heading: "Common swaps that quietly change the drink",
        kind: "mistakes",
        body: [
          "Substituting bourbon for rye in a Manhattan is fine — call it what it is: rounder and sweeter, not “the same drink.”",
          "Pouring peated Scotch into a standard whiskey sour usually tastes like smoke fighting lemon, not a clever upgrade.",
          "Canadian whisky labeled “rye” is often a milder grain blend; it will not automatically taste like US straight rye.",
        ],
      },
    ],
    deepDive: [
      {
        heading: "Why American whiskey tastes of vanilla",
        body: [
          "New charred oak is load-bearing for bourbon and US rye: the char and fresh wood pull vanillin, caramelized sugars, and toasted notes into the spirit. Scotch and much Irish whiskey typically age in used barrels (often ex-bourbon or sherry), so oak reads softer and the grain and peat (if any) stay more visible.",
          "That is why a bourbon Old Fashioned and a Scotch Rob Roy can share a template and still taste like different families — same bones, different wood and grain.",
        ],
      },
      {
        heading: "Scotch categories, usefully",
        kind: "tip",
        body: [
          "Single malt: one distillery, malted barley, pot stills. Beautiful neat; in cocktails it can dominate unless the recipe wants that character.",
          "Blended Scotch: malt whisky for flavor plus column-distilled grain whisky for lightness — the practical mixing pour for highballs and most vermouth drinks on Scotch.",
          "Peat phenols are aromatic intensity, not proof. The Penicillin (Sam Ross) shakes lemon and honey-ginger with a gentler whisky, then floats or finishes with a smoky malt so smoke is perfume, not the entire palate.",
        ],
      },
      {
        heading: "Irish pot still vs the soft blend",
        body: [
          "Unmalted barley in the mash is the sensory signature of Irish single pot still whiskey — oilier, spicier, closer to a mixing whiskey that can stand up in stirred drinks.",
          "Everyday Irish blends are often the lightest whiskey on a home shelf. They excel in highballs and gentle sours; they go slack in a rye Manhattan unless you choose a richer pot-still bottle.",
        ],
      },
      {
        heading: "Spelling, geography, and the shopping aisle",
        body: [
          "Ireland and the United States usually spell whiskey; Scotland (and often Canada and Japan) use whisky. The letter does not decide the cocktail — mash bill and cask do.",
          "Japanese whisky and other world whiskeys can be excellent neat; for MixWise classics, start with the style the recipe’s era assumes, then experiment once the template tastes right.",
        ],
      },
    ],
    sources: [
      {
        label: "David Wondrich, Imbibe!",
        note: "Historical context for 19th-century whiskey cocktails and the American bar.",
      },
      {
        label: "Robert Simonson, The Old-Fashioned",
        note: "How the whiskey cocktail became the Old Fashioned — structure over fruit salad.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Whiskey selection and classic stirred/shaken serves in a modern bar context.",
      },
      {
        label: "Difford's Guide — Whisky & whiskey",
        note: "Category overviews and cocktail applications.",
        href: "https://www.diffordsguide.com/",
      },
    ],
  },
  {
    slug: "spirit-labels-intro",
    title: "Spirit labels decoded",
    eyebrow: "Labels",
    summary:
      "Every bottle mixes law and marketing — learn the universal rules (proof, age, origin) and how to spot words that actually mean something.",
    readingMinutes: 5,
    topics: ["labels", "proof", "age-statement", "spirits", "shopping"],
    coverImage: "/learn/spirit-labels-intro.webp",
    coverAlt:
      "Two Evan Williams bourbon bottles side by side — bottled-in-bond white label next to standard black label",
    accentClass: "from-sage/25 via-cream to-forest/10",
    practice: [
      {
        slug: "old-fashioned",
        notice:
          "Before you buy for stirred drinks: find the style word (bourbon, rye), proof near 45–50%, and “straight” or bottled-in-bond if you can. Adjectives come last.",
      },
      {
        slug: "margarita",
        notice:
          "Flip the bottle: “100% de agave” and a NOM number matter more than gold medals on the front label.",
      },
      {
        slug: "manhattan",
        notice:
          "Sweet vermouth has a use-by date; whiskey has legal categories. Read both labels — half the drink is wine.",
      },
      {
        slug: "penicillin",
        notice:
          "Blended Scotch on the label is the shake base; peated single malt is the finish — two different label promises in one drink.",
      },
    ],
    bigIdea:
      "Spirit labels are half regulation and half sales copy — learn the few words governments enforce so you shop for cocktails, not neck-tag poetry.",
    keyTakeaways: [
      "Regulated words constrain mash, place, age, or additives; marketing words usually do not.",
      "Proof (US) or ABV tells you if the spirit will survive sugar and citrus in the glass.",
      "When Scotch prints “12 Years,” every drop is at least that old — not an average of young and old casks.",
      "Origin and denomination (Scotland, Mexico, Kentucky vs US) are legal geography, not romance.",
      "Read style first, proof second, adjectives never — until you know the template.",
    ],
    sections: [
      {
        heading: "Two languages on every bottle",
        kind: "rule",
        figure: "label-trust",
        body: [
          "Governments allow certain words only if production rules are met: bourbon, tequila, Scotch whisky, bottled-in-bond, 100% de agave. Everything else — small batch, craft, reserve, hand-selected — is mostly decoration unless a number (proof, age, NOM) backs it up.",
          "Your job at the shelf is boring and powerful: find the category word, check proof, note origin, then decide if the price matches the promise.",
        ],
      },
      {
        heading: "Proof, ABV, and why cocktails care",
        figure: "label-reading",
        body: [
          "Alcohol percentage is one of the few honest numbers on the label. US labels show proof (twice the ABV) or ABV directly. A 40% whiskey often tastes thin once you add syrup or lemon; 45–50% usually holds its ground.",
          "“Cask strength” with a stated proof is useful — it tells you the bottle was not cut to a standard 40%. “Barrel proof” without numbers is just tone-setting.",
        ],
      },
      {
        heading: "When the label shows an age",
        kind: "tip",
        figure: "age-on-label",
        body: [
          "On Scotch (and Irish whiskey), a printed age is a legal floor: if it says 10 or 12 Years, the youngest whisky in that bottle is at least that old. Older casks can go in the blend; younger ones cannot.",
          "No age on the label (NAS) is allowed. It does not mean the whisky is young; it means they chose not to print a floor. Tequila uses different words entirely — blanco, reposado, añejo — covered in the agave labels lesson, not year-counts like Scotch.",
        ],
      },
      {
        heading: "Origin, denomination, and the “where” line",
        body: [
          "Tequila and mezcal are Mexican denominations of origin — geography and agave rules are load-bearing. Scotch must be made in Scotland. Bourbon must be made in the United States (Kentucky is marketing, not law).",
          "“Product of” and “distilled in” lines matter when a recipe assumes a flavor profile. Canadian “rye,” US rye, and Scotch single malt are not interchangeable just because they all say whisky.",
        ],
      },
      {
        heading: "Brand names vs category words",
        kind: "mistakes",
        body: [
          "A famous brand name does not tell you the legal category. Read the small type: blended Scotch vs single malt, mixto vs 100% agave, straight bourbon vs whiskey flavored with additives.",
          "Limited editions and celebrity bottles can be perfectly good — or perfectly ordinary juice in expensive glass. Category and proof tell you how it will behave in a Daiquiri or Manhattan; hype does not.",
        ],
      },
    ],
    deepDive: [
      {
        heading: "Why labels got strict in the first place",
        body: [
          "Nineteenth-century spirits were often adulterated — neutral spirit, coloring, and flavor sold as whiskey or gin. The US Bottled-in-Bond Act (1897) and later TTB rules, Mexican CRT standards, and Scotch Whisky Association law all exist because buyers could not trust the liquid from looks alone.",
          "That history is why “straight” and “100% agave” still matter: they are survivals of consumer protection, not pedantry.",
        ],
      },
      {
        heading: "Back-label zones (any spirit)",
        kind: "tip",
        body: [
          "Front label: brand story and romance. Back or side label: category, proof, producer, sometimes NOM or DSP number, government warnings. The back is where cocktail shopping happens.",
          "If you photograph a bottle at home for notes, blur personal info — but capture category, proof, and any age or NOM line. That is your shopping cheat sheet for the next bottle.",
        ],
      },
      {
        heading: "When to ignore the label and taste",
        body: [
          "Labels cannot tell you if you will like the bottle neat. They can tell you if it fits the drink you are building. Once category matches template, trust your palate over medals.",
        ],
      },
    ],
    sources: [
      {
        label: "27 CFR Part 5 — US distilled spirits labeling",
        note: "Federal definitions behind bourbon, rye, straight, and proof statements.",
        href: "https://www.ecfr.gov/current/title-27/chapter-I/subchapter-A/part-5",
      },
      {
        label: "Scotch Whisky Regulations 2009",
        note: "Legal Scotch categories and age rules.",
        href: "https://www.legislation.gov.uk/uksi/2009/2890/contents",
      },
      {
        label: "Consejo Regulador del Tequila (CRT)",
        note: "Official tequila denomination and labeling standards.",
        href: "https://www.crt.org.mx/",
      },
    ],
  },
  {
    slug: "spirit-labels-whiskey",
    title: "American whiskey labels",
    eyebrow: "Labels",
    summary:
      "Bourbon, rye, straight, bottled-in-bond, Tennessee whiskey — and the Canadian “rye” trap that confuses Manhattan shopping.",
    readingMinutes: 5,
    topics: ["whiskey", "bourbon", "rye", "labels", "bottled-in-bond", "tennessee"],
    coverImage: "/learn/spirit-labels-whiskey.webp",
    coverAlt:
      "Wild Turkey Rare Breed bourbon bottle showing Kentucky straight bourbon whiskey and barrel proof on the label",
    accentClass: "from-forest/15 via-cream to-terracotta/20",
    practice: [
      {
        slug: "old-fashioned",
        notice:
          "Straight bourbon or bonded bourbon around 45–50% ABV is the reliable Old Fashioned base. Wheated bourbons read softer; high-rye bourbons read spicier.",
      },
      {
        slug: "manhattan",
        notice:
          "US straight rye is the historical Manhattan spine. If the label only says “whiskey” with no mash hint, assume bourbon-soft unless you taste it.",
      },
      {
        slug: "whiskey-sour",
        notice:
          "Bonded bourbon holds lemon and sugar well. Finished whiskeys (port barrel, etc.) can taste like dessert — fine if intentional.",
      },
      {
        slug: "sazerac",
        notice:
          "Straight rye + Peychaud’s + absinthe rinse. Cognac Sazeracs are historical; rye is the modern default — check the label says rye, not just “whiskey.”",
      },
    ],
    bigIdea:
      "American whiskey labels encode mash bill and barrel law — bourbon and rye are not vibes, and bottled-in-bond is still one of the best cocktail shopping shortcuts.",
    keyTakeaways: [
      "Bourbon: ≥51% corn, new charred oak, made in the US — Kentucky optional.",
      "Rye: ≥51% rye, same new-oak framework — drier Manhattan fuel.",
      "Straight = ≥2 years, no added flavor/color; bonded = 50% ABV, 4+ years, one season.",
      "Tennessee whiskey adds charcoal filtering before aging — often softer in the glass.",
      "Canadian “rye” is often a nickname, not US straight rye.",
    ],
    sections: [
      {
        heading: "Words with rules vs words that sell",
        kind: "rule",
        figure: "whiskey-labels",
        body: [
          "Load-bearing US terms: bourbon, rye whiskey, wheat whiskey, corn whiskey, straight, bottled-in-bond, Tennessee whiskey (when defined by state/federal recognition). Decoration: small batch, craft, reserve, master distiller’s pick.",
          "For cocktails, hunt style + proof first. Bonded whiskey (look for the green strip on many US bottles) is a built-in quality floor for stirred drinks.",
        ],
      },
      {
        heading: "Bourbon and rye — mash on the label",
        body: [
          "Bourbon must be ≥51% corn, distilled ≤160 proof, entered into new charred oak ≤125 proof, bottled ≥80 proof. No minimum age — unless it says straight.",
          "Rye whiskey uses the same barrel rules with ≥51% rye. High-rye bourbon (not labeled rye) still exists — taste pepper and dry finish to guess mash tilt.",
          "Neither requires Kentucky. “Kentucky straight bourbon” is geography + straight minimum, not a separate spirit species.",
        ],
      },
      {
        heading: "Straight and bottled-in-bond",
        kind: "tip",
        body: [
          "Straight whiskey: aged ≥2 years in new charred oak, no added flavoring or coloring. If aged 2–3 years, age must appear on the label.",
          "Bottled-in-bond: product of one US distilling season, one distillery, aged ≥4 years, bottled at 100 proof (50% ABV). Born from anti-adulteration law — still a trustworthy mixing proof.",
        ],
      },
      {
        heading: "Tennessee whiskey and other American footnotes",
        body: [
          "Tennessee whiskey is generally bourbon-eligible spirit filtered through maple charcoal (Lincoln County Process) before aging. Expect softer, polished oak in Old Fashioneds.",
          "American single malt is a growing TTB category — not bourbon or rye. Treat it like a malt-forward whiskey until you know the house style.",
        ],
      },
      {
        heading: "Irish, Canadian, and the rye trap",
        kind: "mistakes",
        body: [
          "Irish whiskey: distilled on the island of Ireland, aged ≥3 years. “Single pot still” signals body; light blends are gentle sours, weak rye substitutes in Manhattans.",
          "Canadian whisky labeled “rye” may contain little rye grain. For US cocktail specs that say rye, buy US straight rye or read the mash notes carefully.",
        ],
      },
    ],
    deepDive: [
      {
        heading: "DSP numbers and distillers",
        body: [
          "US labels often list DSP (Distilled Spirits Plant) numbers or “distilled by” vs “produced by.” Distilled by usually means the company ran the still; produced by can mean sourced juice blended elsewhere. Sourced whiskey is not bad — but transparency helps you repeat a great Manhattan.",
        ],
      },
      {
        heading: "Finishes and flavored whiskey",
        kind: "tip",
        body: [
          "Port-finished, sherry-finished, or honey-flavored whiskeys are legally distinct from straight bourbon/rye. They can make interesting sips but move away from classic Old Fashioned and Manhattan balance unless you adjust sweetness.",
        ],
      },
      {
        heading: "Shopping examples (categories, not endorsements)",
        body: [
          "Bonded bourbon or rye for stirred templates. High-proof but not finished bourbon for sours. Save allocated hype bottles for neat pours — label law does not make a 40% NAS whiskey magically hold up in citrus.",
        ],
      },
    ],
    sources: [
      {
        label: "27 CFR Part 5 — Labeling and Advertising of Distilled Spirits (US)",
        href: "https://www.ecfr.gov/current/title-27/chapter-I/subchapter-A/part-5",
      },
      {
        label: "TTB — Bourbon whisky standards of identity",
        href: "https://www.ttb.gov/",
      },
      {
        label: "Chuck Cowdery — American whiskey writing",
        note: "Straight, bonded, and sourced-whiskey explainers for drinkers.",
      },
    ],
  },
  {
    slug: "spirit-labels-agave",
    title: "Agave spirit labels",
    eyebrow: "Labels",
    summary:
      "100% de agave vs mixto, CRT aging tiers, NOM traceability, and mezcal categories — what Mexican law allows on the label and what Margaritas need.",
    readingMinutes: 5,
    topics: ["tequila", "mezcal", "labels", "CRT", "NOM", "100-agave"],
    coverImage: "/learn/spirit-labels-agave.webp",
    coverAlt:
      "Corralejo tequila blanco bottle label showing 100% de agave and blanco category text",
    accentClass: "from-terracotta/20 via-cream to-olive/15",
    practice: [
      {
        slug: "margarita",
        notice:
          "100% de agave blanco, fresh lime. If the label skips “100%” or hides mixto in small type, the sour will taste flat before the salt rim matters.",
      },
      {
        slug: "paloma",
        notice:
          "Blanco still fits highballs. Loud mezcal labels (esp. pechuga or wild agave) can dominate grapefruit — read intensity, not just ABV.",
      },
      {
        slug: "tommy-s-margarita",
        notice:
          "Tommy’s is a blanco purity test — agave syrup, lime, tequila. Mixto fails here before craft ice can save it.",
      },
      {
        slug: "mezcal-margarita",
        notice:
          "Espadín on the label is the cocktail workhorse. If smoke buries lime, split with blanco tequila rather than fighting with more citrus.",
      },
    ],
    bigIdea:
      "Tequila and mezcal labels are Mexican law in miniature — 100% agave, NOM, and CRT aging words decide whether your Margarita tastes bright or flat.",
    keyTakeaways: [
      "100% de agave = all fermentable sugar from agave; mixto allows up to 49% other sugars.",
      "CRT aging: blanco, reposado, añejo, extra añejo — oak time with legal minimums.",
      "NOM identifies the permitted producer — useful traceability, not a quality score.",
      "Tequila is blue Weber agave in defined states; mezcal is broader agave and process.",
      "Hecho en México and denomination lines are geography law, not souvenir copy.",
    ],
    sections: [
      {
        heading: "The four lines that matter most",
        kind: "rule",
        figure: "agave-labels",
        body: [
          "1) “100% de agave” (tequila) or joven/espadín class (mezcal). 2) CRT category — blanco, reposado, añejo, extra añejo. 3) NOM #### (Norma Oficial Mexicana producer ID). 4) Hecho en México / denominación de origen.",
          "Skip front-label medals until those four check out for cocktail bases.",
        ],
      },
      {
        heading: "100% agave vs mixto",
        kind: "mistakes",
        body: [
          "Mixto tequila needs only 51% agave sugars; the rest can be cane or other sugars. It often tastes sweeter, thinner, and harsher in a lime-heavy sour.",
          "100% de agave must be labeled clearly. If the bottle only says “tequila” without 100%, assume mixto unless the back label proves otherwise.",
        ],
      },
      {
        heading: "CRT aging categories (tequila)",
        figure: "agave-ages",
        body: [
          "Blanco: unaged or <2 months rest. Reposado: 2 months–1 year in oak. Añejo: 1–3 years. Extra añejo: >3 years. Oak adds vanilla and roundness — it also mutes fresh agave snap.",
          "Margaritas and Palomas want blanco or restrained reposado. Añejo tequila in a sour is an Old Fashioned mindset — less lime sweetness, more spirit-forward balance.",
        ],
      },
      {
        heading: "Mezcal labels — species and process",
        kind: "tip",
        body: [
          "Mezcal labels may list agave species (Espadín, Tobalá, etc.) and production (ancestral, artesanal, mezcal). Pit-roasted agave brings smoke phenols — not every mezcal is heavily peated in style, but tradition leans smoky.",
          "Espadín is the volume workhorse for cocktails. Wild or single-village agaves can be stunning neat and loud in equal-parts drinks.",
        ],
      },
      {
        heading: "NOM and additive transparency",
        body: [
          "NOM ties a bottle to a permitted distillery — helpful when you find a house style you trust. It is not a rating.",
          "Some tequilas use permitted additives (abocantes) for smoothness or flavor. If a blanco tastes like vanilla candy or perfume, suspect additives before blaming your lime. Additive-free or traditionally made bottlings often shine in Tommy’s-style specs.",
        ],
      },
    ],
    deepDive: [
      {
        heading: "Denomination geography, briefly",
        body: [
          "Tequila’s denomination covers specific Mexican states with blue Weber agave. Mezcal has its own map (Oaxaca heartland plus other permitted regions). “Hecho en México” on authentic bottles reflects export and CRT compliance — not generic Latin branding.",
        ],
      },
      {
        heading: "Mixto history and why bars went 100%",
        kind: "tip",
        body: [
          "Mid-century volume tequila leaned mixto for cost. Modern cocktail bars pushed 100% agave because lime and salt expose off-sugars fast. Home bars benefit from the same rule: buy 100% for anything citrus-forward.",
        ],
      },
      {
        heading: "When reposado or añejo makes sense on the label",
        body: [
          "Oak-aged tequila for stirred, spirit-forward builds (reposado Old Fashioned riffs) or slow sippers. Not default for bright Margaritas — the label age word tells you which template to use.",
        ],
      },
    ],
    sources: [
      {
        label: "Consejo Regulador del Tequila (CRT)",
        href: "https://www.crt.org.mx/",
      },
      {
        label: "Emma Janzen, Mezcal: The History, Craft & Cocktails of the World's Ultimate Artisanal Spirit",
        note: "Mezcal categories and label literacy for drinkers.",
      },
      {
        label: "NOMILA — Mexican official standards registry",
        note: "Primary NOM texts for tequila and mezcal.",
        href: "https://www.dof.gob.mx/normasOficiales.php",
      },
    ],
  },
  {
    slug: "spirit-labels-scotch",
    title: "Scotch whisky labels",
    eyebrow: "Labels",
    summary:
      "Single malt vs blend, age statements, regions, and peat — what Scottish law requires and how to buy for Rob Roys, highballs, and Penicillins.",
    readingMinutes: 4,
    topics: ["scotch", "whisky", "labels", "single-malt", "blend", "peat"],
    coverImage: "/learn/spirit-labels-scotch.webp",
    coverAlt:
      "Laphroaig 10 year old bottle and tube showing Islay single malt Scotch whisky and age statement",
    accentClass: "from-olive/20 via-cream to-forest/15",
    practice: [
      {
        slug: "penicillin",
        notice:
          "Label plan: blended Scotch for the shaken base; Islay or heavily peated malt for the float — two categories, one drink.",
      },
      {
        slug: "manhattan",
        notice:
          "A Rob Roy is a Manhattan on Scotch. Blended Scotch keeps vermouth in check; peated single malt as the base can taste like smoke soup.",
      },
      {
        slug: "old-fashioned",
        notice:
          "Scotch Old Fashioneds want malt and oak, not corn vanilla. Blended Scotch is gentler; single malt is louder — adjust sugar down if needed.",
      },
      {
        slug: "whiskey-sour",
        notice:
          "Standard whiskey sours assume bourbon/rye. Unpeated blended Scotch can work as a softer sour; peated malt usually fights lemon unless you mean it.",
      },
    ],
    bigIdea:
      "Scotch labels describe production architecture — malt vs grain, blend vs single distillery, youngest age in the mix — not a quality score.",
    keyTakeaways: [
      "Scotch must be distilled and aged ≥3 years in Scotland.",
      "Single malt = one distillery, malted barley, pot stills. Blended = malt + grain recipe.",
      "Age statement = a legal floor (youngest whisky in the bottle) — not a quality score.",
      "Regions (Islay, Speyside, etc.) hint at peat and fruit; they are not legal quality tiers.",
      "Peated malt is intensity, not a separate legal bottle type — read ppm or distillery style.",
    ],
    sections: [
      {
        heading: "Category words on Scotch labels",
        kind: "rule",
        figure: "scotch-labels",
        body: [
          "Single malt Scotch whisky: one distillery, malted barley, pot stills. Blended Scotch whisky: blend of malt and grain whiskies from multiple distilleries — the usual cocktail workhorse.",
          "Single grain Scotch is one distillery, column still grain whisky — often a blend component, occasionally bottled alone. None of these words rank quality; they describe how it was built.",
        ],
      },
      {
        heading: "Age statements and NAS",
        body: [
          "If the label says 12 Years, every drop in the bottle is at least 12 years old. Older whisky can be blended in; younger cannot. Think of the number as a legal floor, not a score or an average of cask ages.",
          "No age statement (NAS) Scotch is legal and common. Producers may use younger stock with creative cask finishing. Taste for cocktails; do not assume NAS means cheap.",
        ],
      },
      {
        heading: "Regions, peat, and flavor hints",
        kind: "tip",
        body: [
          "Islay malts often carry peat smoke; Speyside and many Highlands lean fruit and malt. Regions are stylistic maps, not laws — always taste.",
          "Peat is measured in ppm (phenol parts per million) on some technical sheets, rarely on front labels. For cocktails, think aroma intensity: float peated malt on a Penicillin, do not shake a full pour unless you want smoke as the main ingredient.",
        ],
      },
      {
        heading: "Blended for cocktails, single malt for character",
        body: [
          "Rob Roy, Scotch highball, Blood and Sand (with Scotch in the family): blended Scotch keeps balance. Single malt shines when the recipe names it or when you want one distillery’s fingerprint.",
          "Finished Scotch (sherry cask, port cask) reads on the label — wine notes can clash with vermouth or amplify it. Know which you are buying.",
        ],
      },
      {
        heading: "Spelling and export labels",
        kind: "mistakes",
        body: [
          "Whisky without the e is standard in Scotland. ABV is shown for export; US proof may appear on American import labels. Category lines remain the same.",
          "“Scotch whisky” is protected — if it says Scotch, it was made in Scotland. “Whiskey” on a Scottish bottle would be wrong; if you see it, read carefully for blended American imports instead.",
        ],
      },
    ],
    deepDive: [
      {
        heading: "Why blends dominate the back bar",
        body: [
          "Blended Scotch exists because column-still grain whisky adds lightness and volume while malts add flavor — intentional recipe design. Famous blends are not “lesser” malts; they are different engineering for consistency and highballs.",
        ],
      },
      {
        heading: "Penicillin label strategy",
        kind: "tip",
        body: [
          "Sam Ross’s Penicillin uses mild blended Scotch in the shaker and Islay malt on top. The label lesson: buy two categories — workhorse blend + peated malt — instead of one expensive single malt trying to do both jobs.",
        ],
      },
      {
        heading: "Independent bottlers and single casks",
        body: [
          "Independent bottlers buy casks and label with distillery name under license. Cask strength and single cask lines show exact proof — excellent for nerds, unpredictable for house cocktail specs unless you standardize.",
        ],
      },
    ],
    sources: [
      {
        label: "Scotch Whisky Regulations 2009",
        href: "https://www.legislation.gov.uk/uksi/2009/2890/contents",
      },
      {
        label: "Scotch Whisky Association — legal guidance",
        href: "https://www.scotch-whisky.org.uk/",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Scotch in modern cocktails — blend vs malt choices.",
      },
    ],
  },

  {
    slug: "spirit-primer-gin",
    title: "Gin primer: botanicals & classics",
    eyebrow: "Spirits",
    summary:
      "London dry vs contemporary gin, why botanicals matter in Martinis and Negronis, and how to pick a bottle that still tastes like gin after tonic or vermouth.",
    readingMinutes: 5,
    topics: ["gin", "botanicals", "martini", "negroni", "g&t"],
    coverImage: "/learn/spirit-primer-gin.webp",
    coverAlt: "A gin and tonic with ice and lime, gin bottle softly blurred behind",
    accentClass: "from-olive/25 via-cream to-forest/15",
    practice: [
      {
        slug: "gin-and-tonic",
        notice:
          "London dry wants a dry tonic and a lean garnish. If the gin tastes soapy or candy-sweet neat, tonic will amplify it — not hide it.",
      },
      {
        slug: "martini",
        notice:
          "Stir cold and dense. A juniper-forward gin keeps vermouth from turning the drink into perfume water.",
      },
      {
        slug: "negroni",
        notice:
          "Equal parts. A soft contemporary gin can disappear under Campari; a classic London dry holds the bitter.",
      },
      {
        slug: "last-word",
        notice:
          "Equal-parts sour with green Chartreuse. Loud gin is fine — the template already has volume.",
      },
    ],
    bigIdea:
      "Gin is a flavored spirit with a juniper legal spine — choose a bottle for how its botanicals behave under tonic, vermouth, or citrus, not for the prettiest bottle art.",
    keyTakeaways: [
      "Juniper must be perceptible for it to be gin; everything else is house style.",
      "London dry is the reliable cocktail default — dry, juniper-led, no post-distillation sweetening.",
      "Contemporary / new-wave gins can be citrus- or floral-forward — great neat or in G&Ts, riskier in Negronis.",
      "Tonic is a lengthener with bitterness; it reveals gin character instead of covering flaws.",
      "For Martinis and Negronis, buy a gin you like with a whisper of vermouth — not only with soda.",
    ],
    sections: [
      {
        heading: "What the law actually requires",
        kind: "rule",
        figure: "gin-styles",
        body: [
          "Gin is a distilled spirit flavored so that juniper is the predominant botanical character. That is the load-bearing rule — not “clear” and not “tastes like Christmas.”",
          "Beyond juniper, producers build a botanical recipe: coriander, citrus peel, angelica, orris, and dozens of others. Those choices decide whether the gin reads piney, citrusy, floral, spicy, or soft.",
        ],
      },
      {
        heading: "London dry vs contemporary",
        body: [
          "London dry is a production style (not a geography requirement): distilled with botanicals, no sweetening after distillation beyond a tiny allowance, and a dry profile. It is the usual home pour for Martinis, Negronis, and classic G&Ts.",
          "Contemporary gins often push citrus, cucumber, floral, or spice notes. They can make a brilliant highball and a muddy Negroni. Taste neat with a drop of water before you commit a whole bottle to equal-parts drinks.",
        ],
      },
      {
        heading: "Match the bottle to the template",
        figure: "gin-drinks",
        body: [
          "Highball (G&T): almost any good gin works if tonic is cold and ice is packed. Soft gins need a leaner tonic; juniper bombs can handle a fuller one.",
          "Martini family: juniper and structure matter — you are mostly tasting gin and a little wine. Soft floral gins can taste like cold cologne once vermouth is gone.",
          "Negroni family: Campari is loud. Choose a gin that still reads as gin after equal parts bitter and sweet vermouth.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Buying gin only for the G&T, then wondering why the Martini tastes hollow.",
          "Treating “craft” or “small batch” as a quality score — those words are marketing, not London dry.",
          "Using warm tonic and three cubes, then blaming the gin for a flat highball.",
        ],
      },
    ],
    deepDive: [
      {
        heading: "Old Tom, navy strength, and genever (useful footnotes)",
        kind: "tip",
        body: [
          "Old Tom is a slightly sweeter historic style — useful in older recipes that assume a softer gin. Navy strength / overproof gin (often ~57% ABV) holds citrus and sugar in sours; it is not a silent swap for 40% London dry by the ounce.",
          "Genever (Dutch) is malt-forward and closer to whiskey in some stirred drinks. It is a cousin, not a 1:1 London dry substitute.",
        ],
      },
      {
        heading: "Tonic is not neutral water",
        body: [
          "Quinine bitterness and sweetness vary wildly by brand. A “bad G&T” is often mismatched tonic or warm soda — not a bad gin. Taste tonic alone once so you know what you are lengthening with.",
        ],
      },
    ],
    sources: [
      {
        label: "Dave Broom, Gin: The Manual",
        note: "Style maps and tasting language for modern gin.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Gin in classic templates — Martini, Negroni, sour applications.",
      },
      {
        label: "Difford's Guide — Gin",
        note: "Category overview and cocktail applications.",
        href: "https://www.diffordsguide.com/",
      },
    ],
  },
  {
    slug: "spirit-primer-rum",
    title: "Rum primer: from Daiquiri to Mojito",
    eyebrow: "Spirits",
    summary:
      "White vs aged, clean Spanish-style vs funky Jamaican — how rum style changes a Daiquiri, Mojito, or highball, and which bottle to buy first.",
    readingMinutes: 5,
    topics: ["rum", "daiquiri", "mojito", "aging", "molasses"],
    coverImage: "/learn/spirit-primer-rum.webp",
    coverAlt: "A classic Daiquiri in a stemmed cocktail glass on dark wood",
    accentClass: "from-terracotta/20 via-cream to-olive/15",
    practice: [
      {
        slug: "daiquiri",
        notice:
          "Clean white or lightly aged rum, fresh lime, simple syrup. If it tastes like banana candy or varnish, the rum style is fighting the sour.",
      },
      {
        slug: "mojito",
        notice:
          "Same acid-sweet skeleton as a Daiquiri, lengthened and muddled. A clean rum keeps mint bright; a heavy funk rum can taste muddy with soda.",
      },
      {
        slug: "dark-n-stormy",
        notice:
          "Ginger beer wants a rum with enough body to stand up — often a richer aged or navy-style pour. Check the trademarked Gosling’s spec if you care about the classic name.",
      },
      {
        slug: "mai-tai",
        notice:
          "Often a blend of rums. Start with a solid aged rum before chasing five bottles of tiki inventory.",
      },
    ],
    bigIdea:
      "Rum is not one flavor — molasses or cane, column or pot still, and aging decide whether a drink tastes clean-lime, caramel-oak, or funky-ester, so pick the style for the template.",
    keyTakeaways: [
      "A clean white rum is the Daiquiri and Mojito default — bright lime needs a quiet backbone.",
      "Aged rum adds oak and caramel; great in stirred or richer drinks, heavier in a classic Daiquiri.",
      "“Funky” Jamaican-style rums bring esters (banana, overripe fruit) — seasoning, not always the whole pour.",
      "Color is not a legal age grade — some dark rums are colored; taste and producer notes beat bottle tint.",
      "Buy one versatile white and one solid aged bottle before a tiki shelf.",
    ],
    sections: [
      {
        heading: "What rum is (usefully)",
        kind: "rule",
        figure: "rum-styles",
        body: [
          "Rum is distilled from sugarcane products — molasses or fresh cane juice — then often aged. Unlike bourbon, there is no single global mash-and-barrel law, so “rum” covers a wide range of production styles.",
          "For cocktails, think in jobs: clean mixing rum for citrus, aged rum for body and oak, funky rum for aroma intensity.",
        ],
      },
      {
        heading: "White, gold, dark — and what they don’t guarantee",
        body: [
          "White / silver rum is often lightly aged and filtered for clarity — not necessarily unaged. It is the usual Daiquiri spine.",
          "Gold and dark labels can mean oak time, caramel coloring, or both. Do not trust color alone. If a “dark” rum tastes mostly like sweet caramel syrup, it may fight a dry sour.",
        ],
      },
      {
        heading: "Match rum to the drink",
        figure: "rum-drinks",
        body: [
          "Daiquiri / Mojito: clean white or restrained lightly aged rum. Fresh lime is the star.",
          "Highballs (Dark ’n’ Stormy family): rum with enough weight for ginger spice.",
          "Tiki / Mai Tai family: often blended — start simple, add funk as a fraction, not the whole pour, until you know the recipe.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Using a heavily funky rum as a silent swap in a standard Daiquiri.",
          "Assuming spiced rum equals aged rum — spice blends are a different product.",
          "Building a Mojito with warm soda and shredded mint, then blaming the rum.",
        ],
      },
    ],
    deepDive: [
      {
        heading: "Spanish style, Jamaican funk, agricole (quick map)",
        kind: "tip",
        body: [
          "Spanish-style (often column still, molasses) tends clean and versatile. Jamaican pot-still traditions can be high-ester and aromatic. Rhum agricole (cane juice, often French Caribbean) reads grassy and bright — beautiful, but a different Daiquiri.",
          "You do not need all three to start. One clean white + one solid aged covers most MixWise rum recipes.",
        ],
      },
      {
        heading: "Proof still matters",
        body: [
          "Same rule as whiskey: ~40% rum can taste thin under sugar and citrus. A notch higher ABV holds a Daiquiri better. Overproof rums are tools — measure carefully.",
        ],
      },
    ],
    sources: [
      {
        label: "Martin Cate, Smuggler's Cove",
        note: "Rum categories for drinks — pragmatic, cocktail-first.",
      },
      {
        label: "Difford's Guide — Rum",
        note: "Style overviews and classic applications.",
        href: "https://www.diffordsguide.com/",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Rum in Daiquiris, Mojitos, and punch logic.",
      },
    ],
  },
  {
    slug: "batching-and-hosting",
    title: "Batching for guests",
    eyebrow: "Hosting",
    summary:
      "How to scale a sour or Negroni for a table without watery pitchers — when to dilute ahead, what to leave for the last second, and how to serve without babysitting every glass.",
    readingMinutes: 4,
    topics: ["batching", "hosting", "dilution", "party"],
    coverImage: "/learn/batching-and-hosting.webp",
    coverAlt: "Several guest cocktails and a pitcher on a bright kitchen table",
    accentClass: "from-forest/15 via-cream to-terracotta/15",
    practice: [
      {
        slug: "negroni",
        notice:
          "Equal parts batch cleanly. Stir with ice to taste, or pre-dilute with cold water (~20–25% by volume), chill hard, and serve up or on a rock.",
      },
      {
        slug: "daiquiri",
        notice:
          "Batch the rum + syrup; add lime as close to service as you can. Citrus dulls in a warm pitcher.",
      },
      {
        slug: "manhattan",
        notice:
          "Spirit-forward batches love the fridge. Pre-dilute, chill bottles or a pitcher, pour into cold glassware.",
      },
      {
        slug: "margarita",
        notice:
          "Same citrus rule as the Daiquiri — acid last. Salt rims can be prepped; foam and fresh shake still win for VIP glasses.",
      },
    ],
    bigIdea:
      "A batch is a recipe multiplied — plus a dilution plan — so guests get cold, balanced drinks while you stay in the conversation.",
    keyTakeaways: [
      "Scale ingredients by the same ratio; do not “eyeball the pitcher.”",
      "Spirit-forward drinks batch best; citrus drinks want acid close to service.",
      "Pre-dilution (about one-fifth water) replaces stirring/shaking when you serve from a cold bottle or pitcher.",
      "Fridge-cold glassware and packed ice matter more once you are not shaking each drink.",
      "Keep one à la minute option for guests who want foam, spice, or a special garnish.",
    ],
    sections: [
      {
        heading: "What batches well",
        kind: "rule",
        figure: "batching-map",
        body: [
          "Stirred spirit-forward drinks (Negroni, Manhattan, Martini) batch beautifully: measure, dilute, chill, pour.",
          "Sours batch the spirit + sweetener easily; citrus is the fragile part. Either juice to order into a pre-batched base, or accept that a pitcher of citrus drinks has a shorter peak window.",
        ],
      },
      {
        heading: "Dilution is part of the recipe",
        body: [
          "When you shake or stir single serves, melt water is intentional. In a batch, add cold water on purpose — often around 20–25% of the alcoholic volume for stirred drinks — then taste. Under-diluted batches taste hot; over-diluted batches taste thin before the party starts.",
          "Chill the batch for at least an hour. Warm pre-diluted liquid tastes flat even when the ratios are right.",
        ],
      },
      {
        heading: "Service flow beats perfectionism",
        kind: "tip",
        body: [
          "Set a station: cold batch, cold glasses, ice, garnish tray, one shaker for specials. Guests should not watch you do long division.",
          "Label allergens and proof honestly if you are hosting mixed company — especially egg whites and unexpected mezcal heat.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Batching lime juice at noon for an 8pm party.",
          "Skipping dilution because “it’s already in a pitcher with ice” — then serving warm, hot-alcohol drinks.",
          "Building eight different cocktails instead of one batched classic plus one flexible highball.",
        ],
      },
    ],
    deepDive: [
      {
        heading: "A practical Negroni batch (thinking, not a brand pitch)",
        kind: "tip",
        body: [
          "Equal parts gin, sweet vermouth, Campari. Multiply by servings. Add cold water (~20–25% of total spirits+modifiers), stir, taste, adjust. Bottle or pitcher in the fridge. Serve over a large cube or up in a cold glass with an orange peel.",
          "Vermouth still oxidizes — batch what you will finish that night or the next day.",
        ],
      },
      {
        heading: "Sour batches without sadness",
        body: [
          "Mix rum (or whiskey) + syrup cold. Hold citrus separately. At service, combine, shake hard with ice in small waves, or build a pitcher with fresh juice and accept a 30–60 minute peak. Foam (egg white) does not batch gracefully for a crowd — offer it as a special.",
        ],
      },
    ],
    sources: [
      {
        label: "Jeffrey Morgenthaler, The Bar Book",
        note: "Practical batching and service mindset from a working bar.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Dilution and hospitality standards that scale to home hosting.",
      },
      {
        label: "Dave Arnold, Liquid Intelligence",
        note: "Why chill and dilution curves matter when you leave the shaker behind.",
      },
    ],
  },
  {
    slug: "equal-parts-bitters",
    title: "Equal parts & bitter drinks",
    eyebrow: "Templates",
    summary:
      "The Negroni family and other equal-parts builds — why dilution still matters, how Campari differs from Aperol, and when to rinse instead of pour.",
    readingMinutes: 4,
    topics: ["negroni", "equal-parts", "campari", "aperitivo", "boulevardier"],
    coverImage: "/learn/equal-parts-bitters.webp",
    coverAlt: "A Negroni in a rocks glass with a large ice cube and orange peel",
    accentClass: "from-terracotta/25 via-cream to-olive/10",
    practice: [
      {
        slug: "negroni",
        notice:
          "Equal parts gin, sweet vermouth, Campari. Stir cold. If it tastes candy-hot, you under-diluted — not “too much Campari.”",
      },
      {
        slug: "boulevardier",
        notice:
          "Whiskey stands in for gin. Bourbon softens; rye keeps it lean. Same stir discipline.",
      },
      {
        slug: "americano",
        notice:
          "Campari, sweet vermouth, cold soda — the highball cousin. Packed ice or it dies.",
      },
      {
        slug: "paper-plane",
        notice:
          "Equal parts with amaro and citrus — a modern sour-equal hybrid. Fresh lemon still decides brightness.",
      },
    ],
    bigIdea:
      "Equal parts is a recipe shape, not a free pass on ice — bitter aperitivi need dilution, cold, and the right bitter intensity for the glass.",
    keyTakeaways: [
      "Equal parts still needs “weak”: stir on ice until hot alcohol softens.",
      "Campari is bitter-forward; Aperol is sweeter and lighter — not a silent swap.",
      "Sweet vermouth is perishable; dusty Negronis are often oxidized wine, not bad gin.",
      "Boulevardier and Negroni share bones; whiskey vs gin changes the mid-palate.",
      "Rinses (absinthe, etc.) add aroma without rewriting the equal-parts math.",
    ],
    sections: [
      {
        heading: "Equal parts is a skeleton",
        kind: "rule",
        figure: "equal-parts-grid",
        body: [
          "The Negroni’s power is simplicity: one part gin, one part sweet vermouth, one part bitter. That clarity is why small mistakes — warm glass, short stir, tired vermouth — show immediately.",
          "Other equal-parts drinks (Last Word, Paper Plane, many modern specs) use the same honesty: every ingredient is audible.",
        ],
      },
      {
        heading: "Bitter bottles are not interchangeable",
        body: [
          "Campari brings bitterness and weight. Aperol brings orange sweetness and less grip. Swapping them makes a different drink — lovely if intentional, confusing if you expected a Negroni.",
          "Amari vary even more. When a recipe names a bottle, treat it like a category choice, not a vibe.",
        ],
      },
      {
        heading: "Dilution and the rock",
        kind: "tip",
        body: [
          "Stir until the drink tastes integrated, then strain over a large cube or serve up. A small pile of wet ice in the glass will keep watering the drink while you talk.",
          "Orange oil on top is seasoning — express a peel, don’t muddle a wheel into the equal parts.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Shaking a Negroni for “texture.” You get dilution and cloud without the silk of a stir.",
          "Building with counter vermouth from last winter.",
          "Calling every red bitter drink a Negroni — guests deserve the honest name (Boulevardier, Americano, spritz family).",
        ],
      },
    ],
    deepDive: [
      {
        heading: "Americano and the highball cousin",
        body: [
          "Campari + sweet vermouth + soda is the Negroni’s lengthened relative. It teaches the same bitter-sweet wine idea with bubbles. Pack ice; use cold soda; brief stir.",
        ],
      },
      {
        heading: "Rinse vs pour",
        kind: "tip",
        body: [
          "An absinthe rinse on a Sazerac-adjacent drink (or a whisper in some modern specs) adds aroma without a full equal part. Coat, discard excess — perfume, not volume.",
        ],
      },
    ],
    sources: [
      {
        label: "Gary Regan, The Negroni",
        note: "History and variations around the equal-parts bitter template.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Aperitivo service and stirred equal-parts practice.",
      },
      {
        label: "Difford's Guide — Negroni",
        note: "Specs and related serves.",
        href: "https://www.diffordsguide.com/",
      },
    ],
  },
  {
    slug: "citrus-and-syrups",
    title: "Citrus & syrups",
    eyebrow: "Ingredients",
    summary:
      "Why fresh juice beats the bottle, how rich simple changes a sour, and the small acid/sugar habits that fix thin, sweet, or dull drinks.",
    readingMinutes: 4,
    topics: ["citrus", "syrup", "acid", "sour", "oleo"],
    coverImage: "/learn/citrus-and-syrups.webp",
    coverAlt: "A whole lemon and lime on a light surface",
    accentClass: "from-olive/20 via-cream to-terracotta/15",
    practice: [
      {
        slug: "daiquiri",
        notice:
          "Fresh lime only. If it tastes dull, juice age or bottled lime is the first suspect — before the rum.",
      },
      {
        slug: "whiskey-sour",
        notice:
          "Lemon is rounder than lime. Match the citrus the template expects; swapping lime makes a different sour.",
      },
      {
        slug: "margarita",
        notice:
          "Lime + orange liqueur (or agave syrup in a Tommy’s). Sweetness source changes the drink’s mid-palate.",
      },
      {
        slug: "tom-collins",
        notice:
          "Sour skeleton lengthened. Weak syrup or old lemon shows up fast once soda stretches the drink.",
      },
    ],
    bigIdea:
      "Acid and sugar are measurable ingredients — fresh citrus and intentional syrup strength do more for a sour than swapping the spirit brand.",
    keyTakeaways: [
      "Fresh citrus has aroma bottled juice lacks; juice early in service, not the night before when you can help it.",
      "Lemon and lime are different acids and aromas — honor the recipe’s choice.",
      "1:1 simple syrup is the default sweetener; rich 2:1 syrup sweetens with less water.",
      "If a sour tastes thin, check ice and shake — then citrus brightness — before blaming the bottle.",
      "Oleo saccharum (oil-sugar) adds citrus perfume without more juice acid.",
    ],
    sections: [
      {
        heading: "Fresh juice is the ingredient",
        kind: "rule",
        figure: "citrus-syrup",
        body: [
          "Bottled juice is pasteurized and usually aroma-poor. It can supply acidity in a pinch; it will not smell like a Daiquiri.",
          "Juice what you will use in a session. Oxidation and bitterness creep in as juice sits — especially lemon.",
        ],
      },
      {
        heading: "Syrup strength is a dial",
        body: [
          "1:1 simple syrup (equal sugar and water by weight or volume, depending on your habit) dissolves easily and sweetens predictably.",
          "Rich 2:1 syrup adds sweetness with less water — useful when a drink already gets plenty of melt from a hard shake. If you swap rich for 1:1 without changing the pour, the drink gets sweeter.",
        ],
      },
      {
        heading: "Diagnose sweet vs sour vs dull",
        kind: "tip",
        body: [
          "Too sweet: cut syrup slightly or add a barspoon of citrus — smallest lever first.",
          "Too sharp: a barspoon of syrup, not a second ounce of spirit.",
          "Dull: often old juice or under-acid fruit, not “needs more rum.”",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Free-pouring syrup from a squeeze bottle with no idea of the ratio.",
          "Using lime in a whiskey sour because “citrus is citrus.”",
          "Making a week of lemon juice on Sunday for next Saturday.",
        ],
      },
    ],
    deepDive: [
      {
        heading: "Oleo and other upgrades",
        kind: "tip",
        body: [
          "Oleo saccharum — citrus peels macerated in sugar — pulls aromatic oils into the sweetener. It is a punch and fine-cocktail trick that adds perfume without dumping more acid.",
          "Agave syrup, honey syrup, and demerara syrup change flavor as well as sweetness. Treat them as recipe choices, not stealth simple syrup.",
        ],
      },
      {
        heading: "Acid beyond citrus",
        body: [
          "Shrubs, lactic tricks, and acid-adjusted juices show up in modern bars. At home, master fresh lemon/lime and honest syrup before chasing powdered acid — unless you are deliberately experimenting.",
        ],
      },
    ],
    sources: [
      {
        label: "Dave Arnold, Liquid Intelligence",
        note: "Acid, sweetness, and why juice quality shows in diluted drinks.",
      },
      {
        label: "Jeffrey Morgenthaler, The Bar Book",
        note: "Syrups, juices, and practical prep standards.",
      },
      {
        label: "David A. Embury, The Fine Art of Mixing Drinks",
        note: "Sour balance as a system of strong / sour / sweet / weak.",
      },
    ],
  },
  {
    slug: "glassware-and-service",
    title: "Glassware & service",
    eyebrow: "Service",
    summary:
      "Coupe, rocks, highball — how the vessel changes dilution, aroma, and temperature, and the small chill-and-garnish habits that make a home drink feel finished.",
    readingMinutes: 3,
    topics: ["glassware", "service", "chill", "presentation"],
    coverImage: "/learn/glassware-and-service.webp",
    coverAlt: "Rows of chilled cocktail glasses ready for service on a bar",
    accentClass: "from-forest/20 via-cream to-olive/15",
    practice: [
      {
        slug: "daiquiri",
        notice:
          "Coupe or Nick & Nora, chilled. A warm glass undoes a perfect shake.",
      },
      {
        slug: "old-fashioned",
        notice:
          "Rocks glass, large cube. The glass is part of the dilution plan.",
      },
      {
        slug: "gin-and-tonic",
        notice:
          "Highball packed with ice. The tall glass is for bubbles and cold retention — not a half-empty look.",
      },
      {
        slug: "martini",
        notice:
          "Chilled coupe or Martini glass. Aroma sits in the bowl — rinse with nothing that smells like dishwasher.",
      },
    ],
    bigIdea:
      "Glassware is equipment: bowl shape and ice capacity change how a drink cools, smells, and stays balanced from first sip to last.",
    keyTakeaways: [
      "Chill glassware for drinks served up — warmth is invisible sabotage.",
      "Rocks glasses pair with large ice; highballs need volume for ice + lengthener.",
      "Coupes favor aroma and a short drink; don’t overfill.",
      "Match garnish scale to the glass — a giant wheel in a Nick & Nora is clutter.",
      "Clean, dry rims matter; detergent perfume ruins Martinis.",
    ],
    sections: [
      {
        heading: "Three shapes cover most drinks",
        kind: "rule",
        figure: "glassware-trio",
        body: [
          "Coupe / Nick & Nora: shaken or stirred drinks served without ice. Chill the glass.",
          "Rocks: spirit-forward drinks on ice. Size the cube to the glass so melt is slow.",
          "Highball / Collins: long drinks. Pack ice so soda stays cold.",
        ],
      },
      {
        heading: "Service habits that change the sip",
        kind: "tip",
        body: [
          "Cold glass, measured pour, garnish last. That order prevents foam collapse and wilted peels.",
          "Wipe rims. Express peels over the drink, not onto the counter. Serve promptly — drinks are not décor.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Serving a Martini in a warm glass “because it looks fine.”",
          "A highball with three cubes and a lonely lime wedge.",
          "Over-garnishing a small coupe until the first sip is a face full of mint.",
        ],
      },
    ],
    deepDive: [
      {
        heading: "Why chill works",
        body: [
          "A room-temp coupe can raise the temperature of a carefully shaken drink several degrees on contact. Freezer glassware (clean, no freezer smells) or a rinse of ice water helps — dump the rinse before you strain.",
        ],
      },
      {
        heading: "Stem vs no stem",
        kind: "tip",
        body: [
          "Stems keep hand heat away from drinks served up. Rocks glasses accept hand warmth because ice is still managing temperature. Choose on purpose.",
        ],
      },
    ],
    sources: [
      {
        label: "Dale DeGroff, The Craft of the Cocktail",
        note: "Service standards and glassware as part of the drink.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Practical glass choice for classic templates.",
      },
    ],
  },
  {
    slug: "swap-with-intent",
    title: "Swap with intent",
    eyebrow: "Improvisation",
    summary:
      "How to change a bottle or modifier without breaking the template — when a swap is a variation, when it is a new drink, and how to taste your way there.",
    readingMinutes: 3,
    topics: ["swaps", "templates", "improvisation", "balance"],
    coverImage: "/learn/cocktail-templates.webp",
    coverAlt: "Three template drinks suggesting related cocktail families",
    accentClass: "from-terracotta/15 via-cream to-forest/15",
    practice: [
      {
        slug: "margarita",
        notice:
          "Mezcal instead of tequila is a variation with smoke — still a sour. Changing lime to lemon is a bigger aromatic rewrite.",
      },
      {
        slug: "negroni",
        notice:
          "Boulevardier (whiskey) is a family cousin. Aperol instead of Campari is a different bitter intensity — rename it for guests.",
      },
      {
        slug: "daiquiri",
        notice:
          "Aged rum instead of white changes oak and weight. Keep lime and sugar; taste before you chase a second modifier.",
      },
      {
        slug: "old-fashioned",
        notice:
          "Rye instead of bourbon dries the drink. Demerara syrup instead of white sugar adds molasses — still the same template.",
      },
    ],
    bigIdea:
      "Smart swaps keep the template’s jobs intact — spirit, acid, sweet, bitter, length — and change one variable at a time so you can taste what happened.",
    keyTakeaways: [
      "Name the template before you swap (sour, old fashioned, equal parts, highball).",
      "Change one variable at a time; multiple swaps create a new recipe, not a tweak.",
      "Intensity matters: peated, funky, or amaro-loud bottles need smaller moves.",
      "If balance breaks, fix sweet/acid/dilution before adding a fourth bottle.",
      "Call variations by honest names so guests know what they are drinking.",
    ],
    sections: [
      {
        heading: "Stay inside a family",
        kind: "rule",
        figure: "swap-map",
        body: [
          "A Margarita with mezcal is still a sour. A Negroni with whiskey is a Boulevardier — same equal-parts idea. A G&T with cucumber gin is still a highball.",
          "When you leave the family (adding citrus to a Negroni, cream to a Martini), you are inventing. That is fine — just know you left the map.",
        ],
      },
      {
        heading: "One knob at a time",
        kind: "tip",
        body: [
          "Swap spirit OR sweetener OR citrus OR bitter — then taste. If you change three things and hate it, you cannot learn which move failed.",
          "Use MixWise Smart swaps to see catalog-aware options, then apply the same tasting discipline at the counter.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Silent swaps that shock guests (“it’s basically a Negroni”) when bitterness or smoke changed completely.",
          "Fixing a broken swap by adding more ingredients instead of reverting one change.",
          "Treating proof as irrelevant — a hotter bottle may need less volume or more dilution.",
        ],
      },
    ],
    deepDive: [
      {
        heading: "When to stop swapping and write a recipe",
        body: [
          "If you are happier with the new drink than the original, measure it, name it, and save it. Improvisation becomes a house cocktail when it is repeatable.",
        ],
      },
    ],
    sources: [
      {
        label: "MixWise Smart swaps",
        note: "In-app tool for catalog-aware substitutions.",
        href: "/learn/swaps",
      },
      {
        label: "David A. Embury, The Fine Art of Mixing Drinks",
        note: "Template thinking as the basis for variation.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Practical variation inside classic families.",
      },
    ],
  },

  {
    slug: "zero-proof-mindset",
    title: "Zero-proof without apology",
    eyebrow: "Hosting",
    summary:
      "How to build non-alcoholic drinks that feel composed — acid, bitter, texture, and length — instead of pouring soda and calling it done.",
    readingMinutes: 3,
    topics: ["zero-proof", "mocktail", "hosting", "balance"],
    coverImage: "/learn/zero-proof-mindset.webp",
    coverAlt: "A mint highball packed with crushed ice and fresh mint",
    accentClass: "from-olive/30 via-cream to-forest/10",
    practice: [
      {
        slug: "virgin-mojito",
        notice:
          "Mint, lime, sugar, bubbles — a complete highball without proof. Ice, glass, and garnish should match the alcoholic version.",
      },
      {
        slug: "zero-proof-margarita",
        notice:
          "Acid + sweet + texture. If it tastes like limeade, it’s missing bitter, spice, or salt — not “more juice.”",
      },
      {
        slug: "shirley-temple",
        notice:
          "Treat it as a composed soda: ice, measured syrup, citrus if you add it, cold lengthener. Not a splash of grenadine in warm ginger ale.",
      },
      {
        slug: "arnold-palmer",
        notice:
          "Tea tannin is the grip ethanol isn’t providing. Balance lemon and sweetener as if it were a sour with a lengthener.",
      },
    ],
    bigIdea:
      "Zero-proof drinks work when they keep cocktail architecture — acid, sweet, bitter or spice, texture, and length — and are served with the same care as anything with proof.",
    keyTakeaways: [
      "Borrow sour, highball, and old-fashioned templates; don’t invent from soda alone.",
      "Acid + bitter/spice + texture matter more than non-alcoholic “spirit” branding.",
      "Tea, coffee, hibiscus, ginger, and citrus build real mid-palate weight.",
      "Ice, glassware, and garnish signal intention as much as ingredients do.",
      "Offer NA options without making guests explain their choice.",
    ],
    sections: [
      {
        heading: "Use the same architecture",
        kind: "rule",
        figure: "na-architecture",
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
    deepDive: [
      {
        heading: "Replacing what alcohol was doing",
        body: [
          "Ethanol carries aroma, adds warmth and viscosity, and softens sharp edges. When you remove it, rebuild those jobs explicitly: tea tannin or coffee for grip, ginger or chile for heat, syrup plus acid for shape, and a shaken texture or soda length for mouthfeel.",
          "A Virgin Mojito works because mint, lime, sugar, and bubbles still form a complete highball. A glass of juice does not — it is missing bitter structure and dilution discipline.",
        ],
      },
      {
        heading: "NA “spirits” and when to bother",
        kind: "tip",
        body: [
          "Botanical NA spirits can stand in for gin-like aroma in a G&T-style build, but they vary wildly in sweetness and bitterness. Taste them neat and adjust citrus/sugar as if they were a new modifier, not a 1:1 gin swap.",
          "If the bottle tastes like spiced syrup, use less and add acid. If it tastes thin, pair with tea, shrub, or tonic for backbone.",
        ],
      },
      {
        heading: "Hosting without hierarchy",
        body: [
          "Put NA drinks on the same menu card, in the same glassware family, with the same garnish standard. The goal is a composed drink — not a consolation prize. Guests who are driving, training, pregnant, or simply not drinking should not have to ask twice or settle for warm soda.",
        ],
      },
    ],
    sources: [
      {
        label: "David A. Embury, The Fine Art of Mixing Drinks",
        note: "Architecture of strong / sour / sweet / weak still applies when “strong” is non-alcoholic.",
      },
      {
        label: "Dale DeGroff, The Craft of the Cocktail",
        note: "Service standards and template thinking that translate cleanly to NA builds.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Ingredient-driven drink building and hospitality framing.",
      },
      {
        label: "Difford's Guide — Non-alcoholic cocktails",
        note: "Broad reference for NA serves and ingredient ideas.",
        href: "https://www.diffordsguide.com/",
      },
    ],
  },
];

export function getLearnGuide(slug: string): LearnGuide | undefined {
  const resolved =
    slug === "whiskey-labels-and-law" ? "spirit-labels-whiskey" : slug;
  return LEARN_GUIDES.find((g) => g.slug === resolved);
}

export function getNextLearnGuide(slug: string): LearnGuide | undefined {
  const index = LEARN_GUIDES.findIndex((g) => g.slug === slug);
  if (index < 0 || index >= LEARN_GUIDES.length - 1) return undefined;
  return LEARN_GUIDES[index + 1];
}
