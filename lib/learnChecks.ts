/**
 * Learning checks — a mix of diagnosis, next-move, and “which tool” calls.
 * Not trivia, and not every prompt is a postmortem.
 */

export type LearnCheck = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

/** Checks keyed by guide slug */
export const GUIDE_CHECKS: Record<string, LearnCheck[]> = {
  "home-bar-fundamentals": [
    {
      id: "hbf-1",
      prompt: "Your Manhattan tastes thin and watery before it tastes cold. What’s the likely culprit?",
      options: [
        "The whiskey is too cheap",
        "Soft, wet freezer ice melted faster than it chilled",
        "You used a mixing glass instead of a shaker",
        "The cherry garnish",
      ],
      correctIndex: 1,
      explanation:
        "Soft ice dumps water before the drink is cold. Hard cubes (and a full mixing glass) let chill and dilution rise together.",
    },
    {
      id: "hbf-2",
      prompt: "You’re filling the first shopping list. After a spirit, citrus, and a sweetener, what actually upgrades every drink next?",
      options: [
        "Another novelty liqueur",
        "Ice you trust — hard cubes, and enough of them",
        "A dozen garnishes",
        "A blender",
      ],
      correctIndex: 1,
      explanation:
        "Hard ice and enough of it does more than the tenth bottle. Soft freezer cubes water drinks before they chill.",
    },
  ],
  "cocktail-templates": [
    {
      id: "tpl-1",
      prompt: "You want to invent a drink with gin, lemon, and something sweet. Which template should you stay inside first?",
      options: [
        "Old fashioned (spirit + sugar + bitters)",
        "Sour (spirit + citrus + sweet)",
        "Highball (spirit + lengthener only)",
        "Ignore templates and free-pour equal parts of everything",
      ],
      correctIndex: 1,
      explanation:
        "Lemon means acid. That’s a sour skeleton — spirit, citrus, and a sweetener — before you add bitters, soda, or a wild modifier.",
    },
    {
      id: "tpl-2",
      prompt: "A Negroni tastes hot and syrupy, not refreshing. Which template mistake is most likely?",
      options: [
        "You treated it like a sour and added lemon",
        "You skipped dilution — equal parts still need a proper stir on ice",
        "You used too much tonic",
        "You shook it for foam",
      ],
      correctIndex: 1,
      explanation:
        "Equal-parts drinks still need “weak” — cold water from stirring. Undiluted Campari-gin-vermouth reads as hot and candy-bitter.",
    },
  ],
  "ice-and-dilution": [
    {
      id: "ice-1",
      prompt: "You built a G&T with three cubes and room-temp tonic. What happens in two minutes?",
      options: [
        "It stays bright — three cubes is plenty",
        "It goes watery — sparse ice and warm tonic melt outran the drink",
        "The lime wedge is the problem",
        "It gets stronger as the ice melts",
      ],
      correctIndex: 1,
      explanation:
        "Packed ice and fridge-cold lengtheners keep a highball alive. Sparse ice melts into the drink immediately.",
    },
    {
      id: "ice-2",
      prompt: "You’re stirring a Martini with wet, cloudy freezer cubes. What should you change?",
      options: [
        "Stir twice as long so it gets colder",
        "Shake it instead to compensate",
        "Use harder ice and taste sooner — soft ice over-dilutes before it’s cold",
        "Skip ice and stir with frozen grapes",
      ],
      correctIndex: 2,
      explanation:
        "Soft ice waters a stirred drink before it chills. Shorter contact with better ice (or tasting as you go) beats a longer stir on bad ice.",
    },
  ],
  "shake-vs-stir": [
    {
      id: "svs-1",
      prompt: "Gin, lemon, simple, egg white. What’s the mixing plan?",
      options: [
        "Stir 30 seconds for silk",
        "Dry-shake to build foam, then wet-shake to chill",
        "Build in the glass over one cube",
        "Blend until frothy",
      ],
      correctIndex: 1,
      explanation:
        "Citrus and egg want shaking. A dry shake helps foam; the wet shake is what actually chills and dilutes.",
    },
    {
      id: "svs-2",
      prompt: "A guest asks why you didn’t shake their Martini. What’s the honest answer?",
      options: [
        "Shaking is only for vodka",
        "Stirring is always stronger",
        "You want clarity and a denser, silkier texture — shaking adds air and extra water",
        "Stirring adds more air, which is elegant",
      ],
      correctIndex: 2,
      explanation:
        "All-spirit drinks stay clear and denser when stirred. Shaking won’t poison it — it will cloud it and soften it more than the template wants.",
    },
  ],
  "balance-and-taste": [
    {
      id: "bat-1",
      prompt: "Your Margarita tastes too sweet. What’s the first sensible fix?",
      options: [
        "Add more tequila only",
        "Add a little citrus (and check the juice is fresh)",
        "Shake twice as long",
        "Remove the salt rim",
      ],
      correctIndex: 1,
      explanation:
        "Name the imbalance first: too sweet → acid. Brighten with citrus before rewriting the whole pour.",
    },
    {
      id: "bat-2",
      prompt: "A Negroni tastes dusty and sharp, not pleasantly bitter. What should you suspect before you add syrup?",
      options: [
        "The gin is too juniper-forward",
        "Oxidized sweet vermouth",
        "You used too much ice",
        "The orange peel was too big",
      ],
      correctIndex: 1,
      explanation:
        "Tired vermouth makes bitter drinks taste dusty. Check the bottle’s life in the fridge before you bury Campari in sugar.",
    },
  ],
  "garnish-with-intent": [
    {
      id: "gwi-1",
      prompt: "You’re finishing a Martini. What is the lemon peel actually for?",
      options: [
        "Extra juice in the drink",
        "A spray of aromatic oils over the surface",
        "Making it colder",
        "Hiding a sloppy stir",
      ],
      correctIndex: 1,
      explanation:
        "Expression is perfume — oils on the surface. Thick pith and juice muddy a delicate stirred drink.",
    },
  ],
  "vermouth-and-modifiers": [
    {
      id: "vm-1",
      prompt: "Last month’s sweet vermouth has been on the counter. Tonight’s Manhattan tastes flat and nutty-stale. Why?",
      options: [
        "Bourbon always tastes like that with vermouth",
        "Vermouth is fortified wine — it oxidizes; it wanted the fridge and a shorter life",
        "You should have shaken it",
        "Angostura bitters went bad",
      ],
      correctIndex: 1,
      explanation:
        "Vermouth is wine. Refrigerate after opening and finish it in weeks, not seasons. Oxidized vermouth is the silent Manhattan-killer.",
    },
    {
      id: "vm-2",
      prompt: "You swap Aperol for Campari in a Negroni, same ounces. What should you expect?",
      options: [
        "A 1:1 flavor match",
        "A softer, sweeter, lighter drink — not a clone",
        "More bitterness",
        "It will taste like a Manhattan",
      ],
      correctIndex: 1,
      explanation:
        "Aperol is sweeter and less bitter. It’s a related aperitivo, not a stealth Campari. Taste and, if needed, trim the sweet vermouth.",
    },
  ],
  "spirit-primer-agave": [
    {
      id: "spa-1",
      prompt: "You want a bright, peppery Margarita. Which bottle belongs in the tin?",
      options: [
        "Añejo",
        "Blanco 100% agave (or a restrained mezcal)",
        "Mixto tequila — the mix makes it mix better",
        "Cream liqueur",
      ],
      correctIndex: 1,
      explanation:
        "Blanco keeps bright agave and pepper. Añejo leans oak and dessert; mixtos flatten the drink with other sugars.",
    },
  ],
  "zero-proof-mindset": [
    {
      id: "zpm-1",
      prompt: "A guest isn’t drinking. What’s the difference between a composed zero-proof drink and a glass of juice?",
      options: [
        "Only the glassware",
        "Structure: acid, sweet, bitter or spice, texture, and length — same architecture as a cocktail",
        "Juice is always stronger-tasting so it doesn’t need ice",
        "Skip garnish so it looks serious",
      ],
      correctIndex: 1,
      explanation:
        "NA drinks still need cocktail architecture. Juice is missing bitter structure, dilution discipline, and often texture.",
    },
  ],
};

