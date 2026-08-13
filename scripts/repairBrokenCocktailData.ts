#!/usr/bin/env tsx
/**
 * Repair corrupted cocktail recipe fields in Supabase.
 *
 * Fixes:
 * 1) Column-shifted / truncated critical recipes
 * 2) VDC garbled step wording
 * 3) Telegraphic instructions expanded to editorial 3–6 step style
 *
 * Usage:
 *   npx tsx scripts/repairBrokenCocktailData.ts --dry-run
 *   npx tsx scripts/repairBrokenCocktailData.ts --apply
 */

import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const STORAGE =
  "https://uvmbmlahkwmlomfoeaha.supabase.co/storage/v1/object/public/cocktail-images-fullsize";

type Ing = { text: string };

type Patch = {
  ingredients?: Ing[];
  instructions?: string;
  notes?: string | null;
  fun_fact?: string | null;
  fun_fact_source?: string | null;
  glassware?: string | null;
  garnish?: string | null;
  technique?: string | null;
  difficulty?: string | null;
  base_spirit?: string | null;
  category_primary?: string | null;
  categories_all?: string[] | null;
  tags?: string[] | null;
  image_alt?: string | null;
  image_url?: string | null;
  seo_description?: string | null;
  short_description?: string | null;
  flavor_strength?: number | null;
  flavor_sweetness?: number | null;
  flavor_tartness?: number | null;
  flavor_bitterness?: number | null;
  flavor_aroma?: number | null;
  flavor_texture?: number | null;
};

