#!/usr/bin/env tsx
/**
 * Generate review-batch-001.csv — highest-need missing cocktails
 * drafted to Mixwise Editorial Style Guide + curated addon quality bar.
 *
 * Does NOT import. Output is for human review → audit → dry-run import.
 */
import * as fs from 'fs';
import * as path from 'path';

type Draft = {
  slug: string;
  name: string;
  short_description: string;
  long_description: string;
  seo_description: string;
  base_spirit: string;
  category_primary: string;
  categories_all: string;
  tags: string;
  image_alt: string;
  glassware: string;
  garnish: string;
  technique: 'Shake' | 'Stir' | 'Build' | 'Blend' | 'Swizzle';
  difficulty: 'Easy' | 'Intermediate' | 'Advanced';
  flavor_strength: number;
  flavor_sweetness: number;
  flavor_tartness: number;
  flavor_bitterness: number;
  flavor_aroma: number;
  flavor_texture: number;
  notes: string;
  fun_fact: string;
  fun_fact_source: string;
  ingredients: string;
  instructions: string;
};

const drafts: Draft[] = [
  // --- Remaining from prior gap list (still missing in live DB) ---
  {
    slug: 'bobby-burns',
    name: 'Bobby Burns',
    short_description:
      'A Scotch Manhattan variation finished with Bénédictine for gentle herbal sweetness.',
    long_description:
      'The Bobby Burns applies the Manhattan template to Scotch whisky, then adds a small measure of Bénédictine. Scotch contributes grain and peat character in place of rye spice, while sweet vermouth supplies wine depth and the liqueur adds herbal sweetness without turning the drink dessert-like. Stirred and served up, it remains spirit-forward and compact. The drink appears in early twentieth-century manuals and is named for the Scottish poet Robert Burns.',
    seo_description:
      'Stir a Bobby Burns with Scotch whisky, sweet vermouth, and Bénédictine for a herbal Manhattan variation.',
    base_spirit: 'Scotch',
    category_primary: 'Spirit-Forward',
    categories_all: 'classic|spirit-forward|manhattan-family|scotch',
    tags: 'scotch|vermouth|benedictine|stirred|manhattan',
    image_alt:
      'Bobby Burns served in a chilled coupe, amber-brown in color, garnished with a lemon twist.',
    glassware: 'Coupe',
    garnish: 'lemon twist',
    technique: 'Stir',
    difficulty: 'Intermediate',
    flavor_strength: 8,
    flavor_sweetness: 4,
    flavor_tartness: 1,
    flavor_bitterness: 4,
    flavor_aroma: 7,
    flavor_texture: 6,
    notes:
      'Keep the Bénédictine modest; excess sweetness buries the Scotch. A blended Scotch keeps the profile balanced; peated malts make a louder variant.',
    fun_fact:
      'The Bobby Burns appears in Harry Craddock’s Savoy Cocktail Book (1930) as a Scotch whisky cocktail with vermouth and Bénédictine, named for the Scottish poet.',
    fun_fact_source: 'Harry Craddock, The Savoy Cocktail Book (1930)',
    ingredients:
      '2 oz Scotch whisky|1 oz sweet vermouth|0.25 oz Bénédictine|2 dashes orange bitters',
    instructions:
      '1. Add Scotch, sweet vermouth, Bénédictine, and orange bitters to a mixing glass with ice. 2. Stir until well chilled and slightly viscous. 3. Strain into a chilled coupe. 4. Garnish with a lemon twist.',
  },
  {
    slug: 'champs-elysees',
    name: 'Champs-Élysées',
    short_description:
      'A Cognac sour from the 1920s that uses yellow Chartreuse in place of orange liqueur.',
    long_description:
      'The Champs-Élysées keeps the Sidecar’s Cognac-and-lemon frame but swaps orange liqueur for yellow Chartreuse. Cognac provides dried-fruit richness, lemon keeps the drink bright, and Chartreuse adds honeyed herbal depth that softens the need for much additional sugar. Shaken and served up, it reads as a French sour with more spice than a standard Sidecar. Harry MacElhone printed an early version in the 1920s.',
    seo_description:
      'Shake a Champs-Élysées with Cognac, yellow Chartreuse, and lemon juice for a herbal Sidecar variation.',
    base_spirit: 'Cognac',
    category_primary: 'Sour',
    categories_all: 'classic|sour|sidecar-family|french',
    tags: 'cognac|chartreuse|lemon|shaken|sidecar',
    image_alt:
      'Champs-Élysées served in a chilled coupe, pale gold in color, garnished with a lemon twist.',
    glassware: 'Coupe',
    garnish: 'lemon twist',
    technique: 'Shake',
    difficulty: 'Intermediate',
    flavor_strength: 7,
    flavor_sweetness: 4,
    flavor_tartness: 6,
    flavor_bitterness: 3,
    flavor_aroma: 8,
    flavor_texture: 5,
    notes:
      'Yellow Chartreuse already sweetens; add only a teaspoon of syrup if the Cognac is especially dry. Shake hard and fine-strain for a clean surface.',
    fun_fact:
      'An early Champs-Élysées recipe appears in Harry MacElhone’s ABC of Mixing Cocktails (1923), pairing Cognac with Chartreuse and lemon.',
    fun_fact_source: 'Harry MacElhone, ABC of Mixing Cocktails (1923)',
    ingredients:
      '2 oz Cognac|0.75 oz yellow Chartreuse|0.75 oz fresh lemon juice|1 tsp simple syrup|2 dashes Angostura bitters',
    instructions:
      '1. Add Cognac, yellow Chartreuse, lemon juice, simple syrup, and Angostura to a shaker with ice. 2. Shake until well chilled. 3. Fine-strain into a chilled coupe. 4. Garnish with a lemon twist.',
  },
  {
    slug: 'fancy-free',
    name: 'Fancy Free',
    short_description:
      'An Old Fashioned variation sweetened with maraschino liqueur instead of simple syrup.',
    long_description:
      'The Fancy Free keeps the Old Fashioned’s whiskey-and-bitters core but replaces plain sugar with maraschino liqueur. Bourbon remains dominant, while maraschino adds cherry-almond sweetness and orange bitters lift the aroma. Stirred over ice and served on a large cube, it stays dry enough to drink as a spirit-forward cocktail rather than a sweetened whiskey drink. David Embury published the formula in 1948.',
    seo_description:
      'Stir a Fancy Free with bourbon, maraschino liqueur, and bitters for a classic Old Fashioned variation.',
    base_spirit: 'Bourbon',
    category_primary: 'Spirit-Forward',
    categories_all: 'classic|spirit-forward|old-fashioned-family',
    tags: 'bourbon|maraschino|bitters|stirred|old-fashioned',
    image_alt:
      'Fancy Free served in a rocks glass over a large ice cube, amber in color, garnished with an orange twist.',
    glassware: 'Rocks glass',
    garnish: 'orange twist',
    technique: 'Stir',
    difficulty: 'Easy',
    flavor_strength: 8,
    flavor_sweetness: 4,
    flavor_tartness: 1,
    flavor_bitterness: 5,
    flavor_aroma: 7,
    flavor_texture: 6,
    notes:
      'Measure the maraschino carefully; a half-ounce is enough. Express the orange peel over the drink to reinforce the orange bitters.',
    fun_fact:
      'David Embury’s The Fine Art of Mixing Drinks (1948) records the Fancy Free as an Old Fashioned built with maraschino rather than sugar syrup.',
    fun_fact_source: 'David Embury, The Fine Art of Mixing Drinks (1948)',
    ingredients:
      '2 oz bourbon|0.5 oz maraschino liqueur|2 dashes orange bitters|2 dashes Angostura bitters',
    instructions:
      '1. Add bourbon, maraschino, orange bitters, and Angostura to a mixing glass with ice. 2. Stir until well chilled. 3. Strain over a large ice cube in a rocks glass. 4. Garnish with an expressed orange twist.',
  },
  {
    slug: 'floridita-daiquiri',
    name: 'Floridita Daiquiri',
    short_description:
      'Havana’s El Floridita daiquiri variation with grapefruit juice and maraschino liqueur.',
    long_description:
      'The Floridita Daiquiri elaborates the classic rum-lime-sugar sour with grapefruit juice and a touch of maraschino. White rum stays clean and light, lime and grapefruit tighten the acidity, and maraschino adds subtle cherry depth without turning the drink heavy. Shaken and served up, it is colder and more layered than a three-ingredient Daiquiri. Constantino Ribalaigua Vert developed the house style at El Floridita in Havana.',
    seo_description:
      'Shake a Floridita Daiquiri with white rum, lime, grapefruit, and maraschino for a Havana classic.',
    base_spirit: 'Rum',
    category_primary: 'Sour',
    categories_all: 'classic|sour|daiquiri-family|havana',
    tags: 'rum|lime|grapefruit|maraschino|shaken|cuban',
    image_alt:
      'Floridita Daiquiri served in a chilled coupe, pale yellow in color, no garnish.',
    glassware: 'Coupe',
    garnish: 'None',
    technique: 'Shake',
    difficulty: 'Intermediate',
    flavor_strength: 6,
    flavor_sweetness: 4,
    flavor_tartness: 7,
    flavor_bitterness: 2,
    flavor_aroma: 6,
    flavor_texture: 5,
    notes:
      'Fresh grapefruit juice is essential; bottled juice dulls the drink. Keep maraschino at a quarter-ounce so it seasons rather than sweetens.',
    fun_fact:
      'Constantino Ribalaigua Vert refined multiple daiquiri styles at Havana’s El Floridita; the grapefruit-and-maraschino version is closely associated with the bar’s mid-century reputation.',
    fun_fact_source: 'Jeffrey Morgenthaler, The Bar Book; El Floridita bar histories',
    ingredients:
      '2 oz white rum|0.5 oz fresh lime juice|0.5 oz fresh grapefruit juice|0.5 oz simple syrup|0.25 oz maraschino liqueur',
    instructions:
      '1. Add rum, lime juice, grapefruit juice, simple syrup, and maraschino to a shaker with ice. 2. Shake until well chilled. 3. Fine-strain into a chilled coupe. 4. Serve without garnish.',
  },
  {
    slug: 'improved-whiskey-cocktail',
    name: 'Improved Whiskey Cocktail',
    short_description:
      'A nineteenth-century whiskey cocktail enhanced with maraschino, absinthe, and dual bitters.',
    long_description:
      'The Improved Whiskey Cocktail starts from spirit, sugar, and bitters, then adds maraschino and absinthe for aromatic lift. Rye provides spice and dryness, the bitters deepen the finish, and the liqueur additions perfume the drink without turning it into a multi-liqueur showpiece. Stirred and served up or on a large cube, it sits between a plain whiskey cocktail and later Old Fashioned elaborations. Jerry Thomas published an early improved-style template in the 1860s.',
    seo_description:
      'Stir an Improved Whiskey Cocktail with rye, maraschino, absinthe, and bitters for a classic 19th-century drink.',
    base_spirit: 'Rye',
    category_primary: 'Spirit-Forward',
    categories_all: 'classic|spirit-forward|old-fashioned-family|improved',
    tags: 'rye|maraschino|absinthe|bitters|stirred',
    image_alt:
      'Improved Whiskey Cocktail served in a chilled coupe, amber in color, garnished with a lemon twist.',
    glassware: 'Coupe',
    garnish: 'lemon twist',
    technique: 'Stir',
    difficulty: 'Intermediate',
    flavor_strength: 8,
    flavor_sweetness: 3,
    flavor_tartness: 1,
    flavor_bitterness: 5,
    flavor_aroma: 9,
    flavor_texture: 6,
    notes:
      'Treat absinthe as seasoning—rinse or a scant quarter-ounce is enough. Dual bitters matter; Peychaud’s softens Angostura’s spice.',
    fun_fact:
      'Jerry Thomas’s How to Mix Drinks (1862) popularized “improved” cocktails that add liqueurs and absinthe to the basic spirit-sugar-bitters formula.',
    fun_fact_source: 'Jerry Thomas, How to Mix Drinks (1862); David Wondrich, Imbibe!',
    ingredients:
      '2 oz rye whiskey|1 barspoon simple syrup|0.25 oz maraschino liqueur|0.25 oz absinthe|2 dashes Angostura bitters|2 dashes Peychaud’s bitters',
    instructions:
      '1. Add rye, simple syrup, maraschino, absinthe, and both bitters to a mixing glass with ice. 2. Stir until well chilled. 3. Strain into a chilled coupe. 4. Garnish with a lemon twist.',
  },
  {
    slug: 'little-italy',
    name: 'Little Italy',
    short_description:
      'A modern Manhattan variation that splits the sweetener between vermouth and Cynar.',
    long_description:
      'The Little Italy keeps rye whiskey as the base and replaces part of the Manhattan’s sweet vermouth with Cynar. Rye supplies spice, vermouth keeps wine sweetness, and Cynar adds artichoke bitterness and herbal depth. Stirred and served on a large cube, it drinks drier and more bitter than a standard Manhattan while remaining clearly in that family. Audrey Saunders created the drink at New York’s Pegu Club in 2005.',
    seo_description:
      'Stir a Little Italy with rye whiskey, Cynar, and sweet vermouth for a bitter Manhattan variation.',
    base_spirit: 'Rye',
    category_primary: 'Spirit-Forward',
    categories_all: 'modern-classic|spirit-forward|manhattan-family|amaro',
    tags: 'rye|cynar|vermouth|bitters|stirred|pegu-club',
    image_alt:
      'Little Italy served in a rocks glass over a large ice cube, dark amber in color, garnished with a cherry.',
    glassware: 'Rocks glass',
    garnish: 'brandied cherry',
    technique: 'Stir',
    difficulty: 'Intermediate',
    flavor_strength: 8,
    flavor_sweetness: 3,
    flavor_tartness: 1,
    flavor_bitterness: 7,
    flavor_aroma: 8,
    flavor_texture: 6,
    notes:
      'Saunders’s proportions keep Cynar supporting rather than dominating. Use a spicy rye and chill thoroughly before straining over fresh ice.',
    fun_fact:
      'Audrey Saunders created the Little Italy at Pegu Club in New York in 2005, using Cynar to push the Manhattan toward a drier, amaro-accented profile.',
    fun_fact_source: 'Punch Drink; Pegu Club cocktail histories',
    ingredients:
      '2 oz rye whiskey|0.75 oz sweet vermouth|0.5 oz Cynar|1 dash Angostura bitters',
    instructions:
      '1. Add rye, sweet vermouth, Cynar, and Angostura to a mixing glass with ice. 2. Stir until well chilled. 3. Strain over a large ice cube in a rocks glass. 4. Garnish with a brandied cherry.',
  },
  {
    slug: 'montgomery-martini',
    name: 'Montgomery Martini',
    short_description:
      'An extra-dry gin Martini built at a 6:1 gin-to-vermouth ratio.',
    long_description:
      'The Montgomery Martini sits at the dry end of the Martini spectrum, using roughly six parts gin to one part dry vermouth. Gin remains the primary flavor, while vermouth softens edges and adds faint herbal roundness rather than equal partnership. Stirred ice-cold and served up, the drink depends on clean gin and disciplined dilution. The nickname references Field Marshal Bernard Montgomery and the dry ratios associated with mid-century Martini taste.',
    seo_description:
      'Stir a Montgomery Martini with gin and dry vermouth in a 6:1 ratio for an extra-dry classic.',
    base_spirit: 'Gin',
    category_primary: 'Spirit-Forward',
    categories_all: 'classic|spirit-forward|martini-family|dry',
    tags: 'gin|dry-vermouth|stirred|martini|extra-dry',
    image_alt:
      'Montgomery Martini served in a chilled coupe, clear and pale, garnished with a lemon twist.',
    glassware: 'Coupe',
    garnish: 'lemon twist|olive',
    technique: 'Stir',
    difficulty: 'Easy',
    flavor_strength: 9,
    flavor_sweetness: 1,
    flavor_tartness: 1,
    flavor_bitterness: 2,
    flavor_aroma: 6,
    flavor_texture: 7,
    notes:
      'Stir longer than a wetter Martini so dilution rounds the high-proof gin. Choose lemon twist or olive; do not combine both.',
    fun_fact:
      'The Montgomery nickname is linked in cocktail lore to Field Marshal Bernard Montgomery and a preference for very dry Martinis, commonly cited around a 6:1 ratio.',
    fun_fact_source: 'Cocktail lore summarized in modern Martini histories; ratio convention in craft-bar practice',
    ingredients: '3 oz gin|0.5 oz dry vermouth',
    instructions:
      '1. Add gin and dry vermouth to a mixing glass with ice. 2. Stir until very cold and silky. 3. Strain into a chilled coupe. 4. Garnish with a lemon twist or olive.',
  },
  {
    slug: 'preakness',
    name: 'Preakness',
    short_description:
      'A Manhattan variation enriched with Bénédictine and named for the Preakness Stakes.',
    long_description:
      'The Preakness builds on rye, sweet vermouth, and bitters, then adds Bénédictine for herbal sweetness and spice. Compared with a standard Manhattan, it is richer and slightly softer on the finish while remaining stirred and spirit-forward. Served up, it reads as a racing-season Manhattan cousin rather than a separate template. The name references the Preakness Stakes, the second leg of the Triple Crown.',
    seo_description:
      'Stir a Preakness with rye whiskey, sweet vermouth, and Bénédictine for a Manhattan variation.',
    base_spirit: 'Rye',
    category_primary: 'Spirit-Forward',
    categories_all: 'classic|spirit-forward|manhattan-family',
    tags: 'rye|vermouth|benedictine|bitters|stirred',
    image_alt:
      'Preakness served in a chilled coupe, amber-brown in color, garnished with a lemon twist.',
    glassware: 'Coupe',
    garnish: 'lemon twist',
    technique: 'Stir',
    difficulty: 'Intermediate',
    flavor_strength: 8,
    flavor_sweetness: 5,
    flavor_tartness: 1,
    flavor_bitterness: 4,
    flavor_aroma: 7,
    flavor_texture: 6,
    notes:
      'If the drink tastes candy-sweet, reduce Bénédictine before cutting vermouth. A spicy rye keeps the profile from becoming soft.',
    fun_fact:
      'The Preakness appears in mid-twentieth-century American cocktail lists as a Manhattan-style drink named for the Preakness Stakes.',
    fun_fact_source: 'Mid-century American cocktail manuals; racing-cocktail tradition summaries',
    ingredients:
      '2 oz rye whiskey|1 oz sweet vermouth|0.5 oz Bénédictine|2 dashes Angostura bitters',
    instructions:
      '1. Add rye, sweet vermouth, Bénédictine, and Angostura to a mixing glass with ice. 2. Stir until well chilled. 3. Strain into a chilled coupe. 4. Garnish with a lemon twist.',
  },
  {
    slug: 'widows-kiss',
    name: "Widow's Kiss",
    short_description:
      'A pre-Prohibition stirred drink of calvados with yellow Chartreuse and Bénédictine.',
    long_description:
      'The Widow’s Kiss uses apple brandy as a base and layers yellow Chartreuse and Bénédictine for honeyed herbal sweetness. Calvados contributes ripe apple and oak, while the two liqueurs thicken the texture and perfume the finish. Stirred and served up, it is rich, aromatic, and distinctly nineteenth-century in structure. George Kappeler published the drink in 1895.',
    seo_description:
      "Stir a Widow's Kiss with calvados, yellow Chartreuse, and Bénédictine for a classic apple brandy cocktail.",
    base_spirit: 'Apple Brandy',
    category_primary: 'Spirit-Forward',
    categories_all: 'classic|spirit-forward|pre-prohibition|apple',
    tags: 'calvados|chartreuse|benedictine|bitters|stirred',
    image_alt:
      "Widow's Kiss served in a chilled coupe, golden-amber in color, no fruit garnish required.",
    glassware: 'Coupe',
    garnish: 'None',
    technique: 'Stir',
    difficulty: 'Intermediate',
    flavor_strength: 8,
    flavor_sweetness: 6,
    flavor_tartness: 1,
    flavor_bitterness: 4,
    flavor_aroma: 9,
    flavor_texture: 7,
    notes:
      'No extra sugar is needed. Prefer true calvados or a characterful apple brandy over a neutral apple spirit.',
    fun_fact:
      'George Kappeler’s Modern American Drinks (1895) includes the Widow’s Kiss among early published apple brandy cocktails.',
    fun_fact_source: 'George Kappeler, Modern American Drinks (1895); David Wondrich, Imbibe!',
    ingredients:
      '2 oz calvados|0.5 oz yellow Chartreuse|0.5 oz Bénédictine|2 dashes Angostura bitters',
    instructions:
      '1. Add calvados, yellow Chartreuse, Bénédictine, and Angostura to a mixing glass with ice. 2. Stir until well chilled. 3. Strain into a chilled coupe. 4. Serve without garnish, or with a thin apple slice only if desired.',
  },

  // --- Highest-need classics missing from live library ---
  {
    slug: 'boulevardier',
    name: 'Boulevardier',
    short_description:
      'A whiskey Negroni of bourbon or rye with Campari and sweet vermouth.',
    long_description:
      'The Boulevardier replaces the Negroni’s gin with whiskey while keeping Campari and sweet vermouth. Bourbon softens the bitter edge with caramel and oak; rye keeps the drink drier and spicier. Stirred over ice and served on a rock or up, it is denser and warmer than a Negroni but equally structured. Erskine Gwynne’s Paris magazine The Boulevardier helped popularize the name in the 1920s.',
    seo_description:
      'Stir a Boulevardier with bourbon, Campari, and sweet vermouth for a classic whiskey Negroni.',
    base_spirit: 'Bourbon',
    category_primary: 'Spirit-Forward',
    categories_all: 'classic|spirit-forward|negroni-family|aperitivo',
    tags: 'bourbon|campari|vermouth|bitter|stirred|negroni',
    image_alt:
      'Boulevardier served in a rocks glass over a large ice cube, deep red in color, garnished with an orange peel.',
    glassware: 'Rocks glass',
    garnish: 'orange peel',
    technique: 'Stir',
    difficulty: 'Easy',
    flavor_strength: 8,
    flavor_sweetness: 3,
    flavor_tartness: 1,
    flavor_bitterness: 8,
    flavor_aroma: 8,
    flavor_texture: 6,
    notes:
      'Equal parts work; many modern bars prefer a slightly whiskey-forward 1.5:1:1 build. Express the orange peel over the surface.',
    fun_fact:
      'The Boulevardier is associated with Erskine Gwynne’s Paris magazine of the same name in the 1920s and is structurally a whiskey Negroni.',
    fun_fact_source: 'Harry McElhone era Paris cocktail histories; Punch Drink',
    ingredients: '1.5 oz bourbon|1 oz Campari|1 oz sweet vermouth',
    instructions:
      '1. Add bourbon, Campari, and sweet vermouth to a mixing glass with ice. 2. Stir until well chilled. 3. Strain over a large ice cube in a rocks glass. 4. Garnish with an expressed orange peel.',
  },
  {
    slug: 'brooklyn',
    name: 'Brooklyn',
    short_description:
      'A dry rye cocktail with dry vermouth, Amer Picon, and maraschino.',
    long_description:
      'The Brooklyn sits beside the Manhattan as a drier, more aromatic rye cocktail. Dry vermouth replaces sweet vermouth, Amer Picon contributes bitter orange depth, and maraschino adds a light cherry note. Stirred and served up, it is leaner and more bitter than a Manhattan. Early twentieth-century New York manuals established the drink among the borough cocktails.',
    seo_description:
      'Stir a Brooklyn with rye whiskey, dry vermouth, Amer Picon, and maraschino for a classic dry rye cocktail.',
    base_spirit: 'Rye',
    category_primary: 'Spirit-Forward',
    categories_all: 'classic|spirit-forward|manhattan-family|new-york',
    tags: 'rye|dry-vermouth|amer-picon|maraschino|stirred',
    image_alt:
      'Brooklyn served in a chilled coupe, amber in color, garnished with a brandied cherry.',
    glassware: 'Coupe',
    garnish: 'brandied cherry',
    technique: 'Stir',
    difficulty: 'Intermediate',
    flavor_strength: 8,
    flavor_sweetness: 2,
    flavor_tartness: 1,
    flavor_bitterness: 6,
    flavor_aroma: 8,
    flavor_texture: 6,
    notes:
      'Amer Picon is scarce in the U.S.; Torani Amer or a measured amaro-orange blend is a common substitute. Keep maraschino light.',
    fun_fact:
      'The Brooklyn appears in early twentieth-century New York cocktail lists as a dry counterpart to the Manhattan, typically using Amer Picon and maraschino.',
    fun_fact_source: 'Jack’s Manual and related early New York cocktail sources; David Wondrich, Imbibe!',
    ingredients:
      '2 oz rye whiskey|0.75 oz dry vermouth|0.25 oz Amer Picon|0.25 oz maraschino liqueur',
    instructions:
      '1. Add rye, dry vermouth, Amer Picon, and maraschino to a mixing glass with ice. 2. Stir until well chilled. 3. Strain into a chilled coupe. 4. Garnish with a brandied cherry.',
  },
  {
    slug: 'bramble',
    name: 'Bramble',
    short_description:
      'A modern gin sour served over crushed ice with a crème de mûre drizzle.',
    long_description:
      'The Bramble is a gin-lemon-sugar sour finished with blackberry liqueur over crushed ice. Gin and citrus stay bright underneath, while crème de mûre bleeds through the ice for fruit sweetness and color. Built as a shaken sour then assembled over pebble or crushed ice, it is refreshing and distinctly 1980s London in origin. Dick Bradsell created the drink at Fred’s Club.',
    seo_description:
      'Shake a Bramble with gin, lemon, sugar, and crème de mûre for a modern blackberry gin sour.',
    base_spirit: 'Gin',
    category_primary: 'Sour',
    categories_all: 'modern-classic|sour|gin|berry',
    tags: 'gin|lemon|blackberry|crème-de-mûre|crushed-ice',
    image_alt:
      'Bramble served over crushed ice in a rocks glass, pale with a dark berry drizzle, garnished with blackberry and lemon.',
    glassware: 'Rocks glass',
    garnish: 'fresh blackberry|lemon slice',
    technique: 'Shake',
    difficulty: 'Easy',
    flavor_strength: 5,
    flavor_sweetness: 5,
    flavor_tartness: 6,
    flavor_bitterness: 1,
    flavor_aroma: 6,
    flavor_texture: 5,
    notes:
      'Drizzle the crème de mûre after shaking so it streaks through the ice. Crushed ice is part of the drink’s identity.',
    fun_fact:
      'Dick Bradsell created the Bramble in London in the 1980s, helping define the modern British gin-sour revival.',
    fun_fact_source: 'Dick Bradsell cocktail histories; Difford’s Guide summaries',
    ingredients:
      '2 oz gin|1 oz fresh lemon juice|0.5 oz simple syrup|0.5 oz crème de mûre',
    instructions:
      '1. Shake gin, lemon juice, and simple syrup with ice. 2. Strain into a rocks glass filled with crushed ice. 3. Drizzle crème de mûre over the top. 4. Garnish with a blackberry and lemon slice.',
  },
  {
    slug: 'caipirinha',
    name: 'Caipirinha',
    short_description:
      'Brazil’s national cocktail of cachaça muddled with lime and sugar over ice.',
    long_description:
      'The Caipirinha is a built muddled sour that depends on ripe lime, sugar, and cachaça rather than measured citrus juice alone. Muddling the lime releases oils from the peel as well as juice, giving the drink a sharper aromatic edge than a shaken daiquiri-style sour. Served over ice in the glass it is built in, it is rustic, bright, and spirit-forward. It is widely treated as Brazil’s national cocktail.',
    seo_description:
      'Build a Caipirinha with cachaça, lime, and sugar for Brazil’s classic muddled cocktail.',
    base_spirit: 'Cachaça',
    category_primary: 'Sour',
    categories_all: 'classic|sour|brazilian|muddled',
    tags: 'cachaça|lime|sugar|built|muddled',
    image_alt:
      'Caipirinha served in a rocks glass over ice with muddled lime wedges.',
    glassware: 'Rocks glass',
    garnish: 'lime wedge',
    technique: 'Build',
    difficulty: 'Easy',
    flavor_strength: 7,
    flavor_sweetness: 4,
    flavor_tartness: 7,
    flavor_bitterness: 1,
    flavor_aroma: 7,
    flavor_texture: 5,
    notes:
      'Muddle firmly enough to release juice and oils without shredding the lime into bitterness. Use true cachaça, not white rum.',
    fun_fact:
      'The Caipirinha is recognized as Brazil’s national cocktail and is defined by cachaça muddled with lime and sugar rather than a shaken juice sour.',
    fun_fact_source: 'IBA cocktail listings; Brazilian spirits histories',
    ingredients: '2 oz cachaça|1 lime cut into wedges|2 tsp granulated sugar',
    instructions:
      '1. Add lime wedges and sugar to a rocks glass and muddle to extract juice and oils. 2. Fill the glass with ice. 3. Add cachaça. 4. Stir briefly to combine and serve.',
  },
  {
    slug: 'pisco-sour',
    name: 'Pisco Sour',
    short_description:
      'A South American pisco sour with lemon or lime, syrup, egg white, and bitters.',
    long_description:
      'The Pisco Sour emulsifies pisco, citrus, sugar, and egg white into a silky shaken sour with a dense foam cap. Pisco’s grape character stays clear under bright acidity, while bitters dotted on the foam add aroma more than bitterness. Served up, it is one of the core egg-white sours in the international canon. Peru and Chile both claim versions; the Lima bar tradition associated with the Morris Bar is especially influential.',
    seo_description:
      'Shake a Pisco Sour with pisco, citrus, simple syrup, and egg white for a classic South American sour.',
    base_spirit: 'Pisco',
    category_primary: 'Sour',
    categories_all: 'classic|sour|egg-white|south-american',
    tags: 'pisco|lemon|egg-white|bitters|shaken',
    image_alt:
      'Pisco Sour served in a chilled coupe with a dense white foam and Angostura dots.',
    glassware: 'Coupe',
    garnish: 'Angostura bitters dots',
    technique: 'Shake',
    difficulty: 'Intermediate',
    flavor_strength: 6,
    flavor_sweetness: 4,
    flavor_tartness: 6,
    flavor_bitterness: 2,
    flavor_aroma: 7,
    flavor_texture: 8,
    notes:
      'Dry-shake first for foam, then shake with ice. Peruvian style often uses lime; many U.S. bars use lemon. Either is acceptable if labeled consistently.',
    fun_fact:
      'The modern Pisco Sour is closely associated with early twentieth-century Lima, especially the Morris Bar tradition popularized by bartender Victor Morris’s circle.',
    fun_fact_source: 'Peruvian cocktail histories; IBA Pisco Sour notes',
    ingredients:
      '2 oz pisco|1 oz fresh lemon juice|0.75 oz simple syrup|1 egg white|3 dashes Angostura bitters',
    instructions:
      '1. Dry-shake pisco, lemon juice, simple syrup, and egg white without ice. 2. Add ice and shake again until cold. 3. Fine-strain into a chilled coupe. 4. Dot Angostura bitters on the foam.',
  },
  {
    slug: 'vesper',
    name: 'Vesper',
    short_description:
      'A shaken Martini variation of gin, vodka, and Lillet Blanc from Casino Royale.',
    long_description:
      'The Vesper combines gin and vodka with Lillet Blanc instead of dry vermouth, then is shaken and served up with a lemon peel. Gin carries the botanical frame, vodka lightens texture, and Lillet adds winey citrus bitterness distinct from vermouth. The formula is literary in origin and more aromatic than an extra-dry Martini. Ian Fleming published the recipe in Casino Royale in 1953.',
    seo_description:
      'Shake a Vesper with gin, vodka, and Lillet Blanc for the classic Casino Royale Martini variation.',
    base_spirit: 'Gin',
    category_primary: 'Spirit-Forward',
    categories_all: 'classic|spirit-forward|martini-family|literary',
    tags: 'gin|vodka|lillet|shaken|martini',
    image_alt:
      'Vesper served in a chilled cocktail glass, clear and pale, garnished with a large lemon peel.',
    glassware: 'Cocktail glass',
    garnish: 'lemon peel',
    technique: 'Shake',
    difficulty: 'Easy',
    flavor_strength: 9,
    flavor_sweetness: 2,
    flavor_tartness: 1,
    flavor_bitterness: 3,
    flavor_aroma: 7,
    flavor_texture: 7,
    notes:
      'Lillet Blanc replaced Kina Lillet after reformulation; Cocchi Americano is a common more bitter alternative. Shake as specified, then serve immediately.',
    fun_fact:
      'Ian Fleming introduced the Vesper in Casino Royale (1953), specifying gin, vodka, and Kina Lillet shaken and finished with a lemon peel.',
    fun_fact_source: 'Ian Fleming, Casino Royale (1953)',
    ingredients: '3 oz gin|1 oz vodka|0.5 oz Lillet Blanc',
    instructions:
      '1. Add gin, vodka, and Lillet Blanc to a shaker with ice. 2. Shake until very cold. 3. Strain into a chilled cocktail glass. 4. Garnish with a large lemon peel.',
  },
  {
    slug: 'zombie',
    name: 'Zombie',
    short_description:
      'A strong multi-rum tiki sour with citrus, falernum, grenadine, and absinthe.',
    long_description:
      'The Zombie is a high-powered tiki drink built on more than one rum, sharpened with citrus, and seasoned with falernum, grenadine, and absinthe. Light and dark rums create depth, lime and grapefruit keep the drink from collapsing into sweetness, and the spice accents give it a medicinal aromatic edge. Served tall over crushed ice, it is intentionally potent. Donn Beach created the original at Don the Beachcomber in the 1930s.',
    seo_description:
      'Build a Zombie with blended rums, citrus, falernum, and absinthe for a classic Donn Beach tiki cocktail.',
    base_spirit: 'Rum',
    category_primary: 'Tiki',
    categories_all: 'classic|tiki|rum|strong',
    tags: 'rum|falernum|lime|grapefruit|absinthe|tiki',
    image_alt:
      'Zombie served in a tall tiki or chimney glass over crushed ice, garnished with mint.',
    glassware: 'Highball glass',
    garnish: 'mint sprig',
    technique: 'Shake',
    difficulty: 'Advanced',
    flavor_strength: 9,
    flavor_sweetness: 5,
    flavor_tartness: 6,
    flavor_bitterness: 2,
    flavor_aroma: 8,
    flavor_texture: 5,
    notes:
      'This is a modern serviceable build, not a claim to Donn Beach’s secret original. Limit to one serving; the drink is designed to be strong.',
    fun_fact:
      'Donn Beach created the Zombie at Don the Beachcomber in the 1930s; the original formula was closely guarded and later reconstructed by tiki historians.',
    fun_fact_source: 'Jeff Berry, Sippin’ Safari; Don the Beachcomber histories',
    ingredients:
      '1 oz white rum|1 oz gold rum|1 oz dark rum|0.75 oz fresh lime juice|0.75 oz fresh grapefruit juice|0.5 oz falernum|0.25 oz grenadine|1 dash absinthe|2 dashes Angostura bitters',
    instructions:
      '1. Add all ingredients to a shaker with ice. 2. Shake until well chilled. 3. Strain into a tall glass filled with crushed ice. 4. Garnish with a mint sprig.',
  },
  {
    slug: 'hot-toddy',
    name: 'Hot Toddy',
    short_description:
      'A hot whiskey drink with honey, lemon, and hot water, optionally seasoned with bitters or spice.',
    long_description:
      'The Hot Toddy is a hot built drink rather than a cold cocktail template, combining whiskey, honey, lemon, and hot water. Whiskey provides warmth and body, honey sweetens and softens, and lemon keeps the finish from tasting flat. Served in a warmed mug, it is simple, restorative, and highly adjustable. Versions appear across British and American drink traditions under related toddy names.',
    seo_description:
      'Build a Hot Toddy with whiskey, honey, lemon, and hot water for a classic warm whiskey drink.',
    base_spirit: 'Whiskey',
    category_primary: 'Hot',
    categories_all: 'classic|hot|whiskey|restorative',
    tags: 'whiskey|honey|lemon|hot|built',
    image_alt:
      'Hot Toddy served in a warmed mug, amber in color, garnished with a lemon wheel.',
    glassware: 'Mug',
    garnish: 'lemon wheel|optional clove',
    technique: 'Build',
    difficulty: 'Easy',
    flavor_strength: 6,
    flavor_sweetness: 5,
    flavor_tartness: 4,
    flavor_bitterness: 1,
    flavor_aroma: 6,
    flavor_texture: 5,
    notes:
      'Warm the mug first. Add hot water last and stir to dissolve honey fully. Bourbon, rye, or Scotch all work; choose based on desired spice or smoke.',
    fun_fact:
      'Toddy-style hot spirits drinks appear in British and American sources long before the cocktail age, later settling into the familiar whiskey-honey-lemon mug format.',
    fun_fact_source: 'Historical toddy references in British and American drink writing',
    ingredients:
      '2 oz whiskey|0.75 oz honey|0.5 oz fresh lemon juice|4 oz hot water|2 dashes Angostura bitters (optional)',
    instructions:
      '1. Warm a mug with hot water and discard. 2. Add whiskey, honey, lemon juice, and optional bitters. 3. Top with hot water and stir until honey dissolves. 4. Garnish with a lemon wheel.',
  },
  {
    slug: 'paradise',
    name: 'Paradise',
    short_description:
      'A gin sour brightened with apricot brandy and orange juice.',
    long_description:
      'The Paradise is a shaken gin cocktail that pairs apricot brandy with orange juice for a soft fruit profile. Gin keeps botanical structure, apricot adds stone-fruit sweetness, and orange juice rounds acidity without the sharper snap of lemon. Served up, it is lighter and fruitier than a White Lady or Aviation. Harry Craddock included it in the Savoy Cocktail Book.',
    seo_description:
      'Shake a Paradise with gin, apricot brandy, and orange juice for a classic Savoy-era cocktail.',
    base_spirit: 'Gin',
    category_primary: 'Sour',
    categories_all: 'classic|sour|gin|savoy',
    tags: 'gin|apricot|orange|shaken|fruit',
    image_alt:
      'Paradise served in a chilled coupe, soft orange-gold in color, no garnish required.',
    glassware: 'Coupe',
    garnish: 'None',
    technique: 'Shake',
    difficulty: 'Easy',
    flavor_strength: 5,
    flavor_sweetness: 5,
    flavor_tartness: 3,
    flavor_bitterness: 1,
    flavor_aroma: 6,
    flavor_texture: 5,
    notes:
      'Use real apricot brandy or quality apricot liqueur; cheap “apricot brandy” can taste artificial. Fresh orange juice matters.',
    fun_fact:
      'Harry Craddock’s Savoy Cocktail Book (1930) includes the Paradise among gin drinks built with apricot brandy and orange juice.',
    fun_fact_source: 'Harry Craddock, The Savoy Cocktail Book (1930)',
    ingredients: '1.5 oz gin|0.75 oz apricot brandy|0.75 oz fresh orange juice',
    instructions:
      '1. Add gin, apricot brandy, and orange juice to a shaker with ice. 2. Shake until well chilled. 3. Strain into a chilled coupe. 4. Serve without garnish.',
  },
  {
    slug: 'stinger',
    name: 'Stinger',
    short_description:
      'A simple stirred duo of Cognac and white crème de menthe served up or over ice.',
    long_description:
      'The Stinger is a two-ingredient Cognac cocktail seasoned with white crème de menthe. Cognac supplies richness and dried fruit, while mint liqueur cools the finish and lightens the texture. Stirred and served up or on crushed ice depending on house style, it is blunt, aromatic, and unmistakably mid-century. The drink was a staple of American society bars in the early and mid-twentieth century.',
    seo_description:
      'Stir a Stinger with Cognac and white crème de menthe for a classic minty brandy cocktail.',
    base_spirit: 'Cognac',
    category_primary: 'Spirit-Forward',
    categories_all: 'classic|spirit-forward|brandy|after-dinner',
    tags: 'cognac|creme-de-menthe|mint|stirred',
    image_alt:
      'Stinger served in a chilled coupe, clear and pale, no garnish.',
    glassware: 'Coupe',
    garnish: 'None',
    technique: 'Stir',
    difficulty: 'Easy',
    flavor_strength: 7,
    flavor_sweetness: 5,
    flavor_tartness: 0,
    flavor_bitterness: 1,
    flavor_aroma: 8,
    flavor_texture: 6,
    notes:
      'White crème de menthe keeps the drink clear; green crème de menthe makes a different presentation. Keep the mint measure restrained.',
    fun_fact:
      'The Stinger became a society-bar favorite in the United States in the early twentieth century as a short Cognac-and-mint digestif style drink.',
    fun_fact_source: 'American society-bar cocktail histories; Embury and mid-century manuals',
    ingredients: '2 oz Cognac|0.5 oz white crème de menthe',
    instructions:
      '1. Add Cognac and white crème de menthe to a mixing glass with ice. 2. Stir until well chilled. 3. Strain into a chilled coupe. 4. Serve without garnish.',
  },
  {
    slug: 'tuxedo',
    name: 'Tuxedo',
    short_description:
      'A gin Martini variation with dry vermouth, maraschino, absinthe, and orange bitters.',
    long_description:
      'The Tuxedo elaborates the Martini with maraschino, absinthe, and orange bitters. Gin and dry vermouth remain the frame, while maraschino adds light sweetness and absinthe contributes a brief anise perfume. Stirred and served up, it is more aromatic and slightly richer than a standard dry Martini. Multiple Tuxedo recipes exist; this version follows the common modern equal-parts gin-and-vermouth style with accents.',
    seo_description:
      'Stir a Tuxedo with gin, dry vermouth, maraschino, absinthe, and orange bitters for a classic Martini variation.',
    base_spirit: 'Gin',
    category_primary: 'Spirit-Forward',
    categories_all: 'classic|spirit-forward|martini-family',
    tags: 'gin|vermouth|maraschino|absinthe|stirred',
    image_alt:
      'Tuxedo served in a chilled coupe, clear and pale, garnished with a cherry or lemon twist.',
    glassware: 'Coupe',
    garnish: 'brandied cherry|lemon twist',
    technique: 'Stir',
    difficulty: 'Intermediate',
    flavor_strength: 7,
    flavor_sweetness: 3,
    flavor_tartness: 1,
    flavor_bitterness: 3,
    flavor_aroma: 8,
    flavor_texture: 6,
    notes:
      'Absinthe should be a rinse or scant dash. Choose cherry or lemon twist based on whether you want fruit or citrus oils.',
    fun_fact:
      'Tuxedo cocktails appear in late nineteenth- and early twentieth-century manuals as Martini-family drinks associated with the Tuxedo Club social set.',
    fun_fact_source: 'Early American cocktail manuals; David Wondrich, Imbibe!',
    ingredients:
      '2 oz gin|1 oz dry vermouth|0.25 oz maraschino liqueur|1 dash absinthe|2 dashes orange bitters',
    instructions:
      '1. Add gin, dry vermouth, maraschino, absinthe, and orange bitters to a mixing glass with ice. 2. Stir until well chilled. 3. Strain into a chilled coupe. 4. Garnish with a brandied cherry or lemon twist.',
  },
  {
    slug: 'army-navy',
    name: "Army & Navy",
    short_description:
      'A gin sour flavored with orgeat and lemon for almond richness.',
    long_description:
      'The Army & Navy is a gin-lemon sour sweetened with orgeat rather than plain syrup. Gin botanicals stay present, lemon keeps the drink bright, and orgeat adds almond body and a soft floral finish. Shaken and served up, it is richer than a Bee’s Knees but still clearly a sour. David Embury helped keep the drink in circulation in the mid-twentieth century.',
    seo_description:
      'Shake an Army & Navy with gin, lemon juice, and orgeat for a classic almond gin sour.',
    base_spirit: 'Gin',
    category_primary: 'Sour',
    categories_all: 'classic|sour|gin|orgeat',
    tags: 'gin|lemon|orgeat|shaken|almond',
    image_alt:
      'Army & Navy served in a chilled coupe, pale opaque gold in color, garnished with a lemon twist.',
    glassware: 'Coupe',
    garnish: 'lemon twist',
    technique: 'Shake',
    difficulty: 'Easy',
    flavor_strength: 6,
    flavor_sweetness: 5,
    flavor_tartness: 6,
    flavor_bitterness: 1,
    flavor_aroma: 7,
    flavor_texture: 6,
    notes:
      'Quality orgeat matters; artificial almond syrup flattens the drink. A dash of orange bitters is optional but traditional in some versions.',
    fun_fact:
      'David Embury included the Army & Navy in The Fine Art of Mixing Drinks, helping preserve the orgeat gin sour beyond its earlier service-bar life.',
    fun_fact_source: 'David Embury, The Fine Art of Mixing Drinks',
    ingredients:
      '2 oz gin|0.75 oz fresh lemon juice|0.75 oz orgeat syrup|2 dashes orange bitters',
    instructions:
      '1. Add gin, lemon juice, orgeat, and orange bitters to a shaker with ice. 2. Shake until well chilled. 3. Fine-strain into a chilled coupe. 4. Garnish with a lemon twist.',
  },
  {
    slug: 'remember-the-maine',
    name: 'Remember the Maine',
    short_description:
      'A rye Manhattan variation with cherry liqueur and an absinthe rinse.',
    long_description:
      'Remember the Maine follows Manhattan architecture with rye, sweet vermouth, and cherry liqueur, then adds an absinthe rinse for aroma. Rye and vermouth provide the backbone, cherry liqueur deepens fruit sweetness, and absinthe lifts the top note. Stirred and served up, it is richer than a standard Manhattan and clearly pre-tiki American in tone. Charles H. Baker recorded the drink in 1939.',
    seo_description:
      'Stir a Remember the Maine with rye, sweet vermouth, cherry liqueur, and absinthe for a classic Manhattan variation.',
    base_spirit: 'Rye',
    category_primary: 'Spirit-Forward',
    categories_all: 'classic|spirit-forward|manhattan-family',
    tags: 'rye|vermouth|cherry-heering|absinthe|stirred',
    image_alt:
      'Remember the Maine served in a chilled coupe, deep red-amber in color, garnished with a cherry.',
    glassware: 'Coupe',
    garnish: 'brandied cherry',
    technique: 'Stir',
    difficulty: 'Intermediate',
    flavor_strength: 8,
    flavor_sweetness: 4,
    flavor_tartness: 1,
    flavor_bitterness: 4,
    flavor_aroma: 8,
    flavor_texture: 6,
    notes:
      'Rinse the glass with absinthe and discard the excess. Cherry Heering is the usual cherry liqueur; keep it below the vermouth measure.',
    fun_fact:
      'Charles H. Baker published Remember the Maine in The Gentleman’s Companion (1939), tying the drink’s name to the 1898 USS Maine slogan.',
    fun_fact_source: "Charles H. Baker, The Gentleman’s Companion (1939)",
    ingredients:
      '2 oz rye whiskey|0.75 oz sweet vermouth|0.25 oz cherry liqueur|absinthe rinse|2 dashes Angostura bitters',
    instructions:
      '1. Rinse a chilled coupe with absinthe and discard the excess. 2. Stir rye, sweet vermouth, cherry liqueur, and Angostura with ice. 3. Strain into the prepared glass. 4. Garnish with a brandied cherry.',
  },
  {
    slug: 'porto-flip',
    name: 'Porto Flip',
    short_description:
      'A rich flip of brandy, ruby port, and whole egg finished with grated nutmeg.',
    long_description:
      'The Porto Flip is a classic egg drink that blends brandy and ruby port into a thick, dessert-leaning cocktail. Brandy adds structure, port contributes wine sweetness and color, and the whole egg creates a dense foam and creamy texture. Shaken hard and served up with nutmeg, it sits closer to a flip than a sour. The IBA includes it among traditional flips.',
    seo_description:
      'Shake a Porto Flip with brandy, ruby port, and egg for a classic nutmeg-finished flip cocktail.',
    base_spirit: 'Brandy',
    category_primary: 'Dessert',
    categories_all: 'classic|dessert|flip|brandy|port',
    tags: 'brandy|port|egg|nutmeg|shake|flip',
    image_alt:
      'Porto Flip served in a chilled coupe, deep red-brown with foam, dusted with nutmeg.',
    glassware: 'Coupe',
    garnish: 'grated nutmeg',
    technique: 'Shake',
    difficulty: 'Intermediate',
    flavor_strength: 6,
    flavor_sweetness: 6,
    flavor_tartness: 1,
    flavor_bitterness: 2,
    flavor_aroma: 7,
    flavor_texture: 9,
    notes:
      'Dry-shake first for texture, then shake with ice. Use a fresh egg and a ruby port with enough body to stand up to the brandy.',
    fun_fact:
      'The Porto Flip is listed by the International Bartenders Association as a classic flip combining brandy, port, and egg.',
    fun_fact_source: 'International Bartenders Association',
    ingredients: '1.5 oz brandy|1.5 oz ruby port|1 whole egg|grated nutmeg',
    instructions:
      '1. Dry-shake brandy, ruby port, and egg without ice. 2. Add ice and shake again until cold and thick. 3. Fine-strain into a chilled coupe. 4. Garnish with freshly grated nutmeg.',
  },
  {
    slug: 'french-connection',
    name: 'French Connection',
    short_description:
      'A simple after-dinner duo of Cognac and amaretto served over ice.',
    long_description:
      'The French Connection is a two-ingredient stirred drink pairing Cognac with amaretto. Cognac supplies dried-fruit richness and warmth, while amaretto adds almond sweetness and softens the finish. Served over ice, it is intentionally simple and dessert-adjacent without cream or juice. The IBA recognizes the combination as a contemporary classic duo.',
    seo_description:
      'Build a French Connection with Cognac and amaretto for a classic two-ingredient after-dinner drink.',
    base_spirit: 'Cognac',
    category_primary: 'Spirit-Forward',
    categories_all: 'classic|spirit-forward|brandy|after-dinner',
    tags: 'cognac|amaretto|built|duo',
    image_alt:
      'French Connection served in a rocks glass over ice, deep amber in color, no garnish.',
    glassware: 'Rocks glass',
    garnish: 'None',
    technique: 'Build',
    difficulty: 'Easy',
    flavor_strength: 7,
    flavor_sweetness: 6,
    flavor_tartness: 0,
    flavor_bitterness: 1,
    flavor_aroma: 7,
    flavor_texture: 6,
    notes:
      'Equal parts are standard. Prefer a VS or VSOP Cognac; amaretto quality strongly affects the finish.',
    fun_fact:
      'The French Connection appears on the IBA’s contemporary classics list as a short Cognac-and-amaretto combination.',
    fun_fact_source: 'International Bartenders Association',
    ingredients: '1.5 oz Cognac|1.5 oz amaretto',
    instructions:
      '1. Add Cognac and amaretto to a rocks glass filled with ice. 2. Stir briefly to chill and combine. 3. Serve without garnish.',
  },
];

