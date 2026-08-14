import type { IngredientGuide } from "./types";

export const MODIFIER_GUIDES: IngredientGuide[] = [
  {
    slug: "sweet-vermouth",
    seoTitle: "Sweet Vermouth",
    seoDescription:
      "Sweet vermouth as fortified aromatized wine: production, oxidation, and MixWise cocktails that depend on it — Negroni, Manhattan, Boulevardier.",
    dek: "Fortified, aromatized wine, sweetened and typically red; the wine component of the Manhattan and one-third of the Negroni.",
    abv: "15–18%",
    origin: "Italy (Turin tradition)",
    tastingNotes:
      "Dried fruit, vanilla, cola spice, bitter herbs, and residual grape. Carpano Antica Formula leans vanilla and cocoa; Cocchi Vermouth di Torino is brighter and more wine-forward; Martini & Rossi Rosso is lighter and useful in highballs. Oxidation produces nutty, bruised-apple, and cardboard notes as aldehydes accumulate after the bottle is opened.",
    whatItIs:
      "Sweet vermouth — rosso, or Italian vermouth — is wine fortified with distilled spirit, aromatized with botanicals (wormwood historically among them, plus cinchona, citrus peel, spices, and bitter roots), then sweetened. Alcohol and sugar raise stability relative to table wine, but the product remains a wine: once opened, dissolved oxygen continues to work, so refrigeration slows but does not stop decline. Typical bottling strength is about 15–18% ABV.\n\nIt is a structural ingredient, not a mixer. In the Manhattan it supplies sweetness, wine acidity, and herbal depth against whiskey and bitters; in the Negroni it is one equal part with gin and Campari. An oxidized bottle will dominate either drink more than a change of whiskey will.",
    history:
      "The commercial style crystallized in Turin in the late 18th and 19th centuries, when fortified, wormwood-scented wines moved from medicinal bitters into aperitivo culture. Italian rosso became the default sweet vermouth of the American bar.\n\nThe Manhattan (whiskey, sweet vermouth, aromatic bitters), documented in the late 19th century, and the Negroni (gin, Campari, sweet vermouth), a 20th-century equal-parts descendant of the Americano, made the category architecturally necessary. The Americano itself is the same vermouth-and-Campari pairing lengthened with soda.",
    howToUse:
      "Refrigerate after opening. A 375 ml bottle is practical if turnover is slow; date the cork or cap. Use within roughly a month for stirred drinks where vermouth is a large fraction of the volume; oxidized vermouth is more tolerable in a highball with soda, where carbonation and dilution mask stale notes.\n\nStandard templates: Manhattan (about 2 oz whiskey, 1 oz sweet vermouth, bitters); Negroni (equal parts gin, Campari, vermouth). If the nose is of stale wine and nuts rather than spice and grape, replace the bottle.",
    funFact:
      "Vermouth stored at room temperature next to the spirits oxidizes on a wine timeline, not a liqueur timeline — which is why a home Manhattan can taste stale even when the whiskey is fine.",
    pairsWith: ["gin", "rye-whiskey", "bourbon", "campari", "angostura-bitters"],
    signatureSlugs: ["negroni", "manhattan", "boulevardier", "americano"],
  },
  {
    slug: "dry-vermouth",
    seoTitle: "Dry Vermouth",
    seoDescription:
      "Dry vermouth as pale fortified aromatized wine: martini ratios, refrigeration, and MixWise cocktails that use it.",
    dek: "Pale, drier aromatized wine in the French tradition; the wine component of the martini.",
    abv: "16–18%",
    origin: "Marseille / Chambéry tradition",
    tastingNotes:
      "White-wine fruit, citrus peel, alpine herbs, and a dry, faintly bitter finish. Dolin Dry is a widely used mixing standard: relatively light, floral, and low in residual sugar. Oxidized dry vermouth reads as stale white wine — flattened fruit, nuttiness, and a dull edge — rather than as extra dryness.",
    whatItIs:
      "Dry vermouth is fortified, aromatized wine in the French tradition: paler, less sweetened, and typically more herbaceous than Italian rosso. Production is the same family of operations — base wine, fortifying spirit, botanicals, a modest sugar addition — at roughly 16–18% ABV. It is still wine after opening; refrigeration and reasonably prompt use apply for the same chemical reasons they apply to white wine.\n\nA martini is gin (or vodka) plus dry vermouth. Ratio is a matter of taste and era, but omitting vermouth leaves cold gin. Dry vermouth also appears in drier Manhattan variants, the Bronx, and a large class of stirred gin drinks.",
    history:
      "French dry vermouth — associated with Marseille and especially Chambéry — developed in the 19th century alongside the drier, paler aperitif wines of that region. The martini, in its late-19th-century form, was a vermouth-forward gin drink; subsequent decades steadily reduced the vermouth fraction until, in some mid-century American practice, it became a rinse or a gesture.\n\nRestoring vermouth is not nostalgia. It returns the drink to a two-ingredient structure in which wine acidity, botanicals, and a little sugar mediate the spirit.",
    howToUse:
      "Refrigerate after opening and treat the useful life like that of an opened aromatic white wine — days to a couple of weeks for a drink in which vermouth is conspicuous. Start around 5:1 gin to vermouth for a contemporary dry martini, or nearer 2:1 to 3:1 if you want the wine to register; adjust from there.\n\nA 375 ml bottle is the practical format for infrequent martini service.",
    pairsWith: ["gin", "vodka", "orange-bitters", "lemon-juice"],
    signatureSlugs: ["martini"],
  },
  {
    slug: "vermouth",
    seoTitle: "Vermouth",
    seoDescription:
      "Vermouth in cocktails: fortified aromatized wine, rosso versus dry, storage as wine science, and MixWise drinks that depend on it.",
    dek: "Fortified, aromatized wine. Rosso (sweet) for Negronis and Manhattans; dry for martinis. The two styles are not interchangeable.",
    abv: "15–18%",
    tastingNotes:
      "Herbal, winey, and bittersweet in both styles, but residual sugar, color, and botanical balance differ enough that substituting dry for rosso in a Negroni, or rosso for dry in a 50/50 martini, produces a different drink — sometimes deliberately (a Perfect Manhattan uses both), more often by accident.",
    whatItIs:
      "Vermouth is wine fortified with spirit and aromatized with botanicals, historically including wormwood (Wermut in German, the likely source of the name). Sugar level, color, and botanical recipe define the two cocktail-relevant families: Italian rosso (sweet, typically red or amber) and French-style dry (pale, lightly sweetened). ABV is usually 15–18%.\n\nIf a recipe says only vermouth, stirred whiskey drinks almost always want sweet; martinis want dry. Perfect variants split the vermouth between the two.",
    history:
      "Commercial vermouth is an 18th- and 19th-century European product: Turin for the sweet red style, Chambéry and the south of France for dry. American cocktail books of the late 19th century absorbed both as architectural ingredients rather than as aperitifs to be sipped alone.\n\nThat is still their role. Vermouth is not a garnish and not a liqueur; it is the wine in the drink, and it behaves like wine once the bottle is open.",
    howToUse:
      "Keep both styles if you make Negronis and martinis. Buy 375 ml bottles, refrigerate after opening, and date the bottle. Use sweet vermouth in Manhattans, Negronis, and Americanos; dry vermouth in martinis and drier gin drinks.\n\nA Perfect Manhattan or Perfect Martini is the place to combine them on purpose.",
    pairsWith: ["gin", "campari", "rye-whiskey", "sweet-vermouth", "dry-vermouth"],
    signatureSlugs: ["negroni", "martini", "manhattan"],
  },
  {
    slug: "prosecco",
    seoTitle: "Prosecco",
    seoDescription:
      "Prosecco as tank-fermented Italian sparkling wine: why the Aperol Spritz uses it, and how to keep carbonation in a mixed drink.",
    dek: "Italian sparkling wine from Glera, typically tank-fermented; the standard sparkling in an Aperol Spritz, fruitier and less autolytic than Champagne.",
    abv: "11–12%",
    origin: "Veneto, Italy",
    tastingNotes:
      "Green apple, pear, white flowers, and softer acidity than traditional-method Champagne. Extra Dry on a Prosecco label is off-dry, not bone-dry; Brut is the drier mixing choice. Tank fermentation (Martinotti / Charmat) preserves primary fruit at the expense of the biscuit and yeast notes of bottle fermentation.",
    whatItIs:
      "Prosecco is sparkling wine produced in the Veneto and Friuli regions of Italy, principally from the Glera grape. Most commercial Prosecco is fermented for a second time in tank (the Martinotti method), which keeps production costs down and emphasizes fresh fruit rather than autolysis. Typical ABV is about 11–12%.\n\nThat profile is why it belongs in a spritz: the wine should taste of apple and pear against Aperol or other aperitivi, not of toast and chalk. Champagne in an Aperol Spritz is both an expensive mismatch and a slightly worse spritz, because the wine’s autolytic character fights the liqueur.",
    history:
      "Tank-method sparkling wine from the northeast of Italy became a global commodity in the late 20th and early 21st centuries. The modern Aperol Spritz specification — Prosecco, Aperol, soda — locked Prosecco in as the sparkling of that template.\n\nThe French 75 was historically built on Champagne or other dry bubbles; Prosecco can stand in at home when the drink is treated as a sour lengthened with sparkle rather than as a Champagne cocktail.",
    howToUse:
      "Open the bottle cold. Add Prosecco last, over ice in a spritz or into a coupe after the gin-lemon-sugar base of a French 75 has been shaken and strained. Do not shake the wine.\n\nA splash of soda in a spritz dilutes sweetness and restores carbonation; without it the drink collapses toward a bitter mimosa. Extra Dry Prosecco is sweeter than the name suggests — use Brut if the liqueur is already sweet.",
    pairsWith: ["aperol", "soda-water", "campari", "gin"],
    signatureSlugs: ["aperol-spritz", "french-75"],
  },
  {
    slug: "champagne",
    seoTitle: "Champagne",
    seoDescription:
      "Champagne in cocktails: traditional-method sparkling wine, the French 75, and when a dry sparkling of similar structure is enough.",
    dek: "Traditional-method sparkling wine from the Champagne region; high acid and autolytic character that a French 75 can use, though any dry sparkling of similar structure will do.",
    abv: "12%",
    origin: "Champagne, France",
    tastingNotes:
      "High acidity, fine persistent bubbles, and autolytic notes of bread, biscuit, or almond from aging on the lees. Brut is the mixing default. Doux or Demi-Sec will turn a French 75 into a dessert drink. Non-vintage Brut is the practical cocktail bottle; prestige cuvées are wasted once gin and lemon are involved.",
    whatItIs:
      "Champagne is sparkling wine from the delimited Champagne region of France, made by the traditional method: a second fermentation in bottle, followed by aging on the lees. The legal name is geographic. For cocktails, what matters is dry sparkling wine with enough acidity to stand up to gin, lemon, and sugar — a structural role Crémant, Cava, or an inexpensive Brut Champagne can all fill.\n\nA grower or vintage bottle is better drunk without gin in it. The French 75 is a sour lengthened with sparkle, not a Champagne service.",
    history:
      "The Champagne Cocktail — sugar, bitters, sparkling wine — is a 19th-century drink. The French 75 (gin, lemon, sugar, Champagne), named after a World War I field gun, is a 20th-century sour in the same family as the Tom Collins, with bubbles in place of still soda.\n\nNeither drink requires a particular house; they require cold, dry, sufficiently acidic sparkling wine.",
    howToUse:
      "Shake the gin, lemon, and sugar (or syrup) with ice; strain into a flute or coupe; top with well-chilled sparkling wine. Do not shake the wine: carbonation collapses and the drink gains a foam that is not part of the template.\n\nChill the bottle thoroughly. If the recipe specifies Champagne and you have Cava or Crémant Brut, use it; the template will hold.",
    pairsWith: ["gin", "lemon-juice", "simple-syrup", "cognac"],
    signatureSlugs: ["french-75"],
  },
  {
    slug: "sherry",
    seoTitle: "Sherry",
    seoDescription:
      "Sherry in cocktails: fino, amontillado, and oloroso as fortified wines from Jerez, and how MixWise drinks use them.",
    dek: "Fortified wine from Jerez. Fino is biologically aged, dry, and saline; oloroso is oxidatively aged and nutty. Cooking sherry is a different, salted product.",
    abv: "15–20%",
    origin: "Jerez, Spain",
    tastingNotes:
      "Fino and manzanilla: almond, dough, sea air, and a yeasty flor character, with very little residual sugar. Amontillado begins as flor-aged wine and then oxidizes, adding hazelnut and dried-apple notes. Oloroso is aged oxidatively from the start: walnuts, dried fruit, more body. Cream sherry is sweetened. Cooking sherry is salted and will wreck a cocktail.",
    whatItIs:
      "Sherry is fortified wine from the Jerez region of Andalusia, aged in a solera system. Two biological regimes matter for mixing. Under flor (a film of Saccharomyces yeast), fino and manzanilla stay pale, dry, and aldehydic; without flor, oloroso takes on oxidative nuttiness. Amontillado sits between them. Fortification typically lands between about 15% and 20% ABV depending on style.\n\nIn the cocktail glass, fino and amontillado function like a more characterful dry vermouth — saline, nutty, low in sugar. Oloroso and cream supply richness in stirred drinks and cobblers. Fino, once opened, is especially fragile: flor character fades and oxidation proceeds quickly even under refrigeration.",
    history:
      "The Sherry Cobbler — sherry, sugar, citrus, crushed ice — was one of the defining mixed drinks of 19th-century America. Sherry then receded from the American bar as vermouth and later vodka took its place.\n\nContemporary bars restored fino to highballs and amontillado to stirred drinks in part because well-made sherry remains one of the better values in fortified wine, and because its salinity and oxidation give gin and whiskey a register vermouth does not.",
    howToUse:
      "Buy fino or amontillado from a shop with turnover; the wine should not have sat warm on a shelf for months. Refrigerate fino and manzanilla after opening and use them within days to a couple of weeks. Amontillado and oloroso last longer but still belong in the fridge.\n\nSubstitute fino for some or all of the dry vermouth in a martini when you want a saline, almond edge. Do not use supermarket cooking sherry, which is salted for the pan.",
    pairsWith: ["gin", "dry-vermouth", "orange-bitters"],
    signatureSlugs: ["martini"],
  },
  {
    slug: "angostura-bitters",
    aliases: ["bitters"],
    seoTitle: "Angostura Bitters",
    seoDescription:
      "Angostura aromatic bitters as a concentrated alcoholic infusion: dashes as seasoning, and MixWise cocktails that need them — Old Fashioned, Manhattan, and more.",
    dek: "Aromatic bitters from Trinidad: a concentrated alcoholic infusion of herbs and spices, used in dashes as seasoning. The default bitter in the Old Fashioned and Manhattan.",
    abv: "44%",
    origin: "Trinidad and Tobago",
    tastingNotes:
      "Clove, cinnamon, gentian-like bitterness, and a cola-spice register. A few dashes season a stirred whiskey drink; a milliliter too much reads as potpourri and overwhelms the spirit. The preparation is intensely bitter and aromatic by design — it is not meant to be drunk as a beverage.",
    whatItIs:
      "Angostura aromatic bitters are a concentrated alcoholic infusion — botanicals macerated in spirit — bottled at about 44% ABV. The formula is proprietary; the perceptible architecture is baking spice, gentian-family bitterness, and a lingering herbal finish. In cocktail structure, bitters function as seasoning: small volumes (dashes) that bind sugar, spirit, and dilution the way salt binds a sauce.\n\nWhen a home recipe says bitters without qualification, it almost always means this bottle, not orange bitters and not Peychaud’s. Old Fashioneds, Manhattans, and a large class of whiskey drinks assume Angostura’s spice profile.",
    history:
      "The formula is attributed to Johann Gottlieb Benjamin Siegert, a German surgeon in Simón Bolívar’s army, who began producing the bitters in the 1820s in Angostura (now Ciudad Bolívar, Venezuela) as a medicinal tonic. Production later moved to Trinidad, where the House of Angostura still bottles it.\n\nThe town name outlasted the original site as a brand. The oversized paper label is historical; the bottle is small because the product is used by the dash. It became the default aromatic bitter of the American bar in the 19th century and has remained so.",
    howToUse:
      "Dash; do not pour. Two to four dashes typically season an Old Fashioned (spirit, sugar, bitters, water or ice) or a Manhattan (whiskey, sweet vermouth, bitters). Store at room temperature; the high alcohol and concentrated extract are stable for years.\n\nOrange bitters are a different botanical preparation and will not substitute 1:1 in whiskey drinks that expect Angostura’s clove-and-gentian profile.",
    funFact:
      "The recipe remains a trade secret. What the drink needs is the bottled product in dashes, not a reconstruction of the formula.",
    pairsWith: ["bourbon", "rye-whiskey", "sweet-vermouth", "sugar", "orange-peel"],
    signatureSlugs: ["old-fashioned", "manhattan", "whiskey-sour"],
  },
  {
    slug: "orange-bitters",
    seoTitle: "Orange Bitters",
    seoDescription:
      "Orange bitters as a peel-forward alcoholic infusion: how they differ botanically from Angostura, and MixWise cocktails — especially martinis — that use them.",
    dek: "Bitters built on orange peel and supporting botanicals rather than clove-and-gentian spice; the seasoning of a martini, not a stand-in for Angostura in an Old Fashioned.",
    tastingNotes:
      "Orange oil, gentian or other bitter roots, and light spice. Brighter and less baking-spice than Angostura aromatic bitters. The orange is peel and dried fruit, not juice, so the register is aromatic rather than pulpy or sweet.",
    whatItIs:
      "Orange bitters are a style of concentrated alcoholic infusion in which citrus peel is the dominant botanical, supported by bittering agents (often gentian) and spices. They are not Angostura with orange added, and they are not orange liqueur. Common mixing bottles include Regans’ Orange Bitters No. 6 and Angostura Orange — related by category, not by formula.\n\nTheir cocktail role is seasoning for gin drinks, especially the martini, where they underline peel oils already present in gin and dry vermouth. They will not produce an Old Fashioned.",
    history:
      "Nineteenth-century bars commonly stocked several bitters, orange among them. The style nearly disappeared in the 20th century as aromatic bitters (Angostura) became the single default bottle.\n\nIt returned with the late-20th- and early-21st-century martini revival, when bartenders wanted a citrus-peel seasoning that did not read as clove and cinnamon.",
    howToUse:
      "One or two dashes in a martini or other stirred gin drink. Do not substitute 1:1 for Angostura in whiskey drinks; the botanical profiles occupy different parts of the seasoning map. Store at room temperature.\n\nIf a recipe specifies orange bitters, that specification is load-bearing.",
    pairsWith: ["gin", "dry-vermouth", "vodka"],
    signatureSlugs: ["martini"],
  },
  {
    slug: "lime-juice",
    seoTitle: "Lime Juice",
    seoDescription:
      "Fresh lime juice in cocktails: acid and aroma, why bottled lime fails, and MixWise drinks that depend on it — Margarita, Daiquiri, Mojito.",
    dek: "Fresh Citrus juice from acid limes: citric acidity plus volatile peel oils. The defining acid of the Margarita, Daiquiri, Mojito, and Paloma.",
    tastingNotes:
      "Sharp citrus acidity, a green aromatic top note, and a little bitterness if peel oils and pith are pressed hard. Freshly squeezed juice smells of lime; bottled juice, especially from concentrate, often tastes cooked, metallic, and flat because heat treatment and ascorbic-acid degradation destroy the volatile fraction and leave oxidized notes.",
    whatItIs:
      "Lime juice in cocktail recipes means the expressed juice of fresh limes, strained of seeds and coarse pulp. The functional contribution is twofold: organic acids (chiefly citric) that structure a sour, and a volatile aroma that bottled product does not retain. Once squeezed, those aromatics begin to fade; ascorbic acid oxidizes, and the juice takes on dull, cooked notes within a day or two even under refrigeration.\n\nThe grocery-door bottle of preserved lime is a different ingredient: pasteurized, often from concentrate, sometimes with added sulfites or other preservatives. It will acidify a drink; it will not smell like lime.",
    history:
      "Lime maps onto the tropical sour families. The Daiquiri (rum, lime, sugar), the Margarita (tequila, lime, orange liqueur), the Mojito (rum, lime, sugar, mint, soda), and the Paloma (tequila, grapefruit, lime, soda) all treat lime as the acid, not lemon. The gimlet originally used preserved lime cordial (Rose’s), a practical naval product; modern cocktail practice generally prefers fresh juice except when the cordial is historically specified.\n\nThe geographic split is old: lime where the fruit grew with sugarcane and rum or agave; lemon in the temperate whiskey and gin sours.",
    howToUse:
      "Cut, squeeze, and strain out seeds shortly before mixing. Three limes will typically yield a round of Daiquiris, depending on fruit size and juiciness. Do not batch juice days ahead; aroma dies in a day or two in the refrigerator.\n\nA standard sour template with lime is about 2 oz spirit, ¾–1 oz lime, and ¾ oz simple syrup (or less if using agave syrup), adjusted to the fruit’s acidity.",
    pairsWith: ["tequila", "white-rum", "gin", "triple-sec", "simple-syrup", "mint"],
    signatureSlugs: ["margarita", "daiquiri", "mojito", "paloma"],
  },
  {
    slug: "lemon-juice",
    aliases: ["fresh-lemon-juice"],
    matchNames: ["fresh lemon juice"],
    seoTitle: "Lemon Juice",
    seoDescription:
      "Fresh lemon juice in cocktails: citric acid and aroma, bottled versus fresh, and MixWise drinks like the Whiskey Sour and French 75.",
    dek: "Fresh Citrus limon: citric acidity and a rounder aromatic profile than lime. The acid of the whiskey sour, gin sour, Sidecar, and French 75.",
    tastingNotes:
      "Brighter and slightly rounder than lime, with less of lime’s green, sharp finish. The juice still oxidizes quickly once squeezed: ascorbic acid degrades, volatiles dissipate, and refrigerated leftover juice develops cooked, dull notes within a day or two.",
    whatItIs:
      "Lemon juice is the citrus acid in whiskey sours, gin sours, Sidecars, and French 75s. As with lime, the cocktail ingredient is freshly squeezed juice: citric (and some malic) acid plus a volatile oil fraction from the fruit. Bottled lemon juice is pasteurized and typically from concentrate; it supplies acidity without the aroma of fresh fruit.\n\nRecipes that specify lemon mean lemon. Substituting lime changes the aromatic family — sometimes into a legitimate variation (a whiskey drink with lime is closer to a Daisy or a rum-sour logic), often into a muddle of two templates.",
    history:
      "The sour — spirit, citrus, sugar — is 19th-century structure. Lemon was the readily available citrus of the North Atlantic bar; lime was the citrus of the Caribbean and Mexico. That split still maps onto families: whiskey and cognac sours, the Tom Collins, and the French 75 on lemon; rum, tequila, and mezcal sours on lime.\n\nPunch predates the short sour and used the same acid-and-sugar logic at bowl scale.",
    howToUse:
      "Squeeze to order. A working sour template is 2 oz spirit, ¾ oz lemon, and ¾ oz 1:1 simple syrup; adjust sugar to the fruit’s acidity and to any liqueur already in the drink. Strain out seeds and heavy pulp.\n\nDo not hold squeezed lemon for a week. If you must batch, juice the same day you serve and keep it cold and covered.",
    pairsWith: ["bourbon", "gin", "cognac", "simple-syrup", "egg"],
    signatureSlugs: ["whiskey-sour", "french-75"],
  },
  {
    slug: "simple-syrup",
    aliases: ["sugar-syrup"],
    matchNames: ["sugar syrup"],
    seoTitle: "Simple Syrup",
    seoDescription:
      "Simple syrup as sucrose in solution: 1:1 versus 2:1 rich syrup, shelf life, and why MixWise sours use it instead of sour mix.",
    dek: "Sucrose in aqueous solution, conventionally 1:1 by volume or weight. The dissolved sugar of the sour and the Old Fashioned; not sour mix.",
    tastingNotes:
      "Nearly pure sweetness when made from white cane or beet sugar. Demerara or turbinado syrups add light molasses. Rich syrup (2:1 sugar to water) is denser, sweeter by volume, and more resistant to spoilage in the refrigerator because of lower water activity.",
    whatItIs:
      "Simple syrup is sucrose dissolved in water so that sugar will mix in a cold drink. Granulated sugar in a shaker dissolves incompletely and leaves grit. The MixWise default is 1:1 — equal parts sugar and water by volume or by weight; pick one convention and stay with it, because they are not identical (weight-based 1:1 is slightly less sweet by volume than volume-based 1:1).\n\nRich syrup is 2:1 sugar to water. It is denser, so recipes written for 1:1 must be cut (often to about two-thirds the volume) if you substitute rich. Bottled sour mix is syrup plus processed citrus plus preservatives; it is a different product and will not reproduce a fresh sour.",
    history:
      "Punch and sours have always required dissolved sugar; cold water will not take up crystals fast enough in the glass. Nineteenth-century bartenders used gum syrup (gomme: sugar plus gum arabic) as well as plain sugar syrup. The 20th-century sour-mix bottle industrialized the sweet-and-acid half of the template at the expense of fresh citrus.\n\nContemporary practice separates the two: make the syrup, squeeze the fruit.",
    howToUse:
      "Stir sugar into hot water until the solution is clear; cool; refrigerate. 1:1 lasts on the order of a few weeks; 2:1 lasts longer because lower water activity slows spoilage. Label the bottle with ratio and date.\n\nHoney syrup and demerara syrup are the same technique with different sugars. If a recipe specifies rich syrup, do not pour 1:1 at the same volume or the drink will be thin and under-sweet.",
    pairsWith: ["lemon-juice", "lime-juice", "bourbon", "gin", "white-rum"],
    signatureSlugs: ["whiskey-sour", "daiquiri", "old-fashioned"],
  },
  {
    slug: "soda-water",
    aliases: ["club-soda"],
    matchNames: ["club soda"],
    seoTitle: "Soda Water",
    seoDescription:
      "Soda water in cocktails: carbonated water as a lengthener in highballs, spritzes, and MixWise drinks that need bubbles without flavor.",
    dek: "Carbonated water, essentially unflavored. The lengthening agent in highballs, the Americano, and the spritz; not interchangeable with tonic.",
    tastingNotes:
      "Neutral fizz. Club soda typically contains small additions of mineral salts (bicarbonates, sulfates) that register as a faint salinity. Tonic water is a different product: quinine, sugar, and citrus oils. Using tonic where soda is specified adds bitterness and sweetness the template did not account for.",
    whatItIs:
      "Soda water — and club soda, which is carbonated water with a light mineral addition — is CO2 dissolved in water under pressure. In mixed drinks it is a structural ingredient: it lengthens spirit or aperitivo, adds carbonation, and drops the perceived intensity of bitter liqueurs. Flat soda is still water; it no longer performs that role.\n\nA highball is spirit plus soda (and ice). A Collins is a sour lengthened with soda. An Americano is Campari, sweet vermouth, and soda. A spritz is aperitivo, sparkling wine, and soda. None of these is garnish.",
    history:
      "Artificially carbonated water dates to the late 18th century; the highball as spirit-plus-soda is a 19th-century drink, associated especially with whiskey and later with gin. The Americano and the Venetian-derived spritz are the bitter, lower-proof versions of the same lengthening idea.\n\nThe Collins family (Tom Collins and its relatives) adds citrus and sugar before the soda, making a long sour rather than a plain highball.",
    howToUse:
      "Use a cold glass, plenty of ice, and add soda last; a brief stir is enough to integrate without driving off gas. Open a small bottle so residual carbonation lasts.\n\nDo not substitute tonic unless the recipe specifies tonic — the quinine and sugar will rewrite the drink.",
    pairsWith: ["campari", "aperol", "gin", "whiskey", "lime-juice"],
    signatureSlugs: ["americano", "aperol-spritz", "gin-and-tonic"],
  },
  {
    slug: "tonic-water",
    seoTitle: "Tonic Water",
    seoDescription:
      "Tonic water as quinine soda: bitterness, sugar, and how to make a Gin and Tonic in which the gin remains audible.",
    dek: "Carbonated water flavored with quinine, sugar, and citrus. The mixer of the Gin and Tonic; not a substitute for soda water in a spritz or Americano.",
    tastingNotes:
      "Quinine bitterness, citrus oils, and a substantial sugar load in most commercial tonics. Inexpensive tonic can taste of candy and quinine extract; drier premium tonics (Fever-Tree and similar) let gin botanicals remain audible. Flat tonic is sweetened quinine water without texture.",
    whatItIs:
      "Tonic water is a flavored carbonated mixer whose defining bitter is quinine, originally from Cinchona bark, now usually added as a purified compound. Sugar and citrus oils complete the formula. A Gin and Tonic is gin, tonic, ice, and typically lime; the tonic is the modifier, not a neutral lengthener.\n\nUsing tonic in a Campari spritz or a whiskey highball produces a drink that tastes like a G&T with extra ingredients, because quinine and sugar are not silent.",
    history:
      "British colonial practice combined gin with quinine tonic as an antimalarial measure; the sugar in commercial tonic made the medicine palatable. The combination survived as a highball long after the medical rationale receded. Twentieth-century supermarket tonic made the drink ubiquitous and, in many bottlings, sweeter than the gin.\n\nThe structure remains a highball: spirit plus a flavored carbonated mixer.",
    howToUse:
      "Plenty of ice, cold tonic, and a lime wedge or peel. Ratio is taste; start around 1:2 gin to tonic so the spirit is not lost. Do not use flat tonic.\n\nDo not pour tonic into recipes that specify soda water.",
    pairsWith: ["gin", "lime-juice", "vodka"],
    signatureSlugs: ["gin-and-tonic"],
  },
  {
    slug: "ginger-beer",
    seoTitle: "Ginger Beer",
    seoDescription:
      "Ginger beer in cocktails: pungency versus ginger ale, and MixWise drinks in the Moscow Mule and Dark ’n’ Stormy families.",
    dek: "A ginger-flavored carbonated mixer, typically non-alcoholic and substantially spicier than ginger ale; the defining lengthener of the mule and the Dark ’n’ Stormy family.",
    tastingNotes:
      "Ginger heat (gingerols and related pungent compounds), sweetness, and carbonation. A useful ginger beer should sting. Ginger ale is a milder, sweeter, more citrus-soda-like cousin and will not supply the same bite.",
    whatItIs:
      "Ginger beer in the modern bar is almost always a non-alcoholic ginger soda — historically a fermented, lightly alcoholic drink, now usually force-carbonated with ginger extract or puree and sugar. It is the mixer in mules: spirit, lime, and ginger beer over ice.\n\nIf the bottle tastes like lemon-lime soda with a rumor of ginger, it will not carry a mule. The heat is the point of the modifier.",
    history:
      "The Moscow Mule (vodka, lime, ginger beer) is a mid-20th-century American drink, closely tied to vodka’s postwar marketing. Dark rum plus ginger beer is the Dark ’n’ Stormy family (Gosling’s has trademarked a particular specification). Both drinks fail when the ginger ale is timid, because the template has no other source of spice.\n\nOlder ginger beer was a fermented grocery product; the cocktail mixer is its carbonated descendant.",
    howToUse:
      "Build over ice: spirit, lime juice, ginger beer last. A copper mug is traditional for the mule and irrelevant to the recipe’s chemistry; ice and lime are not optional.\n\nUse ginger beer when the recipe names it. Use ginger ale only when you want a milder, sweeter highball on purpose.",
    pairsWith: ["vodka", "dark-rum", "lime-juice", "bourbon"],
    signatureSlugs: [],
  },
  {
    slug: "grapefruit-juice",
    seoTitle: "Grapefruit Juice",
    seoDescription:
      "Grapefruit juice in cocktails: fresh versus bottled, naringin bitterness, and MixWise drinks like the Paloma.",
    dek: "Juice of Citrus paradisi: citric acidity plus naringin bitterness. The fruit half of the Paloma, and a common acid in long tequila and mezcal drinks.",
    tastingNotes:
      "Bitter, floral, and sometimes modestly sweet in pink or ruby fruit. Freshly squeezed juice smells of grapefruit; from-concentrate juice often tastes of pith, metal, and cooked citrus because pasteurization and concentration degrade volatiles and can concentrate bitter peel notes.",
    whatItIs:
      "Grapefruit juice contributes both acid and a distinctive flavonoid bitterness (naringin) that lemon and lime lack. Freshly squeezed is the best cocktail ingredient; a refrigerated not-from-concentrate carton is acceptable for pitchers. Pink cocktail mixer — sugar, dye, and a little juice — is a different product.\n\nThe Paloma (tequila, grapefruit, soda, lime, often salt) is the primary template. Grapefruit also appears in tiki-adjacent highballs and in drinks that want bitterness without a liqueur.",
    history:
      "The Paloma is everyday Mexican bar practice — tequila’s most useful long drink — rather than a mid-century American invention. North American cocktail menus treated it as a discovery decades after it was already standard in Mexico.\n\nGrapefruit as a cocktail citrus is 20th-century; the fruit itself is a relatively recent hybrid in commercial terms compared with lemon and lime.",
    howToUse:
      "Build over ice with tequila or mezcal, lime, soda, and salt if you want it. If the juice is a sweetened ruby mixer, compensate with extra lime and soda or the drink will taste of soda pop.\n\nFresh juice oxidizes; batch the same day when possible.",
    pairsWith: ["tequila", "mezcal", "lime-juice", "soda-water"],
    signatureSlugs: ["paloma", "mezcal-paloma"],
  },
  {
    slug: "orange-juice",
    seoTitle: "Orange Juice",
    seoDescription:
      "Orange juice in cocktails: low acid relative to lemon and lime, when MixWise recipes want it, and how to keep the drink structured.",
    dek: "Juice of sweet orange (Citrus sinensis): relatively low acid and high sugar compared with lemon or lime. A mixer that needs spirit, bitter, or additional acid so the drink does not collapse into brunch.",
    tastingNotes:
      "Sweet citrus, low acidity relative to lemon or lime, and a pulpy texture if unstrained. Easy to make a drink flabby if orange is the only citrus, because there is not enough acid to structure a sour. Fresh juice smells of orange; carton juice from concentrate is flatter and more cooked.",
    whatItIs:
      "Orange juice appears in a smaller set of classics than lemon or lime — the Screwdriver (vodka and orange), the Blood and Sand (Scotch, cherry liqueur, sweet vermouth, orange), and various tiki drinks. Freshly squeezed juice is preferable when orange is a main ingredient.\n\nBecause sweet orange is low in acid, recipes that already contain liqueur or vermouth often need a cut of lemon, a bitter (Campari), or a smaller orange pour to keep the drink from tasting like breakfast.",
    history:
      "Hotel-bar and brunch culture of the 20th century poured a great deal of orange juice into spirits. Some of those drinks are structurally sound (Blood and Sand balances orange against Scotch and cherry); many are simply spirit-and-juice.\n\nOrange as a garnish oil (the peel) is a separate ingredient with a different chemistry.",
    howToUse:
      "Squeeze fresh when the juice is a principal ingredient. Pair with whiskey, Campari, or rum rather than adding it to every sour. If the rest of the recipe is already sweet, reduce the orange or add lemon.\n\nStrain heavy pulp if you want a cleaner texture in a short drink.",
    pairsWith: ["vodka", "campari", "scotch", "cherry-heering"],
    signatureSlugs: [],
  },
  {
    slug: "espresso",
    seoTitle: "Espresso",
    seoDescription:
      "Espresso in cocktails: concentrated coffee extraction, why an Espresso Martini needs a real shot, and how MixWise uses coffee in drinks.",
    dek: "A short, high-extraction coffee shot: concentrated solubles, crema, and bitterness. The coffee in an Espresso Martini; cold brew is a different extraction and a different drink.",
    tastingNotes:
      "Roast, crema, bitterness, and a little sweetness from the bean’s sugars. Stale or over-extracted diner coffee produces a muddy, ashy martini. The crema and dissolved CO2 contribute to the foam when the drink is shaken with ice; that foam is not dairy.",
    whatItIs:
      "Espresso is coffee extracted under pressure in a short time, yielding a concentrated shot with crema. In the Espresso Martini the shot is an ingredient alongside vodka and coffee liqueur, shaken hard so proteins and emulsified oils form a foam. Instant espresso, reconstituted strong, can approximate the solubles in a pinch; drip coffee is too dilute and usually too stale.\n\nCold brew is a different extraction (long, cold, lower acidity) and will not automatically reproduce the same foam or roast character.",
    history:
      "The Espresso Martini is attributed to Dick Bradsell in late-20th-century London: vodka, coffee liqueur, and a fresh espresso shot, shaken. The foam is a consequence of agitating hot or freshly pulled coffee with ice — dissolved gases, coffee oils, and protein — not a cream float.\n\nCoffee in mixed drinks is older (rum and coffee, coffee liqueurs), but this particular short, shaken template is modern.",
    howToUse:
      "Pull the shot and shake immediately so the coffee is still fresh and the crema has not collapsed. Too much liqueur and not enough coffee is how the drink becomes dessert; the shot should be audible as coffee, not only as sweetness.\n\nShake hard with ice; strain. A dry-shake is unnecessary; the espresso already supplies foam-forming material.",
    pairsWith: ["vodka", "coffee-liqueur", "kahlua"],
    signatureSlugs: ["espresso-martini"],
  },
  {
    slug: "orgeat-syrup",
    seoTitle: "Orgeat",
    seoDescription:
      "Orgeat as almond syrup or emulsion scented with orange flower water, and MixWise tiki and sour drinks that call for it.",
    dek: "An almond syrup, traditionally an emulsion, scented with orange flower water. The nut-and-blossom sweetener of the Mai Tai, not a generic simple syrup.",
    tastingNotes:
      "Marzipan, orange blossom, and sugar. Well-made orgeat tastes of almonds (benzaldehyde from the nuts, or from apricot kernels in some formulas). Poor commercial orgeat tastes of artificial almond extract. Separation into a cloudy layer and a clearer syrup is normal in products that still contain almond solids.",
    whatItIs:
      "Orgeat is a sweetened almond preparation: historically a barley-and-almond drink, now an almond syrup, often an emulsion of ground almonds, sugar, water, and orange flower water (and sometimes brandy as a preservative). The orange flower water is not optional flavoring in the classic sense; it is part of the aromatic definition.\n\nIt is a tiki and sour modifier — Mai Tai, Japanese Cocktail — used in small volume. Falernum is a different, spicier Caribbean syrup (almond, ginger, lime, cloves, often with rum). Amaretto is an alcoholic liqueur, sweeter and more extract-like. Neither is a 1:1 substitute.",
    history:
      "French orgeat (from orge, barley) is a pre-cocktail product that became a syrup. Mid-20th-century tiki, and Victor Bergeron’s Mai Tai in particular, made the bottle famous in the United States.\n\nA Mai Tai without orgeat is a rum sour with lime and orange liqueur; the almond-and-blossom note is what distinguishes the drink.",
    howToUse:
      "Shake or stir the bottle; almond solids settle. Refrigerate after opening. A half-ounce is a substantial dose in a sour; start there or lower. If the syrup has separated, recombine it — that is emulsion physics, not spoilage, unless the smell has turned.\n\nDo not replace orgeat with simple syrup plus almond extract if you can avoid it; you will get sweetness without the body of the emulsion.",
    pairsWith: ["rum", "lime-juice", "white-rum", "cognac"],
    signatureSlugs: ["daiquiri"],
  },
  {
    slug: "grenadine",
    seoTitle: "Grenadine",
    seoDescription:
      "Grenadine as pomegranate syrup (from French grenade), versus dyed high-fructose grenadine, and MixWise cocktails that use it.",
    dek: "Pomegranate syrup (from French grenade). Tart-sweet when made from the fruit; the neon grocery bottle is typically dyed high-fructose syrup with little or no pomegranate.",
    tastingNotes:
      "Real grenadine: pomegranate, berry, and a little tannin from the arils and rind. Grocery grenadine: red sugar water, often high-fructose corn syrup, artificial color, and a flavor that reads as cherry-adjacent rather than pomegranate.",
    whatItIs:
      "Grenadine takes its name from grenade, French for pomegranate. The cocktail ingredient is a reduced or sweetened pomegranate syrup: fruit acid, tannin, and sugar, used in small volume as a modifier (Jack Rose, Tequila Sunrise, and other drinks that want red fruit without fake cherry). It is not a two-ounce pour.\n\nMuch of what is sold as grenadine in North American groceries is a different product — colored and flavored high-fructose syrup with token or no pomegranate. It will dye a drink; it will not taste of the fruit.",
    history:
      "Classic recipes assumed pomegranate. As bottled mixers industrialized in the 20th century, American grenadine drifted toward dye and corn syrup because color was cheaper to guarantee than fruit. The drinks kept their pink-red appearance and lost the tart, tannic edge that made the syrup useful as more than coloring.\n\nPomegranate-based bottles (or a homemade reduction of juice and sugar) restore that function.",
    howToUse:
      "A quarter- to half-ounce is the usual range; taste as you go. Real grenadine is tart enough that it can replace some of a sour’s citrus-and-sugar work; dyed syrup only adds sweetness and color, so you may need more lemon or lime.\n\nRefrigerate after opening. Homemade grenadine is juice plus sugar, optionally with a little pomegranate molasses or orange flower water, cooked briefly and cooled.",
    pairsWith: ["apple-brandy", "tequila", "gin", "lemon-juice", "lime-juice"],
    signatureSlugs: [],
  },
  {
    slug: "agave-syrup",
    seoTitle: "Agave Syrup",
    seoDescription:
      "Agave syrup as a fructose-forward sweetener: density versus cane simple, light versus amber, and its role in the contemporary Margarita.",
    dek: "A fructose-forward syrup from agave, denser and sweeter by volume than 1:1 cane simple; the usual sweetener in a contemporary Margarita.",
    tastingNotes:
      "Light (clear) agave: relatively neutral sweetness with a faint vegetal edge. Amber and dark styles: caramelized, molasses-like notes from heat treatment, denser in flavor as well as in sugar. The fructose-forward profile tastes sweeter than sucrose simple of the same volume.",
    whatItIs:
      "Agave syrup (often labeled agave nectar) is a concentrated sweetener produced from the sap or hydrolyzed fructans of agave plants, principally Agave tequilana. Industrial nectar is typically rich in fructose rather than sucrose, which is why it tastes sweeter than a 1:1 cane simple syrup by volume and why recipes that swap it for simple usually start lower — commonly about ½ oz where ¾ oz of simple would go — then adjust.\n\nLight (clear) agave syrup is relatively neutral; amber or dark styles carry more caramelized, molasses-like notes from heat treatment. In the glass it is most associated with the Margarita and other agave-spirit sours, but it is a general-purpose sweetener anywhere a slight vegetal edge is welcome. It is denser than simple syrup and can be loosened with a little hot water if it will not mix cold.",
    history:
      "Agave has been a sweetener in Mexico for centuries: aguamiel, the sap of agave plants, and preparations derived from it long predate industrial nectar. What North American bars call agave nectar or agave syrup is largely a late-20th-century industrial product — sap or hydrolyzed agave fructans (inulin) processed into a shelf-stable, fructose-rich syrup and marketed in the United States as a natural alternative to sugar.\n\nThe Margarita’s original and mid-century specifications balanced tequila against lime and orange liqueur (and sometimes a separate sugar component). From the 1990s onward, many contemporary bars shifted the sweetening toward agave syrup: it echoes the plant behind tequila and mezcal, mixes without requiring the orange-liqueur volume of a classic spec, and lets the drink be built as a sour (spirit, lime, agave) with liqueur optional or reduced. That shift is stylistic and practical — botanical rhyme and density — not a claim that agave syrup is the historically authentic sweetener of a drink that never had a single frozen recipe.",
    howToUse:
      "Because the syrup is denser and fructose-sweeter than 1:1 cane simple, start lower: about ½ oz agave where a recipe uses ¾ oz simple, then adjust to the lime and the tequila. Light agave is the mixing default when you want sweetness without extra caramel; amber or dark will season the drink like a mild molasses and can muddy a bright Margarita.\n\nIf the syrup is too viscous to incorporate in a cold shake, loosen it with a little hot water (a barspoon or so per pour, or a working bottle thinned to a more pourable consistency). Refrigerate after opening; it keeps for months but can crystallize or ferment if diluted and left warm.",
    pairsWith: ["tequila", "lime-juice", "mezcal", "triple-sec"],
    signatureSlugs: ["margarita"],
  },
  {
    slug: "honey-syrup",
    seoTitle: "Honey Syrup",
    seoDescription:
      "Honey syrup in cocktails: fructose-glucose honey loosened with water so it mixes cold, and MixWise drinks like the Penicillin that use it.",
    dek: "Honey diluted with water so the viscous sugars will mix in a cold shake. The sweetener of the Penicillin and Bee’s Knees; undiluted honey remains a sludge in the shaker.",
    tastingNotes:
      "Floral, herbal, or buckwheat-malty depending on the nectar source. Strong honeys (buckwheat, some wildflower) will season the entire sour; a mild clover or orange-blossom honey behaves closer to simple syrup with a bee note.",
    whatItIs:
      "Honey is a supersaturated solution of fructose and glucose with minor acids, enzymes, and aromatic compounds from floral nectar. In a cold cocktail it is too viscous to dissolve, so honey syrup — typically equal parts honey and hot water, cooled — is the working form. The water lowers viscosity enough for a shake or stir to incorporate it.\n\nThe Penicillin (blended Scotch, lemon, honey-ginger syrup, Islay float) and the Bee’s Knees (gin, lemon, honey) are the two templates that justify a jar on a home bar.",
    history:
      "Honey as a punch sweetener is ancient; it predates cane sugar in mixed drinks by a wide margin. The Bee’s Knees is a Prohibition-era gin sour that uses honey in place of sugar, possibly to mask rough spirit.\n\nThe Penicillin, created by Sam Ross in the mid-2000s, is the modern reason most cocktail bars keep honey-ginger syrup: it showed that honey plus ginger could structure a Scotch sour without tasting like a toddy.",
    howToUse:
      "Stir honey into hot water until uniform (1:1 by volume is the usual starting point; 3:1 honey to water is richer and will need a smaller pour). Cool and refrigerate; it lasts on the order of a couple of weeks, sometimes longer, but honey syrup can ferment.\n\nPair with lemon and whiskey or gin. If you substitute honey syrup for simple in a standard sour, start a little lower by volume — honey tastes richer than white sucrose — and adjust.",
    pairsWith: ["scotch", "lemon-juice", "gin", "ginger-syrup"],
    signatureSlugs: ["penicillin"],
  },
  {
    slug: "mint",
    seoTitle: "Mint",
    seoDescription:
      "Mint in cocktails: Mentha as a fresh-leaf aromatic, how to bruise without extracting chlorophyll bitterness, and MixWise drinks like the Mojito.",
    dek: "Mentha, usually spearmint (Mentha spicata): a fresh-leaf aromatic used as both mixing herb and garnish. The defining perfume of the Mojito and the julep.",
    tastingNotes:
      "Menthol and related monoterpenes, green leaf, a little sweetness. Spearmint is the usual cocktail mint (higher carvone, gentler than peppermint’s menthol punch). Wilted or blackened leaves taste of the crisper drawer and contribute chlorophyll bitterness if shredded.",
    whatItIs:
      "Mint in cocktails is the fresh aerial parts of Mentha species, most often spearmint. The aromatic compounds live in glandular trichomes on the leaves; gentle bruising releases them. Aggressive muddling ruptures chlorophyll-rich tissue and stems, extracting bitterness and turning the drink murky.\n\nMojitos, juleps, and smashes want a substantial quantity of mint, treated as an herb rather than as a puree. Dried mint lacks the volatile fraction that makes the fresh herb worth using.",
    history:
      "The mint julep — spirit, sugar, mint, ice — is among the older American mixed drinks, associated with the 18th- and 19th-century South. The Mojito is the rum highball analogue: rum, lime, sugar, mint, soda, with Cuban and earlier origins debated. Both drinks are older than the restaurant Mojito that tastes of lime cordial and shredded leaf.\n\nThe smash is a related 19th-century family: spirit, sugar, mint, seasonal fruit, ice.",
    howToUse:
      "Use fresh bunches. Clap a sprig between the palms or press the leaves lightly in the glass to release oils; do not pulverize stems into the drink. Garnish with a bouquet large enough to smell before the sip.\n\nDo not use dried mint. Discard leaves that have blackened. In a Mojito, mint works with lime and rum; in a julep, with whiskey, sugar, and crushed ice.",
    pairsWith: ["white-rum", "lime-juice", "bourbon", "simple-syrup", "soda-water"],
    signatureSlugs: ["mojito"],
  },
  {
    slug: "orange-peel",
    seoTitle: "Orange Peel",
    seoDescription:
      "Orange peel in cocktails: expressed flavedo oils over an Old Fashioned or Negroni, and why peel is not the same ingredient as juice.",
    dek: "The flavedo of the orange: expressed peel oils (chiefly limonene and related terpenes) used as a finishing aromatic. Not the same ingredient as orange juice.",
    tastingNotes:
      "Bright orange oil on the nose, with a little pith bitterness if the cut includes too much albedo. The aroma should register before the sip. Oils oxidize on cut fruit; a peel from last week’s garnish tray smells of pith and dust rather than of orange.",
    whatItIs:
      "Orange peel as a cocktail garnish is a strip of flavedo (the colored outer rind) expressed over the drink so that the oil glands spray a mist of terpenes onto the surface and the glass. The peel may then be dropped in or used to wipe the rim. The contribution is aromatic and slightly bitter, not sweet and not acidic in the way juice is.\n\nThis is how a Negroni, Old Fashioned, or Manhattan is finished. Juice is a different ingredient with a different chemistry and should not be substituted for a twist.",
    history:
      "Citrus oils as a finishing garnish are 19th-century bar practice, contemporaneous with the bitters-and-sugar whiskey drinks that became the Old Fashioned. The fruit flag — a slice or cherry-and-orange garnish muddled in the glass — is a later restaurant habit and is not required by the structure of those drinks.\n\nExpressing the peel is seasoning; leaving a limp wheel in the glass is decoration.",
    howToUse:
      "Cut a strip of peel with as little white pith as practical. Hold it over the drink, colored side down, and squeeze to spray the oils; then drop it in or discard it. Use a fresh orange.\n\nA vegetable peeler or a sharp knife both work; the width of the twist is aesthetic. What matters is intact oil glands and a recent cut.",
    pairsWith: ["campari", "bourbon", "sweet-vermouth", "gin", "angostura-bitters"],
    signatureSlugs: ["negroni", "old-fashioned", "manhattan"],
  },
  {
    slug: "egg",
    seoTitle: "Egg White",
    seoDescription:
      "Egg white in cocktails: protein foam, a brief safety note, and MixWise sours that use it — Whiskey Sour and Pisco Sour.",
    dek: "Egg white as a foam: albumins and other proteins that denature under agitation and stabilize a sour’s texture. Optional in the whiskey sour and standard in the pisco sour.",
    tastingNotes:
      "Almost none if the egg is fresh; a sulfur note if it is not. The point is silk and a stable foam cap, not flavor. Aquafaba (chickpea cooking liquid) supplies plant proteins that can approximate the foam.",
    whatItIs:
      "Egg white in a sour is a textural ingredient. Ovalbumin and related proteins unfold when shaken, then form a foam that traps air and gives the drink a silky body and a white cap. The yolk is generally omitted in contemporary whiskey sours; whole-egg drinks (flips, some nogs) are a different family.\n\nUse a fresh egg, or pasteurized egg white from a carton if you want to reduce Salmonella risk. People who omit egg still have a sour; they do not have the foam. Canned cocktail foam is a different product and usually a worse one.",
    history:
      "Sours with egg are 19th-century: the whiskey sour appears with egg white in many early specifications, and the pisco sour (pisco, lime, syrup, egg white, bitters) made the foam structurally expected. Mid-20th-century caution about raw egg, and later vegan preference, made the white optional in many bars.\n\nThat caution is food safety and preference. Pasteurized whites and aquafaba are documented workarounds.",
    howToUse:
      "Shake without ice first (a dry shake) to denature proteins and build foam, then shake with ice to chill and dilute; strain. Reverse dry-shake (ice first, then without) is an alternative some bartenders prefer for finer foam.\n\nUse one fresh egg white or about ¾ oz pasteurized white per drink. If you do not want egg, omit it; do not replace it with aerosol cream or canned foam.",
    pairsWith: ["bourbon", "lemon-juice", "pisco", "simple-syrup"],
    signatureSlugs: ["whiskey-sour"],
  },
];
