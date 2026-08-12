/**
 * Email Unsubscribe API Route
 *
 * Handles unsubscribe requests via secure token (registered users).
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET - One-click unsubscribe from all emails or a specific category
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const type = searchParams.get("type") || "all";

  if (!token) {
    return NextResponse.json(
      { error: "Unsubscribe token is required" },
      { status: 400 }
    );
  }

  try {
    const supabaseAdmin = createAdminClient();

    const { data: prefs, error: findError } = await supabaseAdmin
      .from("email_preferences")
      .select("user_id")
      .eq("unsubscribe_token", token)
      .single();

    if (findError || !prefs) {
      console.error("[Unsubscribe] Invalid token:", token);
      return NextResponse.json(
        { error: "Invalid or expired unsubscribe link" },
        { status: 404 }
      );
    }

    let updateData: Record<string, unknown> = {};

    if (type === "all") {
      updateData = {
        welcome_emails: false,
        weekly_digest: false,
        recommendations: false,
        product_updates: false,
        unsubscribed_all_at: new Date().toISOString(),
      };
    } else if (type === "digest") {
      updateData = { weekly_digest: false };
    } else if (type === "recommendations") {
      updateData = { recommendations: false };
    } else if (type === "updates") {
      updateData = { product_updates: false };
    } else if (type === "welcome") {
      updateData = { welcome_emails: false };
    }

    const { error: updateError } = await supabaseAdmin
      .from("email_preferences")
      .update(updateData)
      .eq("unsubscribe_token", token);

    if (updateError) {
      console.error("[Unsubscribe] Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update preferences" },
        { status: 500 }
      );
    }

    console.log(`[Unsubscribe] User ${prefs.user_id} unsubscribed from ${type}`);

    return NextResponse.json({ ok: true, unsubscribedFrom: type });
  } catch (error) {
    console.error("[Unsubscribe] Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * POST - Update specific email preferences
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, preferences } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Unsubscribe token is required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    const { data: prefs, error: findError } = await supabaseAdmin
      .from("email_preferences")
      .select("user_id")
      .eq("unsubscribe_token", token)
      .single();

    if (findError || !prefs) {
      return NextResponse.json(
        { error: "Invalid or expired unsubscribe link" },
        { status: 404 }
      );
    }

    const validFields = ["welcome_emails", "weekly_digest"];
    const updateData: Record<string, boolean | null> = {};

    for (const field of validFields) {
      if (typeof preferences?.[field] === "boolean") {
        updateData[field] = preferences[field];
      }
    }

    const isResubscribing = Object.values(updateData).some((v) => v === true);
    if (isResubscribing) {
      updateData.unsubscribed_all_at = null;
    }

    const { error: updateError } = await supabaseAdmin
      .from("email_preferences")
      .update(updateData)
      .eq("unsubscribe_token", token);

    if (updateError) {
      console.error("[Unsubscribe] Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update preferences" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, updated: updateData });
  } catch (error) {
    console.error("[Unsubscribe] Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
