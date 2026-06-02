/**
 * Email Unsubscribe API Route
 *
 * Handles unsubscribe for registered users (token) and newsletter signups (email + source + token).
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function unsubscribeNewsletterSignup(
  email: string,
  source: string,
  token: string
): Promise<{ ok: boolean; error?: string; status?: number }> {
  const supabaseAdmin = createAdminClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { data: signup, error: findError } = await supabaseAdmin
    .from("email_signups")
    .select("id, email, source, unsubscribe_token")
    .eq("email", normalizedEmail)
    .eq("source", source)
    .single();

  if (findError || !signup) {
    return { ok: false, error: "Invalid or expired unsubscribe link", status: 404 };
  }

  if (signup.unsubscribe_token !== token) {
    return { ok: false, error: "Invalid or expired unsubscribe link", status: 404 };
  }

  const { error: updateError } = await supabaseAdmin
    .from("email_signups")
    .update({ opted_out_at: new Date().toISOString() })
    .eq("id", signup.id);

  if (updateError) {
    console.error("[Unsubscribe] Newsletter update error:", updateError);
    return { ok: false, error: "Failed to update preferences", status: 500 };
  }

  console.log(`[Unsubscribe] Newsletter unsubscribed: ${normalizedEmail} (${source})`);
  return { ok: true };
}

/**
 * GET - One-click unsubscribe (RFC 8058) or browser follow from List-Unsubscribe
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const type = searchParams.get("type") || "all";
  const email = searchParams.get("email");
  const source = searchParams.get("source");

  if (email && source && token) {
    const result = await unsubscribeNewsletterSignup(email, source, token);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }
    return NextResponse.json({ ok: true, unsubscribedFrom: "newsletter", source });
  }

  if (!token) {
    return NextResponse.json({ error: "Unsubscribe token is required" }, { status: 400 });
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
      return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
    }

    console.log(`[Unsubscribe] User ${prefs.user_id} unsubscribed from ${type}`);

    return NextResponse.json({ ok: true, unsubscribedFrom: type });
  } catch (error) {
    console.error("[Unsubscribe] Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

/**
 * POST - Update specific email preferences (registered users) or newsletter opt-out
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, preferences, email, source } = body;

    if (email && source && token) {
      const result = await unsubscribeNewsletterSignup(email, source, token);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status || 400 });
      }
      return NextResponse.json({ ok: true, unsubscribedFrom: "newsletter", source });
    }

    if (!token) {
      return NextResponse.json({ error: "Unsubscribe token is required" }, { status: 400 });
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

    const validFields = ["welcome_emails", "weekly_digest", "recommendations", "product_updates"];
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
      return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, updated: updateData });
  } catch (error) {
    console.error("[Unsubscribe] Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
