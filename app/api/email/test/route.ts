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
import { 
  confirmEmailTemplate, 
  resetPasswordTemplate, 
  welcomeEmailTemplate,
  weeklyDigestTemplate 
} from "@/lib/email/templates";

// Simple auth check - only allow in development or with secret
const TEST_SECRET = process.env.EMAIL_TEST_SECRET;

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

    switch (template) {
      case "confirmation":
        emailContent = confirmEmailTemplate({
          confirmUrl: "https://www.getmixwise.com/auth/callback?token=test-token",
          userEmail: email,
        });
        break;

      case "welcome":
        emailContent = welcomeEmailTemplate({
          displayName: email.split("@")[0],
          userEmail: email,
          unsubscribeUrl: "https://www.getmixwise.com/unsubscribe?token=test",
        });
        break;

      case "weekly-digest":
        emailContent = weeklyDigestTemplate({
          displayName: email.split("@")[0],
          userEmail: email,
          unsubscribeUrl: "https://www.getmixwise.com/unsubscribe?token=test",
          cocktailsYouCanMake: [
            { name: "Margarita", slug: "margarita" },
            { name: "Moscow Mule", slug: "moscow-mule" },
            { name: "Whiskey Sour", slug: "whiskey-sour" },
          ],
          featuredCocktail: {
            name: "Negroni",
            slug: "negroni",
            description: "A perfectly balanced bitter-sweet Italian aperitivo.",
            imageUrl: "https://images.unsplash.com/photo-1551751299-1b51cab2694c?w=600&h=400&fit=crop",
          },
          barIngredientCount: 12,
        });
        break;

      case "weekly-digest-empty":
        emailContent = weeklyDigestTemplate({
          displayName: email.split("@")[0],
          userEmail: email,
          unsubscribeUrl: "https://www.getmixwise.com/unsubscribe?token=test",
          cocktailsYouCanMake: [],
          featuredCocktail: {
            name: "Negroni",
            slug: "negroni",
            description: "A perfectly balanced bitter-sweet Italian aperitivo.",
            imageUrl: "https://images.unsplash.com/photo-1551751299-1b51cab2694c?w=600&h=400&fit=crop",
          },
          barIngredientCount: 0,
        });
        break;

      case "password-reset":
        emailContent = resetPasswordTemplate({
          resetUrl: "https://www.getmixwise.com/reset-password?token=test-token",
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

