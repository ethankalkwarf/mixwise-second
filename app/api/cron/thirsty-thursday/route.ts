/**
 * Thirsty Thursday Cron Job
 *
 * Runs every Thursday at 15:00 UTC (~10am US Eastern)
 * Sends the weekly cocktail recipe to newsletter subscribers.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createResendClient, MIXWISE_FROM_EMAIL } from "@/lib/email/resend";
import { thirstyThursdayWeeklyTemplate } from "@/lib/email/templates";
import { verifyInternalRequest } from "@/lib/email/internal-auth";
import { getFeaturedCocktailForEmail, getWeekNumber } from "@/lib/email/featured-cocktail";
import {
  buildNewsletterOneClickUnsubscribeUrl,
  buildNewsletterUnsubscribeUrl,
} from "@/lib/email/unsubscribe-urls";

const SOURCE = "thirsty_thursday";

export async function GET(request: NextRequest) {
  if (!verifyInternalRequest(request)) {
    console.error("[Thirsty Thursday Cron] Unauthorized request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[Thirsty Thursday Cron] Starting weekly send...");

  try {
    const supabaseAdmin = createAdminClient();
    const resend = createResendClient();

    const { data: subscribers, error: subsError } = await supabaseAdmin
      .from("email_signups")
      .select("id, email, unsubscribe_token, opted_out_at, welcome_email_sent_at, last_email_sent_at")
      .eq("source", SOURCE)
      .is("opted_out_at", null);

    if (subsError) {
      console.error("[Thirsty Thursday Cron] Failed to fetch subscribers:", subsError);
      return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
    }

    if (!subscribers?.length) {
      return NextResponse.json({ message: "No active subscribers", sent: 0 });
    }

    const weekNumber = getWeekNumber();
    const featuredCocktail = await getFeaturedCocktailForEmail({
      weekSeed: weekNumber + 3,
      preferImages: true,
    });

    let sentCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    for (const sub of subscribers) {
      try {
        if (!sub.unsubscribe_token) {
          skippedCount++;
          continue;
        }

        // Skip if we already sent a campaign email today (e.g. welcome + cron same day)
        if (sub.last_email_sent_at) {
          const lastSent = new Date(sub.last_email_sent_at);
          if (lastSent >= todayStart) {
            skippedCount++;
            continue;
          }
        }

        const email = sub.email.trim().toLowerCase();
        const footerUnsubscribe = buildNewsletterUnsubscribeUrl(
          email,
          SOURCE,
          sub.unsubscribe_token
        );
        const oneClickUnsubscribe = buildNewsletterOneClickUnsubscribeUrl(
          email,
          SOURCE,
          sub.unsubscribe_token
        );

        const emailTemplate = thirstyThursdayWeeklyTemplate({
          userEmail: email,
          unsubscribeUrl: footerUnsubscribe,
          featuredCocktail,
        });

        const { data: sendData, error: sendError } = await resend.emails.send({
          from: MIXWISE_FROM_EMAIL,
          replyTo: "hello@getmixwise.com",
          to: email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          headers: {
            "X-Entity-Ref-ID": `thirsty-thursday-${sub.id}`,
            "List-Unsubscribe": `<${oneClickUnsubscribe}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
          tags: [
            { name: "category", value: "thirsty_thursday_weekly" },
            { name: "environment", value: process.env.NODE_ENV || "production" },
          ],
        });

        if (sendError) {
          console.error(`[Thirsty Thursday Cron] Failed for ${email}:`, sendError);
          errorCount++;
        } else {
          sentCount++;
          console.log(`[Thirsty Thursday Cron] Sent to ${email} (Resend ID: ${sendData?.id})`);

          await supabaseAdmin
            .from("email_signups")
            .update({ last_email_sent_at: new Date().toISOString() })
            .eq("id", sub.id);
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (err) {
        console.error(`[Thirsty Thursday Cron] Error for signup ${sub.id}:`, err);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errorCount,
      skipped: skippedCount,
      totalSubscribers: subscribers.length,
      featuredCocktail: featuredCocktail?.name ?? null,
    });
  } catch (error) {
    console.error("[Thirsty Thursday Cron] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
