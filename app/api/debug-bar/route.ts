import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/debug-bar?userId=xxx
 * 
 * Debug endpoint to check what data exists in the database for a user.
 * Only works with service role key.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseServiceKey) {
    return NextResponse.json({ error: "No service key" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const results: any = {
    userId,
    timestamp: new Date().toISOString(),
  };

  // Check inventories table
  try {
    const { data: inventories, error } = await supabase
      .from("inventories")
      .select("*")
      .eq("user_id", userId);
    
    results.inventories = { data: inventories, error: error?.message };
  } catch (e: any) {
    results.inventories = { error: e.message };
  }

  // Check inventory_items table
  try {
    // First get inventory IDs
    const { data: invs } = await supabase
      .from("inventories")
      .select("id")
      .eq("user_id", userId);
    
    if (invs && invs.length > 0) {
      const inventoryIds = invs.map(i => i.id);
      const { data: items, error } = await supabase
        .from("inventory_items")
        .select("*")
        .in("inventory_id", inventoryIds);
      
      results.inventory_items = { count: items?.length, data: items?.slice(0, 5), error: error?.message };
    } else {
      results.inventory_items = { count: 0, note: "No inventories found" };
    }
  } catch (e: any) {
    results.inventory_items = { error: e.message };
  }

  // Check bar_ingredients table
  try {
    const { data: barIngredients, error } = await supabase
      .from("bar_ingredients")
      .select("*")
      .eq("user_id", userId);
    
    results.bar_ingredients = { count: barIngredients?.length, data: barIngredients?.slice(0, 5), error: error?.message };
  } catch (e: any) {
    results.bar_ingredients = { error: e.message };
  }

  // Check user profile
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    results.profile = { data: profile, error: error?.message };
  } catch (e: any) {
    results.profile = { error: e.message };
  }

  // Check user_preferences
  try {
    const { data: prefs, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    results.user_preferences = { data: prefs, error: error?.message };
  } catch (e: any) {
    results.user_preferences = { error: e.message };
  }

  return NextResponse.json(results, { status: 200 });
}

