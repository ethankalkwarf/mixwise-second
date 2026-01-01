import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/bar-ingredients
 * 
 * Returns the authenticated user's bar ingredients.
 * Uses service role to access bar_ingredients table.
 * This matches the server-side getUserBarIngredients behavior used by public bar pages.
 */

// Explicitly mark as dynamic since we use cookies() for auth
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get the authenticated user
    const supabaseAuth = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role client to bypass RLS (matches server-side behavior)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseServiceKey) {
      // Fall back to auth client if no service role key
      console.warn("[API] No service role key, using auth client");
      const { data, error } = await supabaseAuth
        .from("bar_ingredients")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) {
        console.error("[API] Error fetching bar_ingredients:", error);
        return NextResponse.json({ ingredients: [], source: "bar_ingredients" });
      }
      
      return NextResponse.json({ ingredients: data || [], source: "bar_ingredients" });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Load from bar_ingredients table
    const { data: barIngredients, error: barError } = await supabase
      .from("bar_ingredients")
      .select("*")
      .eq("user_id", user.id);

    if (barError) {
      console.error("[API] Error fetching bar_ingredients:", barError);
      return NextResponse.json({ ingredients: [], source: "bar_ingredients" });
    }

    console.log("[API] Loaded from bar_ingredients:", barIngredients?.length || 0);
    return NextResponse.json({ ingredients: barIngredients || [], source: "bar_ingredients" });
  } catch (error) {
    console.error("[API] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

