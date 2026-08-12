/**
 * Newsletter Unsubscribe API Route
 *
 * Handles unsubscribe requests for non-user email signups (Thirsty Thursday, wedding finder).
 * Requires a signed token — email + source alone is not enough.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyNewsletterUnsubscribeToken } from "@/lib/email/newsletter-token";

async function unsubscribeSignup(email: string, source: string, token: string) {
  if (!verifyNewsletterUnsubscribeToken(email, source, token)) {
    return { ok: false as const, status: 400, error: "Invalid or expired unsubscribe link" };
  }

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from("email_signups")
    .delete()
    .eq("email", email)
    .eq("source", source);

  if (error) {
    console.error("[Newsletter Unsubscribe] Error deleting signup:", error);
    return { ok: false as const, status: 500, error: "Failed to process unsubscribe request" };
  }

  return { ok: true as const };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source, token } = body;

    if (!email || typeof email !== "string" || !source || typeof source !== "string") {
      return NextResponse.json({ error: "Email and source are required" }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const result = await unsubscribeSignup(trimmedEmail, source, token);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ ok: true, message: "Unsubscribed successfully", source });
  } catch (error) {
    console.error("[Newsletter Unsubscribe] Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const source = searchParams.get("source");
  const token = searchParams.get("token");

  if (!email || !source || !token) {
    return NextResponse.json({ error: "Email, source, and token are required" }, { status: 400 });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const result = await unsubscribeSignup(trimmedEmail, source, token);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, message: "Unsubscribed successfully", source });
}
