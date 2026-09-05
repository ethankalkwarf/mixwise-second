/**
 * MixWise gin curriculum — five layered guides that replace spirit-primer-gin.
 */

import type { LearnGuide } from "@/lib/learnGuides";

const ginAccent = "from-olive/25 via-cream to-forest/15";

export const GIN_CURRICULUM_GUIDES: LearnGuide[] = [
  {
    slug: "gin-family-buying",
    title: "Gin: family & buying myth",
    eyebrow: "Spirits",
    summary:
      "Gin is a flavored spirit with a juniper legal spine. Buy for how botanicals behave under tonic, vermouth, or citrus — not bottle art.",
    readingMinutes: 5,
    topics: ["gin", "botanicals", "london dry", "contemporary", "buying"],
    coverImage: "/learn/gin-family-buying.webp",
    coverAlt:
      "London dry gin bottles on a shop shelf — Gordon’s, Gilbey’s, Beefeater, Bombay Sapphire, Tanqueray",
    accentClass: ginAccent,
    practice: [
      {
        slug: "gin-and-tonic",
        notice:
          "Beefeater or Tanqueray with a dry tonic. Hendrick’s wants a leaner one. If the gin tastes soapy or candy-sweet neat, tonic will amplify it — not hide it.",
      },
      {
        slug: "martini",
        notice:
          "Beefeater or Tanqueray. A juniper-led London dry keeps vermouth from turning the drink into perfume water.",
      },
      {
        slug: "negroni",
        notice:
          "Beefeater or Tanqueray. Hendrick’s can disappear under Campari — name that honestly.",
      },
      {
        slug: "last-word",
        notice:
          "Same London dry, or Plymouth Navy Strength / Tanqueray export strength if you want more density. Loud gin is allowed.",
      },
    ],
    bigIdea:
      "Gin is a flavored spirit with a juniper legal spine — buy for how botanicals behave under tonic, vermouth, or citrus, not bottle art.",
    keyTakeaways: [
      "Juniper must be perceptible for it to be gin; everything else is house style.",
      "London dry is the cocktail default — Beefeater, Tanqueray, or another juniper-led bottle you like.",
      "Hendrick’s and similar contemporaries can be citrus- or floral-forward — great in G&Ts, riskier in a Negroni.",
      "Tonic is a lengthener with bitterness; it reveals gin character instead of covering flaws.",
      "Buy a London dry you like with a whisper of vermouth — not only with soda.",
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
          "London dry is a production style, not a geography requirement: distilled with botanicals, no sweetening after distillation beyond a tiny allowance, and a dry profile. Beefeater and Tanqueray are the usual juniper-led home defaults — Martinis, Negronis, classic G&Ts. Another juniper-led London dry you already like does the same job.",
          "Contemporary gins often push citrus, cucumber, floral, or spice notes. Hendrick’s is the familiar cucumber-floral example: brilliant in a G&T, riskier in a Negroni. Name the job honestly. Taste neat with a drop of water before you commit a whole bottle to equal-parts drinks.",
        ],
      },
      {
        heading: "A starter bottle",
        kind: "tip",
        body: [
          "You do not need a gin library. One solid London dry — Beefeater, Tanqueray, or similar juniper-led — that you like with a whisper of dry vermouth covers Martinis, Negronis, Last Words, and most G&Ts.",
          "Add Hendrick’s, or another cucumber-floral contemporary, when you want a brighter highball — not as a silent swap for the cocktail default. Navy strength and Old Tom can wait until a recipe or a sour asks.",
        ],
      },
      {
        heading: "Old Tom, navy strength, and genever — shopping footnotes",
        kind: "tip",
        body: [
          "Old Tom is a slightly sweeter historic style — Hayman’s Old Tom is the usual shopping example. Useful in older recipes that assume a softer gin. Navy strength (often ~57% ABV) holds citrus and sugar in sours; Plymouth Navy Strength is a measured tool, not a flex. Tanqueray bottled at export strength (~47%) is a smaller density step — still not a silent swap for 40% by the ounce.",
          "Genever is malt-forward and closer to whiskey in some stirred drinks. Bols Genever is the familiar cousin on a shelf. It is not a 1:1 London dry substitute. Production and history lessons unpack both.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Martini tastes hollow after you shopped only for a G&T → start with a juniper-led London dry (Beefeater, Tanqueray, or similar) you like with a whisper of vermouth; add Hendrick’s later for the highball fork.",
          "Label says “craft” or “small batch” and you treated that as quality → ignore those words; shop London dry vs contemporary by how the botanicals behave under vermouth or tonic.",
          "G&T goes flat in two minutes → pack the glass with ice and use fridge-cold tonic before you change the gin.",
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
    slug: "gin-how-its-made",
    title: "How gin is made",
    eyebrow: "Spirits",
    summary:
      "Base spirit, botanical recipe, and still choices explain why two gins drink differently in a Martini.",
    readingMinutes: 6,
    topics: ["gin", "production", "botanicals", "vapor infusion", "london dry", "navy strength"],
    coverImage: "/learn/gin-how-its-made.webp",
    coverAlt:
      "Brass manway on Gilbey’s copper gin still at Harlow Museum — where the botanical bill is locked in",
    accentClass: ginAccent,
    practice: [
      {
        slug: "martini",
        notice:
          "Taste the gin neat first. The botanical bill and the still are most of what you will still hear under vermouth.",
      },
      {
        slug: "negroni",
        notice:
          "Campari is loud. Beefeater or Tanqueray still reads; Hendrick’s, or another soft floral steep, often does not.",
      },
      {
        slug: "last-word",
        notice:
          "Plymouth Navy Strength or Tanqueray export strength holds Chartreuse and lime. A shy 40% pour can taste thin in the same ounces.",
      },
      {
        slug: "gin-and-tonic",
        notice:
          "Tonic lengthens whatever the still put in the bottle. It will not rewrite a soapy botanical bill.",
      },
    ],
    bigIdea:
      "Base spirit, botanical recipe, and still choices explain why two gins drink differently in a Martini.",
    keyTakeaways: [],
    sections: [
      {
        heading: "From base to bottle",
        kind: "rule",
        figure: "gin-production",
        body: [
          "A few production choices sit between the grain and the glass: what you start with, which botanicals you load, how you extract them, and how you bottle the result.",
          "Those levers show up more honestly than the illustration on the label. Learn them, and a new bottle is a set of choices you can taste.",
        ],
      },
      {
        heading: "Neutral vs characterful base",
        body: [
          "Most cocktail gin begins as a high-proof neutral spirit — usually column-distilled grain — then gets redistilled or infused with botanicals. The mash is quiet on purpose. The botanical bill does the talking.",
          "A characterful base — malt wine in genever, a heavier grain distillate in some craft gins — leaves bread, oil, or sweetness under the juniper. That is a different Martini than a clean London dry, even at the same proof.",
        ],
      },
      {
        heading: "Vapor infusion vs steeping",
        body: [
          "Steeping — maceration — soaks botanicals in spirit before the still runs. It can pull deeper, rounder, sometimes earthier notes. Leave them too long and the gin tastes stewed.",
          "Vapor infusion hangs botanicals in a basket. Steam picks up aroma as it rises. The result often reads brighter and more perfume-forward — citrus and floral notes sit on top instead of in the body. That is why a cucumber-floral contemporary such as Hendrick’s can smell like a garden before vermouth arrives.",
          "Many houses do both. The useful leftover is not a brand story. It is why one gin smells like pine and another like a flower stall before you add vermouth.",
        ],
      },
      {
        heading: "A juniper-led botanical bill",
        body: [
          "Juniper has to be perceptible. That is the legal spine. Coriander, citrus peel, angelica, and orris are the usual supporting cast. After that, the recipe is house style.",
          "A juniper-led bill keeps structure in a Martini and a Negroni. A citrus- or floral-led bill can be lovely with tonic and disappear the moment Campari arrives.",
        ],
      },
      {
        heading: "London dry rules and proof as a tool",
        kind: "tip",
        body: [
          "London dry is a production rulebook, not a postcode. Botanicals must be distilled. No flavoring after distillation. Sweetening only within a tiny allowance. Water to bottle strength. That is why a London dry tastes dry in the glass, not candied.",
          "ABV is a density tool. Around 40% can taste thin once vermouth, citrus, or sugar enter. Plymouth Navy Strength — near 57% — holds a Last Word or a sour without going slack. Tanqueray at export strength (~47%) is a smaller step. Neither is a silent ounce-for-ounce swap for a standard bottle.",
        ],
      },
      {
        heading: "Old Tom and genever — cousins, not swaps",
        kind: "tip",
        body: [
          "Hayman’s Old Tom is a slightly sweeter historic style. Older recipes that assume it — a Tom Collins, some Martinez specs — will taste lean if you pour a bone-dry London dry without adjusting sugar.",
          "Bols Genever starts closer to whiskey: a malt-wine base, then juniper. It can stir beautifully. It will not silently do a dry Martini’s job. Call the pour what it is.",
        ],
      },
      {
        heading: "What “compound” gin is doing",
        body: [
          "Some inexpensive gins are flavored after distillation — essence in a neutral spirit, no second still run. Legal in some markets. They often taste flat or soapy once tonic or vermouth arrives. If the bottle never mentions distillation with botanicals, believe the gap.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "You bought from the illustration → read production clues instead: distilled botanicals, London dry rules, and proof.",
          "Negroni tastes like Campari and wine → switch to a juniper-led London dry (Beefeater, Tanqueray, or similar); a vapor-infused floral such as Hendrick’s often disappears in equal parts.",
          "Navy-strength Last Word tastes hot → cut the pour or accept the extra density; Plymouth Navy Strength or Tanqueray export strength is not a silent 40% swap.",
        ],
      },
    ],
    sources: [
      {
        label: "Dave Broom, Gin: The Manual",
        note: "How base, botanicals, and stills show up in the glass.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "London dry as the mixing default; proof as a practical tool.",
      },
      {
        label: "Difford's Guide — gin production",
        note: "Category overviews and still notes.",
        href: "https://www.diffordsguide.com/",
      },
    ],
  },
  {
    slug: "gin-history-in-glass",
    title: "Gin history in your glass",
    eyebrow: "Spirits",
    summary:
      "A few true stories explain why a recipe wants London dry, vermouth judgment, or a louder gin — not a timeline for its own sake.",
    readingMinutes: 6,
    topics: ["gin", "history", "genever", "martini", "negroni", "tonic"],
    coverImage: "/learn/gin-history-in-glass.webp",
    coverAlt:
      "Nineteenth-century lithograph of a London gin palace as a “temple of Juniper,” by C. J. Grant",
    accentClass: ginAccent,
    practice: [
      {
        slug: "martini",
        notice:
          "Beefeater or Tanqueray, measured vermouth, stirred cold. If history made you reach for Hendrick’s, pour again.",
      },
      {
        slug: "negroni",
        notice:
          "Equal parts, Florence-era bones. The leftover is Beefeater or Tanqueray — gin that still reads under Campari.",
      },
      {
        slug: "gin-and-tonic",
        notice:
          "Colonial tonic is the legend. Packed ice and a matched tonic are the skill.",
      },
      {
        slug: "last-word",
        notice:
          "A later equal-parts sour. The gin can have volume — the template already does.",
      },
    ],
    bigIdea: "History earns a place in Learn only when it changes the pour.",
    keyTakeaways: [],
    sections: [
      {
        heading: "Genever to London dry",
        figure: "gin-history",
        body: [
          "Genever is the older Dutch cousin — malt wine flavored with juniper. It traveled to England, where cheaper grain spirit and, later, column stills made a drier, cleaner gin. London dry became the nineteenth-century export style: unsweetened, botanically assertive, built for bars that mixed.",
          "The useful leftover is the pour. When a classic says only “gin,” it usually means that drier English style — Beefeater, Tanqueray, or similar — not Bols Genever and not a cucumber-led contemporary such as Hendrick’s.",
        ],
      },
      {
        heading: "The Martini is a gin-and-vermouth judgment",
        body: [
          "The Martini settled in the late 1800s as gin and vermouth. Martinez, Manhattan, and hotel-bar stories compete in print. Treat them as legend around a documented template. None of them change the glass as much as the ratio and the bottle.",
          "What survived is the judgment: mostly gin, a measured wine, stirred cold. Hendrick’s, or another soft floral, can taste like cold cologne once the vermouth fades. Juniper and structure — Beefeater, Tanqueray, or similar — are the era’s leftover.",
        ],
      },
      {
        heading: "Negroni — bitter equal parts",
        body: [
          "The usual telling is Florence, around 1919–20: a Count Negroni asking a café to stiffen an Americano with gin. Contemporary paperwork is thinner than later retellings. The template is what we can teach.",
          "Equal parts gin, Campari, sweet vermouth. The bitter frame is the point. Gin must still read. That is why a Hendrick’s-style bottle that only shines in a G&T can make a Negroni taste like Campari and wine.",
        ],
      },
      {
        heading: "G&T — tonic matching, not a medicine story",
        body: [
          "British officers in malaria country drank quinine tonic. Gin joined the glass. That colonial highball habit is the usual origin sketch. Quinine doses in modern tonic are not a treatment, and the story is not a tasting method.",
          "Reframe it as skill. Tonic is a bitter lengthener with its own sugar. Packed ice and a fridge-cold bottle reveal the gin. Warm soda and three cubes flatten any bottle. Match the tonic to the botanicals — dry tonic for Beefeater or Tanqueray, a leaner one for Hendrick’s.",
        ],
      },
      {
        heading: "Last Word — a later equal-parts chapter",
        kind: "tip",
        body: [
          "The Last Word is documented at the Detroit Athletic Club in the 1920s and revived in the early 2000s. It is not a nineteenth-century London dry story. It teaches volume: gin can be loud when Chartreuse and lime already are.",
          "Stay on the same Beefeater / Tanqueray default, or step up density with Plymouth Navy Strength or Tanqueray export strength if you want more spine. A shy floral 40% bottle will taste like herbs and lime.",
        ],
      },
      {
        heading: "Why contemporary Negronis got weird",
        kind: "tip",
        body: [
          "The 2000s gin boom filled shelves with citrus, floral, and cucumber bottles. Many are excellent highballs. Equal-parts drinks were written for a drier, juniper-led spine.",
          "If a Negroni from the last twenty years tastes hollow or perfumed, check the gin before you blame Campari. History here is a shopping warning, not a lecture.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "A hotel Martini story changed your pour → keep the template: Beefeater or Tanqueray, measured vermouth, stirred cold. Origin names are legend.",
          "G&T history lesson, flat drink → pack the ice and match the tonic (dry for London dry, leaner for Hendrick’s) before you reread the quinine story.",
          "Negroni from a newer floral bottle tastes hollow → pour a juniper-led London dry; Hendrick’s-style boom gins belong in the G&T, not equal parts.",
        ],
      },
    ],
    sources: [
      {
        label: "David Wondrich, Imbibe!",
        note: "Martini-family templates and the American bar — documented vs later legend.",
      },
      {
        label: "Dave Broom, Gin: The Manual",
        note: "Genever to London dry, and the contemporary boom in tasting language.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Negroni and Last Word as modern defaults; what the glass needs.",
      },
    ],
  },
  {
    slug: "gin-learn-to-taste",
    title: "Learn to taste the difference",
    eyebrow: "Spirits",
    summary: "Styles are easiest to learn with your nose. A short protocol beats another shelf chart.",
    readingMinutes: 6,
    topics: ["gin", "tasting", "london dry", "contemporary", "vermouth", "tonic"],
    coverImage: "/learn/gin-learn-to-taste.webp",
    coverAlt:
      "A gin tasting flight at Tales of the Cocktail — stemmed glasses on a marked mat, including Beefeater London and Plymouth",
    accentClass: ginAccent,
    practice: [
      {
        slug: "gin-and-tonic",
        notice:
          "Mini-lab C, in a drink: taste the tonic alone, then the G&T. Name whether the gin or the soda is the mismatch.",
      },
      {
        slug: "martini",
        notice:
          "Mini-lab B: same whisper of vermouth, two gins. Name which one kept the drink from cologne.",
      },
      {
        slug: "negroni",
        notice:
          "Smell the gin before Campari goes in. If it already smells like a flower stall, this equal-parts drink will bury it.",
      },
      {
        slug: "last-word",
        notice:
          "Two words for the gin first — then taste whether it still has a voice under Chartreuse.",
      },
    ],
    bigIdea: "Learn styles with a short protocol, not a shelf chart.",
    keyTakeaways: [],
    sections: [
      {
        heading: "A tasting protocol",
        kind: "rule",
        figure: "gin-tasting-protocol",
        body: [
          "Smell first. Taste. Two words — then name the style. Guessing early just trains you to confirm what the label already told you. “Juniper, dry” or “floral, soft” will still help you at the shelf next month. A stack of botanist names will not.",
          "Name London dry vs contemporary first. Old Tom and genever are footnotes: Hayman’s (sweeter) or Bols (malt-forward). Write the words. Then look at the bottle.",
        ],
      },
      {
        heading: "What to listen for",
        figure: "gin-styles",
        body: [
          "London dry: juniper, peel, a dry finish. Beefeater or Tanqueray if you need a named glass. If pine and citrus pith are the first things you smell, you found the cocktail default.",
          "Contemporary: citrus candy, cucumber, florals, or spice in front. Hendrick’s is the usual cucumber-floral example. If the nose is a garden and juniper is a rumor, believe it.",
          "Old Tom: softer, a little sweet — Hayman’s is the shopping footnote. Useful in older specs. Not a silent dry Martini pour.",
          "Genever: malt, bread, oil under the juniper — Bols is the familiar cousin. Closer to whiskey in a stirred drink.",
        ],
      },
      {
        heading: "Mini labs",
        kind: "tip",
        body: [
          "A: A juniper-led London dry (Beefeater or Tanqueray) vs a contemporary such as Hendrick’s, neat. Same splash, same glass shape. Two words each. Then name the style.",
          "B: The same tiny vermouth taste — a barspoon in each gin. Name which one stayed structured.",
          "C: Tonic alone, then a G&T with each gin. If the highball tastes soapy or flat, decide whether the gin or the tonic did that. Warm soda is a third suspect.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "You named the style from the label first → smell, sip, write two words, then look. Guessing early just confirms the sticker.",
          "You called an aromatic gin “craft” → describe the bill instead: juniper-led (Beefeater / Tanqueray) vs cucumber-floral (Hendrick’s). Aroma is not a quality score.",
          "Six bottles, no leftover → taste two pours (London dry vs Hendrick’s), write two words each, then stop.",
        ],
      },
    ],
    sources: [
      {
        label: "Dave Broom, Gin: The Manual",
        note: "Tasting language for gin families without purple notes.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Matching what you smell to what the drink can hold.",
      },
    ],
  },
  {
    slug: "gin-four-classics",
    title: "Four classics, four lessons",
    eyebrow: "Spirits",
    summary:
      "Each classic trains a different gin judgment — tonic reveal, vermouth structure, bitter equal parts, and volume.",
    readingMinutes: 7,
    topics: ["gin", "gin-and-tonic", "martini", "negroni", "last-word"],
    coverImage: "/learn/gin-four-classics.webp",
    coverAlt: "A Last Word in a stemmed cocktail glass — pale green, condensation on the bowl",
    accentClass: ginAccent,
    practice: [
      {
        slug: "gin-and-tonic",
        notice:
          "Beefeater or Tanqueray, packed ice, fridge-cold dry tonic. Hendrick’s is an honest floral G&T — match a leaner tonic. Warm sparse ice is not a bad gin.",
      },
      {
        slug: "martini",
        notice:
          "Beefeater or Tanqueray. If it tastes like cold cologne, you probably poured a soft contemporary — not a stir problem.",
      },
      {
        slug: "negroni",
        notice:
          "Beefeater or Tanqueray. Hendrick’s often vanishes under Campari. The gin must still read.",
      },
      {
        slug: "last-word",
        notice:
          "Same London dry, or Plymouth Navy Strength / Tanqueray export strength for density. A shy floral 40% bottle will taste like Chartreuse and lime.",
      },
    ],
    bigIdea: "Each classic trains a different gin judgment.",
    keyTakeaways: [],
    sections: [
      {
        heading: "G&T — tonic and ice reveal",
        figure: "gin-drinks",
        body: [
          "Default: Beefeater or Tanqueray. Packed ice, fridge-cold dry tonic last, a brief stir. Tonic is a bitter lengthener. It shows the botanical bill; it does not hide a soapy one.",
          "Hendrick’s is an honest G&T pour if you want cucumber and floral — match it with a leaner tonic. Quinine bitterness and sweetness vary by tonic brand; taste the soda alone once so you know what you are lengthening with. Warm tonic and three cubes go flat in two minutes — that is service, not a bad gin.",
        ],
      },
      {
        heading: "Martini — juniper and structure",
        body: [
          "Default: Beefeater or Tanqueray. Mostly gin, a measured vermouth, stirred cold. You are tasting the bottle. Juniper and a dry spine keep the drink from turning into perfume water.",
          "Hendrick’s, or another soft floral contemporary, can taste like cold cologne once the vermouth is gone. Fridge the wine. If tonight’s Martini is dusty, open a fresher vermouth before you change the gin.",
        ],
      },
      {
        heading: "Negroni — gin must still read",
        body: [
          "Default: Beefeater or Tanqueray. Equal parts gin, Campari, sweet vermouth. Campari is loud. Choose a gin that still tastes like gin after the bitter and the wine.",
          "Hendrick’s — or another contemporary you only love with tonic — is the usual reason a home Negroni tastes like Campari and regret. That is a job mismatch, not a bad bottle.",
        ],
      },
      {
        heading: "Last Word — a loud template",
        body: [
          "Default: the same London dry, or step up density with Plymouth Navy Strength or Tanqueray export strength (~47%). Equal parts gin, green Chartreuse, maraschino, lime. Shaken. The template already has volume.",
          "A shy, floral 40% gin will taste like herbs and lime with no spine. This is the lesson where a louder bottle is not a mistake — volume after three quieter judgments (highball reveal, vermouth structure, bitter equal parts).",
        ],
      },
      {
        heading: "When the recipe only says gin",
        kind: "tip",
        body: [
          "Pour Beefeater, Tanqueray, or another juniper-led London dry unless the notes say otherwise. Highball: almost any good gin if the tonic is cold and the ice is packed. Martini and Negroni: structure first. Last Word: volume is allowed.",
          "Bols Genever and Hayman’s Old Tom keep their own named drinks. If the spec only says gin, stay on London dry unless you chose the Hendrick’s G&T fork.",
        ],
      },
      {
        heading: "Common mistakes",
        kind: "mistakes",
        body: [
          "Every gin drink asked the same bottle to do every job → pick a default per classic: Beefeater / Tanqueray for Martini and Negroni; Hendrick’s is an honest G&T fork; navy or export strength only when the Last Word wants density.",
          "G&T dies in two minutes on a solid London dry → pack the ice and fridge the tonic before you change Beefeater or Tanqueray.",
          "Negroni tastes only of Campari → switch to a juniper-led London dry (Beefeater / Tanqueray or similar); Hendrick’s and other soft contemporaries often disappear in equal parts.",
        ],
      },
    ],
    sources: [
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Martini, Negroni, Last Word, and G&T as four different gin jobs.",
      },
      {
        label: "Dave Broom, Gin: The Manual",
        note: "Matching botanicals to tonic, vermouth, and citrus.",
      },
      {
        label: "Difford's Guide — gin classics",
        note: "Named drinks vs the word “gin” on a spec.",
        href: "https://www.diffordsguide.com/",
      },
    ],
  },
];
