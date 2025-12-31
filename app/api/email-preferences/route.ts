/**
 * Email Preferences API
 * 
 * GET - Fetch user's email preferences
 * PUT - Update user's email preferences
 */

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch email preferences
    const { data, error } = await supabase
      .from("email_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found, which is fine
      console.error("[Email Preferences] Error fetching:", error);
      return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
    }

    // Return preferences or defaults
    const preferences = data || {
      user_id: user.id,
      welcome_emails: true,
      weekly_digest: true,
      recommendations: true,
      product_updates: true,
    };

    return NextResponse.json({ preferences });

  } catch (error) {
    console.error("[Email Preferences] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { welcome_emails, weekly_digest, recommendations, product_updates } = body;

    // Upsert email preferences
    const { data, error } = await supabase
      .from("email_preferences")
      .upsert({
        user_id: user.id,
        welcome_emails: welcome_emails ?? true,
        weekly_digest: weekly_digest ?? true,
        recommendations: recommendations ?? true,
        product_updates: product_updates ?? true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
      })
      .select()
      .single();

    if (error) {
      console.error("[Email Preferences] Error updating:", error);
      return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
    }

    console.log(`[Email Preferences] Updated for user ${user.id}`);

    return NextResponse.json({ preferences: data, message: "Preferences updated" });

  } catch (error) {
    console.error("[Email Preferences] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

