/**
 * Check Database State
 * 
 * Examines all relevant tables to understand where user data is stored.
 * 
 * Run with: npx ts-node scripts/check-database-state.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkState() {
  console.log("Checking database state...\n");

  // Check inventories table
  console.log("=== INVENTORIES TABLE ===");
  try {
    const { data: inventories, error, count } = await supabase
      .from("inventories")
      .select("*", { count: "exact" });
    
    if (error) {
      console.log("Error or table doesn't exist:", error.message);
    } else {
      console.log(`Count: ${count || inventories?.length || 0}`);
      if (inventories && inventories.length > 0) {
        console.log("Sample:", JSON.stringify(inventories.slice(0, 3), null, 2));
      }
    }
  } catch (e: any) {
    console.log("Exception:", e.message);
  }

  // Check inventory_items table
  console.log("\n=== INVENTORY_ITEMS TABLE ===");
  try {
    const { data: items, error, count } = await supabase
      .from("inventory_items")
      .select("*", { count: "exact" });
    
    if (error) {
      console.log("Error or table doesn't exist:", error.message);
    } else {
      console.log(`Count: ${count || items?.length || 0}`);
      if (items && items.length > 0) {
        console.log("Sample:", JSON.stringify(items.slice(0, 3), null, 2));
      }
    }
  } catch (e: any) {
    console.log("Exception:", e.message);
  }

  // Check bar_ingredients table
  console.log("\n=== BAR_INGREDIENTS TABLE ===");
  try {
    const { data: barIngredients, error, count } = await supabase
      .from("bar_ingredients")
      .select("*", { count: "exact" });
    
    if (error) {
      console.log("Error or table doesn't exist:", error.message);
    } else {
      console.log(`Count: ${count || barIngredients?.length || 0}`);
      if (barIngredients && barIngredients.length > 0) {
        console.log("Sample:", JSON.stringify(barIngredients.slice(0, 5), null, 2));
        
        // Group by user
        const userCounts = new Map<string, number>();
        barIngredients.forEach((item: any) => {
          const count = userCounts.get(item.user_id) || 0;
          userCounts.set(item.user_id, count + 1);
        });
        
        console.log("\nItems per user:");
        userCounts.forEach((count, userId) => {
          console.log(`  ${userId}: ${count} items`);
        });
      }
    }
  } catch (e: any) {
    console.log("Exception:", e.message);
  }

  // Check profiles table
  console.log("\n=== PROFILES TABLE ===");
  try {
    const { data: profiles, error, count } = await supabase
      .from("profiles")
      .select("id, username, display_name", { count: "exact" });
    
    if (error) {
      console.log("Error:", error.message);
    } else {
      console.log(`Count: ${count || profiles?.length || 0}`);
      if (profiles) {
        console.log("Users:", JSON.stringify(profiles, null, 2));
      }
    }
  } catch (e: any) {
    console.log("Exception:", e.message);
  }

  // Check user_preferences table
  console.log("\n=== USER_PREFERENCES TABLE ===");
  try {
    const { data: prefs, error, count } = await supabase
      .from("user_preferences")
      .select("user_id, public_bar_enabled", { count: "exact" });
    
    if (error) {
      console.log("Error:", error.message);
    } else {
      console.log(`Count: ${count || prefs?.length || 0}`);
      if (prefs) {
        console.log("Preferences:", JSON.stringify(prefs, null, 2));
      }
    }
  } catch (e: any) {
    console.log("Exception:", e.message);
  }

  // List all tables
  console.log("\n=== ALL TABLES (from pg_tables) ===");
  try {
    const { data: tables, error } = await supabase
      .rpc("get_tables_list");
    
    if (error) {
      // Try alternative approach
      console.log("RPC not available, checking known tables...");
    } else {
      console.log("Tables:", tables);
    }
  } catch (e: any) {
    console.log("Could not list tables");
  }
}

checkState().catch(console.error);

