/**
 * Server-Side Signup API Route
 *
 * Creates a new user using Supabase Admin API and sends custom confirmation email via Resend.
 * This replaces client-side signUp() to avoid Supabase's default email flow.
 * 
 * Flow:
 * 1. Validate email and password
 * 2. Check if user already exists
 * 3. Generate signup confirmation link (this creates user + generates link)
 * 4. Ensure profile exists
 * 5. Send custom confirmation email via Resend
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createResendClient, MIXWISE_FROM_EMAIL } from "@/lib/email/resend";
import { confirmEmailTemplate } from "@/lib/email/templates";
import { getAuthCallbackUrl, getCanonicalSiteUrl } from "@/lib/site";
import { sendSignupNotification } from "@/lib/email/signup-notification";

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
    const { email, password, firstName, lastName } = body;

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

    // Validate name fields (required for email/password signup UX)
    const trimmedFirstName = typeof firstName === "string" ? firstName.trim() : "";
    const trimmedLastName = typeof lastName === "string" ? lastName.trim() : "";
    if (!trimmedFirstName) {
      return NextResponse.json({ error: "First name is required" }, { status: 400 });
    }
    if (!trimmedLastName) {
      return NextResponse.json({ error: "Last name is required" }, { status: 400 });
    }

    const fullName = `${trimmedFirstName} ${trimmedLastName}`.trim();

    // Validate environment variables early
    // Support both SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL for flexibility
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      console.error("[Signup API] Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable");
      return NextResponse.json(
        { error: "Server configuration error. Please contact support." },
        { status: 500 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[Signup API] Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
      return NextResponse.json(
        { error: "Server configuration error. Please contact support." },
        { status: 500 }
      );
    }

    // RESEND_API_KEY is optional - if not set, we'll create the user but skip email sending
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn("[Signup API] RESEND_API_KEY not set - emails will be skipped (dev mode)");
    }

    console.log("[Signup API] Environment variables validated, creating admin client...");

    // Create Supabase admin client
    let supabaseAdmin;
    try {
      supabaseAdmin = createAdminClient();
      console.log("[Signup API] Admin client created successfully");
    } catch (adminError) {
      console.error("[Signup API] Failed to create admin client:", adminError);
      return NextResponse.json(
        { error: "Server configuration error. Please contact support." },
        { status: 500 }
      );
    }

    // Generate signup confirmation link
    // This creates the user AND generates the confirmation link in one step
    const redirectTo = `${getAuthCallbackUrl()}?next=/mix`;
    console.log(`[Signup API] Generating signup link with redirect: ${redirectTo}`);

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email: trimmedEmail,
      password: password,
      options: {
        redirectTo,
      },
    });

    if (linkError) {
      console.error("[Signup API] Failed to generate signup link:", {
        message: linkError.message,
        status: linkError.status,
        name: linkError.name,
        code: (linkError as any).code,
        error: JSON.stringify(linkError, Object.getOwnPropertyNames(linkError)),
      });

      // Handle specific error cases
      if (linkError.message?.includes("already been registered") || 
          linkError.message?.includes("already exists")) {
        // Self-heal: user may exist in auth.users but be missing a profiles row (trigger not installed/failed or profile deleted).
        // Attempt to find the user and ensure a profile exists.
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: listData, error: listError } = await (supabaseAdmin.auth.admin as any).listUsers({
            email: trimmedEmail,
          });

          if (listError) {
            console.error("[Signup API] Failed to list users for existing-email case (non-fatal):", listError);
          } else {
            const existingUser = listData?.users?.[0];
            if (existingUser?.id) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const { error: existingProfileUpsertError } = await (supabaseAdmin.from("profiles") as any)
                .upsert(
                  {
                    id: existingUser.id,
                    email: trimmedEmail,
                    display_name: trimmedEmail.split("@")[0],
                    role: "free" as const,
                    preferences: {},
                  },
                  { onConflict: "id" }
                );

              if (existingProfileUpsertError) {
                console.error("[Signup API] Failed to upsert profile for existing user (non-fatal):", existingProfileUpsertError);
              } else {
                console.log(`[Signup API] Ensured profile exists for existing user: ${existingUser.id}`);
              }
            }
          }
        } catch (healError) {
          console.error("[Signup API] Existing-user profile self-heal failed (non-fatal):", healError);
        }

        return NextResponse.json(
          { error: "An account with this email already exists. Please log in or reset your password." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: linkError.message || "Failed to create account. Please try again." },
        { status: 500 }
      );
    }

    if (!linkData?.user) {
      console.error("[Signup API] No user data returned from generateLink");
      return NextResponse.json(
        { error: "Failed to create account. Please try again." },
        { status: 500 }
      );
    }

    console.log(`[Signup API] User created successfully: ${linkData.user.id}`);

    const confirmUrl = linkData.properties?.action_link;

    if (!confirmUrl) {
      console.error("[Signup API] No action_link in generated link data:", linkData);
      return NextResponse.json({
        ok: true,
        emailSent: false,
        message: "Account created but no confirmation URL. Please try logging in.",
      });
    }

    // CRITICAL: Verify user exists in auth.users before attempting profile creation
    // This prevents foreign key constraint violations (23503)
    let userVerified = false;
    let userVerificationAttempts = 0;
    const maxUserVerificationAttempts = 5;
    
    while (!userVerified && userVerificationAttempts < maxUserVerificationAttempts) {
      userVerificationAttempts++;
      
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: userData, error: userError } = await (supabaseAdmin.auth.admin as any).getUserById(linkData.user.id);
        
        if (userData?.user && !userError) {
          userVerified = true;
          console.log(`[Signup API] User verified in auth.users: ${linkData.user.id} (attempt ${userVerificationAttempts})`);
          break;
        }
        
        if (userError) {
          console.warn(`[Signup API] User verification failed (attempt ${userVerificationAttempts}):`, {
            code: userError.message,
            userId: linkData.user.id,
          });
        }
      } catch (verifyError) {
        console.warn(`[Signup API] User verification exception (attempt ${userVerificationAttempts}):`, verifyError);
      }
      
      if (!userVerified && userVerificationAttempts < maxUserVerificationAttempts) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 200 * userVerificationAttempts));
      }
    }
    
    if (!userVerified) {
      console.error("[Signup API] User verification failed after all attempts. User may not be committed to auth.users yet.");
      // Continue anyway - the trigger should handle it, but log the issue
    }

    // Ensure profile exists (the database trigger should create it, but let's be safe)
    // Using the admin client which bypasses RLS
    // Wait a moment for the trigger to complete (trigger fires asynchronously)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let profileExists = false;
    let profileAttempts = 0;
    const maxProfileAttempts = 5; // Increased attempts
    
    while (!profileExists && profileAttempts < maxProfileAttempts) {
      profileAttempts++;
      
      // First, check if profile already exists (trigger might have created it)
      const { data: existingProfile, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', linkData.user.id)
        .single();
      
      if (existingProfile && !fetchError) {
        profileExists = true;
        console.log(`[Signup API] Profile already exists for user: ${linkData.user.id} (found on attempt ${profileAttempts})`);
        break;
      }
      
      // Log fetch errors for debugging
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" which is expected
        console.warn(`[Signup API] Profile fetch error (attempt ${profileAttempts}):`, {
          code: fetchError.code,
          message: fetchError.message,
        });
      }
      
      // If profile doesn't exist, try to create it using INSERT first (more reliable than upsert)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: insertData, error: insertError } = await (supabaseAdmin.from('profiles') as any)
        .insert({
          id: linkData.user.id,
          email: trimmedEmail,
          display_name: fullName || trimmedEmail.split('@')[0],
          role: 'free' as const,
          preferences: {},
        })
        .select()
        .single();

      if (insertError) {
        // Check if it's a duplicate key error (profile was created between check and insert)
        if (insertError.code === '23505' || insertError.message?.includes('duplicate') || insertError.message?.includes('already exists')) {
          console.log(`[Signup API] Profile created by trigger or another process (attempt ${profileAttempts})`);
          profileExists = true;
          break;
        }
        
        // Check if it's a foreign key constraint violation (user doesn't exist in auth.users yet)
        if (insertError.code === '23503' || insertError.message?.includes('foreign key constraint') || insertError.message?.includes('violates foreign key constraint')) {
          console.warn(`[Signup API] Foreign key constraint violation (attempt ${profileAttempts}) - user may not be committed yet:`, {
            userId: linkData.user.id,
            error: insertError.message,
          });
          
          // Wait longer and verify user exists before retrying
          await new Promise(resolve => setTimeout(resolve, 500 * profileAttempts));
          
          // Verify user exists before retrying
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: userCheck } = await (supabaseAdmin.auth.admin as any).getUserById(linkData.user.id);
            if (!userCheck?.user) {
              console.error(`[Signup API] User still not found in auth.users after foreign key error (attempt ${profileAttempts})`);
              if (profileAttempts >= maxProfileAttempts) {
                return NextResponse.json(
                  { error: "Database error saving new user. Please contact support." },
                  { status: 500 }
                );
              }
              continue; // Skip to next attempt
            }
          } catch (userCheckError) {
            console.error(`[Signup API] Failed to verify user after foreign key error (attempt ${profileAttempts}):`, userCheckError);
            if (profileAttempts >= maxProfileAttempts) {
              return NextResponse.json(
                { error: "Database error saving new user. Please contact support." },
                { status: 500 }
              );
            }
            continue; // Skip to next attempt
          }
          
          // User exists, continue with retry
          continue;
        }
        
        // If INSERT fails, try UPSERT as fallback
        console.warn(`[Signup API] Profile insert failed (attempt ${profileAttempts}), trying upsert:`, {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
        });
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: upsertError } = await (supabaseAdmin.from('profiles') as any)
          .upsert({
            id: linkData.user.id,
            email: trimmedEmail,
            display_name: fullName || trimmedEmail.split('@')[0],
            role: 'free' as const,
            preferences: {},
          }, {
            onConflict: 'id',
          });
        
        if (upsertError) {
          // Check if it's a duplicate key error
          if (upsertError.code === '23505' || upsertError.message?.includes('duplicate') || upsertError.message?.includes('already exists')) {
            console.log(`[Signup API] Profile exists (upsert detected duplicate on attempt ${profileAttempts})`);
            profileExists = true;
            break;
          }
          
          console.error(`[Signup API] Both insert and upsert failed (attempt ${profileAttempts}):`, {
            insertError: {
              code: insertError.code,
              message: insertError.message,
            },
            upsertError: {
              code: upsertError.code,
              message: upsertError.message,
              details: upsertError.details,
            },
          });
          
          // If this is the last attempt, we need to fail the signup
          if (profileAttempts >= maxProfileAttempts) {
            const errorDetails = {
              userId: linkData.user.id,
              email: trimmedEmail,
              profileAttempts,
              userVerified,
              insertError: {
                code: insertError.code,
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint,
                fullError: JSON.stringify(insertError, Object.getOwnPropertyNames(insertError)),
              },
              upsertError: upsertError ? {
                code: upsertError.code,
                message: upsertError.message,
                details: upsertError.details,
                hint: upsertError.hint,
                fullError: JSON.stringify(upsertError, Object.getOwnPropertyNames(upsertError)),
              } : null,
            };
            console.error("[Signup API] All profile creation attempts failed. User account created but profile missing.", errorDetails);
            
            // Try one more time with a direct query to see if profile exists
            const { data: lastChanceCheck } = await supabaseAdmin
              .from('profiles')
              .select('id, email, role')
              .eq('id', linkData.user.id)
              .single();
            
            if (lastChanceCheck) {
              console.log("[Signup API] Profile found on last chance check - continuing");
              profileExists = true;
              break;
            }
            
            return NextResponse.json(
              { 
                error: "Database error saving new user. Please contact support.",
                // Include error code for debugging (only in development)
                ...(process.env.NODE_ENV === 'development' && { 
                  debug: {
                    insertErrorCode: insertError.code,
                    upsertErrorCode: upsertError?.code,
                  }
                })
              },
              { status: 500 }
            );
          }
          
          // Wait longer before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 200 * profileAttempts));
        } else {
          profileExists = true;
          console.log(`[Signup API] Profile created successfully via upsert for user: ${linkData.user.id}`);
        }
      } else if (insertData) {
        profileExists = true;
        console.log(`[Signup API] Profile created successfully via insert for user: ${linkData.user.id}`);
      }
    }
    
    // Final verification - ensure profile actually exists before proceeding
    if (!profileExists) {
      // Give it one more moment and check again
      await new Promise(resolve => setTimeout(resolve, 500));
      const { data: finalCheck, error: finalError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', linkData.user.id)
        .single();
      
      if (!finalCheck) {
        console.error("[Signup API] Profile verification failed - profile does not exist after all attempts", {
          userId: linkData.user.id,
          email: trimmedEmail,
          finalError: finalError ? {
            code: finalError.code,
            message: finalError.message,
            details: finalError.details,
            hint: finalError.hint,
          } : null,
          profileAttempts,
          userVerified,
        });
        return NextResponse.json(
          { 
            error: "Database error saving new user. Please contact support.",
            // Include debug info in development
            ...(process.env.NODE_ENV === 'development' && {
              debug: {
                userId: linkData.user.id,
                profileAttempts,
                userVerified,
                finalErrorCode: finalError?.code,
              }
            })
          },
          { status: 500 }
        );
      } else {
        console.log(`[Signup API] Profile found on final check for user: ${linkData.user.id}`);
        profileExists = true;
      }
    }

    // Store full name on the auth user as well (helps welcome email + future UX)
    try {
      // supabase-js supports updateUserById on the admin API
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const adminAny: any = supabaseAdmin.auth.admin as any;
      if (typeof adminAny.updateUserById === "function") {
        const { error: updateUserError } = await adminAny.updateUserById(linkData.user.id, {
          user_metadata: {
            full_name: fullName,
            first_name: trimmedFirstName,
            last_name: trimmedLastName,
          },
        });
        if (updateUserError) {
          console.error("[Signup API] Failed to update auth user metadata (non-fatal):", updateUserError);
        }
      }
    } catch (metaError) {
      console.error("[Signup API] Auth user metadata update failed (non-fatal):", metaError);
    }

    // Debug logging (only in development)
    if (process.env.AUTH_EMAIL_DEBUG === "true" && process.env.NODE_ENV === "development") {
      console.log(`[Signup API] Generated confirmation URL: ${confirmUrl}`);
    }

    // Skip email sending if RESEND_API_KEY is not configured
    if (!resendApiKey) {
      console.log(`[Signup API] Skipping email - RESEND_API_KEY not configured`);
      console.log(`[Signup API] In production, please set RESEND_API_KEY`);
      // In dev mode without Resend, return success but note email wasn't sent
      return NextResponse.json({
        ok: true,
        emailSent: false,
        message: "Account created! In development mode, confirmation email was skipped. Please click the confirmation link manually or configure RESEND_API_KEY.",
        ...(process.env.NODE_ENV === "development" && { confirmUrl }), // Include URL in dev for testing
      });
    }

    // Create email template
    // Prefer a "safe" MixWise-hosted verify URL (better deliverability than exposing Supabase URL in href)
    const baseUrl = getCanonicalSiteUrl(new URL(request.url));
    const parsedConfirmUrl = new URL(confirmUrl);
    const token = parsedConfirmUrl.searchParams.get("token") || "";
    const type = parsedConfirmUrl.searchParams.get("type") || "";
    const redirectToParam = parsedConfirmUrl.searchParams.get("redirect_to") || "";
    const safeConfirmUrl =
      token && type
        ? `${baseUrl}/auth/verify?token=${encodeURIComponent(token)}&type=${encodeURIComponent(type)}${
            redirectToParam ? `&redirect_to=${encodeURIComponent(redirectToParam)}` : ""
          }`
        : `${baseUrl}/auth/redirect?to=${encodeURIComponent(confirmUrl)}`;

    const emailTemplate = confirmEmailTemplate({
      confirmUrl: safeConfirmUrl,
      userEmail: trimmedEmail,
    });

    // Send email via Resend
    let resend;
    try {
      resend = createResendClient();
      console.log("[Signup API] Resend client created successfully");
    } catch (resendError) {
      const resendErrorMsg = resendError instanceof Error ? resendError.message : String(resendError);
      console.error("[Signup API] Failed to create Resend client:", resendErrorMsg);
      return NextResponse.json({
        ok: true,
        emailSent: false,
        message: "Account created but email service unavailable. Please try logging in.",
      });
    }

    console.log(`[Signup API] Sending confirmation email via Resend to: ${trimmedEmail}`);

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: MIXWISE_FROM_EMAIL,
      replyTo: "hello@getmixwise.com", // Use a real reply-to for better deliverability
      to: trimmedEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      headers: {
        "X-Entity-Ref-ID": linkData.user.id, // Unique identifier for tracking
        "List-Unsubscribe": "<mailto:unsubscribe@getmixwise.com>", // Required for anti-spam
      },
      tags: [
        { name: "category", value: "account_confirmation" },
        { name: "environment", value: process.env.NODE_ENV || "production" },
      ],
    });

    if (emailError) {
      console.error("[Signup API] Failed to send email via Resend:", {
        message: emailError.message,
        name: emailError.name,
      });
      
      return NextResponse.json({
        ok: true,
        emailSent: false,
        message: `Account created but email failed: ${emailError.message}. Please try logging in.`,
      });
    }

    console.log(`[Signup API] Confirmation email sent successfully. Resend ID: ${emailData?.id}`);

    // Send notification email to hello@getmixwise.com (non-blocking)
    // Call the function directly instead of making an HTTP request for better reliability
    sendSignupNotification({
      userId: linkData.user.id,
      userEmail: trimmedEmail,
      displayName: fullName,
      signupMethod: "Email/Password",
    })
      .then((result) => {
        if (result.skipped) {
          console.warn("[Signup API] Notification email skipped (RESEND_API_KEY not configured or other issue)");
        } else if (!result.success) {
          console.error("[Signup API] Notification email failed:", result.error);
        } else {
          console.log("[Signup API] Notification email sent successfully");
        }
      })
      .catch((err) => {
        // Don't fail the signup if notification email fails
        console.error("[Signup API] Failed to send notification email (non-fatal):", err);
      });

    return NextResponse.json({
      ok: true,
      emailSent: true,
      message: "Account created! Check your email to confirm your account.",
    });

  } catch (error) {
    // Log detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("[Signup API] Unexpected error:", {
      message: errorMessage,
      stack: errorStack,
      error: error,
    });

    // Check for specific error types and return appropriate messages
    if (errorMessage.includes("SUPABASE_URL") || errorMessage.includes("NEXT_PUBLIC_SUPABASE_URL")) {
      return NextResponse.json(
        { error: "Server configuration error: Missing Supabase URL" },
        { status: 500 }
      );
    }
    
    if (errorMessage.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return NextResponse.json(
        { error: "Server configuration error: Missing Supabase service key" },
        { status: 500 }
      );
    }
    
    if (errorMessage.includes("RESEND_API_KEY")) {
      return NextResponse.json(
        { error: "Server configuration error: Missing email service key" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: `An unexpected error occurred: ${errorMessage}` },
      { status: 500 }
    );
  }
}
