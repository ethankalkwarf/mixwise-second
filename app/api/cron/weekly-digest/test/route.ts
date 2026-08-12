/**
 * Weekly Digest Test/Dry-Run Endpoint
 *
 * GET /api/cron/weekly-digest/test - Dry run (no emails sent)
 * GET /api/cron/weekly-digest/test?send_to=your@email.com - Send only to specific email
 *
 * Requires Authorization: Bearer {CRON_SECRET}
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
import {
  buildCocktailIngredientMap,
  cocktailsUserCanMakeFromBar,
} from "@/lib/email/digest-matching";

interface UserForDigest {
  id: string;
  email: string;
  display_name: string | null;
  unsubscribe_token: string | null;
  weekly_digest: boolean | null;
  has_prefs: boolean;
  cocktails_can_make: number;
}

async function fetchCocktailIngredientMap(supabaseAdmin: ReturnType<typeof createAdminClient>) {
  const { data, error } = await (
    supabaseAdmin as unknown as {
      from: (table: string) => {
        select: (cols: string) => Promise<{
          data: Array<{
            cocktail_id: string;
            ingredient_id: number;
            is_optional?: boolean | null;
          }> | null;
          error: { message: string } | null;
        }>;
      };
    }
  )
    .from("cocktail_ingredients_uuid")
    .select("cocktail_id, ingredient_id, is_optional");

  if (error) {
    throw new Error(error.message);
  }

  const required = (data || []).filter((row) => !row.is_optional);
  return buildCocktailIngredientMap(required);
}

export async function GET(request: NextRequest) {
  if (!verifyInternalRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sendTo = searchParams.get("send_to");
  const dryRun = !sendTo;

  console.log(`[Weekly Digest Test] Mode: ${dryRun ? "DRY RUN" : `SEND TO ${sendTo}`}`);

  try {
    const supabaseAdmin = createAdminClient();

    const { data: usersWithPrefs, error: usersError } = await supabaseAdmin
      .from("profiles")
      .select(`
        id,
        email,
        display_name,
        created_at,
        email_preferences!left (
          user_id,
          weekly_digest,
          unsubscribed_all_at,
          unsubscribe_token,
          last_digest_sent_at
        )
      `)
      .not("email", "is", null)
      .order("created_at", { ascending: true });

    if (usersError) {
      return NextResponse.json(
        { error: "Failed to fetch users", details: usersError },
        { status: 500 }
      );
    }

    const userIds = (usersWithPrefs || []).map((u) => u.id);
    const { data: barIngredients } = await supabaseAdmin
      .from("bar_ingredients")
      .select("user_id, ingredient_id")
      .in("user_id", userIds);

    const userIngredients = new Map<string, string[]>();
    (barIngredients || []).forEach((bi) => {
      const existing = userIngredients.get(bi.user_id) || [];
      existing.push(String(bi.ingredient_id));
      userIngredients.set(bi.user_id, existing);
    });

    const { data: cocktails } = await supabaseAdmin
      .from("cocktails")
      .select("id, slug, name, short_description, image_url");

    const ingredientsByCocktail = await fetchCocktailIngredientMap(supabaseAdmin);

    const analysis: {
      wouldReceive: UserForDigest[];
      wouldSkip: { email: string; reason: string }[];
    } = {
      wouldReceive: [],
      wouldSkip: [],
    };

    for (const user of usersWithPrefs || []) {
      const prefs = Array.isArray(user.email_preferences)
        ? user.email_preferences[0]
        : user.email_preferences;

      if (prefs?.unsubscribed_all_at) {
        analysis.wouldSkip.push({ email: user.email!, reason: "unsubscribed_all" });
        continue;
      }

      if (prefs && prefs.weekly_digest === false) {
        analysis.wouldSkip.push({ email: user.email!, reason: "weekly_digest=false" });
        continue;
      }

      const ingredientIds = userIngredients.get(user.id) || [];
      const ready = cocktailsUserCanMakeFromBar(
        cocktails || [],
        ingredientIds,
        ingredientsByCocktail
      );

      analysis.wouldReceive.push({
        id: user.id,
        email: user.email!,
        display_name: user.display_name,
        unsubscribe_token: prefs?.unsubscribe_token || null,
        weekly_digest: prefs?.weekly_digest ?? null,
        has_prefs: !!prefs,
        cocktails_can_make: ready.length,
      });
    }

    let testEmailResult = null;
    if (sendTo) {
      const targetUser = analysis.wouldReceive.find(
        (u) => u.email.toLowerCase() === sendTo.toLowerCase()
      );

      if (!targetUser) {
        return NextResponse.json(
          {
            error: `User ${sendTo} not found in eligible recipients`,
            wouldReceive: analysis.wouldReceive.map((u) => u.email),
            wouldSkip: analysis.wouldSkip,
          },
          { status: 400 }
        );
      }

      if (!targetUser.unsubscribe_token) {
        return NextResponse.json(
          { error: `User ${sendTo} is missing an unsubscribe token` },
          { status: 400 }
        );
      }

      const ingredientIds = userIngredients.get(targetUser.id) || [];
      const cocktailsUserCanMake = cocktailsUserCanMakeFromBar(
        cocktails || [],
        ingredientIds,
        ingredientsByCocktail
      );

      const weekNumber = getWeekNumber();
      const featuredCocktail = cocktails?.[weekNumber % (cocktails?.length || 1)];
      const displayName =
        targetUser.display_name || targetUser.email.split("@")[0] || "Mixologist";
      const unsubscribeUrl = buildUserUnsubscribeUrl(targetUser.unsubscribe_token, "digest");
      const oneClickUnsubscribe = buildUserOneClickUnsubscribeUrl(
        targetUser.unsubscribe_token,
        "digest"
      );

      const emailTemplate = weeklyDigestTemplate({
        displayName,
        userEmail: targetUser.email,
        unsubscribeUrl,
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

      const resend = createResendClient();
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: MIXWISE_FROM_EMAIL,
        replyTo: "hello@getmixwise.com",
        to: targetUser.email,
        subject: `[TEST] ${emailTemplate.subject}`,
        html: emailTemplate.html,
        text: emailTemplate.text,
        headers: {
          "X-Entity-Ref-ID": targetUser.id,
          "List-Unsubscribe": `<${oneClickUnsubscribe}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
        tags: [
          { name: "category", value: "weekly_digest_test" },
          { name: "environment", value: process.env.NODE_ENV || "production" },
        ],
      });

      testEmailResult = {
        sent: !emailError,
        to: targetUser.email,
        resendId: emailData?.id,
        error: emailError?.message,
        cocktailsAvailable: cocktailsUserCanMake.length,
        barIngredients: ingredientIds.length,
        subject: `[TEST] ${emailTemplate.subject}`,
      };
    }

    return NextResponse.json({
      mode: dryRun ? "DRY_RUN" : "TEST_SEND",
      timestamp: new Date().toISOString(),
      summary: {
        totalUsersWithEmail: usersWithPrefs?.length || 0,
        wouldReceive: analysis.wouldReceive.length,
        wouldSkip: analysis.wouldSkip.length,
        cocktailIngredientLinks: [...ingredientsByCocktail.values()].reduce(
          (n, ids) => n + ids.length,
          0
        ),
      },
      wouldReceive: analysis.wouldReceive.map((u) => ({
        email: u.email,
        display_name: u.display_name,
        has_prefs: u.has_prefs,
        weekly_digest: u.weekly_digest,
        has_token: !!u.unsubscribe_token,
        cocktails_can_make: u.cocktails_can_make,
      })),
      wouldSkip: analysis.wouldSkip,
      testEmailResult,
    });
  } catch (error) {
    console.error("[Weekly Digest Test] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
