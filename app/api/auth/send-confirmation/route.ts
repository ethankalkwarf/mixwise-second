/**
 * Send Email Confirmation API Route
 *
 * Generates a Supabase signup confirmation link and sends it via Resend.
 * This replaces Supabase's built-in email confirmation system.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createResendClient, MIXWISE_FROM_EMAIL } from "@/lib/email/resend";
import { confirmEmailTemplate } from "@/lib/email/templates";
import { getAuthCallbackUrl, getCanonicalSiteUrl } from "@/lib/site";

// Rate limiting: simple in-memory store (resets on server restart)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per minute per IP

/**
 * Checks if an IP address is rate limited
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimit.get(ip);

  if (!limit || now > limit.resetTime) {
    // Reset or initialize rate limit
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  limit.count++;
  return false;
}

/**
 * Validates email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = request.headers.get("x-forwarded-for") ||
                     request.headers.get("x-real-ip") ||
                     "unknown";

    // Rate limiting check
    if (isRateLimited(clientIP)) {
      console.warn(`[Send Confirmation] Rate limit exceeded for IP: ${clientIP}`);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!isValidEmail(trimmedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    console.log(`[Send Confirmation] Processing request for email: ${trimmedEmail}, IP: ${clientIP}`);

    // Create Supabase admin client
    const supabaseAdmin = createAdminClient();

    // Generate signup confirmation link
    const redirectTo = `${getAuthCallbackUrl()}?next=/onboarding`;

    console.log(`[Send Confirmation] Generating confirmation link with redirect: ${redirectTo}`);

    // Use magiclink type for existing users who need to confirm their email
    // This works for users who already exist but haven't confirmed their email
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: trimmedEmail,
      options: {
        redirectTo,
      },
    });

    if (linkError) {
      console.error("[Send Confirmation] Failed to generate signup link:", linkError);

      // Don't leak whether user exists - return generic error
      return NextResponse.json(
        { error: "Unable to send confirmation email. Please try again." },
        { status: 500 }
      );
    }

    const confirmUrl = linkData.properties?.action_link;

    if (!confirmUrl) {
      console.error("[Send Confirmation] No action_link in generated link data");
      return NextResponse.json(
        { error: "Unable to send confirmation email. Please try again." },
        { status: 500 }
      );
    }

    // Debug logging (only in development)
    if (process.env.AUTH_EMAIL_DEBUG === "true" && process.env.NODE_ENV === "development") {
      console.log(`[Send Confirmation] Generated URL: ${confirmUrl}`);
    }

    // Create email template
    const baseUrl = getCanonicalSiteUrl(new URL(request.url));
    const safeConfirmUrl = `${baseUrl}/auth/redirect?to=${encodeURIComponent(confirmUrl)}`;

    const emailTemplate = confirmEmailTemplate({
      confirmUrl: safeConfirmUrl,
      userEmail: trimmedEmail,
    });

    // Send email via Resend
    const resend = createResendClient();

    console.log(`[Send Confirmation] Sending email via Resend to: ${trimmedEmail}`);

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: MIXWISE_FROM_EMAIL,
      to: trimmedEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    if (emailError) {
      console.error("[Send Confirmation] Failed to send email via Resend:", emailError);
      return NextResponse.json(
        { error: "Unable to send confirmation email. Please try again." },
        { status: 500 }
      );
    }

    console.log(`[Send Confirmation] Email sent successfully. Resend ID: ${emailData?.id}`);

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("[Send Confirmation] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
