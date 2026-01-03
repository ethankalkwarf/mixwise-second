import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

/**
 * Shopping List API - Uses RPC functions to bypass PostgREST schema cache issues
 * 
 * The PostgREST schema cache is stale and doesn't recognize ingredient_name/ingredient_category.
 * Using supabase.rpc() with SQL functions bypasses this completely.
 * 
 * IMPORTANT: Run the migration 011_shopping_list_rpc.sql in your Supabase SQL editor first!
 * 
 * GET /api/shopping-list - Get user's shopping list
 * POST /api/shopping-list - Add item(s) to shopping list  
 * PATCH /api/shopping-list - Update item (toggle checked status)
 * DELETE /api/shopping-list - Remove item(s) from shopping list
 */

export const dynamic = 'force-dynamic';

// Helper to get authenticated user
async function getAuthenticatedUser() {
  const supabaseAuth = createRouteHandlerClient({ cookies });
  const { data: { user }, error } = await supabaseAuth.auth.getUser();
  if (error || !user) {
    return null;
  }
  return user;
}

// Helper to get service role client
function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseServiceKey) {
    console.error("[ShoppingList API] No service role key available");
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// GET - Fetch shopping list using RPC
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Use RPC function to bypass schema cache
    console.log("[ShoppingList API] Calling get_shopping_list for user:", user.id);
    
    const { data, error } = await supabase.rpc('get_shopping_list', {
      p_user_id: user.id
    });

    if (error) {
      console.error("[ShoppingList API] RPC get_shopping_list failed:", error);
      console.error("[ShoppingList API] Full error:", JSON.stringify(error, null, 2));
      
      // Return empty list if function doesn't exist yet
      if (error.message?.includes('function') && error.message?.includes('does not exist')) {
        console.log("[ShoppingList API] RPC function not found - run migration 011_shopping_list_rpc.sql");
        return NextResponse.json({ 
          items: [], 
          error: `Shopping list functions not installed. Actual error: ${error.message}`,
          requiresMigration: true 
        });
      }
      
      return NextResponse.json({ items: [], error: error.message });
    }

    // Map out_ prefixed columns back to regular names
    const items = (data || []).map((row: any) => ({
      id: row.out_id,
      user_id: row.out_user_id,
      ingredient_id: row.out_ingredient_id,
      ingredient_name: row.out_ingredient_name,
      ingredient_category: row.out_ingredient_category,
      is_checked: row.out_is_checked,
      added_at: row.out_added_at,
    }));
    
    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("[ShoppingList API] Unexpected error:", error);
    return NextResponse.json({ items: [], error: error.message || "Unknown error" });
  }
}

