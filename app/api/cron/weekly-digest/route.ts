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
import { getSiteUrl } from "@/lib/site";

// Vercel cron authentication
const CRON_SECRET = process.env.CRON_SECRET;

interface CocktailWithIngredients {
  id: number;
  slug: string;
  name: string;
  short_description: string | null;
  image_url: string | null;
  ingredients: Array<{ ingredient_id: number }> | null;
}

interface UserWithBar {
  id: string;
  email: string;
  display_name: string | null;
  ingredient_ids: string[];
}

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header for cron jobs)
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    console.error("[Weekly Digest] Unauthorized cron request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[Weekly Digest] Starting weekly digest job...");

  try {
    const supabaseAdmin = createAdminClient();
    const resend = createResendClient();
    const siteUrl = getSiteUrl();

    // 1. Get all users who have weekly_digest enabled
    const { data: eligibleUsers, error: usersError } = await supabaseAdmin
      .from("profiles")
      .select(`
        id,
        email,
        display_name
      `)
      .not("email", "is", null);

    if (usersError) {
      console.error("[Weekly Digest] Error fetching users:", usersError);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    if (!eligibleUsers || eligibleUsers.length === 0) {
      console.log("[Weekly Digest] No eligible users found");
      return NextResponse.json({ message: "No eligible users", sent: 0 });
    }

    // 2. Check email preferences for each user (only send to those who want weekly digest)
    const { data: emailPrefs, error: prefsError } = await supabaseAdmin
      .from("email_preferences")
      .select("user_id, weekly_digest")
      .eq("weekly_digest", true);

    const usersWantingDigest = new Set(
      (emailPrefs || []).map(p => p.user_id)
    );

    // For users without email_preferences row, default to sending (opt-in by default)
    const { data: allPrefsUsers } = await supabaseAdmin
      .from("email_preferences")
      .select("user_id");
    
    const usersWithPrefs = new Set((allPrefsUsers || []).map(p => p.user_id));

    // Filter users: either they explicitly want digest, or they have no preferences set (default = yes)
    const usersToEmail = eligibleUsers.filter(u => 
      !usersWithPrefs.has(u.id) || usersWantingDigest.has(u.id)
    );

    console.log(`[Weekly Digest] Found ${usersToEmail.length} users to email`);

    // 3. Get bar ingredients for each user
    const userIds = usersToEmail.map(u => u.id);
    const { data: barIngredients, error: barError } = await supabaseAdmin
      .from("bar_ingredients")
      .select("user_id, ingredient_id")
      .in("user_id", userIds);

    if (barError) {
      console.error("[Weekly Digest] Error fetching bar ingredients:", barError);
    }

    // Group ingredients by user
    const userIngredients = new Map<string, string[]>();
    (barIngredients || []).forEach(bi => {
      const existing = userIngredients.get(bi.user_id) || [];
      existing.push(bi.ingredient_id);
      userIngredients.set(bi.user_id, existing);
    });

    // 4. Get all cocktails with their ingredients
    const { data: cocktails, error: cocktailsError } = await supabaseAdmin
      .from("cocktails")
      .select(`
        id,
        slug,
        name,
        short_description,
        image_url,
        ingredients
      `);

    if (cocktailsError || !cocktails) {
      console.error("[Weekly Digest] Error fetching cocktails:", cocktailsError);
      return NextResponse.json({ error: "Failed to fetch cocktails" }, { status: 500 });
    }

    // 5. Pick a featured cocktail (random from popular ones)
    const featuredIndex = Math.floor(Math.random() * Math.min(20, cocktails.length));
    const featuredCocktail = cocktails[featuredIndex];

    // 6. Send emails to each user
    let sentCount = 0;
    let errorCount = 0;

    for (const user of usersToEmail) {
      try {
        const ingredientIds = userIngredients.get(user.id) || [];
        const ingredientSet = new Set(ingredientIds);

        // Find cocktails this user can make
        const cocktailsUserCanMake: Array<{ name: string; slug: string; imageUrl?: string }> = [];

        for (const cocktail of cocktails) {
          const ingredientArray = cocktail.ingredients as Array<{ ingredient_id: number }> | null;
          if (!ingredientArray || ingredientArray.length === 0) continue;

          const hasAllIngredients = ingredientArray.every(
            (ing) => ingredientSet.has(String(ing.ingredient_id))
          );

          if (hasAllIngredients) {
            cocktailsUserCanMake.push({
              name: cocktail.name,
              slug: cocktail.slug,
              imageUrl: cocktail.image_url || undefined,
            });
          }
        }

        // Skip users with 0 cocktails unless they have a featured cocktail
        if (cocktailsUserCanMake.length === 0 && ingredientIds.length === 0) {
          console.log(`[Weekly Digest] Skipping ${user.email} - no bar ingredients`);
          continue;
        }

        const displayName = user.display_name || user.email?.split("@")[0] || "Mixologist";
        const unsubscribeUrl = `${siteUrl}/api/email/unsubscribe?token=${user.id}&emailType=weekly_digest`;

        const emailTemplate = weeklyDigestTemplate({
          displayName,
          userEmail: user.email!,
          unsubscribeUrl,
          cocktailsYouCanMake: cocktailsUserCanMake,
          featuredCocktail: featuredCocktail ? {
            name: featuredCocktail.name,
            slug: featuredCocktail.slug,
            description: featuredCocktail.short_description || undefined,
            imageUrl: featuredCocktail.image_url || undefined,
          } : undefined,
          barIngredientCount: ingredientIds.length,
        });

        const { error: sendError } = await resend.emails.send({
          from: MIXWISE_FROM_EMAIL,
          to: user.email!,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          headers: {
            "X-Entity-Ref-ID": user.id,
            "Reply-To": "hello@getmixwise.com",
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        });

        if (sendError) {
          console.error(`[Weekly Digest] Failed to send to ${user.email}:`, sendError);
          errorCount++;
        } else {
          console.log(`[Weekly Digest] Sent to ${user.email}`);
          sentCount++;
        }

        // Rate limiting: small delay between emails
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (userError) {
        console.error(`[Weekly Digest] Error processing user ${user.id}:`, userError);
        errorCount++;
      }
    }

    console.log(`[Weekly Digest] Completed. Sent: ${sentCount}, Errors: ${errorCount}`);

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errorCount,
      totalUsers: usersToEmail.length,
    });

  } catch (error) {
    console.error("[Weekly Digest] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