const criticalPatches: Record<string, Patch> = {
  "air-mail": {
    base_spirit: "Rum",
    category_primary: "Sparkling",
    categories_all: ["classic", "sparkling", "rum", "sour"],
    tags: ["rum", "champagne", "honey", "lime", "shaken"],
    glassware: "Champagne flute",
    garnish: "lime twist",
    technique: "Shake",
    difficulty: "Easy",
    ingredients: [
      { text: "1.5 oz gold rum" },
      { text: "0.75 oz fresh lime juice" },
      { text: "0.75 oz honey syrup" },
      { text: "2 oz chilled Champagne or dry sparkling wine" },
    ],
    instructions:
      "1. Add gold rum, fresh lime juice, and honey syrup to a shaker filled with ice. 2. Shake until well chilled. 3. Strain into a chilled Champagne flute. 4. Top with chilled Champagne or dry sparkling wine. 5. Garnish with a lime twist and serve.",
    notes:
      "Ensure the honey syrup is fully dissolved in the shaker before adding ice to prevent seizing.",
    fun_fact:
      "The Air Mail appears in W.C. Whitfield’s Here’s How (1941) as a rum, lime, and honey drink lengthened with Champagne.",
    fun_fact_source: "W.C. Whitfield, Here’s How (1941); Bacardi archives; Punch Drink",
    image_alt:
      "An Air Mail in a flute with a postage stamp garnish (optional) or lime twist.",
    image_url: `${STORAGE}/Air%20Mail.png`,
    seo_description:
      "Shake an Air Mail with rum, honey syrup, and lime, then top with Champagne for a sparkling rum classic.",
    flavor_strength: 6,
    flavor_sweetness: 4,
    flavor_tartness: 5,
    flavor_bitterness: 1,
    flavor_aroma: 5,
    flavor_texture: 4,
  },

  "cable-car": {
    base_spirit: "Rum",
    category_primary: "Sour",
    categories_all: ["modern-classic", "sour", "rum", "spiced"],
    tags: ["spiced-rum", "curacao", "lemon", "cinnamon", "shaken"],
    glassware: "Coupe",
    garnish: "orange twist|cinnamon-sugar rim",
    technique: "Shake",
    difficulty: "Easy",
    ingredients: [
      { text: "1.5 oz spiced rum" },
      { text: "0.75 oz orange curaçao" },
      { text: "1 oz fresh lemon juice" },
      { text: "0.5 oz simple syrup" },
    ],
    instructions:
      "1. Rim a chilled coupe with cinnamon sugar. 2. Add spiced rum, orange curaçao, fresh lemon juice, and simple syrup to a shaker filled with ice. 3. Shake until well chilled. 4. Strain into the prepared coupe. 5. Garnish with an orange twist and serve.",
    notes:
      "Use a high-quality spiced rum to avoid an overly artificial vanilla flavor. The cinnamon-sugar rim is part of the drink’s balance, not just garnish.",
    fun_fact:
      "Tony Abou-Ganim created the Cable Car in 1996 at San Francisco’s Starlight Room as a spiced-rum Sidecar with a cinnamon-sugar rim.",
    fun_fact_source: "Tony Abou-Ganim, The Modern Mixologist; Imbibe",
    image_alt:
      "A Cable Car in a coupe with a cinnamon-sugar rim and orange twist.",
    image_url: `${STORAGE}/Cable%20Car.png`,
    seo_description:
      "Shake a Cable Car with spiced rum, orange curaçao, and lemon for a modern classic sour.",
    flavor_strength: 6,
    flavor_sweetness: 5,
    flavor_tartness: 6,
    flavor_bitterness: 1,
    flavor_aroma: 7,
    flavor_texture: 4,
  },

  "cuba-libre": {
    base_spirit: "Rum",
    category_primary: "Highball",
    categories_all: ["classic", "highball", "rum", "iba"],
    tags: ["rum", "cola", "lime", "built", "cuban"],
    glassware: "Highball glass",
    garnish: "lime wedge",
    technique: "Build",
    difficulty: "Easy",
    ingredients: [
      { text: "2 oz white rum" },
      { text: "0.5 oz fresh lime juice" },
      { text: "4 oz cola" },
    ],
    instructions:
      "1. Add fresh lime juice to a highball glass and drop in the spent lime shell or a lime wedge. 2. Fill the glass with ice. 3. Add white rum. 4. Top with cola. 5. Stir briefly to combine and serve.",
    notes:
      "Muddle or squeeze the lime in the glass before adding ice to release oils. Fresh lime is what separates a Cuba Libre from a plain rum and cola.",
    fun_fact:
      "The Cuba Libre emerged in early-20th-century Cuba as American cola met Cuban rum; the fresh lime is the drink’s defining difference from a basic highball.",
    fun_fact_source: "Havana cocktail history; Wondrich, Imbibe!",
    image_alt: "A Cuba Libre in a highball glass with a lime half-shell.",
    image_url: `${STORAGE}/Cuba%20Libre.png`,
    seo_description:
      "Build a Cuba Libre with rum, fresh lime juice, and cola for the classic Cuban highball.",
    flavor_strength: 5,
    flavor_sweetness: 5,
    flavor_tartness: 4,
    flavor_bitterness: 1,
    flavor_aroma: 4,
    flavor_texture: 3,
  },

  "duck-fart": {
    base_spirit: "Whiskey",
    category_primary: "Shot",
    categories_all: ["modern-classic", "shot", "creamy", "layered", "alaskan"],
    tags: ["whiskey", "coffee-liqueur", "irish-cream", "layered", "dessert"],
    glassware: "Shot glass",
    garnish: "none",
    technique: "Layer",
    difficulty: "Easy",
    ingredients: [
      { text: "0.5 oz coffee liqueur" },
      { text: "0.5 oz Irish cream" },
      { text: "0.5 oz Canadian whisky" },
    ],
    instructions:
      "1. Pour coffee liqueur into a shot glass as the base layer. 2. Slowly layer Irish cream over the back of a bar spoon. 3. Gently layer Canadian whisky on top to keep the bands distinct. 4. Serve immediately.",
    notes:
      "Pour slowly over the back of a spoon to keep the layers distinct; density order matters.",
    fun_fact:
      "The Duck Fart is widely treated as Alaska’s unofficial state shot, a B-52 variation that swaps orange liqueur for whisky.",
    fun_fact_source: "Peanut Farm archives; Vice Munchies",
    image_alt:
      "A layered Duck Fart shot showing distinct brown, cream, and amber bands.",
    image_url: `${STORAGE}/Duck%20Fart.png`,
    seo_description:
      "Layer a Duck Fart shot with coffee liqueur, Irish cream, and whisky.",
    flavor_strength: 7,
    flavor_sweetness: 6,
    flavor_tartness: 1,
    flavor_bitterness: 2,
    flavor_aroma: 6,
    flavor_texture: 7,
  },

  "hot-buttered-rum": {
    base_spirit: "Rum",
    category_primary: "Hot",
    categories_all: ["classic", "hot", "winter", "spiced"],
    tags: ["aged-rum", "butter", "spices", "holiday", "warm"],
    glassware: "Irish coffee glass",
    garnish: "cinnamon stick",
    technique: "Build",
    difficulty: "Moderate",
    ingredients: [
      { text: "2 oz aged rum" },
      { text: "1 tbsp spiced butter batter (butter, brown sugar, cinnamon, nutmeg, clove)" },
      { text: "6 oz hot water" },
    ],
    instructions:
      "1. Add the spiced butter batter to a warmed Irish coffee glass or mug. 2. Pour in the aged rum. 3. Top with hot water and stir until the batter dissolves and the drink looks glossy. 4. Garnish with a cinnamon stick and serve.",
    notes:
      "Prepare the spiced butter batter in advance for the best flavor integration; adding raw butter directly to rum can turn greasy.",
    fun_fact:
      "Hot Buttered Rum is a colonial American hot drink that survived as winter bar fare, built on rum, spice, and a rich butter batter.",
    fun_fact_source: "Colonial American history; Imbibe",
    image_alt: "A Hot Buttered Rum in a glass mug with a cinnamon stick.",
    image_url: `${STORAGE}/Hot%20Buttered%20Rum.png`,
    seo_description:
      "Build a Hot Buttered Rum with aged rum and spiced butter batter for a classic winter warmer.",
    flavor_strength: 6,
    flavor_sweetness: 5,
    flavor_tartness: 1,
    flavor_bitterness: 1,
    flavor_aroma: 7,
    flavor_texture: 8,
  },

  "hotel-nacional-special": {
    base_spirit: "Rum",
    category_primary: "Sour",
    categories_all: ["classic", "sour", "cuban", "tiki-adjacent"],
    tags: ["rum", "apricot", "pineapple", "lime", "shaken"],
    glassware: "Coupe",
    garnish: "lime wheel",
    technique: "Shake",
    difficulty: "Easy",
    ingredients: [
      { text: "1.5 oz white rum" },
      { text: "0.5 oz apricot brandy" },
      { text: "1 oz fresh pineapple juice" },
      { text: "0.75 oz fresh lime juice" },
      { text: "0.25 oz simple syrup" },
    ],
    instructions:
      "1. Add white rum, apricot brandy, pineapple juice, fresh lime juice, and simple syrup to a shaker filled with ice. 2. Shake hard until well chilled and foamy. 3. Double-strain into a chilled coupe. 4. Garnish with a lime wheel and serve.",
    notes:
      "Double-strain to remove ice chips while letting the foam pass through the strainer.",
    fun_fact:
      "The Hotel Nacional Special was created at Havana’s Hotel Nacional and became a signature of Cuba’s Golden Age cantineros.",
    fun_fact_source: "Hotel Nacional archives; Beachbum Berry",
    image_alt:
      "A Hotel Nacional Special in a coupe with a thick foam head and lime wheel.",
    image_url: `${STORAGE}/Hotel%20Nacional%20cocktail.png`,
    seo_description:
      "Shake a Hotel Nacional Special with rum, apricot brandy, pineapple, and lime.",
    flavor_strength: 6,
    flavor_sweetness: 5,
    flavor_tartness: 6,
    flavor_bitterness: 1,
    flavor_aroma: 6,
    flavor_texture: 5,
  },

  "mary-pickford": {
    base_spirit: "Rum",
    category_primary: "Sour",
    categories_all: ["classic", "sour", "cuban", "iba"],
    tags: ["rum", "pineapple", "grenadine", "maraschino", "shaken"],
    glassware: "Coupe",
    garnish: "brandied cherry",
    technique: "Shake",
    difficulty: "Easy",
    ingredients: [
      { text: "1.5 oz white rum" },
      { text: "1.5 oz fresh pineapple juice" },
      { text: "0.25 oz grenadine" },
      { text: "0.25 oz maraschino liqueur" },
    ],
    instructions:
      "1. Add white rum, fresh pineapple juice, grenadine, and maraschino liqueur to a shaker filled with ice. 2. Shake until well chilled and frothy. 3. Strain into a chilled coupe. 4. Garnish with a brandied cherry and serve.",
    notes:
      "Use fresh pineapple juice for a frothy head; canned juice often yields a flatter texture.",
    fun_fact:
      "The Mary Pickford was created in Havana during Prohibition and named for the silent-film star; the IBA still recognizes the formula.",
    fun_fact_source: "Hotel Nacional archives; Imbibe; International Bartenders Association",
    image_alt:
      "A Mary Pickford in a coupe with a pale pink hue and cherry garnish.",
    image_url: `${STORAGE}/Mary%20Pickford.png`,
    seo_description:
      "Shake a Mary Pickford with rum, pineapple, grenadine, and maraschino for a Prohibition classic.",
    flavor_strength: 5,
    flavor_sweetness: 6,
    flavor_tartness: 4,
    flavor_bitterness: 1,
    flavor_aroma: 5,
    flavor_texture: 5,
  },

  "missionarys-downfall": {
    base_spirit: "Rum",
    category_primary: "Tiki",
    categories_all: ["classic", "tiki", "rum", "blended"],
    tags: ["white-rum", "peach", "mint", "pineapple", "blended"],
    glassware: "Coupe",
    garnish: "mint sprig",
    technique: "Blend",
    difficulty: "Moderate",
    ingredients: [
      { text: "1 oz white rum" },
      { text: "0.5 oz peach liqueur" },
      { text: "0.5 oz honey syrup" },
      { text: "0.5 oz fresh lime juice" },
      { text: "1 oz fresh pineapple juice" },
      { text: "8-10 mint leaves" },
      { text: "1 cup crushed ice" },
    ],
    instructions:
      "1. Add white rum, peach liqueur, honey syrup, fresh lime juice, pineapple juice, mint leaves, and crushed ice to a blender. 2. Blend until smooth and pale green with fine mint flecks. 3. Pour into a chilled coupe or snifter. 4. Garnish with a mint sprig and serve.",
    notes:
      "Blend until the mint shows only as tiny flecks; do not over-blend into a dark green puree.",
    fun_fact:
      "Don the Beachcomber’s Missionary’s Downfall is a lighter tiki classic built on white rum, peach, pineapple, and a large charge of fresh mint.",
    fun_fact_source: "Beachbum Berry; Smuggler’s Cove",
    image_alt:
      "A Missionary's Downfall in a coupe or snifter with a mint sprig.",
    image_url: `${STORAGE}/Missionarys%20Downfall.png`,
    seo_description:
      "Blend a Missionary’s Downfall with rum, peach liqueur, pineapple, and fresh mint.",
    flavor_strength: 5,
    flavor_sweetness: 5,
    flavor_tartness: 4,
    flavor_bitterness: 1,
    flavor_aroma: 8,
    flavor_texture: 6,
  },

  "pina-colada": {
    base_spirit: "Rum",
    category_primary: "Tiki",
    categories_all: ["classic", "tiki", "tropical", "blended", "iba"],
    tags: ["rum", "coconut", "pineapple", "frozen", "blended"],
    glassware: "Hurricane glass",
    garnish: "pineapple wedge|cherry",
    technique: "Blend",
    difficulty: "Easy",
    ingredients: [
      { text: "2 oz white rum" },
      { text: "1.5 oz cream of coconut" },
      { text: "1.5 oz fresh pineapple juice" },
      { text: "1 cup crushed ice" },
    ],
    instructions:
      "1. Add white rum, cream of coconut, pineapple juice, and crushed ice to a blender. 2. Blend until thick and smooth. 3. Pour into a hurricane glass. 4. Garnish with a pineapple wedge and cherry, then serve with a straw.",
    notes:
      "Use cream of coconut (such as Coco López), not coconut milk, for the correct sweetness and texture.",
    fun_fact:
      "Puerto Rico claims the Piña Colada as a national cocktail; modern bar versions favor fresh pineapple and real cream of coconut over premix.",
    fun_fact_source: "Puerto Rico official archives; Imbibe; International Bartenders Association",
    image_alt:
      "A Piña Colada in a hurricane glass with a pineapple wedge and cherry.",
    image_url: null,
    seo_description:
      "Blend a classic Piña Colada with rum, cream of coconut, and pineapple juice.",
    flavor_strength: 5,
    flavor_sweetness: 7,
    flavor_tartness: 3,
    flavor_bitterness: 1,
    flavor_aroma: 5,
    flavor_texture: 8,
  },

  "queens-park-swizzle": {
    base_spirit: "Rum",
    category_primary: "Swizzle",
    categories_all: ["classic", "swizzle", "tiki-adjacent", "trinidad"],
    tags: ["demerara-rum", "mint", "bitters", "lime", "swizzle"],
    glassware: "Highball glass",
    garnish: "mint bouquet",
    technique: "Build",
    difficulty: "Moderate",
    ingredients: [
      { text: "2 oz Demerara rum" },
      { text: "0.75 oz fresh lime juice" },
      { text: "0.5 oz simple syrup" },
      { text: "8-10 mint leaves" },
      { text: "6-8 dashes Angostura bitters" },
    ],
    instructions:
      "1. Add mint leaves, simple syrup, and fresh lime juice to a highball glass and gently press the mint. 2. Fill the glass with crushed ice and add Demerara rum. 3. Swizzle with a swizzle stick or barspoon until the glass frosts. 4. Pack with more crushed ice, then dash Angostura bitters over the top. 5. Garnish with a mint bouquet and serve with a straw.",
    notes:
      "Use crushed ice exclusively; the swizzle technique does not work well with cubes.",
    fun_fact:
      "The Queen’s Park Swizzle takes its name from the Queen’s Park Hotel in Port of Spain, Trinidad, and is often described as a bittered, Demerara-led cousin of the Mojito.",
    fun_fact_source: "Trader Vic archives; Imbibe",
    image_alt:
      "A Queen's Park Swizzle in a tall glass with a red bitters layer and mint bouquet.",
    image_url: null,
    seo_description:
      "Swizzle a Queen’s Park Swizzle with Demerara rum, mint, lime, and Angostura bitters.",
    flavor_strength: 7,
    flavor_sweetness: 4,
    flavor_tartness: 5,
    flavor_bitterness: 4,
    flavor_aroma: 8,
    flavor_texture: 4,
  },

  "surfer-on-acid": {
    base_spirit: "Liqueur",
    category_primary: "Shot",
    categories_all: ["modern-classic", "shot", "tropical", "herbal"],
    tags: ["jagermeister", "coconut-rum", "pineapple", "shaken", "party"],
    glassware: "Shot glass",
    garnish: "pineapple wedge (optional)",
    technique: "Shake",
    difficulty: "Easy",
    ingredients: [
      { text: "1 oz Jägermeister" },
      { text: "1 oz coconut rum" },
      { text: "1 oz pineapple juice" },
    ],
    instructions:
      "1. Add Jägermeister, coconut rum, and pineapple juice to a shaker filled with ice. 2. Shake until well chilled. 3. Strain into a shot glass. 4. Optionally garnish with a small pineapple wedge and serve.",
    notes:
      "Can also be served as a short drink over ice, but the shot format is the cultural standard.",
    fun_fact:
      "Bartender Eric Tecosky created the Surfer on Acid in Los Angeles in the 1990s while championing Jägermeister as a mixable spirit.",
    fun_fact_source: "Eric Tecosky; 1990s Los Angeles bar lore",
    image_alt:
      "A Surfer on Acid shot in a glass with a dark murky pineapple color.",
    image_url: `${STORAGE}/Surfer%20on%20Acid.png`,
    seo_description:
      "Shake a Surfer on Acid with Jägermeister, coconut rum, and pineapple juice.",
    flavor_strength: 7,
    flavor_sweetness: 6,
    flavor_tartness: 4,
    flavor_bitterness: 3,
    flavor_aroma: 6,
    flavor_texture: 4,
  },

  vdc: {
    instructions:
      "1. Fill a highball glass with ice. 2. Add vodka. 3. Top with Diet Coke. 4. Stir briefly to combine. 5. Garnish with a lime wedge and serve.",
    notes:
      "Squeeze the lime wedge into the drink before dropping it in; the citric acid helps cut the aftertaste of artificial sweeteners. Measure the vodka to taste if you prefer it stronger or lighter.",
  },
};