function csvEscape(value: string | number): string {
  const s = String(value ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function main() {
  const headers = [
    'ID',
    'slug',
    'name',
    'short_description',
    'long_description',
    'seo_description',
    'base_spirit',
    'category_primary',
    'categories_all',
    'tags',
    'image_url',
    'image_alt',
    'glassware',
    'garnish',
    'technique',
    'difficulty',
    'flavor_strength',
    'flavor_sweetness',
    'flavor_tartness',
    'flavor_bitterness',
    'flavor_aroma',
    'flavor_texture',
    'notes',
    'fun_fact',
    'fun_fact_source',
    'metadata_json',
    'ingredients',
    'instructions',
  ];

  const rows = drafts.map((d, i) => {
    const id = `mw_review_001_${String(i + 1).padStart(3, '0')}`;
    return [
      id,
      d.slug,
      d.name,
      d.short_description,
      d.long_description,
      d.seo_description,
      d.base_spirit,
      d.category_primary,
      d.categories_all,
      d.tags,
      '',
      d.image_alt,
      d.glassware,
      d.garnish,
      d.technique,
      d.difficulty,
      d.flavor_strength,
      d.flavor_sweetness,
      d.flavor_tartness,
      d.flavor_bitterness,
      d.flavor_aroma,
      d.flavor_texture,
      d.notes,
      d.fun_fact,
      d.fun_fact_source,
      '{}',
      d.ingredients,
      d.instructions,
    ]
      .map(csvEscape)
      .join(',');
  });

  const out = path.join(process.cwd(), 'data', 'review-batch-001.csv');
  fs.writeFileSync(out, [headers.join(','), ...rows].join('\n') + '\n', 'utf8');
  console.log(`Wrote ${drafts.length} drinks → ${out}`);
  console.log(drafts.map((d) => d.slug).join('\n'));
}

main();
