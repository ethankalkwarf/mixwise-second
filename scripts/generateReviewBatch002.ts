#!/usr/bin/env tsx
/**
 * Generate review-batch-002.csv — summer, party, and themed drinks.
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
  {
    slug: 'long-island-iced-tea',
    name: 'Long Island Iced Tea',
    short_description:
      'A party-ready highball of five white spirits, triple sec, lemon, and cola.',
    long_description:
      'The Long Island Iced Tea combines vodka, gin, rum, tequila, and triple sec with lemon juice and a cola top. Despite the name, it contains no tea; the cola simply gives the drink its iced-tea color. Built as a shaken sour then finished with soda, it is strong, citrusy, and designed for volume service. It became a staple of late-twentieth-century American nightlife.',
    seo_description:
      'Shake a Long Island Iced Tea with vodka, gin, rum, tequila, triple sec, lemon, and cola for a classic party cocktail.',
    base_spirit: 'Vodka',
    category_primary: 'Highball',
    categories_all: 'party|highball|summer|classic',
    tags: 'vodka|gin|rum|tequila|cola|lemon|party',
    image_alt:
      'Long Island Iced Tea served in a highball glass over ice, cola-tea color, garnished with a lemon wedge.',
    glassware: 'Highball glass',
    garnish: 'lemon wedge',
    technique: 'Shake',
    difficulty: 'Easy',
    flavor_strength: 9,
    flavor_sweetness: 4,
    flavor_tartness: 5,
    flavor_bitterness: 1,
    flavor_aroma: 5,
    flavor_texture: 5,
    notes:
      'Keep each spirit measure equal and modest; the drink is already potent. Cola is a float/top, not the base mixer.',
    fun_fact:
      'The Long Island Iced Tea is widely linked to 1970s Long Island bar culture; Robert “Rosebud” Butt is often credited with popularizing the modern cola-finished version.',
    fun_fact_source: 'American bar histories; Difford’s Guide summaries',
    ingredients:
      '0.5 oz vodka|0.5 oz gin|0.5 oz white rum|0.5 oz blanco tequila|0.5 oz triple sec|1 oz fresh lemon juice|0.5 oz simple syrup|2 oz cola',
    instructions:
      '1. Shake vodka, gin, rum, tequila, triple sec, lemon juice, and simple syrup with ice. 2. Strain into a highball glass filled with ice. 3. Top with cola and stir once. 4. Garnish with a lemon wedge.',
  },
  {
    slug: 'sangria',
    name: 'Sangria',
    short_description:
      'A Spanish wine punch with citrus, brandy, and fresh fruit for sharing.',
    long_description:
      'Sangria is a wine-based punch built for pitchers rather than single serves. Red wine provides the body, brandy adds strength, and citrus with seasonal fruit sweetens and brightens the mix. Served over ice, it is flexible, communal, and strongly associated with warm-weather entertaining. Proportions vary by region and household, but the wine-fruit-citrus frame remains constant.',
    seo_description:
      'Build a Sangria with red wine, brandy, citrus, and fresh fruit for a classic Spanish summer punch.',
    base_spirit: 'Brandy',
    category_primary: 'Punch',
    categories_all: 'party|punch|summer|spanish|sharing',
    tags: 'wine|brandy|citrus|fruit|pitcher|summer',
    image_alt:
      'Sangria served in a wine glass over ice with citrus and berry fruit floating.',
    glassware: 'Wine glass',
    garnish: 'orange wheel|seasonal berries',
    technique: 'Build',
    difficulty: 'Easy',
    flavor_strength: 4,
    flavor_sweetness: 5,
    flavor_tartness: 4,
    flavor_bitterness: 1,
    flavor_aroma: 6,
    flavor_texture: 4,
    notes:
      'Rest the mixture cold for at least an hour so fruit flavor integrates. Add soda water only at service if you want lift without diluting the batch early.',
    fun_fact:
      'Sangria is rooted in Iberian wine-and-fruit drinking traditions and became an international summer staple after broader exposure through Spanish hospitality and export culture.',
    fun_fact_source: 'Spanish wine histories; modern punch guides',
    ingredients:
      '1 bottle dry red wine|3 oz brandy|2 oz orange liqueur|2 oz fresh orange juice|1 oz fresh lemon juice|2 oz simple syrup|1 orange sliced|1 lemon sliced|1 cup mixed berries|optional soda water to taste',
    instructions:
      '1. Combine wine, brandy, orange liqueur, juices, syrup, and fruit in a pitcher. 2. Chill at least 1 hour. 3. Serve over ice in wine glasses. 4. Top with a splash of soda water if desired and garnish with fruit.',
  },
  {
    slug: 'strawberry-daiquiri',
    name: 'Strawberry Daiquiri',
    short_description:
      'A frozen rum sour blended with strawberries for a bright summer serve.',
    long_description:
      'The Strawberry Daiquiri applies the classic rum-lime-sugar sour to ripe strawberries, usually as a blended frozen drink. Rum keeps the structure, lime sharpens the fruit, and ice creates a slush texture suited to hot weather. Served in a stemmed or specialty glass, it is one of the most recognizable summer cocktail variations. Fresh or frozen berries both work when balanced carefully.',
    seo_description:
      'Blend a Strawberry Daiquiri with white rum, lime, strawberries, and ice for a classic frozen summer cocktail.',
    base_spirit: 'Rum',
    category_primary: 'Sour',
    categories_all: 'summer|sour|frozen|party|tropical',
    tags: 'rum|strawberry|lime|frozen|blended|summer',
    image_alt:
      'Strawberry Daiquiri served frozen in a coupe, pink-red slush texture, garnished with a strawberry.',
    glassware: 'Coupe',
    garnish: 'fresh strawberry',
    technique: 'Blend',
    difficulty: 'Easy',
    flavor_strength: 5,
    flavor_sweetness: 6,
    flavor_tartness: 5,
    flavor_bitterness: 0,
    flavor_aroma: 6,
    flavor_texture: 7,
    notes:
      'Taste for sweetness after blending; ripe strawberries need less syrup. Avoid over-diluting with too much ice.',
    fun_fact:
      'Fruit daiquiri variations proliferated in mid-century American bars as blenders made frozen citrus-rum drinks practical for high-volume summer service.',
    fun_fact_source: 'Mid-century American cocktail service histories',
    ingredients:
      '2 oz white rum|1 oz fresh lime juice|0.75 oz simple syrup|1 cup strawberries|1 cup ice',
    instructions:
      '1. Add rum, lime juice, simple syrup, strawberries, and ice to a blender. 2. Blend until smooth and thick. 3. Pour into a chilled coupe. 4. Garnish with a fresh strawberry.',
  },
  {
    slug: 'blue-hawaiian',
    name: 'Blue Hawaiian',
    short_description:
      'A turquoise rum highball with pineapple, coconut, and blue curaçao.',
    long_description:
      'The Blue Hawaiian is a tropical rum drink colored and flavored with blue curaçao, then rounded with pineapple and coconut. It sits in the same family as the Blue Hawaii but leans creamier when coconut cream is used. Served over ice or frozen, it is explicitly festive and summer-coded. The vivid color is part of the drink’s identity as a party cocktail.',
    seo_description:
      'Build a Blue Hawaiian with rum, blue curaçao, pineapple, and coconut for a classic tropical party cocktail.',
    base_spirit: 'Rum',
    category_primary: 'Tiki',
    categories_all: 'summer|tiki|party|tropical|highball',
    tags: 'rum|blue-curacao|pineapple|coconut|tropical',
    image_alt:
      'Blue Hawaiian served in a highball glass over ice, bright turquoise, garnished with pineapple and cherry.',
    glassware: 'Highball glass',
    garnish: 'pineapple wedge|cherry',
    technique: 'Shake',
    difficulty: 'Easy',
    flavor_strength: 5,
    flavor_sweetness: 7,
    flavor_tartness: 3,
    flavor_bitterness: 1,
    flavor_aroma: 6,
    flavor_texture: 6,
    notes:
      'Use coconut cream for body; coconut milk makes a thinner drink. Shake hard so the pineapple and coconut emulsify.',
    fun_fact:
      'Harry Yee is credited with creating the related Blue Hawaii in Honolulu in the 1950s; the Blue Hawaiian developed as a coconut-leaning cousin in tropical bar menus.',
    fun_fact_source: 'Hawaiian bar histories; Harry Yee cocktail attributions',
    ingredients:
      '1.5 oz white rum|0.75 oz blue curaçao|2 oz pineapple juice|0.75 oz coconut cream',
    instructions:
      '1. Shake rum, blue curaçao, pineapple juice, and coconut cream with ice. 2. Strain into a highball glass filled with ice. 3. Garnish with pineapple and a cherry.',
  },
  {
    slug: 'whiskey-smash',
    name: 'Whiskey Smash',
    short_description:
      'A muddled whiskey sour with lemon and mint over crushed ice.',
    long_description:
      'The Whiskey Smash is a citrus-and-mint whiskey drink closely related to the julep and the smash family of nineteenth-century cocktails. Muddled lemon and mint perfume the whiskey, while sugar softens the edges. Served over crushed ice, it is colder and more refreshing than a standard whiskey sour. It is especially well suited to warm weather and outdoor entertaining.',
    seo_description:
      'Build a Whiskey Smash with whiskey, lemon, mint, and sugar over crushed ice for a classic summer smash.',
    base_spirit: 'Whiskey',
    category_primary: 'Sour',
    categories_all: 'summer|sour|smash|whiskey|party',
    tags: 'whiskey|lemon|mint|crushed-ice|smash',
    image_alt:
      'Whiskey Smash served over crushed ice in a rocks glass, garnished with mint and lemon.',
    glassware: 'Rocks glass',
    garnish: 'mint sprig|lemon wheel',
    technique: 'Shake',
    difficulty: 'Easy',
    flavor_strength: 7,
    flavor_sweetness: 4,
    flavor_tartness: 6,
    flavor_bitterness: 1,
    flavor_aroma: 8,
    flavor_texture: 5,
    notes:
      'Muddle lemon just enough to release juice and oils; over-muddling pith adds bitterness. Use plenty of mint in the garnish for aroma.',
    fun_fact:
      'Smashes appear in nineteenth-century American bar manuals as spirit drinks built with seasonal fruit or citrus and ice, later settling into mint-forward whiskey versions.',
    fun_fact_source: 'Jerry Thomas era smash recipes; modern craft-bar smash revivals',
    ingredients:
      '2 oz whiskey|0.75 oz simple syrup|half a lemon cut into wedges|8 mint leaves|crushed ice',
    instructions:
      '1. Muddle lemon wedges, mint, and simple syrup in a shaker. 2. Add whiskey and ice; shake briefly. 3. Strain into a rocks glass filled with crushed ice. 4. Garnish with mint and a lemon wheel.',
  },
  {
    slug: 'new-york-sour',
    name: 'New York Sour',
    short_description:
      'A whiskey sour finished with a red wine float for color and tannin.',
    long_description:
      'The New York Sour starts as a whiskey-lemon-sugar sour, then adds a floated red wine layer. The wine contributes color, fruit, and light tannin that changes the finish without rewriting the sour base. Served up or over ice, it is visually dramatic and still structurally clear. The float is the defining detail that separates it from a standard whiskey sour.',
    seo_description:
      'Shake a New York Sour with whiskey, lemon, and sugar, then float red wine for a classic layered sour.',
    base_spirit: 'Whiskey',
    category_primary: 'Sour',
    categories_all: 'classic|sour|party|whiskey|themed',
    tags: 'whiskey|lemon|red-wine|float|sour',
    image_alt:
      'New York Sour served in a rocks glass over ice with a red wine float and pale sour body.',
    glassware: 'Rocks glass',
    garnish: 'None',
    technique: 'Shake',
    difficulty: 'Intermediate',
    flavor_strength: 7,
    flavor_sweetness: 4,
    flavor_tartness: 6,
    flavor_bitterness: 2,
    flavor_aroma: 6,
    flavor_texture: 6,
    notes:
      'Pour the wine gently over the back of a spoon so it floats. A fruity red such as Malbec or Shiraz works better than a heavily oaky wine.',
    fun_fact:
      'The New York Sour appears in early twentieth-century American sources as a whiskey sour with claret or red wine floated on top.',
    fun_fact_source: 'Early twentieth-century American cocktail manuals',
    ingredients:
      '2 oz whiskey|1 oz fresh lemon juice|0.75 oz simple syrup|0.75 oz red wine|optional egg white',
    instructions:
      '1. Shake whiskey, lemon juice, simple syrup, and optional egg white with ice. 2. Strain into a rocks glass over ice. 3. Slowly float red wine over the back of a spoon. 4. Serve without garnish.',
  },
  {
    slug: 'sloe-gin-fizz',
    name: 'Sloe Gin Fizz',
    short_description:
      'A tall sparkling sour made with sloe gin, lemon, sugar, and soda.',
    long_description:
      'The Sloe Gin Fizz turns tart-sweet sloe gin into a refreshing highball with lemon and soda. Sloe gin’s berry character sits under bright citrus, while carbonation keeps the drink light. Served tall over ice, it is a classic warm-weather fizz with a distinctive red-pink color. Egg white is optional depending on whether you want a denser head.',
    seo_description:
      'Build a Sloe Gin Fizz with sloe gin, lemon, sugar, and soda for a classic sparkling summer cocktail.',
    base_spirit: 'Gin',
    category_primary: 'Fizz',
    categories_all: 'summer|fizz|classic|party|sparkling',
    tags: 'sloe-gin|lemon|soda|fizz|summer',
    image_alt:
      'Sloe Gin Fizz served in a Collins glass over ice, pink-red, topped with soda and lemon.',
    glassware: 'Collins glass',
    garnish: 'lemon wheel',
    technique: 'Shake',
    difficulty: 'Easy',
    flavor_strength: 4,
    flavor_sweetness: 5,
    flavor_tartness: 5,
    flavor_bitterness: 1,
    flavor_aroma: 6,
    flavor_texture: 5,
    notes:
      'Sloe gin brands vary widely in sweetness; adjust syrup before adding soda. Keep the soda cold for better carbonation.',
    fun_fact:
      'Sloe gin cocktails became popular in British and American bars as a way to use the tart berry liqueur in tall sparkling formats.',
    fun_fact_source: 'British and American fizz cocktail histories',
    ingredients:
      '2 oz sloe gin|1 oz fresh lemon juice|0.5 oz simple syrup|3 oz club soda',
    instructions:
      '1. Shake sloe gin, lemon juice, and simple syrup with ice. 2. Strain into a Collins glass filled with ice. 3. Top with club soda and stir gently. 4. Garnish with a lemon wheel.',
  },
  {
    slug: 'pink-lady',
    name: 'Pink Lady',
    short_description:
      'A gin sour with apple brandy, lemon, grenadine, and egg white.',
    long_description:
      'The Pink Lady is a blush-colored gin sour enriched with apple brandy and grenadine, then given foam with egg white. Gin provides botanical structure, apple brandy adds orchard depth, and grenadine supplies color and soft sweetness. Served up, it reads as a classic pre-dinner sour with a distinctly pink presentation. Precise grenadine measure keeps it elegant rather than candy-sweet.',
    seo_description:
      'Shake a Pink Lady with gin, apple brandy, lemon, grenadine, and egg white for a classic pink sour.',
    base_spirit: 'Gin',
    category_primary: 'Sour',
    categories_all: 'classic|sour|party|themed|gin',
    tags: 'gin|apple-brandy|grenadine|egg-white|pink',
    image_alt:
      'Pink Lady served in a chilled coupe, pale pink with foam, no heavy garnish.',
    glassware: 'Coupe',
    garnish: 'None',
    technique: 'Shake',
    difficulty: 'Intermediate',
    flavor_strength: 6,
    flavor_sweetness: 4,
    flavor_tartness: 5,
    flavor_bitterness: 1,
    flavor_aroma: 6,
    flavor_texture: 8,
    notes:
      'Dry-shake first for foam. Keep grenadine modest so the drink stays tart and pink rather than red and syrupy.',
    fun_fact:
      'The Pink Lady appears in early twentieth-century American cocktail books as a gin sour distinguished by grenadine color and apple brandy.',
    fun_fact_source: 'Early twentieth-century American cocktail manuals',
    ingredients:
      '1.5 oz gin|0.5 oz apple brandy|0.75 oz fresh lemon juice|0.25 oz grenadine|1 egg white',
    instructions:
      '1. Dry-shake all ingredients without ice. 2. Add ice and shake again until cold. 3. Fine-strain into a chilled coupe. 4. Serve without garnish.',
  },
  {
    slug: 'alabama-slammer',
    name: 'Alabama Slammer',
    short_description:
      'A sweet Southern party highball of amaretto, sloe gin, whiskey, and orange juice.',
    long_description:
      'The Alabama Slammer is a fruit-forward party drink built from Southern Comfort or whiskey with amaretto, sloe gin, and orange juice. It is sweet, orange-bright, and intentionally easy to batch. Served tall over ice, it belongs to the late-twentieth-century campus and nightlife cocktail canon. Balance depends on restraining the liqueurs so orange juice does not turn the drink into punch syrup.',
    seo_description:
      'Build an Alabama Slammer with whiskey, amaretto, sloe gin, and orange juice for a classic Southern party cocktail.',
    base_spirit: 'Whiskey',
    category_primary: 'Highball',
    categories_all: 'party|highball|summer|southern',
    tags: 'whiskey|amaretto|sloe-gin|orange|party',
    image_alt:
      'Alabama Slammer served in a highball glass over ice, deep orange-red, garnished with an orange slice.',
    glassware: 'Highball glass',
    garnish: 'orange slice|cherry',
    technique: 'Shake',
    difficulty: 'Easy',
    flavor_strength: 5,
    flavor_sweetness: 7,
    flavor_tartness: 3,
    flavor_bitterness: 1,
    flavor_aroma: 5,
    flavor_texture: 5,
    notes:
      'Southern Comfort is traditional in many recipes; straight whiskey makes a drier version. Shake with juice rather than building weakly.',
    fun_fact:
      'The Alabama Slammer became widely known in American college and nightlife bars in the 1970s and 1980s as a sweet multi-liqueur highball.',
    fun_fact_source: 'Late twentieth-century American party cocktail histories',
    ingredients:
      '1 oz whiskey|1 oz amaretto|1 oz sloe gin|2 oz fresh orange juice',
    instructions:
      '1. Shake whiskey, amaretto, sloe gin, and orange juice with ice. 2. Strain into a highball glass filled with ice. 3. Garnish with an orange slice and cherry.',
  },
  {
    slug: 'fuzzy-navel',
    name: 'Fuzzy Navel',
    short_description:
      'A simple peach schnapps and orange juice highball for easy summer drinking.',
    long_description:
      'The Fuzzy Navel is a two-ingredient highball of peach schnapps and orange juice. Peach sweetness leads, orange juice provides body and citrus, and the drink stays light and approachable. Served over ice, it became a defining casual cocktail of the 1980s. Its simplicity is the point: quick to make and easy to recognize.',
    seo_description:
      'Build a Fuzzy Navel with peach schnapps and orange juice for a classic easy summer highball.',
    base_spirit: 'Liqueur',
    category_primary: 'Highball',
    categories_all: 'party|highball|summer|easy',
    tags: 'peach|orange|schnapps|summer|party',
    image_alt:
      'Fuzzy Navel served in a highball glass over ice, opaque orange, garnished with an orange wheel.',
    glassware: 'Highball glass',
    garnish: 'orange wheel',
    technique: 'Build',
    difficulty: 'Easy',
    flavor_strength: 3,
    flavor_sweetness: 7,
    flavor_tartness: 3,
    flavor_bitterness: 0,
    flavor_aroma: 6,
    flavor_texture: 4,
    notes:
      'Use fresh orange juice when possible; bottled juice dulls the peach note. Adjust schnapps down if the brand is especially sweet.',
    fun_fact:
      'The Fuzzy Navel is emblematic of 1980s American sweet highballs that paired fruit liqueurs with juice for easy, high-volume service.',
    fun_fact_source: '1980s American cocktail histories',
    ingredients: '2 oz peach schnapps|4 oz fresh orange juice',
    instructions:
      '1. Fill a highball glass with ice. 2. Add peach schnapps and orange juice. 3. Stir briefly. 4. Garnish with an orange wheel.',
  },
  {
    slug: 'midori-sour',
    name: 'Midori Sour',
    short_description:
      'A bright melon sour made with Midori, lemon, and a touch of sugar.',
    long_description:
      'The Midori Sour is a vivid green melon cocktail built like a standard sour. Midori supplies melon sweetness and color, lemon juice cuts the sugar, and a little syrup balances if needed. Shaken and served up or over ice, it is unabashedly playful and party-oriented. Fresh citrus is essential; sour mix versions flatten the drink.',
    seo_description:
      'Shake a Midori Sour with Midori melon liqueur and lemon juice for a classic bright green party sour.',
    base_spirit: 'Liqueur',
    category_primary: 'Sour',
    categories_all: 'party|sour|summer|themed',
    tags: 'midori|melon|lemon|sour|party',
    image_alt:
      'Midori Sour served in a rocks glass over ice, bright green, garnished with a lemon wheel.',
    glassware: 'Rocks glass',
    garnish: 'lemon wheel|cherry',
    technique: 'Shake',
    difficulty: 'Easy',
    flavor_strength: 4,
    flavor_sweetness: 7,
    flavor_tartness: 5,
    flavor_bitterness: 0,
    flavor_aroma: 6,
    flavor_texture: 5,
    notes:
      'Start without extra syrup and add only if the lemon dominates. A splash of soda can lighten it into a longer summer serve.',
    fun_fact:
      'Midori launched internationally in the late 1970s, and the Midori Sour became one of the liqueur’s most common cocktail applications in American bars.',
    fun_fact_source: 'Suntory Midori launch histories; American bar menus',
    ingredients: '1.5 oz Midori|1 oz fresh lemon juice|0.5 oz simple syrup|0.5 oz vodka optional',
    instructions:
      '1. Shake Midori, lemon juice, simple syrup, and optional vodka with ice. 2. Strain into a rocks glass over ice. 3. Garnish with lemon and a cherry.',
  },
  {
    slug: 'death-in-the-afternoon',
    name: 'Death in the Afternoon',
    short_description:
      'A sparkling absinthe cocktail of absinthe topped with chilled Champagne.',
    long_description:
      'Death in the Afternoon is a two-part sparkling drink: absinthe in a flute, topped with Champagne. Absinthe’s anise and herbal intensity meet Champagne’s acidity and bubbles for a brisk, aromatic serve. It is strongly associated with Ernest Hemingway, who published the recipe in a 1935 cocktail collection. The drink is simple, but the absinthe measure must stay restrained.',
    seo_description:
      'Build a Death in the Afternoon with absinthe and Champagne for a classic sparkling Hemingway cocktail.',
    base_spirit: 'Liqueur',
    category_primary: 'Sparkling',
    categories_all: 'classic|sparkling|party|themed|absinthe',
    tags: 'absinthe|champagne|sparkling|hemingway',
    image_alt:
      'Death in the Afternoon served in a Champagne flute, pale opalescent green, no garnish.',
    glassware: 'Champagne flute',
    garnish: 'None',
    technique: 'Build',
    difficulty: 'Easy',
    flavor_strength: 7,
    flavor_sweetness: 1,
    flavor_tartness: 3,
    flavor_bitterness: 3,
    flavor_aroma: 9,
    flavor_texture: 5,
    notes:
      'Use a real absinthe and very cold Champagne. One ounce of absinthe is already assertive; do not treat it like a neutral base spirit.',
    fun_fact:
      'Ernest Hemingway contributed Death in the Afternoon to the 1935 collection So Red the Nose, or Breath in the Afternoon, naming it after his bullfighting book.',
    fun_fact_source: 'So Red the Nose (1935); Hemingway cocktail histories',
    ingredients: '1 oz absinthe|4 oz chilled Champagne',
    instructions:
      '1. Pour absinthe into a chilled Champagne flute. 2. Top with chilled Champagne. 3. Stir once gently. 4. Serve without garnish.',
  },
  {
    slug: 'mezcal-paloma',
    name: 'Mezcal Paloma',
    short_description:
      'A smoky Paloma variation with mezcal, grapefruit soda, and lime.',
    long_description:
      'The Mezcal Paloma keeps the Paloma’s grapefruit-and-lime highball structure but swaps tequila for mezcal. Smoke and agave depth sit under bright grapefruit, making the drink more savory than the classic. Served tall over ice with salt optional on the rim, it is a summer patio cocktail with clearer character than a basic vodka-soda. Fresh lime is non-negotiable.',
    seo_description:
      'Build a Mezcal Paloma with mezcal, grapefruit soda, and lime for a smoky summer highball.',
    base_spirit: 'Mezcal',
    category_primary: 'Highball',
    categories_all: 'summer|highball|paloma-family|mezcal|party',
    tags: 'mezcal|grapefruit|lime|highball|summer',
    image_alt:
      'Mezcal Paloma served in a highball glass over ice, pale pink, garnished with grapefruit and optional salt rim.',
    glassware: 'Highball glass',
    garnish: 'grapefruit wedge|optional salt rim',
    technique: 'Build',
    difficulty: 'Easy',
    flavor_strength: 6,
    flavor_sweetness: 3,
    flavor_tartness: 5,
    flavor_bitterness: 2,
    flavor_aroma: 8,
    flavor_texture: 4,
    notes:
      'A fresher grapefruit soda or squirt-style mixer works; if using juice plus soda, keep the drink dry. Half-salt rim is enough.',
    fun_fact:
      'Paloma variations with mezcal proliferated as mezcal entered mainstream cocktail bars, preserving the highball template while shifting the aroma toward smoke.',
    fun_fact_source: 'Modern agave cocktail practice',
    ingredients:
      '2 oz mezcal|0.5 oz fresh lime juice|4 oz grapefruit soda|optional salt rim',
    instructions:
      '1. Optional: salt half the rim of a highball glass. 2. Add mezcal and lime juice to the glass with ice. 3. Top with grapefruit soda and stir gently. 4. Garnish with a grapefruit wedge.',
  },
  {
    slug: 'bloody-maria',
    name: 'Bloody Maria',
    short_description:
      'A tequila Bloody Mary with tomato, citrus, and savory brunch spices.',
    long_description:
      'The Bloody Maria replaces the Bloody Mary’s vodka with tequila, keeping the tomato-savory highball intact. Agave character makes the drink warmer and slightly peppery beneath celery salt, hot sauce, and citrus. Served tall over ice, it is a brunch staple and a clear themed variation rather than a separate template. Rolling instead of hard shaking preserves tomato texture.',
    seo_description:
      'Build a Bloody Maria with tequila, tomato juice, and savory spices for a classic brunch cocktail variation.',
    base_spirit: 'Tequila',
    category_primary: 'Highball',
    categories_all: 'brunch|highball|savory|themed|party',
    tags: 'tequila|tomato|savory|brunch|spicy',
    image_alt:
      'Bloody Maria served in a highball glass over ice, opaque red, garnished with celery and lime.',
    glassware: 'Highball glass',
    garnish: 'celery stalk|lime wedge',
    technique: 'Build',
    difficulty: 'Easy',
    flavor_strength: 5,
    flavor_sweetness: 2,
    flavor_tartness: 4,
    flavor_bitterness: 2,
    flavor_aroma: 7,
    flavor_texture: 8,
    notes:
      'Blanco tequila keeps the drink brighter; reposado adds oak. Adjust hot sauce and salt to taste after the first roll.',
    fun_fact:
      'The Bloody Maria is a straightforward spirit substitution on the Bloody Mary template, popularized as tequila brunch culture expanded in American restaurants.',
    fun_fact_source: 'American brunch cocktail histories',
    ingredients:
      '2 oz blanco tequila|4 oz tomato juice|0.5 oz fresh lime juice|0.25 oz Worcestershire sauce|2 dashes hot sauce|2 pinches celery salt|1 pinch black pepper',
    instructions:
      '1. Build all ingredients in a highball glass with ice. 2. Roll between shaker tins to mix without foaming. 3. Return to the glass. 4. Garnish with celery and lime.',
  },
  {
    slug: 'electric-lemonade',
    name: 'Electric Lemonade',
    short_description:
      'A bright blue vodka lemonade highball finished with lemon-lime soda.',
    long_description:
      'Electric Lemonade is a party highball that combines vodka, blue curaçao, lemon, and lemon-lime soda. The curaçao supplies color and orange notes while lemonade acidity keeps it refreshing. Served tall over ice, it is built for summer gatherings and casual bars. Sweetness can climb quickly, so lemon juice matters as much as soda.',
    seo_description:
      'Build an Electric Lemonade with vodka, blue curaçao, lemon, and soda for a bright blue party highball.',
    base_spirit: 'Vodka',
    category_primary: 'Highball',
    categories_all: 'party|highball|summer|themed',
    tags: 'vodka|blue-curacao|lemon|soda|party',
    image_alt:
      'Electric Lemonade served in a highball glass over ice, electric blue, garnished with a lemon wheel.',
    glassware: 'Highball glass',
    garnish: 'lemon wheel',
    technique: 'Shake',
    difficulty: 'Easy',
    flavor_strength: 5,
    flavor_sweetness: 6,
    flavor_tartness: 5,
    flavor_bitterness: 1,
    flavor_aroma: 5,
    flavor_texture: 4,
    notes:
      'Shake the vodka, curaçao, and lemon first, then top with soda so carbonation stays lively.',
    fun_fact:
      'Electric Lemonade belongs to the family of brightly colored vodka-soda party drinks that used blue curaçao for visual impact in late-twentieth-century bars.',
    fun_fact_source: 'American nightlife cocktail menus',
    ingredients:
      '1.5 oz vodka|0.75 oz blue curaçao|1 oz fresh lemon juice|0.5 oz simple syrup|3 oz lemon-lime soda',
    instructions:
      '1. Shake vodka, blue curaçao, lemon juice, and simple syrup with ice. 2. Strain into a highball glass filled with ice. 3. Top with lemon-lime soda. 4. Garnish with a lemon wheel.',
  },
  {
    slug: 'rossini',
    name: 'Rossini',
    short_description:
      'A strawberry sparkling cocktail of purée topped with Prosecco.',
    long_description:
      'The Rossini is a Bellini variation that swaps white peach for strawberry purée under Prosecco. Strawberry sweetness and color lead, while sparkling wine keeps the drink light and celebratory. Served in a flute, it is a straightforward summer brunch or party cocktail. Fresh purée produces a cleaner flavor than syrupy strawberry mixers.',
    seo_description:
      'Build a Rossini with strawberry purée and Prosecco for a classic sparkling summer cocktail.',
    base_spirit: 'Wine',
    category_primary: 'Sparkling',
    categories_all: 'summer|sparkling|brunch|party|italian',
    tags: 'prosecco|strawberry|sparkling|brunch',
    image_alt:
      'Rossini served in a Champagne flute, pink strawberry tone, no heavy garnish.',
    glassware: 'Champagne flute',
    garnish: 'fresh strawberry optional',
    technique: 'Build',
    difficulty: 'Easy',
    flavor_strength: 3,
    flavor_sweetness: 5,
    flavor_tartness: 3,
    flavor_bitterness: 0,
    flavor_aroma: 6,
    flavor_texture: 5,
    notes:
      'Chill the purée and Prosecco thoroughly. Stir gently so the sparkling wine does not foam over.',
    fun_fact:
      'The Rossini is named for composer Gioachino Rossini and follows the Bellini’s fruit-purée-plus-Prosecco template with strawberries.',
    fun_fact_source: 'Italian sparkling cocktail naming traditions; Harry’s Bar Bellini lineage',
    ingredients: '1.5 oz strawberry purée|4 oz chilled Prosecco',
    instructions:
      '1. Add strawberry purée to a chilled flute. 2. Top slowly with Prosecco. 3. Stir once gently. 4. Garnish with a strawberry if desired.',
  },
  {
    slug: 'limoncello-spritz',
    name: 'Limoncello Spritz',
    short_description:
      'An Italian sparkling highball of limoncello, Prosecco, and soda.',
    long_description:
      'The Limoncello Spritz applies the spritz template to lemon liqueur: limoncello for sweetness and citrus oil, Prosecco for sparkle, and soda for length. It is brighter and sweeter than a bitter Aperol spritz, with a clear summer profile. Served over ice in a wine glass, it is casual, photogenic, and easy to batch for gatherings. Fresh lemon garnish reinforces the aroma.',
    seo_description:
      'Build a Limoncello Spritz with limoncello, Prosecco, and soda for a bright Italian summer cocktail.',
    base_spirit: 'Liqueur',
    category_primary: 'Spritz',
    categories_all: 'summer|spritz|party|italian|sparkling',
    tags: 'limoncello|prosecco|soda|spritz|summer',
    image_alt:
      'Limoncello Spritz served in a wine glass over ice, pale lemon yellow, garnished with a lemon wheel.',
    glassware: 'Wine glass',
    garnish: 'lemon wheel',
    technique: 'Build',
    difficulty: 'Easy',
    flavor_strength: 4,
    flavor_sweetness: 6,
    flavor_tartness: 3,
    flavor_bitterness: 1,
    flavor_aroma: 7,
    flavor_texture: 4,
    notes:
      'Because limoncello is sweet, keep the soda proportion generous. Use a dry Prosecco to avoid a candy finish.',
    fun_fact:
      'Limoncello spritzes spread with the broader spritz boom as Italian lemon liqueur moved from digestivo service into casual sparkling formats.',
    fun_fact_source: 'Modern Italian aperitivo practice',
    ingredients: '2 oz limoncello|3 oz Prosecco|2 oz club soda',
    instructions:
      '1. Fill a wine glass with ice. 2. Add limoncello, then Prosecco, then soda. 3. Stir gently. 4. Garnish with a lemon wheel.',
  },
  {
    slug: 'gin-gin-mule',
    name: 'Gin Gin Mule',
    short_description:
      'A minty gin mule with lime, ginger beer, and muddled mint.',
    long_description:
      'The Gin Gin Mule combines gin, lime, mint, sugar, and ginger beer into a tall refreshing highball. Mint and gin echo a mojito, while ginger beer pulls it into mule territory. Created in the modern craft-cocktail era, it became a warm-weather standard because it is aromatic, spicy, and easy to drink. Fresh mint and a spicy ginger beer define the drink.',
    seo_description:
      'Build a Gin Gin Mule with gin, mint, lime, and ginger beer for a classic refreshing summer highball.',
    base_spirit: 'Gin',
    category_primary: 'Highball',
    categories_all: 'summer|highball|mule-family|gin|party',
    tags: 'gin|mint|lime|ginger-beer|mule',
    image_alt:
      'Gin Gin Mule served in a highball glass over ice, pale, garnished with a mint bouquet and lime.',
    glassware: 'Highball glass',
    garnish: 'mint sprig|lime wheel',
    technique: 'Shake',
    difficulty: 'Easy',
    flavor_strength: 5,
    flavor_sweetness: 4,
    flavor_tartness: 5,
    flavor_bitterness: 1,
    flavor_aroma: 8,
    flavor_texture: 4,
    notes:
      'Muddle mint gently. Audrey Saunders’s original uses a shaken mint-gin-lime base topped with ginger beer.',
    fun_fact:
      'Audrey Saunders created the Gin-Gin Mule at New York’s Pegu Club, helping popularize ginger beer highballs in craft cocktail bars.',
    fun_fact_source: 'Pegu Club cocktail histories; Audrey Saunders attributions',
    ingredients:
      '2 oz gin|0.75 oz fresh lime juice|0.75 oz simple syrup|8 mint leaves|3 oz ginger beer',
    instructions:
      '1. Gently muddle mint with syrup in a shaker. 2. Add gin and lime juice; shake with ice. 3. Strain into a highball glass filled with ice and top with ginger beer. 4. Garnish with mint and lime.',
  },
];

function csvEscape(value: string | number): string {
  const s = String(value ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function main() {
  const headers = [
    'ID', 'slug', 'name', 'short_description', 'long_description', 'seo_description',
    'base_spirit', 'category_primary', 'categories_all', 'tags', 'image_url', 'image_alt',
    'glassware', 'garnish', 'technique', 'difficulty',
    'flavor_strength', 'flavor_sweetness', 'flavor_tartness', 'flavor_bitterness', 'flavor_aroma', 'flavor_texture',
    'notes', 'fun_fact', 'fun_fact_source', 'metadata_json', 'ingredients', 'instructions',
  ];

  const rows = drafts.map((d, i) => {
    const id = `mw_review_002_${String(i + 1).padStart(3, '0')}`;
    return [
      id, d.slug, d.name, d.short_description, d.long_description, d.seo_description,
      d.base_spirit, d.category_primary, d.categories_all, d.tags, '', d.image_alt,
      d.glassware, d.garnish, d.technique, d.difficulty,
      d.flavor_strength, d.flavor_sweetness, d.flavor_tartness, d.flavor_bitterness, d.flavor_aroma, d.flavor_texture,
      d.notes, d.fun_fact, d.fun_fact_source, '{}', d.ingredients, d.instructions,
    ].map(csvEscape).join(',');
  });

  const out = path.join(process.cwd(), 'data', 'review-batch-002.csv');
  fs.writeFileSync(out, [headers.join(','), ...rows].join('\n') + '\n', 'utf8');
  console.log(`Wrote ${drafts.length} drinks → ${out}`);
  console.log(drafts.map((d) => d.slug).join('\n'));
}

main();
