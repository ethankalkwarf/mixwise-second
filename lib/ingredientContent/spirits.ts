import type { IngredientGuide } from "./types";

export const SPIRIT_GUIDES: IngredientGuide[] = [
  {
    slug: "gin",
    seoTitle: "Gin",
    seoDescription:
      "Juniper-forward distilled spirit: production, styles from genever to London dry, and MixWise cocktails such as the martini, Gin and Tonic, Negroni, and Last Word.",
    dek: "A juniper-led botanical spirit redistilled from a neutral base; the default for the martini, the gin sour family, and equal-parts drinks such as the Negroni.",
    abv: "37.5–47%",
    origin: "Netherlands (genever); London dry as the 19th-century export style",
    tastingNotes:
      "Juniper (pine, resin) is required; coriander seed, citrus peel, angelica, and orris are common supporting botanicals. London dry is relatively dry, crisp, and pine-forward. Contemporary gins may emphasize floral, cucumber, or citrus notes and recede beside Campari. Genever carries malt-wine weight that London dry does not.",
    whatItIs:
      "Gin is a distilled spirit whose character comes from botanicals, of which juniper must be perceptible. In the European Union it is a juniper-flavoured spirit drink at a minimum of 37.5% ABV; United States bottlings are typically 40% or higher. Most cocktail gin begins as a high-proof neutral spirit that is redistilled — or sometimes macerated — with juniper and other botanicals. London dry gin may not be flavored after distillation. The mash matters less to the mixed drink than the botanical bill and whether the spirit is dry, lightly sweetened (Old Tom), or malt-based (genever).\n\nIn the glass gin is a flavored base, not a blank one. Its botanicals stand up to dry vermouth in the martini, to tonic in a highball, to citrus in the sour and Collins families, and to Campari and Chartreuse in equal-parts stirred drinks. When a recipe specifies only “gin,” London dry is the historical and practical default.",
    history:
      "Genever, a malt-wine spirit flavored with juniper, developed in the Netherlands by the 16th–17th centuries and traveled to England, where cheaper grain spirit and, later, continuous column distillation produced a drier, cleaner style. London dry gin became the 19th-century export standard: unsweetened, botanically assertive, and suited to gin palaces and the emerging mixed-drink repertoire.\n\nVictorian and Edwardian bars used that gin in sours, the Collins (a sour lengthened with soda), and the martini, which settled in the late 19th century as gin and dry vermouth. The Negroni (Florence, around 1919–20) and the Last Word (Detroit Athletic Club, about 1916) are 20th-century templates that still depend on gin’s botanicals rather than on a neutral spirit.",
    howToUse:
      "Treat London dry as the mixing default in martinis, gin sours, Collins and gin-and-tonic highballs, and equal-parts drinks with vermouth, Campari, or Chartreuse. Navy-strength gin (typically around 57% ABV) is useful in stirred drinks that can absorb the extra ethanol; it can unbalance a delicate sour. Contemporary floral gins suit highballs and citrus-forward drinks but often disappear beside Campari. Genever or Old Tom will sweeten and weight a recipe written for London dry — closer to a Martinez than to a dry martini. Gin is shelf-stable; citrus botanicals fade only slowly over years.",
    funFact:
      "Before the mid-20th century a martini implied gin and dry vermouth. The vodka martini is a later substitution; recipes that do not specify a base still assume gin.",
    pairsWith: ["dry-vermouth", "sweet-vermouth", "tonic-water", "campari", "lime-juice", "green-chartreuse"],
    signatureSlugs: ["gin-and-tonic", "martini", "negroni", "last-word", "french-75"],
  },
  {
    slug: "vodka",
    seoTitle: "Vodka",
    seoDescription:
      "A highly rectified, nearly neutral spirit: how it is made, when coffee or citrus should lead, and MixWise drinks such as the Espresso Martini and Cosmopolitan.",
    dek: "A highly rectified spirit distilled and filtered toward neutrality, used when coffee, citrus, ginger, or fruit liqueur should lead.",
    abv: "37.5–40%",
    origin: "Poland and Russia (historical production); now made worldwide",
    tastingNotes:
      "Well-made vodka is nearly neutral: faint cereal or potato sweetness, ethanol warmth, a clean finish. Inferior vodka shows solvent, oiliness, or harsh heat, most obvious in short drinks served up. Some Eastern European and craft vodkas retain a little grain, rye, or grape character by design.",
    whatItIs:
      "Vodka is agricultural spirit distilled to a high proof and treated so that congeners, botanicals, and barrel character are largely removed. In the United States it must be distilled to at least 95% alcohol by volume and bottled at not less than 40%; the European Union sets a minimum of 37.5% ABV and allows grain, potato, grapes, and other agricultural sources. The category’s defining trait is the absence of a signature flavor, not a particular mash bill.\n\nIn cocktails vodka is a structural base: it supplies ethanol and texture while a modifier — coffee liqueur and espresso, cranberry and orange liqueur, ginger beer, or citrus — provides the identity. It is a poor substitute in drinks written around gin botanicals or whiskey barrel notes, because those recipes use the spirit as a flavor rather than as a solvent.",
    history:
      "Distilled grain and potato spirits have a long record in Poland and Russia; the international cocktail bottle is largely a 20th-century export style, heavily filtered and marketed as clean. Vodka’s American bar life is postwar. The Moscow Mule (vodka, ginger beer, lime), popularized in the 1940s, and the vodka martini gave it a place in mixed drinks; the Cosmopolitan (1980s–90s) and the Espresso Martini (Dick Bradsell, London, 1983, originally a vodka espresso) locked it into late-century templates.\n\nNineteenth-century recipe books almost never call for it. Substituting vodka into a Negroni, Martinez, or whiskey sour removes the botanical or barrel structure those drinks are built on.",
    howToUse:
      "Use vodka when the recipe names it, or when the drink is organized around a loud modifier (espresso and coffee liqueur, cranberry and lime, ginger beer). It belongs in short drinks served up and in highballs. Flavored vodkas add sweetness and aroma that will not match a recipe written for unflavored spirit. Neutral vodka will not rescue a gin or whiskey template — the cocktail becomes a different, usually thinner, drink. Store at room temperature; chilling is for service, not preservation.",
    funFact:
      "The Cosmopolitan is built on vodka by design: cranberry, lime, and orange liqueur need a base that will not add juniper or oak. Gin in the same formula competes with the citrus and fruit.",
    pairsWith: ["coffee-liqueur", "lime-juice", "triple-sec", "ginger-beer", "espresso"],
    signatureSlugs: ["espresso-martini", "cosmopolitan"],
  },
  {
    slug: "bourbon",
    seoTitle: "Bourbon",
    seoDescription:
      "American whiskey of at least 51% corn, aged in new charred oak: how it differs from rye, and MixWise cocktails such as the Old Fashioned and Whiskey Sour.",
    dek: "American whiskey distilled from a mash of at least 51% corn and aged in new charred oak; rounder and sweeter than rye, and the usual pour for the Old Fashioned and whiskey sour.",
    abv: "40–50%",
    origin: "United States (often associated with Kentucky; legally anywhere in the US)",
    tastingNotes:
      "Vanilla, caramel, coconut, and toasted oak from the new charred barrel, plus corn sweetness. Higher-rye mash bills add pepper and baking spice; wheated bourbons are softer. Proof matters in the glass: 50% ABV (bottled-in-bond) or about 45–50% holds up in an Old Fashioned better than a timid 40% whiskey.",
    whatItIs:
      "Bourbon is whiskey produced in the United States from a fermented mash of at least 51% corn, distilled to no more than 160 proof, entered into new charred oak barrels at no more than 125 proof, and bottled at no less than 80 proof. There is no legal minimum age for bourbon as such; “straight bourbon” must be aged at least two years, and bottled-in-bond whiskey is 50% ABV, aged at least four years, and the product of one distillery and one season. The new barrel — not Kentucky soil alone — is why bourbon tastes of vanilla and caramel rather than the drier spice of rye.\n\nIn cocktails it is a sweet, oak-forward base for the Old Fashioned family (spirit, sugar, bitters), the whiskey sour, and whiskey-and-vermouth drinks such as the Boulevardier when a rounder profile is wanted. It will not supply the snap of a rye Manhattan unless the recipe is rewritten around that softness.",
    history:
      "Corn whiskey and barrel aging in the Ohio and Kentucky river valleys produced a recognizable American style in the 18th and 19th centuries; the name “bourbon” is tied to that trade, though the spirit may legally be made anywhere in the United States. The whiskey cocktail that became the Old Fashioned — spirit, sugar, bitters, and water or ice — and the whiskey sour are 19th-century templates.\n\nAfter Prohibition, bourbon was cheaper and more widely distributed than rye, and it became the default American mixing whiskey. Rye nearly left the back bar until the cocktail revival of the 2000s. Most mid-century “whiskey” recipes in the United States silently assume bourbon.",
    howToUse:
      "Pour bourbon in Old Fashioneds, whiskey sours, and highballs when corn sweetness and oak vanilla are wanted. In a Boulevardier it softens Campari relative to rye; in a Manhattan it reads sweeter and rounder than the rye original. If a recipe says only “whiskey,” American whiskey — bourbon or rye — is the usual intent. Mixing bottles around 45–50% ABV keep sugar and citrus from washing the spirit out. Bourbon is stable at room temperature; once opened, oxidation is slow compared with vermouth.",
    funFact:
      "The 19th-century whiskey cocktail did not include muddled orange and cherry. Sugar, bitters, whiskey, ice or water, and a twist are the structure; fruit in the glass is a later garnish habit.",
    pairsWith: ["angostura-bitters", "sweet-vermouth", "campari", "lemon-juice", "simple-syrup"],
    signatureSlugs: ["old-fashioned", "whiskey-sour", "boulevardier"],
  },
  {
    slug: "rye-whiskey",
    aliases: ["rye"],
    matchNames: ["rye"],
    seoTitle: "Rye Whiskey",
    seoDescription:
      "American whiskey of at least 51% rye: why it is drier than bourbon, and MixWise drinks such as the Manhattan and Boulevardier that were written for that spice.",
    dek: "American whiskey from a mash of at least 51% rye, drier and more peppery than bourbon, and the classic base for the Manhattan and Sazerac.",
    abv: "40–50%",
    origin: "United States (straight rye); Canada (blended whisky often labeled rye)",
    tastingNotes:
      "Black pepper, clove and baking spice, herbal dryness, less vanilla than bourbon. A dry finish lets sweet vermouth sit beside it rather than turning a Manhattan into dessert. Canadian whisky sold as “rye” is often a milder grain blend and will not automatically taste like Kentucky or Pennsylvania straight rye.",
    whatItIs:
      "In the United States, rye whiskey must be distilled from a mash of at least 51% rye and, like bourbon, aged in new charred oak. Rye grain contributes a spicier, leaner profile than corn. Canadian whisky has long been colloquially called rye even when the mash is not rye-dominant; those bottles are blended and typically softer. For cocktail recipes written in the American canon, “rye” means the drier, high-rye US style unless a Canadian whisky is named.\n\nRye is the structural whiskey of pre-Prohibition mixed drinks: the Manhattan (whiskey, sweet vermouth, bitters), the Sazerac (whiskey, sugar, Peychaud’s, absinthe rinse), and equal-parts bitter drinks such as the Boulevardier. Substituting bourbon does not break the template, but it shifts the drink toward sweetness and oak vanilla.",
    history:
      "Rye was the prevailing American whiskey of the Mid-Atlantic and the 19th-century bar. The Manhattan, associated with New York in the 1870s–80s, and the New Orleans Sazerac (originally cognac, later rye) were built on that spice. After Repeal, bourbon’s corn economics and marketing largely displaced rye; by the late 20th century straight rye was scarce.\n\nThe cocktail revival restored it because those recipes read as flabby with only bourbon. Modern stirred whiskey drinks that specify rye are asking for that historical dryness, not merely for “whiskey.”",
    howToUse:
      "Use US straight rye in Manhattans, Sazeracs, and Boulevardiers, and in Old Fashioneds when a drier, spicier profile is wanted. Bonded or about 50% ABV rye keeps sweet vermouth in check. Bourbon can stand in: the drink becomes rounder and sweeter because corn and new-oak vanilla replace rye’s dryness. Canadian “rye” will usually make a gentler, less spicy Manhattan. Store as other whiskeys: cool, dark, tightly capped.",
    funFact:
      "A Manhattan made with bourbon is a related drink in the same family. The late-19th-century recipe and the pre-Prohibition bar both treated rye as the whiskey.",
    pairsWith: ["sweet-vermouth", "angostura-bitters", "campari", "dry-vermouth"],
    signatureSlugs: ["manhattan", "boulevardier", "penicillin"],
  },
  {
    slug: "scotch",
    aliases: ["blended-scotch"],
    matchNames: ["blended scotch", "scotch whisky"],
    seoTitle: "Scotch Whisky",
    seoDescription:
      "Whisky distilled and aged in Scotland: blended versus malt, how peat is used in mixed drinks, and MixWise cocktails such as the Penicillin.",
    dek: "Whisky distilled and aged in Scotland; blended Scotch is the usual cocktail pour, while peated malt is used as aroma or a split base rather than as a default.",
    abv: "40–46%",
    origin: "Scotland",
    tastingNotes:
      "Blended Scotch typically shows honey, grain, light oak, and a thread of smoke or none. Unpeated Highland and Speyside malts are malt, orchard fruit, and vanilla. Islay and other heavily peated malts add phenol: peat smoke, iodine, medicinal and maritime notes. Those phenols will dominate a citrus sour unless the recipe is written for them.",
    whatItIs:
      "Scotch whisky must be distilled in Scotland and aged at least three years in oak. The legally recognized categories include single malt (one distillery, malted barley, pot stills), single grain, and blends of those. Most bottles sold for mixing are blended Scotch: malt whisky for flavor plus column-distilled grain whisky for lightness and volume, bottled around 40–46% ABV.\n\nIn mixed drinks, blended Scotch behaves as a relatively restrained whiskey base for highballs (whisky and soda or ginger) and for sours. Heavily peated malt is closer to a seasoning — a float, rinse, or minority split — except in recipes such as the Penicillin that are designed around that aroma.",
    history:
      "Commercial blending in the 19th century, enabled by the Coffey still, made Scotch a consistent export and the whisky of the British highball. The Rob Roy (1890s) is a Manhattan built on Scotch instead of rye: whisky, sweet vermouth, and bitters.\n\nPeat in cocktails is largely a 21st-century technique. The Penicillin (Sam Ross, Milk & Honey, New York, 2005) splits the whisky: unpeated or lightly peated blended Scotch shaken with lemon and honey-ginger, with a heavily peated malt floated or used for aroma. That remains the practical model for using Islay in a sour without burying the citrus.",
    howToUse:
      "Use blended Scotch unless the recipe names a region or a peated malt. Highballs and a Rob Roy want the blend. For a Penicillin, mix on the gentler whisky and finish with a smoky malt so phenol is aromatic rather than the entire palate. Substituting Scotch into a bourbon Old Fashioned adds malt and possibly smoke in place of corn vanilla — a different drink, not a fault if that is intended. Peated malt in a standard whiskey sour will usually overwhelm lemon and sugar. Scotch is stable in the bottle; peat aroma holds.",
    funFact:
      "In the Penicillin the smoky Scotch functions as a concentrated aromatic, analogous to a rinse: most of the volume is lemon, honey-ginger, and a milder whisky.",
    pairsWith: ["lemon-juice", "honey-syrup", "ginger-syrup", "angostura-bitters"],
    signatureSlugs: ["penicillin"],
  },
  {
    slug: "irish-whiskey",
    seoTitle: "Irish Whiskey",
    seoDescription:
      "Whiskey distilled and aged in Ireland: blends versus pot still, how it drinks in sours and highballs, and MixWise recipes that call for it.",
    dek: "Whiskey distilled and aged in Ireland, often triple-distilled and lighter than rye or peated Scotch; pot-still styles have more texture than the familiar blends.",
    abv: "40–46%",
    origin: "Ireland (the island: Republic and Northern Ireland)",
    tastingNotes:
      "Honey, cereal, green apple, and a relatively soft oak spice. Blended Irish whiskey is light and approachable. Single pot still — a mash of malted and unmalted barley, unique to Ireland — is oilier, spicier, and closer to a mixing whiskey that can stand up in stirred drinks.",
    whatItIs:
      "Irish whiskey must be distilled on the island of Ireland and aged at least three years in wooden casks. Much commercial Irish whiskey is blended (pot still and/or malt plus grain) and is often triple-distilled, which tends to produce a lighter congener profile than typical American rye or Islay malt. Single pot still whiskey, made from mixed malted and unmalted barley in a pot still, is the historic Irish style and carries more body than supermarket blends.\n\nIn cocktails the blends excel in highballs and in whiskey sours that should drink softly. Stirred drinks built for rye’s dryness (Manhattan, Sazerac) go slack if a light blend is the only whiskey; a pot-still or higher-proof Irish bottle is the closer substitute.",
    history:
      "Irish pot-still whiskey was among the world’s most widely drunk spirits in the 19th century, filling a gap when phylloxera disrupted brandy. The 20th century — war, trade barriers after independence, Prohibition in the United States, and competition from blended Scotch — collapsed the industry to a handful of distilleries.\n\nCocktail revival bars leaned on rye and bourbon; Irish whiskey remained associated with Irish coffee (Foynes, 1940s, then San Francisco) and with highballs. Pot-still bottlings have returned to the mixing shelf as bartenders treat them as textured whiskey rather than as a merely soft pour.",
    howToUse:
      "Use Irish whiskey when the recipe names it, in whiskey-soda or ginger highballs, and in sours when a gentler grain profile is wanted. A light blend will not replace rye in a Manhattan: missing rye spice and new-char dryness, the vermouth will dominate. Pot-still Irish can work in Old Fashioned-family drinks with a fruitier, less vanilla-oak result than bourbon. Store as other whiskeys.",
    funFact:
      "Unmalted barley in the mash is the legal and sensory signature of Irish single pot still whiskey; it is not a requirement of Irish whiskey as a whole.",
    pairsWith: ["lemon-juice", "simple-syrup", "coffee-liqueur", "angostura-bitters"],
    signatureSlugs: ["whiskey-sour"],
  },
  {
    slug: "whiskey",
    aliases: ["whisky"],
    seoTitle: "Whiskey",
    seoDescription:
      "Whiskey in cocktails: how bourbon, rye, Scotch, and Irish differ, and which bottle to pour when a MixWise recipe says only whiskey.",
    dek: "Distilled grain aged in wood; when a recipe says only “whiskey,” it usually means American bourbon or rye, whose mash bill and barrel determine the drink.",
    tastingNotes:
      "Bourbon: corn sweetness, vanilla, caramel from new charred oak. Rye: pepper, spice, a drier finish. Blended Scotch: honey and grain, sometimes peat. Irish blends: often the lightest. These are related categories, not interchangeable in a Manhattan or a Penicillin.",
    whatItIs:
      "Whiskey (whisky) is spirit distilled from fermented grain and aged in wooden casks. The grain bill, distillation (pot versus column), and cask — new charred oak in American straight whiskey, reused oak for much Scotch and Irish — produce the differences that recipes are written around. MixWise drinks that name a style mean that style.\n\nRecipes that say only “whiskey” in the American cocktail tradition were generally written for bourbon or rye. Scotch and Irish whiskey keep their own highballs, sours, and named drinks (Rob Roy, Penicillin, Irish coffee). Substituting across categories changes oak, sweetness, and smoke, not merely the label.",
    history:
      "Nineteenth-century American mixed drinks were predominantly rye. Bourbon became the widely available supermarket whiskey in the 20th century. Scotch blending created a separate export highball culture; Irish whiskey, once dominant, receded and kept a smaller cocktail footprint.\n\nReading the recipe’s origin and era is often enough to choose a bottle: New York stirred drinks for rye, mid-century American sours for bourbon, a Rob Roy or Penicillin for Scotch.",
    howToUse:
      "If the line is unspecified, pour bourbon or rye — bourbon for rounder Old Fashioneds and sours, rye for Manhattans and drier stirred drinks. Add blended Scotch for a Rob Roy, a whisky highball, or a Penicillin; use Irish when named or when a softer sour or highball is intended. Cross-substituting is possible if a different aromatic structure is acceptable: peat does not stand in for new-oak vanilla, and a light Irish blend does not stand in for 51% rye.",
    funFact:
      "The spelling follows geography more than chemistry: whiskey in Ireland and the United States, whisky in Scotland and generally in Canada and Japan. The mash bill and the cask, not the presence or absence of an e, decide the cocktail.",
    pairsWith: ["angostura-bitters", "sweet-vermouth", "lemon-juice", "simple-syrup"],
    signatureSlugs: ["old-fashioned", "manhattan", "whiskey-sour"],
  },
  {
    slug: "tequila",
    seoTitle: "Tequila",
    seoDescription:
      "Mexican blue-agave distillate: 100% agave versus mixto, blanco versus reposado, and MixWise cocktails such as the Margarita and Paloma.",
    dek: "A Mexican denomination of origin for spirit distilled from Agave tequilana (blue Weber); 100% agave blanco is the usual cocktail base for the Margarita and Paloma.",
    abv: "35–40%",
    origin:
      "Mexico (Denominación de Origen: Jalisco and limited municipalities in Guanajuato, Michoacán, Nayarit, and Tamaulipas)",
    tastingNotes:
      "Blanco: cooked agave (sweet squash, pepper, citrus zest, mineral). Reposado adds light vanilla and oak from months in barrel. Añejo is woodier. Mixto (as little as 51% agave sugars, the rest usually cane) tastes flatter and hotter, with less agave and often more added glycerin or vanilla character.",
    whatItIs:
      "Tequila is an agave distillate produced only in a defined Mexican territory, from blue Weber agave (Agave tequilana). By law it must be at least 51% agave sugars; mixto may use other sugars for the remainder, while 100% agave (cien por ciento de agave) uses only agave. Most cocktail recipes assume the latter. Blanco (silver) is unaged or aged fewer than two months; reposado rests two months to a year in oak; añejo one to three years; extra añejo longer. Mexican law allows bottling from 35% ABV; export bottles are often 40%.\n\nBlanco is the base for agave sours and highballs because cooked-agave flavor and peppery heat remain visible beside lime. Reposado can occupy oak-friendly stirred drinks or a rounder sour. Añejo is primarily a sipping category unless a recipe asks for that wood.",
    history:
      "Agave distillation in western Mexico predates the modern denomination; tequila as a regulated origin is a 20th-century legal structure around a much older practice. The Margarita — tequila, orange liqueur, and lime, in sour proportions — coalesced in the mid-20th century in the US–Mexico borderlands; several origin stories (1930s–50s) compete, but the template is stable.\n\nThe Paloma — tequila, grapefruit soda, lime — is the highball widely drunk in Mexico, a longer, more forgiving build than the Margarita. Both drinks expose mixto tequila and bottled citrus immediately.",
    howToUse:
      "Use 100% agave blanco in Margaritas (sour family: spirit, citrus, orange liqueur or agave syrup) and Palomas (highball). Reposado if a slightly oaky sour or an agave Old Fashioned is wanted. Mixto will not supply the same agave note; the drink leans toward heat and sweetener. Substituting mezcal introduces pit-roast smoke the Margarita was not written for, which can be deliberate in a split pour. Tequila is stable; reposado and añejo are still spirits, not vermouth, but color and oak perfume are best kept out of strong light.",
    funFact:
      "In Mexico the Paloma is tequila’s everyday long drink, closer in use to a gin and tonic than to a shaken Margarita: built in the glass, grapefruit-forward, and meant to be refreshing rather than concentrated.",
    pairsWith: ["lime-juice", "triple-sec", "cointreau", "grapefruit-juice", "soda-water", "agave-syrup"],
    signatureSlugs: ["margarita", "paloma"],
  },
  {
    slug: "mezcal",
    seoTitle: "Mezcal",
    seoDescription:
      "Agave distillate, often pit-roasted: how smoke is produced, how it differs from tequila, and MixWise drinks such as the Mezcal Paloma.",
    dek: "Agave distillate, often from piñas roasted in earthen ovens, legally distinct from tequila; smoke is a production note and, in cocktails, often a seasoning as much as a base.",
    abv: "40–48%",
    origin: "Mexico (Denominación de Origen Mezcal, including Oaxaca and other designated states)",
    tastingNotes:
      "Cooked agave plus, in traditionally made mezcal, smoke from roasting the hearts in pit ovens. Espadín (Agave angustifolia) is the usual mixing profile: agave sweetness, pepper, campfire. Other agaves (tobalá, tepextate, and so on) can be intensely mineral, herbal, or savory and will steer a cocktail more than a sour’s citrus can correct.",
    whatItIs:
      "Mezcal is a denomination of origin for agave spirit produced in specified Mexican states. Tequila is a separate DO with tighter botanical and geographic rules (blue Weber only, different territory); it is not labeled mezcal, though both are agave distillates. Traditional mezcal production roasts agave hearts (piñas) in earthen pits lined with wood and stone, then ferments and distills, often in copper or clay. The smoke associated with mezcal comes from that roast, not from a post-distillation additive.\n\nIn the glass mezcal may be a full base — a Paloma or Margarita built entirely on it — or a split with blanco tequila, or a rinse, mirroring how peated whisky is used. Espadín at typical cocktail proof (about 40–48% ABV) is the workhorse; high-proof, small-batch wild-agave bottles are closer to sipping spirits.",
    history:
      "Village-scale agave distillation in Oaxaca and elsewhere is older than mezcal’s cocktail-bar identity. Export bottling and US bar culture, especially from the late 2000s, put mezcal into Palomas, Last Word variations, and Negroni-family drinks. The Oaxaca Old Fashioned (Phil Ward, New York, 2007) — reposado tequila, mezcal, agave syrup, bitters — was an early template for treating mezcal as a measured component rather than a novelty pour.\n\nThe category’s cocktail use is thus recent relative to gin or whiskey, even though the agricultural practice is not.",
    howToUse:
      "Espadín mezcal can replace tequila in a Paloma or Margarita when smoke is wanted, or split 1:1 with blanco tequila so agave remains and phenol does not monopolize the sour. In stirred drinks, start with a smaller mezcal fraction (as in an Oaxaca Old Fashioned) unless the bottle is mild. A very savory or high-proof mezcal behaves like a peated malt: better as aroma or a split than as the sole two-ounce base in a citrus drink. Store like other spirits; smoke and agave notes are stable.",
    funFact:
      "The smoke in traditionally made mezcal is a Maillard-and-combustion note from roasting the piña; it is not liquid smoke and is not required of every legally labeled mezcal, though it is what most cocktail recipes are asking for.",
    pairsWith: ["lime-juice", "grapefruit-juice", "tequila", "campari", "green-chartreuse"],
    signatureSlugs: ["mezcal-paloma", "paloma", "margarita"],
  },
  {
    slug: "rum",
    seoTitle: "Rum",
    seoDescription:
      "Sugarcane distillate from molasses or fresh juice: light versus aged styles, and MixWise cocktails such as the Daiquiri and Mojito.",
    dek: "Spirit distilled from sugarcane — molasses or fresh juice — ranging from light column-still mixing rum to heavy pot-still and agricole styles; white rum for Cuban sours, darker rum when molasses and oak are wanted.",
    abv: "40–49%",
    origin: "Caribbean, Latin America, and other sugarcane-producing regions",
    tastingNotes:
      "Light/white: cane, lime zest, grass, light floral notes. Aged Spanish-style: vanilla, oak, caramel. Jamaican pot still: high-ester funk — overripe banana, pineapple, olive, solvent. Martinique agricole (fresh cane juice): grassy, herbal, dry. These do not substitute one-for-one.",
    whatItIs:
      "Rum is distilled from fermented sugarcane, either molasses (the majority of cocktail rum) or fresh cane juice (rhum agricole and related styles). Production spans column stills that yield a light, mixable spirit and pot stills that retain heavier congeners; many bottles are blends of both. Aging, caramel coloring, and dosage vary by tradition: Spanish-style (Cuba, Puerto Rico, Panama), English-style (Jamaica, Barbados, Guyana), and French agricole (Martinique AOC and others) are the useful map, not the words “white” and “dark” alone.\n\nA bar that covers MixWise recipes typically needs a clean white rum for Daiquiris and Mojitos and an aged or darker molasses rum for drinks that want weight. Jamaican high-ester rum is a third, used as a portion of the base in tiki builds and in sours that should taste of tropical fermentation.",
    history:
      "Sugarcane distillation followed the colonial plantation economy across the Caribbean and Atlantic. The Daiquiri — rum, lime, and sugar, a sour — is associated with Cuba around the turn of the 20th century and was refined in Havana bars such as El Floridita. The Mojito is the same rum-lime-sugar idea with mint and soda, a highball with older Cuban roots.\n\nMid-century tiki (Donn Beach, Trader Vic) layered several rums in one glass to approximate complexity that a single light rum cannot provide. British navy punches had already used darker, heavier rums for body. Matching style to template matters more than the color word on the label.",
    howToUse:
      "If the recipe says light, white, or silver, use a rum that still tastes of cane, not a vodka-like filter job. Dark, aged, or black usually means molasses and oak (or blackstrap); using that in a classic Daiquiri produces an aged rum sour, a legitimate variant but not the Cuban original. Jamaican funk in a Mojito will read as overripe fruit against mint. Spiced rum adds vanilla and sweet baking spice that a Daiquiri recipe does not account for. Rum is stable; very old sipping rums lose nuance in punch, not because the chemistry fails, but because oak and age are diluted.",
    funFact:
      "The Daiquiri in its classic form is a shaken sour — rum, lime, and sugar — not a frozen blender drink. The blender version is a later service style of the same template.",
    pairsWith: ["lime-juice", "mint", "simple-syrup", "soda-water", "ginger-beer", "orgeat-syrup"],
    signatureSlugs: ["daiquiri", "mojito"],
  },
  {
    slug: "white-rum",
    aliases: ["light-rum"],
    matchNames: ["light rum"],
    seoTitle: "White Rum",
    seoDescription:
      "Unaged or filtered-pale rum: how it differs from dark rum, and the MixWise drinks that need it — Daiquiri, Mojito, and other rum sours.",
    dek: "Rum that is unaged, briefly aged, or aged and then filtered pale; the standard base for the Daiquiri and Mojito.",
    alsoCalled: "Light rum; silver rum.",
    abv: "40%",
    origin: "Caribbean (especially the Cuban and Spanish-style tradition)",
    tastingNotes:
      "Cane, citrus peel, light floral and grassy notes. A useful white rum still tastes like rum. Heavily charcoal-filtered molasses rum can be almost neutral; in a Daiquiri that leaves lime and sugar without a middle.",
    whatItIs:
      "White, light, or silver rum is defined by appearance, not by a single production method. Some is unaged column-still distillate; much Cuban- and Puerto Rican-style rum is aged in oak and then filtered to remove color, so it can carry more congener weight than its paleness suggests. Fresh-cane agricole blanc is a different, grassier spirit at the same color.\n\nIt is the mixing default for Cuban-style sours and highballs. Recipes that specify light rum are asking for this pale profile, not for spiced rum or a dark molasses rum.",
    history:
      "Cuban light rum and the Daiquiri developed together in the late 19th and early 20th centuries, as column stills and aging-plus-filtration produced a clean but not empty cane spirit. The Mojito uses the same rum with mint and soda.\n\nIn the later US market, “white rum” often meant heavily rectified, charcoal-filtered molasses rum designed for invisibility in cola. That style is adequate in a highball and thin in a sour, which is why Cuban-style or characterful white rums are specified when the lime is meant to have something to stand on.",
    howToUse:
      "Use white rum whenever the recipe says light, white, or silver: Daiquiri (shaken sour), Mojito (mint highball), and related rum-citrus drinks. Substituting aged or dark rum adds oak and molasses and makes a different sour; substituting agricole blanc adds grass and dryness. Neutral well rum will not spoil a highball but will make a Daiquiri taste primarily of limeade. No special storage beyond a capped bottle.",
    funFact:
      "Much “white” rum has seen oak; the color is stripped by charcoal filtration after aging. Paleness is not proof of youth.",
    pairsWith: ["lime-juice", "mint", "simple-syrup", "soda-water"],
    signatureSlugs: ["daiquiri", "mojito"],
  },
  {
    slug: "dark-rum",
    seoTitle: "Dark Rum",
    seoDescription:
      "Aged or caramel-colored rum: why “dark” is not a legal category, and MixWise drinks that want molasses weight rather than a pale Daiquiri rum.",
    dek: "An imprecise label for rum with color and weight from aging, molasses, or added caramel; used when a recipe wants body rather than a pale Cuban sour.",
    abv: "40–43%",
    tastingNotes:
      "Brown sugar, banana, oak, baking spice; some bottles add smoke. Black rum and blackstrap styles are intensely molasses-dark and salty-sweet — a teaspoon can tint and flavor a drink that a full pour of gold rum would not.",
    whatItIs:
      "“Dark rum” is a commercial description, not a legal category. It may mean rum aged long enough to take color from oak, rum with added caramel coloring, pot-still molasses rum, Demerara, or blackstrap rum with a heavy sugar-byproduct character. It is not white Daiquiri rum and it is not the same as spiced rum, which is a flavored product.\n\nIn recipes the term usually asks for molasses weight and some oak, to give punches, ginger highballs, and tiki builds a mid-palate. An aged mixing rum (Spanish-style añejo or a solid Jamaican or Barbadian age-stated rum) does more work than a bottle whose only trait is color.",
    history:
      "British naval and plantation punches used darker, heavier rums for body and keeping quality. Cuban sours went the other direction, toward pale rum. Mid-century tiki recipes often call for “dark” or “gold” rum alongside a light rum so the drink has both lift and bass.\n\nMatching the rum to that template — punch and tiki versus Cuban sour — is more reliable than trusting the word “dark,” which manufacturers use inconsistently.",
    howToUse:
      "Use dark or aged rum in punches, in drinks with ginger or spice, and as the heavy fraction in tiki blends. Keep white rum for Daiquiris and Mojitos. Blackstrap is a modifier in small amounts: it will stain and dominate if used as a two-ounce base. Substituting dark rum into a classic Daiquiri yields an aged rum sour; substituting white into a drink built for dark rum leaves the cocktail thinner and less molasses-sweet. Stable on the shelf.",
    funFact:
      "Caramel coloring (E150a) is permitted in many rum traditions and can make a young rum look aged. Color is not a reliable proxy for years in oak.",
    pairsWith: ["lime-juice", "ginger-beer", "pineapple-juice", "orgeat-syrup"],
    signatureSlugs: ["daiquiri", "mojito"],
  },
  {
    slug: "cognac",
    seoTitle: "Cognac",
    seoDescription:
      "Grape brandy from the Cognac appellation: VS versus VSOP for mixing, and MixWise cocktails such as the Sidecar and Vieux Carré.",
    dek: "Grape brandy from the Cognac appellation in France, double-distilled in copper pot stills and aged in French oak; VS is the usual mixing grade.",
    abv: "40%",
    origin: "Cognac, France",
    tastingNotes:
      "Dried fruit, grape flower, oak, spice; older cognac develops rancio (nutty, mushroom, oxidative richness). VS is fruitier and more fiery; VSOP and above are smoother and more oak-driven. Mixing VS should still taste of grape, not only of ethanol and caramel.",
    whatItIs:
      "Cognac is brandy — distilled wine — produced in the Cognac region under appellation rules: primarily ugni blanc, double-distilled in Charentais pot stills, and aged in French oak. Age statements on the label refer to the youngest eau-de-vie in the blend: VS at least two years, VSOP at least four, XO at least ten (since 2018). Cocktail recipes that specify Cognac generally mean a VS or an inexpensive VSOP, not an XO sipping blend.\n\nIt is a fruit-forward, moderately tannic base for the Sidecar (cognac sour with orange liqueur and lemon), for brandy Old Fashioned-family drinks, and for stirred composites such as the Vieux Carré. Generic brandy can occupy the same templates with less floral grape character.",
    history:
      "Cognac was a major export spirit long before it was a cocktail ingredient; 19th-century punches, slings, and sours used brandy as readily as whiskey. Phylloxera in French vineyards and the rise of cheaper grain whiskey in the United States reduced brandy’s place on the American bar.\n\nThe Sidecar — cognac, orange liqueur, lemon — is an early-20th-century sour (Paris or London, World War I era). The Vieux Carré (Hotel Monteleone, New Orleans, 1930s) splits cognac with rye. Those drinks assume grape brandy’s dried-fruit register, not bourbon’s corn vanilla.",
    howToUse:
      "Use VS or mixing-grade VSOP in Sidecars and other brandy sours, in punches, and in stirred drinks that name cognac. Substituting American whiskey yields a whiskey sour or Boulevardier-adjacent drink without grape or rancio. Armagnac is a legitimate, often more rustic alternative (typically single-distilled). XO in a shaker is chemically fine; lemon and liqueur mute the aging nuance the extra years paid for. Store upright, like other spirits.",
    funFact:
      "Rancio is a tasting term for the nutty, oxidative richness that develops in long-aged cognac; it is a mark of age, not a fault, and it is largely lost in a sour.",
    pairsWith: ["lemon-juice", "cointreau", "triple-sec", "sweet-vermouth", "angostura-bitters"],
    signatureSlugs: [],
  },
  {
    slug: "brandy",
    seoTitle: "Brandy",
    seoDescription:
      "Distilled wine in cocktails: how generic brandy relates to Cognac and Armagnac, and MixWise drinks that use grape spirit in sours and punches.",
    dek: "Spirit distilled from wine; Cognac and Armagnac are the principal French appellations, but American and Spanish brandies occupy the same sour and punch templates.",
    abv: "35–40%",
    tastingNotes:
      "Dried fruit, vanilla, grape, oak. Better brandy still tastes of wine distillate. Cheap brandy can be woody, sugary, and hot — usable in a large punch, rough in a short sour where it has nowhere to hide.",
    whatItIs:
      "Brandy, in the cocktail sense, is distilled wine, typically aged in oak. Cognac and Armagnac are geographic French versions with their own stills and grapes; Spanish brandy de Jerez is often aged in solera systems previously used for Sherry; American brandy is commonly Californian column or pot distillate. Apple brandy is a separate fruit brandy (see Apple Brandy).\n\nWhen a MixWise recipe says brandy, it wants grape spirit in the sour, punch, or Old Fashioned family — a decent VS Cognac or a clean American brandy. The category is a base spirit, not a liqueur; flavored brandy products are a different ingredient.",
    history:
      "Brandy punches and slings were central to 18th- and 19th-century drinking in Europe and colonial America, when grape distillate was the prestige mixing spirit. As whiskey became cheaper in the United States, brandy receded into after-dinner and winter service.\n\nIt remains one of the more coherent sour bases: grape and oak sit beside lemon in the same way whiskey’s grain and oak do, with a fruit register instead of corn or rye. The Sidecar is the modern shorthand for that sour.",
    howToUse:
      "Use brandy in Sidecar-shaped drinks (spirit, orange liqueur, lemon), in punches, and wherever it is named. Substituting whiskey replaces grape with grain and, if the whiskey is bourbon, adds new-char vanilla. Substituting cognac for generic brandy is an upgrade in definition rather than a change of template. Fruit-flavored brandy liqueurs will not behave as dry grape brandy. Shelf-stable; cheaper bottles may show more sugar, which will sweeten a sour unless the syrup is cut.",
    funFact:
      "Phylloxera in late-19th-century French vineyards disrupted brandy supply and helped grain whiskey take brandy’s place on many American bars.",
    pairsWith: ["lemon-juice", "cointreau", "sweet-vermouth", "angostura-bitters"],
    signatureSlugs: [],
  },
  {
    slug: "apple-brandy",
    seoTitle: "Apple Brandy",
    seoDescription:
      "Distilled cider — American applejack and Calvados — in cocktails: orchard fruit in sours, the Jack Rose, and Old Fashioned-family drinks.",
    dek: "Brandy distilled from cider; American applejack and Calvados (Normandy) supply orchard fruit to sours, the Jack Rose, and Old Fashioned-family drinks.",
    abv: "40–50%",
    origin: "Normandy (Calvados); United States (applejack)",
    tastingNotes:
      "Baked apple, dry cider, peel, oak. Bonded American apple brandy is higher-proof and more aggressive. Calvados, especially from pays d’Auge, can be more floral and refined, with aged examples showing oxidative apple and spice rather than candy.",
    whatItIs:
      "Apple brandy is fermented apple juice (cider) distilled and, in the styles used for cocktails, aged in wood. Calvados is the Norman appellation. American applejack, historically associated with New Jersey, was once produced in part by freeze concentration (“jacking”); modern commercial applejack is distilled. Bonded American apple brandy (50% ABV) is the cocktail benchmark: dry, apple-forward, and strong enough for stirred drinks.\n\nIt occupies the same structural roles as grape brandy or whiskey — sour base, Old Fashioned base, split with whiskey — while contributing orchard fruit without apple juice’s pectin and acidity.",
    history:
      "Apple spirits are among the oldest American distillates, predating bourbon as a common farm product in the Mid-Atlantic. The Jack Rose — apple brandy, citrus (lemon or lime), and grenadine — was a standard in the early 20th century, named perhaps for the Jacqueminot rose or for a period figure; it faded as applejack left the default back bar.\n\nCalvados entered mixed drinks more as a regional brandy than as a sour staple, but it slots into the same Jack Rose and apple Old Fashioned templates.",
    howToUse:
      "Use bonded apple brandy or a mixing Calvados in the Jack Rose, in apple Old Fashioneds (spirit, sugar, bitters), and in sours where orchard notes should replace whiskey’s grain. Substituting bourbon removes apple and adds corn vanilla; substituting grape brandy keeps the sour structure but loses cider character. Unaged or very young apple spirit can taste more like cider ethanol than like baked apple; aged bottles mix more coherently. Store as other brandies.",
    funFact:
      "Colonial applejack was sometimes concentrated by freezing cider and removing ice, which raises alcohol without a still; that method is not how modern bonded apple brandy is made.",
    pairsWith: ["lemon-juice", "lime-juice", "grenadine", "angostura-bitters", "sweet-vermouth"],
    signatureSlugs: [],
  },
  {
    slug: "pisco",
    seoTitle: "Pisco",
    seoDescription:
      "Unaged (Peruvian) or wood-optional (Chilean) grape brandy: how the two denominations differ, and MixWise cocktails built on the Pisco Sour.",
    dek: "Grape brandy from Peru or Chile, typically unaged in the Peruvian style; the aromatic base of the Pisco Sour.",
    abv: "40–43%",
    origin: "Peru and Chile (separate denominations of origin)",
    tastingNotes:
      "Floral grape, citrus peel, herb; some varietals (Italia, Torontel, Moscatel) are highly aromatic, while Quebranta is earthier and less perfumed. Peruvian pisco is unaged in wood and shows the grape clearly. Chilean pisco may see oak, which rounds and slightly vanillin-coats the same idea.",
    whatItIs:
      "Pisco is grape brandy produced under Peruvian or Chilean rules, which do not agree. Peruvian pisco is distilled to bottling strength (no water added after distillation under the usual reading of the rules), made from specified grapes, and may not be aged in wood that imparts flavor — it rests in glass, stainless steel, or other neutral vessels. Chilean pisco allows different grapes, dilution, and wood aging.\n\nIt is an unaged (or lightly wood-influenced) fruit brandy used as a sour base. The Pisco Sour — pisco, lime, sugar, egg white, aromatic bitters dotted on the foam — is the drink that justifies the bottle on most bars. The spirit’s perfume is what the template is built to display.",
    history:
      "Grape distillation in the Andes followed Spanish colonial viticulture; Peru and Chile both claim the name and maintain separate legal definitions. The Pisco Sour is an early-20th-century drink. Victor Vaughen Morris’s bar in Lima (1920s) is the most cited origin; Chilean and Californian claims exist as well. The bitters-dotted egg-white foam is the contemporary presentation.\n\nUnlike aged brandy sours, the Pisco Sour depends on a clear, floral distillate and fresh lime. It is a member of the sour family, not a novelty shooter.",
    howToUse:
      "Shake the sour hard, with egg white if foam is wanted (a dry shake then ice is the usual texture method). Fresh lime is required; bottled juice flattens an aromatic spirit. Peruvian pisco is the mixing default in most English-language recipes. Chilean pisco will work but may taste oakier. Substituting vodka removes grape aromatics; substituting gin adds juniper the sour was not balanced for. Pisco is stable; the aromatics are why it is opened for this drink rather than for a highball.",
    funFact:
      "Peruvian pisco may not take flavor from wood; the grape character in a Pisco Sour is distillate, not barrel. Chilean rules are more permissive of oak.",
    pairsWith: ["lime-juice", "lemon-juice", "simple-syrup", "egg", "angostura-bitters"],
    signatureSlugs: [],
  },
  {
    slug: "absinthe",
    seoTitle: "Absinthe",
    seoDescription:
      "High-proof wormwood and anise spirit: rinse versus pour, the louche, and MixWise cocktails such as the Sazerac that use it as perfume.",
    dek: "A high-proof anise spirit flavored with grande wormwood (Artemisia absinthium), green anise, and fennel; in cocktails almost always a rinse or dashes, not a full base pour.",
    abv: "45–72%",
    origin: "Val-de-Travers, Switzerland; popularized in France (Pontarlier)",
    tastingNotes:
      "Green anise and fennel (licorice, sweet herb), wormwood’s dry bitterness, other culinary herbs, and high-proof heat. A glass rinse perfumes a Sazerac. A full ounce in a sour will bury citrus and the other spirits.",
    whatItIs:
      "Absinthe is a high-proof spirit whose essential botanical triad is grande wormwood, green anise, and fennel, usually with additional herbs, distilled (in traditional production) rather than merely compounded with oils. Typical bottling strength is 45–72% ABV. The pale green color of verte absinthe comes from a secondary maceration of herbs; blanche absinthe is uncolored. The clouding that appears when water is added — the louche — is anise essential oils (chiefly anethole) coming out of solution as ethanol concentration drops.\n\nIn mixed drinks absinthe is almost never the two-ounce base. It is a perfume: a rinse, an atomizer spray, or a few dashes, as in the Sazerac and the Corpse Reviver No. 2. The traditional service is a drip of iced water over sugar, which is a drink in itself, not a cocktail mixing method.",
    history:
      "Commercial absinthe coalesced in the late 18th century in the Val-de-Travers (Switzerland) and became a mass French product in the 19th century, especially around Pontarlier. Associated with café culture and, later, with moral panic over wormwood and thujone, it was banned in Switzerland (1910), the United States (1912), and France (1915). Modern EU and US rules again permit wormwood spirits with thujone limits; legal absinthe returned to the US market in 2007.\n\nThe Sazerac — New Orleans, 19th century, originally cognac, later rye, with absinthe rinsing the glass, Peychaud’s bitters, and sugar — is the cocktail that kept the ingredient in professional use through the ban years via substitutes (Herbsaint, Pernod). The rinse is the practical legacy: aroma, not a glass of neat green spirit.",
    howToUse:
      "Coat a chilled glass with a few milliliters, discard the excess, then build the drink (Sazerac). Or add dashes to a sour or equal-parts drink (Corpse Reviver No. 2). Substituting anise liqueur (Pernod, Herbsaint, pastis) approximates the aroma at lower proof and without wormwood bitterness; the drink will be sweeter. Do not replace gin with absinthe in a martini-shaped drink unless the result is meant to be an absinthe cocktail. Store like other high-proof spirits; the louche appears only when diluted, and is not required in a rinse.",
    funFact:
      "The louche is a physical effect: hydrophobic anise oils emulsify as the solution falls below a critical alcohol percentage. It is a sign of those oils, not of sugar or dye, and it is irrelevant to a Sazerac rinse, where the absinthe is not diluted in the glass as a cloudy drink.",
    pairsWith: ["rye-whiskey", "cognac", "gin", "lemon-juice", "green-chartreuse"],
    signatureSlugs: [],
  },
];
