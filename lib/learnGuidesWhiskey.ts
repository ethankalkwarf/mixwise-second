/**
 * MixWise whiskey curriculum — five layered guides that replace spirit-primer-whiskey.
 */

import type { LearnGuide } from "@/lib/learnGuides";

const whiskeyAccent = "from-terracotta/25 via-cream to-olive/15";

export const WHISKEY_CURRICULUM_GUIDES: LearnGuide[] = [
  {
    slug: "whiskey-family-buying",
    title: "Whiskey: family & buying myth",
    eyebrow: "Spirits",
    summary:
      "Whiskey styles are not interchangeable seasoning. Mash, cask, and history decide what goes in the glass.",
    readingMinutes: 5,
    topics: ["whiskey", "bourbon", "rye", "scotch", "irish", "buying"],
    coverImage: "/learn/spirit-primer-whiskey.webp",
    coverAlt: "Charred oak whiskey barrels stacked in a quiet aging warehouse",
    accentClass: whiskeyAccent,
    practice: [
      {
        slug: "old-fashioned",
        notice:
          "Buffalo Trace or Maker’s Mark — or similar ~45% bourbon — for round oak. Rye when you want spice. Taste before the peel.",
      },
      {
        slug: "manhattan",
        notice:
          "Rittenhouse Bonded or Wild Turkey 101 Rye for the snap. Bourbon works; the drink reads sweeter. Fridge the vermouth.",
      },
      {
        slug: "whiskey-sour",
        notice:
          "Bourbon or Jameson. Fresh lemon. If it tastes thin, check citrus and shake before the whiskey.",
      },
      {
        slug: "boulevardier",
        notice:
          "Equal parts. Bourbon softens; Rittenhouse or similar rye stays lean. Stir cold.",
      },
    ],
    bigIdea:
      "Whiskey styles aren’t interchangeable seasoning — mash, cask, and history decide what goes in the glass.",
    keyTakeaways: [
      "When a US recipe says only “whiskey,” it usually means bourbon or rye.",
      "Bourbon is corn plus new charred oak — round vanilla for Old Fashioneds and many sours.",
      "Rye is drier and spicier — the classic Manhattan spine.",
      "Scotch and Irish are their own mixing families, not silent swaps for American whiskey.",
      "Mix around 45–50% ABV. Buffalo Trace or Maker’s Mark (or similar) first; Rittenhouse or Wild Turkey 101 Rye when Manhattans start.",
    ],
    sections: [
      {
        heading: "Four styles that matter at home",
        kind: "rule",
        figure: "whiskey-styles",
        body: [
          "Bourbon is at least 51% corn, aged in new charred oak. Vanilla, caramel, corn sweetness. It is the usual home pour for Old Fashioneds and whiskey sours. Buffalo Trace or Maker’s Mark — or another solid ~45% bourbon you like neat — will do that job. Maker’s is a little softer (wheat in the mash). Both mix. Bourbon may be made anywhere in the United States. Kentucky is tradition, not a legal requirement.",
          "Rye is at least 51% rye grain. Pepper, baking spice, a drier finish. Manhattans and Boulevardiers were written for that snap. Rittenhouse Bonded or Wild Turkey 101 Rye, or similar, is the snap. Bourbon softens them. US rye also ages in new charred oak, so it shares bourbon’s vanilla frame with a leaner grain center.",
          "Scotch must be distilled and aged in Scotland — at least three years in oak. Blended Scotch is the cocktail workhorse: highballs, Rob Roy, the body of a Penicillin. Famous Grouse or Monkey Shoulder — or similar mixing Scotches — cover that job. Heavily peated malt is seasoning. Laphroaig 10 or Ardbeg 10 belong as a float or rinse, not as a silent swap for bourbon.",
          "Irish whiskey is often lighter and softer, especially everyday blends. Jameson is the soft highball and gentle sour. Single pot still — malted and unmalted barley, unique to Ireland — carries more body for stirred drinks. Reach for Redbreast, or similar, when the blend goes slack.",
        ],
      },
      {
        heading: "Shopping myths",
        body: [
          "Darker is not older, and older is not automatically better in a cocktail. Color can be char, time, or caramel. The drink cares about grain, cask, and proof.",
          "The legal words — bourbon, rye, straight, bottled-in-bond — live on the American whiskey labels lesson, in the Spirit labels decoded path. This lesson is about what you pour.",
          "Ireland and the United States usually spell whiskey; Scotland often uses whisky. The letter does not decide the cocktail — mash and cask do.",
          "A famous bottle you like neat is not always the bottle the template wants. Save the allocated pour for a glass. Mix with something solid you will open again.",
        ],
      },
      {
        heading: "Proof and a starter shelf",
        kind: "tip",
        body: [
          "Mixing whiskey around 45–50% ABV holds up when sugar, citrus, or vermouth enter the glass. A shy 40% pour can taste thin the moment you add sweetener.",
          "You do not need a whiskey library to start. One solid bourbon you enjoy neat — Buffalo Trace, Maker’s Mark, or similar around 45% — covers Old Fashioneds and sours. Add rye when Manhattans become a habit: Rittenhouse Bonded or Wild Turkey 101 Rye, or similar. Famous Grouse or Jameson can wait until a recipe names them. Peated malt waits longer.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Whiskey sour tastes like smoke fighting lemon → pour bourbon or Jameson, or similar; save Laphroaig 10 or Ardbeg 10 for a Penicillin-style float, not the whole sour.",
          "Manhattan tastes mild or sweet from a Canadian bottle labeled “rye” → switch to US straight rye (Rittenhouse Bonded or Wild Turkey 101 Rye, or similar) and read the back label before you buy.",
          "Old Fashioned tastes like fruit salad → skip the muddle; spirit, sugar, bitters, and ice, then express an orange peel.",
        ],
      },
    ],
    deepDive: [],
    sources: [
      {
        label: "American whiskey labels",
        note: "Bourbon, rye, straight, bottled-in-bond — the shopping words this lesson leaves to the labels path.",
        href: "/learn/guides/spirit-labels-whiskey",
      },
      {
        label: "Spirit labels decoded",
        note: "The full labels path — proof and age, then whiskey, agave, and Scotch.",
        href: "/learn/paths/spirit-labels-decoded",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Whiskey selection for stirred and shaken classics.",
      },
      {
        label: "Difford's Guide — Whisky & whiskey",
        note: "Category overviews and cocktail applications.",
        href: "https://www.diffordsguide.com/",
      },
    ],
  },
  {
    slug: "whiskey-how-its-made",
    title: "How whiskey is made",
    eyebrow: "Spirits",
    summary:
      "Grain, still, and cask explain sweetness, spice, and smoke better than the font on the label.",
    readingMinutes: 7,
    topics: ["whiskey", "production", "mash bill", "oak", "peat", "still"],
    coverImage: "/learn/whiskey-how-its-made.webp",
    coverAlt: "Looking down into a mash tun — grain and water under a steel rake",
    accentClass: whiskeyAccent,
    practice: [
      {
        slug: "old-fashioned",
        notice:
          "Taste the whiskey neat first. New charred oak is the vanilla you will still hear under sugar and bitters.",
      },
      {
        slug: "manhattan",
        notice:
          "Rye grain is the dry snap. If the drink goes dessert, the mash bill — or the vermouth — did that, not the stir.",
      },
      {
        slug: "whiskey-sour",
        notice:
          "Bourbon’s corn and new oak soften lemon. A peated malt will not silently do the same job.",
      },
      {
        slug: "boulevardier",
        notice:
          "Campari is loud. Grain and cask still show — bourbon rounds the bitter; rye keeps an edge.",
      },
    ],
    bigIdea:
      "Grain, still, and cask explain sweetness, spice, and smoke better than the label font.",
    keyTakeaways: [],
    sections: [
      {
        heading: "From mash to glass",
        kind: "rule",
        figure: "whiskey-production",
        body: [
          "A few production choices sit between the grain and the glass: what you mash, how you distill it, what cask you fill, how long it sits, and how you bottle it.",
          "Those levers show up more honestly than the typeface on the neck tag. Learn them, and a new bottle is a set of choices you can taste.",
        ],
      },
      {
        heading: "Mash bill and still",
        body: [
          "Mash bill is the grain recipe. Corn reads sweet. Rye reads spice and dry. Malted barley reads bread and, if it was dried over peat, smoke. Wheat reads soft. The legal floors — 51% corn for bourbon, 51% rye for rye — are the start of the flavor, not the whole story. The rest of the mash still matters.",
          "Pot stills keep more of that grain character. Column stills can refine toward a lighter, cleaner spirit. Many bottles are a conversation between the two — especially blends. A mixing Scotch (Famous Grouse or Monkey Shoulder, or similar) is usually malt plus column grain; a single malt can dominate a cocktail. Irish pot still (Redbreast or similar) keeps unmalted-barley body; Jameson is the light blend.",
        ],
      },
      {
        heading: "New charred oak vs used casks",
        body: [
          "Bourbon and US rye must age in new charred oak. The char and fresh wood pull vanillin, caramelized sugars, and toast into the spirit. That is why American whiskey so often tastes of vanilla before you add anything.",
          "Scotch and much Irish whiskey typically age in used barrels — often ex-bourbon, sometimes sherry. Oak reads softer. Grain and peat, if any, stay more visible.",
          "A bourbon Old Fashioned and a Scotch Rob Roy share a template. They are not the same drink. Same bones, different wood and grain.",
        ],
      },
      {
        heading: "Age, peat, and the bottle",
        kind: "tip",
        body: [
          "Time in wood is work, not a score. US straight whiskey has a two-year floor. Scotch and Irish have a three-year floor. More years can mean more oak — or just a quieter spirit that lost more to the air.",
          "Peat is aroma, not proof. The smoke is in the malted barley, dried over a peat fire, before the still ever runs. A 40% peated malt can shout louder than a 50% bourbon. Laphroaig 10 or Ardbeg 10 will do that job. Dose them like seasoning — not as a silent bourbon.",
          "Many bottles are chill-filtered so they stay bright when you add ice or water. That can strip a little texture. It is not a quality verdict. ABV on the label is the more honest mixing number — around 45–50% still holds sugar and citrus.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "The bottle looks serious but the Old Fashioned tastes thin → check proof first; mix around 45–50% ABV (Buffalo Trace, Maker’s Mark, or similar), not a shy 40%.",
          "You poured more peated malt to make the drink “stronger” → peat is aroma, not proof; keep Laphroaig 10 or Ardbeg 10 as a barspoon float or rinse.",
          "Scotch Old Fashioned has no vanilla → that is used casks doing their job; pour new-oak bourbon (Buffalo Trace or Maker’s Mark, or similar) when you want that oak-and-vanilla frame.",
        ],
      },
    ],
    deepDive: [],
    sources: [
      {
        label: "American whiskey labels",
        note: "Mash floors, straight, bottled-in-bond — law on the bottle, not this lesson’s job.",
        href: "/learn/guides/spirit-labels-whiskey",
      },
      {
        label: "Scotch labels",
        note: "Single malt vs blend, and what a printed age guarantees.",
        href: "/learn/guides/spirit-labels-scotch",
      },
      {
        label: "Spirit labels decoded",
        note: "The full labels path — start with proof and age, then the spirit families.",
        href: "/learn/paths/spirit-labels-decoded",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "How production shows up in classic whiskey drinks.",
      },
      {
        label: "Difford's Guide — whisky production",
        note: "Category overviews and still/aging notes.",
        href: "https://www.diffordsguide.com/",
      },
    ],
  },
  {
    slug: "whiskey-history-in-glass",
    title: "Whiskey history in your glass",
    eyebrow: "Spirits",
    summary:
      "A few true stories explain why a recipe wants rye, bourbon, or a different family — not a timeline for its own sake.",
    readingMinutes: 6,
    topics: ["whiskey", "history", "rye", "prohibition", "manhattan", "sazerac"],
    coverImage: "/learn/whiskey-history-in-glass.webp",
    coverAlt:
      "Hoffman House bar, New York, 1880s — a Gilded Age American bar where rye was the usual pour",
    accentClass: whiskeyAccent,
    practice: [
      {
        slug: "manhattan",
        notice:
          "This is the rye chapter. If history made you reach for a soft blend, pour again.",
      },
      {
        slug: "old-fashioned",
        notice:
          "Spirit, sugar, bitters, ice — the 19th-century whiskey cocktail. Fruit in the glass is a later habit.",
      },
      {
        slug: "whiskey-sour",
        notice:
          "Same era’s sour template. Bourbon became the usual pour after rye left the shelf.",
      },
      {
        slug: "boulevardier",
        notice:
          "A later equal-parts cousin. The whiskey judgment is still the 19th-century one: spice or round.",
      },
    ],
    bigIdea: "Recipe era often tells you which bottle to pour.",
    keyTakeaways: [],
    sections: [
      {
        heading: "Nineteenth-century rye bars",
        figure: "whiskey-history",
        body: [
          "American bars in the late 1800s poured mostly rye. The Manhattan — New York, 1870s–80s — is whiskey, sweet vermouth, and bitters built on that spice. Invention stories attached to hotels and banquets came later. The useful leftover is the pour: rye against vermouth.",
          "The Sazerac starts as a New Orleans cognac drink, named for a brand of cognac, not a whiskey. Rye became the usual pour as cognac supply and American taste shifted. Treat that as a careful succession, not a founding myth. Peychaud’s and an absinthe rinse are the documented seasoning. Cognac Sazeracs still exist; rye is the modern default.",
          "The whiskey cocktail that became the Old Fashioned — spirit, sugar, bitters, water or ice — and the whiskey sour are the same era’s templates. “Old-fashioned” was a call for that structure against later fancy builds. Fruit muddled in the glass is a later restaurant habit.",
        ],
      },
      {
        heading: "After Prohibition, bourbon became “whiskey”",
        body: [
          "When the United States went dry, the legal whiskey trade collapsed. After repeal, corn economics and broader distribution made bourbon the supermarket default. Rye nearly left the back bar.",
          "Mid-century American recipes that say only “whiskey” often silently assume bourbon. That is a shelf fact, not a law. If you are reading a 1950s spec, corn-and-oak is the likely pour.",
        ],
      },
      {
        heading: "Rye’s near-death and return",
        body: [
          "Rye stayed scarce through the late twentieth century. The cocktail revival of the 2000s brought it back because Manhattans and Sazeracs taste flabby when corn sweetness is the only whiskey in the glass. Rittenhouse Bonded is one of the bottles that made that snap easy to buy again.",
          "Reading a recipe’s era is often enough to choose a bottle. An 1880s Manhattan wants rye. A mid-century “whiskey” sour will forgive bourbon. A modern spec that names rye means it.",
        ],
      },
      {
        heading: "Scotch and Irish stay their own families",
        kind: "tip",
        body: [
          "Scotch and Irish whiskey did not wait for the American revival to exist. They have always been separate mixing families, with their own law and their own drinks.",
          "A Rob Roy is a Manhattan idea on Scotch — same bones, different grain and cask. Irish coffee and a gentle Irish sour are their own chapter. Do not fold those bottles into the American “whiskey” line unless the recipe says so.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "An 1880s-style Manhattan tastes flabby on bourbon → pour rye (Rittenhouse Bonded or similar); the useful leftover from that era is the bottle, not the banquet story.",
          "Sazerac tastes like a Manhattan with extra bitters → rye is the modern default (cognac was first); rinse the glass with absinthe and dump the excess, and do not stir in a full measure.",
          "A 19th-century spec says “whiskey” and the drink tastes like a campfire → pour rye, not peated malt; smoke was not the American bar’s silent default.",
        ],
      },
    ],
    deepDive: [],
    sources: [
      {
        label: "David Wondrich, Imbibe!",
        note: "Nineteenth-century American bar: Manhattan, whiskey cocktail, sour templates — documented vs later legend.",
      },
      {
        label: "Robert Simonson, The Old-Fashioned",
        note: "How the whiskey cocktail became the Old Fashioned — structure over fruit salad.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Sazerac succession and modern default pours.",
      },
    ],
  },
  {
    slug: "whiskey-learn-to-taste",
    title: "Learn to taste the difference",
    eyebrow: "Spirits",
    summary: "Styles are easiest to learn with your nose. A short protocol beats another shelf chart.",
    readingMinutes: 6,
    topics: ["whiskey", "tasting", "bourbon", "rye", "peat", "irish"],
    coverImage: "/learn/whiskey-learn-to-taste.webp",
    coverAlt:
      "Two Glencairn tasting glasses with different-colored whiskey pours and a water jug between them",
    accentClass: whiskeyAccent,
    practice: [
      {
        slug: "old-fashioned",
        notice:
          "Mini-lab A, in a drink: same spec, bourbon then rye. Name which one stayed round.",
      },
      {
        slug: "manhattan",
        notice:
          "Mini-lab B: same vermouth and bitters, two whiskeys. Name which one kept the drink from dessert.",
      },
      {
        slug: "whiskey-sour",
        notice:
          "Smell the whiskey before the lemon goes in. If it already smells like a campfire, this is not a standard sour.",
      },
      {
        slug: "boulevardier",
        notice:
          "Campari is loud. Two words for the whiskey first — then taste whether it softened or stayed lean.",
      },
    ],
    bigIdea: "Learn styles with a short protocol, not a shelf chart.",
    keyTakeaways: [],
    sections: [
      {
        heading: "A tasting protocol",
        kind: "rule",
        figure: "whiskey-tasting-protocol",
        body: [
          "Smell first. Taste. Two words — then name the style. “Vanilla, round” or “pepper, dry” will still help at the shelf next month. Guessing early just trains you to confirm what the label already told you.",
          "Neat, or with a few drops of water if it is hot. Same glass shape if you can. You are training a comparison, not hosting a party.",
        ],
      },
      {
        heading: "What to listen for",
        figure: "whiskey-styles",
        body: [
          "Bourbon: vanilla, corn sweet, round. If the oak is the first thing you smell, you found new charred wood.",
          "Rye: pepper, baking spice, a drier finish. If the drink feels leaner in the same glass, believe it.",
          "Blended Scotch: light malt, easy to mix. A Rob Roy should still taste like whisky, not like a shy bourbon.",
          "Peated malt: smoke first. Phenol, not proof. Two words beat a paragraph — “smoke, iodine” is more useful than a campfire essay.",
          "Irish blend vs pot still: Jameson is soft and light; Redbreast, or similar pot still, is oilier, with unmalted barley body. If it feels thin in a stirred drink, you probably grabbed the blend.",
        ],
      },
      {
        heading: "Mini labs",
        kind: "tip",
        body: [
          "A: Bourbon vs rye, neat — Buffalo Trace against Rittenhouse if you have them, or similar. Same splash, same glass shape. Two words each. Then name the style.",
          "B: Same Manhattan spec, two pours — bourbon then rye. Name which vermouth stayed in its place.",
          "C, optional: a Penicillin-logic float. Shake a gentle whisky sour, then a barspoon of Laphroaig 10 or Ardbeg 10 on top. Smoke should be perfume, not the whole sip.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "You named the style from the label, then tasted to confirm → smell first, sip, write two words, then look at the bottle.",
          "Every smoky pour gets called “Islay” → write the two words you actually found (smoke, iodine — or not); peat is a production choice, and the fix is the protocol, not a region quiz.",
          "Six bottles in a rush and nothing stuck → taste two side by side (Buffalo Trace against Rittenhouse, or similar); one comparison beats a flight you will not remember.",
        ],
      },
    ],
    deepDive: [],
    sources: [
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Matching what you smell to what the drink can hold.",
      },
      {
        label: "Dave Broom, The World Atlas of Whisky",
        note: "Tasting language for whiskey families without purple notes.",
      },
    ],
  },
  {
    slug: "whiskey-four-classics",
    title: "Four classics, four lessons",
    eyebrow: "Spirits",
    summary:
      "Each classic trains a different whiskey judgment — round vs snap, vermouth, lemon, and equal-parts bitter.",
    readingMinutes: 7,
    topics: ["whiskey", "old-fashioned", "manhattan", "whiskey-sour", "boulevardier"],
    coverImage: "/learn/whiskey-deep-dive.webp",
    coverAlt: "An Old Fashioned in a rocks glass with a large ice cube and orange peel",
    accentClass: whiskeyAccent,
    practice: [
      {
        slug: "old-fashioned",
        notice:
          "Default: Buffalo Trace or Maker’s Mark, or similar. Rye if you want snap. If it tastes like fruit salad, you muddled the structure away.",
      },
      {
        slug: "manhattan",
        notice:
          "Default: Rittenhouse Bonded or Wild Turkey 101 Rye. Bourbon is the softer cousin. If it’s dusty, fridge the wine first.",
      },
      {
        slug: "whiskey-sour",
        notice:
          "Default: Buffalo Trace or Jameson. Lemon should lead. If smoke is the first thing you taste, you left the template.",
      },
      {
        slug: "boulevardier",
        notice:
          "Default: rye to stay lean — Rittenhouse or similar. Buffalo Trace or Maker’s Mark softens the bitter. Stir cold.",
      },
    ],
    bigIdea: "Each classic trains a different whiskey judgment.",
    keyTakeaways: [],
    sections: [
      {
        heading: "Old Fashioned — structure, not fruit",
        figure: "whiskey-drinks",
        body: [
          "Spirit, sugar, bitters, ice. Stir until the heat drops. The whiskey should still be the point.",
          "Default bottle: a solid mixing bourbon — Buffalo Trace, Maker’s Mark, or similar around 45%. Bourbon makes it round. Reach for rye when you want snap. Both are correct. Fruit muddled in the glass is a later habit — not the lesson.",
        ],
      },
      {
        heading: "Manhattan — rye, bourbon, and the fridge",
        body: [
          "Whiskey, sweet vermouth, bitters. Default bottle: rye — Rittenhouse Bonded or Wild Turkey 101 Rye, or similar. That snap keeps vermouth from turning the drink into dessert. Bourbon is a legitimate softer cousin. Call it what it is.",
          "Half the drink is wine. Fridge the vermouth. Date it. If tonight’s Manhattan tastes dusty and nutty, open a fresher bottle before you change the whiskey.",
        ],
      },
      {
        heading: "Whiskey Sour — lemon leads",
        body: [
          "Spirit, lemon, sugar. Shake hard. Default bottle: Buffalo Trace, or Jameson if you want a softer Irish sour. Lemon should still be the loudest thing in the glass.",
          "Laphroaig 10 or Ardbeg 10 will usually bury the citrus unless you are building a Penicillin-style drink on purpose. If it tastes thin, check the juice and the shake before you blame the bottle.",
        ],
      },
      {
        heading: "Boulevardier — equal parts, two temperaments",
        body: [
          "Equal parts whiskey, Campari, sweet vermouth. Same bones as a Negroni. Default bottle: rye if you want it lean — Rittenhouse or similar. Buffalo Trace or Maker’s Mark softens the bitter.",
          "Stir cold. The Sazerac lives in the history lesson — cognac first, then rye — not as this fourth classic. Tonight is equal parts.",
        ],
      },
      {
        heading: "When the recipe only says whiskey",
        kind: "tip",
        body: [
          "Pour bourbon or rye unless the notes say otherwise. Scotch and Irish keep their own named drinks. A Rob Roy is the Manhattan idea on Scotch — Famous Grouse or Monkey Shoulder, or similar. Name it honestly.",
          "Old Fashioned and sour: bourbon is the usual home default — Buffalo Trace, Maker’s Mark, or similar. Manhattan and Boulevardier: rye if you have it. Then taste, and keep the pour that fits the glass.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "One bottle is doing every whiskey drink → Old Fashioned and sour: mixing bourbon (Buffalo Trace, Maker’s Mark, or similar); Manhattan and Boulevardier: rye (Rittenhouse Bonded or Wild Turkey 101 Rye, or similar).",
          "Old Fashioned tastes like fruit salad → skip the muddle; measure sugar and bitters, stir on ice, and express the peel.",
          "Manhattan tastes flabby or sweet → try a bonded rye (Rittenhouse, or similar); fridge the vermouth; do not fix it with more bitters alone.",
          "The recipe says only “whiskey” and smoke leads the sip → pour bourbon or rye unless the notes name Scotch; keep Laphroaig 10 or Ardbeg 10 for a float or rinse.",
        ],
      },
    ],
    deepDive: [],
    sources: [
      {
        label: "Robert Simonson, The Old-Fashioned",
        note: "Structure over fruit salad.",
      },
      {
        label: "David Wondrich, Imbibe!",
        note: "Manhattan and sour templates in the American bar.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Boulevardier as the whiskey equal-parts drink; vermouth care.",
      },
      {
        label: "Difford's Guide — whiskey classics",
        note: "Named drinks vs the word “whiskey” on a spec.",
        href: "https://www.diffordsguide.com/",
      },
    ],
  },
];
