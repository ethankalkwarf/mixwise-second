/**
 * Email LIST signup (homepage / footer)
 *
 * Intentional newsletter-style capture — does NOT create an account.
 * Sends a welcome that confirms the list signup and offers a clear CTA
 * to create an account + save their bar.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createResendClient, MIXWISE_FROM_EMAIL } from "@/lib/email/resend";
import { emailListWelcomeTemplate } from "@/lib/email/templates";
import { sendSignupNotification } from "@/lib/email/signup-notification";
import {
  buildNewsletterUnsubscribeUrl,
  createNewsletterUnsubscribeToken,
} from "@/lib/email/newsletter-token";
import { getSiteUrl } from "@/lib/site";
import { debugLog } from "@/lib/debugLog";

const ALLOWED_SOURCES = new Set(["homepage", "footer"]);

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

function buildConvertUrl(email: string, source: string, siteUrl: string): string {
  const token = createNewsletterUnsubscribeToken(email, `convert:${source}`);
  const params = new URLSearchParams({
    email: email.trim().toLowerCase(),
    source,
    token,
  });
  return `${siteUrl}/api/email/convert-to-account?${params.toString()}`;
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

    debugLog(`[Email List] ${trimmedEmail} via ${source}`);

    let supabaseAdmin;
    try {
      supabaseAdmin = createAdminClient();
    } catch (adminError) {
      console.error("[Email List] Admin client failed:", adminError);
      return NextResponse.json(
        { error: "Server configuration error. Please try again later." },
        { status: 500 }
      );
    }

    const { data: existingLead } = await supabaseAdmin
      .from("email_signups")
      .select("id")
      .eq("email", trimmedEmail)
      .eq("source", source)
      .maybeSingle();

    const alreadySubscribed = Boolean(existingLead);

    if (!existingLead) {
      const { error: insertError } = await supabaseAdmin.from("email_signups").insert({
        email: trimmedEmail,
        source,
      });
      if (insertError && insertError.code !== "23505") {
        console.error("[Email List] Insert failed:", insertError);
        return NextResponse.json(
          { error: "Failed to process signup. Please try again." },
          { status: 500 }
        );
      }
    }

    const siteUrl = getSiteUrl(new URL(request.url));
    const convertUrl = buildConvertUrl(trimmedEmail, source, siteUrl);
    const unsubscribeUrl = buildNewsletterUnsubscribeUrl(trimmedEmail, source, siteUrl);

    let emailSent = false;

    if (!process.env.RESEND_API_KEY || !MIXWISE_FROM_EMAIL) {
      console.warn("[Email List] Resend not configured — skipping welcome email");
    } else {
      const template = emailListWelcomeTemplate({
        userEmail: trimmedEmail,
        convertUrl,
        unsubscribeUrl,
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

    if (!alreadySubscribed) {
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
      alreadySubscribed,
      path: "email_list",
      message: emailSent
        ? "You're on the list — check your email. When you're ready, you can create a free account from that message."
        : alreadySubscribed
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
