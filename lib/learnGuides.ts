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
    readingMinutes: 12,
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
    readingMinutes: 11,
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
    readingMinutes: 10,
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
    readingMinutes: 10,
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
    readingMinutes: 11,
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
    readingMinutes: 9,
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
    readingMinutes: 11,
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
    readingMinutes: 13,
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
      "Mezcal’s smoke comes largely from oven-roasting agave; Espadín is the versatile starting point.",
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
          "Mexican CRT categories, usefully: blanco is unaged or aged less than two months (often in stainless or neutral oak); reposado ages in oak from two months up to a year; añejo from one to three years; extra añejo longer than three. Oak adds vanilla, caramel, and spice while rounding raw pepper — it also mutes some fresh agave snap.",
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
    slug: "zero-proof-mindset",
    title: "Zero-proof without apology",
    eyebrow: "Hosting",
    summary:
      "How to build non-alcoholic drinks that feel composed — acid, bitter, texture, and length — instead of pouring soda and calling it done.",
    readingMinutes: 10,
    topics: ["zero-proof", "mocktail", "hosting", "balance"],
    coverImage: "/learn/zero-proof-mindset.webp",
    coverAlt: "Composed coupe cocktail with mint garnish on a wooden table",
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
  return LEARN_GUIDES.find((g) => g.slug === slug);
}

export function getNextLearnGuide(slug: string): LearnGuide | undefined {
  const index = LEARN_GUIDES.findIndex((g) => g.slug === slug);
  if (index < 0 || index >= LEARN_GUIDES.length - 1) return undefined;
  return LEARN_GUIDES[index + 1];
}
