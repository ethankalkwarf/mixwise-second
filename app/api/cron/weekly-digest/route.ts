/**
 * Weekly Digest Cron Job
 *
 * Runs every Sunday at 10:00 AM UTC
 * Sends personalized cocktail recommendations based on user's bar ingredients
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createResendClient, MIXWISE_FROM_EMAIL } from "@/lib/email/resend";
import { weeklyDigestTemplate } from "@/lib/email/templates";
import { verifyInternalRequest } from "@/lib/email/internal-auth";
import {
  buildUserOneClickUnsubscribeUrl,
  buildUserUnsubscribeUrl,
} from "@/lib/email/unsubscribe-urls";
import { getWeekNumber } from "@/lib/email/featured-cocktail";

export async function GET(request: NextRequest) {
  if (!verifyInternalRequest(request)) {
    console.error("[Weekly Digest] Unauthorized cron request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[Weekly Digest] Starting weekly digest job...");

  try {
    const supabaseAdmin = createAdminClient();
    const resend = createResendClient();

    const { data: eligibleUsers, error: usersError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, display_name")
      .not("email", "is", null);

    if (usersError) {
      console.error("[Weekly Digest] Error fetching users:", usersError);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    if (!eligibleUsers?.length) {
      console.log("[Weekly Digest] No eligible users found");
      return NextResponse.json({ message: "No eligible users", sent: 0 });
    }

    const userIds = eligibleUsers.map((u) => u.id);

    const { data: emailPrefsRows, error: prefsError } = await supabaseAdmin
      .from("email_preferences")
      .select("user_id, weekly_digest, unsubscribe_token, unsubscribed_all_at")
      .in("user_id", userIds);

    if (prefsError) {
      console.error("[Weekly Digest] Error fetching email preferences:", prefsError);
      return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
    }

    const prefsByUser = new Map(
      (emailPrefsRows || []).map((p) => [p.user_id, p])
    );

    const usersToEmail = eligibleUsers.filter((u) => {
      const prefs = prefsByUser.get(u.id);
      if (prefs?.unsubscribed_all_at) return false;
      if (!prefs) return true;
      return prefs.weekly_digest !== false;
    });

    console.log(
      `[Weekly Digest] Found ${usersToEmail.length} users to email (of ${eligibleUsers.length} with email)`
    );

    const digestUserIds = usersToEmail.map((u) => u.id);
    const { data: barIngredients, error: barError } = await supabaseAdmin
      .from("bar_ingredients")
      .select("user_id, ingredient_id")
      .in("user_id", digestUserIds);

    if (barError) {
      console.error("[Weekly Digest] Error fetching bar ingredients:", barError);
    }

    const userIngredients = new Map<string, string[]>();
    (barIngredients || []).forEach((bi) => {
      const existing = userIngredients.get(bi.user_id) || [];
      existing.push(bi.ingredient_id);
      userIngredients.set(bi.user_id, existing);
    });

    const { data: cocktails, error: cocktailsError } = await supabaseAdmin
      .from("cocktails")
      .select("id, slug, name, short_description, image_url, ingredients");

    if (cocktailsError || !cocktails?.length) {
      console.error("[Weekly Digest] Error fetching cocktails:", cocktailsError);
      return NextResponse.json({ error: "Failed to fetch cocktails" }, { status: 500 });
    }

    const weekNumber = getWeekNumber();
    const featuredCocktail = cocktails[weekNumber % cocktails.length];
    console.log(`[Weekly Digest] Week ${weekNumber}, featuring: ${featuredCocktail?.name}`);

    let sentCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const user of usersToEmail) {
      try {
        const prefs = prefsByUser.get(user.id);
        let unsubscribeToken = prefs?.unsubscribe_token;

        if (!unsubscribeToken) {
          const { data: createdPrefs, error: createError } = await supabaseAdmin
            .from("email_preferences")
            .insert({ user_id: user.id })
            .select("unsubscribe_token")
            .single();

          if (createError || !createdPrefs?.unsubscribe_token) {
            console.error(
              `[Weekly Digest] Missing unsubscribe token for ${user.email}:`,
              createError
            );
            skippedCount++;
            continue;
          }
          unsubscribeToken = createdPrefs.unsubscribe_token;
        }

        const ingredientIds = userIngredients.get(user.id) || [];
        const ingredientSet = new Set(ingredientIds);
        const cocktailsUserCanMake: Array<{ name: string; slug: string; imageUrl?: string }> = [];

        for (const cocktail of cocktails) {
          const ingredientArray = cocktail.ingredients as Array<{ ingredient_id: number }> | null;
          if (!ingredientArray?.length) continue;

          const hasAllIngredients = ingredientArray.every((ing) =>
            ingredientSet.has(String(ing.ingredient_id))
          );

          if (hasAllIngredients) {
            cocktailsUserCanMake.push({
              name: cocktail.name,
              slug: cocktail.slug,
              imageUrl: cocktail.image_url || undefined,
            });
          }
        }

        const displayName = user.display_name || user.email?.split("@")[0] || "Mixologist";
        const footerUnsubscribe = buildUserUnsubscribeUrl(unsubscribeToken, "digest");
        const oneClickUnsubscribe = buildUserOneClickUnsubscribeUrl(unsubscribeToken);

        const emailTemplate = weeklyDigestTemplate({
          displayName,
          userEmail: user.email!,
          unsubscribeUrl: footerUnsubscribe,
          cocktailsYouCanMake: cocktailsUserCanMake,
          featuredCocktail: featuredCocktail
            ? {
                name: featuredCocktail.name,
                slug: featuredCocktail.slug,
                description: featuredCocktail.short_description || undefined,
                imageUrl: featuredCocktail.image_url || undefined,
              }
            : undefined,
          barIngredientCount: ingredientIds.length,
        });

        const { data: sendData, error: sendError } = await resend.emails.send({
          from: MIXWISE_FROM_EMAIL,
          replyTo: "hello@getmixwise.com",
          to: user.email!,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          headers: {
            "X-Entity-Ref-ID": user.id,
            "List-Unsubscribe": `<${oneClickUnsubscribe}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
          tags: [
            { name: "category", value: "weekly_digest" },
            { name: "environment", value: process.env.NODE_ENV || "production" },
          ],
        });

        if (sendError) {
          console.error(`[Weekly Digest] Failed to send to ${user.email}:`, sendError);
          errorCount++;
        } else {
          console.log(
            `[Weekly Digest] Sent to ${user.email} (Resend ID: ${sendData?.id})`
          );
          sentCount++;

          await supabaseAdmin
            .from("email_preferences")
            .update({ last_digest_sent_at: new Date().toISOString() })
            .eq("user_id", user.id);
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (userError) {
        console.error(`[Weekly Digest] Error processing user ${user.id}:`, userError);
        errorCount++;
      }
    }

    console.log(
      `[Weekly Digest] Completed. Sent: ${sentCount}, Errors: ${errorCount}, Skipped: ${skippedCount}`
    );

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errorCount,
      skipped: skippedCount,
      totalUsers: usersToEmail.length,
    });
  } catch (error) {
    console.error("[Weekly Digest] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
