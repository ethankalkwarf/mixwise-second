#!/usr/bin/env tsx

/**
 * Combine Cream and Heavy Cream into a single catalog ingredient.
 * Keep "Cream" as canonical so bare "cream" exact-matches (and does not
 * latch onto Whipped Cream / Irish Cream).
 *
 * Usage:
 *   npx tsx scripts/combine-cream-ingredients.ts           # dry run
 *   npx tsx scripts/combine-cream-ingredients.ts --confirm # apply
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CANONICAL_NAME = "Cream";
const DUPLICATE_NAME = "Heavy Cream";

async function countRows(table: string, ingredientId: string | number) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("ingredient_id", ingredientId);
  if (error) {
    return { count: null as number | null, error: error.message };
  }
  return { count: count ?? 0, error: null as string | null };
}

async function remappeduplicate(
  table: string,
  fromId: string,
  toId: string,
  dryRun: boolean
) {
  const before = await countRows(table, fromId);
  if (before.error) {
    console.log(`  - ${table}: skip (${before.error})`);
    return;
  }
  console.log(`  - ${table}: ${before.count} rows to remap ${fromId} → ${toId}`);
  if (dryRun || !before.count) return;

  // Users/rows that already have the canonical id must drop the duplicate row
  // instead of updating into a unique conflict.
  if (table === "bar_ingredients") {
    const { data: dupRows, error: dupErr } = await supabase
      .from(table)
      .select("id, user_id")
      .eq("ingredient_id", fromId);
    if (dupErr) throw dupErr;

    for (const row of dupRows || []) {
      const { data: existing } = await supabase
        .from(table)
        .select("id")
        .eq("user_id", row.user_id)
        .eq("ingredient_id", toId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from(table).delete().eq("id", row.id);
        if (error) throw error;
        console.log(`    deleted duplicate bar row for user ${row.user_id}`);
      } else {
        const { error } = await supabase
          .from(table)
          .update({ ingredient_id: toId, ingredient_name: CANONICAL_NAME })
          .eq("id", row.id);
        if (error) throw error;
        console.log(`    remapped bar row for user ${row.user_id}`);
      }
    }
    return;
  }

  const { error } = await supabase
    .from(table)
    .update({ ingredient_id: toId })
    .eq("ingredient_id", fromId);
  if (error) throw error;
}

async function combineCreamIngredients(dryRun: boolean) {
  console.log("COMBINING CREAM INGREDIENTS");
  console.log("===========================\n");

  const { data: ingredients, error } = await supabase
    .from("ingredients")
    .select("id, name, category, image_url")
    .in("name", [CANONICAL_NAME, DUPLICATE_NAME]);

  if (error) throw error;
  if (!ingredients?.length) {
    console.log("No cream ingredients found.");
    return;
  }

  const canonical = ingredients.find((ing) => ing.name === CANONICAL_NAME);
  const duplicate = ingredients.find((ing) => ing.name === DUPLICATE_NAME);

  for (const ing of ingredients) {
    console.log(`- ${ing.name} (ID: ${ing.id}, category: ${ing.category})`);
  }
  console.log("");

  if (!canonical || !duplicate) {
    console.log("Already combined or unexpected names — nothing to do.");
    return;
  }

  console.log(`Canonical: ${canonical.name} (${canonical.id})`);
  console.log(`Duplicate: ${duplicate.name} (${duplicate.id})\n`);

  const tables = [
    "bar_ingredients",
    "cocktail_ingredients",
    "cocktail_ingredients_uuid",
    "inventory_items",
    "shopping_list",
  ];

  console.log("Current usage:");
  for (const table of tables) {
    const a = await countRows(table, canonical.id);
    const b = await countRows(table, duplicate.id);
    if (a.error && b.error) {
      console.log(`  - ${table}: unavailable`);
      continue;
    }
    console.log(
      `  - ${table}: ${CANONICAL_NAME}=${a.count ?? "?"} ${DUPLICATE_NAME}=${b.count ?? "?"}`
    );
  }

  console.log(
    `\nPlan: remap ${DUPLICATE_NAME} → ${CANONICAL_NAME}, then delete ${DUPLICATE_NAME}.`
  );
  console.log(dryRun ? "\nDRY RUN — no changes.\n" : "\nLIVE — applying changes.\n");

  if (!dryRun) {
    for (const table of tables) {
      await remappeduplicate(table, String(duplicate.id), String(canonical.id), dryRun);
    }

    const { error: deleteError } = await supabase
      .from("ingredients")
      .delete()
      .eq("id", duplicate.id);
    if (deleteError) throw deleteError;
    console.log(`Deleted ingredient ${DUPLICATE_NAME} (${duplicate.id})`);
  }

  const { data: remaining } = await supabase
    .from("ingredients")
    .select("id, name")
    .in("name", [CANONICAL_NAME, DUPLICATE_NAME]);

  console.log("\nRemaining cream rows:", remaining);
  console.log(dryRun ? "\nDry run complete." : "\nMerge complete.");
}

const dryRun = !process.argv.includes("--confirm");
combineCreamIngredients(dryRun).catch((error) => {
  console.error(error);
  process.exit(1);
});
