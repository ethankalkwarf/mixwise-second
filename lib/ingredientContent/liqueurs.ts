import type { IngredientGuide } from "./types";

export const LIQUEUR_GUIDES: IngredientGuide[] = [
  {
    slug: "campari",
    seoTitle: "Campari",
    seoDescription:
      "What Campari is: a proprietary Italian bitter aperitivo, how it differs from Aperol, and the cocktails built on it — Negroni, Boulevardier, Americano.",
    dek: "A proprietary Italian bitter aperitivo: a flavored and colored spirit-based product in the amaro and aperitivo family, bottled at 24% ABV in the United States and typically 28.5% in Italy.",
    alsoCalled: "Italian bitter aperitivo; the bitter component of a Negroni.",
    abv: "24% (United States) / 28.5% (Italy)",
    origin: "Novara, then Milan, Italy",
    tastingNotes:
      "Gentian bitterness, bitter orange peel, and a cherry-cola spice that can read as medicinal. The finish is drying rather than sugary; sweetness is present but does not lead.\n\nBecause the bitterness is structural, an equal-parts drink will taste unmoored if the gin is underproof or the vermouth is oxidized. That is a mixing problem, not a flaw in the aperitivo.",
    whatItIs:
      "Campari is a proprietary Italian bitter aperitivo: a spirit-based infusion of herbs, peels, and bittering agents (gentian is the usual public citation), sweetened and colored. It belongs to the amaro and aperitivo family, not to the cordial or crème tradition. The formula is a trade secret; the producer has described it as containing more than sixty botanicals. In the United States the bottling is 24% ABV; in Italy it is typically 28.5%. Those are the same recipe at different strengths, not different products.\n\nIt is not interchangeable with Aperol. Aperol is lower in alcohol, sweeter, and built around orange and rhubarb. Campari is drier, more bitter, and the bottle a Negroni is written for. In mixed drinks it supplies bitterness, color, and a citrus-peel mid-palate that sweet vermouth and a base spirit then frame.",
    history:
      "Gaspare Campari (1828–1882) formulated the recipe in 1860 in Novara, originally in the Dutch-bitter style then fashionable in Italian caffè culture. He later established the brand in Milan, including a caffè in the Galleria Vittorio Emanuele II from 1867. The Milano-Torino — Campari and sweet vermouth, named for the two cities — became the Americano when soda water was added, a lengthening associated with American visitors in the late nineteenth and early twentieth centuries.\n\nThe Negroni, equal parts gin, Campari, and sweet vermouth, is generally dated to Florence around 1919–1920, when Count Camillo Negroni is said to have asked Caffè Casoni to replace the Americano’s soda with gin. The Boulevardier, documented in Paris in the 1920s and associated with Erskine Gwynne, applies the same equal-parts bitter-and-vermouth architecture to American whiskey.",
    howToUse:
      "The Negroni is equal parts gin, Campari, and sweet vermouth, stirred, served over ice or up, with an orange peel. The Boulevardier substitutes bourbon or rye for gin. The Americano is Campari and sweet vermouth lengthened with soda. If bitterness dominates, reduce Campari by a quarter-ounce or lengthen with soda; orange juice turns the drink into a different, sweeter highball.\n\nAperol cannot replace Campari at equal measure without collapsing the bitterness and proof those templates assume. Store the bottle upright, away from heat and light. After opening, refrigeration slows the fading of citrus aromatics. Campari is more stable than vermouth, but it is still a flavored product, not a neutral spirit.",
    funFact:
      "Until 2006 Campari was colored with carmine derived from cochineal. The current red is synthetic; the company treats the botanical formula as otherwise unchanged.",
    pairsWith: ["gin", "sweet-vermouth", "bourbon", "rye-whiskey", "soda-water", "orange-peel"],
    signatureSlugs: ["negroni", "boulevardier", "americano"],
  },
  {
    slug: "aperol",
    seoTitle: "Aperol",
    seoDescription:
      "What Aperol is: an 11% Italian aperitivo, how it differs from Campari, and the 3-2-1 Aperol Spritz template.",
    dek: "An Italian aperitivo liqueur at 11% ABV, flavored with bitter orange, rhubarb, and gentian: milder and sweeter than Campari, not a reduced-strength substitute for it.",
    abv: "11%",
    origin: "Padua, Italy",
    tastingNotes:
      "Sweet orange, rhubarb, and a gentle bitter finish. The bitterness is real but modest; sugar and orange lead. At 11% ABV the liquid drinks closer to a fortified wine than to Campari.\n\nIt is too light in both proof and bitterness to stand in for Campari in equal-parts stirred drinks. In a spritz, that lightness is the design.",
    whatItIs:
      "Aperol is an Italian aperitivo: a flavored, colored, spirit-based product bottled at 11% ABV. The producer associates the recipe with bitter orange, rhubarb, gentian, and cinchona. It is an aperitivo in the same broad family as Campari, not a triple sec and not Campari at lower strength.\n\nCampari remains drier, more bitter, and more than twice the alcohol. Substituting Aperol into a Negroni produces a sweeter, softer, less structurally bitter drink. That result is a different cocktail, sometimes served as a light Negroni, not the original.",
    history:
      "Brothers Luigi and Silvio Barbieri launched Aperol in Padua in 1919 through their family’s distillery. Gruppo Campari acquired the brand in 2003 and spent the following decade making the Aperol Spritz an international template.\n\nThe Venetian spritz is older than Aperol: wine or sparkling wine lengthened with soda and a bitter. The now-standard 3-2-1 build — three parts prosecco, two parts Aperol, one part soda — is a later commercial standardization, not a nineteenth-century recipe.",
    howToUse:
      "Build an Aperol Spritz in a wine glass over ice: three parts prosecco, two parts Aperol, one part soda water, garnished with an orange slice. Add the sparkling wine last; do not shake. Keep the bottle refrigerated after opening. At 11% ABV it is closer to a fortified wine than to a spirit in its vulnerability to oxidation and aroma loss.\n\nDo not substitute Aperol one-for-one for Campari in a Negroni or Boulevardier if the goal is those drinks’ bitterness and proof. The reverse substitution, Campari in a spritz, yields a drier, more aggressive highball, which some drinkers prefer and which should be named as such.",
    funFact:
      "Extra Dry on a Prosecco label is not fully dry. For a less sweet spritz, Brut prosecco and a full measure of soda affect the drink as much as the Aperol does.",
    pairsWith: ["prosecco", "soda-water", "orange-peel", "gin", "campari"],
    signatureSlugs: ["aperol-spritz"],
  },
  {
    slug: "cointreau",
    seoTitle: "Cointreau",
    seoDescription:
      "What Cointreau is: a 40% French triple sec distilled from orange peels, how it differs from generic triple sec and Grand Marnier, and the sours that assume it.",
    dek: "A French triple sec: a dry orange liqueur distilled from sweet and bitter orange peels and bottled at 40% ABV.",
    abv: "40%",
    origin: "Angers, France",
    tastingNotes:
      "Bright orange-peel oil, clean alcohol, and less syrup than inexpensive triple sec. The impression is citrus zest rather than orange candy, with a dry finish for a liqueur.\n\nGrand Marnier, by contrast, tastes of marmalade, vanilla, and cognac oak. The two share orange and 40% ABV; they do not share a base spirit or a texture.",
    whatItIs:
      "Cointreau is a brand of triple sec produced in Angers: a clear orange liqueur made by macerating and distilling dried sweet and bitter orange peels with neutral spirit, then sweetening. It is bottled at 40% ABV. Triple sec is the category; Cointreau is a specific, relatively dry, full-strength example of that category.\n\nIt is not Grand Marnier. Grand Marnier is cognac blended with orange distillate. Inexpensive triple secs at 15–20% ABV occupy the same recipe line but contribute more sugar and water than peel and proof. In a Margarita, Sidecar, or Cosmopolitan written for a 40% orange liqueur, that difference is structural.",
    history:
      "The Cointreau distillery was founded in Angers in 1849 by Adolphe and Édouard-Jean Cointreau. Édouard Cointreau created the current-style orange liqueur in 1875, originally sold as Cointreau Triple Sec. Combier in Saumur claims an earlier triple sec, dated 1834 in the firm’s account; the two houses define the French dry-orange style.\n\nThe Sidecar (cognac, orange liqueur, lemon) and the Margarita (tequila, orange liqueur, lime) both depend on a dry, high-proof orange liqueur to bridge spirit and citrus. When the orange component is a low-alcohol cordial, the drink loses both strength and peel character.",
    howToUse:
      "Use Cointreau in sours that specify orange liqueur. A common Margarita is two parts tequila, one part Cointreau, and one part lime (or a slightly tighter 2:0.75:0.75). The Sidecar is the same architecture with cognac and lemon. The Cosmopolitan is vodka, Cointreau, lime, and cranberry. A well-made 40% triple sec or dry curaçao is the closest substitute; Grand Marnier will make the drink heavier and more cognac-like.\n\nThe bottle is shelf-stable. Store it as you would a spirit, tightly capped and away from heat. Orange oils fade slowly after opening; there is no refrigeration requirement comparable to vermouth.",
    funFact:
      "Cointreau’s 40% bottling is why many printed Margarita specifications assume orange liqueur can carry alcohol, not only sweetness. A 15% triple sec in the same measure underproofs the drink.",
    pairsWith: ["tequila", "lime-juice", "lemon-juice", "cognac", "vodka"],
    signatureSlugs: ["margarita", "cosmopolitan"],
  },
  {
    slug: "triple-sec",
    seoTitle: "Triple Sec",
    seoDescription:
      "What triple sec is as a category, how it relates to Cointreau, curaçao, and Grand Marnier, and when a 40% bottle changes a sour.",
    dek: "The generic category of clear orange liqueurs flavored with orange peel; alcohol ranges from cordial strength to 40% ABV.",
    abv: "15–40%",
    origin: "France",
    tastingNotes:
      "The range runs from orange candy and thin syrup at the low-proof end to orange-peel oil and a dry finish at 40% ABV. Brand matters more here than in most liqueur categories.\n\nA 40% triple sec behaves in a shaker much like Cointreau. A 15–20% bottle behaves like a sweetener with orange flavor.",
    whatItIs:
      "Triple sec is a category, not a single recipe: clear or nearly clear orange liqueurs produced by macerating or redistilling orange peel with neutral spirit and adding sugar. The name is usually explained as “triple dry,” referring either to a dry style or to a historical distillation practice. Alcohol by volume ranges from about 15% in inexpensive cordial-style bottles to 40% in Cointreau and Combier.\n\nCointreau is triple sec. Grand Marnier is not: it is a cognac-based orange liqueur. Curaçao is a related historical style, originally associated with the dried peels of the Laraha orange from Curaçao. Dry curaçao sits closer to nineteenth-century orange liqueur than to supermarket triple sec.",
    history:
      "French distillers in the Loire valley, notably Combier in Saumur and Cointreau in Angers, established the dry orange liqueur that later cocktail books treat as the default. Triple sec then became the trade and supermarket name for a wide quality band.\n\nClassic sours from the late nineteenth and early twentieth centuries that call for orange curaçao or triple sec assume a dry, reasonably strong bottle. Mid-century American well drinks often used a sweeter, weaker product, which is why house Margarita specifications and book specifications often diverge.",
    howToUse:
      "In a Cosmopolitan or a pitcher Margarita, a mid-strength triple sec will function. In a drink built on 100% agave tequila and fresh lime, a 40% triple sec or Cointreau keeps both the proof and the peel. Substituting Grand Marnier adds cognac and oak. Substituting a 15% bottle adds sugar and water and will make the same measure taste flatter and sweeter.\n\nStore as a liqueur: cool, dark, tightly capped. Low-ABV bottles oxidize and dull faster than 40% ones. Refrigeration is optional and more useful at the bottom of the strength range.",
    funFact:
      "When a serious cocktail book lists triple sec without a brand, it usually means the dry, 40% style, not the lowest-proof orange cordial on the shelf.",
    pairsWith: ["lime-juice", "tequila", "vodka", "lemon-juice"],
    signatureSlugs: ["margarita", "cosmopolitan"],
  },
  {
    slug: "grand-marnier",
    seoTitle: "Grand Marnier",
    seoDescription:
      "What Grand Marnier is: cognac blended with bitter-orange distillate, how it differs from Cointreau and triple sec, and when a recipe wants that weight.",
    dek: "A French orange liqueur made by blending cognac with a distillate of bitter orange peels; it is not a triple sec.",
    abv: "40%",
    origin: "Neauphle-le-Château, France",
    tastingNotes:
      "Orange marmalade, cognac oak, vanilla, and more weight on the palate than Cointreau. The orange is cooked and candied in impression rather than zest-bright.\n\nThat extra body can round a Margarita or Sidecar. It is surplus to a Daiquiri-shaped drink that wants only rum, lime, and sugar, and it will muddy a Cosmopolitan.",
    whatItIs:
      "Grand Marnier Cordon Rouge is a blend of cognac and distilled essence of Caribbean bitter orange (Citrus aurantium), sweetened and bottled at 40% ABV. Louis-Alexandre Marnier-Lapostolle created it in 1880. Because the base is brandy rather than neutral spirit, it is classified with orange liqueurs but not with triple sec.\n\nCointreau is drier, clearer in peel character, and has no oak. In a Margarita the substitution is sometimes sold as a Cadillac Margarita; the drink becomes rounder and less sharp. In a Cosmopolitan the same swap pulls the cocktail toward brandy and away from cranberry-lime.",
    history:
      "Marnier-Lapostolle introduced Cordon Rouge in 1880 as a luxury orange liqueur for the European table and café. It entered American restaurant bartending as a premium pour, first in brandy cocktails and later in tequila sours.\n\nThe Sidecar can be made with either Cointreau or Grand Marnier; the latter pulls the drink toward the weight of a brandy crusta. Neither bottle is a coloring agent. The orange is distillate plus, in this case, cognac.",
    howToUse:
      "Use Grand Marnier when the recipe names it, or when a sour or stirred drink should carry orange plus brandy. A half-ounce in a sour is a substantial dose. Substituting it one-for-one for Cointreau in a Margarita or Cosmopolitan increases body and oak and reduces the impression of fresh peel.\n\nThe bottle is shelf-stable. Store it like cognac, tightly capped and away from heat. Refrigeration is unnecessary.",
    funFact:
      "The red ribbon on Cordon Rouge is a trademark, not a cognac quality grade. Other Grand Marnier expressions are different blends and proofs and will not mix identically.",
    pairsWith: ["cognac", "tequila", "lemon-juice", "lime-juice"],
    signatureSlugs: ["margarita"],
  },
  {
    slug: "green-chartreuse",
    seoTitle: "Green Chartreuse",
    seoDescription:
      "What Green Chartreuse is: a 55% Carthusian herbal liqueur, how it differs from yellow Chartreuse, and the equal-parts Last Word.",
    dek: "A proprietary herbal liqueur distilled by Carthusian monks from a large botanical formula and bottled at 55% ABV.",
    abv: "55%",
    origin: "Voiron, France",
    tastingNotes:
      "Alpine herbs, mint, sugar, and heat. Green Chartreuse is sweeter on the palate than its aroma suggests, and stronger than its liqueur classification implies. A quarter-ounce too much will bury gin and citrus under chlorophyll and alcohol.\n\nYellow Chartreuse is honeyed, lower in proof, and less aggressive. Tasting them side by side is the fastest way to understand why Last Word specifications name the green.",
    whatItIs:
      "Green Chartreuse (Chartreuse Verte) is a French herbal liqueur produced under the control of the Carthusian order from a secret formula of some 130 plants, barks, roots, and spices. Neutral spirit is infused and distilled; the color is natural. It is bottled at 55% ABV. It is a liqueur — it is sweetened — but at that strength it behaves in a cocktail more like a high-proof modifier than like a cordial.\n\nYellow Chartreuse is the related, milder expression: lower proof, sweeter, more honeyed. The two are not one-for-one substitutes. Green Chartreuse is the bottle specified in the Last Word.",
    history:
      "A manuscript recipe for an elixir is traditionally dated to 1605, when the Maréchal d’Estrées is said to have given it to the Carthusians. The monks at the Grande Chartreuse developed commercial liqueurs in the eighteenth century; the green liqueur became a stable product in the nineteenth. Distillation has long been associated with Voiron; production later moved to a facility at Aiguenoire while the monks retain control of the formula.\n\nThe Last Word — equal parts gin, green Chartreuse, maraschino liqueur, and lime juice — is documented at the Detroit Athletic Club in the 1920s and was revived in the early 2000s by Murray Stenson at the Zig Zag Café in Seattle. That revival, more than digestif service, returned the bottle to cocktail lists.",
    howToUse:
      "The Last Word is equal parts, shaken, and strained up. Elsewhere, start with a teaspoon to a quarter-ounce; herbal volume grows quickly. Yellow Chartreuse in a Last Word yields a sweeter, softer, lower-proof drink. That is a variant, not the original.\n\nStore upright, away from light. High proof preserves it. Chartreuse continues to evolve slowly in the bottle; that aging is a known property of the liqueur, not spoilage. Do not free-pour.",
    funFact:
      "Only two monks are traditionally permitted to know the complete botanical formula at a given time, a control practice that has made supply interruptions a recurring fact of the cocktail market.",
    pairsWith: ["gin", "maraschino-liqueur", "lime-juice", "yellow-chartreuse"],
    signatureSlugs: ["last-word"],
  },
  {
    slug: "yellow-chartreuse",
    seoTitle: "Yellow Chartreuse",
    seoDescription:
      "What Yellow Chartreuse is: the milder 43% Carthusian herbal liqueur, how it differs from green Chartreuse, and the drinks that name it.",
    dek: "The milder Chartreuse: the same Carthusian herbal tradition as the green liqueur, bottled sweeter and at 43% ABV.",
    abv: "43%",
    origin: "Voiron, France",
    tastingNotes:
      "Honey, saffron, turmeric, citrus, and milder herbs. The structure is soft relative to green Chartreuse; anise and floral notes show without the 55% heat.\n\nIt still perfumes a drink at a half-ounce. The difference from green is not absence of character but a shift toward sweetness and lower proof.",
    whatItIs:
      "Yellow Chartreuse (Chartreuse Jaune) is produced by the Carthusians from the same broad botanical library as Green Chartreuse, but it is a different recipe: naturally yellow, sweeter, and bottled at 43% ABV. It is still an herbal liqueur with a distinct identity, not a reduced-strength green.\n\nGreen Chartreuse is hotter, drier in impression, and more aggressively alpine. Yellow is used where a recipe names it — the Alaska, the Widow’s Kiss — or where green would overwhelm gin, brandy, or calvados.",
    history:
      "The yellow liqueur was introduced around 1840 as a more approachable Chartreuse and registered as Chartreuse Jaune in the mid-nineteenth century. It appears in late-nineteenth- and early-twentieth-century cocktail books, notably the Alaska (gin, yellow Chartreuse, orange bitters) and the Widow’s Kiss (calvados, yellow Chartreuse, Bénédictine, bitters).\n\nContemporary bartenders also use it in Last Word riffs. Those drinks should be understood as variants: the original Last Word’s structure depends on green Chartreuse’s proof and bitterness.",
    howToUse:
      "Measure. A half-ounce is a full herbal statement in a stirred drink. Substituting yellow for green in a Last Word lowers alcohol, increases sweetness, and rounds the finish. Substituting green for yellow in an Alaska makes the cocktail hotter and more medicinal.\n\nStore as for green Chartreuse: cool, dark, tightly closed. Refrigeration is not required. The two Chartreuses are siblings, not equivalents, and should be specified by color in a recipe.",
    funFact:
      "The Alaska cocktail, listed in early-twentieth-century American books, is one of the few classic templates that specify yellow Chartreuse rather than treating it as a stand-in for green.",
    pairsWith: ["gin", "green-chartreuse", "lemon-juice", "dry-vermouth"],
    signatureSlugs: [],
  },
  {
    slug: "maraschino-liqueur",
    seoTitle: "Maraschino Liqueur",
    seoDescription:
      "What maraschino liqueur is: a clear distillate of Marasca cherries including the pits, how it differs from Cherry Heering and jar syrup, and the classics that use it.",
    dek: "A clear liqueur distilled from Marasca cherries, including the pits; dry and nutty, not cherry syrup and not Cherry Heering.",
    abv: "32%",
    origin: "Zadar, Dalmatia; Luxardo now Torreglia, Italy",
    tastingNotes:
      "Cherry pit, bitter almond, a slight funk, and a surprisingly dry finish for a liqueur. Drinkers who expect cherry soda meet a distillate instead.\n\nCherry Heering is the contrast: cooked cherry, spice, and body, dark rather than clear. Side by side they share a fruit and almost nothing else.",
    whatItIs:
      "Maraschino is a liqueur distilled from Marasca cherries (a sour cherry, Prunus cerasus var. marasca), traditionally including skins and pits. The pits contribute a bitter-almond, kirsch-like note. The distillate is aged, sweetened, and typically bottled around 32% ABV. Luxardo, with its straw-wrapped bottle, is the reference product in most English-language cocktail specifications.\n\nIt is not the syrup from a jar of dyed cocktail cherries, not grenadine, and not Cherry Heering. Heering is a dark, sweet, macerated cherry liqueur with spice and body. Maraschino is clear, drier, and more distillate-driven. Kirsch is an unsweetened cherry brandy; maraschino is sweetened.",
    history:
      "Maraschino production is Dalmatian. Girolamo Luxardo founded his distillery in Zara (now Zadar) in 1821; after the Second World War the family re-established production in Torreglia, in the Veneto. Other Dalmatian and Italian houses make related products.\n\nEarly-twentieth-century recipes use it as a dry cherry accent in small doses: the Aviation (Hugo Ensslin, 1916: gin, maraschino, lemon, crème de violette), the Last Word, and the Hemingway Daiquiri (white rum, grapefruit, lime, maraschino) associated with El Floridita in Havana.",
    howToUse:
      "Typical measures are a quarter- to half-ounce. In a Last Word it is equal parts with gin, green Chartreuse, and lime. Do not substitute grenadine, cherry juice, or Heering if the recipe means maraschino; the drink will gain color, sugar, and jam and lose the pit character.\n\nThe bottle is relatively stable. Store upright and capped. Luxardo can throw a slight sediment of sugar and cherry solids; that is not spoilage. Invert gently if it has sat unused.",
    funFact:
      "American maraschino cherries are a separate industrial product, typically light cherries preserved in brine and sugar syrup. They do not taste like maraschino liqueur and are not a source of it.",
    pairsWith: ["gin", "green-chartreuse", "lime-juice", "lemon-juice", "white-rum"],
    signatureSlugs: ["last-word"],
  },
  {
    slug: "amaretto",
    aliases: ["amaretto-liqueur"],
    matchNames: ["amaretto liqueur"],
    seoTitle: "Amaretto",
    seoDescription:
      "What amaretto is: an Italian bitter-almond liqueur usually made from apricot kernels, and how the Amaretto Sour is built with lemon and whiskey.",
    dek: "An Italian liqueur in the bitter-almond family, usually flavored from apricot kernels rather than from sweet almonds.",
    abv: "21–28%",
    origin: "Saronno, Italy",
    tastingNotes:
      "Marzipan, apricot kernel, vanilla, and sugar. Inexpensive amaretto can taste like almond extract in syrup. A better bottle still needs acidity or whiskey if it is not to read as dessert.\n\nOrgeat shares the almond register but is a syrup, often with orange flower, used in tiki. Crème de noyaux is a different nut liqueur, typically pink.",
    whatItIs:
      "Amaretto is a sweet Italian liqueur whose aroma is that of bitter almond (benzaldehyde). Most commercial examples, including Disaronno Originale, are flavored from apricot kernels or a blend of kernels and botanicals, not from almond nuts. Strength is typically 21–28% ABV; Disaronno is 28%. It is a liqueur, not a spirit, and not the same as orgeat or crème de noyaux.\n\nThe Amaretto Sour is the principal cocktail use. In its late-twentieth-century form it was often amaretto and sour mix. Contemporary specifications usually add whiskey, commonly bourbon, and fresh lemon so the drink has acidity and proof.",
    history:
      "The Disaronno house in Saronno attaches a 1525 origin legend to a gift of liqueur for the painter Bernardino Luini. That story is brand tradition rather than a documented continuous product. Industrial amaretto as a global category is twentieth-century.\n\nThe improved Amaretto Sour associated with Jeffrey Morgenthaler around 2012 — amaretto, bourbon, lemon, egg white, and sugar as needed — restored the drink to sour structure. Without the whiskey, amaretto’s sugar dominates.",
    howToUse:
      "Shake amaretto with fresh lemon. Add bourbon if the drink should have sour structure rather than cordial sweetness; egg white adds texture. A large straight pour over ice is a liqueur service, not a sour.\n\nOrgeat will not substitute: it is non-alcoholic or nearly so, and it belongs to a different template. Store amaretto like other mid-proof liqueurs, capped and away from heat. Refrigeration is optional.",
    funFact:
      "Amaretto means “a little bitter” in Italian, referring to the bitter-almond note, not to the bitterness of amaro.",
    pairsWith: ["bourbon", "lemon-juice", "egg", "simple-syrup"],
    signatureSlugs: ["whiskey-sour"],
  },
  {
    slug: "coffee-liqueur",
    matchNames: ["kahlua", "kahlúa"],
    seoTitle: "Coffee Liqueur",
    seoDescription:
      "What coffee liqueur is as a category, how Kahlúa differs from drier bottles, and the Espresso Martini and White Russian templates.",
    dek: "A category of sweetened liqueurs made by combining coffee with a spirit base; Kahlúa is the best-known example, not the whole class.",
    abv: "16–25%",
    tastingNotes:
      "Roasted coffee, vanilla, and sugar in the Kahlúa-style bottles; roast bitterness and less syrup in drier specialty liqueurs such as Mr Black. Viscosity tracks sugar.\n\nNone of these liquids taste like freshly pulled espresso. In an Espresso Martini the shot is still doing extraction work the liqueur cannot.",
    whatItIs:
      "Coffee liqueur is coffee — infused, extracted, or compounded — plus a distilled base plus sugar. The base may be rum, cane spirit, or neutral alcohol. Kahlúa is a rum-and-coffee brand from Mexico. The category also includes drier, higher-proof bottles such as Mr Black, typically around 23–25% ABV, that taste closer to cold brew than to sweet coffee syrup.\n\nAn Espresso Martini still requires actual espresso or a concentrated coffee shot in the shaker. The liqueur supplies sweetness, viscosity, and a stable coffee note. It does not replace extraction.",
    history:
      "Mexican and Caribbean coffee liqueurs exist from the early twentieth century; Kahlúa, launched in 1936, became the United States default. The Black Russian (vodka and coffee liqueur), attributed to Gustave Tops at the Hotel Metropole in Brussels in 1949, and the White Russian (cream added) established the vodka-and-coffee template.\n\nDick Bradsell’s Espresso Martini in 1980s London — vodka, coffee liqueur, fresh espresso, sugar — returned the category to the shaken-drink repertoire.",
    howToUse:
      "Espresso Martini: shake vodka, coffee liqueur, and espresso with ice; strain up. White Russian: build vodka and coffee liqueur over ice and float or stir in cream. Kahlúa will make both drinks sweeter than a drier coffee liqueur. If you substitute a bitter bottle, you may need a little sugar syrup that a Kahlúa specification omitted.\n\nChill after opening if you prefer; coffee liqueurs are fairly stable, but aromas fade. They are not espresso and should not be stored as if they were fresh coffee.",
    funFact:
      "Recipes that say “coffee liqueur” were often written with Kahlúa’s sweetness in mind. Recipes that specify a drier brand will taste thin if you pour Kahlúa without adjusting sugar.",
    pairsWith: ["vodka", "espresso", "cream", "kahlua"],
    signatureSlugs: ["espresso-martini", "white-russian"],
  },
  {
    slug: "kahlua",
    seoTitle: "Kahlúa",
    seoDescription:
      "What Kahlúa is: a Mexican rum-and-coffee liqueur, how its bottling strength varies by market, and the White Russian and Espresso Martini.",
    dek: "A Mexican coffee liqueur made from cane spirit or rum, arabica coffee, vanilla, and sugar; the reference bottle in the coffee-liqueur category.",
    abv: "20% (United States) / 16% (United Kingdom, Canada, and other markets)",
    origin: "Veracruz, Mexico",
    tastingNotes:
      "Sweet coffee, vanilla, and rum richness. Sweeter and more viscous than many modern coffee liqueurs. In an Espresso Martini, real espresso keeps the drink from tasting only like sweetened coffee.\n\nKahlúa Especial, at 36% ABV, is drier and thinner. It mixes more like a specialty coffee liqueur than like the original.",
    whatItIs:
      "Kahlúa is a branded coffee liqueur created in Mexico in 1936. It is produced from cane spirit or rum, arabica coffee, vanilla, and sugar, then rested before bottling. Strength depends on market: the United States has long carried a 20% ABV original, reduced from 26.5% in 2004; the United Kingdom, Canada, and other markets moved to 16% in 2021. It is one coffee liqueur, not a synonym for the entire category.\n\nDrier coffee liqueurs have more roast bitterness and less sugar. In a recipe that names Kahlúa, that sweetness is part of the specification. In a recipe that names coffee liqueur, Kahlúa is the historical default but not the only correct bottle.",
    history:
      "Partners in Veracruz launched Kahlúa in 1936; the brand later passed through Allied Domecq to Pernod Ricard. The Black Russian is attributed to Gustave Tops at the Hotel Metropole in Brussels in 1949; the White Russian adds cream. The Espresso Martini (Dick Bradsell, London, 1980s) returned coffee liqueur to shaken drinks.\n\nPopular culture, especially the White Russian in late-1990s film, kept the bottle in American home bars independently of the craft-cocktail revival.",
    howToUse:
      "Use Kahlúa where sweet coffee is wanted: White Russian (vodka, Kahlúa, cream) and Espresso Martini (vodka, Kahlúa, espresso). For a drier Espresso Martini, reduce Kahlúa slightly, keep the espresso shot, or split with a more bitter coffee liqueur and adjust sugar.\n\nStore sealed, away from heat. Refrigeration after opening is optional. Do not treat the liqueur as leftover brewed coffee; it is a shelf-stable, high-sugar product with a different composition.",
    funFact:
      "The 2004 cut from 26.5% to 20% ABV, and the later 16% bottlings in some markets, mean that a mid-century White Russian specification and a current bottle are not the same strength of coffee liqueur.",
    pairsWith: ["vodka", "espresso", "cream", "coffee-liqueur"],
    signatureSlugs: ["espresso-martini", "white-russian"],
  },
  {
    slug: "irish-cream",
    aliases: ["baileys-irish-cream"],
    matchNames: ["baileys", "baileys irish cream"],
    seoTitle: "Irish Cream",
    seoDescription:
      "What Irish cream is: an emulsion of Irish whiskey, dairy cream, and sugar, how Baileys defined the category, and how to store and mix it.",
    dek: "A cream liqueur made from Irish whiskey, dairy cream, and sweeteners; Baileys is the product that defined the commercial category.",
    abv: "17%",
    origin: "Ireland",
    tastingNotes:
      "Sweet cream, cocoa, vanilla, and a little whiskey heat. It is a dessert modifier. In coffee it recedes pleasantly; in a citrus sour it can curdle.\n\nIt does not taste like Irish whiskey served with cream. The sugar, cocoa, and emulsifiers are part of the liquid.",
    whatItIs:
      "Irish cream is an emulsion liqueur: Irish whiskey (and sometimes other spirits), pasteurized cream, sugar, and flavorings such as cocoa and vanilla, homogenized so the dairy remains stable in alcohol. Baileys Irish Cream, launched in 1974 at 17% ABV, is the reference bottle and the origin of the commercial category. It is not equivalent to pouring whiskey and cream separately.\n\nIt will curdle in contact with high acidity. It is a dessert and coffee modifier, not a substitute for dry whiskey in a sour or Old Fashioned.",
    history:
      "Baileys was developed for Gilbeys of Ireland (R&A Bailey) and introduced in 1974. The technical problem it solved was keeping cream stable in a bottled alcoholic drink. Competing Irish creams followed.\n\nCocktail use is almost entirely late twentieth century: poured in coffee, in frozen drinks, and in creamy builds such as a White Russian variation that replaces plain cream with Irish cream.",
    howToUse:
      "Refrigerate after opening and use within the producer’s window, often several months. Build or shake with coffee, chocolate, and other low-acid partners. In a White Russian, Irish cream can replace the cream and some of the sweetness, which makes a richer, more confectionary drink than vodka, coffee liqueur, and plain cream.\n\nIf a recipe lists cream and whiskey as separate ingredients, substituting Irish cream changes both dairy fat and sugar. Do not treat it as a whiskey.",
    funFact:
      "Unopened Irish cream is formulated to be shelf-stable at room temperature. Once opened, oxidation and dairy stability argue for the refrigerator, unlike whiskey.",
    pairsWith: ["coffee-liqueur", "vodka", "espresso", "irish-whiskey"],
    signatureSlugs: ["white-russian"],
  },
  {
    slug: "benedictine",
    seoTitle: "Bénédictine",
    seoDescription:
      "What Bénédictine is: a 40% French herbal liqueur from Fécamp, how it differs from Chartreuse, and the Vieux Carré and Singapore Sling.",
    dek: "A French herbal liqueur, 40% ABV, produced in Fécamp from a proprietary botanical formula, with a honeyed, spiced profile.",
    abv: "40%",
    origin: "Fécamp, France",
    tastingNotes:
      "Honey, baking spice, saffron, and herbal sweetness. Rounder than Chartreuse, less anise-driven than absinthe or pastis, and more confectionary than green Chartreuse’s alpine heat.\n\nA half-ounce in a stirred whiskey drink is a complete aromatic statement. It reads as spice and honey, not as mint or chlorophyll.",
    whatItIs:
      "Bénédictine is a branded herbal liqueur created by Alexandre Le Grand in Fécamp, Normandy, in 1863. The label bears DOM (Deo Optimo Maximo). The recipe is proprietary; the house cites two dozen or more botanicals. It is bottled at 40% ABV. It is rounder and more honeyed than Chartreuse and lacks absinthe’s anise dominance.\n\nB&B is a later commercial blend of Bénédictine and brandy, drier and longer than Bénédictine alone. Neither is a substitute for green Chartreuse. In mixed drinks Bénédictine is a concentrated herbal-honey modifier, usually in quarter- to half-ounce amounts.",
    history:
      "Le Grand marketed the liqueur as a reconstruction of a medicinal elixir associated with the Benedictine abbey of Fécamp, a sixteenth-century manuscript in the brand’s account. Whatever the archival status of that story, the industrial product is nineteenth-century and Norman.\n\nAmerican cocktail use is concentrated in New Orleans and in hotel-bar classics: the Vieux Carré (Walter Bergeron, Hotel Monteleone, 1930s: rye, cognac, sweet vermouth, Bénédictine, bitters) and the Singapore Sling, attributed to Ngiam Tong Boon at Raffles Hotel around 1915, which uses Bénédictine among other modifiers.",
    howToUse:
      "In stirred drinks, a quarter- to half-ounce is the usual range. The Vieux Carré uses a small measure relative to the whiskeys. B&B can replace Bénédictine when you want less sweetness and more brandy, at the cost of the liqueur’s concentration.\n\nChartreuse will not stand in without turning the drink alpine and hotter. Store as a 40% liqueur, capped and away from light. It is stable.",
    funFact:
      "The Palais Bénédictine in Fécamp is a purpose-built nineteenth-century distillery and museum, not a functioning monastery, which is relevant to reading the monastic story as brand history.",
    pairsWith: ["rye-whiskey", "cognac", "sweet-vermouth", "angostura-bitters"],
    signatureSlugs: [],
  },
  {
    slug: "cherry-heering",
    seoTitle: "Cherry Heering",
    seoDescription:
      "What Cherry Heering is: a Danish macerated cherry liqueur, how it differs from maraschino, and the Blood and Sand and Singapore Sling.",
    dek: "A Danish cherry liqueur made by steeping cherries with spices in spirit; dark and jammy, distinct from clear maraschino.",
    abv: "24%",
    origin: "Copenhagen, Denmark",
    tastingNotes:
      "Cooked cherry, baking spice, and more body than maraschino liqueur. It is red-brown and substantial, not clear and nutty.\n\nMaraschino smells of pits and almond. Heering smells of preserved fruit. Grenadine smells of pomegranate and sugar. The three are not a flavor gradient of the same thing.",
    whatItIs:
      "Cherry Heering (Peter Heering) is a cherry liqueur produced in Denmark: cherries are steeped with spices in a spirit base, then sweetened, yielding a dark red-brown, viscous liquid at 24% ABV. Older recipes sometimes call it cherry brandy, though it is a liqueur rather than an unsweetened eau-de-vie.\n\nMaraschino is distilled, clear, and pit-forward. Heering is macerated, deep in color, and fruit-forward. Grenadine is pomegranate syrup. None of the three replace the others without changing the drink’s color, sugar, and cherry character.",
    history:
      "Peter F. Heering began producing the liqueur in Copenhagen in 1818. It became a staple of European and colonial hotel bars. The Blood and Sand (Scotch, Cherry Heering, sweet vermouth, orange juice) is named for the 1922 Rudolph Valentino film and appears in Harry Craddock’s Savoy Cocktail Book (1930).\n\nThe Singapore Sling’s cherry component is Heering in most reconstructed specifications. Early-twentieth-century hotel-bar recipes keep using it because the macerated, spiced cherry profile is difficult to approximate with other bottles.",
    howToUse:
      "A half-ounce is typical. Blood and Sand is equal parts of the four ingredients, shaken. Substituting maraschino produces a paler, drier, more almond-like drink. Substituting grenadine produces a sweeter, less cherry-specific sour.\n\nStore upright. The liqueur is stable but can fade. Invert gently if it has been sitting, as sediment may collect. Refrigeration is optional.",
    funFact:
      "Older British and American recipes that say “cherry brandy” often mean a sweetened cherry liqueur in the Heering style, not kirsch, which is dry and unsweetened.",
    pairsWith: ["scotch", "sweet-vermouth", "orange-juice", "gin"],
    signatureSlugs: [],
  },
  {
    slug: "falernum",
    seoTitle: "Falernum",
    seoDescription:
      "What falernum is: a Barbadian lime, ginger, almond, and clove syrup or low-proof liqueur, how it differs from orgeat, and how it is used in rum drinks.",
    dek: "A Caribbean lime, ginger, almond, and clove preparation, made as a lightly alcoholic liqueur or as a non-alcoholic syrup.",
    abv: "0–11%",
    origin: "Barbados",
    tastingNotes:
      "Lime zest, ginger, almond, and clove, sometimes with allspice. Velvet Falernum, the common bottled version, is only lightly alcoholic and tastes like spiced lime cordial with nut oil.\n\nOrgeat is almond-forward and floral. Falernum is spicier and more citrus. Allspice dram is clove-and-pimento without the lime-almond mix.",
    whatItIs:
      "Falernum is a flavored syrup or low-proof liqueur associated with Barbados, built on lime (zest and sometimes juice), ginger, almond, and clove. John D. Taylor’s Velvet Falernum, the usual bottled version, is about 11% ABV. Non-alcoholic falernum syrups also exist. It is not orgeat: orgeat is almond and orange flower, without the ginger-clove-lime spice.\n\nIn rum drinks it supplies a combined citrus-spice-nut modifier that would otherwise require several bottles. It is a Caribbean preparation that tiki bars later adopted, not a French liqueur.",
    history:
      "Written and commercial falernum is Barbadian, with nineteenth-century references; Velvet Falernum is the export standard. Mid-century tiki bars (Donn Beach, Trader Vic) and later researchers such as Jeff “Beachbum” Berry put bottled falernum into American home use.\n\nCorn ’n’ Oil, a Bajan drink of rum and falernum, is a local template distinct from California tiki. The name falernum is sometimes fancifully linked to Falernian wine; in practice the product is Barbadian and the etymology is unsettled.",
    howToUse:
      "A half-ounce in rum sours and tiki highballs is a common starting measure. Refrigerate after opening, especially syrup-strength versions. Shake the bottle; spices and almond solids settle. Substituting orgeat gives almond without ginger and clove. Substituting allspice dram gives spice without lime and almond.\n\nIn a Daiquiri, falernum makes a different drink — a falernum Daiquiri or a sour relative of Corn ’n’ Oil — not a standard Daiquiri, which is rum, lime, and sugar.",
    funFact:
      "Because falernum exists as both an 11% liqueur and a non-alcoholic syrup, two bottles with the same name can change a drink’s proof even when the spice profile is similar. Check the label.",
    pairsWith: ["rum", "lime-juice", "white-rum", "dark-rum", "orgeat-syrup"],
    signatureSlugs: ["daiquiri"],
  },
  {
    slug: "drambuie",
    seoTitle: "Drambuie",
    seoDescription:
      "What Drambuie is: a Scotch whisky liqueur with heather honey and herbs, and the Rusty Nail template of Scotch plus Drambuie.",
    dek: "A Scotch whisky liqueur sweetened with heather honey and flavored with herbs and spices, bottled at 40% ABV.",
    abv: "40%",
    origin: "Scotland",
    tastingNotes:
      "Heather honey, whisky heat, and herbal sweetness. It is richer than a whisky-sour modifier and sweeter than Scotch alone. The honey is integral, not a garnish note.\n\nAmaretto in a Godfather occupies a similar two-ingredient role with Scotch but tastes of bitter almond rather than honey and herbs.",
    whatItIs:
      "Drambuie is a liqueur whose base is Scotch whisky, with heather honey and a proprietary herbal-spice formula, bottled at 40% ABV. The name is generally derived from Scottish Gaelic an dram buidheach, “the drink that satisfies.” It is a whisky liqueur, not a honey syrup and not a second whisky.\n\nThe Rusty Nail — Scotch and Drambuie on ice — is the cocktail that defines its use. Despite the 40% strength, it mixes as a complete modifier: sweetness, herbs, and whisky already combined.",
    history:
      "Brand tradition holds that the recipe was given by Charles Edward Stuart to the MacKinnons of Skye after Culloden in 1746. Documented commercial production begins in the late nineteenth and early twentieth centuries, associated with James Ross on Skye and later the Mackinnon family, with wider bottling in the 1900s–1910s.\n\nThe Rusty Nail is a mid-twentieth-century two-ingredient drink, popular in the 1960s, in the same family as other spirit-plus-liqueur rocks drinks. It entered hotel-bar repertoire as a Scotch template rather than as a sour.",
    howToUse:
      "Build a Rusty Nail to taste, commonly two parts Scotch to one part Drambuie, sometimes equal parts, over ice. More Drambuie increases honey and herbs and decreases the impression of the whisky. Substituting amaretto produces a Godfather, a different drink. Substituting honey syrup produces a Scotch-and-honey highball or sour without the herbal formula.\n\nDo not expect Drambuie to replace honey syrup in a Penicillin or Gold Rush; it adds whisky and herbs as well as sweetness. Store like a 40% liqueur, tightly capped.",
    funFact:
      "The Gaelic etymology is widely repeated in brand and reference literature; the Jacobite origin story is tradition attached to a product whose industrial history is modern.",
    pairsWith: ["scotch", "lemon-juice"],
    signatureSlugs: [],
  },
  {
    slug: "galliano",
    seoTitle: "Galliano",
    seoDescription:
      "What Galliano is: an Italian vanilla-anise herbal liqueur, L’Autentico versus the vanilla expression, and the Harvey Wallbanger.",
    dek: "An Italian herbal liqueur flavored with vanilla, anise, and Mediterranean botanicals; Galliano L’Autentico is bottled at 42.3% ABV.",
    abv: "42.3% (L’Autentico) / 30% (Vanilla)",
    origin: "Livorno, Italy",
    tastingNotes:
      "Vanilla, star anise, peppermint, and gold color. The profile is distinct and easy to over-pour: a teaspoon seasons a sour; a heavy measure tastes of vanilla-anise candy.\n\nYellow Chartreuse shares a golden herbal register but is honeyed and monastic rather than vanilla-anise. Licor 43 is vanilla-forward with less anise.",
    whatItIs:
      "Galliano L’Autentico is a bright yellow Italian liqueur created by Arturo Vaccari in Livorno in 1896, named for the soldier Giuseppe Galliano. The formula uses vanilla, star anise and anise, peppermint, citrus, and other Mediterranean herbs and spices, on the order of thirty. Current L’Autentico is 42.3% ABV. A separate Galliano Vanilla is bottled at 30% and is more vanilla-forward and less herbal.\n\nIt is a modifier. Recipes written for L’Autentico and those written during the years when the main bottling was 30% ABV do not behave identically.",
    history:
      "Vaccari launched the liqueur in 1896. American popularity arrived with mid-century drinks, especially the Harvey Wallbanger (vodka, orange juice, Galliano float), promoted in the 1970s by Galliano’s importer. The Golden Cadillac (Galliano, white crème de cacao, cream) is another period piece.\n\nBetween 1989 and 2008 the main bottling was reduced to 30% ABV; L’Autentico restored the higher proof. Donato “Duke” Antone is the bartender most often credited with the Harvey Wallbanger in the 1950s, before the later marketing campaign.",
    howToUse:
      "For a Harvey Wallbanger, build vodka and orange juice over ice and float a small measure of Galliano. In shaken drinks, a quarter-ounce is usually enough. Substituting yellow Chartreuse adds monastic herbs without Galliano’s vanilla. Substituting vanilla syrup loses anise and proof.\n\nStore as a liqueur, capped and away from light. The tall bottle is packaging, not a mixing instruction. Confirm whether you have L’Autentico or the Vanilla expression before following a specification written for one or the other.",
    funFact:
      "The Harvey Wallbanger’s association with 1970s American bars is as much a distribution campaign as a folk recipe; the drink’s documented bartender attribution predates that campaign by about two decades.",
    pairsWith: ["vodka", "orange-juice", "gin"],
    signatureSlugs: [],
  },
];
