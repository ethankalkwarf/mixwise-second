import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/admin/migrate-bar-ingredients
 * 
 * Migrates user ingredient data from legacy inventories/inventory_items 
 * tables to the new bar_ingredients table.
 * 
 * This is a one-time migration endpoint that:
 * 1. Reads all data from inventories and inventory_items tables
 * 2. Inserts into bar_ingredients table (skipping duplicates)
 * 3. Returns a summary of the migration
 * 
 * Requires SUPABASE_SERVICE_ROLE_KEY to be set.
 */
export async function POST(request: Request) {
  // Optional: Add admin authentication here
  // For now, we'll rely on the fact that this endpoint isn't publicly known

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: "Missing required environment variables" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      steps: [],
    };

    // Step 1: Get all inventories
    const { data: inventories, error: inventoriesError } = await supabase
      .from("inventories")
      .select("*");

    if (inventoriesError) {
      results.steps.push({ step: 1, status: "error", error: inventoriesError.message });
      return NextResponse.json(results);
    }

    results.steps.push({ 
      step: 1, 
      status: "success", 
      message: `Found ${inventories?.length || 0} inventories` 
    });

    if (!inventories || inventories.length === 0) {
      results.summary = "No inventories found. Nothing to migrate.";
      return NextResponse.json(results);
    }

    // Step 2: Get all inventory items
    const inventoryIds = inventories.map((inv: any) => inv.id);
    const { data: allItems, error: itemsError } = await supabase
      .from("inventory_items")
      .select("*")
      .in("inventory_id", inventoryIds);

    if (itemsError) {
      results.steps.push({ step: 2, status: "error", error: itemsError.message });
      return NextResponse.json(results);
    }

    results.steps.push({ 
      step: 2, 
      status: "success", 
      message: `Found ${allItems?.length || 0} inventory items` 
    });

    if (!allItems || allItems.length === 0) {
      results.summary = "No inventory items found. Nothing to migrate.";
      return NextResponse.json(results);
    }

    // Step 3: Group items by user
    const inventoryToUser = new Map<string, string>();
    inventories.forEach((inv: any) => {
      inventoryToUser.set(inv.id, inv.user_id);
    });

    const userItems = new Map<string, any[]>();
    allItems.forEach((item: any) => {
      const userId = inventoryToUser.get(item.inventory_id);
      if (userId) {
        if (!userItems.has(userId)) {
          userItems.set(userId, []);
        }
        userItems.get(userId)!.push(item);
      }
    });

    results.steps.push({ 
      step: 3, 
      status: "success", 
      message: `Found items for ${userItems.size} users` 
    });

    // Step 4: Check existing bar_ingredients
    const { data: existingBarIngredients, error: existingError } = await supabase
      .from("bar_ingredients")
      .select("user_id, ingredient_id");

    if (existingError) {
      results.steps.push({ step: 4, status: "error", error: existingError.message });
      return NextResponse.json(results);
    }

    const existingSet = new Set<string>();
    (existingBarIngredients || []).forEach((item: any) => {
      existingSet.add(`${item.user_id}:${item.ingredient_id}`);
    });

    results.steps.push({ 
      step: 4, 
      status: "success", 
      message: `Found ${existingBarIngredients?.length || 0} existing bar_ingredients` 
    });

    // Step 5: Prepare data for insertion
    const toInsert: any[] = [];
    let skippedDuplicates = 0;

    userItems.forEach((items, userId) => {
      items.forEach((item) => {
        const key = `${userId}:${item.ingredient_id}`;
        if (existingSet.has(key)) {
          skippedDuplicates++;
          return;
        }
        existingSet.add(key);

        toInsert.push({
          user_id: userId,
          ingredient_id: item.ingredient_id,
          ingredient_name: item.ingredient_name,
          created_at: item.created_at,
        });
      });
    });

    results.steps.push({ 
      step: 5, 
      status: "success", 
      message: `Prepared ${toInsert.length} items for insertion, skipped ${skippedDuplicates} duplicates` 
    });

    if (toInsert.length === 0) {
      results.summary = "No new items to migrate. All items already exist in bar_ingredients.";
      return NextResponse.json(results);
    }

    // Step 6: Insert in batches
    const batchSize = 100;
    let inserted = 0;
    let errors = 0;
    const batchResults: any[] = [];

    for (let i = 0; i < toInsert.length; i += batchSize) {
      const batch = toInsert.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from("bar_ingredients")
        .insert(batch);

      if (insertError) {
        errors += batch.length;
        batchResults.push({ 
          batch: Math.floor(i / batchSize) + 1, 
          status: "error", 
          error: insertError.message 
        });
      } else {
        inserted += batch.length;
        batchResults.push({ 
          batch: Math.floor(i / batchSize) + 1, 
          status: "success", 
          count: batch.length 
        });
      }
    }

    results.steps.push({ 
      step: 6, 
      status: errors > 0 ? "partial" : "success", 
      message: `Inserted ${inserted} items, ${errors} failed`,
      batches: batchResults
    });

    // Summary
    const userSummary: any[] = [];
    userItems.forEach((items, userId) => {
      userSummary.push({ userId, itemCount: items.length });
    });

    results.summary = {
      totalInventories: inventories.length,
      totalUsers: userItems.size,
      itemsInserted: inserted,
      itemsSkipped: skippedDuplicates,
      itemsFailed: errors,
      users: userSummary,
    };

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Unexpected error", message: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to check current state without migrating
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: "Missing required environment variables" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Check inventories
    const { data: inventories, error: invError } = await supabase
      .from("inventories")
      .select("id, user_id");

    // Check inventory_items count
    const { count: itemsCount, error: itemsError } = await supabase
      .from("inventory_items")
      .select("*", { count: "exact", head: true });

    // Check bar_ingredients count
    const { count: barCount, error: barError } = await supabase
      .from("bar_ingredients")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      inventories: {
        count: inventories?.length || 0,
        error: invError?.message,
      },
      inventory_items: {
        count: itemsCount || 0,
        error: itemsError?.message,
      },
      bar_ingredients: {
        count: barCount || 0,
        error: barError?.message,
      },
      recommendation: (itemsCount || 0) > (barCount || 0) 
        ? "Migration recommended - legacy tables have more data"
        : "Migration may not be needed - bar_ingredients already has data",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Unexpected error", message: error.message },
      { status: 500 }
    );
  }
}