function ingredientTexts(raw: unknown): string[] {
  if (!raw) return [];
  if (typeof raw === "string") {
    try {
      return ingredientTexts(JSON.parse(raw));
    } catch {
      return raw
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object" && "text" in item) {
        return String((item as Ing).text || "").trim();
      }
      return "";
    })
    .filter(Boolean);
}

function stripAmount(text: string): string {
  return text
    .replace(/^splash\s+(?:of\s+)?/i, "")
    .replace(/^pinch\s+(?:of\s+)?/i, "")
    .replace(
      /^(?:\d+(?:\.\d+)?(?:\s*[–—-]\s*\d+(?:\.\d+)?)?)\s*(?:dashes?|drops?|oz|ml|cl|tsp|tbsp|cups?|pints?|leaves?|sprigs?)\s+/i,
      ""
    )
    .replace(/^(?:\d+(?:\.\d+)?(?:\s*[–—-]\s*\d+(?:\.\d+)?)?)\s+/i, "")
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function articleFor(noun: string): string {
  return /^[aeiou]/i.test(noun.trim()) ? "an" : "a";
}

function joinList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function isTopper(name: string): boolean {
  return /\b(soda water|club soda|sparkling water|mineral water|champagne|prosecco|sparkling wine|ginger beer|ginger ale|cola|diet coke|energy drink|beer|tonic|lemonade)\b/i.test(
    name
  );
}

function isGarnishLine(text: string): boolean {
  return /^(mint sprig|lime wheel|lemon wheel|orange twist|lemon twist|cherry|brandied cherry|pineapple wedge|lime wedge|lemon wedge|no garnish|none)\b/i.test(
    text.trim()
  ) && !/^\d/.test(text.trim());
}

function hasActionVerb(s: string): boolean {
  return /\b(add|shake|stir|strain|pour|fill|garnish|build|muddle|top|combine|serve|mix|place|express|rim|drop|float|layer|blend|chill|swizzle|press|roll|fine-strain|fine strain)\b/i.test(
    s
  );
}

function normalizeInstructions(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const value = raw.trim();
  if (!value || value === "{}") return [];
  const numberedParen = value
    .split(/\s*\d+\)\s*/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !/^\d+$/.test(s));
  if (numberedParen.length > 1) return numberedParen;
  const newlineSteps = value
    .split(/\n+/)
    .map((s) => s.replace(/^\s*\d+[\.\)]\s*/, "").trim())
    .filter(Boolean);
  if (newlineSteps.length > 1) return newlineSteps;
  const numberedDot = value
    .split(/\s*(?=\d+\.\s+)/g)
    .map((s) => s.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);
  if (numberedDot.length > 1) return numberedDot;
  const sentences = value
    .split(/\.\s+/g)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter((s) => s.length > 0 && !/^\d+$/.test(s));
  if (sentences.length > 1) return sentences;
  return [value];
}

