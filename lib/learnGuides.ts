/**
 * Enriched Learn guides — layered lessons (big idea → sections → sources).
 * Spirit five-lesson modules live in learnGuidesGin / Rum / Whiskey.
 * Non-spirit guides keep everything in `sections` (no `deepDive`).
 */

import type { LearnPracticeDrink, LearnSection, LearnSource } from "@/lib/learnTypes";
import { GIN_CURRICULUM_GUIDES } from "@/lib/learnGuidesGin";
import { RUM_CURRICULUM_GUIDES } from "@/lib/learnGuidesRum";
import { WHISKEY_CURRICULUM_GUIDES } from "@/lib/learnGuidesWhiskey";

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
  keyTakeaways?: string[];
  sections: LearnSection[];
  /** Omit on spirit curricula that keep everything in `sections`. */
  deepDive?: LearnSection[];
  sources: LearnSource[];
};

export const LEARN_GUIDES: LearnGuide[] = [
  {
    slug: "home-bar-fundamentals",
    title: "Home bar fundamentals",
    eyebrow: "Start here",
    summary:
      "A short kit, ice you trust, fresh citrus, and a few bottles that cover Daiquiris, Old Fashioneds, Margaritas, and Negronis — before you buy another novelty liqueur.",
    readingMinutes: 6,
    topics: ["tools", "ice", "citrus", "bottles", "beginner"],
    coverImage: "/media/kitchen-shelf.webp",
    coverAlt: "Home bartender preparing cocktails at a bright kitchen counter",
    accentClass: "from-olive/30 via-cream to-cream",
    practice: [
      {
        slug: "gin-and-tonic",
        notice:
          "Beefeater or Tanqueray, packed ice, fridge-cold tonic. If it tastes thin in two minutes, you under-iced it — not the gin.",
      },
      {
        slug: "old-fashioned",
        notice:
          "Wild Turkey 101 or Evan Williams bonded, measured sugar, Angostura. Taste before the peel — you want whiskey, not candy.",
      },
      {
        slug: "margarita",
        notice:
          "Olmeca Altos or Espolón blanco, lime squeezed to order, Cointreau. Dull drink: check the lime before the tequila.",
      },
      {
        slug: "negroni",
        notice:
          "Equal parts Beefeater, Campari, and a fridge-cold rosso (Cocchi or Cinzano). Dusty or sharp: the vermouth, not the gin.",
      },
    ],
    bigIdea:
      "A small kit that measures and chills, ice you trust, citrus squeezed to order, and one solid bottle per job will beat a crowded cart of half-used novelties.",
    keyTakeaways: [
      "Five tools cover almost every MixWise method: shaker, Hawthorne, jigger, barspoon, peeler. Add a fine mesh when drinks go up.",
      "Ice quality controls chill and dilution more than swapping the spirit brand on most home drinks.",
      "Squeeze citrus to order. Dull juice is the usual reason a classic tastes “off.”",
      "One mixing bottle per base plus Dolin dry, a rosso you will finish, Cointreau, and Angostura covers the first month.",
      "Buy for sour, highball, and old-fashioned templates — not for one viral recipe.",
    ],
    sections: [
      {
        heading: "Five tools, then a fine mesh",
        kind: "rule",
        figure: "home-kit",
        body: [
          "A Boston or cobbler shaker (a jar with a tight lid works to start), a Hawthorne strainer, a jigger, a barspoon, and a Y-peeler cover nearly every MixWise method. You do not need a cart of copper gadgets.",
          "Add a fine mesh when you start serving drinks up — Daiquiris, Martinis, Last Words. That second strain keeps chips and pulp out of a coupe. A muddler can wait until Mojitos or smashes become a habit.",
        ],
      },
      {
        heading: "Ice is an ingredient",
        body: [
          "Cold is heat leaving the drink. Dilution is melt. Large, dense cubes have less surface area for their volume, so a Manhattan can get cold without turning thin. Soft, wet freezer cubes dump water first — that is why home stirred drinks taste weak even when the whiskey is good.",
          "Pack the tin or mixing glass. Sparse ice melts too fast and never gets the drink cold. Use smaller or cracked cubes in a hard shake (you want chill in 10–15 seconds). Save crushed ice for swizzles and juleps — it is a texture, not a default highball fill.",
          "If your freezer only makes brittle cubes, buy a bag of harder ice for Manhattan night, or shorten contact time and taste as you go.",
        ],
      },
      {
        heading: "Citrus to order",
        body: [
          "Bottled lemon and lime supply acid without perfume. A Daiquiri or Margarita made with them tastes flat even when the ounces are right. Roll the fruit, squeeze what you will use in the session, strain out seeds.",
          "If a recipe tastes dull, check the fruit before the spirit. Underripe limes and yesterday’s juice are the usual culprits — not a “better” tequila.",
        ],
      },
      {
        heading: "A starter shelf that actually covers the catalog",
        kind: "tip",
        body: [
          "One bottle per job, bought for templates: Beefeater or Tanqueray (gin), a vodka you already like, Olmeca Altos Plata or Espolón Blanco (tequila), Wild Turkey 101 or Evan Williams bottled-in-bond (whiskey), and a clean mixing white rum such as Flor de Caña Extra Dry or Havana Club 3. Add an aged rum when Daiquiris become a habit.",
          "Then the modifiers that do the real work: Dolin Dry in the fridge, a rosso you will finish in weeks (Cocchi Vermouth di Torino or Cinzano Rosso; Carpano Antica if you want a heavier Manhattan), Cointreau, and Angostura. Campari when Negronis start — not a seventh fruit liqueur.",
          "Skip a full vodka library and a wall of amari until the three templates taste right on purpose.",
        ],
      },
      {
        heading: "Three glasses earn their shelf",
        body: [
          "A rocks glass, a highball or Collins, and a coupe or Nick & Nora cover almost every serve. Chill the stemmed glass for drinks served up — a warm coupe undoes a careful stir. Skip specialty shapes until a family you actually pour needs them.",
        ],
      },
      {
        heading: "Measure until your palate is calibrated",
        body: [
          "A half-ounce swing in lime or syrup flips a sour from bright to flabby. Embury’s ratios and DeGroff’s bar math both assume you know what you poured. A jigger is how you learn what balanced feels like — not pedantry.",
          "Once you can taste a 2:1:1 Daiquiri and know it is right, free-pouring becomes a choice. Build that memory on measured drinks first.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Manhattan tastes thin before it tastes cold → use harder cubes and fill the mixing glass; soft freezer ice waters the drink first.",
          "Margarita tastes dull with a decent blanco → squeeze lime to order; bottled juice is the first suspect.",
          "Shelf is full and drinks still fail → buy for sour, highball, and old fashioned (Beefeater, a bonded bourbon, Altos, Cointreau, fridge vermouth) before another novelty bottle.",
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
      "Name the family first — sour, old fashioned, highball, or equal parts — then change one variable. Improvisation lands on a skeleton, not a pile of bottles.",
    readingMinutes: 5,
    topics: ["templates", "sour", "old-fashioned", "highball", "ratios", "beginner"],
    coverImage: "/learn/cocktail-templates.webp",
    coverAlt: "Three template drinks on a kitchen counter: a sour in a coupe, an old fashioned on a rock, and a highball",
    accentClass: "from-terracotta/15 via-cream to-olive/20",
    practice: [
      {
        slug: "daiquiri",
        notice:
          "Flor de Caña Extra Dry or Havana Club 3 at 2 oz / 1 oz lime / 1 oz 1:1 syrup. Flabby: tired lime or heavy syrup — not more rum first.",
      },
      {
        slug: "old-fashioned",
        notice:
          "Wild Turkey 101, a barspoon of rich syrup, Angostura, large cube. Stir until the heat drops. It should still taste like whiskey.",
      },
      {
        slug: "gin-and-tonic",
        notice:
          "Beefeater, packed ice, fridge-cold tonic last, brief stir. Dead in a minute: under-iced or warm tonic.",
      },
      {
        slug: "negroni",
        notice:
          "Equal parts still need a stir. Harsh, dusty bitterness is usually tired Cocchi or Cinzano — not “too much Campari.”",
      },
    ],
    bigIdea:
      "Stay inside a template first — sour, old fashioned, highball, or equal parts — then change one variable. Creativity lands on a balanced base, not a pile of bottles.",
    keyTakeaways: [
      "Sour = spirit + citrus + sweet. 2:1:1 is the home default; Embury’s drier 8:2:1 is a destination once you can taste 2:1:1.",
      "Old fashioned = spirit + sugar + bitters + dilution. The whiskey should still be the point.",
      "Highball = spirit + a cold lengthener. Packed ice and fridge-cold bubbles matter more than the garnish.",
      "Equal parts (Negroni, Boulevardier, Last Word) still need ice and method — matching ounces is not “skip the stir.”",
      "Name the family, then change one variable. Three swaps at once is a new recipe you cannot debug.",
    ],
    sections: [
      {
        heading: "Name the family before you pour",
        kind: "rule",
        figure: "templates",
        body: [
          "Citrus in the spec: sour. Spirit seasoned with sugar and bitters: old fashioned. A cold soda, tonic, or ginger beer doing the stretching: highball. Three modifiers sharing the glass in equal ounces: Negroni country.",
          "That name tells you the method (shake, stir, or build), what “balanced” means, and which lever to touch when it tastes wrong.",
        ],
      },
      {
        heading: "The sour skeleton",
        body: [
          "Spirit, citrus, sweetener. A Daiquiri at 2 oz rum / 1 oz lime / 1 oz 1:1 syrup — or a tighter 2 : ¾ : ¾ — is the fastest way to calibrate. Embury argued for a much drier sour (roughly 8:2:1 spirit:citrus:sweet). That is a destination, not a first pour. You need to know what 2:1:1 tastes like before you start subtracting sugar.",
          "Egg white, fruit, and liqueurs sit on this frame. Fix sweet and sour before you add another modifier.",
        ],
      },
      {
        heading: "Old fashioned and highball",
        body: [
          "Old fashioned: a little sugar, a few dashes of Angostura, a lot of whiskey, and enough stir to take the heat off. Candy means you oversweetened. Burn means you under-diluted.",
          "Highball: packed ice, measured spirit, fridge-cold lengthener last, brief stir. The recipe is mostly temperature and bubbles. A Paloma, a G&T, and a Dark ’n Stormy are the same job in different bottles.",
        ],
      },
      {
        heading: "Equal parts is a template too",
        kind: "tip",
        body: [
          "Negroni, Boulevardier, Last Word, Paper Plane: the ounces match so the method and the modifiers do the talking. They still need dilution — stir on ice for all-spirit builds, shake when citrus is in the spec — and bottles that are actually alive. Matching ounces is a recipe shape, not a pass on ice.",
        ],
      },
      {
        heading: "Change one variable",
        body: [
          "Swap the spirit in a Daiquiri and you still have a sour. Swap the lengthener in a highball and you still have a highball. Change spirit, citrus, and sweetener at once and you cannot tell what worked.",
          "Shop the MixWise catalog this way: gin + citrus + sweet is a family; Beefeater + Cocchi + Campari is another.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Invented drink tastes chaotic → name the family first (sour, old fashioned, highball, equal parts), then change one bottle.",
          "Negroni tastes hot and candy-bitter → you skipped “weak.” Stir on ice until it integrates; equal parts still need dilution.",
          "Daiquiri is flabby at 2:1:1 → check lime age and syrup strength before you chase Embury’s dry spec or add more rum.",
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
    readingMinutes: 5,
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
          "Wet, hollow freezer cubes dump water before they dump cold. That is why a home Manhattan tastes thin and a home Daiquiri tastes weak even when the bottles are good. You would notice week-old lime. Notice the ice the same way.",
          "Clearer, denser cubes have less surface area for their volume. Stirred drinks can get cold without turning into whiskey-flavored water.",
        ],
      },
      {
        heading: "Match the ice to the method",
        figure: "ice-types",
        body: [
          "Stirred spirit-forward drinks want large, hard cubes and a full mixing glass. Shaken sours want the tin packed — smaller or cracked cubes are fine because you want fast chill in 10–15 seconds, then out.",
          "Built highballs want the glass packed so the drink stays cold while you sip. Crushed ice belongs in swizzles and juleps, where the texture is the point and the frost on the glass is your timer.",
        ],
      },
      {
        heading: "Surface area is the hidden spec",
        body: [
          "Melt rate tracks surface area. One big rock in a rocks glass keeps an Old Fashioned drinkable. The same ounces of pebble ice would wash it out. In a shake, high surface area is useful — you want the drink cold now, then strained.",
          "If the freezer only makes brittle cubes, crack them for the shaker and save the best-looking ones for stirring — or buy a bag of denser ice for Manhattan night.",
        ],
      },
      {
        heading: "Taste, don’t worship the clock",
        kind: "tip",
        body: [
          "Dave Arnold’s chill curves show that most useful cooling happens early. After the tin frosts and hurts to hold, extra time is mostly water. Soft home ice reaches that point faster than bar ice — shorten the shake if the drink tastes thin.",
          "For stirred drinks, taste: hot alcohol means keep going; watery means you overshot. Note your ice and your time so the next round is not a guess.",
        ],
      },
      {
        heading: "Dilution is the fourth ingredient",
        body: [
          "Embury called it “weak”: water, soda, wine. A drink that tastes hot is often under-weakened, not over-proofed. A drink that tastes thin is over-weakened. Map the ice to that job instead of treating water as an accident.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "G&T dies in two minutes → pack the glass and use fridge-cold tonic; three cubes and warm soda melt outran the drink.",
          "Martini tastes thin before it’s cold → harder ice and a shorter stir; extra time on wet cubes only adds water.",
          "Daiquiri is ice-cold and watery → the tin was packed too long after it hurt to hold; stop at painfully cold.",
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
    readingMinutes: 5,
    topics: ["shake", "stir", "technique", "dilution", "texture"],
    coverImage: "/learn/shake-vs-stir.webp",
    coverAlt: "Home bartender with a cocktail shaker, jigger, and lime on a wooden counter",
    accentClass: "from-forest/20 via-cream to-olive/15",
    practice: [
      {
        slug: "daiquiri",
        notice:
          "This is the shake. Stop when the tin hurts. Stirring it “to be fancy” leaves it dense and less bright.",
      },
      {
        slug: "whiskey-sour",
        notice:
          "Citrus and egg want a shake — dry first if you add white, then wet. Stirring leaves the egg under-emulsified.",
      },
      {
        slug: "manhattan",
        notice:
          "Wild Turkey or a straight rye, Cocchi or Cinzano, Angostura. Stir for clarity and silk. Shaking clouds it and adds more water than the template wants.",
      },
      {
        slug: "martini",
        notice:
          "Beefeater or Tanqueray, measured Dolin Dry. Taste cold and dense, not frothy. Express lemon after you strain.",
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
          "Shaking adds air and faster dilution. Stirring keeps the drink denser and clearer. Neither is fancier. Match the method to the ingredients.",
        ],
      },
      {
        heading: "What shaking actually does",
        body: [
          "A hard shake is simultaneous heat exchange, dilution, and aeration. Tiny air bubbles lighten mouthfeel and help emulsify citrus oils, egg proteins, and cream. That is why a Daiquiri tastes brighter shaken than stirred — not only colder.",
          "Most of the useful cooling happens early. After the tin is painfully cold, extra shaking mostly adds water. Stop when the outside frosts and your hands hurt. That cue beats a stopwatch with soft home ice.",
        ],
      },
      {
        heading: "Stirring for clarity and density",
        body: [
          "Stirring minimizes foam and keeps dissolved solids from scattering light — spirit-forward drinks stay jewel-clear. Smooth circles with the spoon against the glass avoid whipping air in.",
          "Many stirred classics land around 20–25% dilution by volume. Embury-era ratios assume that softening. If the drink still burns, keep stirring. If it tastes thin, you overshot — note your ice and time.",
        ],
      },
      {
        heading: "How hard and how long",
        kind: "tip",
        body: [
          "Shake hard for about 10–15 seconds, until the tin is painfully cold. Short shakes leave drinks warm and syrupy; marathon shakes over-dilute.",
          "Stir 20–30 seconds with plenty of ice, tasting if you are unsure. You want the drink cold and slightly softened, not watery.",
        ],
      },
      {
        heading: "Exceptions worth knowing",
        body: [
          "Egg drinks often get a dry shake (no ice) first to build foam, then a wet shake to chill. Some modern bars shake certain spirit-forward drinks for texture on purpose. The rule of thumb is a default, not dogma — understand the physics, then break it on purpose.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Martini looks cloudy and tastes soft → stir next time; shaking will not poison it, but it adds air and extra water the template does not ask for.",
          "Whiskey Sour is warm with a thin cap → dry-shake the egg, then wet-shake to chill; stirring will not emulsify the white.",
          "Either drink is uneven and watery → pack the tin or mixing glass; a half-empty vessel melts ice too fast.",
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
    readingMinutes: 5,
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
          "Make the same Margarita twice in one week and note what changed — lime, salt, or the orange liqueur. Palate training is mostly repetition, not a new bottle.",
        ],
      },
      {
        heading: "Embury’s four parts in the glass",
        figure: "four-parts",
        body: [
          "David Embury framed cocktails as strong, sour, sweet, and weak. “Weak” is dilution, soda, wine, or water — the softening agent. A drink that tastes hot is often under-diluted, not over-proofed. A drink that tastes thin is over-weakened.",
          "Map every tweak to one of the four. Adding syrup without acid tips sweet. Adding citrus without sugar tips sour. Name the imbalance before you reach for the bottle.",
        ],
      },
      {
        heading: "Quick fixes — smallest lever first",
        kind: "tip",
        body: [
          "Too sweet: a few drops of citrus, or a splash of soda if the drink can take length. Too tart: a barspoon of syrup. Too strong: more dilution (brief stir on ice) or a longer pour of the modifier — not another ounce of spirit first.",
          "Too flat: check citrus freshness and carbonation. Too bitter: a touch of sweetness or orange oil can round edges without burying Campari.",
        ],
      },
      {
        heading: "Lemon, lime, and salt",
        body: [
          "Lemon and lime are not interchangeable by volume. Lime often reads sharper and more aromatic; lemon broader and softer. Switching fruit can feel like changing the sugar ratio even when the ounces stay fixed.",
          "A pinch of salt in a Margarita — or a salted rim — suppresses bitterness and lifts fruit without adding sugar. Seasoning, not a garnish gimmick.",
        ],
      },
      {
        heading: "Bitter drinks: round, don’t erase",
        body: [
          "Negronis want sweetness and dilution to frame Campari — not to bury it. If bitterness is harsh, check the rosso and the ice first. Oxidized Cocchi or Cinzano makes bitter drinks taste dusty and sharp. Syrup on top of tired wine just makes candy-dust.",
        ],
      },
      {
        heading: "Stay inside a template",
        body: [
          "Sour, highball, old fashioned, equal parts. When you improvise, stay inside one of those first. Wild creativity is easier after the drink already balances.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Margarita tastes too sweet → add a little fresh lime (and check the juice is alive) before you add more tequila.",
          "Negroni tastes dusty-sharp → open a fresher rosso; do not bury Campari in syrup.",
          "Whiskey Sour tastes hot → longer shake or a barspoon of water, then re-taste; “strong” is often under-diluted.",
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
    readingMinutes: 5,
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
          "The colored skin holds aromatic oils. Pinch a thin peel, skin-out, over the glass so a fine mist hits the surface. Those volatiles reach the nose before the sip — brighter than juice alone. Optionally wipe the rim so the oil sits where the lip meets the glass.",
          "A thick, pithy peel muddies a Martini or Old Fashioned. Dropping an unexpressed twist in the drink adds slower, milder aroma and a little bitterness as it sits. Express first when the recipe wants a hit.",
        ],
      },
      {
        heading: "Match the peel to the drink",
        body: [
          "Orange oil flatters whiskey and sweet vermouth — Old Fashioned, Manhattan, Negroni. Lemon lifts gin and dry profiles — Martini, Last Word. Grapefruit suits agave and bitter highballs — Paloma, many mezcal builds.",
          "Match the peel to the drink’s dominant aromatic family so the garnish reinforces the sip instead of arguing with it.",
        ],
      },
      {
        heading: "Mint and herbs",
        figure: "garnish-mint",
        body: [
          "Slap mint gently between your palms to wake the oils, then place it so the drinker’s nose hits the sprig. Crushing the leaves releases grassy chlorophyll that reads as bitter. A few gentle muddle presses in syrup are enough for a Mojito.",
          "Store herbs upright in water or wrapped loosely in the fridge. Garnish last, after the drink is strained — heat and time wilt aroma fast.",
        ],
      },
      {
        heading: "When no garnish is correct",
        kind: "tip",
        figure: "garnish-none",
        body: [
          "Many stirred equal-parts drinks and some sours are better ungarnished. If the recipe says none, trust it. Extra fruit can fight Chartreuse, mezcal, or Campari.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Martini tastes pithy → cut a thinner peel; white pith is bitterness, not perfume.",
          "Mojito smells like lawn → press the mint in syrup, don’t shred it; slap a fresh sprig for the garnish.",
          "Old Fashioned smells like nothing → express orange over the surface, then wipe the rim; an unexpressed twist in the glass is a slower, quieter signal.",
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
    readingMinutes: 5,
    topics: ["vermouth", "bitters", "campari", "modifiers", "oxidation"],
    coverImage: "/learn/vermouth-and-modifiers.webp",
    coverAlt: "Vermouth and modifier bottles stored cold on a refrigerator shelf",
    accentClass: "from-olive/25 via-cream to-terracotta/10",
    practice: [
      {
        slug: "manhattan",
        notice:
          "Cocchi or Cinzano with a straight rye or Wild Turkey. Flat, nutty-stale, or dusty: the vermouth — not the whiskey. Open a fresher bottle and stir again.",
      },
      {
        slug: "negroni",
        notice:
          "Equal parts. Harsh, dusty bitterness is often oxidized rosso. Campari is stable; the wine is not.",
      },
      {
        slug: "martini",
        notice:
          "Dolin Dry in the fridge. A “dry” Martini with tired vermouth tastes like cold gin and dust.",
      },
      {
        slug: "americano",
        notice:
          "Campari, rosso, fridge-cold soda. The build is simple so the vermouth has nowhere to hide.",
      },
    ],
    bigIdea:
      "Vermouth is fortified wine — it oxidizes. Refrigerate after opening, finish it in weeks, and treat bitters and bitter aperitivi as seasoning, not as bottles that last forever in flavor.",
    keyTakeaways: [
      "Sweet, dry, and blanc vermouth are different modifiers — not a slider on one bottle.",
      "Fridge after opening. Finish in weeks. Counter vermouth is why last month’s Manhattan tasted stale.",
      "Campari and Angostura keep; the wine in the drink is the perishable part.",
      "Aperol is not stealth Campari. Cointreau is not cheap triple sec. Taste and rename if you swap.",
      "Bitters are salt and spice: dashes, not ounces, unless the recipe is a bitter build.",
    ],
    sections: [
      {
        heading: "Refrigerate vermouth after you open it",
        kind: "rule",
        figure: "vermouth-care",
        body: [
          "Vermouth is aromatized, fortified wine. The fortification helps it last longer than a table white, not forever. Oxygen and heat dull the herbs and leave a nutty, stale edge that reads as “this cocktail is bad” when the whiskey was fine.",
          "Buy a bottle you will finish in a few weeks of actual mixing. A 375 ml of Dolin Dry or Cocchi is smarter than a liter you will babysit. Refrigerate the moment you open it. Write the date on the label.",
        ],
      },
      {
        heading: "How long is fresh enough?",
        body: [
          "Working bartenders treat opened vermouth as a perishable measured in weeks, not seasons. If it smells like leftover white wine and walnuts instead of herbs and fruit, it is done.",
          "Unopened bottles still fade slowly. Do not hoard a “good” vermouth for years before cracking it for one Manhattan.",
        ],
      },
      {
        heading: "Sweet, dry, blanc — pick the job",
        body: [
          "Rosso is the Manhattan and Negroni partner — caramel, spice, bitter-sweet herbs. Cocchi Vermouth di Torino and Cinzano Rosso are the usual home defaults; Carpano Antica is heavier and vanilla-leaning — lovely in a Manhattan, loud in a delicate one. Dry vermouth is the Martini’s whisper: Dolin Dry is the clean, alpine default. Blanc/bianco sits in between — Dolin Blanc is the familiar bottle — sweeter than dry, paler than rosso.",
          "They are not interchangeable by the ounce. Dry in a Manhattan makes a leaner, different drink. Rosso in a Martini makes a wet, clumsy one.",
        ],
      },
      {
        heading: "Bitter modifiers, bitters, and orange liqueur",
        kind: "tip",
        body: [
          "Campari, Aperol, and most amari keep better than wine. They still are not 1:1. Aperol in a Negroni is a softer, sweeter cousin — do not expect Campari’s grip. Call it what it is.",
          "Angostura (and Peychaud’s in a Sazerac) are seasoning. A few dashes frame whiskey and vermouth. A tablespoon in an Old Fashioned is a different recipe.",
          "Cointreau is structural in a Margarita — the sweet side of a sour, plus aroma. A syrupy triple sec shifts the template toward candy. Stay dry unless you taste and cut sugar elsewhere.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Manhattan tastes flat and nutty → the rosso oxidized on the counter; fridge it after opening and finish it in weeks.",
          "One bottle used for Martinis and Manhattans → Dolin Dry and a rosso are different jobs; swapping them by the ounce writes a new drink.",
          "Dusty Negroni “fixed” with syrup → open a fresher Cocchi or Cinzano; Campari was not the villain.",
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
    readingMinutes: 6,
    topics: ["tequila", "mezcal", "agave", "margarita"],
    coverImage: "/learn/spirit-primer-agave.webp",
    coverAlt: "Blue agave field in Jalisco with mountains beyond",
    accentClass: "from-terracotta/20 via-cream to-olive/15",
    practice: [
      {
        slug: "margarita",
        notice:
          "Olmeca Altos Plata or Espolón Blanco, fresh lime, Cointreau. Oaky-dessert: you used a reposado or añejo that wants a different template.",
      },
      {
        slug: "paloma",
        notice:
          "Same blanco, packed ice, fridge-cold grapefruit soda last. Loud mezcal can take over; start with tequila unless you mean smoke.",
      },
      {
        slug: "mezcal-margarita",
        notice:
          "Del Maguey Vida or Mezcal Unión (Espadín). If smoke buries the lime, split with Altos instead of pouring more citrus.",
      },
      {
        slug: "tommy-s-margarita",
        notice:
          "Altos or Espolón, lime, agave syrup — no orange liqueur. Mixto fails this purity test before the ice can save it.",
      },
    ],
    bigIdea:
      "Agave spirits are defined by plant, process, and aging — choose blanco for brightness, oak-aged tequila for softness and spice, and mezcal for smoke and earth, always preferring 100% agave.",
    keyTakeaways: [
      "Blanco 100% agave is the Margarita and Paloma default — Altos Plata or Espolón Blanco will do the job.",
      "Reposado and añejo add oak; use them when you want softness or an Old Fashioned-style build, not a bright sour.",
      "Mezcal’s smoke comes largely from pit-roasting; Espadín (Vida, Unión) is the cocktail starting point.",
      "If the label skips “100% de agave,” assume mixto — lime exposes other sugars fast.",
      "Loud mezcal is intensity, not a silent blanco swap. Split or rinse before you pour a full ounce into a sour.",
    ],
    sections: [
      {
        heading: "Categories that show up in the glass",
        kind: "rule",
        figure: "agave-ages",
        body: [
          "CRT aging, usefully: blanco is unaged or rested less than two months (often in stainless). Reposado spends two months to a year in oak. Añejo one to three years. Extra añejo longer than three. Oak adds vanilla, caramel, and spice while rounding raw pepper — it also mutes fresh agave snap.",
          "Blanco is the Margarita and Paloma bottle. A reposado Margarita tastes rounder and dessert-adjacent. An añejo “Margarita” usually wants less citrus sweetness and more Old Fashioned thinking.",
        ],
      },
      {
        heading: "A starter bottle, then mezcal",
        kind: "tip",
        body: [
          "You do not need a tequila library. Olmeca Altos Plata or Espolón Blanco — both 100% agave, both easy to find — cover Margaritas, Palomas, and Tommy’s. Fortaleza Blanco is the step-up when you want more cooked-agave character neat and in a simple sour.",
          "Add mezcal when you want smoke on purpose. Del Maguey Vida and Mezcal Unión are Espadín workhorses: enough phenol to read, not so much that lime disappears. Wilder agaves (Tobalá, Tepeztate) can be floral or savory — beautiful neat, loud in equal parts.",
        ],
      },
      {
        heading: "100% agave only",
        body: [
          "Mixto tequila needs only 51% agave sugars; the rest can be cane or other sugars. It often tastes sweeter, thinner, and harsher once lime arrives. If the bottle only says “tequila” without 100% de agave, assume mixto unless the back label proves otherwise.",
          "Some 100% bottles still use permitted additives for smoothness. If a blanco tastes like vanilla candy or perfume more than cooked agave, it will not shine in a Tommy’s. Favor agave-forward profiles when the spirit is the drink’s backbone.",
        ],
      },
      {
        heading: "Mezcal vs tequila — process, not just smoke",
        body: [
          "Tequila is blue Weber agave in defined Mexican states, typically cooked in above-ground ovens or autoclaves. Traditional mezcal often roasts agave in earthen pits, which lays down the phenolic smoke people notice — though not every mezcal is aggressively smoky.",
          "That process difference is why “just use mezcal in the Margarita” is a new drink, not a silent swap. Start Espadín. If smoke buries the lime, split with blanco tequila rather than chasing with more citrus.",
        ],
      },
      {
        heading: "Match the bottle to the template",
        body: [
          "Bright citrus drinks want blanco or a restrained Espadín. Stirred, vermouth-adjacent builds can handle reposado or a softer mezcal. Spicy Margaritas still need a clean base — heat should come from chili, not harsh spirit.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Margarita tastes flat and candy-sweet → flip the bottle for “100% de agave”; mixto other-sugars show up the moment lime arrives.",
          "Margarita tastes like oak dessert → pour blanco (Altos, Espolón) next time; reposado and añejo belong in a softer template.",
          "Mezcal Margarita is all smoke → start with Vida or Unión, or split with blanco; do not try to acid the smoke away.",
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
  ...WHISKEY_CURRICULUM_GUIDES,
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
        heading: "Front romance, back facts",
        kind: "tip",
        body: [
          "Front label: brand story and medals. Back or side: category, proof, producer, sometimes NOM or DSP, government warnings. Cocktail shopping happens on the back.",
          "Nineteenth-century spirits were often adulterated — neutral spirit, coloring, and flavor sold as whiskey or gin. Bottled-in-bond, CRT rules, and Scotch law exist because looks were not enough. That is why “straight” and “100% de agave” still matter.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Bought the neck-tag story, drink doesn’t fit the template → read category and proof first (bourbon, 100% de agave, single malt); medals come last.",
          "40% whiskey disappears in a sour → shop 45–50% ABV (Wild Turkey 101, bonded Evan Williams) when sugar and citrus will be in the glass.",
          "Famous name, wrong liquid → check the small type: mixto vs 100% agave, blended Scotch vs single malt, straight bourbon vs flavored whiskey.",
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
        body: [
          "Irish whiskey: distilled on the island of Ireland, aged ≥3 years. “Single pot still” signals body; light blends are gentle sours and weak rye substitutes in Manhattans.",
          "Canadian whisky labeled “rye” may contain little rye grain. For US cocktail specs that say rye, buy US straight rye (Rittenhouse bonded, Old Overholt) or read the mash notes carefully.",
        ],
      },
      {
        heading: "DSP lines, finishes, and flavored whiskey",
        kind: "tip",
        body: [
          "“Distilled by” usually means the company ran the still. “Produced by” can mean sourced juice blended elsewhere. Sourced whiskey is not a defect — but the line helps you repeat a Manhattan you liked.",
          "Port-finished, sherry-finished, or honey-flavored whiskeys are legally distinct from straight bourbon or rye. They can sip well and will pull an Old Fashioned toward dessert unless you cut the sugar.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Manhattan tastes soft when the spec said rye → the bottle may be Canadian “rye” in name only; buy US straight rye (Rittenhouse, Overholt).",
          "Old Fashioned tastes like dessert → check for a finish or flavored whiskey; start with straight or bonded bourbon (Wild Turkey, Evan Williams bond).",
          "“Small batch” treated as a quality score → ignore it; hunt bourbon/rye + straight or bonded + proof near 45–50%.",
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
        body: [
          "Mixto tequila needs only 51% agave sugars; the rest can be cane or other sugars. It often tastes sweeter, thinner, and harsher in a lime-heavy sour. Mid-century volume tequila leaned mixto for cost. Modern bars pushed 100% because lime and salt expose those other sugars fast.",
          "100% de agave must be labeled clearly. If the bottle only says “tequila” without 100%, assume mixto unless the back label proves otherwise. Altos, Espolón, and Fortaleza print it; look for the same line on anything you shake with lime.",
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
          "Tequila’s denomination covers specific Mexican states with blue Weber agave. Mezcal has its own map (Oaxaca plus other permitted regions). “Hecho en México” on authentic bottles is CRT geography — not souvenir copy.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Margarita tastes flat and sweet → the label skipped “100% de agave”; assume mixto and buy Altos, Espolón, or another bottle that prints it.",
          "Añejo in a bright sour tastes like oak dessert → the age word is a template cue; blanco (or restrained reposado) for Margaritas, añejo for stirred builds.",
          "NOM treated as a score → it IDs the producer so you can repeat a house style, not a ranking.",
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
        heading: "Why blends dominate the back bar",
        body: [
          "Blended Scotch exists because column-still grain whisky adds lightness and volume while malts add flavor — intentional recipe design. Famous blends (Famous Grouse, Dewar’s, Monkey Shoulder for a maltier mix) are not “lesser” malts; they are different engineering for consistency, Rob Roys, and highballs.",
          "Sam Ross’s Penicillin uses a mild blend in the shaker and an Islay malt (Laphroaig 10 is the usual float) on top. Buy two categories — workhorse blend + peated malt — instead of one expensive single malt trying to do both jobs.",
        ],
      },
      {
        heading: "Independent bottlers and export labels",
        kind: "tip",
        body: [
          "Independent bottlers buy casks and label with a distillery name under license. Cask strength and single cask lines show exact proof — useful for tasting, unpredictable for a house cocktail spec unless you standardize.",
          "Whisky without the e is standard in Scotland. “Scotch whisky” is protected — if it says Scotch, it was made in Scotland.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Penicillin is all smoke → shake a blend (Famous Grouse, Monkey Shoulder); float Laphroaig or another Islay — two label jobs, one drink.",
          "Rob Roy tastes like peat soup → the base should be blended Scotch; save the peated malt for a rinse or float.",
          "“12 Years” treated as a quality score → it is a legal floor (youngest whisky in the bottle), not an average and not a ranking.",
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

  ...GIN_CURRICULUM_GUIDES,
  ...RUM_CURRICULUM_GUIDES,
  {
    slug: "batching-and-hosting",
    title: "Batching for guests",
    eyebrow: "Hosting",
    summary:
      "Scale a Negroni or Manhattan with planned water, hold citrus until service, and set a station so you are not shaking all night.",
    readingMinutes: 6,
    topics: ["batching", "hosting", "dilution", "party"],
    coverImage: "/learn/batching-and-hosting.webp",
    coverAlt: "Several guest cocktails and a pitcher on a bright kitchen table",
    accentClass: "from-forest/15 via-cream to-terracotta/15",
    practice: [
      {
        slug: "negroni",
        notice:
          "Beefeater, Campari, fridge-cold Cocchi. Equal parts × servings, plus ~20–25% cold water, taste, chill hard. Serve up or on a large cube with an orange peel.",
      },
      {
        slug: "daiquiri",
        notice:
          "Batch Flor de Caña or Havana Club 3 with syrup; add lime as close to service as you can. Citrus dulls in a warm pitcher.",
      },
      {
        slug: "manhattan",
        notice:
          "Rye or Wild Turkey, Cocchi, Angostura. Pre-dilute, fridge the bottle, pour into cold glassware.",
      },
      {
        slug: "margarita",
        notice:
          "Same citrus rule as the Daiquiri — Altos + Cointreau can wait; lime last. Salt rims can be prepped; foam still wants a small-wave shake.",
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
          "Stirred spirit-forward drinks batch cleanly: Negroni, Manhattan, Martini. Measure, dilute, chill, pour. One batched classic plus one flexible highball (G&T, Paloma) covers a table better than eight à la minute specs.",
          "Sours batch the spirit and sweetener easily. Citrus is the fragile part. Juice to order into a pre-batched base, or accept that a pitcher of citrus drinks has a 30–60 minute peak.",
        ],
      },
      {
        heading: "A Negroni you can bottle",
        kind: "tip",
        body: [
          "Equal parts Beefeater (or Tanqueray), Campari, and fridge-cold Cocchi or Cinzano. Multiply by servings. Add cold water — about 20–25% of the total spirits-plus-modifiers — stir, taste, adjust. Bottle or pitcher in the fridge at least an hour. Serve over a large cube or up in a cold glass with an orange peel.",
          "Vermouth still oxidizes. Batch what you will finish that night or the next day.",
        ],
      },
      {
        heading: "Dilution is part of the recipe",
        body: [
          "When you shake or stir a single serve, melt water is intentional. In a batch, add that water on purpose, then taste. Under-diluted batches taste hot. Over-diluted batches taste thin before guests sit down.",
          "Chill hard. Warm pre-diluted liquid tastes flat even when the ounces are right. Leaving a pitcher on ice to “dilute itself” gives you hot drinks first and watery ones later.",
        ],
      },
      {
        heading: "Sours without a sad pitcher",
        body: [
          "Mix rum or whiskey with syrup and hold it cold. Keep lime or lemon separate. At service, combine and shake in small waves, or build a pitcher with fresh juice and serve it down quickly.",
          "Egg-white foam does not wait in a pitcher. Batch the base; dry-shake specials in waves, or skip foam for the crowd.",
        ],
      },
      {
        heading: "Service flow beats perfectionism",
        body: [
          "Set a station: cold batch, cold glasses, ice, garnish tray, one shaker for specials. Guests should not watch long division.",
          "Label allergens and proof honestly if you are hosting mixed company — especially egg whites and unexpected mezcal heat.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Margaritas juiced at noon for an 8pm dinner → batch Altos + Cointreau (or syrup); add lime close to service.",
          "Negroni pitcher tastes hot, then thin → add ~20–25% cold water, chill the bottle, and skip “the ice will handle it.”",
          "Eight different cocktails and no conversation → one batched Negroni or Manhattan plus a packed-ice highball.",
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
    readingMinutes: 5,
    topics: ["negroni", "equal-parts", "campari", "aperitivo", "boulevardier"],
    coverImage: "/learn/equal-parts-bitters.webp",
    coverAlt: "A Negroni in a rocks glass with a large ice cube and orange peel",
    accentClass: "from-terracotta/25 via-cream to-olive/10",
    practice: [
      {
        slug: "negroni",
        notice:
          "Beefeater, Cocchi or Cinzano, Campari. Stir cold. Candy-hot means you under-diluted — not “too much Campari.”",
      },
      {
        slug: "boulevardier",
        notice:
          "Wild Turkey or a straight rye in place of gin. Bourbon softens; rye keeps it lean. Same stir discipline.",
      },
      {
        slug: "americano",
        notice:
          "Campari, rosso, fridge-cold soda — the highball cousin. Packed ice or it dies.",
      },
      {
        slug: "paper-plane",
        notice:
          "Equal parts with amaro and citrus — a sour-equal hybrid. Fresh lemon still decides brightness.",
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
          "The Negroni’s power is simplicity: one part Beefeater or Tanqueray, one part fridge-cold rosso, one part Campari. That clarity is why a warm glass, a short stir, or tired vermouth shows immediately.",
          "Last Word, Paper Plane, and many modern specs use the same honesty: every ingredient is audible. Matching ounces is not a pass on ice.",
        ],
      },
      {
        heading: "Bitter bottles are not interchangeable",
        body: [
          "Campari brings bitterness and weight. Aperol brings orange sweetness and less grip. Select sits somewhere between. Swapping them makes a different drink — lovely if intentional, confusing if you expected a Negroni.",
          "Amari vary even more. When a recipe names a bottle, treat it as a category choice, not a vibe.",
        ],
      },
      {
        heading: "Dilution, the rock, and the peel",
        kind: "tip",
        body: [
          "Stir until the drink tastes integrated, then strain over a large cube or serve up. A small pile of wet ice in the glass will keep watering the drink while you talk.",
          "Orange oil is seasoning — express a peel. Do not muddle a wheel into the equal parts.",
        ],
      },
      {
        heading: "Americano, Boulevardier, and rinses",
        body: [
          "Campari + rosso + fridge-cold soda is the Negroni’s lengthened cousin. Same bitter-sweet wine idea, packed ice, brief stir. Whiskey in place of gin is a Boulevardier — Wild Turkey softens, rye stays lean. Call it by its name.",
          "An absinthe rinse (Sazerac-adjacent, or a whisper in some modern specs) adds aroma without a full equal part. Coat the glass, discard the excess — perfume, not volume.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Negroni tastes candy-hot → stir longer on ice; equal parts still need “weak.”",
          "Negroni looks cloudy and feels frothy → stir next time; shaking adds the wrong texture.",
          "Dusty, nutty bitterness → open a fresher Cocchi or Cinzano; Campari was stable.",
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
    readingMinutes: 5,
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
          "Bottled juice is pasteurized and usually aroma-poor. It can supply acidity in a pinch; it will not smell like a Daiquiri. Juice what you will use in the session. Oxidation and bitterness creep in as juice sits — lemon especially.",
          "Lemon and lime are different acids and aromas. Lime is sharper and more perfume-forward; lemon is broader and softer. A whiskey sour built on lime is a different drink. Honor the recipe’s fruit, then taste.",
        ],
      },
      {
        heading: "Syrup strength is a dial",
        body: [
          "1:1 simple (equal sugar and water — weight is more consistent than volume) dissolves easily and sweetens predictably. That is the home default for a 2:1:1 Daiquiri.",
          "Rich 2:1 syrup adds sweetness with less water — useful when a hard shake already supplies plenty of melt. If you swap rich for 1:1 at the same pour, the drink gets sweeter. Measure, or you are guessing.",
        ],
      },
      {
        heading: "Oleo, honey, agave, demerara",
        kind: "tip",
        body: [
          "Oleo saccharum — citrus peels macerated in sugar — pulls aromatic oils into the sweetener. Perfume without more juice acid. Useful in punches and in a Daiquiri when you want lime smell without extra sharpness.",
          "Agave syrup, honey syrup, and demerara syrup change flavor as well as sweetness. A Tommy’s uses agave on purpose. Demerara in an Old Fashioned adds molasses. They are not stealth 1:1 simple.",
        ],
      },
      {
        heading: "Diagnose sweet vs sour vs dull",
        body: [
          "Too sweet: cut syrup slightly or add a barspoon of citrus — smallest lever first. Too sharp: a barspoon of syrup, not a second ounce of spirit. Dull: old juice or underripe fruit, not “needs more rum.”",
          "Shrubs and acid-adjusted juices show up in modern bars. At home, master fresh lemon/lime and an honest syrup before chasing powdered acid — unless you are experimenting on purpose.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Daiquiri smells flat at the right ounces → juice age or bottled lime; aroma dies before sweetness looks wrong.",
          "Same barspoon of 2:1 in a 1:1 spec tastes candy-sweet → rich syrup packs more sugar per volume; cut the pour.",
          "Whiskey Sour built on lime tastes sharp and wrong → lemon is the template’s fruit; swapping citrus is a variation, not a silent fix.",
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
    readingMinutes: 5,
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
          "Coupe or Nick & Nora: shaken or stirred drinks served without ice — Daiquiri, Martini, Last Word. Chill the glass. A room-temp coupe can raise a carefully shaken drink several degrees on contact. Freezer the glass (clean, no freezer smell) or rinse with ice water and dump before you strain.",
          "Rocks: spirit-forward drinks on ice — Old Fashioned, Negroni. Size the cube to the glass so melt is slow. Highball or Collins: long drinks. Pack ice so soda stays cold. The tall glass is an ice-and-bubble system, not a half-empty look.",
        ],
      },
      {
        heading: "Stem vs no stem",
        body: [
          "Stems keep hand heat away from drinks served up. Rocks glasses accept hand warmth because ice is still managing temperature. Choose on purpose. A Martini in a warm, wide bowl dies at the rim; a Negroni in a tiny coupe has nowhere for the cube.",
        ],
      },
      {
        heading: "Service habits that change the sip",
        kind: "tip",
        body: [
          "Cold glass, measured pour, garnish last. That order keeps foam from collapsing and peels from wilting. Wipe rims. Express peels over the drink, not onto the counter. Detergent perfume ruins Martinis — rinse until the glass smells like nothing.",
          "Match garnish scale to the bowl. A giant wheel in a Nick & Nora is clutter. Serve promptly — drinks are not décor.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Daiquiri goes warm in the glass → chill the coupe (freezer or ice rinse, then dump); a warm bowl undoes the shake.",
          "G&T dies in two minutes → pack the highball; three cubes and a lonely lime wedge are a dilution failure.",
          "First sip is a face full of mint → scale the garnish to the glass; perfume the nose, don’t bury the bowl.",
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
    readingMinutes: 5,
    topics: ["swaps", "templates", "improvisation", "balance"],
    coverImage: "/learn/cocktail-templates.webp",
    coverAlt: "Three template drinks suggesting related cocktail families",
    accentClass: "from-terracotta/15 via-cream to-forest/15",
    practice: [
      {
        slug: "margarita",
        notice:
          "Vida or Unión instead of Altos is a variation with smoke — still a sour. Lime to lemon is a bigger aromatic rewrite.",
      },
      {
        slug: "negroni",
        notice:
          "Wild Turkey in place of Beefeater is a Boulevardier. Aperol instead of Campari is a different bitter intensity — rename it.",
      },
      {
        slug: "daiquiri",
        notice:
          "Aged rum instead of Flor de Caña Extra Dry or Havana Club 3 changes oak and weight. Keep lime and sugar; taste before a second modifier.",
      },
      {
        slug: "old-fashioned",
        notice:
          "Rittenhouse instead of Wild Turkey dries the drink. Demerara instead of white sugar adds molasses — still the same template.",
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
          "A Margarita with Vida is still a sour. A Negroni with Wild Turkey is a Boulevardier — same equal-parts idea. A G&T with Hendrick’s is still a highball.",
          "When you leave the family — citrus in a Negroni, cream in a Martini — you are inventing. That is fine. Know you left the map.",
        ],
      },
      {
        heading: "One knob at a time",
        kind: "tip",
        body: [
          "Swap spirit or sweetener or citrus or bitter — then taste. If you change three things and hate it, you cannot learn which move failed.",
          "Intensity matters. Peated malt, funky rum, and loud amaro need smaller moves — a rinse or a split, not a silent 1:1. Proof matters the same way: Wild Turkey 101 is not a silent ounce-for-ounce swap for a 40% bourbon.",
          "Use MixWise Smart swaps for catalog-aware options, then apply the same tasting discipline at the counter.",
        ],
      },
      {
        heading: "When to stop swapping and write a recipe",
        body: [
          "If you are happier with the new drink than the original, measure it, name it, and save it. Improvisation becomes a house cocktail when it is repeatable. Guests deserve the honest name — Boulevardier, mezcal Margarita, Aperol Negroni — not “basically the usual.”",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Three swaps at once and the drink broke → revert to one knob; you cannot debug a new recipe you didn’t measure.",
          "Peated Old Fashioned tastes like a campfire → dose peat as a rinse or float; it is not a silent bourbon swap.",
          "Guests expected a Negroni and got Aperol → rename the variation; bitterness changed even if the ounces didn’t.",
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
      "Rebuild what ethanol was doing — acid, bitter or spice, tannin, texture, length — and serve it in the same glass as everything else.",
    readingMinutes: 6,
    topics: ["zero-proof", "mocktail", "hosting", "balance"],
    coverImage: "/learn/zero-proof-mindset.webp",
    coverAlt: "A mint highball packed with crushed ice and fresh mint",
    accentClass: "from-olive/30 via-cream to-forest/10",
    practice: [
      {
        slug: "virgin-mojito",
        notice:
          "Mint, lime, 1:1 syrup, packed crushed ice, fridge-cold soda. A complete highball. Glass and garnish should match the alcoholic Mojito.",
      },
      {
        slug: "zero-proof-margarita",
        notice:
          "Lime + sweet + salt + a bitter or spice note. If it tastes like limeade, it is missing grip — not more juice.",
      },
      {
        slug: "shirley-temple",
        notice:
          "Packed ice, measured grenadine, fridge-cold ginger ale (Fever-Tree or Reed’s). Not a splash of syrup in warm soda.",
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
      "Borrow sour, highball, and old-fashioned skeletons — do not invent from soda alone.",
      "Ethanol was doing jobs: aroma carry, warmth, viscosity, soft edges. Rebuild them with tannin, spice, acid, and texture.",
      "Tea, coffee, hibiscus, ginger, and citrus build mid-palate weight. NA “gin” is optional.",
      "Packed ice, a real glass, and a matched garnish are part of the recipe.",
      "Put NA drinks on the same card. Guests should not have to ask twice or settle for warm soda.",
    ],
    sections: [
      {
        heading: "Use the same architecture",
        kind: "rule",
        figure: "na-architecture",
        body: [
          "A composed zero-proof drink still needs structure: acidity, sweetness, bitterness or spice, and a satisfying texture. A Virgin Mojito works because mint, lime, sugar, and bubbles form a complete highball. A glass of juice does not — it is missing bitter structure and dilution discipline.",
          "Name the family first, the same as any other lesson. Sour: citrus + sweet + a bitter or tannin note. Highball: packed ice + cold lengthener last. Old fashioned: a concentrated modifier (tea syrup, non-alc amaro, or bitters) + dilution on a rock.",
        ],
      },
      {
        heading: "Rebuild what ethanol was doing",
        body: [
          "Ethanol carries aroma, adds warmth and viscosity, and softens sharp edges. When you remove it, rebuild those jobs on purpose: black tea or coffee for grip, ginger or chile for heat, syrup plus acid for shape, a hard shake or soda length for mouthfeel, a pinch of salt to lift fruit.",
          "If the drink tastes like limeade, it is missing a job — usually bitter, spice, tannin, or dilution — not more juice.",
        ],
      },
      {
        heading: "Pantry first, NA bottles second",
        kind: "tip",
        body: [
          "Ginger beer (Fever-Tree, Reed’s), hibiscus, strong tea, coffee, citrus, and a bitter soda or tonic cover most hosting. Seedlip and other botanical NA spirits can stand in for gin-like aroma in a G&T-style build, but they vary wildly in sweetness and bitterness. Taste them neat and treat them as a new modifier, not a 1:1 Beefeater swap.",
          "If the bottle tastes like spiced syrup, use less and add acid. If it tastes thin, pair it with tea, shrub, or a dry tonic for backbone.",
        ],
      },
      {
        heading: "Serve it like a cocktail",
        body: [
          "Packed ice, a coupe or highball from the same shelf, and a garnish that matches the alcoholic menu. Guests notice the glass as much as the proof. Put NA drinks on the same card, in the same type, with the same garnish standard.",
          "People who are driving, training, pregnant, or simply not drinking should not have to explain themselves or settle for warm soda.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Guest drink tastes like sweet limeade → add bitter, spice, tannin, or salt; more juice will not supply grip.",
          "NA highball dies in two minutes → pack the ice and use fridge-cold Fever-Tree or similar; sparse cubes and warm soda flatten any recipe.",
          "NA option is a can from the fridge door → same glass, same garnish, same card as the Negroni; the vessel is part of hospitality.",
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

const LEARN_GUIDE_ALIASES: Record<string, string> = {
  "whiskey-labels-and-law": "spirit-labels-whiskey",
  "spirit-primer-gin": "gin-family-buying",
  "spirit-primer-rum": "rum-family-buying",
  "spirit-primer-whiskey": "whiskey-family-buying",
};

export function getLearnGuide(slug: string): LearnGuide | undefined {
  const resolved = LEARN_GUIDE_ALIASES[slug] ?? slug;
  return LEARN_GUIDES.find((g) => g.slug === resolved);
}

export function getNextLearnGuide(slug: string): LearnGuide | undefined {
  const index = LEARN_GUIDES.findIndex((g) => g.slug === slug);
  if (index < 0 || index >= LEARN_GUIDES.length - 1) return undefined;
  return LEARN_GUIDES[index + 1];
}
