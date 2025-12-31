/**
 * Email Unsubscribe API Route
 *
 * Handles email unsubscribe requests via secure token.
 * Supports both GET (for one-click unsubscribe) and POST (for preference updates).
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET - One-click unsubscribe from all emails
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const type = searchParams.get("type") || "all"; // all, digest, recommendations, etc.

  if (!token) {
    return NextResponse.json(
      { error: "Unsubscribe token is required" },
      { status: 400 }
    );
  }

  try {
    const supabaseAdmin = createAdminClient();

    // Find user by unsubscribe token
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

    // Update preferences based on type
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

    console.log(`[Unsubscribe] Successfully unsubscribed user ${prefs.user_id} from ${type}`);

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

    // Validate token exists
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

    // Build update object with only valid fields
    const validFields = ["welcome_emails", "weekly_digest", "recommendations", "product_updates"];
    const updateData: Record<string, boolean> = {};

    for (const field of validFields) {
      if (typeof preferences[field] === "boolean") {
        updateData[field] = preferences[field];
      }
    }

    // Check if resubscribing (any field set to true)
    const isResubscribing = Object.values(updateData).some(v => v === true);
    if (isResubscribing) {
      // Clear the unsubscribed_all_at timestamp
      (updateData as Record<string, unknown>).unsubscribed_all_at = null;
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

    console.log(`[Unsubscribe] Updated preferences for user ${prefs.user_id}`);

    return NextResponse.json({ ok: true, updated: updateData });

  } catch (error) {
    console.error("[Unsubscribe] Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

