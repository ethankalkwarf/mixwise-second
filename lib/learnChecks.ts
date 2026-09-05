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
  "whiskey-family-buying": [
    {
      id: "wfb-1",
      prompt: "A recipe says only “whiskey.” What’s the usual home-bar default in the American cocktail tradition?",
      options: [
        "Blended Scotch",
        "Bourbon or rye",
        "Japanese whisky exclusively",
        "Whatever is darkest on the shelf",
      ],
      correctIndex: 1,
      explanation:
        "Unspecified whiskey in American classics usually means bourbon or rye. Scotch and Irish keep their own named drinks.",
    },
    {
      id: "wfb-2",
      prompt: "You’re stocking a first whiskey shelf for MixWise classics. Best move?",
      options: [
        "Five allocated bottles before any mixing bourbon",
        "One solid bourbon you like neat; add rye when Manhattans become a habit",
        "Only peated Scotch — it covers sours and stirred drinks",
        "Only 40% Canadian “rye”",
      ],
      correctIndex: 1,
      explanation:
        "One bourbon covers Old Fashioneds and sours. Rye waits until vermouth drinks are a habit. Scotch and Irish can wait until a recipe names them.",
    },
    {
      id: "wfb-3",
      prompt: "You pour a peated Scotch into a standard whiskey sour. What happened?",
      options: [
        "A clever silent upgrade",
        "Smoke fighting lemon — unless you meant a Penicillin-style drink",
        "The lemon will hide the peat",
        "Peat is just proof, so the sour gets stronger",
      ],
      correctIndex: 1,
      explanation:
        "Peat is aroma, not a bourbon substitute. A standard sour wants lemon in front.",
    },
    {
      id: "wfb-4",
      prompt: "A Canadian bottle says “rye whisky.” You want US straight rye for a Manhattan. What should you assume?",
      options: [
        "It matches US straight rye mash rules automatically",
        "It may be a milder blended whisky — read the back label and taste before trusting it in a rye spec",
        "Canadian rye is always peatier than bourbon",
        "Rye on any label means ≥51% rye grain worldwide",
      ],
      correctIndex: 1,
      explanation:
        "Canadian “rye” is often a historical nickname, not US straight rye. Category and origin lines matter.",
    },
  ],
  "whiskey-how-its-made": [
    {
      id: "whm-1",
      prompt: "Why do bourbon and US rye so often taste of vanilla before you add anything?",
      options: [
        "They are legally required to add vanilla extract",
        "New charred oak pulls vanillin and toast into the spirit",
        "Corn always tastes like vanilla, even unaged",
        "Chill filtration adds vanilla",
      ],
      correctIndex: 1,
      explanation:
        "New charred oak is load-bearing for American whiskey. Used casks — typical for Scotch and much Irish — read softer.",
    },
    {
      id: "whm-2",
      prompt: "A bourbon Old Fashioned and a Scotch Rob Roy share a template. Why don’t they taste like the same drink?",
      options: [
        "They do — templates erase production",
        "Same bones, different grain and cask — new charred oak vs used barrels",
        "Rob Roy is shaken, so the whiskey disappears",
        "Scotch cannot legally go in a vermouth drink",
      ],
      correctIndex: 1,
      explanation:
        "The template is shared. The wood and grain are not. Taste what the cask did.",
    },
    {
      id: "whm-3",
      prompt: "A 40% peated malt shouts louder than a 50% bourbon. What’s the production story?",
      options: [
        "Peat is proof — the malt is secretly stronger",
        "Peat is aroma from malt dried over a peat fire, not a proof number",
        "All Scotch is higher proof than bourbon",
        "Chill filtration adds smoke",
      ],
      correctIndex: 1,
      explanation:
        "Smoke is in the malt before the still runs. Dose peat like seasoning.",
    },
    {
      id: "whm-4",
      prompt: "Which set of choices explains a bottle more honestly than the font on the label?",
      options: [
        "The price and the neck tag",
        "Mash, still, cask, age, and how it’s bottled",
        "Whether the glass is green or clear",
        "The number of awards on the front",
      ],
      correctIndex: 1,
      explanation:
        "Grain, still, and cask show up in the glass more honestly than the typeface.",
    },
  ],
  "whiskey-history-in-glass": [
    {
      id: "whi-1",
      prompt: "You’re stirring a Manhattan from an 1880s-style spec. Which bottle matches the era?",
      options: [
        "A heavily peated Islay malt",
        "US rye — nineteenth-century American bars poured mostly rye",
        "A light Irish blend at 40%",
        "Whatever is cheapest — history doesn’t change the pour",
      ],
      correctIndex: 1,
      explanation:
        "The useful leftover from the Manhattan’s New York chapter is rye against vermouth. Hotel banquet stories can wait.",
    },
    {
      id: "whi-2",
      prompt: "Why did rye nearly disappear from American bars after Prohibition?",
      options: [
        "Rye was banned while bourbon was allowed",
        "Bourbon’s corn economics and distribution made it the default supermarket whiskey",
        "Rye cannot be aged in new oak",
        "Manhattans went out of fashion forever",
      ],
      correctIndex: 1,
      explanation:
        "Corn-driven bourbon filled the shelf. Rye stayed scarce until the cocktail revival needed its dryness again.",
    },
    {
      id: "whi-3",
      prompt: "What’s the careful Sazerac story?",
      options: [
        "It was always rye, named for a rye brand",
        "Cognac first — the name is a cognac house — then rye as the later default",
        "Peychaud invented whiskey in New Orleans",
        "It is just a Manhattan with absinthe",
      ],
      correctIndex: 1,
      explanation:
        "Treat the cognac-to-rye shift as a succession, not a founding myth. Rye is the modern default.",
    },
    {
      id: "whi-4",
      prompt: "When does whiskey history earn a place in Learn?",
      options: [
        "Whenever there is a famous drinker to quote",
        "When the recipe’s era changes which bottle you pour",
        "Only if you can recite a full timeline",
        "Never — production is the only lesson",
      ],
      correctIndex: 1,
      explanation:
        "An 1880s Manhattan wants rye. A mid-century “whiskey” sour will forgive bourbon. A timeline for its own sake does not.",
    },
  ],
  "whiskey-learn-to-taste": [
    {
      id: "wlt-1",
      prompt: "What’s the tasting order this lesson wants?",
      options: [
        "Name the style from the label, then sip to confirm",
        "Smell first, taste, write two words, then name the style",
        "Mix it into an Old Fashioned first so you can taste faster",
        "Score it out of 100 before you smell it",
      ],
      correctIndex: 1,
      explanation:
        "Guessing early just trains you to confirm what the label already told you.",
    },
    {
      id: "wlt-2",
      prompt: "You wrote “pepper, dry” before you looked at the label. What did you likely find?",
      options: [
        "A round bourbon",
        "Rye",
        "An Irish blend",
        "Peated malt, always",
      ],
      correctIndex: 1,
      explanation:
        "Those two words are more useful than a spice-rack paragraph. Rye reads leaner in the same glass.",
    },
    {
      id: "wlt-3",
      prompt: "Mini-lab B: the same Manhattan spec, bourbon then rye. What are you training?",
      options: [
        "How to hide tired vermouth",
        "Hearing which whiskey keeps vermouth from turning the drink into dessert",
        "Whether darker whiskey is older",
        "How to skip the bitters",
      ],
      correctIndex: 1,
      explanation:
        "Same vermouth, two pours. Name which one kept the drink from dessert.",
    },
    {
      id: "wlt-4",
      prompt: "A whiskey sour already smells like a campfire before the lemon goes in. What’s the move?",
      options: [
        "Add more sugar until the smoke disappears",
        "This is not a standard sour — peat is perfume; save it for a float or a Penicillin-style drink",
        "Shake longer to hide the phenol",
        "It will taste like bourbon once it’s cold",
      ],
      correctIndex: 1,
      explanation:
        "Smell first. If smoke is already the story, you left the standard sour template.",
    },
  ],
  "whiskey-four-classics": [
    {
      id: "wfc-1",
      prompt: "Your Old Fashioned tastes like fruit salad. What’s the first move?",
      options: [
        "Buy a more expensive bourbon",
        "Return to spirit, sugar, bitters, ice — fruit muddled in the glass is not the structure",
        "Switch to peated Scotch",
        "Shake it",
      ],
      correctIndex: 1,
      explanation:
        "Bourbon makes it round. Rye makes it snap. Muddled orange and cherry are a later habit.",
    },
    {
      id: "wfc-2",
      prompt: "Tonight’s Manhattan tastes dusty and nutty. The whiskey is fine. What’s the likely culprit?",
      options: [
        "You should have shaken it",
        "Tired sweet vermouth — fridge it, date it, open a fresher bottle",
        "The cherry garnish",
        "You used rye instead of bourbon",
      ],
      correctIndex: 1,
      explanation:
        "Half the drink is wine. Check the vermouth before you change the whiskey.",
    },
    {
      id: "wfc-3",
      prompt: "A recipe only says “whiskey.” How do you choose?",
      options: [
        "Whatever is darkest",
        "Bourbon or rye unless the notes say otherwise — Scotch and Irish keep their own named drinks",
        "Always peated malt",
        "Always the most expensive bottle",
      ],
      correctIndex: 1,
      explanation:
        "Old Fashioned and sour: bourbon is the usual home default. Manhattan and Boulevardier: rye if you have it.",
    },
    {
      id: "wfc-4",
      prompt: "Equal-parts whiskey, Campari, sweet vermouth. Bourbon vs rye — what changes?",
      options: [
        "Nothing — they’re interchangeable seasoning",
        "Bourbon softens the bitter; rye keeps it lean",
        "Rye makes it a Negroni",
        "Bourbon legally cannot go in a Boulevardier",
      ],
      correctIndex: 1,
      explanation:
        "Same template, two temperaments. Stir cold either way.",
    },
  ],
  "spirit-labels-intro": [
    {
      id: "sli-1",
      prompt: "Which label phrase is most likely a regulated category, not marketing?",
      options: [
        "Ultra-premium reserve",
        "Hand-selected small batch",
        "Bourbon",
        "Master distiller’s choice",
      ],
      correctIndex: 2,
      explanation:
        "Bourbon is a US legal standard with mash and barrel rules. The other phrases are usually decoration.",
    },
    {
      id: "sli-2",
      prompt: "A bottle says “Aged 12 Years” on a Scotch label. What does 12 guarantee?",
      options: [
        "Average age of all casks",
        "Age of the oldest whisky included",
        "Age of the youngest whisky in the bottle",
        "Time since the distillery opened",
      ],
      correctIndex: 2,
      explanation:
        "On Scotch, a printed age is a legal floor: every drop is at least that old. It is not an average, and older whisky in the blend does not raise the number.",
    },
  ],
  "spirit-labels-whiskey": [
    {
      id: "wll-1",
      prompt: "Which label phrase is a hard US legal standard, not just marketing?",
      options: [
        "Small batch",
        "Craft reserve",
        "Bottled-in-bond",
        "Master distiller’s selection",
      ],
      correctIndex: 2,
      explanation:
        "Bottled-in-bond means 100 proof, 4+ years, one distillery, one season. Small batch and craft are mostly sales language.",
    },
    {
      id: "wll-3",
      prompt: "True or false: bourbon must be made in Kentucky.",
      options: [
        "True — Kentucky is required by law",
        "False — it must be made in the United States; Kentucky is tradition, not a legal requirement",
        "True only for straight bourbon",
        "False — any country can label whiskey “bourbon”",
      ],
      correctIndex: 1,
      explanation:
        "Bourbon is a US product with mash and barrel rules. Kentucky is heritage marketing, not the legal geography.",
    },
    {
      id: "wll-4",
      prompt: "You want US straight rye for a Manhattan. A Canadian bottle says “rye whisky.” What should you assume?",
      options: [
        "It matches US straight rye mash rules automatically",
        "It may be a milder blended whisky — read the back label and taste before trusting it in a rye spec",
        "Canadian rye is always peatier than bourbon",
        "Rye on any label means ≥51% rye grain worldwide",
      ],
      correctIndex: 1,
      explanation:
        "Canadian “rye” is often a historical nickname, not US straight rye. Category and origin lines matter.",
    },
  ],
  "spirit-labels-agave": [
    {
      id: "sla-1",
      prompt: "Which tequila label line matters most for a bright Margarita?",
      options: [
        "Gold medal sticker on the front",
        "100% de agave",
        "Añejo",
        "Extra smooth",
      ],
      correctIndex: 1,
      explanation:
        "100% de agave keeps other sugars out of the sour. Añejo is an age tier — often too oaky for a bright lime drink.",
    },
    {
      id: "sla-2",
      prompt: "What does the NOM number on a tequila bottle identify?",
      options: [
        "The bartender who recommended it",
        "The permitted producer / distillery tied to that bottle",
        "Proof of organic certification",
        "How many years the agave grew",
      ],
      correctIndex: 1,
      explanation:
        "NOM (Norma Oficial Mexicana) IDs the CRT-authorized producer — traceability, not a quality score.",
    },
  ],
  "spirit-labels-scotch": [
    {
      id: "sls-1",
      prompt: "A Scotch bottle says “12 Years.” What does that number guarantee?",
      options: [
        "The average age of every whisky in the blend",
        "The age of the oldest cask used",
        "The age of the youngest whisky in the bottle",
        "How long the bottle has been on the shelf",
      ],
      correctIndex: 2,
      explanation:
        "The number is a legal floor: every drop is at least 12 years old. Older whisky may be included; younger may not.",
    },
    {
      id: "sls-2",
      prompt: "You’re building a Penicillin. Which label strategy matches the classic?",
      options: [
        "One expensive peated single malt for everything",
        "Blended Scotch in the shaker, peated malt as aroma on top",
        "Single grain Scotch only",
        "No label reading — proof is all that matters",
      ],
      correctIndex: 1,
      explanation:
        "The Penicillin splits roles: mild blend for the sour body, smoky malt for perfume — two label categories.",
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
    {
      id: "zpm-2",
      prompt: "A guest’s “mocktail” tastes like sweet limeade. What’s the most useful missing job?",
      options: [
        "More non-alcoholic “gin” branding",
        "Bitter, spice, tannin, or salt — structure ethanol usually helped provide",
        "A taller glass only",
        "Less ice so it tastes stronger",
      ],
      correctIndex: 1,
      explanation:
        "Without ethanol’s grip and aroma carry, you must rebuild bitter/spice/texture on purpose. More juice rarely fixes flatness.",
    },
  ],
  "spirit-primer-gin": [
    {
      id: "gin-1",
      prompt: "You’re making Negronis for a table. Which gin choice is the safest default?",
      options: [
        "A soft floral contemporary gin you only drink with tonic",
        "A juniper-forward London dry that still tastes like gin next to Campari",
        "Navy-strength gin poured at the same ounces as a 40% bottle with no adjustment",
        "Any clear spirit — Negronis hide botanicals",
      ],
      correctIndex: 1,
      explanation:
        "Campari is loud. A classic London dry keeps juniper audible in equal parts. Soft floral gins often disappear.",
    },
    {
      id: "gin-2",
      prompt: "A Martini tastes like cold perfume water after two sips of vermouth fade. What’s the likely bottle issue?",
      options: [
        "The gin is too juniper-heavy",
        "The gin is soft/floral and can’t carry a nearly-all-gin drink",
        "You should have shaken it",
        "Tonic water was required",
      ],
      correctIndex: 1,
      explanation:
        "Martinis are mostly gin. If the bottle only shines in a G&T, it may lack structure for stirred, spirit-forward drinks.",
    },
    {
      id: "gin-3",
      prompt: "True or false: “London dry” means the gin must be distilled in London.",
      options: [
        "True — geography is required",
        "False — it’s a production style (dry, botanical-distilled, minimal post-sweetening), not a city requirement",
        "True only for export bottles",
        "False — London dry means barrel-aged gin",
      ],
      correctIndex: 1,
      explanation:
        "London dry is about how it’s made, not a protected London address. Many excellent London dry gins are made elsewhere.",
    },
  ],
  "rum-family-buying": [
    {
      id: "rfb-1",
      prompt: "A rum pours almost black. What does the color guarantee?",
      options: [
        "At least 8 years in oak",
        "Nothing by itself — color can be oak, caramel, or both",
        "It is automatically better in Daiquiris",
        "It is agricole by law",
      ],
      correctIndex: 1,
      explanation:
        "White, gold, and dark are not reliable age grades. Color can come from oak, caramel, or both.",
    },
    {
      id: "rfb-2",
      prompt: "A mixing white looks crystal clear. What does that usually mean?",
      options: [
        "It was never in a barrel",
        "Clear means filtered, not young — many big mixing whites, Bacardi Superior included, spend time in oak then get filtered",
        "It is agricole blanc by definition",
        "It is automatically too old for a Daiquiri",
      ],
      correctIndex: 1,
      explanation:
        "A lot of the big mixing whites — Bacardi Superior included — spend time in oak, then get filtered until they look clear.",
    },
    {
      id: "rfb-3",
      prompt: "You’re stocking a first rum shelf for MixWise classics. Best pair?",
      options: [
        "Five tiki bottles before any white rum",
        "One clean white mixing rum and one solid aged rum",
        "Only spiced rum",
        "Only overproof",
      ],
      correctIndex: 1,
      explanation:
        "Clean white covers Daiquiri and Mojito; aged covers Dark ’n’ Stormy and Mai Tai. Funk and agricole can wait.",
    },
    {
      id: "rfb-4",
      prompt: "A recipe calls for aged rum. You only have a spiced rum. What’s the honest read?",
      options: [
        "Spiced rum is just aged rum with a better label",
        "Spiced rum is a flavored product, not a synonym for aged rum",
        "Spice automatically means navy strength",
        "Use twice as much — the vanilla will act like oak",
      ],
      correctIndex: 1,
      explanation:
        "Spiced rum is flavored. It will not silently do the job of an aged mixing rum.",
    },
  ],
  "rum-how-its-made": [
    {
      id: "rhm-1",
      prompt: "A Daiquiri smells like banana and solvent. What’s the production story?",
      options: [
        "The lime was Meyer instead of Persian",
        "A high-ester ferment and pot-still rum is dominating a template that wants clean lime",
        "You needed more sugar to hide the rum",
        "All molasses rum tastes like that",
      ],
      correctIndex: 1,
      explanation:
        "Push esters hard and you get banana, pineapple, or a sharp solvent note. That smell was meant to carry across a punch bowl. In a Daiquiri, it usually buries the lime.",
    },
    {
      id: "rhm-2",
      prompt: "Molasses rum vs rhum agricole — what actually changes in the glass?",
      options: [
        "Nothing — both are just rum",
        "Agricole starts as cane juice and often reads grassy and bright; molasses rum is a different raw material",
        "Agricole is legally darker",
        "Molasses rum cannot be aged",
      ],
      correctIndex: 1,
      explanation:
        "The base you ferment shows up later. Agricole blanc is usually unaged cane; a Spanish-style white is often a different drink.",
    },
    {
      id: "rhm-3",
      prompt: "Why can a few years in the tropics taste like more oak than the same years in a cooler warehouse?",
      options: [
        "Tropical labels lie about age",
        "Heat and humidity pull more from oak, faster, and lose more to the angels",
        "Caribbean barrels are always new charred oak, like bourbon",
        "Cooler warehouses add caramel by law",
      ],
      correctIndex: 1,
      explanation:
        "Climate is a production lever. The number of years is not a flavor score.",
    },
    {
      id: "rhm-4",
      prompt: "Which set of choices explains a bottle more honestly than “gold” on the label?",
      options: [
        "The price and the neck tag",
        "Base, ferment, still, oak, and what’s added at bottling",
        "Whether the glass is green or clear",
        "The number of awards on the front",
      ],
      correctIndex: 1,
      explanation:
        "Production choices show up in the glass more honestly than the color on the label.",
    },
  ],
  "rum-history-in-glass": [
    {
      id: "rhi-1",
      prompt: "Why does a classic Daiquiri still want a clean mixing white?",
      options: [
        "Hemingway invented it that way",
        "The useful chapters are a camp sour, then a Havana bar that taught a clean shaken rum drink — lime first",
        "Floridita used only agricole",
        "White rum was cheaper during Prohibition",
      ],
      correctIndex: 1,
      explanation:
        "Cox’s sour and Floridita’s refinement both keep lime in front. History here changes the pour, not the statue.",
    },
    {
      id: "rhi-2",
      prompt: "What should you take from navy rum history when you build a ginger highball?",
      options: [
        "Any dark bottle is navy rum",
        "Proof and weight that hold ginger and sugar — near 57% ABV still matters; the gunpowder story is folklore",
        "You must use British-issued rum",
        "Navy rum cannot be mixed with ginger beer",
      ],
      correctIndex: 1,
      explanation:
        "The useful leftover is strength. Pour the proof; skip the campfire.",
    },
    {
      id: "rhi-3",
      prompt: "Why do Mai Tais and Jamaican punches so often use more than one rum?",
      options: [
        "Tiki bars were required to use five bottles",
        "One rum rarely does every job — punch and tiki blends pair a frame with a funky fraction",
        "Blending hides bad rum",
        "Orgeat only works with agricole",
      ],
      correctIndex: 1,
      explanation:
        "Jamaican pot-still rum was built to carry across a punch bowl. Tiki treated rum like a kitchen.",
    },
    {
      id: "rhi-4",
      prompt: "When does rum history earn a place in Learn?",
      options: [
        "Whenever there is a famous drinker to quote",
        "Only when it changes what you pour",
        "Only if you can recite a full timeline",
        "Never — production is the only lesson",
      ],
      correctIndex: 1,
      explanation:
        "A few true stories explain clean white, navy weight, or a funky blend. A timeline for its own sake does not.",
    },
  ],
  "rum-learn-to-taste": [
    {
      id: "rlt-1",
      prompt: "What’s the tasting order this lesson wants?",
      options: [
        "Name the style from the label, then sip to confirm",
        "Nose, sip, write two words, then name the style",
        "Mix it into a Daiquiri first so you can taste faster",
        "Score it out of 100 before you smell it",
      ],
      correctIndex: 1,
      explanation:
        "Smell it first. Then taste. Write two words — then name the style. Guessing early just trains you to confirm what you already believed.",
    },
    {
      id: "rlt-2",
      prompt: "You wrote “banana, solvent” before you looked at the label. What did you likely find?",
      options: [
        "A clean mixing white",
        "A high-ester funky rum",
        "Agricole blanc",
        "Spiced rum, always",
      ],
      correctIndex: 1,
      explanation:
        "Those two words are more useful than purple notes. Funky Jamaican-style rum smells like the punch bowl.",
    },
    {
      id: "rlt-3",
      prompt: "Mini-lab C: a Mai Tai with only aged rum vs the same drink plus a barspoon of funk. What are you training?",
      options: [
        "How to hide orgeat",
        "Hearing the funky fraction as seasoning, not the whole pour",
        "Whether gold rum is older",
        "How to skip the lime",
      ],
      correctIndex: 1,
      explanation:
        "The second drink is the lesson: frame first, funk on purpose.",
    },
    {
      id: "rlt-4",
      prompt: "A rum smells grassy and like fresh cane. Which personality did you find?",
      options: [
        "Spiced rum",
        "Agricole",
        "Navy-strength molasses rum, always",
        "Caramel-colored mixing white",
      ],
      correctIndex: 1,
      explanation:
        "Agricole often reads grassy, olive, and bright. If it smells like a field, believe it.",
    },
  ],
  "rum-four-classics": [
    {
      id: "rfc-1",
      prompt: "Your Daiquiri tastes like banana candy. What’s the first move?",
      options: [
        "Add more sugar",
        "Change the rum — the 2:1:1 is a diagnostic, not the problem",
        "Switch lime for lemon",
        "Shake for a full minute",
      ],
      correctIndex: 1,
      explanation:
        "If the rum fights the lime, change the rum — not the template.",
    },
    {
      id: "rfc-2",
      prompt: "A Mojito tastes grassy-bitter and muddy. What’s the likely pair of mistakes?",
      options: [
        "Too much soda and too much ice",
        "Shredded mint and a rum that’s too funky for a lengthened sour",
        "Using white rum instead of spiced",
        "Serving it up in a coupe",
      ],
      correctIndex: 1,
      explanation:
        "Press mint; don’t shred it. A clean rum keeps soda bright.",
    },
    {
      id: "rfc-3",
      prompt: "You don’t have Gosling’s for a Dark ’n’ Stormy. What’s the honest home move?",
      options: [
        "Skip the drink — the name is the recipe",
        "Pour an aged or navy-weight rum, call it a ginger highball, and keep the lesson: ginger needs weight",
        "Use spiced rum and extra lime",
        "Use a clean white — color doesn’t matter here either",
      ],
      correctIndex: 1,
      explanation:
        "Gosling’s is the trademarked name. The template still teaches the pour.",
    },
    {
      id: "rfc-4",
      prompt: "A recipe only says “rum.” How do you choose?",
      options: [
        "Whatever is darkest",
        "Pick the job the glass is doing — citrus-up wants clean white; ginger wants weight; tiki wants a blend",
        "Always agricole",
        "Always the tiki bottle",
      ],
      correctIndex: 1,
      explanation:
        "Each classic trains a different judgment. Match the bottle to the job, not the word “rum.”",
    },
  ],
  "batching-and-hosting": [
    {
      id: "batch-1",
      prompt: "You’re batching Negronis at 4pm for an 8pm dinner. What’s the smartest move?",
      options: [
        "Skip dilution — ice in the pitcher will handle it later",
        "Measure equal parts, add intentional cold-water dilution, chill hard, taste before guests arrive",
        "Add the vermouth tomorrow morning so it “stays fresh” on the counter",
        "Shake the whole pitcher with ice now and leave it out",
      ],
      correctIndex: 1,
      explanation:
        "Stirred batches need planned dilution and cold. Leaving dilution to a warm pitcher of ice is how you get hot, then watery drinks.",
    },
    {
      id: "batch-2",
      prompt: "Why is a pitcher of Margaritas juiced at noon risky for an evening party?",
      options: [
        "Tequila expires in four hours",
        "Citrus aroma and brightness fade; acid-heavy batches lose their peak",
        "Salt rims legally require fresh juice at service",
        "Batches cannot include orange liqueur",
      ],
      correctIndex: 1,
      explanation:
        "Spirit + syrup can wait. Citrus is the fragile part — juice close to service when you can.",
    },
    {
      id: "batch-3",
      prompt: "Egg-white Whiskey Sours for twelve guests. Best hosting strategy?",
      options: [
        "Dry-shake a gallon in advance and re-froth by stirring",
        "Batch the whiskey+syrup+lemon base; shake foam drinks in small waves (or offer foam as a special)",
        "Skip ice entirely so foam lasts",
        "Use the blender on the whole batch once",
      ],
      correctIndex: 1,
      explanation:
        "Foam doesn’t wait politely in a pitcher. Batch the base; execute foam in waves.",
    },
  ],
  "equal-parts-bitters": [
    {
      id: "eq-1",
      prompt: "A Negroni tastes candy-hot and thick, not refreshing. Most likely cause?",
      options: [
        "Too much orange peel",
        "Under-dilution — equal parts still need a proper stir on ice",
        "The gin was London dry",
        "You used a rocks glass",
      ],
      correctIndex: 1,
      explanation:
        "Equal parts is not “no water.” Stirring supplies the weak/dilution that makes bitterness drinkable.",
    },
    {
      id: "eq-2",
      prompt: "You swap Aperol for Campari in a Negroni and keep every other ounce identical. What happened?",
      options: [
        "Nothing — they are interchangeable bitters",
        "You made a sweeter, less bitter drink that deserves an honest name",
        "It becomes a Boulevardier",
        "It becomes an Americano automatically",
      ],
      correctIndex: 1,
      explanation:
        "Aperol is lighter and sweeter. Same template bones, different bitter intensity — don’t call it a Negroni by default.",
    },
    {
      id: "eq-3",
      prompt: "Dusty, nutty Negroni with good gin and Campari. First suspect?",
      options: [
        "The orange peel",
        "Oxidized sweet vermouth stored warm",
        "Stirring too long",
        "Using a large ice cube",
      ],
      correctIndex: 1,
      explanation:
        "Vermouth is wine. Warm, old rosso is the classic “this cocktail is bad” false alarm.",
    },
  ],
  "citrus-and-syrups": [
    {
      id: "cit-1",
      prompt: "A Daiquiri smells flat even though the ratios look right. Best first check?",
      options: [
        "Buy more expensive rum immediately",
        "Juice age / bottled lime — aroma dies before sweetness looks wrong",
        "Add egg white",
        "Switch to demerara syrup only",
      ],
      correctIndex: 1,
      explanation:
        "Bottled or tired citrus supplies acid without perfume. Fresh juice is the aromatic half of the sour.",
    },
    {
      id: "cit-2",
      prompt: "You replace 1:1 simple with rich 2:1 at the same barspoon count. What changes?",
      options: [
        "Nothing",
        "The drink gets sweeter (and slightly less watery from the syrup itself)",
        "The drink gets more sour",
        "ABV doubles",
      ],
      correctIndex: 1,
      explanation:
        "Rich syrup packs more sugar per volume. Same “spoon count” is not the same sweetness.",
    },
    {
      id: "cit-3",
      prompt: "A recipe says lemon; you only have lime. What’s the honest framing?",
      options: [
        "Identical acids — silent swap",
        "Aromatic variation — different drink family cues; taste and rename if needed",
        "Always better",
        "Illegal in cocktails",
      ],
      correctIndex: 1,
      explanation:
        "Lemon and lime are different aromas and balances. Swapping can be delicious — it isn’t invisible.",
    },
  ],
  "glassware-and-service": [
    {
      id: "gl-1",
      prompt: "You shook a perfect Daiquiri into a room-temp coupe. What did you just undo?",
      options: [
        "Nothing — glass temperature is irrelevant",
        "Hard-won chill — warm glassware raises drink temperature on contact",
        "The garnish only",
        "The lime’s acidity",
      ],
      correctIndex: 1,
      explanation:
        "Chilling the glass is part of service for drinks served up. Warm crystal erases shake work.",
    },
    {
      id: "gl-2",
      prompt: "Why pack a highball with ice instead of “a few cubes for elegance”?",
      options: [
        "It looks busier on camera",
        "Sparse ice melts faster and warms the lengthener — the drink dies in minutes",
        "Laws require it",
        "It reduces ABV to zero",
      ],
      correctIndex: 1,
      explanation:
        "Packed ice keeps long drinks cold. Sparse ice is a dilution and temperature failure mode.",
    },
    {
      id: "gl-3",
      prompt: "Best glass for an Old Fashioned you want to sip slowly?",
      options: [
        "Warm coupe filled to the brim",
        "Rocks glass with a large cube sized to the glass",
        "Flute",
        "Highball with crushed ice only",
      ],
      correctIndex: 1,
      explanation:
        "Rocks + large ice manages melt for spirit-forward drinks. Crushed ice is a different template.",
    },
  ],
  "swap-with-intent": [
    {
      id: "sw-1",
      prompt: "You want to “improve” a Margarita by switching to mezcal, honey syrup, and lemon at once. What should you do instead?",
      options: [
        "Do all three — more changes mean better drinks",
        "Change one variable, taste, then decide the next move",
        "Abandon templates entirely",
        "Only change the glassware",
      ],
      correctIndex: 1,
      explanation:
        "Multiple silent swaps hide causality. One knob at a time is how you learn.",
    },
    {
      id: "sw-2",
      prompt: "Whiskey in a Negroni spec. Honest name?",
      options: [
        "Still a Negroni",
        "Boulevardier (same equal-parts idea, different spirit)",
        "Americano",
        "Old Fashioned",
      ],
      correctIndex: 1,
      explanation:
        "Boulevardier is the whiskey cousin. Honest naming sets expectations.",
    },
    {
      id: "sw-3",
      prompt: "A peated Scotch “Old Fashioned” tastes like a campfire. Smartest fix path?",
      options: [
        "Add more sugar until smoke disappears",
        "Treat peat as intensity — reduce the peated portion or use it as a rinse/float, don’t assume 1:1 bourbon swap",
        "Shake it with lemon",
        "Serve warmer",
      ],
      correctIndex: 1,
      explanation:
        "High-intensity bottles aren’t silent substitutions. Dose peat like seasoning.",
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
    {
      id: "m-shake-3",
      prompt: "You packed the tin with only four soft freezer cubes. What’s the likely result?",
      options: [
        "Colder drink, less water — sparse ice is more efficient",
        "Warm, watery drink — sparse soft ice melts before it chills",
        "No effect if you shake longer",
        "Better foam automatically",
      ],
      correctIndex: 1,
      explanation:
        "Pack the tin. Sparse soft ice dumps water and never gets the drink properly cold.",
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
    {
      id: "m-stir-3",
      prompt: "You stirred a Martini for a full minute on wet, cloudy freezer ice. It tastes thin. What went wrong?",
      options: [
        "You needed more vermouth",
        "Soft ice over-diluted before the drink was properly structured — use harder ice and taste sooner",
        "Martinis must be shaken",
        "The glass was too cold",
      ],
      correctIndex: 1,
      explanation:
        "Clock-worship on bad ice waters a stirred drink. Harder cubes and tasting beat a long automatic stir.",
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
    {
      id: "t-ds-2",
      prompt: "You dry-shook hard, then forgot the wet shake. What lands in the glass?",
      options: [
        "Perfect foam and perfect chill",
        "Foam structure without enough cold or dilution — often warm and thick-capped",
        "A clear stirred drink",
        "No foam at all",
      ],
      correctIndex: 1,
      explanation:
        "Dry shake is only half the job. Ice still has to chill and dilute before you strain.",
    },
    {
      id: "t-ds-3",
      prompt: "Why do many bartenders prefer dry-then-wet over reverse (wet then dry)?",
      options: [
        "It uses less egg",
        "Building foam first, then chilling, usually gives a more stable cap without over-diluting early",
        "It’s required by law",
        "Wet-first always ruins foam",
      ],
      correctIndex: 1,
      explanation:
        "Dry-first is the common home/bar habit because foam forms before melt water fights it. Reverse dry-shake is a valid alternate — not the beginner default.",
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
    {
      id: "t-fs-2",
      prompt: "You fine-strained a Daiquiri and it still watered out in two minutes. Likely cause?",
      options: [
        "Fine-straining always ruins drinks",
        "The coupe was warm, or tiny chips still got through — chill the glass and keep the mesh tight",
        "You needed more sugar",
        "White rum can’t be fine-strained",
      ],
      correctIndex: 1,
      explanation:
        "Fine-strain helps, but warm glassware and a loose pour still leave melt in the bowl.",
    },
    {
      id: "t-fs-3",
      prompt: "When is skipping the fine-strain usually fine?",
      options: [
        "Never — always double-strain",
        "Drinks served on fresh ice (highballs, rocks) where chips don’t keep watering an empty bowl",
        "Only Martinis",
        "Only when using crushed ice in a coupe",
      ],
      correctIndex: 1,
      explanation:
        "Up drinks care most. On-ice serves already manage dilution differently.",
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
  const resolved =
    slug === "whiskey-labels-and-law"
      ? "spirit-labels-whiskey"
      : slug === "spirit-primer-rum"
        ? "rum-family-buying"
        : slug === "spirit-primer-whiskey"
          ? "whiskey-family-buying"
          : slug;
  return GUIDE_CHECKS[resolved] ?? [];
}

export function getMethodChecks(slug: string): LearnCheck[] {
  return METHOD_CHECKS[slug] ?? [];
}

export function getTechniqueChecks(slug: string): LearnCheck[] {
  return TECHNIQUE_CHECKS[slug] ?? [];
}
