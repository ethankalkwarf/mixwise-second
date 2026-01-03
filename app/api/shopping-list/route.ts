import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

/**
 * Shopping List API - Uses service role to bypass schema cache issues
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

// GET - Fetch shopping list
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

    const { data, error } = await supabase
      .from("shopping_list")
      .select("*")
      .eq("user_id", user.id)
      .order("added_at", { ascending: false });

    if (error) {
      console.error("[ShoppingList API] Error fetching:", error);
      return NextResponse.json({ items: [], error: error.message });
    }

    return NextResponse.json({ items: data || [] });
  } catch (error: any) {
    console.error("[ShoppingList API] Unexpected error:", error);
    return NextResponse.json({ items: [], error: error.message || "Unknown error" });
  }
}

// POST - Add item(s) to shopping list
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
    
    // Handle single item or array of items
    const items = Array.isArray(body) ? body : [body];
    
    const toInsert = items.map(item => ({
      user_id: user.id,
      ingredient_id: item.ingredient_id,
      ingredient_name: item.ingredient_name,
      ingredient_category: item.ingredient_category || null,
      is_checked: item.is_checked || false,
    }));

    // Use upsert to handle duplicates gracefully
    const { data, error } = await supabase
      .from("shopping_list")
      .upsert(toInsert, {
        onConflict: "user_id,ingredient_id",
        ignoreDuplicates: true,
      })
      .select();

    if (error) {
      console.error("[ShoppingList API] Error inserting:", error);
      
      // Check for duplicate error and handle gracefully
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        return NextResponse.json({ 
          success: true, 
          message: "Item already in list",
          items: data || [] 
        });
      }
      
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, items: data || [] });
  } catch (error: any) {
    console.error("[ShoppingList API] Unexpected error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

// PATCH - Update item (e.g., toggle checked status)
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
    const { ingredient_id, is_checked } = body;

    if (!ingredient_id) {
      return NextResponse.json({ error: "ingredient_id required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("shopping_list")
      .update({ is_checked })
      .eq("user_id", user.id)
      .eq("ingredient_id", ingredient_id)
      .select();

    if (error) {
      console.error("[ShoppingList API] Error updating:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, items: data || [] });
  } catch (error: any) {
    console.error("[ShoppingList API] Unexpected error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

// DELETE - Remove item(s) from shopping list
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

    let query = supabase
      .from("shopping_list")
      .delete()
      .eq("user_id", user.id);

    if (clearAll) {
      // Delete all items for user
    } else if (clearChecked) {
      query = query.eq("is_checked", true);
    } else if (ingredientId) {
      query = query.eq("ingredient_id", ingredientId);
    } else {
      return NextResponse.json({ error: "ingredient_id, clear_checked, or clear_all required" }, { status: 400 });
    }

    const { error } = await query;

    if (error) {
      console.error("[ShoppingList API] Error deleting:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[ShoppingList API] Unexpected error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

