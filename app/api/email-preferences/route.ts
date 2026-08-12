/**
 * Email Preferences API
 *
 * GET - Fetch user's email preferences
 * PUT - Update user's email preferences
 *
 * Active senders today: welcome_emails, weekly_digest.
 * recommendations / product_updates columns remain in DB but are not exposed.
 */

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("email_preferences")
      .select("user_id, welcome_emails, weekly_digest, unsubscribed_all_at, welcome_email_sent_at, last_digest_sent_at")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("[Email Preferences] Error fetching:", error);
      return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
    }

    const preferences = data || {
      user_id: user.id,
      welcome_emails: true,
      weekly_digest: true,
      unsubscribed_all_at: null,
      welcome_email_sent_at: null,
      last_digest_sent_at: null,
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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const welcome_emails =
      typeof body.welcome_emails === "boolean" ? body.welcome_emails : true;
    const weekly_digest =
      typeof body.weekly_digest === "boolean" ? body.weekly_digest : true;

    const updatePayload: Record<string, unknown> = {
      user_id: user.id,
      welcome_emails,
      weekly_digest,
      updated_at: new Date().toISOString(),
    };

    // Clearing unsubscribed_all when re-enabling any marketing mail
    if (welcome_emails || weekly_digest) {
      updatePayload.unsubscribed_all_at = null;
    }

    const { data, error } = await supabase
      .from("email_preferences")
      .upsert(updatePayload, { onConflict: "user_id" })
      .select("user_id, welcome_emails, weekly_digest, unsubscribed_all_at, welcome_email_sent_at, last_digest_sent_at")
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
