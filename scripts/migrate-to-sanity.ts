/**
 * Migration Script: Supabase → Sanity
 * 
 * This script exports all cocktails and ingredients from Supabase
 * and imports them into Sanity.
 * 
 * Prerequisites:
 * 1. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 * 2. Create a Sanity API token at https://www.sanity.io/manage
 *    - Go to your project → API → Tokens → Add API Token
 *    - Give it "Editor" permissions
 *    - Copy the token and set it as SANITY_API_TOKEN in .env.local
 * 
 * Run with: npx ts-node --esm scripts/migrate-to-sanity.ts
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createSanityClient } from "@sanity/client";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "hqga2p7i";
const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const sanityToken = process.env.SANITY_API_TOKEN;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  console.error("   Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

if (!sanityToken) {
  console.error("❌ Missing SANITY_API_TOKEN in .env.local");
  console.error("   Create a token at https://www.sanity.io/manage → API → Tokens");
  process.exit(1);
}

// Initialize clients
const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
const sanity = createSanityClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: "2024-01-01",
  token: sanityToken,
  useCdn: false,
});

// Slug generator
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Map Supabase category to Sanity type
function mapIngredientType(category: string | null): string {
  const mapping: Record<string, string> = {
    "Spirit": "spirit",
    "Liqueur": "liqueur",
    "Wine": "wine",
    "Beer": "beer",
    "Mixer": "mixer",
    "Citrus": "citrus",
    "Syrup": "syrup",
    "Bitters": "bitters",
    "Garnish": "garnish",
  };
  return mapping[category || ""] || "other";
}

async function migrateIngredients(): Promise<Map<number, string>> {
  console.log("\n📦 Fetching ingredients from Supabase...");
  
  const { data: ingredients, error } = await supabase
    .from("ingredients")
    .select("*")
    .order("name");

  if (error) {
    console.error("❌ Failed to fetch ingredients:", error.message);
    process.exit(1);
  }

  console.log(`   Found ${ingredients?.length || 0} ingredients`);

  // Map old numeric ID to new Sanity ID
  const idMap = new Map<number, string>();

  if (!ingredients || ingredients.length === 0) {
    console.log("   No ingredients to migrate");
    return idMap;
  }

  console.log("📤 Importing ingredients to Sanity...");

  let imported = 0;
  let skipped = 0;

  for (const ing of ingredients) {
    const sanityId = `ingredient-${ing.id}`;
    const slug = toSlug(ing.name);

    // Check if already exists
    const existing = await sanity.fetch(
      `*[_type == "ingredient" && _id == $id][0]`,
      { id: sanityId }
    );

    if (existing) {
      skipped++;
      idMap.set(ing.id, sanityId);
      continue;
    }

    const doc = {
      _id: sanityId,
      _type: "ingredient",
      name: ing.name,
      slug: { _type: "slug", current: slug },
      type: mapIngredientType(ing.category),
      description: ing.description || undefined,
      isStaple: ing.is_staple || false,
    };

    try {
      await sanity.createOrReplace(doc);
      idMap.set(ing.id, sanityId);
      imported++;
      
      if (imported % 20 === 0) {
        console.log(`   Imported ${imported} ingredients...`);
      }
    } catch (err: any) {
      console.error(`   ❌ Failed to import "${ing.name}":`, err.message);
    }
  }

  console.log(`   ✅ Imported ${imported} ingredients (${skipped} already existed)`);
  return idMap;
}

async function migrateCocktails(ingredientIdMap: Map<number, string>): Promise<void> {
  console.log("\n🍸 Fetching cocktails from Supabase...");

  const { data: cocktails, error } = await supabase
    .from("cocktails")
    .select(`
      *,
      cocktail_ingredients (
        measure,
        ingredient_id,
        ingredient:ingredients ( id, name )
      )
    `);

  if (error) {
    console.error("❌ Failed to fetch cocktails:", error.message);
    process.exit(1);
  }

  console.log(`   Found ${cocktails?.length || 0} cocktails`);

  if (!cocktails || cocktails.length === 0) {
    console.log("   No cocktails to migrate");
    return;
  }

  console.log("📤 Importing cocktails to Sanity...");

  let imported = 0;
  let skipped = 0;

  for (const cocktail of cocktails) {
    const sanityId = `cocktail-${cocktail.id}`;
    const slug = toSlug(cocktail.name);

    // Check if already exists
    const existing = await sanity.fetch(
      `*[_type == "cocktail" && _id == $id][0]`,
      { id: sanityId }
    );

    if (existing) {
      skipped++;
      continue;
    }

    // Build ingredients array with references
    const ingredients = (cocktail.cocktail_ingredients || []).map((ci: any, index: number) => {
      const ingredientId = ci.ingredient_id || ci.ingredient?.id;
      const sanityIngredientId = ingredientIdMap.get(ingredientId);
      
      if (!sanityIngredientId) {
        console.warn(`   ⚠️ Unknown ingredient ID ${ingredientId} in "${cocktail.name}"`);
        return null;
      }

      return {
        _key: `ing-${index}`,
        ingredient: {
          _type: "reference",
          _ref: sanityIngredientId,
        },
        amount: ci.measure || undefined,
        isOptional: false,
      };
    }).filter(Boolean);

    // Determine primary spirit from category
    const primarySpirit = mapPrimarySpirit(cocktail.category);

    const doc = {
      _id: sanityId,
      _type: "cocktail",
      name: cocktail.name,
      slug: { _type: "slug", current: slug },
      description: cocktail.instructions ? cocktail.instructions.substring(0, 200) : undefined,
      glass: mapGlass(cocktail.glass),
      primarySpirit,
      isPopular: cocktail.is_popular || false,
      difficulty: "easy",
      ingredients,
      instructions: cocktail.instructions ? [
        {
          _type: "block",
          _key: "instructions-block",
          style: "normal",
          children: [
            {
              _type: "span",
              _key: "instructions-span",
              text: cocktail.instructions,
              marks: [],
            },
          ],
          markDefs: [],
        },
      ] : undefined,
    };

    try {
      await sanity.createOrReplace(doc);
      imported++;

      if (imported % 20 === 0) {
        console.log(`   Imported ${imported} cocktails...`);
      }
    } catch (err: any) {
      console.error(`   ❌ Failed to import "${cocktail.name}":`, err.message);
    }
  }

  console.log(`   ✅ Imported ${imported} cocktails (${skipped} already existed)`);
}

function mapPrimarySpirit(category: string | null): string | undefined {
  if (!category) return undefined;
  
  const lower = category.toLowerCase();
  if (lower.includes("vodka")) return "vodka";
  if (lower.includes("gin")) return "gin";
  if (lower.includes("rum")) return "rum";
  if (lower.includes("tequila")) return "tequila";
  if (lower.includes("whiskey") || lower.includes("bourbon")) return "whiskey";
  if (lower.includes("scotch")) return "scotch";
  if (lower.includes("brandy") || lower.includes("cognac")) return "brandy";
  
  return undefined;
}

function mapGlass(glass: string | null): string | undefined {
  if (!glass) return undefined;
  
  const lower = glass.toLowerCase();
  if (lower.includes("highball")) return "highball";
  if (lower.includes("cocktail") || lower.includes("martini")) return "martini";
  if (lower.includes("coupe")) return "coupe";
  if (lower.includes("rocks") || lower.includes("old-fashioned") || lower.includes("old fashioned")) return "rocks";
  if (lower.includes("collins")) return "collins";
  if (lower.includes("flute") || lower.includes("champagne")) return "flute";
  if (lower.includes("wine")) return "wine";
  if (lower.includes("copper") || lower.includes("mug")) return "copper-mug";
  if (lower.includes("hurricane")) return "hurricane";
  if (lower.includes("shot")) return "shot";
  
  return "other";
}

async function main() {
  console.log("🚀 Starting Supabase → Sanity Migration");
  console.log("=========================================");
  console.log(`   Supabase: ${supabaseUrl}`);
  console.log(`   Sanity: ${sanityProjectId}/${sanityDataset}`);

  // Step 1: Migrate ingredients
  const ingredientIdMap = await migrateIngredients();

  // Step 2: Migrate cocktails
  await migrateCocktails(ingredientIdMap);

  console.log("\n=========================================");
  console.log("✅ Migration complete!");
  console.log("   Visit /studio to see your content");
  console.log("   Visit /cocktails to see the results");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});