function needsInstructionUpgrade(instructions: string | null | undefined, ingredients: unknown): boolean {
  const instr = String(instructions || "").trim();
  if (!instr || instr === "{}") return true;
  if (/^\d+(\.\d+)?\s*(oz|ml|tbsp|tsp)\b/i.test(instr) && !hasActionVerb(instr)) return true;
  if (/\|/.test(instr) && /\d+\s*(oz|ml)/i.test(instr) && !hasActionVerb(instr)) return true;
  if (instr === "sugar") return true;

  const steps = normalizeInstructions(instr);
  const joined = steps.join(" ");
  const names = ingredientTexts(ingredients).map(stripAmount).filter(Boolean);
  const mentionsIngredient = names.some((n) => {
    const token = n.split(/\s+/)[0]?.toLowerCase();
    return token && token.length > 3 && joined.toLowerCase().includes(token);
  });

  // Telegraphic: short, few ingredient mentions
  if (!mentionsIngredient && instr.length < 140) return true;
  if (steps.length <= 2 && instr.length < 120) return true;
  if (
    /^(shake|stir|build|layer|blend).{0,40}(strain|garnish|serve)?\.?$/i.test(instr) ||
    /shake with ice\.?\s*strain/i.test(instr)
  ) {
    return true;
  }
  // Generic garnish-only closing without naming spirits/juices
  if (!mentionsIngredient && /\bgarnish\b/i.test(instr) && instr.length < 160) return true;
  return false;
}

