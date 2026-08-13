/**
 * Convert email-list subscriber → MixWise account
 *
 * Hit from the nurture email CTA. Creates a passwordless account (if needed),
 * then redirects through the magic-link verify flow so they land signed in
 * and can be prompted to set a password + save their bar.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyNewsletterUnsubscribeToken } from "@/lib/email/newsletter-token";
import { createPasswordlessAccountFromEmail } from "@/lib/email/create-passwordless-account";
import { getSiteUrl } from "@/lib/site";
import { debugLog } from "@/lib/debugLog";

export async function GET(request: NextRequest) {
  const siteUrl = getSiteUrl(new URL(request.url));
  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase() || "";
  const source = request.nextUrl.searchParams.get("source") || "homepage";
  const token = request.nextUrl.searchParams.get("token");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.redirect(`${siteUrl}/?signup=invalid`);
  }

  if (!verifyNewsletterUnsubscribeToken(email, `convert:${source}`, token)) {
    console.warn("[Convert] Invalid convert token for", email);
    return NextResponse.redirect(`${siteUrl}/?signup=invalid`);
  }

  debugLog(`[Convert] Email list → account for ${email} (${source})`);

  const result = await createPasswordlessAccountFromEmail({
    email,
    source: `email_list_convert_${source}`,
    requestUrl: new URL(request.url),
    nextPath: "/mix",
    notify: true,
    // Don't email another magic link — redirect them through this one
    sendMagicLinkEmail: false,
  });

  if (!result.ok || !result.setupUrl) {
    console.error("[Convert] Failed to create/sign-in account:", result.error);
    return NextResponse.redirect(
      `${siteUrl}/?signup=error&email=${encodeURIComponent(email)}`
    );
  }

  return NextResponse.redirect(result.setupUrl);
}