// POST - Add item(s) to shopping list using RPC
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const body = await request.json();
    const items = Array.isArray(body) ? body : [body];
    
    const results = [];
    let lastError = null;
    
    for (const item of items) {
      // Use RPC function to bypass schema cache
      console.log("[ShoppingList API] Calling upsert_shopping_item with:", {
        p_user_id: user.id,
        p_ingredient_id: item.ingredient_id,
        p_ingredient_name: item.ingredient_name || 'Unknown Ingredient',
        p_ingredient_category: item.ingredient_category || null,
        p_is_checked: item.is_checked || false
      });
      
      const { data, error } = await supabase.rpc('upsert_shopping_item', {
        p_user_id: user.id,
        p_ingredient_id: item.ingredient_id,
        p_ingredient_name: item.ingredient_name || 'Unknown Ingredient',
        p_ingredient_category: item.ingredient_category || null,
        p_is_checked: item.is_checked || false
      });
      
      if (error) {
        console.error("[ShoppingList API] RPC upsert_shopping_item failed:", error);
        console.error("[ShoppingList API] Full error details:", JSON.stringify(error, null, 2));
        lastError = error;
        
        // If it's a function not found error, break early
        if (error.message?.includes('function') && error.message?.includes('does not exist')) {
          return NextResponse.json({ 
            error: `Shopping list functions not installed. Actual error: ${error.message}`,
            requiresMigration: true 
          }, { status: 500 });
        }
      } else if (data && data.length > 0) {
        // Map out_ prefixed columns back to regular names
        const mapped = {
          id: data[0].out_id,
          user_id: data[0].out_user_id,
          ingredient_id: data[0].out_ingredient_id,
          ingredient_name: data[0].out_ingredient_name,
          ingredient_category: data[0].out_ingredient_category,
          is_checked: data[0].out_is_checked,
          added_at: data[0].out_added_at,
        };
        results.push(mapped);
      } else if (data) {
        // Handle case where data is returned but not as array
        const mapped = {
          id: data.out_id,
          user_id: data.out_user_id,
          ingredient_id: data.out_ingredient_id,
          ingredient_name: data.out_ingredient_name,
          ingredient_category: data.out_ingredient_category,
          is_checked: data.out_is_checked,
          added_at: data.out_added_at,
        };
        results.push(mapped);
      }
    }

    if (lastError && results.length === 0) {
      return NextResponse.json({ error: lastError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, items: results });
  } catch (error: any) {
    console.error("[ShoppingList API] Unexpected error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

// PATCH - Update item (toggle checked status) using RPC
export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const body = await request.json();
    const { ingredient_id } = body;

    if (!ingredient_id) {
      return NextResponse.json({ error: "ingredient_id required" }, { status: 400 });
    }

    // Use RPC function to toggle
    const { data, error } = await supabase.rpc('toggle_shopping_item_checked', {
      p_user_id: user.id,
      p_ingredient_id: ingredient_id
    });

    if (error) {
      console.error("[ShoppingList API] RPC toggle failed:", error);
      
      if (error.message.includes('function') || error.message.includes('does not exist')) {
        return NextResponse.json({ 
          error: "Shopping list functions not installed. Please contact support.",
          requiresMigration: true 
        }, { status: 500 });
      }
      
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, is_checked: data });
  } catch (error: any) {
    console.error("[ShoppingList API] Unexpected error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

// DELETE - Remove item(s) from shopping list using RPC
export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const ingredientId = searchParams.get("ingredient_id");
    const clearChecked = searchParams.get("clear_checked") === "true";
    const clearAll = searchParams.get("clear_all") === "true";

    let error = null;

    if (clearAll) {
      const result = await supabase.rpc('clear_all_shopping_items', {
        p_user_id: user.id
      });
      error = result.error;
    } else if (clearChecked) {
      const result = await supabase.rpc('clear_checked_shopping_items', {
        p_user_id: user.id
      });
      error = result.error;
    } else if (ingredientId) {
      console.log("[ShoppingList API] Deleting item:", { userId: user.id, ingredientId });
      const result = await supabase.rpc('delete_shopping_item', {
        p_user_id: user.id,
        p_ingredient_id: ingredientId
      });
      console.log("[ShoppingList API] Delete result:", result);
      error = result.error;
      
      // Check if anything was actually deleted
      if (!error && result.data === 0) {
        console.log("[ShoppingList API] WARNING: Delete returned 0 rows - item not found");
        return NextResponse.json({ 
          success: false, 
          error: "Item not found in database",
          deletedCount: 0,
          searchedFor: { userId: user.id, ingredientId }
        });
      }
      
      if (!error) {
        console.log("[ShoppingList API] Deleted", result.data, "row(s)");
        return NextResponse.json({ success: true, deletedCount: result.data });
      }
    } else {
      return NextResponse.json({ error: "ingredient_id, clear_checked, or clear_all required" }, { status: 400 });
    }

    if (error) {
      console.error("[ShoppingList API] RPC delete failed:", error);
      
      if (error.message.includes('function') || error.message.includes('does not exist')) {
        return NextResponse.json({ 
          error: "Shopping list functions not installed. Please contact support.",
          requiresMigration: true 
        }, { status: 500 });
      }
      
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[ShoppingList API] Unexpected error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
