/**
 * Email Preferences API
 *
 * GET - Fetch user's email preferences
 * PUT - Update user's email preferences
 *
 * Single marketing subscription via `email_subscribed` (stored as marketing_emails).
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { debugLog } from "@/lib/debugLog";
import type { Database } from "@/lib/supabase/database.types";

type EmailPreferencesInsert = Database["public"]["Tables"]["email_preferences"]["Insert"];

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("email_preferences")
      .select("user_id, marketing_emails, welcome_email_sent_at, last_digest_sent_at, unsubscribed_at")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("[Email Preferences] Error fetching:", error);
      return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
    }

    const preferences = {
      user_id: data?.user_id ?? user.id,
      email_subscribed: data?.marketing_emails ?? true,
      welcome_email_sent_at: data?.welcome_email_sent_at ?? null,
      last_digest_sent_at: data?.last_digest_sent_at ?? null,
      unsubscribed_at: data?.unsubscribed_at ?? null,
    };

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("[Email Preferences] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const emailSubscribed =
      typeof body.email_subscribed === "boolean" ? body.email_subscribed : true;

    const updatePayload: EmailPreferencesInsert = {
      user_id: user.id,
      marketing_emails: emailSubscribed,
      updated_at: new Date().toISOString(),
      unsubscribed_at: emailSubscribed ? null : new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("email_preferences")
      .upsert(updatePayload, { onConflict: "user_id" })
      .select("user_id, marketing_emails, welcome_email_sent_at, last_digest_sent_at, unsubscribed_at")
      .single();

    if (error) {
      console.error("[Email Preferences] Error updating:", error);
      return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
    }

    debugLog(`[Email Preferences] Updated for user ${user.id}`);

    return NextResponse.json({
      preferences: {
        user_id: data.user_id,
        email_subscribed: data.marketing_emails,
        welcome_email_sent_at: data.welcome_email_sent_at,
        last_digest_sent_at: data.last_digest_sent_at,
        unsubscribed_at: data.unsubscribed_at,
      },
      message: "Preferences updated",
    });
  } catch (error) {
    console.error("[Email Preferences] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