/** Checks keyed by method slug */
export const METHOD_CHECKS: Record<string, LearnCheck[]> = {
  shake: [
    {
      id: "m-shake-1",
      prompt: "Your Daiquiri tastes thin and watery, but it was ice-cold. What probably happened?",
      options: [
        "You used too much lime",
        "You shook well past the point the tin hurt — extra time was mostly melt",
        "You should have stirred it",
        "The rum was white instead of aged",
      ],
      correctIndex: 1,
      explanation:
        "Once the tin is painfully cold, extra shaking is mostly dilution. Soft home ice reaches that point faster — stop when your hands hurt.",
    },
    {
      id: "m-shake-2",
      prompt: "You’re shaking a Daiquiri. When do you stop?",
      options: [
        "When the timer hits 12 seconds, even if the tin is still warm",
        "When the tin is painfully cold",
        "When the ice has fully melted",
        "When it looks foamy",
      ],
      correctIndex: 1,
      explanation:
        "The cue is the tin, not the clock. Soft home ice can get there faster — extra time after that is mostly melt.",
    },
  ],
  stir: [
    {
      id: "m-stir-1",
      prompt: "The Manhattan still burns with alcohol. What’s the move?",
      options: [
        "Add simple syrup",
        "Keep stirring (or use better ice) until the heat drops and the drink feels slightly softened",
        "Shake it to fix the proof",
        "Add more bitters",
      ],
      correctIndex: 1,
      explanation:
        "Hot alcohol on a stirred drink usually means under-diluted, not over-proofed. Taste as you go — cold and silky, not watery.",
    },
    {
      id: "m-stir-2",
      prompt: "Which drink belongs in a mixing glass, not a shaker?",
      options: ["Daiquiri", "Whiskey Sour", "Manhattan", "Margarita"],
      correctIndex: 2,
      explanation:
        "Manhattans are all spirits — stir for clarity and silk. The others have citrus and want a shake.",
    },
  ],
  build: [
    {
      id: "m-build-1",
      prompt: "When building a highball, when should the soda or ginger beer usually go in?",
      options: [
        "First, before ice",
        "Last, to keep bubbles lively",
        "Never — stir it in hard for 20 seconds",
        "Only if the drink is warm",
      ],
      correctIndex: 1,
      explanation:
        "Add lengtheners last so carbonation stays bright, then give only a brief stir.",
    },
  ],
  blend: [
    {
      id: "m-blend-1",
      prompt: "In a frozen Margarita, ice is mainly doing what?",
      options: [
        "Just chilling — any amount is fine",
        "Giving the drink its body and texture",
        "Diluting it like a long Martini stir",
        "Making the salt stick",
      ],
      correctIndex: 1,
      explanation:
        "In a blender drink, ice is structure. Too little — or sitting after the blend — and you get juice, not a frozen body. Serve immediately.",
    },
  ],
  layer: [
    {
      id: "m-layer-1",
      prompt: "You’re stacking a layered drink. What keeps the bands from mixing?",
      options: [
        "Pouring the lightest liquid first, fast",
        "Density order — heaviest first — and a slow pour over a spoon",
        "Shaking between layers",
        "A warm glass",
      ],
      correctIndex: 1,
      explanation:
        "Heaviest (usually sweetest) first, then a slow pour over the back of a spoon. Speed mixes; patience stacks.",
    },
  ],
  swizzle: [
    {
      id: "m-swizzle-1",
      prompt: "Queen’s Park Swizzle. What ice belongs in the glass?",
      options: [
        "Two big cubes",
        "Crushed or cracked ice, packed in",
        "No ice — it’s a stirred drink",
        "One sphere",
      ],
      correctIndex: 1,
      explanation:
        "High surface area lets the spin chill and frost the glass. Crack cubes in a towel if you don’t have crushed ice.",
    },
  ],
  muddle: [
    {
      id: "m-muddle-1",
      prompt: "The Mojito tastes grassy and bitter. What happened to the mint?",
      options: [
        "You didn’t use enough sugar",
        "You pulverized the leaves — chlorophyll bitterness — instead of pressing a few times",
        "The rum was too dark",
        "You skipped the soda",
      ],
      correctIndex: 1,
      explanation:
        "Press to wake the oils. Shredding mint releases bitter green notes. If it smells like lawn clippings, lighten up next round.",
    },
  ],
};

