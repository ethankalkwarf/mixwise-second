/**
 * Send Welcome Email API Route
 *
 * Sends a welcome email to a user after they confirm their email.
 * This should be called from the auth callback after successful email verification.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createResendClient, MIXWISE_FROM_EMAIL } from "@/lib/email/resend";
import { welcomeEmailTemplate } from "@/lib/email/templates";
import { getSiteUrl } from "@/lib/site";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userEmail, displayName } = body;

    // Validate required fields
    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "userId and userEmail are required" },
        { status: 400 }
      );
    }

    console.log(`[Send Welcome] Processing for user: ${userId}, email: ${userEmail}`);

    const supabaseAdmin = createAdminClient();

    // Check if welcome email was already sent
    const { data: emailPrefs, error: prefsError } = await supabaseAdmin
      .from("email_preferences")
      .select("welcome_email_sent_at, welcome_emails, unsubscribe_token")
      .eq("user_id", userId)
      .single();

    if (prefsError && prefsError.code !== "PGRST116") {
      console.error("[Send Welcome] Error fetching email preferences:", prefsError);
      // Continue anyway - we'll create preferences if needed
    }

    // Check if already sent
    if (emailPrefs?.welcome_email_sent_at) {
      console.log(`[Send Welcome] Welcome email already sent to ${userEmail}`);
      return NextResponse.json({ ok: true, alreadySent: true });
    }

    // Check if user opted out of welcome emails
    if (emailPrefs && emailPrefs.welcome_emails === false) {
      console.log(`[Send Welcome] User ${userId} opted out of welcome emails`);
      return NextResponse.json({ ok: true, optedOut: true });
    }

    // Get or create unsubscribe token
    let unsubscribeToken = emailPrefs?.unsubscribe_token;

    if (!emailPrefs) {
      // Create email preferences row
      const { data: newPrefs, error: insertError } = await supabaseAdmin
        .from("email_preferences")
        .insert({ user_id: userId })
        .select("unsubscribe_token")
        .single();

      if (insertError) {
        console.error("[Send Welcome] Error creating email preferences:", insertError);
        // Generate a fallback token
        unsubscribeToken = crypto.randomUUID();
      } else {
        unsubscribeToken = newPrefs.unsubscribe_token;
      }
    }

    // Build unsubscribe URL
    const siteUrl = getSiteUrl();
    const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${unsubscribeToken}`;

    // Generate email template
    const name = displayName || userEmail.split("@")[0];
    const emailTemplate = welcomeEmailTemplate({
      displayName: name,
      userEmail,
      unsubscribeUrl,
    });

    // Send email via Resend
    const resend = createResendClient();

    console.log(`[Send Welcome] Sending welcome email to: ${userEmail}`);

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: MIXWISE_FROM_EMAIL,
      replyTo: "hello@getmixwise.com",
      to: userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      headers: {
        "X-Entity-Ref-ID": userId,
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      tags: [
        { name: "category", value: "welcome" },
        { name: "environment", value: process.env.NODE_ENV || "production" },
      ],
    });

    if (emailError) {
      console.error("[Send Welcome] Failed to send email:", emailError);
      return NextResponse.json(
        { error: `Failed to send welcome email: ${emailError.message}` },
        { status: 500 }
      );
    }

    console.log(`[Send Welcome] Email sent successfully. Resend ID: ${emailData?.id}`);

    // Mark welcome email as sent
    const { error: updateError } = await supabaseAdmin
      .from("email_preferences")
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (updateError) {
      console.error("[Send Welcome] Failed to update welcome_email_sent_at:", updateError);
      // Don't fail the request - email was sent successfully
    }

    return NextResponse.json({
      ok: true,
      emailSent: true,
      resendId: emailData?.id,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Send Welcome] Unexpected error:", errorMessage);

    return NextResponse.json(
      { error: `An unexpected error occurred: ${errorMessage}` },
      { status: 500 }
    );
  }
}

