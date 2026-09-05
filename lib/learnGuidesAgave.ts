/**
 * MixWise agave curriculum — five layered guides that replace spirit-primer-agave.
 */

import type { LearnGuide } from "@/lib/learnGuides";

const agaveAccent = "from-terracotta/20 via-cream to-olive/15";

export const AGAVE_CURRICULUM_GUIDES: LearnGuide[] = [
  {
    slug: "agave-family-buying",
    title: "Agave: family & buying myth",
    eyebrow: "Spirits",
    summary:
      "Buy 100% agave for the job — blanco for brightness, reposado for softness, mezcal when you want smoke — not a gold medal on the neck.",
    readingMinutes: 5,
    topics: ["tequila", "mezcal", "agave", "blanco", "reposado", "buying"],
    coverImage: "/learn/agave-family-buying.webp",
    coverAlt:
      "Finished tequila bottles standing in front of oak barrels in a distillery warehouse",
    accentClass: agaveAccent,
    practice: [
      {
        slug: "margarita",
        notice:
          "Blanco 100% agave — Espolòn, Olmeca Altos, or similar. If it tastes oaky-dessert, you used a reposado or añejo that wants a different template.",
      },
      {
        slug: "paloma",
        notice:
          "A highball: packed ice, cold grapefruit lengthener last. The same blanco still fits; loud mezcal can take over.",
      },
      {
        slug: "tommy-s-margarita",
        notice:
          "Tequila, lime, agave syrup — no orange liqueur. This is the blanco-purity test. Mixto will taste flat here.",
      },
      {
        slug: "mezcal-margarita",
        notice:
          "Start with Espadín — Del Maguey Vida or similar. If smoke buries the lime, split with blanco instead of pouring more citrus.",
      },
    ],
    bigIdea:
      "Agave spirits are a family with jobs — buy 100% agave for how the bottle behaves under lime or grapefruit, not the medal on the neck.",
    keyTakeaways: [
      "Look for “100% agave.” If the bottle only says tequila, assume mixto until the back label proves otherwise.",
      "Blanco is the cocktail default — Espolòn, Olmeca Altos, or similar — for Margaritas, Palomas, and Tommy’s.",
      "Reposado adds light oak. Use it when you want softness, not as a silent upgrade in a bright sour.",
      "Mezcal is a different denomination, not “smoky tequila.” Espadín (Del Maguey Vida or similar) is the cocktail start.",
      "One solid blanco covers most MixWise agave drinks. Add reposado or mezcal when a recipe asks.",
    ],
    sections: [
      {
        heading: "100% agave vs mixto",
        kind: "rule",
        figure: "agave-ages",
        body: [
          "Tequila must be made from blue Weber agave in defined Mexican states. The load-bearing shopping line is “100% agave” (or “100% de agave”). Mixto only needs 51% of its fermentable sugars from agave; the rest can be cane or other sugars.",
          "If the front label only says tequila, assume mixto until the back proves 100%. Mixto often tastes flatter and sweeter once lime arrives. That is chemistry in the glass, not a brand lecture.",
        ],
      },
      {
        heading: "Blanco, reposado, añejo — jobs, not prestige",
        body: [
          "Blanco is unaged or rested less than two months. Bright cooked agave and pepper. It is the home default for Margaritas, Palomas, and Tommy’s. Espolòn, Olmeca Altos, or another 100% agave blanco you like in a Tommy’s does the same job.",
          "Reposado spends two months to a year in oak. Vanilla and a softer edge. Fine when you want that roundness in a highball or a stirred build. In a bright sour it can read as dessert.",
          "Añejo is one to three years. Extra añejo longer. Oak is now the story. Treat an añejo “Margarita” as Old Fashioned thinking — less lime sweetness, more spirit-forward balance — or pour it neat.",
        ],
      },
      {
        heading: "Mezcal vs tequila at the shelf",
        body: [
          "Tequila is one denomination: blue Weber, mapped states, CRT aging words. Mezcal is another: more agave species, a wider map, and a process that often includes a pit roast. Smoke is common. It is not required, and it is not a tequila setting.",
          "Espadín is the widely planted workhorse. Del Maguey Vida, or a similar cocktail-weight Espadín, is an honest house mezcal. Wilder agaves — Tobalá, Tepeztate, and friends — can be floral or savory and loud. Beautiful neat. Trickier when citrus and sugar compete.",
        ],
      },
      {
        heading: "A starter bottle",
        kind: "tip",
        body: [
          "You do not need an agave library. One 100% agave blanco — Espolòn, Olmeca Altos, or similar — that you like with lime and a pinch of salt covers Margaritas, Palomas, and Tommy’s.",
          "Add a reposado when you want softness on purpose. Add an Espadín mezcal when you want smoke on purpose. Añejo can wait until a stirred drink or a sipping glass asks.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Margarita tastes flat and candy-sweet → flip the bottle for 100% agave; mixtos flatten lime before the salt rim matters.",
          "Oaky dessert in a bright sour → pour blanco (Espolòn, Olmeca Altos, or similar); save reposado for when you want softness.",
          "Bought mezcal as “smoky tequila” → treat it as its own bottle; start with Espadín (Del Maguey Vida or similar), not a wild-agave trophy.",
        ],
      },
    ],
    sources: [
      {
        label: "Agave labels decoded",
        note: "100% de agave, NOM, CRT tiers — the shopping words this lesson leaves to the labels path.",
        href: "/learn/guides/spirit-labels-agave",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Agave spirits in a cocktail context — selection and classic serves.",
      },
      {
        label: "Emma Janzen, Mezcal: The History, Craft & Cocktails of the World's Ultimate Artisanal Spirit",
        note: "Mezcal as its own family — plant, process, and drinking culture.",
      },
      {
        label: "Difford's Guide — Tequila & mezcal",
        note: "Category overviews and cocktail applications.",
        href: "https://www.diffordsguide.com/",
      },
    ],
  },
  {
    slug: "agave-how-its-made",
    title: "How agave spirits are made",
    eyebrow: "Spirits",
    summary:
      "Plant, cook, crush, ferment, and still explain why two bottles drink differently in a Margarita — including where mezcal’s smoke comes from.",
    readingMinutes: 6,
    topics: ["tequila", "mezcal", "production", "agave", "pit roast", "additives"],
    coverImage: "/learn/agave-how-its-made.webp",
    coverAlt:
      "Harvested agave hearts — piñas — stacked at a tequila distillery in Jalisco",
    accentClass: agaveAccent,
    practice: [
      {
        slug: "tommy-s-margarita",
        notice:
          "No orange liqueur. Whatever the oven and the still put in the bottle is what you will taste under lime.",
      },
      {
        slug: "margarita",
        notice:
          "Orange liqueur can soften a harsh edge. It will not rewrite a mixto or a perfume-sweet additive bill.",
      },
      {
        slug: "mezcal-margarita",
        notice:
          "Pit-roast smoke is in the piña before the still runs. If it buries lime, split with blanco — don’t chase it with more citrus.",
      },
      {
        slug: "paloma",
        notice:
          "Grapefruit lengthens whatever the cook and the still did. A candy-vanilla blanco will still taste like candy-vanilla soda.",
      },
    ],
    bigIdea:
      "Plant, cook, crush, ferment, and still show up in the glass more honestly than the medal on the neck.",
    keyTakeaways: [],
    sections: [
      {
        heading: "From plant to bottle",
        kind: "rule",
        figure: "agave-production",
        body: [
          "A few production choices sit between the field and the glass: which agave, how it was cooked, how it was crushed, how it fermented, and how it was distilled.",
          "Those levers explain why two blancos can drink like different spirits, and why mezcal often smells like a campfire before you add lime.",
        ],
      },
      {
        heading: "The plant is the mash",
        body: [
          "Agave is not a grain you harvest every season. Blue Weber for tequila, Espadín for most cocktail mezcal, and dozens of other species for the rest of mezcal, grow for years. The heart — the piña — is the sugar.",
          "That long grow is why the plant shows up as cooked squash, pepper, or mineral snap instead of “generic clear spirit.” If a bottle tastes like vanilla candy and heat with no agave in the middle, production — or additives — already told on themselves.",
        ],
      },
      {
        heading: "Cooking — brick oven vs pit",
        figure: "agave-process",
        body: [
          "Tequila usually cooks piñas above ground: brick ovens (hornos) or faster autoclaves. You get caramelized agave without a campfire. Autoclaves can taste cleaner and sometimes thinner. A traditional oven often keeps more roasted depth.",
          "Traditional mezcal often roasts in an earthen pit under soil and agave leaves, with wood and sometimes stone. That is where most of the phenolic smoke comes from — the cook, not a drop of liquid smoke later. Not every mezcal is aggressively smoky. The pit is the usual reason the ones that are, are.",
        ],
      },
      {
        heading: "Crush, ferment, still",
        body: [
          "Cooked piñas are crushed — tahona stone, mill, or shredder — then fermented. Open wood vats, wild yeast, and a long ferment pull more aroma. Stainless and cultured yeast keep things quieter. You will taste that difference under lime more than you will read it on the front label.",
          "Pot stills keep body and perfume. Column stills clean the spirit up. Tequila often uses a column or a hybrid. Much mezcal still runs in small pots. Neither is a quality score. It is why one bottle feels oily and another feels sharp at the same proof.",
        ],
      },
      {
        heading: "Additives — awareness, not paranoia",
        kind: "tip",
        body: [
          "Mexican rules allow small amounts of certain additives in some tequilas — glycerin, oak extract, caramel, and a few others — for smoothness and aroma. They are legal. They are also why a blanco can smell like dessert before it has seen a barrel.",
          "If a bottle tastes like vanilla candy or perfume more than cooked agave, it may not shine in a Tommy’s. Favor producers known for agave-forward profiles when the spirit is the drink’s backbone. You do not need a purity crusade. You need a sour that still tastes like the plant.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Treated smoke as a tequila setting → mezcal’s campfire usually starts in the pit roast, not in a flavoring step after the still.",
          "Tommy’s tastes like perfume and sugar → suspect additives or mixto before you rewrite the lime; switch to an agave-forward 100% blanco.",
          "Assumed a column-still blanco is “worse” → read the glass: cleaner can be exactly what a Paloma wants; thin and hot is the actual problem.",
        ],
      },
    ],
    sources: [
      {
        label: "Emma Janzen, Mezcal",
        note: "Pit roast, agave species, and why smoke is a cook, not a brand mood.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "How production shows up in Margaritas and highballs.",
      },
      {
        label: "Difford's Guide — tequila & mezcal production",
        note: "Oven, autoclave, still, and additive notes for drinkers.",
        href: "https://www.diffordsguide.com/",
      },
    ],
  },
  {
    slug: "agave-history-in-glass",
    title: "Agave history in your glass",
    eyebrow: "Spirits",
    summary:
      "A few true stories explain why a recipe wants blanco, a salt rim, grapefruit soda, or mezcal — not a timeline for its own sake.",
    readingMinutes: 6,
    topics: ["tequila", "mezcal", "history", "margarita", "paloma", "tommy's"],
    coverImage: "/learn/agave-history-in-glass.webp",
    coverAlt: "A Paloma in a tall glass with grapefruit — Mexico’s everyday tequila highball",
    accentClass: agaveAccent,
    practice: [
      {
        slug: "margarita",
        notice:
          "Sour with orange liqueur. Blanco 100% agave. Salt is a rim habit — it is not a license for mixto.",
      },
      {
        slug: "paloma",
        notice:
          "Mexico’s house highball: packed ice, blanco, cold grapefruit lengthener last. Not a skinny Margarita.",
      },
      {
        slug: "tommy-s-margarita",
        notice:
          "A later correction: agave syrup instead of orange liqueur. The bottle has nowhere to hide.",
      },
      {
        slug: "mezcal-margarita",
        notice:
          "A 2000s-bar leftover. Espadín first. Wild agave is a neat pour until you know the template.",
      },
    ],
    bigIdea: "History earns a place in Learn only when it changes the pour.",
    keyTakeaways: [],
    sections: [
      {
        heading: "The Margarita is a sour habit",
        figure: "agave-history",
        body: [
          "Tijuana, Ensenada, and Texas stories compete for who first mixed tequila, lime, and orange liqueur. Treat them as legend around a documented template. None of them change the glass as much as the bottle and the lime.",
          "What survived is the judgment: a sour, usually with orange liqueur, often a salt rim. Mid-century volume tequila leaned mixto because it was cheap. Modern bars pushed 100% agave because lime and salt expose other sugars fast. Pour blanco — Espolòn, Olmeca Altos, or similar — unless you chose oak on purpose.",
        ],
      },
      {
        heading: "The Paloma is Mexico’s highball",
        body: [
          "In Mexico the everyday tequila drink is often a Paloma: tequila, lime, grapefruit soda, salt if you like. It is not a “skinny Margarita.” It is a highball with a bitter-citrus lengthener.",
          "The leftover is service. Packed ice. Fridge-cold grapefruit soda last. A brief stir. The same 100% agave blanco still fits. Warm soda and three cubes flatten any bottle. Loud mezcal can take the glass — call that a mezcal Paloma if you meant it.",
        ],
      },
      {
        heading: "Tommy’s — a later correction",
        body: [
          "Julio Bermejo’s Tommy’s Margarita, from Tommy’s Mexican Restaurant in San Francisco, dropped orange liqueur for agave syrup. Late twentieth century. It is not the 1930s sour. It is a purity test that stuck because it tastes like the plant.",
          "The leftover is shopping. No Cointreau to soften a harsh edge. Mixto and perfume-sweet blancos fail here first. Espolòn, Olmeca Altos, or another agave-forward 100% blanco is the era’s useful pour.",
        ],
      },
      {
        heading: "Mezcal’s rise in the glass",
        kind: "tip",
        body: [
          "Mezcal is older than the cocktail-bar boom that made it famous outside Mexico. What changed the home pour is the 2000s and 2010s: bars started substituting mezcal in sours and naming the smoke.",
          "The leftover is intensity. Start with Espadín — Del Maguey Vida or similar. If smoke buries lime, split with blanco. Wild or single-village bottles can wait until the template already tastes right.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "A hotel Margarita story changed the pour → keep the template: 100% agave blanco, fresh lime, orange liqueur if you want that sour, salt on the rim if you like.",
          "Paloma tastes like a weak Margarita → pack the ice and use cold grapefruit soda; it is a highball habit, not a sour with less Cointreau.",
          "Reached for a wild mezcal because the bar menu did → pour Espadín first (Del Maguey Vida or similar); save louder agaves for a neat glass.",
        ],
      },
    ],
    sources: [
      {
        label: "David Wondrich, Imbibe!",
        note: "Sour templates and how American bars documented mixed drinks — useful around Margarita legend.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Margarita, Paloma, and Tommy’s as different jobs for the same bottle family.",
      },
      {
        label: "Emma Janzen, Mezcal",
        note: "How mezcal moved from regional tables into cocktail bars — and what to pour first.",
      },
    ],
  },
  {
    slug: "agave-learn-to-taste",
    title: "Learn to taste the difference",
    eyebrow: "Spirits",
    summary: "Styles are easiest to learn with your nose. A short protocol beats another shelf chart.",
    readingMinutes: 6,
    topics: ["tequila", "mezcal", "tasting", "blanco", "reposado", "espadín"],
    coverImage: "/learn/agave-learn-to-taste.webp",
    coverAlt:
      "Mezcal bottles from different Mexican regions lined up for a comparison tasting",
    accentClass: agaveAccent,
    practice: [
      {
        slug: "tommy-s-margarita",
        notice:
          "Mini-lab A, in a drink: same spec, two blancos. Name which lime survived — mixto often fails here first.",
      },
      {
        slug: "margarita",
        notice:
          "Mini-lab B: same sour, blanco then reposado. Name which one stayed bright instead of dessert.",
      },
      {
        slug: "mezcal-margarita",
        notice:
          "Smell the mezcal before the lime goes in. If it already smells like a campfire, write that down — then decide if the sour can hold it.",
      },
      {
        slug: "paloma",
        notice:
          "Mini-lab C: grapefruit soda alone, then a Paloma. Name whether the bottle or the lengthener is the mismatch.",
      },
    ],
    bigIdea: "Learn styles with a short protocol, not a shelf chart.",
    keyTakeaways: [],
    sections: [
      {
        heading: "A tasting protocol",
        kind: "rule",
        figure: "agave-tasting-protocol",
        body: [
          "Smell first. Taste. Two words — then name the style. Guessing early just trains you to confirm what the label already told you. “Pepper, bright” or “oak, soft” or “smoke, earth” will still help you at the shelf next month. A paragraph of tasting-note poetry will not.",
          "Name blanco vs reposado vs mezcal Espadín first. Añejo and wild agaves are footnotes until those three are clear. Write the words. Then look at the bottle.",
        ],
      },
      {
        heading: "What to listen for",
        figure: "agave-styles",
        body: [
          "Blanco: cooked agave, pepper, a clean finish. Espolòn or Olmeca Altos if you need a named glass. If lime would still have a partner, you found the cocktail default.",
          "Reposado: vanilla, light oak, a softer middle. If the first smell is dessert and the pepper is a rumor, believe it.",
          "Mezcal Espadín: smoke, earth, still some roasted agave. Del Maguey Vida is the usual cocktail-weight example. If the nose is a campfire and the plant is still there, you found the workhorse. If the nose is only ash, the sour will have a fight.",
        ],
      },
      {
        heading: "Mini labs",
        kind: "tip",
        body: [
          "A: Two blancos neat — a 100% agave (Espolòn, Olmeca Altos, or similar) vs whatever only says tequila. Same splash, same glass shape. Two words each. Then name which lime would survive.",
          "B: The same tiny sour taste — a barspoon of lime and syrup in each of blanco and reposado. Name which one stayed bright.",
          "C: Espadín mezcal neat, then a splash in the same sour. If smoke is already the whole story, split with blanco instead of adding more citrus.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Style named from the label before the glass → smell, sip, write two words, then look.",
          "Every smoky pour written down as “mezcal quality” → describe the cook instead: campfire plus plant (Espadín) vs ash with no agave.",
          "Six bottles tasted in a rush, none remembered → taste two pours (blanco vs reposado, or blanco vs Espadín), write two words each, then stop.",
        ],
      },
    ],
    sources: [
      {
        label: "Emma Janzen, Mezcal",
        note: "Tasting language for agave families without purple notes.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Matching what you smell to what the drink can hold.",
      },
    ],
  },
  {
    slug: "agave-four-classics",
    title: "Four classics, four lessons",
    eyebrow: "Spirits",
    summary:
      "Each classic trains a different agave judgment — orange-liqueur sour, highball length, bottle purity, and smoke on purpose.",
    readingMinutes: 7,
    topics: ["tequila", "mezcal", "margarita", "paloma", "tommy's", "mezcal-margarita"],
    coverImage: "/learn/agave-four-classics.webp",
    coverAlt:
      "A classic Margarita with lime and orange liqueur — the sour that teaches the bottle",
    accentClass: agaveAccent,
    practice: [
      {
        slug: "margarita",
        notice:
          "Espolòn, Olmeca Altos, or similar blanco. Fresh lime. Orange liqueur is a flavor, not a cover for mixto.",
      },
      {
        slug: "paloma",
        notice:
          "Same blanco. Packed ice, fridge-cold grapefruit soda last. Warm sparse ice is not a bad tequila.",
      },
      {
        slug: "tommy-s-margarita",
        notice:
          "The purity test. Agave syrup, no orange liqueur. If it tastes flat or perfumed, change the bottle — not the lime first.",
      },
      {
        slug: "mezcal-margarita",
        notice:
          "Del Maguey Vida or similar Espadín. If smoke buries lime, split with blanco. Volume after three quieter judgments.",
      },
    ],
    bigIdea: "Each classic trains a different agave judgment.",
    keyTakeaways: [],
    sections: [
      {
        heading: "Margarita — the orange-liqueur sour",
        figure: "agave-drinks",
        body: [
          "Default: Espolòn, Olmeca Altos, or a similar 100% agave blanco. Tequila, lime, orange liqueur. Hard shake. Salt on the rim if you like — it is seasoning, not a repair kit.",
          "Orange liqueur is a flavor in the middle. It will not hide mixto or a perfume-sweet additive bill. If the drink tastes dull, check the lime before the tequila. If it tastes candy-flat with fresh lime, change the bottle.",
        ],
      },
      {
        heading: "Paloma — lengthener and ice reveal",
        body: [
          "Default: the same blanco. Packed ice, tequila and lime, fridge-cold grapefruit soda last, a brief stir. Grapefruit is a bitter-citrus lengthener. It shows the bottle; it does not hide a candy-vanilla one.",
          "This is Mexico’s everyday tequila highball, not a diet Margarita. Warm soda and three cubes go flat in two minutes — that is service, not a bad tequila. Loud mezcal can take over; name that pour if you chose it.",
        ],
      },
      {
        heading: "Tommy’s — the bottle has nowhere to hide",
        body: [
          "Default: the same 100% agave blanco. Tequila, lime, agave syrup. No orange liqueur. Shaken. You are tasting the plant and the still.",
          "Mixto fails here before craft ice can save it. A reposado Tommy’s tastes rounder and dessert-adjacent — fine if you meant it, not a silent upgrade. If tonight’s drink is perfume and sugar, change the blanco before you change the spec.",
        ],
      },
      {
        heading: "Mezcal Margarita — smoke on purpose",
        body: [
          "Default: Del Maguey Vida or a similar cocktail-weight Espadín. Same sour bones as a Margarita or a Tommy’s, mezcal instead of tequila. The template already has volume.",
          "If smoke buries the lime, split with blanco instead of pouring more citrus. A wild or single-village mezcal will taste like the village and not the drink. This is the lesson where smoke is allowed — after three quieter judgments (orange-liqueur sour, highball reveal, bottle purity).",
        ],
      },
      {
        heading: "When the recipe only says tequila",
        kind: "tip",
        body: [
          "Pour Espolòn, Olmeca Altos, or another 100% agave blanco unless the notes say otherwise. Highball: the same bottle if the grapefruit is cold and the ice is packed. Tommy’s: the bottle is the test. Mezcal: only when the spec names it — or when you chose smoke and said so.",
          "Reposado and añejo keep their own jobs. If the spec only says tequila, stay on blanco unless you chose the oak fork on purpose.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "One bottle used for every agave drink → pick a default per classic: 100% agave blanco for Margarita, Paloma, and Tommy’s; Espadín only when the Mezcal Margarita wants smoke.",
          "Paloma dies in two minutes on a solid blanco → pack the ice and fridge the grapefruit soda before you change Espolòn or Olmeca Altos.",
          "Mezcal Margarita tastes only of campfire → split with blanco or step down to a cocktail-weight Espadín (Del Maguey Vida or similar); more lime will not outrun the pit.",
        ],
      },
    ],
    sources: [
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Margarita, Paloma, and Tommy’s as four different jobs — plus mezcal as a named variation.",
      },
      {
        label: "Emma Janzen, Mezcal",
        note: "Matching smoke intensity to citrus instead of treating mezcal as a flex.",
      },
      {
        label: "Difford's Guide — agave classics",
        note: "Named drinks vs the word “tequila” on a spec.",
        href: "https://www.diffordsguide.com/",
      },
    ],
  },
];
