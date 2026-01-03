import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

/**
 * Shopping List API - Direct table operations with service role
 */

export const dynamic = 'force-dynamic';

async function getAuthenticatedUser() {
  const supabaseAuth = createRouteHandlerClient({ cookies });
  const { data: { user }, error } = await supabaseAuth.auth.getUser();
  if (error || !user) {
    return null;
  }
  return user;
}

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseServiceKey) {
    console.error("[ShoppingList API] No service role key");
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

    console.log("[ShoppingList API] GET for user:", user.id);

    const { data, error } = await supabase
      .from("shopping_list")
      .select("*")
      .eq("user_id", user.id)
      .order("added_at", { ascending: false });

    if (error) {
      console.error("[ShoppingList API] GET error:", error);
      return NextResponse.json({ items: [], error: error.message });
    }

    console.log("[ShoppingList API] GET returned:", data?.length || 0, "items");
    return NextResponse.json({ items: data || [] });
  } catch (error: any) {
    console.error("[ShoppingList API] GET exception:", error);
    return NextResponse.json({ items: [], error: error.message });
  }
}

// POST - Add item(s)
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
    
    console.log("[ShoppingList API] POST - adding", items.length, "items for user:", user.id);
    console.log("[ShoppingList API] POST - items:", JSON.stringify(items));

    const toInsert = items.map(item => ({
      user_id: user.id,
      ingredient_id: String(item.ingredient_id),
      ingredient_name: item.ingredient_name || 'Unknown',
      ingredient_category: item.ingredient_category || null,
      is_checked: item.is_checked || false,
    }));

    console.log("[ShoppingList API] POST - inserting:", JSON.stringify(toInsert));

    const { data, error } = await supabase
      .from("shopping_list")
      .upsert(toInsert, {
        onConflict: "user_id,ingredient_id",
      })
      .select();

    if (error) {
      console.error("[ShoppingList API] POST error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("[ShoppingList API] POST success, inserted:", data?.length || 0, "items");
    return NextResponse.json({ success: true, items: data || [] });
  } catch (error: any) {
    console.error("[ShoppingList API] POST exception:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Toggle checked
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

    console.log("[ShoppingList API] PATCH - toggling:", ingredient_id, "to:", is_checked);

    const { data, error } = await supabase
      .from("shopping_list")
      .update({ is_checked })
      .eq("user_id", user.id)
      .eq("ingredient_id", String(ingredient_id))
      .select();

    if (error) {
      console.error("[ShoppingList API] PATCH error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("[ShoppingList API] PATCH success, updated:", data?.length || 0, "rows");
    return NextResponse.json({ success: true, items: data || [] });
  } catch (error: any) {
    console.error("[ShoppingList API] PATCH exception:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove item(s)
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

    console.log("[ShoppingList API] DELETE - params:", { ingredientId, clearChecked, clearAll, userId: user.id });

    let error = null;

    if (clearAll) {
      const result = await supabase
        .from("shopping_list")
        .delete()
        .eq("user_id", user.id);
      error = result.error;
    } else if (clearChecked) {
      const result = await supabase
        .from("shopping_list")
        .delete()
        .eq("user_id", user.id)
        .eq("is_checked", true);
      error = result.error;
    } else if (ingredientId) {
      const result = await supabase
        .from("shopping_list")
        .delete()
        .eq("user_id", user.id)
        .eq("ingredient_id", String(ingredientId));
      error = result.error;
    } else {
      return NextResponse.json({ error: "ingredient_id, clear_checked, or clear_all required" }, { status: 400 });
    }

    if (error) {
      console.error("[ShoppingList API] DELETE error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("[ShoppingList API] DELETE success");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[ShoppingList API] DELETE exception:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
