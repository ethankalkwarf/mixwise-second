import { NextRequest, NextResponse } from "next/server";
import { createResendClient, MIXWISE_FROM_EMAIL } from "@/lib/email/resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { weddingRecommendationsTemplate } from "@/lib/email/templates";

export const dynamic = "force-dynamic";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, recommendations, answers } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
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

    if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
      return NextResponse.json(
        { error: "Recommendations are required" },
        { status: 400 }
      );
    }

    // Save email to database (email_signups table)
    const supabase = createAdminClient();
    try {
      const { error: dbError } = await supabase
        .from("email_signups")
        .insert({
          email: trimmedEmail,
          source: "wedding_cocktail_finder",
        });

      if (dbError) {
        console.error("[Wedding Recommendations] Failed to save email to database:", dbError);
        // Continue anyway - don't block email sending
      } else {
        console.log(`[Wedding Recommendations] Saved email to database: ${trimmedEmail}`);
      }
    } catch (dbError) {
      console.error("[Wedding Recommendations] Database error:", dbError);
      // Continue anyway - don't block email sending
    }

    const resend = createResendClient();

    // Use email template from templates library
    const emailTemplate = weddingRecommendationsTemplate({
      recommendations: recommendations.map((rec: any) => ({
        name: rec.name,
        slug: rec.slug,
        base_spirit: rec.base_spirit || null,
      })),
    });

    console.log(`[Wedding Recommendations] Sending email to: ${trimmedEmail}`);

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: MIXWISE_FROM_EMAIL,
      to: trimmedEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      headers: {
        "X-Entity-Ref-ID": `wedding-recommendations-${Date.now()}`,
      },
      tags: [
        { name: "category", value: "wedding_recommendations" },
        { name: "environment", value: process.env.NODE_ENV || "production" },
      ],
    });

    if (emailError) {
      console.error("[Wedding Recommendations] Failed to send email:", emailError);
      return NextResponse.json(
        { error: "Failed to send email. Please try again later." },
        { status: 500 }
      );
    }

    console.log(`[Wedding Recommendations] Email sent successfully. Resend ID: ${emailData?.id}`);

    return NextResponse.json({
      ok: true,
      message: "Recommendations sent to your email!",
    });

  } catch (error) {
    console.error("[Wedding Recommendations] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

