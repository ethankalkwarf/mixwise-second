/**
 * One-off: send REAL MixWise email templates (same HTML users get).
 * Usage: npx tsx scripts/send-real-email-proofs.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import {
  welcomeEmailTemplate,
  weeklyDigestTemplate,
  confirmEmailTemplate,
  resetPasswordTemplate,
} from "../lib/email/templates";
import {
  buildCocktailIngredientMap,
  cocktailsUserCanMakeFromBar,
} from "../lib/email/digest-matching";
import { getWeekNumber } from "../lib/email/featured-cocktail";

const TO = process.env.PROOF_TO || "ethankalkwarf@gmail.com";
const FROM = process.env.RESEND_FROM_EMAIL || "MixWise <hello@getmixwise.com>";

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY missing");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error("Supabase env missing");

  const resend = new Resend(apiKey);
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, display_name")
    .eq("email", TO)
    .single();

  const displayName = profile?.display_name || "Ethan";
  const unsubscribeUrl = "https://www.getmixwise.com/unsubscribe?token=proof-preview&type=all";
  const digestUnsub = "https://www.getmixwise.com/unsubscribe?token=proof-preview&type=digest";

  const { data: bar } = await supabase
    .from("bar_ingredients")
    .select("ingredient_id")
    .eq("user_id", profile!.id);
  const owned = (bar || []).map((b) => String(b.ingredient_id));

  const { data: cocktails } = await supabase
    .from("cocktails")
    .select("id, slug, name, short_description, image_url");

  const { data: links, error: linksError } = await (supabase as any)
    .from("cocktail_ingredients_uuid")
    .select("cocktail_id, ingredient_id, is_optional");
  if (linksError) throw new Error(linksError.message);

  const linkRows = (links || []) as Array<{
    cocktail_id: string;
    ingredient_id: number;
    is_optional?: boolean | null;
  }>;

  const map = buildCocktailIngredientMap(linkRows.filter((r) => !r.is_optional));
  const canMake = cocktailsUserCanMakeFromBar(cocktails || [], owned, map);
  const week = getWeekNumber();
  const featured = (cocktails || [])[week % Math.max((cocktails || []).length, 1)];

  const sends: Array<{ type: string; subject: string; id?: string; error?: string }> = [];

  async function send(type: string, subject: string, html: string, text: string, category: string) {
    const { data, error } = await resend.emails.send({
      from: FROM,
      replyTo: "hello@getmixwise.com",
      to: TO,
      subject: `[PROOF] ${subject}`,
      html,
      text,
      tags: [
        { name: "category", value: category },
        { name: "environment", value: "real_template_proof" },
        { name: "test", value: "true" },
      ],
    });
    sends.push({
      type,
      subject: `[PROOF] ${subject}`,
      id: data?.id,
      error: error?.message,
    });
  }

  const welcome = welcomeEmailTemplate({
    displayName,
    userEmail: TO,
    unsubscribeUrl,
  });
  await send("welcome", welcome.subject, welcome.html, welcome.text, "welcome");

  const digest = weeklyDigestTemplate({
    displayName,
    userEmail: TO,
    unsubscribeUrl: digestUnsub,
    cocktailsYouCanMake: canMake,
    featuredCocktail: featured
      ? {
          name: featured.name,
          slug: featured.slug,
          description: featured.short_description || undefined,
          imageUrl: featured.image_url || undefined,
        }
      : undefined,
    barIngredientCount: owned.length,
  });
  await send("weekly_digest", digest.subject, digest.html, digest.text, "weekly_digest");

  const confirm = confirmEmailTemplate({
    confirmUrl: "https://www.getmixwise.com/auth/callback?token=proof-preview",
    userEmail: TO,
  });
  await send("confirmation", confirm.subject, confirm.html, confirm.text, "account_confirmation");

  const reset = resetPasswordTemplate({
    resetUrl: "https://www.getmixwise.com/auth/callback?type=recovery&token=proof-preview",
    userEmail: TO,
  });
  await send("password_reset", reset.subject, reset.html, reset.text, "password_reset");

  console.log(
    JSON.stringify(
      {
        to: TO,
        canMake: canMake.length,
        featured: featured?.name,
        sends,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
