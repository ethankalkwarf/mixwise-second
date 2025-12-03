/**
 * Quick verification utility for Supabase cocktails data.
 *
 * Usage:
 *   npx tsx scripts/verifyCocktails.ts [slug]
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const slugArg = process.argv[2];
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log("\n📋 Listing first 5 cocktails...");
  const { data: list, error: listError } = await supabase
    .from("cocktails")
    .select("name, slug, base_spirit")
    .order("name", { ascending: true })
    .limit(5);

  if (listError) {
    console.error("❌ Failed to read cocktail list", listError);
    process.exit(1);
  }

  list?.forEach((row, idx) => {
    console.log(`${idx + 1}. ${row.name} (${row.slug}) – ${row.base_spirit || "n/a"}`);
  });

  if (!slugArg) {
    console.log("\nℹ️  Pass a slug to inspect a specific cocktail, e.g. `npx tsx scripts/verifyCocktails.ts old-fashioned`\n");
    return;
  }

  console.log(`\n🔎 Looking up slug: ${slugArg}`);
  const { data, error } = await supabase
    .from("cocktails")
    .select("*")
    .eq("slug", slugArg)
    .maybeSingle();

  if (error) {
    console.error("❌ Failed to load cocktail", error);
    process.exit(1);
  }

  if (!data) {
    console.warn("⚠️  No cocktail found for that slug.\n");
    return;
  }

  console.log(`Name: ${data.name}`);
  console.log(`Base spirit: ${data.base_spirit || "n/a"}`);
  console.log(`Categories: ${(data.categories_all || []).join(", ") || "n/a"}`);
  console.log(`Tags: ${(data.tags || []).join(", ") || "n/a"}`);
  console.log(`Ingredients: ${(Array.isArray(data.ingredients) ? data.ingredients.length : 0) || 0}`);
  console.log(`Instructions: ${data.instructions ? "available" : "missing"}`);
  console.log("\n✅ Verification complete.\n");
}

main().catch((error) => {
  console.error("❌ Verification failed", error);
  process.exit(1);
});
