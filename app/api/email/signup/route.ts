/**
 * Email LIST signup (homepage / footer)
 *
 * Intentional newsletter-style capture — does NOT create an account.
 * Sends a welcome that confirms they're on the Thursday list, then offers
 * one last step: set a password so MixWise can remember the cabinet.
 */

import { NextRequest, NextResponse } from "next/server";
import { createResendClient, MIXWISE_FROM_EMAIL } from "@/lib/email/resend";
import { emailListWelcomeTemplate } from "@/lib/email/templates";
import { sendSignupNotification } from "@/lib/email/signup-notification";
import { persistEmailSignup, addToResendAudience, lookupMixwiseAccount } from "@/lib/email/subscribe-list";
import {
  buildListConvertUrl,
  buildNewsletterUnsubscribeUrl,
  buildNewsletterUnsubscribeApiUrl,
} from "@/lib/email/newsletter-token";
import { getFeaturedCocktailForEmail, WELCOME_COCKTAIL_SLUG } from "@/lib/email/featured-cocktail";
import { getSiteUrl } from "@/lib/site";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";
import { debugLog } from "@/lib/debugLog";

const ALLOWED_SOURCES = new Set(["homepage", "footer"]);

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIp(request);

    if (isRateLimited(`email-list:${clientIP}`, 5)) {
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

    debugLog(`[Email List] ${trimmedEmail} via ${source}`);

    const { hasAccount } = await lookupMixwiseAccount(trimmedEmail);
    if (hasAccount) {
      return NextResponse.json({
        ok: true,
        hasAccount: true,
        path: "existing_account",
        emailSent: false,
        message: "This email already has a MixWise account.",
      });
    }

    const persisted = await persistEmailSignup(trimmedEmail, source);
    const audience = await addToResendAudience(trimmedEmail, { hasAccount: false }).catch((err) => {
      console.error("[Email List] Audience sync failed (non-fatal):", err);
      return { ok: false as const };
    });

    if (!persisted.saved && !audience.ok) {
      return NextResponse.json(
        { error: "Failed to process signup. Please try again." },
        { status: 500 }
      );
    }

    const siteUrl = getSiteUrl(new URL(request.url));
    const convertUrl = buildListConvertUrl(trimmedEmail, source, siteUrl);
    const unsubscribeUrl = buildNewsletterUnsubscribeUrl(trimmedEmail, source, siteUrl);
    const listUnsubscribeUrl = buildNewsletterUnsubscribeApiUrl(
      trimmedEmail,
      source,
      siteUrl
    );

    let emailSent = false;

    if (!process.env.RESEND_API_KEY || !MIXWISE_FROM_EMAIL) {
      console.warn("[Email List] Resend not configured — skipping welcome email");
    } else {
      const featuredCocktail = await getFeaturedCocktailForEmail({
        preferImages: false,
        slugs: [WELCOME_COCKTAIL_SLUG],
      }).catch((err) => {
        console.error("[Email List] Featured cocktail failed (non-fatal):", err);
        return undefined;
      });

      const template = emailListWelcomeTemplate({
        userEmail: trimmedEmail,
        convertUrl,
        unsubscribeUrl,
        featuredCocktail,
        siteUrl,
      });

      try {
        const resend = createResendClient();
        const { error: emailError } = await resend.emails.send({
          from: MIXWISE_FROM_EMAIL,
          replyTo: "hello@getmixwise.com",
          to: trimmedEmail,
          subject: template.subject,
          html: template.html,
          text: template.text,
          headers: {
            "List-Unsubscribe": `<${listUnsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
          tags: [
            { name: "category", value: "email_list_welcome" },
            { name: "source", value: source },
            { name: "environment", value: process.env.NODE_ENV || "production" },
          ],
        });

        if (emailError) {
          console.error("[Email List] Resend failed:", emailError);
        } else {
          emailSent = true;
        }
      } catch (sendErr) {
        console.error("[Email List] Resend exception:", sendErr);
      }
    }

    if (!persisted.alreadySubscribed) {
      sendSignupNotification({
        userEmail: trimmedEmail,
        signupMethod: `Email list (${source})`,
      }).catch((err) => {
        console.error("[Email List] Notification failed (non-fatal):", err);
      });
    }

    return NextResponse.json({
      ok: true,
      emailSent,
      alreadySubscribed: persisted.alreadySubscribed,
      path: "email_list",
      joinUrl: convertUrl,
      message: emailSent
        ? "You're on the list — check your email."
        : persisted.alreadySubscribed
          ? "You're already on the list. Thanks!"
          : "You're on the list. Thanks!",
    });
  } catch (error) {
    console.error("[Email List] Unexpected error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
