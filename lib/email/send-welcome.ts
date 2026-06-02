/**
 * Welcome email sender (post email confirmation).
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { createResendClient, MIXWISE_FROM_EMAIL } from "@/lib/email/resend";
import { welcomeEmailTemplate } from "@/lib/email/templates";
import { buildUserOneClickUnsubscribeUrl, buildUserUnsubscribeUrl } from "@/lib/email/unsubscribe-urls";

export interface SendWelcomeEmailParams {
  userId: string;
  userEmail: string;
  displayName?: string;
}

export async function sendWelcomeEmail(
  params: SendWelcomeEmailParams
): Promise<{ success: boolean; alreadySent?: boolean; optedOut?: boolean; error?: string; resendId?: string }> {
  const { userId, userEmail, displayName } = params;

  if (!userId || !userEmail) {
    return { success: false, error: "userId and userEmail are required" };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn("[Send Welcome] RESEND_API_KEY not set - skipping");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const supabaseAdmin = createAdminClient();

    const { data: emailPrefs, error: prefsError } = await supabaseAdmin
      .from("email_preferences")
      .select("welcome_email_sent_at, welcome_emails, unsubscribe_token, unsubscribed_all_at")
      .eq("user_id", userId)
      .single();

    if (prefsError && prefsError.code !== "PGRST116") {
      console.error("[Send Welcome] Error fetching email preferences:", prefsError);
    }

    if (emailPrefs?.welcome_email_sent_at) {
      return { success: true, alreadySent: true };
    }

    if (emailPrefs?.unsubscribed_all_at || emailPrefs?.welcome_emails === false) {
      return { success: true, optedOut: true };
    }

    let unsubscribeToken = emailPrefs?.unsubscribe_token;

    if (!emailPrefs) {
      const { data: newPrefs, error: insertError } = await supabaseAdmin
        .from("email_preferences")
        .insert({ user_id: userId })
        .select("unsubscribe_token")
        .single();

      if (insertError) {
        console.error("[Send Welcome] Error creating email preferences:", insertError);
        unsubscribeToken = crypto.randomUUID();
      } else {
        unsubscribeToken = newPrefs.unsubscribe_token;
      }
    }

    if (!unsubscribeToken) {
      return { success: false, error: "Missing unsubscribe token" };
    }

    const unsubscribeUrl = buildUserUnsubscribeUrl(unsubscribeToken, "all");
    const oneClickUnsubscribe = buildUserOneClickUnsubscribeUrl(unsubscribeToken);
    const name = displayName || userEmail.split("@")[0];

    const emailTemplate = welcomeEmailTemplate({
      displayName: name,
      userEmail,
      unsubscribeUrl,
    });

    const resend = createResendClient();

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: MIXWISE_FROM_EMAIL,
      replyTo: "hello@getmixwise.com",
      to: userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      headers: {
        "X-Entity-Ref-ID": userId,
        "List-Unsubscribe": `<${oneClickUnsubscribe}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      tags: [
        { name: "category", value: "welcome" },
        { name: "environment", value: process.env.NODE_ENV || "production" },
      ],
    });

    if (emailError) {
      console.error("[Send Welcome] Failed to send email:", emailError);
      return { success: false, error: emailError.message };
    }

    await supabaseAdmin
      .from("email_preferences")
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .eq("user_id", userId);

    console.log(`[Send Welcome] Sent to ${userEmail}. Resend ID: ${emailData?.id}`);

    return { success: true, resendId: emailData?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Send Welcome] Unexpected error:", message);
    return { success: false, error: message };
  }
}

/**
 * Returns true if the user was created recently (first session after signup).
 */
export function isRecentlyCreatedUser(createdAt: string | undefined, windowMs = 15 * 60 * 1000): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  return created > Date.now() - windowMs;
}
