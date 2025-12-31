/**
 * Server-Side Signup API Route
 *
 * Creates a new user using Supabase Admin API and sends custom confirmation email via Resend.
 * This replaces client-side signUp() to avoid Supabase's default email flow.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createResendClient, MIXWISE_FROM_EMAIL } from "@/lib/email/resend";
import { confirmEmailTemplate } from "@/lib/email/templates";
import { getAuthCallbackUrl } from "@/lib/site";

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
      console.warn(`[Signup API] Rate limit exceeded for IP: ${clientIP}`);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // Validate email
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

    // Validate password
    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    console.log(`[Signup API] Processing signup for email: ${trimmedEmail}, IP: ${clientIP}`);

    // Create Supabase admin client
    const supabaseAdmin = createAdminClient();

    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error("[Signup API] Error listing users:", listError);
      // Continue anyway - we'll get a proper error from createUser if needed
    } else {
      const existingUser = existingUsers?.users?.find(u => u.email === trimmedEmail);
      if (existingUser) {
        console.log(`[Signup API] User already exists: ${trimmedEmail}`);
        // Don't reveal that user exists - return generic message
        return NextResponse.json(
          { error: "Unable to create account. Please try again or reset your password." },
          { status: 400 }
        );
      }
    }

    // Create user via Admin API
    // Using Admin API bypasses Supabase's default email sending
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: trimmedEmail,
      password: password,
      email_confirm: false, // User needs to confirm email
      user_metadata: {
        signup_source: 'web',
      },
    });

    if (createError) {
      console.error("[Signup API] Failed to create user:", {
        message: createError.message,
        status: createError.status,
        name: createError.name,
      });

      // Handle specific error cases
      if (createError.message?.includes("already been registered")) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please log in or reset your password." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: createError.message || "Failed to create account. Please try again." },
        { status: 500 }
      );
    }

    if (!createData?.user) {
      console.error("[Signup API] No user data returned after creation");
      return NextResponse.json(
        { error: "Failed to create account. Please try again." },
        { status: 500 }
      );
    }

    console.log(`[Signup API] User created successfully: ${createData.user.id}`);

    // Generate email confirmation link
    const redirectTo = getAuthCallbackUrl();

    console.log(`[Signup API] Generating confirmation link with redirect: ${redirectTo}`);

    // Use magiclink type since user already exists
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: trimmedEmail,
      options: {
        redirectTo,
      },
    });

    if (linkError) {
      console.error("[Signup API] Failed to generate confirmation link:", {
        message: linkError.message,
        status: linkError.status,
      });
      
      // User was created but we couldn't generate link
      // Still return success but note the email issue
      return NextResponse.json({
        ok: true,
        emailSent: false,
        message: "Account created but confirmation email could not be sent. Please try logging in.",
      });
    }

    const confirmUrl = linkData.properties?.action_link;

    if (!confirmUrl) {
      console.error("[Signup API] No action_link in generated link data:", linkData);
      return NextResponse.json({
        ok: true,
        emailSent: false,
        message: "Account created but confirmation email could not be sent. Please try logging in.",
      });
    }

    // Debug logging (only in development)
    if (process.env.AUTH_EMAIL_DEBUG === "true" && process.env.NODE_ENV === "development") {
      console.log(`[Signup API] Generated confirmation URL: ${confirmUrl}`);
    }

    // Create email template
    const emailTemplate = confirmEmailTemplate({
      confirmUrl,
      userEmail: trimmedEmail,
    });

    // Send email via Resend
    const resend = createResendClient();

    console.log(`[Signup API] Sending confirmation email via Resend to: ${trimmedEmail}`);

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: MIXWISE_FROM_EMAIL,
      to: trimmedEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    if (emailError) {
      console.error("[Signup API] Failed to send email via Resend:", {
        message: emailError.message,
        name: emailError.name,
      });
      
      return NextResponse.json({
        ok: true,
        emailSent: false,
        message: "Account created but confirmation email could not be sent. Please try logging in.",
      });
    }

    console.log(`[Signup API] Confirmation email sent successfully. Resend ID: ${emailData?.id}`);

    return NextResponse.json({
      ok: true,
      emailSent: true,
      message: "Account created! Check your email to confirm your account.",
    });

  } catch (error) {
    console.error("[Signup API] Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
