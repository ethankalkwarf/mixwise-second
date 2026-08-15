import { config } from "dotenv";
config({ path: ".env.local" });
import { mkdirSync, writeFileSync } from "fs";
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
import { buildEmailDrafts, collectDraftImageSlugs } from "../lib/email/drafts";

const TO = "ethankalkwarf@gmail.com";

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("email", TO)
    .single();
  const displayName = profile?.display_name || "Ethan";
  const { data: bar } = await supabase
    .from("bar_ingredients")
    .select("ingredient_id")
    .eq("user_id", profile!.id);
  const owned = (bar || []).map((b) => String(b.ingredient_id));
  const { data: cocktails } = await supabase
    .from("cocktails")
    .select("id, slug, name, short_description, image_url");
  const { data: links } = await (supabase as any)
    .from("cocktail_ingredients_uuid")
    .select("cocktail_id, ingredient_id, is_optional");
  const map = buildCocktailIngredientMap(
    (links || []).filter((r: any) => !r.is_optional)
  );
  const canMake = cocktailsUserCanMakeFromBar(cocktails || [], owned, map);
  const week = getWeekNumber();
  const featured = (cocktails || [])[week % (cocktails || []).length];

  mkdirSync("tmp/email-proofs", { recursive: true });
  const welcome = welcomeEmailTemplate({
    displayName,
    userEmail: TO,
    unsubscribeUrl: "https://www.getmixwise.com/unsubscribe?token=proof&type=all",
  });
  const digest = weeklyDigestTemplate({
    displayName,
    userEmail: TO,
    unsubscribeUrl: "https://www.getmixwise.com/unsubscribe?token=proof&type=digest",
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
  const confirm = confirmEmailTemplate({
    confirmUrl: "https://www.getmixwise.com/auth/callback?token=proof",
    userEmail: TO,
  });
  const reset = resetPasswordTemplate({
    resetUrl: "https://www.getmixwise.com/auth/callback?type=recovery&token=proof",
    userEmail: TO,
  });

  writeFileSync("tmp/email-proofs/welcome.html", welcome.html);
  writeFileSync("tmp/email-proofs/weekly-digest.html", digest.html);
  writeFileSync("tmp/email-proofs/confirmation.html", confirm.html);
  writeFileSync("tmp/email-proofs/password-reset.html", reset.html);

  const catalogImages: Record<string, string> = {};
  const wanted = new Set(collectDraftImageSlugs());
  for (const cocktail of cocktails || []) {
    if (wanted.has(cocktail.slug) && cocktail.image_url) {
      catalogImages[cocktail.slug] = cocktail.image_url;
    }
  }
  const campaignDrafts = buildEmailDrafts(catalogImages);
  const draftFiles = campaignDrafts.map((draft) => {
    const file = `tmp/email-proofs/${draft.slug}.html`;
    writeFileSync(file, draft.html);
    return file;
  });

  console.log(
    JSON.stringify(
      {
        subjects: [welcome.subject, digest.subject, confirm.subject, reset.subject],
        canMake: canMake.length,
        files: [
          "tmp/email-proofs/welcome.html",
          "tmp/email-proofs/weekly-digest.html",
          "tmp/email-proofs/confirmation.html",
          "tmp/email-proofs/password-reset.html",
          ...draftFiles,
        ],
      },
      null,
      2
    )
  );
}

main();
