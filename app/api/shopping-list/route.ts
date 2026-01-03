import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

async function getAuthenticatedUser() {
  const supabaseAuth = createRouteHandlerClient({ cookies });
  const { data: { user }, error } = await supabaseAuth.auth.getUser();
  if (error || !user) return null;
  return user;
}

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseServiceKey) return null;
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
      return NextResponse.json({ items: [], error: error.message });
    }

    return NextResponse.json({ items: data || [] });
  } catch (error: any) {
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

    // Deduplicate items by ingredient_id
    const uniqueItems = new Map();
    for (const item of items) {
      const id = String(item.ingredient_id);
      if (!uniqueItems.has(id)) {
        uniqueItems.set(id, {
          user_id: user.id,
          ingredient_id: id,
          ingredient_name: item.ingredient_name || 'Unknown',
          ingredient_category: item.ingredient_category || null,
          is_checked: item.is_checked || false,
        });
      }
    }
    
    const toInsert = Array.from(uniqueItems.values());

    const { data, error } = await supabase
      .from("shopping_list")
      .upsert(toInsert, { onConflict: "user_id,ingredient_id" })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, items: data || [] });
  } catch (error: any) {
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

    const { data, error } = await supabase
      .from("shopping_list")
      .update({ is_checked })
      .eq("user_id", user.id)
      .eq("ingredient_id", String(ingredient_id))
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, items: data || [] });
  } catch (error: any) {
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
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
