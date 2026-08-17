/**
 * MixWise Learn techniques — full layered lessons for the smaller moves.
 * Core mixing methods (shake, stir, build, blend) live in learnLibrary;
 * overlapping slugs (muddle, swizzle, layer, build) reuse method layers.
 */

import type { LearnLessonLayers, LearnPracticeDrink } from "@/lib/learnTypes";
import { getLearnMethod } from "@/lib/learnLibrary";
import { getMethodLessonLayers } from "@/lib/learnMethodsContent";

export type LearnTechniqueLesson = {
  slug: string;
  relatedSlugs: string[];
  practice: LearnPracticeDrink[];
  coverImage: string;
  coverAlt: string;
  /** When omitted, the matching method lesson is used. */
  layers?: LearnLessonLayers;
};

export const LEARN_TECHNIQUE_LESSONS: Record<string, LearnTechniqueLesson> = {
  "dry-shake": {
    slug: "dry-shake",
    relatedSlugs: ["fine-strain", "float"],
    coverImage: "/learn/technique-dry-shake.webp",
    coverAlt: "Dry shaking a cocktail tin without ice",
    practice: [
      {
        slug: "whiskey-sour",
        notice:
          "Dry-shake until you hear a creamy rattle, then wet-shake until the tin hurts. The foam should sit in a tight cap, not a soapy scum.",
      },
      {
        slug: "clover-club",
        notice:
          "Raspberry plus egg wants a hard dry shake. If the drink looks pink and thin, you rushed the foam stage.",
      },
      {
        slug: "pisco-sour",
        notice:
          "The foam should hold a few drops of bitters on top. If they sink, the dry shake was too short.",
      },
    ],
    layers: {
      bigIdea:
        "A dry shake builds foam without ice in the way — then a wet shake sets temperature and dilution so you don’t serve warm meringue.",
      keyTakeaways: [
        "Shake egg white or aquafaba without ice first until the tin sounds creamy, not sloshy.",
        "Always follow with a wet shake on ice — foam without chill is a warm dessert.",
        "Fine-strain into a chilled glass so chips don’t deflate the cap.",
        "A reverse dry shake (wet first, dry second) can make a tighter foam; either order works if both halves happen.",
        "Skip the dry shake when there’s no protein to foam — citrus-only sours don’t need it.",
      ],
      sections: [
        {
          heading: "When to dry-shake",
          kind: "rule",
          body: [
            "Dry-shake when the recipe includes egg white, aquafaba, or another foaming protein. Ice chills fast but also inhibits foam; giving the protein a hard shake alone lets it unfold and trap air.",
            "Citrus-only sours (a Daiquiri, a Tommy’s Margarita) do not need this move. Save it for drinks that should wear a foam cap.",
          ],
        },
        {
          heading: "How to do it",
          body: [
            "Combine ingredients with no ice. Seal and shake hard for 10–15 seconds — you want a muffled, creamy sound, not ice rattle.",
            "Open, pack with ice, and wet-shake until the tin is painfully cold. Fine-strain into a chilled coupe or Nick & Nora. Let the foam settle a few seconds before garnishing.",
          ],
        },
        {
          heading: "Common mistakes",
          kind: "mistakes",
          body: [
            "Skipping the wet shake leaves a warm, under-diluted drink under pretty foam. A timid dry shake never builds a cap. Overfilling the tin leaves no room for air, so the foam stays thin. Serving into a warm glass collapses what you just built.",
          ],
        },
      ],
      deepDive: [
        {
          heading: "Why ice gets in the way",
          body: [
            "Egg white foams when proteins unwind and wrap air. Cold and dilution from ice slow that work. A dry shake is just a head start — the wet shake still does the chilling that makes the drink drinkable.",
            "A reverse dry shake (ice first, then strain and shake without ice) can yield a tighter, glossier foam because you’re whipping already-cold liquid. Use it when presentation matters; don’t bother if you’re making two sours on a Tuesday.",
          ],
        },
        {
          heading: "Aquafaba and other stand-ins",
          kind: "tip",
          body: [
            "Aquafaba (chickpea water) dry-shakes the same way — about ¾ oz replaces one egg white. It can smell beany if you use too much; acid and a hard shake help. Pasteurized egg white from a carton works if you don’t want to crack eggs at home.",
          ],
        },
      ],
      sources: [
        {
          label: "Jeffrey Morgenthaler, The Bar Book",
          note: "Dry shake vs reverse dry shake, and practical egg-white service.",
        },
        {
          label: "Dave Arnold, Liquid Intelligence",
          note: "Protein foam, temperature, and why the wet shake still matters.",
        },
        {
          label: "Dale DeGroff, The Craft of the Cocktail",
          note: "Classic sour service and the role of egg white.",
        },
      ],
    },
  },
  "fine-strain": {
    slug: "fine-strain",
    relatedSlugs: ["dry-shake", "express"],
    coverImage: "/learn/technique-fine-strain.webp",
    coverAlt: "Double-straining a cocktail through fine mesh into a coupe",
    practice: [
      {
        slug: "daiquiri",
        notice:
          "Shake hard, then Hawthorne plus fine mesh into a chilled coupe. No chips, no pulp — the texture should be silky, not crunchy.",
      },
      {
        slug: "aviation",
        notice:
          "Crème de violette and citrus throw sediment. Fine-strain so the drink stays clear and the foam, if any, sits clean.",
      },
      {
        slug: "last-word",
        notice:
          "Served up and equal-parts — chips would shout. Fine-strain and skip a busy garnish.",
      },
    ],
    layers: {
      bigIdea:
        "Fine-straining is a second sieve — Hawthorne plus mesh — so drinks served up stay smooth instead of carrying ice chips and pulp.",
      keyTakeaways: [
        "Use it for drinks served without ice in the glass (up).",
        "Hawthorne (or julep) catches the big pieces; fine mesh catches the rest.",
        "Hold both strainers still and pour in one motion — jiggling sprays and aerates.",
        "Rocks drinks usually skip the mesh; a few chips in a packed glass don’t matter.",
        "A dirty mesh from last week’s pineapple will flavor this Daiquiri. Rinse it.",
      ],
      sections: [
        {
          heading: "When to fine-strain",
          kind: "rule",
          body: [
            "Fine-strain when the drink is served up — Daiquiris, Aviations, Last Words, egg sours in coupes. You’re protecting texture in a glass with nowhere for shards to hide.",
            "Drinks on a full rock or in a highball rarely need it. The ice in the glass is the texture.",
          ],
        },
        {
          heading: "How to do it",
          body: [
            "Seat a Hawthorne strainer on the tin. Hold a fine mesh strainer over the glass. Pour through both in one steady stream.",
            "If the mesh clogs with pulp or egg, tap it once and keep pouring — don’t scrape the solids through.",
          ],
        },
        {
          heading: "Common mistakes",
          kind: "mistakes",
          body: [
            "Skipping the mesh on an up drink leaves grit. Pouring from too high aerates a stirred Martini you just worked to keep dense. A wet, soapy mesh is a flavoring agent you didn’t ask for.",
          ],
        },
      ],
      deepDive: [
        {
          heading: "What you’re actually catching",
          body: [
            "Hard shakes shatter ice into chips that keep diluting in the glass. Citrus pith and fruit pulp turn silky sours cloudy and slightly bitter. Fine mesh is the cheap way to keep the work you did in the tin from undoing itself on the way out.",
          ],
        },
        {
          heading: "Stirred drinks and the mesh",
          kind: "tip",
          body: [
            "A well-stirred Martini through a julep strainer is usually enough. Mesh is extra insurance if your ice is wet and crumbly. Don’t double-strain so aggressively that you knock air into a drink you stirred for clarity.",
          ],
        },
      ],
      sources: [
        {
          label: "Jim Meehan, Meehan's Bartender Manual",
          note: "Straining standards for drinks served up.",
        },
        {
          label: "Jeffrey Morgenthaler, The Bar Book",
          note: "Hawthorne plus mesh as default for shaken sours.",
        },
        {
          label: "Dale DeGroff, The Craft of the Cocktail",
          note: "Service texture — why chips don’t belong in a coupe.",
        },
      ],
    },
  },
  express: {
    slug: "express",
    relatedSlugs: ["rinse", "fine-strain"],
    coverImage: "/learn/technique-express.webp",
    coverAlt: "Expressing citrus oils over a cocktail",
    practice: [
      {
        slug: "old-fashioned",
        notice:
          "Express orange (or lemon) over the surface, then wipe the rim. Smell the drink before you sip — the oil should hit first.",
      },
      {
        slug: "martini",
        notice:
          "A thin lemon peel, pith side down, pinched over the glass. If it smells like pith and juice, the peel was too thick.",
      },
      {
        slug: "sazerac",
        notice:
          "Lemon oil over an absinthe-rinsed glass. The aroma stack is rinse plus peel — neither should drown the rye.",
      },
      {
        slug: "negroni",
        notice:
          "Orange oil flatters sweet vermouth and gin. Express, then drop or discard — don’t add a thick wedge of pith.",
      },
    ],
    layers: {
      bigIdea:
        "Expressing a peel sprays aromatic oils onto the drink’s surface — perfume the guest meets before the first sip, not extra juice in the glass.",
      keyTakeaways: [
        "Pinch the peel skin-out over the drink so oils mist the surface.",
        "Minimize pith — bitter white pith muddies stirred drinks.",
        "A rim wipe puts oil where the lip meets the glass.",
        "Match the fruit to the drink: orange with whiskey and sweet vermouth, lemon with gin and dry profiles, grapefruit with agave and bitters.",
        "An unexpressed twist in the glass is a slow, milder aroma — not the same move.",
      ],
      sections: [
        {
          heading: "When to express",
          kind: "rule",
          body: [
            "Express when the recipe wants citrus aroma without more acid — Old Fashioneds, Martinis, Negronis, Sazeracs. Juice belongs in the shaker; oil belongs on top.",
          ],
        },
        {
          heading: "How to do it",
          body: [
            "Cut a thin, wide strip of peel. Hold it skin-down a few inches above the drink and pinch. You should see a fine mist on the surface (or smell it immediately).",
            "Optionally wipe the peel around the rim, then drop it in or discard. If the recipe says no garnish, the mist alone is enough.",
          ],
        },
        {
          heading: "Common mistakes",
          kind: "mistakes",
          body: [
            "Thick pithy peels dump bitterness. Expressing into the tin instead of the finished drink loses the aroma to the dump sink. A dried-out lemon from last week has no oil left — use fresh, firm fruit.",
          ],
        },
      ],
      deepDive: [
        {
          heading: "What the mist actually is",
          body: [
            "Citrus flavedo holds aromatic oils (limonene and related terpenes). They hit the nose before liquid hits the tongue, so the first impression is brighter than juice alone can achieve. That’s why a Martini with expressed lemon tastes more citrus-forward without measuring a drop of juice.",
          ],
        },
        {
          heading: "Choosing the signal",
          kind: "tip",
          body: [
            "Orange oil flatters whiskey and sweet vermouth. Lemon lifts gin and dry profiles. Grapefruit suits agave and bitter highballs. Match the peel to the drink’s dominant aromatic family so garnish reinforces the sip instead of arguing with it.",
          ],
        },
      ],
      sources: [
        {
          label: "Dale DeGroff, The Craft of the Cocktail",
          note: "Expressing citrus as aroma, not ornament.",
        },
        {
          label: "Dave Arnold, Liquid Intelligence",
          note: "Volatile aromatics and why surface oils change perception.",
        },
        {
          label: "Jim Meehan, Meehan's Bartender Manual",
          note: "Twists, rim wipes, and when to skip the peel.",
        },
      ],
    },
  },
  rinse: {
    slug: "rinse",
    relatedSlugs: ["express", "layer"],
    coverImage: "/learn/technique-rinse.webp",
    coverAlt: "Rinsing a glass with absinthe",
    practice: [
      {
        slug: "sazerac",
        notice:
          "Coat a chilled rocks glass with absinthe, dump the excess, then strain in the stirred rye. You want a perfume, not a pour.",
      },
      {
        slug: "remember-the-maine",
        notice:
          "The rinse should read as a first sniff of absinthe, then cherry-vermouth-rye. If it tastes like a Pernod cocktail, you didn’t dump enough.",
      },
    ],
    layers: {
      bigIdea:
        "A rinse coats the glass with a few drops of a loud spirit — aroma and a light accent — then the excess goes down the sink so it doesn’t become the drink.",
      keyTakeaways: [
        "Pour a splash, tilt to coat, discard the extra.",
        "Absinthe, peaty Scotch, and mezcal are the usual rinses — intense bottles used as perfume.",
        "Chill the glass first so the film clings instead of pooling.",
        "If you can taste a full measure of the rinse, you didn’t dump enough.",
        "A rinse is not a float; it lives on the glass, not as a layer on the liquid.",
      ],
      sections: [
        {
          heading: "When to rinse",
          kind: "rule",
          body: [
            "Rinse when a small amount of a forceful spirit should frame the drink — Sazeracs (absinthe), some smoky variations (mezcal or peat), the occasional bitter rinse. You’re seasoning the glass, not adding an ingredient to the mixing tin.",
          ],
        },
        {
          heading: "How to do it",
          body: [
            "Add a teaspoon or so of the rinse spirit to a chilled glass. Tilt and roll until the inside is coated. Dump the excess (or, if you prefer a slightly louder glass, leave a few drops).",
            "Strain the finished cocktail into that glass. Garnish as written — often an expressed peel on top of the rinse aroma.",
          ],
        },
        {
          heading: "Common mistakes",
          kind: "mistakes",
          body: [
            "Leaving a puddle of absinthe in the glass turns a Sazerac into an anise bomb. Rinsing a warm glass makes the film slide into a pool. Measuring the rinse into the mixing glass with the other ingredients is a different drink — not a rinse.",
          ],
        },
      ],
      deepDive: [
        {
          heading: "Aroma lives on the glass",
          body: [
            "The guest’s nose hits the glass before the liquid. A thin film of absinthe or smoke is enough because those aromatics are volatile and loud. That’s also why dumping matters: volume of rinse scales much faster than aroma does.",
          ],
        },
        {
          heading: "Atomizers and shortcuts",
          kind: "tip",
          body: [
            "A small atomizer of absinthe is the bar-pro version of a rinse — a mist, no dump. At home, the splash-and-roll is plenty. Don’t rinse with something you wouldn’t want to smell for the whole drink.",
          ],
        },
      ],
      sources: [
        {
          label: "Dale DeGroff, The Craft of the Cocktail",
          note: "Sazerac service and the absinthe rinse as perfume.",
        },
        {
          label: "Jim Meehan, Meehan's Bartender Manual",
          note: "Glass preparation and when a rinse belongs.",
        },
        {
          label: "David Wondrich, Imbibe!",
          note: "Historical Sazerac practice and why the rinse survived.",
        },
      ],
    },
  },
  float: {
    slug: "float",
    relatedSlugs: ["layer", "dry-shake"],
    coverImage: "/learn/technique-float.webp",
    coverAlt: "Floating wine over a sour with a barspoon",
    practice: [
      {
        slug: "new-york-sour",
        notice:
          "Shake the whiskey sour, strain, then float red wine over a spoon. First sips should alternate bright citrus and tannic fruit — not a purple mixed drink.",
      },
      {
        slug: "mai-tai",
        notice:
          "If your spec floats dark rum, pour it slowly over the back of a spoon onto packed ice so it sits as a lid, not a stain through the drink.",
      },
    ],
    layers: {
      bigIdea:
        "A float is a slow pour over a spoon so a lighter liquid sits on top — staged sipping and aroma, not a fully mixed drink.",
      keyTakeaways: [
        "Finish the base drink first; the float is last.",
        "Rest a barspoon on the surface and pour onto the back of the spoon.",
        "Patience beats volume — a fast pour punches through and mixes.",
        "Wine on a sour and dark rum on tiki ice are the home uses that matter.",
        "Serve promptly; floats blur as they sit.",
      ],
      sections: [
        {
          heading: "When to float",
          kind: "rule",
          body: [
            "Float when the recipe wants a distinct top layer — red wine on a New York Sour, a dark rum lid on some tiki builds, cream on a coffee drink. The point is the first nose and the changing sip, not stripes for Instagram alone.",
          ],
        },
        {
          heading: "How to do it",
          body: [
            "Strain or build the base so the surface is calm. Hold a barspoon just on the liquid (or ice), bowl up or back-of-spoon facing you, and pour slowly onto the spoon so the liquid spreads.",
            "Stop while the band is still distinct. A thicker float is easier to see and taste; a teaspoon of wine is not enough to read.",
          ],
        },
        {
          heading: "Common mistakes",
          kind: "mistakes",
          body: [
            "Pouring from height punches through the layer. Floating onto a still-foaming sour can mix the wine into pink scum — let the foam settle a beat. Using a wine that’s heavier (sweeter, denser) than the drink may sink instead of sit.",
          ],
        },
      ],
      deepDive: [
        {
          heading: "Flavor staging vs stripes",
          body: [
            "A wine float isn’t only pretty. Early sips of a New York Sour swing between citrus-whiskey and tannic fruit; as it sits, the layers marry. Build floats that make sense as a tasting sequence. If mixing them fully would taste worse, you chose the wrong float.",
          ],
        },
        {
          heading: "Density without a chart",
          kind: "tip",
          body: [
            "Higher-proof, drier liquids often ride higher than sugary bases; cream can float when poured gently onto a cold sour. When unsure, practice a teaspoon of wine on a leftover sour in a clear glass before committing a guest’s drink.",
          ],
        },
      ],
      sources: [
        {
          label: "Dale DeGroff, The Craft of the Cocktail",
          note: "New York Sour float and layered service.",
        },
        {
          label: "Jim Meehan, Meehan's Bartender Manual",
          note: "Spoon-float technique as a controlled pour.",
        },
        {
          label: "Difford's Guide — New York Sour",
          note: "Reference specs and wine-float notes.",
          href: "https://www.diffordsguide.com/",
        },
      ],
    },
  },
  muddle: {
    slug: "muddle",
    relatedSlugs: ["swizzle", "build"],
    coverImage: "/learn/technique-muddle.webp",
    coverAlt: "Muddling mint with a wooden muddler",
    practice: [
      {
        slug: "mojito",
        notice:
          "Press the mint a few times in syrup — don’t shred. If it smells like lawn clippings, you overdid it. Make a second one gentler and compare.",
      },
      {
        slug: "whiskey-smash",
        notice:
          "Lemon and mint both need pressure, but the mint still wants a press, not a puree. Taste the build before you shake.",
      },
      {
        slug: "caipirinha",
        notice:
          "Lime wedges need a thorough muddle with sugar to yield juice and oil. This is the opposite of mint — under-muddling leaves the drink thin.",
      },
      {
        slug: "gin-basil-smash",
        notice:
          "Basil bruises into perfume quickly. A few firm presses; if the drink is khaki-green and bitter, you pulverized the leaves.",
      },
    ],
  },
  swizzle: {
    slug: "swizzle",
    relatedSlugs: ["muddle", "build"],
    coverImage: "/learn/technique-swizzle.webp",
    coverAlt: "Swizzling crushed ice until the glass frosts",
    practice: [
      {
        slug: "queens-park-swizzle",
        notice:
          "Pack crushed ice, spin until the glass frosts, then top with more ice. Cubes will not do this job.",
      },
      {
        slug: "chartreuse-swizzle",
        notice:
          "Spin until the outside is opaque with frost. If the drink tastes hot, you didn’t swizzle long enough; if it’s watery, the ice was already wet.",
      },
    ],
  },
  layer: {
    slug: "layer",
    relatedSlugs: ["float", "rinse"],
    coverImage: "/learn/method-layer.webp",
    coverAlt: "Layered cocktail with density bands",
    practice: [
      {
        slug: "new-york-sour",
        notice:
          "Treat the wine as a density layer: slow spoon pour onto a settled sour. Bands should hold for the first minute.",
      },
      {
        slug: "black-and-tan",
        notice:
          "Heavier stout last, slowly over a spoon onto paler ale. A fast pour gives you brown beer, not a band.",
      },
    ],
  },
  build: {
    slug: "build",
    relatedSlugs: ["muddle", "swizzle"],
    coverImage: "/learn/method-build.webp",
    coverAlt: "Building a highball over ice",
    practice: [
      {
        slug: "gin-and-tonic",
        notice:
          "Ice first, gin, fridge-cold tonic last, brief stir. Time it: if the drink is dull in a minute, the ice or the tonic was warm.",
      },
      {
        slug: "paloma",
        notice:
          "Grapefruit and soda are the lengthener — keep them cold and don’t stir out the bubbles.",
      },
      {
        slug: "dark-n-stormy",
        notice:
          "Ginger beer last over packed ice. A long stir knocks the spice and the fizz out together.",
      },
      {
        slug: "americano",
        notice:
          "Campari and vermouth, then cold soda. If it tastes dusty, the vermouth is the problem, not the build.",
      },
    ],
  },
};

export function getTechniqueLesson(slug: string): LearnTechniqueLesson | undefined {
  return LEARN_TECHNIQUE_LESSONS[slug];
}

export function getTechniqueLessonLayers(slug: string): LearnLessonLayers | undefined {
  const lesson = LEARN_TECHNIQUE_LESSONS[slug];
  if (lesson?.layers) return lesson.layers;
  const method = getLearnMethod(slug);
  if (method) return getMethodLessonLayers(method);
  return undefined;
}
