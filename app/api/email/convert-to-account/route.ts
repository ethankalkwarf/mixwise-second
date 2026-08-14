/**
 * Convert email-list subscriber → MixWise account
 *
 * POST (join page): create the account with the password they just typed,
 * then the client signs them in. One last step.
 *
 * GET (older email links): passwordless account + magic-link redirect.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyNewsletterUnsubscribeToken } from "@/lib/email/newsletter-token";
import {
  createAccountWithPassword,
  createPasswordlessAccountFromEmail,
} from "@/lib/email/create-passwordless-account";
import { addToResendAudience } from "@/lib/email/subscribe-list";
import { getSiteUrl } from "@/lib/site";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";
import { debugLog } from "@/lib/debugLog";

function convertParams(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase() || "";
  const source = request.nextUrl.searchParams.get("source") || "homepage";
  const token = request.nextUrl.searchParams.get("token");
  return { email, source, token };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET(request: NextRequest) {
  const siteUrl = getSiteUrl(new URL(request.url));
  const { email, source, token } = convertParams(request);

  if (!email || !isValidEmail(email)) {
    return NextResponse.redirect(`${siteUrl}/join?error=invalid`);
  }

  if (!verifyNewsletterUnsubscribeToken(email, `convert:${source}`, token)) {
    console.warn("[Convert] Invalid convert token for", email);
    return NextResponse.redirect(`${siteUrl}/join?error=invalid`);
  }

  debugLog(`[Convert] Email list → account (magic link) for ${email} (${source})`);

  const result = await createPasswordlessAccountFromEmail({
    email,
    source: `email_list_convert_${source}`,
    requestUrl: new URL(request.url),
    nextPath: "/mix",
    notify: true,
    sendMagicLinkEmail: false,
  });

  if (!result.ok || !result.setupUrl) {
    console.error("[Convert] Failed to create/sign-in account:", result.error);
    return NextResponse.redirect(`${siteUrl}/join?error=failed`);
  }

  return NextResponse.redirect(result.setupUrl);
}

export async function POST(request: NextRequest) {
  if (isRateLimited(`email-convert:${getClientIp(request)}`, 8)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: { email?: string; source?: string; token?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() || "";
  const source = body.source || "homepage";
  const token = body.token;
  const password = body.password || "";

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (!verifyNewsletterUnsubscribeToken(email, `convert:${source}`, token)) {
    console.warn("[Convert] Invalid convert token for", email);
    return NextResponse.json({ error: "That link expired. Try signing up again from MixWise." }, { status: 401 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  debugLog(`[Convert] Email list → account (password) for ${email} (${source})`);

  const result = await createAccountWithPassword({
    email,
    password,
    source: `email_list_convert_${source}`,
  });

  if (result.alreadyExists) {
    return NextResponse.json(
      {
        error: "This email already has a MixWise account.",
        alreadyExists: true,
      },
      { status: 409 }
    );
  }

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Could not create account" },
      { status: 500 }
    );
  }

  addToResendAudience(email, { hasAccount: true }).catch((err) => {
    console.warn("[Convert] Resend account flag failed (non-fatal):", err);
  });

  return NextResponse.json({ ok: true });
}
