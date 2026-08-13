/**
 * Generic email lead capture (homepage, mix save, etc.)
 * Stores in email_signups. Does not use Thirsty Thursday.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { debugLog } from "@/lib/debugLog";

const ALLOWED_SOURCES = new Set(["homepage", "mix_save", "footer"]);

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
    const { email, source: rawSource } = body;

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
        : "homepage";

    debugLog(`[Email Signup] ${trimmedEmail} via ${source}`);

    let supabaseAdmin;
    try {
      supabaseAdmin = createAdminClient();
    } catch (adminError) {
      console.error("[Email Signup] Admin client failed:", adminError);
      return NextResponse.json(
        { error: "Server configuration error. Please try again later." },
        { status: 500 }
      );
    }

    const { data: existing, error: checkError } = await supabaseAdmin
      .from("email_signups")
      .select("id")
      .eq("email", trimmedEmail)
      .eq("source", source)
      .maybeSingle();

    if (checkError) {
      console.error("[Email Signup] Check failed:", checkError);
      return NextResponse.json(
        { error: "Failed to process signup. Please try again." },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json({
        ok: true,
        message: "You're already on the list. Thanks!",
        alreadySubscribed: true,
      });
    }

    const { error: insertError } = await supabaseAdmin.from("email_signups").insert({
      email: trimmedEmail,
      source,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json({
          ok: true,
          message: "You're already on the list. Thanks!",
          alreadySubscribed: true,
        });
      }
      console.error("[Email Signup] Insert failed:", insertError);
      return NextResponse.json(
        { error: "Failed to process signup. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "You're on the list. We'll be in touch with cocktail ideas.",
    });
  } catch (error) {
    console.error("[Email Signup] Unexpected error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