/** Checks keyed by technique slug */
export const TECHNIQUE_CHECKS: Record<string, LearnCheck[]> = {
  "dry-shake": [
    {
      id: "t-ds-1",
      prompt: "Whiskey Sour with egg white. What’s the order?",
      options: [
        "Wet-shake only",
        "Dry-shake to foam, then wet-shake to chill",
        "Stir, then dry-shake",
        "Blend, then strain",
      ],
      correctIndex: 1,
      explanation:
        "Dry shake builds foam; wet shake sets temperature and dilution. Skip the second half and you serve warm meringue.",
    },
  ],
  "fine-strain": [
    {
      id: "t-fs-1",
      prompt: "Which drink most needs a fine-strain?",
      options: [
        "A G&T over ice",
        "A Daiquiri served up",
        "A built Paloma",
        "An Old Fashioned on a rock",
      ],
      correctIndex: 1,
      explanation:
        "Up drinks have nowhere for chips to hide. The mesh catches the shards that would keep melting in the glass.",
    },
  ],
  express: [
    {
      id: "t-ex-1",
      prompt: "What’s the main job of expressing a citrus peel?",
      options: [
        "Adding lots of juice",
        "Spraying aromatic oils over the drink",
        "Making the drink colder",
        "Sweetening the rim",
      ],
      correctIndex: 1,
      explanation:
        "Expression is perfume — oils on the surface — more than decoration or juice.",
    },
  ],
  rinse: [
    {
      id: "t-ri-1",
      prompt: "How much of the absinthe rinse should stay in a Sazerac glass?",
      options: [
        "A quarter-ounce puddle",
        "A thin coat — dump the rest",
        "Half the drink",
        "None; skip the rinse",
      ],
      correctIndex: 1,
      explanation:
        "A rinse is perfume on the glass. Dump the excess. If you can taste a full measure, you didn’t.",
    },
  ],
  float: [
    {
      id: "t-fl-1",
      prompt: "To float wine on a New York Sour, what’s the actual move?",
      options: [
        "Dump it from high up",
        "Slow pour over the back of a spoon onto a calm surface",
        "Shake the wine with the sour",
        "Stir it in",
      ],
      correctIndex: 1,
      explanation:
        "Calm surface, slow pour over a spoon. A fast stream mixes; foam can drag wine into the body.",
    },
  ],
  muddle: [
    {
      id: "t-mu-1",
      prompt: "How should you muddle mint for a Mojito?",
      options: [
        "Pulverize into a puree",
        "Press gently a few times to wake the oils",
        "Skip muddling and just garnish",
        "Boil the mint first",
      ],
      correctIndex: 1,
      explanation:
        "Press — don’t shred — or you release bitter chlorophyll and the drink tastes grassy.",
    },
  ],
  swizzle: [
    {
      id: "t-sw-1",
      prompt: "When do you stop spinning a swizzle?",
      options: [
        "After three turns",
        "When the outside of the glass frosts",
        "When the ice disappears",
        "When it tastes like a Daiquiri",
      ],
      correctIndex: 1,
      explanation:
        "Frost on the glass is the cue that you’ve chilled and diluted in place. Then top with more crushed ice if the mound settled.",
    },
  ],
  layer: [
    {
      id: "t-ly-1",
      prompt: "Which liquid usually goes into the glass first when layering?",
      options: [
        "The highest-proof spirit",
        "The densest — usually the sweetest",
        "Whatever is prettiest",
        "Cream, always",
      ],
      correctIndex: 1,
      explanation:
        "Density often tracks sugar. Heavy first, then a slow spoon pour so lighter liquids sit on top.",
    },
  ],
  build: [
    {
      id: "t-bu-1",
      prompt: "You’re building a Paloma. What’s the order?",
      options: [
        "Soda, then tequila, then ice",
        "Ice, tequila and grapefruit, cold soda last, brief stir",
        "Everything in a tin, shake, dump",
        "Tequila last so it floats",
      ],
      correctIndex: 1,
      explanation:
        "Lengtheners last, fridge-cold, brief stir. Built drinks die from heat and agitation, not from the spirit.",
    },
  ],
};

export function getGuideChecks(slug: string): LearnCheck[] {
  return GUIDE_CHECKS[slug] ?? [];
}

export function getMethodChecks(slug: string): LearnCheck[] {
  return METHOD_CHECKS[slug] ?? [];
}

export function getTechniqueChecks(slug: string): LearnCheck[] {
  return TECHNIQUE_CHECKS[slug] ?? [];
}
