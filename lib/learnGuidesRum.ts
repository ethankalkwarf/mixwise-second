/**
 * MixWise rum curriculum — five layered guides that replace spirit-primer-rum.
 */

import type { LearnGuide } from "@/lib/learnGuides";

const rumAccent = "from-terracotta/20 via-cream to-olive/15";

export const RUM_CURRICULUM_GUIDES: LearnGuide[] = [
  {
    slug: "rum-family-buying",
    title: "Rum: family & buying myth",
    eyebrow: "Spirits",
    summary:
      "Rum is a family, not one flavor. Stop shopping by bottle color — start with what the drink needs.",
    readingMinutes: 5,
    topics: ["rum", "buying", "color", "white rum", "aged rum", "spiced rum"],
    coverImage: "/learn/spirit-primer-rum.webp",
    coverAlt: "A classic Daiquiri in a coupe with a lime wheel",
    accentClass: rumAccent,
    practice: [
      {
        slug: "daiquiri",
        notice:
          "If the rum fights the lime — banana candy, varnish, or a heavy ester wall — that bottle doesn’t belong in this drink.",
      },
      {
        slug: "mojito",
        notice:
          "A clean mixing white keeps mint bright. A heavy funk rum can taste muddy once soda lengthens the glass.",
      },
      {
        slug: "dark-n-stormy",
        notice:
          "Ginger beer wants aged weight. Gosling’s is the trademarked name; the template still teaches the pour.",
      },
      {
        slug: "mai-tai",
        notice:
          "Start with a solid aged frame, then add funk as a fraction. Don’t let one loud bottle do every job.",
      },
    ],
    bigIdea:
      "Don’t buy rum by color. Get a clean mixing white for Daiquiris and Mojitos, and an aged bottle for Dark ’n’ Stormies and Mai Tais.",
    keyTakeaways: [
      "White, gold, and dark on a rum label are not reliable age grades — color can come from oak, caramel, or both.",
      "A lot of big mixing whites (Bacardi Superior included) spend time in oak, then get filtered clear — clear means filtered, not young.",
      "Spiced rum is a flavored product, not a synonym for aged rum.",
      "Start with one clean white mixing rum and one solid aged rum. Add funky, agricole, or overproof when recipes ask.",
      "The Daiquiri is a quick bottle test — if the rum fights the lime, that bottle doesn’t belong in this drink.",
    ],
    sections: [
      {
        heading: "Rum is a family, not a flavor",
        kind: "rule",
        figure: "rum-styles",
        body: [
          "Rum is distilled from sugarcane products — usually molasses, sometimes fresh cane juice — then often aged. Unlike bourbon, there is no single worldwide mash-and-barrel rulebook. Bottles labeled “rum” can taste as different as vodka and peated Scotch.",
          "Buy for the drink you’re making: a clean mixing rum behind citrus, an aged rum when you want body and oak, a funky pot-still rum when you want more aroma. The Daiquiri is the quickest test — if the rum fights the lime, that bottle doesn’t belong in this drink.",
        ],
      },
      {
        heading: "White, gold, dark — what color does not guarantee",
        figure: "rum-color-myth",
        body: [
          "A lot of the big mixing whites — Bacardi Superior included — spend time in oak, then get filtered until they look clear. Clear means filtered, not young. That light aging is why a good mixing white still feels soft under lime instead of sharp and thin.",
          "Not every white is oak-then-filter. Agricole blanc is usually unaged — grassy cane, not charcoal-stripped oak — so Rhum Clément Blanc or similar is a different Daiquiri than a Spanish-style mixing white. Puerto Rican mixing rum often meets a one-year oak minimum, then many brands filter for a clear bottle.",
          "Gold and dark are weaker signals. The color might be years in wood, a dose of caramel, heavy molasses character, or all three. Rum doesn’t police age statements the way Scotch does. If a near-black bottle mostly tastes like sweet syrup and heat, it will bully a dry Daiquiri no matter how serious the label looks.",
          "Spiced rum is its own product — vanilla, spice, often sugar. Captain Morgan and Sailor Jerry are the usual shelf examples: use them when you want those flavors. Don’t treat them as your aged Mai Tai bottle.",
        ],
      },
      {
        heading: "Two bottles to start",
        kind: "tip",
        body: [
          "Start with one clean Spanish-style mixing white you like in a Daiquiri — Bacardi Superior, Havana Club 3 where Cuban rum is sold, or a similar filtered white — plus one solid aged rum you like neat or in a ginger highball. Flor de Caña 4 or 7 is the usual soft Spanish-style oak frame; Mount Gay Eclipse or Doorly’s is the approachable Barbados one. That pair covers most MixWise rum recipes.",
          "Add a job when recipes ask, not a trophy. Appleton Estate Signature is the friendlier Jamaican aged rum — oak and a little funk without blowing the glass. Smith & Cross or Wray & Nephew Overproof is funk as a tool, not a daily mixer. El Dorado 5 or 8 gives Demerara weight in a ginger highball. Rhum Clément Blanc or similar is the grassy unaged cane bottle.",
          "Around 40% ABV can taste thin once sugar and citrus arrive. A notch higher holds a Daiquiri better.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Shopping by color as if it were a legal age grade → smell the rum, or read still / age / dosage if the producer prints it.",
          "Treating Captain Morgan or Sailor Jerry as aged rum → those are flavored products; pick Flor de Caña 7, Mount Gay Eclipse, or similar for oak and body.",
          "Daiquiri tastes like banana or solvent → switch to a cleaner white (or 3:1 clean to funky) before you add more sugar.",
        ],
      },
    ],
    sources: [
      {
        label: "Martin Cate, Smuggler's Cove",
        note: "Rum categories for drinks — pragmatic, cocktail-first.",
      },
      {
        label: "Dave Broom, Rum: The Manual",
        note: "Style maps and how production shows up in the glass.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Rum in Daiquiris, Mojitos, and punch logic.",
      },
      {
        label: "Difford's Guide — Rum",
        note: "Style overviews and classic applications.",
        href: "https://www.diffordsguide.com/",
      },
    ],
  },
  {
    slug: "rum-how-its-made",
    title: "How rum is made",
    eyebrow: "Spirits",
    summary:
      "A few production levers explain most of what you smell and taste. Learn those, and bottle choice stops feeling like guesswork.",
    readingMinutes: 6,
    topics: ["rum", "production", "molasses", "agricole", "esters", "aging"],
    coverImage: "/learn/rum-how-its-made.webp",
    coverAlt: "Oak rum barrels stacked in a distillery warehouse",
    accentClass: rumAccent,
    practice: [
      {
        slug: "daiquiri",
        notice:
          "Taste the rum neat first. If you already smell banana or solvent, that ester load will bury the lime.",
      },
      {
        slug: "mai-tai",
        notice:
          "Notice what the aged rum contributes — oak and weight — before you add a funky fraction.",
      },
      {
        slug: "dark-n-stormy",
        notice:
          "Ginger tells you whether the rum has real body, or just color and sugar.",
      },
      {
        slug: "mojito",
        notice:
          "A clean column-still white keeps mint bright. A pot-still ester rum can muddy the soda.",
      },
    ],
    bigIdea:
      "Production choices — base, ferment, still, oak, and sugar — show up in the glass more honestly than the color on the label.",
    sections: [
      {
        heading: "From cane to glass",
        kind: "rule",
        figure: "rum-production",
        body: [
          "A few production choices sit between the field and the glass: what you ferment, how long it ferments, how you distill it, how you age it, and what you add at the end.",
          "Those levers show up in the glass more honestly than the color on the label. Learn them, and a new bottle is a set of choices you can taste.",
        ],
      },
      {
        heading: "Molasses vs cane juice",
        body: [
          "Most rum starts as molasses, the leftover of sugar-making. It can be clean and versatile, or rich and sticky, depending on everything that follows.",
          "Rhum agricole starts as fresh cane juice. It often reads grassy, olive, and bright — Rhum Clément Blanc or similar is the usual bottle for that job. Beautiful, and a different Daiquiri than a Spanish-style mixing white.",
        ],
      },
      {
        heading: "Ferment, still, and esters",
        body: [
          "Yeast and time make aroma. Short, controlled ferments stay quiet. Long, wilder ferments build esters. Pot stills keep more of that aroma; column stills can refine toward a clean mixing rum. Many bottles are a blend of both.",
          "Push them hard and you get banana, pineapple, or a sharp solvent note. That smell was meant to carry across a punch bowl. In a Daiquiri, it usually buries the lime.",
          "A high-ester Jamaican like Smith & Cross is that punch-bowl tool — not a silent swap for Bacardi Superior. If the producer prints still type, ester marks, age, or dosage, that sheet is more honest than gold foil.",
        ],
      },
      {
        heading: "Oak, climate, and what’s added",
        kind: "tip",
        body: [
          "Heat and humidity in the tropics pull more from oak, faster, and lose more to the angels. A few years in Barbados is not a few years in a cooler warehouse. The number on the label is not a flavor score.",
          "Some producers add caramel or a little sugar after aging — dosage. That can read as softness or as syrup. If a “dark” rum tastes mostly sweet, believe your tongue.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Reading color as a production story → taste whether the weight is oak or sugar, and check still / age / dosage if they print it.",
          "Treating every white rum as unaged agricole → Spanish-style mixing whites are often oak-then-filter; Clément Blanc or similar is the grassy unaged job.",
          "High-ester pot-still rum in a 2:1:1 Daiquiri tastes like banana or solvent → cut it 3:1 with a clean white, or save Smith & Cross for punch and Mai Tai fractions.",
        ],
      },
    ],
    sources: [
      {
        label: "Dave Broom, Rum: The Manual",
        note: "Production levers — base, ferment, still, and oak — in tasting language.",
      },
      {
        label: "Martin Cate, Smuggler's Cove",
        note: "How those levers show up in classic rum drinks.",
      },
      {
        label: "Difford's Guide — Rum production",
        note: "Category overviews and still/aging notes.",
        href: "https://www.diffordsguide.com/",
      },
    ],
  },
  {
    slug: "rum-history-in-glass",
    title: "Rum history in your glass",
    eyebrow: "Spirits",
    summary:
      "A few true stories explain why classics call for clean white, navy-weight rum, or a funky blend — not a timeline for its own sake.",
    readingMinutes: 6,
    topics: ["rum", "history", "daiquiri", "navy", "tiki", "cuba"],
    coverImage: "/learn/rum-history-in-glass.webp",
    coverAlt: "El Floridita neon sign in Havana, home of the Daiquiri",
    accentClass: rumAccent,
    practice: [
      {
        slug: "daiquiri",
        notice:
          "This is the clean-white chapter: lime first. If history made you reach for a dark bottle, pour again.",
      },
      {
        slug: "dark-n-stormy",
        notice:
          "Navy weight is the lesson — proof and body that hold ginger, not a darker tint.",
      },
      {
        slug: "mai-tai",
        notice:
          "Tiki treated rum like a kitchen. Blend a frame and a funk; don’t hunt one mythical bottle.",
      },
      {
        slug: "mojito",
        notice:
          "Another Cuban sour skeleton, lengthened. Clean rum still does the work.",
      },
    ],
    bigIdea: "Rum history earns a place in Learn only when it changes what you pour.",
    sections: [
      {
        heading: "Two chapters of the Daiquiri",
        figure: "rum-history",
        body: [
          "The usual documented start is Jennings Cox, an American engineer near the Daiquirí mines in Cuba, around the turn of the twentieth century: rum, lime, and sugar as a practical sour. Later retellings fill in details the contemporary record does not always lock down. The template is what survived.",
          "Constantino Ribalaigua Vert at El Floridita did not invent lime and rum. He refined the shake, the freeze, and the service until the Daiquiri became a house signature. Cox is the usual cited start; Floridita’s role in popularizing the shaken Daiquiri is on firmer ground. Separate those two chapters when you choose a bottle: clean rum, bright lime.",
        ],
      },
      {
        heading: "Prohibition tourism, carefully",
        body: [
          "When the United States went dry, Havana was wet. Americans drank at Floridita and elsewhere, then brought the sour home in memory and in print. The drinks that traveled were the ones that could be made again.",
          "Hemingway drank there. That is documented nightlife, not authorship. He did not invent the Daiquiri.",
        ],
      },
      {
        heading: "Navy strength still matters",
        body: [
          "The Royal Navy issued rum for centuries. The useful leftover is strength: navy-proof rum sits near 57% ABV (about 54.5% overproof on the old British scale) and holds ginger, sugar, and ice without going thin.",
          "The story that gunpowder would still light if the rum was strong enough is folklore around that older proof system. Use the proof. Don’t treat the legend as a tasting method.",
        ],
      },
      {
        heading: "Jamaica punch and tiki blends",
        body: [
          "Jamaican pot-still rum was built to carry across a punch bowl — high aroma, high ester, not a shy backbone. Smith & Cross is the usual modern bottle for that job — not a silent Daiquiri swap.",
          "Mid-century tiki treated rum like a kitchen: blend a clean or aged frame with a funky fraction. The Mai Tai is that idea in a rocks glass.",
        ],
      },
      {
        heading: "Why island styles diverged",
        kind: "tip",
        body: [
          "Islands that refined sugar had molasses to ferment. Places that distilled juice kept a grassy agricole character. Column stills later made clean mixing rum at scale.",
          "That is why a supermarket “white rum” and a Martinique blanc are not silent swaps — the sugar economy showed up in the glass.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Treating Hemingway as the inventor of the Daiquiri → pour a clean mixing white and a hard shake; the bar refined the drink, it did not author lime and rum.",
          "Using “navy rum” as any dark bottle → you want ~57% ABV and real body that holds ginger, not a darker tint.",
          "One tiki-blend bottle in a Mai Tai → start with an aged frame, then add a Jamaican fraction until the lime still reads.",
        ],
      },
    ],
    sources: [
      {
        label: "David Wondrich, Imbibe!",
        note: "Sour templates and the American bar’s rum chapter.",
      },
      {
        label: "Martin Cate, Smuggler's Cove",
        note: "Tiki blending logic and rum families in drinks.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Classic rum serves and what the glass actually needs.",
      },
    ],
  },
  {
    slug: "rum-learn-to-taste",
    title: "Learn to taste the difference",
    eyebrow: "Spirits",
    summary: "Styles are easiest to learn with your nose. A short tasting protocol beats another chart.",
    readingMinutes: 6,
    topics: ["rum", "tasting", "styles", "esters", "agricole"],
    coverImage: "/learn/rum-learn-to-taste.webp",
    coverAlt: "Small tasting glasses of rum being poured side by side",
    accentClass: rumAccent,
    practice: [
      {
        slug: "daiquiri",
        notice:
          "Mini-lab A: same spec, two whites. Name which lime survived.",
      },
      {
        slug: "dark-n-stormy",
        notice:
          "Mini-lab B: same ginger beer, two aged rums. Ginger tells you which has real weight.",
      },
      {
        slug: "mai-tai",
        notice:
          "Mini-lab C: aged only vs aged plus a barspoon of funk. The second drink is the lesson.",
      },
      {
        slug: "mojito",
        notice:
          "Smell the rum before the mint goes in. If it’s already loud, soda will not hide it.",
      },
    ],
    bigIdea: "Learn rum styles by smelling and tasting on purpose — then name what you found.",
    sections: [
      {
        heading: "A tasting protocol",
        kind: "rule",
        figure: "rum-tasting-protocol",
        body: [
          "Smell it first. Then taste. Write two words — then name the style. Guessing early just trains you to confirm what you already believed.",
          "Neat, or with a few drops of water if it is hot. Same glass shape if you can. You are training a comparison, not hosting a party.",
        ],
      },
      {
        heading: "Four personalities on the palate",
        figure: "rum-styles",
        body: [
          "Clean mixing white: quiet cane, maybe a hint of oak that was filtered away. Lime should still be the loudest thing in a Daiquiri.",
          "Aged: wood, caramel, dried fruit, more weight. Taste whether that weight is oak or sugar.",
          "Funky Jamaican-style: esters first — aroma compounds from fermentation, a Jamaican tradition, not a defect. If you smell the punch bowl, you found it. Two words beat a paragraph of tasting-note poetry: “banana, solvent” is more useful than “tropical sunset.”",
          "Agricole: fresh cane and herbs. If it smells like a field, believe it.",
        ],
      },
      {
        heading: "Mini labs",
        kind: "tip",
        body: [
          "A: Same Daiquiri, two whites — a clean mixing white versus Clément Blanc or similar agricole. Name which lime survived.",
          "B: Same highball, two aged rums — one dry, one sweet. Ginger tells you which has real weight.",
          "C: Split a Mai Tai — all aged vs aged-plus-a-barspoon of funk. The second drink is the lesson.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Guessing the style from the label before you smell the glass → nose first, two words, then name it.",
          "Calling every aromatic rum “spiced” → spice blends smell like vanilla and baking spice; esters smell like banana, pineapple, or solvent.",
          "Tasting six bottles in a rush and remembering none → two rums, same glass, write two words each.",
        ],
      },
    ],
    sources: [
      {
        label: "Dave Broom, Rum: The Manual",
        note: "Tasting language for rum families without purple notes.",
      },
      {
        label: "Martin Cate, Smuggler's Cove",
        note: "Matching what you smell to what the drink can hold.",
      },
    ],
  },
  {
    slug: "rum-four-classics",
    title: "Four classics, four lessons",
    eyebrow: "Spirits",
    summary:
      "Each classic teaches a different rum skill — clean spine, mint and length, weight in a highball, and blending on purpose.",
    readingMinutes: 7,
    topics: ["rum", "daiquiri", "mojito", "dark-n-stormy", "mai-tai"],
    coverImage: "/learn/rum-four-classics.webp",
    coverAlt: "A Mojito packed with crushed ice and mint, photographed poolside",
    accentClass: rumAccent,
    practice: [
      {
        slug: "daiquiri",
        notice:
          "Diagnostic: if it tastes like banana candy or varnish, change the rum — not the 2:1:1.",
      },
      {
        slug: "mojito",
        notice:
          "Same sour skeleton, lengthened. Press mint; keep the rum clean so soda stays bright.",
      },
      {
        slug: "dark-n-stormy",
        notice:
          "Ginger needs weight. Gosling’s is the trademark; another honest aged rum still teaches the highball.",
      },
      {
        slug: "mai-tai",
        notice:
          "Aged frame first, then a funky fraction until the lime still reads. Blends beat the tiki bottle.",
      },
    ],
    bigIdea: "Pour the classics as lessons: each one trains a different kind of rum judgment.",
    sections: [
      {
        heading: "Daiquiri diagnostic",
        figure: "rum-drinks",
        body: [
          "2:1:1 rum, lime, sugar is a diagnostic. Shake hard, taste cold. Bacardi Superior or a similar clean mixing white is the default bottle.",
          "Banana candy or varnish means esters took the drink — switch rum (or cut 3:1 clean to funky) before you change the spec. Thin and hot means weak rum or a short shake. Soft and dull means old lime.",
        ],
      },
      {
        heading: "Mojito — lengthen without muddying",
        body: [
          "Same acid-sweet idea, built long with mint and soda. Default bottle is the same clean mixing white as the Daiquiri — Bacardi Superior or similar.",
          "Press mint. Don’t shred it. A clean rum keeps the lengthener bright; a heavy funk rum can taste muddy once soda is in.",
        ],
      },
      {
        heading: "Dark ’n’ Stormy — weight in a highball",
        body: [
          "Packed ice, rum with enough body, cold ginger beer last.",
          "Gosling’s Black Seal is the trademarked rum for the named drink. For the highball lesson at home, El Dorado 5 or 8 — or similar Demerara weight — teaches the same ginger test. Call it honestly if it is not Gosling’s.",
        ],
      },
      {
        heading: "Mai Tai — blend on purpose",
        body: [
          "Orgeat, lime, orange liqueur, and rum. The rum is usually a blend because one bottle rarely has both frame and perfume.",
          "Start with an aged Barbados or Spanish-style frame — Mount Gay Eclipse, Flor de Caña 7, or similar — then a Jamaican splash (Appleton Estate Signature, or Smith & Cross if you want more perfume) until the lime still reads. A house blend lets you tune esters; a single “tiki rum” locks the ratio. Five extra bottles can wait.",
        ],
      },
      {
        heading: "When the recipe only says rum",
        kind: "tip",
        body: [
          "Citrus-up: a clean mixing white (Bacardi Superior or similar). Ginger highball: aged or navy-weight — El Dorado 5 or 8 for the template, Gosling’s if you are making the named drink. Orgeat and tiki: aged Barbados or Spanish-style frame, then a Jamaican splash on purpose.",
          "Spiced rum is a different product. Don’t hear “rum” and reach for spice.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "One bottle for every rum drink on the list → clean white for Daiquiri and Mojito; aged weight for ginger; aged frame plus a Jamaican splash for Mai Tai.",
          "Shredding mint, then blaming the rum → press the leaves, keep the mixing white clean, and taste before you change bottles.",
          "Buying a “tiki rum” instead of blending → aged Barbados or Spanish-style frame, then funk as a fraction until the lime still reads.",
        ],
      },
    ],
    sources: [
      {
        label: "Martin Cate, Smuggler's Cove",
        note: "Mai Tai blending and why one rum rarely does every job.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Daiquiri, Mojito, and highball structure.",
      },
      {
        label: "Difford's Guide — rum classics",
        note: "Named drinks vs templates, including Dark ’n’ Stormy.",
        href: "https://www.diffordsguide.com/",
      },
    ],
  },
];
