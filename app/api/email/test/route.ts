/**
 * Email Test Endpoint
 * 
 * Send a test email to verify templates work correctly.
 * 
 * Usage: POST /api/email/test
 * Body: { "template": "weekly-digest", "email": "your@email.com" }
 * 
 * ⚠️ This endpoint should be protected or removed in production.
 */

import { NextRequest, NextResponse } from "next/server";
import { createResendClient, MIXWISE_FROM_EMAIL } from "@/lib/email/resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { 
  confirmEmailTemplate, 
  resetPasswordTemplate, 
  welcomeEmailTemplate,
  weeklyDigestTemplate 
} from "@/lib/email/templates";

// Simple auth check - only allow in development or with secret
const TEST_SECRET = process.env.EMAIL_TEST_SECRET;

// Fetch a random featured cocktail from the database
async function getFeaturedCocktail() {
  try {
    const supabase = createAdminClient();
    
    // Get a random cocktail with an image
    const { data, error } = await supabase
      .from("cocktails")
      .select("name, slug, short_description, image_url")
      .not("image_url", "is", null)
      .limit(20);
    
    if (error || !data || data.length === 0) {
      console.error("[Email Test] Error fetching cocktail:", error);
      return null;
    }
    
    // Pick a random one
    const randomIndex = Math.floor(Math.random() * data.length);
    const cocktail = data[randomIndex];
    
    return {
      name: cocktail.name,
      slug: cocktail.slug,
      description: cocktail.short_description || undefined,
      imageUrl: cocktail.image_url || undefined,
    };
  } catch (err) {
    console.error("[Email Test] Failed to fetch cocktail:", err);
    return null;
  }
}

// Fetch some cocktails the user could make (for demo purposes)
async function getSampleCocktails() {
  try {
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from("cocktails")
      .select("name, slug, image_url")
      .limit(5);
    
    if (error || !data) {
      return [];
    }
    
    return data.map(c => ({
      name: c.name,
      slug: c.slug,
      imageUrl: c.image_url || undefined,
    }));
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { template, email, secret } = await request.json();

    // Security check
    if (TEST_SECRET && secret !== TEST_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const resend = createResendClient();

    let emailContent: { subject: string; html: string; text: string };

    // For test emails, use simple URLs that won't trigger security warnings
    // These go to real pages on the site, not auth endpoints with tokens
    const unsubscribeUrl = "https://www.getmixwise.com/settings";
    
    // Fetch real cocktail data from the database
    const featuredCocktail = await getFeaturedCocktail();
    const sampleCocktails = await getSampleCocktails();

    switch (template) {
      case "confirmation":
        emailContent = confirmEmailTemplate({
          // Link to homepage for test - in production this would be a real auth callback
          confirmUrl: "https://www.getmixwise.com/dashboard",
          userEmail: email,
        });
        break;

      case "welcome":
        emailContent = welcomeEmailTemplate({
          displayName: email.split("@")[0],
          userEmail: email,
          unsubscribeUrl,
        });
        break;

      case "weekly-digest":
        emailContent = weeklyDigestTemplate({
          displayName: email.split("@")[0],
          userEmail: email,
          unsubscribeUrl,
          cocktailsYouCanMake: sampleCocktails.length > 0 ? sampleCocktails : [
            { name: "Margarita", slug: "margarita" },
            { name: "Moscow Mule", slug: "moscow-mule" },
            { name: "Whiskey Sour", slug: "whiskey-sour" },
          ],
          featuredCocktail: featuredCocktail || {
            name: "Negroni",
            slug: "negroni",
            description: "A perfectly balanced bitter-sweet Italian aperitivo.",
          },
          barIngredientCount: 12,
        });
        break;

      case "weekly-digest-empty":
        emailContent = weeklyDigestTemplate({
          displayName: email.split("@")[0],
          userEmail: email,
          unsubscribeUrl,
          cocktailsYouCanMake: [],
          featuredCocktail: featuredCocktail || {
            name: "Negroni",
            slug: "negroni",
            description: "A perfectly balanced bitter-sweet Italian aperitivo.",
          },
          barIngredientCount: 0,
        });
        break;

      case "password-reset":
        emailContent = resetPasswordTemplate({
          // Link to homepage for test - in production this would be a real reset page
          resetUrl: "https://www.getmixwise.com/login",
          userEmail: email,
        });
        break;

      default:
        return NextResponse.json({ 
          error: "Invalid template. Use: confirmation, welcome, weekly-digest, weekly-digest-empty, password-reset" 
        }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: MIXWISE_FROM_EMAIL,
      to: email,
      subject: `[TEST] ${emailContent.subject}`,
      html: emailContent.html,
      text: emailContent.text,
      headers: {
        "Reply-To": "hello@getmixwise.com",
        "List-Unsubscribe": `<https://www.getmixwise.com/unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (error) {
      console.error("[Email Test] Failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`[Email Test] Sent ${template} to ${email}. ID: ${data?.id}`);

    return NextResponse.json({ 
      success: true, 
      message: `Test email sent to ${email}`,
      template,
      resendId: data?.id 
    });

  } catch (error) {
    console.error("[Email Test] Error:", error);
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 });
  }
}

