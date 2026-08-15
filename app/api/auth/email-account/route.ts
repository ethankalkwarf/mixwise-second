/**
 * Intentional account creation via email (Mix "save your bar", etc.)
 *
 * Creates a passwordless account and emails a magic link via Resend.
 * Distinct from /api/email/signup (email list only).
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPasswordlessAccountFromEmail } from "@/lib/email/create-passwordless-account";
import { debugLog } from "@/lib/debugLog";
import { resolvePostAuthPath } from "@/lib/auth/return-to";

const ALLOWED_SOURCES = new Set(["mix_save", "auth_dialog", "join_page"]);

const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimit.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  limit.count++;
  return false;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const clientIP =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(clientIP)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, source: rawSource, nextPath: rawNextPath } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const source =
      typeof rawSource === "string" && ALLOWED_SOURCES.has(rawSource)
        ? rawSource
        : "mix_save";

    const nextPath =
      typeof rawNextPath === "string"
        ? resolvePostAuthPath(rawNextPath)
        : source === "mix_save"
          ? "/mix"
          : "/dashboard";

    debugLog(`[Email Account] Intentional account for ${trimmedEmail} via ${source}`);

    // Track high-intent lead as well (analytics)
    try {
      const supabaseAdmin = createAdminClient();
      const { data: existing } = await supabaseAdmin
        .from("email_signups")
        .select("id")
        .eq("email", trimmedEmail)
        .eq("source", source)
        .maybeSingle();

      if (!existing) {
        await supabaseAdmin.from("email_signups").insert({
          email: trimmedEmail,
          source,
        });
      }
    } catch (leadError) {
      console.error("[Email Account] Lead insert failed (non-fatal):", leadError);
    }

    const result = await createPasswordlessAccountFromEmail({
      email: trimmedEmail,
      source,
      requestUrl: new URL(request.url),
      nextPath,
      notify: true,
      sendMagicLinkEmail: true,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "Failed to create account. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      path: "account",
      emailSent: result.emailSent,
      accountCreated: result.isNewUser,
      message: result.emailSent
        ? "Check your email for a link to open your MixWise account."
        : "Account ready — check your email or try logging in.",
    });
  } catch (error) {
    console.error("[Email Account] Unexpected error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
