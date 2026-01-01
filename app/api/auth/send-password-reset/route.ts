/**
 * Send Password Reset API Route
 *
 * Generates a Supabase password recovery link and sends it via Resend.
 * This replaces Supabase's built-in password reset email system.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createResendClient, MIXWISE_FROM_EMAIL } from "@/lib/email/resend";
import { resetPasswordTemplate } from "@/lib/email/templates";
import { getCanonicalSiteUrl, getPasswordResetUrl } from "@/lib/site";

// Rate limiting: simple in-memory store (resets on server restart)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 3; // 3 requests per minute per IP

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
      console.warn(`[Send Password Reset] Rate limit exceeded for IP: ${clientIP}`);
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

    console.log(`[Send Password Reset] Processing request for email: ${trimmedEmail}, IP: ${clientIP}`);

    // Create Supabase admin client
    const supabaseAdmin = createAdminClient();

    // Generate password recovery link
    const redirectTo = getPasswordResetUrl();

    console.log(`[Send Password Reset] Generating recovery link with redirect: ${redirectTo}`);

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: trimmedEmail,
      options: {
        redirectTo,
      },
    });

    if (linkError) {
      console.error("[Send Password Reset] Failed to generate recovery link:", linkError);

      // Don't leak whether user exists - return generic success
      // This is important for security - we don't want to reveal if an email exists in our system
      console.log(`[Send Password Reset] Returning success even though link generation failed (security)`);
      return NextResponse.json({ ok: true });
    }

    const resetUrl = linkData.properties?.action_link;

    if (!resetUrl) {
      console.error("[Send Password Reset] No action_link in generated link data");

      // Return success for security (don't leak user existence)
      console.log(`[Send Password Reset] Returning success even though no action_link found (security)`);
      return NextResponse.json({ ok: true });
    }

    // Debug logging (only in development)
    if (process.env.AUTH_EMAIL_DEBUG === "true" && process.env.NODE_ENV === "development") {
      console.log(`[Send Password Reset] Generated URL: ${resetUrl}`);
    }

    // Create email template
    const baseUrl = getCanonicalSiteUrl(new URL(request.url));
    const safeResetUrl = `${baseUrl}/auth/redirect?to=${encodeURIComponent(resetUrl)}`;

    const emailTemplate = resetPasswordTemplate({
      resetUrl: safeResetUrl,
      userEmail: trimmedEmail,
    });

    // Send email via Resend
    const resend = createResendClient();

    console.log(`[Send Password Reset] Sending email via Resend to: ${trimmedEmail}`);

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: MIXWISE_FROM_EMAIL,
      replyTo: "hello@getmixwise.com", // Use a real reply-to for better deliverability
      to: trimmedEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      headers: {
        "X-Entity-Ref-ID": `password-reset-${Date.now()}`, // Unique identifier
        "List-Unsubscribe": "<mailto:unsubscribe@getmixwise.com>", // Anti-spam requirement
      },
      tags: [
        { name: "category", value: "password_reset" },
        { name: "environment", value: process.env.NODE_ENV || "production" },
      ],
    });

    if (emailError) {
      console.error("[Send Password Reset] Failed to send email via Resend:", emailError);

      // Return success for security (don't leak user existence)
      console.log(`[Send Password Reset] Returning success even though email send failed (security)`);
      return NextResponse.json({ ok: true });
    }

    console.log(`[Send Password Reset] Email sent successfully. Resend ID: ${emailData?.id}`);

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("[Send Password Reset] Unexpected error:", error);

    // Return success for security (don't leak user existence)
    console.log(`[Send Password Reset] Returning success even though unexpected error occurred (security)`);
    return NextResponse.json({ ok: true });
  }
}
