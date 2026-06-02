/**
 * Thirsty Thursday Email Signup API Route
 * 
 * Handles email signups for the Thirsty Thursday weekly newsletter.
 * Stores email in Supabase and optionally sends confirmation via Resend.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createResendClient, MIXWISE_FROM_EMAIL } from "@/lib/email/resend";
import { thirstyThursdayWelcomeTemplate } from "@/lib/email/templates";
import { getSiteUrl } from "@/lib/site";
import { getCocktailsList } from "@/lib/cocktails.server";

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
    const clientIP = request.headers.get("x-forwarded-for")?.split(",")[0] ||
                     request.headers.get("x-real-ip") ||
                     "unknown";

    // Rate limiting check
    if (isRateLimited(clientIP)) {
      console.warn(`[Thirsty Thursday Signup] Rate limit exceeded for IP: ${clientIP}`);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email } = body;

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

    console.log(`[Thirsty Thursday Signup] Processing signup for email: ${trimmedEmail}, IP: ${clientIP}`);

    // Create Supabase admin client
    let supabaseAdmin;
    try {
      supabaseAdmin = createAdminClient();
    } catch (adminError) {
      console.error("[Thirsty Thursday Signup] Failed to create admin client:", adminError);
      return NextResponse.json(
        { error: "Server configuration error. Please try again later." },
        { status: 500 }
      );
    }

    // Check if email already exists for this source
    const { data: existingSignup, error: checkError } = await supabaseAdmin
      .from("email_signups")
      .select("id, email, created_at")
      .eq("email", trimmedEmail)
      .eq("source", "thirsty_thursday")
      .single();

    if (checkError && checkError.code !== "PGRST116") { // PGRST116 = no rows returned
      console.error("[Thirsty Thursday Signup] Error checking existing signup:", checkError);
      return NextResponse.json(
        { error: "Failed to process signup. Please try again." },
        { status: 500 }
      );
    }

    // If already signed up, return success (don't reveal if email exists)
    if (existingSignup) {
      console.log(`[Thirsty Thursday Signup] Email already signed up: ${trimmedEmail}`);
      return NextResponse.json({
        ok: true,
        message: "You're already signed up! Check your inbox for our weekly emails.",
        alreadySubscribed: true,
      });
    }

    // Insert new signup
    const { data: newSignup, error: insertError } = await supabaseAdmin
      .from("email_signups")
      .insert({
        email: trimmedEmail,
        source: "thirsty_thursday",
      })
      .select()
      .single();

    if (insertError) {
      console.error("[Thirsty Thursday Signup] Failed to insert signup:", insertError);
      
      // Handle unique constraint violation (race condition)
      if (insertError.code === "23505") {
        return NextResponse.json({
          ok: true,
          message: "You're already signed up! Check your inbox for our weekly emails.",
          alreadySubscribed: true,
        });
      }

      return NextResponse.json(
        { error: "Failed to process signup. Please try again." },
        { status: 500 }
      );
    }

    console.log(`[Thirsty Thursday Signup] Successfully signed up: ${trimmedEmail}`);

    // Fetch a random cocktail to include in the welcome email
    let featuredCocktail: {
      name: string;
      slug: string;
      description?: string;
      imageUrl?: string;
      ingredients?: string;
      instructions?: string;
    } | undefined;

    try {
      const cocktails = await getCocktailsList({ limit: 50 });
      if (cocktails.length > 0) {
        // Pick a random cocktail (prefer ones with images)
        const cocktailsWithImages = cocktails.filter(c => c.image_url);
        const selectedCocktail = cocktailsWithImages.length > 0 
          ? cocktailsWithImages[Math.floor(Math.random() * cocktailsWithImages.length)]
          : cocktails[Math.floor(Math.random() * cocktails.length)];
        
        // Fetch full cocktail details including ingredients and instructions
        const { data: fullCocktail } = await supabaseAdmin
          .from("cocktails")
          .select("name, slug, short_description, image_url, ingredients, instructions")
          .eq("id", selectedCocktail.id)
          .single();

        if (fullCocktail) {
          // Format ingredients
          let ingredientsText = "";
          if (fullCocktail.ingredients) {
            const ingredients = fullCocktail.ingredients as Array<{ ingredient_id?: number; name?: string; amount?: string }> | string;
            if (Array.isArray(ingredients)) {
              ingredientsText = ingredients
                .map(ing => {
                  if (typeof ing === 'object' && ing.amount && ing.name) {
                    return `${ing.amount} ${ing.name}`;
                  }
                  return typeof ing === 'string' ? ing : '';
                })
                .filter(Boolean)
                .join('\n');
            } else if (typeof ingredients === 'string') {
              ingredientsText = ingredients;
            }
          }

          // Format instructions
          let instructionsText = "";
          if (fullCocktail.instructions) {
            const instructions = fullCocktail.instructions as Array<{ step?: number; instruction?: string }> | string;
            if (Array.isArray(instructions)) {
              instructionsText = instructions
                .map((inst, idx) => {
                  if (typeof inst === 'object' && inst.instruction) {
                    return `${idx + 1}. ${inst.instruction}`;
                  }
                  return typeof inst === 'string' ? `${idx + 1}. ${inst}` : '';
                })
                .filter(Boolean)
                .join('\n');
            } else if (typeof instructions === 'string') {
              instructionsText = instructions;
            }
          }

          featuredCocktail = {
            name: fullCocktail.name,
            slug: fullCocktail.slug,
            description: fullCocktail.short_description || undefined,
            imageUrl: fullCocktail.image_url || undefined,
            ingredients: ingredientsText || undefined,
            instructions: instructionsText || undefined,
          };
        }
      }
    } catch (cocktailError) {
      console.error("[Thirsty Thursday Signup] Failed to fetch cocktail for email:", cocktailError);
      // Continue without cocktail - email will still be sent
    }

    // Send welcome email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resend = createResendClient();
        
        // Generate unsubscribe URL (simple email-based for non-users)
        const siteUrl = getSiteUrl();
        // For email signups, use a simple unsubscribe link with email
        // In the future, we could add a token field to email_signups table
        const unsubscribeUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(trimmedEmail)}&source=thirsty_thursday`;
        
        // Generate email template
        const emailTemplate = thirstyThursdayWelcomeTemplate({
          userEmail: trimmedEmail,
          unsubscribeUrl,
          featuredCocktail,
        });
        
        console.log(`[Thirsty Thursday Signup] Sending welcome email to: ${trimmedEmail}`);
        
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: MIXWISE_FROM_EMAIL,
          to: trimmedEmail,
          replyTo: "hello@getmixwise.com",
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          headers: {
            "X-Entity-Ref-ID": newSignup.id || trimmedEmail,
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
          tags: [
            { name: "category", value: "thirsty_thursday_welcome" },
            { name: "environment", value: process.env.NODE_ENV || "production" },
          ],
        });

        if (emailError) {
          // Don't fail the signup if email fails
          console.error("[Thirsty Thursday Signup] Failed to send welcome email:", emailError);
        } else {
          console.log(`[Thirsty Thursday Signup] Welcome email sent successfully. Resend ID: ${emailData?.id}`);
        }
      } catch (emailError) {
        // Don't fail the signup if email fails
        console.error("[Thirsty Thursday Signup] Failed to send welcome email:", emailError);
      }
    } else {
      console.log(`[Thirsty Thursday Signup] Skipping email - RESEND_API_KEY not configured`);
    }

    return NextResponse.json({
      ok: true,
      message: "Successfully signed up! Check your inbox for our weekly cocktail emails.",
    });

  } catch (error) {
    console.error("[Thirsty Thursday Signup] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
