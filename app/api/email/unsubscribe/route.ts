/**
 * Email Unsubscribe API Route
 *
 * Handles unsubscribe requests via secure token (registered users).
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { debugLog } from "@/lib/debugLog";
import type { Database } from "@/lib/supabase/database.types";

type EmailPreferencesUpdate = Database["public"]["Tables"]["email_preferences"]["Update"];

function unsubscribePayload(): EmailPreferencesUpdate {
  return {
    marketing_emails: false,
    unsubscribed_at: new Date().toISOString(),
  };
}

/**
 * GET - One-click unsubscribe from marketing emails
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
      console.error("[Unsubscribe] Invalid or expired token");
      return NextResponse.json(
        { error: "Invalid or expired unsubscribe link" },
        { status: 404 }
      );
    }

    // All unsubscribe link types map to the single marketing subscription.
    const updateData = unsubscribePayload();

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

    debugLog(`[Unsubscribe] User ${prefs.user_id} unsubscribed from ${type}`);

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
 * POST - Update email subscription preference
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

    let subscribed: boolean | undefined;

    if (typeof preferences?.email_subscribed === "boolean") {
      subscribed = preferences.email_subscribed;
    }

    if (subscribed === undefined) {
      return NextResponse.json(
        { error: "No valid preferences provided" },
        { status: 400 }
      );
    }

    const updateData: EmailPreferencesUpdate = {
      marketing_emails: subscribed,
      unsubscribed_at: subscribed ? null : new Date().toISOString(),
    };

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
