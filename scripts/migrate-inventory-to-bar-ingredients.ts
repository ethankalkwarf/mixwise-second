/**
 * Migration Script: Copy data from legacy inventories/inventory_items to bar_ingredients
 * 
 * This script migrates user ingredient data from the old table structure to the new one.
 * 
 * Old structure:
 *   - inventories (id, user_id, name, created_at)
 *   - inventory_items (id, inventory_id, ingredient_id, ingredient_name, created_at)
 * 
 * New structure:
 *   - bar_ingredients (id, user_id, ingredient_id, ingredient_name, created_at)
 * 
 * Run with: npx ts-node scripts/migrate-inventory-to-bar-ingredients.ts
 * 
 * Requires environment variables:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables:");
  console.error("  NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
  console.error("  SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✓" : "✗");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Inventory {
  id: string;
  user_id: string;
  name: string | null;
  created_at: string;
}

interface InventoryItem {
  id: string;
  inventory_id: string;
  ingredient_id: string;
  ingredient_name: string | null;
  created_at: string;
}

interface BarIngredient {
  user_id: string;
  ingredient_id: string;
  ingredient_name: string | null;
  created_at: string;
}

async function migrate() {
  console.log("Starting migration from inventories/inventory_items to bar_ingredients...\n");

  // Step 1: Get all inventories
  console.log("Step 1: Fetching all inventories...");
  const { data: inventories, error: inventoriesError } = await supabase
    .from("inventories")
    .select("*");

  if (inventoriesError) {
    console.error("Error fetching inventories:", inventoriesError);
    return;
  }

  if (!inventories || inventories.length === 0) {
    console.log("No inventories found. Nothing to migrate.");
    return;
  }

  console.log(`Found ${inventories.length} inventories\n`);

  // Step 2: Get all inventory items
  console.log("Step 2: Fetching all inventory items...");
  const inventoryIds = inventories.map((inv: Inventory) => inv.id);
  const { data: allItems, error: itemsError } = await supabase
    .from("inventory_items")
    .select("*")
    .in("inventory_id", inventoryIds);

  if (itemsError) {
    console.error("Error fetching inventory items:", itemsError);
    return;
  }

  if (!allItems || allItems.length === 0) {
    console.log("No inventory items found. Nothing to migrate.");
    return;
  }

  console.log(`Found ${allItems.length} total inventory items\n`);

  // Step 3: Group items by user
  console.log("Step 3: Grouping items by user...");
  const inventoryToUser = new Map<string, string>();
  inventories.forEach((inv: Inventory) => {
    inventoryToUser.set(inv.id, inv.user_id);
  });

  const userItems = new Map<string, InventoryItem[]>();
  allItems.forEach((item: InventoryItem) => {
    const userId = inventoryToUser.get(item.inventory_id);
    if (userId) {
      if (!userItems.has(userId)) {
        userItems.set(userId, []);
      }
      userItems.get(userId)!.push(item);
    }
  });

  console.log(`Found items for ${userItems.size} users\n`);

  // Step 4: Check existing bar_ingredients to avoid duplicates
  console.log("Step 4: Checking existing bar_ingredients...");
  const { data: existingBarIngredients, error: existingError } = await supabase
    .from("bar_ingredients")
    .select("user_id, ingredient_id");

  if (existingError) {
    console.error("Error fetching existing bar_ingredients:", existingError);
    return;
  }

  const existingSet = new Set<string>();
  (existingBarIngredients || []).forEach((item: { user_id: string; ingredient_id: string }) => {
    existingSet.add(`${item.user_id}:${item.ingredient_id}`);
  });

  console.log(`Found ${existingBarIngredients?.length || 0} existing bar_ingredients\n`);

  // Step 5: Prepare data for insertion
  console.log("Step 5: Preparing migration data...");
  const toInsert: BarIngredient[] = [];
  let skippedDuplicates = 0;

  userItems.forEach((items, userId) => {
    items.forEach((item) => {
      const key = `${userId}:${item.ingredient_id}`;
      if (existingSet.has(key)) {
        skippedDuplicates++;
        return;
      }
      existingSet.add(key); // Prevent duplicates within the same migration

      toInsert.push({
        user_id: userId,
        ingredient_id: item.ingredient_id,
        ingredient_name: item.ingredient_name,
        created_at: item.created_at,
      });
    });
  });

  console.log(`Prepared ${toInsert.length} items for insertion`);
  console.log(`Skipped ${skippedDuplicates} duplicates\n`);

  if (toInsert.length === 0) {
    console.log("No new items to migrate. All items already exist in bar_ingredients.");
    return;
  }

  // Step 6: Insert in batches
  console.log("Step 6: Inserting into bar_ingredients...");
  const batchSize = 100;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < toInsert.length; i += batchSize) {
    const batch = toInsert.slice(i, i + batchSize);
    const { error: insertError } = await supabase
      .from("bar_ingredients")
      .insert(batch);

    if (insertError) {
      console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, insertError);
      errors += batch.length;
    } else {
      inserted += batch.length;
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} items`);
    }
  }

  // Summary
  console.log("\n========================================");
  console.log("Migration Complete!");
  console.log("========================================");
  console.log(`Total inventories processed: ${inventories.length}`);
  console.log(`Total users with items: ${userItems.size}`);
  console.log(`Items successfully inserted: ${inserted}`);
  console.log(`Items skipped (duplicates): ${skippedDuplicates}`);
  console.log(`Items failed: ${errors}`);
  console.log("========================================\n");

  // Print per-user summary
  console.log("Per-user summary:");
  userItems.forEach((items, userId) => {
    console.log(`  User ${userId}: ${items.length} items`);
  });
}

migrate().catch(console.error);