function expandInstructions(cocktail: {
  slug: string;
  ingredients: unknown;
  instructions: string | null;
  technique: string | null;
  glassware: string | null;
  garnish: string | null;
  category_primary?: string | null;
}): string | null {
  if (criticalPatches[cocktail.slug]?.instructions) {
    return criticalPatches[cocktail.slug].instructions!;
  }

  // Hand-tuned overrides for drinks the generic builder mishandles
  const overrides: Record<string, string> = {
    "irish-coffee":
      "1. Warm an Irish coffee glass. 2. Add demerara sugar and Irish whiskey. 3. Top with hot coffee and stir to dissolve the sugar. 4. Float lightly whipped cream on top and serve.",
    "kir-royale":
      "1. Add crème de cassis to a chilled Champagne flute. 2. Top slowly with chilled Champagne. 3. Serve without stirring.",
    mimosa:
      "1. Add chilled orange juice to a Champagne flute. 2. Top slowly with chilled Champagne. 3. Garnish with an orange twist if desired and serve.",
    "irish-car-bomb":
      "1. Pour stout into a pint glass. 2. Combine Irish whiskey and Irish cream in a shot glass. 3. Drop the shot into the stout and drink immediately.",
    jagerbomb:
      "1. Pour the energy drink into a rocks glass or pint glass. 2. Pour Jägermeister into a shot glass. 3. Drop the shot into the energy drink and drink immediately.",
    boilermaker:
      "1. Pour beer into a pint glass. 2. Pour whiskey into a shot glass. 3. Serve side by side, or drop the shot into the beer and drink immediately.",
    "aperol-spritz":
      "1. Fill a wine glass with ice. 2. Add Aperol. 3. Top with prosecco and a splash of soda water. 4. Stir gently to combine. 5. Garnish with an orange slice and serve.",
    "vegas-bomb":
      "1. Add Crown Royal, peach schnapps, and cranberry juice to a shaker filled with ice. 2. Shake until well chilled. 3. Strain into a shot glass. 4. Drop the shot into a glass of energy drink and drink immediately.",
    "mind-eraser":
      "1. Fill a rocks glass with ice. 2. Add coffee liqueur, then vodka. 3. Top with soda water. 4. Serve with a straw and do not stir.",
    "white-linen":
      "1. Add gin, fresh lime juice, simple syrup, and cucumber to a shaker filled with ice. 2. Shake until well chilled. 3. Strain into a highball glass filled with fresh ice. 4. Top with soda water. 5. Garnish and serve.",
    "ti-punch":
      "1. Add lime coin and cane syrup to a small rocks glass and briefly muddle. 2. Add rhum agricole. 3. Add one ice cube or serve without ice. 4. Stir briefly and serve.",
    "green-tea-shot":
      "1. Add Irish whiskey, peach schnapps, and sour mix to a shaker filled with ice. 2. Shake until well chilled. 3. Strain into a shot glass. 4. Top with a splash of lemon-lime soda and serve.",
    "lemon-drop-shot":
      "1. Optionally sugar-rim a shot glass. 2. Add vodka, lemon juice, and simple syrup to a shaker filled with ice. 3. Shake until well chilled. 4. Strain into the shot glass and serve.",
    "skinny-margarita":
      "1. Add blanco tequila, fresh lime juice, and agave syrup to a shaker filled with ice. 2. Shake until well chilled. 3. Strain into a rocks glass over fresh ice. 4. Garnish with a lime wedge and serve.",
    "basil-smash":
      "1. Add basil leaves, gin, lemon juice, and simple syrup to a shaker filled with ice. 2. Shake hard until well chilled. 3. Double-strain into a rocks glass over fresh ice. 4. Garnish with a basil bouquet and serve.",
    shandy:
      "1. Add cold beer to a pint glass. 2. Top gently with lemonade. 3. Stir once if needed and serve.",
    "ranch-water":
      "1. Fill a highball glass with ice. 2. Add tequila and fresh lime juice. 3. Top with sparkling mineral water. 4. Stir briefly. 5. Garnish with a lime wedge and serve.",
    paloma:
      "1. Salt the rim of a highball glass if desired and fill with ice. 2. Add tequila and fresh lime juice. 3. Top with grapefruit soda. 4. Stir briefly. 5. Garnish with a lime wedge and serve.",
    "poinsettia":
      "1. Add cranberry juice and Cointreau to a Champagne flute. 2. Top with chilled Champagne. 3. Garnish with a cranberry skewer or orange twist and serve.",
    "elderflower-spritz":
      "1. Fill a wine glass with ice. 2. Add elderflower liqueur. 3. Top with prosecco and soda water. 4. Stir gently. 5. Garnish and serve.",
    "negroni-sbagliato":
      "1. Fill a rocks or wine glass with ice. 2. Add sweet vermouth and Campari. 3. Top with prosecco. 4. Stir gently. 5. Garnish with an orange slice and serve.",
    "mezcal-mule":
      "1. Fill a copper mug with ice. 2. Add mezcal and fresh lime juice. 3. Top with ginger beer. 4. Stir briefly. 5. Garnish with a lime wheel and serve.",
    "kentucky-mule":
      "1. Fill a copper mug with ice. 2. Add bourbon and fresh lime juice. 3. Top with ginger beer. 4. Stir briefly. 5. Garnish with a lime wheel and serve.",
    screwdriver:
      "1. Fill a highball glass with ice. 2. Add vodka and orange juice. 3. Stir gently to combine. 4. Garnish with an orange wedge and serve.",
    "black-russian":
      "1. Fill a rocks glass with ice. 2. Add vodka and coffee liqueur. 3. Stir gently to combine. 4. Serve.",
    "sea-breeze":
      "1. Fill a highball glass with ice. 2. Add vodka, cranberry juice, and grapefruit juice. 3. Stir gently to combine. 4. Garnish with a lime wedge and serve.",
    "bay-breeze":
      "1. Fill a highball glass with ice. 2. Add vodka, cranberry juice, and pineapple juice. 3. Stir gently to combine. 4. Garnish with a pineapple wedge or lime and serve.",
    "sex-on-the-beach":
      "1. Fill a highball or hurricane glass with ice. 2. Add vodka, peach schnapps, cranberry juice, and orange juice. 3. Stir gently to combine. 4. Garnish with an orange wedge and serve.",
    mudslide:
      "1. Fill a rocks glass with ice. 2. Add vodka, Irish cream, and coffee liqueur. 3. Stir gently to combine. 4. Garnish with chocolate drizzle if desired and serve.",
    "navy-grog":
      "1. Add Jamaican rum, Demerara rum, light rum, lime juice, grapefruit juice, and honey syrup to a shaker filled with ice. 2. Shake until well chilled. 3. Strain into a rocks glass over fresh ice or an ice cone. 4. Garnish and serve.",
    painkiller:
      "1. Add navy-strength rum, pineapple juice, orange juice, and cream of coconut to a shaker filled with ice. 2. Shake until well chilled. 3. Strain into a tiki mug or highball over fresh ice. 4. Dust with nutmeg and serve.",
  };
  if (overrides[cocktail.slug]) return overrides[cocktail.slug];

  const rawLines = ingredientTexts(cocktail.ingredients).filter((t) => !isGarnishLine(t));
  if (rawLines.length === 0) return null;

  const parsed = rawLines.map((text) => ({ text, name: stripAmount(text) || text }));
  const toppers = parsed.filter((p) => isTopper(p.name));
  const base = parsed.filter((p) => !isTopper(p.name) && !/\b(slice|twist|wedge|sprig|leaf|leaves)\b/i.test(p.name));
  const baseNames = base.map((p) => p.name);
  const topperNames = toppers.map((p) => p.name);

  const glass = cocktail.glassware?.trim() || "glass";
  const glassPhrase = `${articleFor(glass)} ${glass}`;
  const garnishRaw = (cocktail.garnish || "").trim();
  const garnish =
    garnishRaw && !/^none$/i.test(garnishRaw)
      ? garnishRaw.split("|")[0].trim()
      : "";
  const tech = (cocktail.technique || "").toLowerCase();
  const category = (cocktail.category_primary || "").toLowerCase();
  const isHot = /hot|irish coffee|toddy|buttered/i.test(`${cocktail.slug} ${glass} ${category}`);
  const isSparklingServe =
    /flute|champagne/i.test(glass) || /sparkling|champagne/i.test(category);

  const steps: string[] = [];

  if (/layer/.test(tech)) {
    if (baseNames.length >= 2) {
      steps.push(`Pour ${baseNames[0]} into ${glassPhrase} as the base layer`);
      for (let i = 1; i < baseNames.length; i++) {
        steps.push(
          `Slowly layer ${baseNames[i]} over the back of a bar spoon to keep the bands distinct`
        );
      }
    } else {
      steps.push(`Layer the ingredients carefully in ${glassPhrase} using a bar spoon`);
    }
  } else if (/blend/.test(tech)) {
    steps.push(`Add ${joinList(baseNames)} to a blender with ice`);
    steps.push("Blend until smooth");
    steps.push(`Pour into ${glassPhrase}`);
  } else if (isHot) {
    steps.push(`Add ${joinList(baseNames.filter((n) => !/coffee|water|tea/i.test(n)))} to ${glassPhrase}`);
    const hot = baseNames.find((n) => /coffee|water|tea/i.test(n));
    if (hot) steps.push(`Top with ${hot} and stir to combine`);
    else steps.push("Stir to combine");
  } else if (isSparklingServe && topperNames.length) {
    steps.push(`Add ${joinList(baseNames)} to ${glassPhrase}`);
    steps.push(`Top slowly with ${joinList(topperNames)}`);
  } else if (/muddle|build/.test(tech) && /mint|muddle|basil/i.test(baseNames.join(" "))) {
    const herb = baseNames.find((n) => /mint|basil/i.test(n));
    const citrus = baseNames.find((n) => /lime|lemon/i.test(n));
    const syrup = baseNames.find((n) => /syrup|sugar/i.test(n));
    const spirits = baseNames.filter(
      (n) => n !== herb && n !== citrus && n !== syrup && !isTopper(n)
    );
    if (herb && (citrus || syrup)) {
      steps.push(
        `Add ${joinList([herb, citrus, syrup].filter(Boolean) as string[])} to ${glassPhrase} and gently press the herbs`
      );
    } else {
      steps.push(`Build ${joinList(baseNames)} in ${glassPhrase}`);
    }
    if (spirits.length) steps.push(`Add ${joinList(spirits)}`);
    steps.push("Fill with ice");
    if (topperNames.length) steps.push(`Top with ${joinList(topperNames)}`);
    steps.push("Stir briefly to combine");
  } else if (/stir/.test(tech)) {
    steps.push(`Add ${joinList(baseNames)} to a mixing glass filled with ice`);
    steps.push("Stir until well chilled");
    if (/rocks|old-fashioned|old fashioned/i.test(glass)) {
      steps.push(`Strain into ${glassPhrase} over a large ice cube`);
    } else {
      steps.push(`Strain into ${glassPhrase}`);
    }
  } else if (/shake/.test(tech) || (!tech && baseNames.length >= 2)) {
    steps.push(`Add ${joinList(baseNames)} to a shaker filled with ice`);
    steps.push("Shake until well chilled");
    if (topperNames.length) {
      steps.push(`Strain into ${glassPhrase} filled with fresh ice`);
      steps.push(`Top with ${joinList(topperNames)}`);
    } else if (/rocks|old-fashioned|highball|collins|mule|mug/i.test(glass)) {
      steps.push(`Strain into ${glassPhrase} over fresh ice`);
    } else {
      steps.push(`Strain into ${glassPhrase}`);
    }
  } else {
    if (!isHot && !isSparklingServe) steps.push(`Fill ${glassPhrase} with ice`);
    steps.push(`Add ${joinList(baseNames)}`);
    if (topperNames.length) steps.push(`Top with ${joinList(topperNames)}`);
    steps.push("Stir gently to combine");
  }

  if (garnish) {
    steps.push(`Garnish with ${garnish} and serve`);
  } else if (!/serve/i.test(steps[steps.length - 1] || "")) {
    steps.push("Serve");
  }

  while (steps.length > 6) {
    const last = steps.pop()!;
    steps[steps.length - 1] = `${steps[steps.length - 1]}; ${last.charAt(0).toLowerCase()}${last.slice(1)}`;
  }

  return steps.map((s, i) => `${i + 1}. ${s.replace(/\.$/, "")}.`).join(" ");
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  const sb = createClient(url, key);

  const all: any[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await sb
      .from("cocktails")
      .select(
        "id, slug, name, ingredients, instructions, technique, glassware, garnish, notes, base_spirit, category_primary"
      )
      .range(from, from + 999);
    if (error) throw error;
    if (!data?.length) break;
    all.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }

  const updates: Array<{ slug: string; id: string; patch: Patch; reason: string }> = [];

  for (const cocktail of all) {
    const critical = criticalPatches[cocktail.slug];
    if (critical) {
      updates.push({
        slug: cocktail.slug,
        id: cocktail.id,
        patch: critical,
        reason: cocktail.slug === "vdc" ? "vdc-wording" : "critical-rewrite",
      });
      continue;
    }

    if (needsInstructionUpgrade(cocktail.instructions, cocktail.ingredients)) {
      const expanded = expandInstructions(cocktail);
      if (expanded && expanded !== cocktail.instructions) {
        updates.push({
          slug: cocktail.slug,
          id: cocktail.id,
          patch: { instructions: expanded },
          reason: "telegraphic-upgrade",
        });
      }
    }
  }

  console.log(`Planned updates: ${updates.length}`);
  const byReason: Record<string, number> = {};
  for (const u of updates) byReason[u.reason] = (byReason[u.reason] || 0) + 1;
  console.log(byReason);

  for (const u of updates) {
    console.log(`\n[${u.reason}] ${u.slug}`);
    if (u.patch.instructions) console.log("  instr:", u.patch.instructions);
    if (u.patch.ingredients) console.log("  ings:", JSON.stringify(u.patch.ingredients));
  }

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply to write.");
    return;
  }

  let ok = 0;
  let fail = 0;
  for (const u of updates) {
    const { error } = await sb.from("cocktails").update(u.patch).eq("id", u.id);
    if (error) {
      fail++;
      console.error(`FAILED ${u.slug}:`, error.message);
    } else {
      ok++;
    }
  }
  console.log(`\nApplied ${ok} updates (${fail} failures).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
