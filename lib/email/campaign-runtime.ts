/**
 * Shared catalog, audience, matching, and send helpers for the email program.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { createResendClient, MIXWISE_FROM_EMAIL } from "@/lib/email/resend";
import type { EmailTemplate } from "@/lib/email/templates";
import type { AlmostThereDrink, CampaignDrink } from "@/lib/email/campaigns";
import {
  buildUserOneClickUnsubscribeUrl,
  buildUserUnsubscribeUrl,
} from "@/lib/email/unsubscribe-urls";
import {
  buildNewsletterUnsubscribeApiUrl,
  buildNewsletterUnsubscribeUrl,
} from "@/lib/email/newsletter-token";
import { debugLog } from "@/lib/debugLog";
import { getSiteUrl } from "@/lib/site";

export type CampaignSlug =
  | "thursday-featured"
  | "friday-personalized"
  | "add-ingredients"
  | "activate-account"
  | "empty-bar-last"
  | "first-bar-payoff"
  | "list-convert"
  | "shopping-list"
  | "win-back"
  | "stale-bar"
  | "account-welcome";

export type ProgramCocktail = CampaignDrink & { id: string };

export type MatchIndex = {
  byId: Map<string, ProgramCocktail>;
  requiredByCocktail: Map<string, string[]>;
  ingredientNames: Map<string, string>;
};

export type AccountRecipient = {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  lastSignInAt: string | null;
  unsubscribeToken: string;
  weeklyDigest: boolean;
  barCount: number;
  barOldestAt: string | null;
  barNewestAt: string | null;
  ownedIngredientIds: string[];
  shoppingItems: string[];
  skippedCocktailIds: string[];
};

export type ListRecipient = {
  email: string;
  source: string;
  createdAt: string;
};

export type SendResult = { sent: number; skipped: number; errors: number };

const SEND_PAUSE_MS = 80;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function utcDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function daysBetween(fromIso: string, now = new Date()): number {
  const from = new Date(fromIso).getTime();
  return Math.floor((now.getTime() - from) / 86400000);
}

export function toCampaignDrink(cocktail: ProgramCocktail): CampaignDrink {
  return {
    name: cocktail.name,
    slug: cocktail.slug,
    blurb: cocktail.blurb,
    imageUrl: cocktail.imageUrl,
    imageAlt: cocktail.imageAlt,
  };
}

export async function assertCampaignSendsReady(): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("email_campaign_sends").select("id").limit(1);
  if (error) {
    throw new Error(
      `email_campaign_sends is not ready (${error.message}). Apply supabase/migrations/20260814230125_email_campaign_sends.sql before sending.`
    );
  }
}

export async function hasCampaignSend(
  campaign: CampaignSlug,
  email: string,
  sendKey: string
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("email_campaign_sends")
    .select("id")
    .eq("campaign", campaign)
    .eq("recipient_email", email.trim().toLowerCase())
    .eq("send_key", sendKey)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("[Email program] hasCampaignSend failed:", error);
  }
  return Boolean(data?.id);
}

export async function recordCampaignSend(input: {
  campaign: CampaignSlug;
  audience: "account" | "list";
  email: string;
  sendKey: string;
  userId?: string | null;
  resendId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("email_campaign_sends").insert({
    campaign: input.campaign,
    audience: input.audience,
    recipient_email: input.email.trim().toLowerCase(),
    send_key: input.sendKey,
    user_id: input.userId || null,
    resend_id: input.resendId || null,
    metadata: (input.metadata ?? {}) as { [key: string]: string | number | boolean | null },
  });

  if (error && error.code !== "23505") {
    console.error("[Email program] recordCampaignSend failed:", error);
  }
}

export async function recentCampaignsForEmail(
  email: string,
  sinceIso: string
): Promise<Set<string>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("email_campaign_sends")
    .select("campaign")
    .eq("recipient_email", email.trim().toLowerCase())
    .gte("sent_at", sinceIso);

  if (error) {
    console.error("[Email program] recentCampaignsForEmail failed:", error);
    return new Set();
  }
  return new Set((data || []).map((row) => row.campaign));
}

export async function loadCocktailsBySlug(slugs: string[]): Promise<Map<string, ProgramCocktail>> {
  const unique = [...new Set(slugs.filter(Boolean))];
  const map = new Map<string, ProgramCocktail>();
  if (!unique.length) return map;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("cocktails")
    .select("id, slug, name, short_description, image_url, image_alt")
    .in("slug", unique);

  if (error) {
    console.error("[Email program] loadCocktailsBySlug failed:", error);
    return map;
  }

  for (const row of data || []) {
    map.set(row.slug, {
      id: row.id,
      slug: row.slug,
      name: row.name,
      blurb: row.short_description || undefined,
      imageUrl: row.image_url || undefined,
      imageAlt: row.image_alt || row.name,
    });
  }
  return map;
}

export async function loadMatchIndex(): Promise<MatchIndex> {
  const supabase = createAdminClient();
  const { data: cocktails, error: cocktailError } = await supabase
    .from("cocktails")
    .select("id, slug, name, short_description, image_url, image_alt");

  if (cocktailError) {
    console.error("[Email program] loadMatchIndex cocktails failed:", cocktailError);
  }

  const byId = new Map<string, ProgramCocktail>();
  for (const row of cocktails || []) {
    byId.set(row.id, {
      id: row.id,
      slug: row.slug,
      name: row.name,
      blurb: row.short_description || undefined,
      imageUrl: row.image_url || undefined,
      imageAlt: row.image_alt || row.name,
    });
  }

  const { data: links, error: linkError } = await (
    supabase as unknown as {
      from: (table: string) => {
        select: (cols: string) => Promise<{
          data: Array<{
            cocktail_id: string;
            ingredient_id: string;
            is_optional?: boolean | null;
          }> | null;
          error: { message: string } | null;
        }>;
      };
    }
  )
    .from("cocktail_ingredients_uuid")
    .select("cocktail_id, ingredient_id, is_optional");

  if (linkError) {
    console.error("[Email program] loadMatchIndex links failed:", linkError);
  }

  const requiredByCocktail = new Map<string, string[]>();
  const ingredientIds = new Set<string>();
  for (const row of links || []) {
    if (row.is_optional) continue;
    const cocktailId = String(row.cocktail_id);
    const ingredientId = String(row.ingredient_id);
    ingredientIds.add(ingredientId);
    const existing = requiredByCocktail.get(cocktailId) || [];
    existing.push(ingredientId);
    requiredByCocktail.set(cocktailId, existing);
  }

  const ingredientNames = new Map<string, string>();
  const idList = [...ingredientIds];
  const chunk = 500;
  for (let i = 0; i < idList.length; i += chunk) {
    const slice = idList.slice(i, i + chunk);
    const { data: ingredients, error: ingError } = await supabase
      .from("ingredients")
      .select("id, name")
      .in("id", slice);
    if (ingError) {
      console.error("[Email program] loadMatchIndex ingredients failed:", ingError);
      continue;
    }
    for (const ingredient of ingredients || []) {
      ingredientNames.set(ingredient.id, ingredient.name);
    }
  }

  return { byId, requiredByCocktail, ingredientNames };
}

export function drinksYouCanMake(
  ownedIds: string[],
  index: MatchIndex,
  excludeCocktailIds?: Iterable<string>
): ProgramCocktail[] {
  const owned = new Set(ownedIds.map(String));
  const excluded = excludeCocktailIds
    ? new Set(Array.from(excludeCocktailIds, String))
    : null;
  const ready: ProgramCocktail[] = [];
  for (const [cocktailId, required] of index.requiredByCocktail) {
    if (excluded?.has(cocktailId)) continue;
    if (!required.length) continue;
    if (!required.every((id) => owned.has(id))) continue;
    const cocktail = index.byId.get(cocktailId);
    if (cocktail) ready.push(cocktail);
  }
  return ready;
}

export function almostThereForBar(
  ownedIds: string[],
  index: MatchIndex,
  limit = 2,
  excludeCocktailIds?: Iterable<string>
): AlmostThereDrink[] {
  const owned = new Set(ownedIds.map(String));
  const excluded = excludeCocktailIds
    ? new Set(Array.from(excludeCocktailIds, String))
    : null;
  const byMissing = new Map<string, ProgramCocktail[]>();

  for (const [cocktailId, required] of index.requiredByCocktail) {
    if (excluded?.has(cocktailId)) continue;
    const missing = required.filter((id) => !owned.has(id));
    if (missing.length !== 1) continue;
    const cocktail = index.byId.get(cocktailId);
    if (!cocktail) continue;
    const missingId = missing[0];
    const list = byMissing.get(missingId) || [];
    list.push(cocktail);
    byMissing.set(missingId, list);
  }

  const ranked = [...byMissing.entries()].sort((a, b) => b[1].length - a[1].length);
  const top = ranked[0];
  if (!top) return [];

  const [missingId, drinks] = top;
  const missingName = index.ingredientNames.get(missingId) || "one bottle";
  return drinks.slice(0, limit).map((drink) => ({
    ...toCampaignDrink(drink),
    missingIngredient: missingName,
  }));
}

export async function loadAccountRecipients(): Promise<AccountRecipient[]> {
  const supabase = createAdminClient();

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, display_name, created_at")
    .not("email", "is", null);

  if (profileError) {
    throw new Error(`Failed to load profiles: ${profileError.message}`);
  }

  const users = (profiles || []).filter((row): row is typeof row & { email: string } =>
    Boolean(row.email)
  );
  if (!users.length) return [];

  const userIds = users.map((u) => u.id);

  const { data: prefsRows, error: prefsError } = await supabase
    .from("email_preferences")
    .select("user_id, weekly_digest, unsubscribe_token, unsubscribed_all_at, welcome_emails")
    .in("user_id", userIds);

  if (prefsError) {
    throw new Error(`Failed to load email preferences: ${prefsError.message}`);
  }

  const prefsByUser = new Map((prefsRows || []).map((row) => [row.user_id, row]));

  const { data: barRows, error: barError } = await supabase
    .from("bar_ingredients")
    .select("user_id, ingredient_id, created_at")
    .in("user_id", userIds);

  if (barError) {
    console.error("[Email program] bar_ingredients failed:", barError);
  }

  const barByUser = new Map<
    string,
    { ids: string[]; oldest: string | null; newest: string | null }
  >();
  for (const row of barRows || []) {
    const current = barByUser.get(row.user_id) || { ids: [], oldest: null, newest: null };
    current.ids.push(String(row.ingredient_id));
    if (!current.oldest || row.created_at < current.oldest) current.oldest = row.created_at;
    if (!current.newest || row.created_at > current.newest) current.newest = row.created_at;
    barByUser.set(row.user_id, current);
  }

  const { data: listRows, error: listError } = await supabase
    .from("shopping_list")
    .select("user_id, ingredient_name, is_checked")
    .in("user_id", userIds)
    .eq("is_checked", false);

  if (listError) {
    console.error("[Email program] shopping_list failed:", listError);
  }

  const shoppingByUser = new Map<string, string[]>();
  for (const row of listRows || []) {
    const items = shoppingByUser.get(row.user_id) || [];
    if (row.ingredient_name) items.push(row.ingredient_name);
    shoppingByUser.set(row.user_id, items);
  }

  const { data: skipRows, error: skipError } = await supabase
    .from("cocktail_skips")
    .select("user_id, cocktail_id")
    .in("user_id", userIds);

  if (skipError) {
    console.error("[Email program] cocktail_skips failed:", skipError);
  }

  const skipsByUser = new Map<string, string[]>();
  for (const row of skipRows || []) {
    const items = skipsByUser.get(row.user_id) || [];
    items.push(String(row.cocktail_id));
    skipsByUser.set(row.user_id, items);
  }

  const lastSignIn = await loadLastSignInMap();

  const recipients: AccountRecipient[] = [];
  for (const user of users) {
    const prefs = prefsByUser.get(user.id);
    if (prefs?.unsubscribed_all_at) continue;

    let unsubscribeToken = prefs?.unsubscribe_token;
    if (!unsubscribeToken) {
      const { data: created } = await supabase
        .from("email_preferences")
        .insert({ user_id: user.id })
        .select("unsubscribe_token")
        .single();
      unsubscribeToken = created?.unsubscribe_token;
    }
    if (!unsubscribeToken) continue;

    const bar = barByUser.get(user.id);
    recipients.push({
      id: user.id,
      email: user.email.trim().toLowerCase(),
      displayName: user.display_name || user.email.split("@")[0] || "there",
      createdAt: user.created_at,
      lastSignInAt: lastSignIn.get(user.id) || null,
      unsubscribeToken,
      weeklyDigest: prefs?.weekly_digest !== false,
      barCount: bar?.ids.length || 0,
      barOldestAt: bar?.oldest || null,
      barNewestAt: bar?.newest || null,
      ownedIngredientIds: bar?.ids || [],
      shoppingItems: shoppingByUser.get(user.id) || [],
      skippedCocktailIds: skipsByUser.get(user.id) || [],
    });
  }

  return recipients;
}

async function loadLastSignInMap(): Promise<Map<string, string | null>> {
  const supabase = createAdminClient();
  const map = new Map<string, string | null>();
  let page = 1;
  const perPage = 1000;

  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error("[Email program] listUsers failed:", error);
      break;
    }
    const users = data?.users || [];
    for (const user of users) {
      map.set(user.id, user.last_sign_in_at || null);
    }
    if (users.length < perPage) break;
    page += 1;
  }

  return map;
}

export async function loadListRecipients(excludeEmails: Set<string>): Promise<ListRecipient[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("email_signups")
    .select("email, source, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load email signups: ${error.message}`);
  }

  const byEmail = new Map<string, ListRecipient>();
  for (const row of data || []) {
    const email = row.email.trim().toLowerCase();
    if (excludeEmails.has(email) || byEmail.has(email)) continue;
    byEmail.set(email, {
      email,
      source: row.source || "homepage",
      createdAt: row.created_at,
    });
  }
  return [...byEmail.values()];
}

export async function dispatchCampaignEmail(input: {
  campaign: CampaignSlug;
  audience: "account" | "list";
  email: string;
  userId?: string | null;
  sendKey: string;
  template: EmailTemplate;
  unsubscribeUrl: string;
  oneClickUnsubscribeUrl: string;
  dryRun?: boolean;
  extraTags?: Array<{ name: string; value: string }>;
}): Promise<"sent" | "skipped" | "error"> {
  const email = input.email.trim().toLowerCase();
  if (await hasCampaignSend(input.campaign, email, input.sendKey)) {
    return "skipped";
  }

  if (input.dryRun) {
    debugLog(`[Email program] dry-run ${input.campaign} → ${email}`);
    return "sent";
  }

  try {
    const resend = createResendClient();
    const { data, error } = await resend.emails.send({
      from: MIXWISE_FROM_EMAIL,
      replyTo: "hello@getmixwise.com",
      to: email,
      subject: input.template.subject,
      html: input.template.html,
      text: input.template.text,
      headers: {
        ...(input.userId ? { "X-Entity-Ref-ID": input.userId } : {}),
        "List-Unsubscribe": `<${input.oneClickUnsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      tags: [
        { name: "category", value: input.campaign },
        { name: "audience", value: input.audience },
        { name: "environment", value: process.env.NODE_ENV || "production" },
        ...(input.extraTags || []),
      ],
    });

    if (error) {
      console.error(`[Email program] send failed ${input.campaign} → ${email}:`, error);
      return "error";
    }

    await recordCampaignSend({
      campaign: input.campaign,
      audience: input.audience,
      email,
      sendKey: input.sendKey,
      userId: input.userId,
      resendId: data?.id || null,
    });
    await sleep(SEND_PAUSE_MS);
    return "sent";
  } catch (error) {
    console.error(`[Email program] send exception ${input.campaign} → ${email}:`, error);
    return "error";
  }
}

export function accountUnsub(token: string, type: "digest" | "all" | "welcome" = "digest") {
  return {
    url: buildUserUnsubscribeUrl(token, type),
    oneClick: buildUserOneClickUnsubscribeUrl(token, type),
  };
}

export function listUnsub(email: string, source: string, siteUrl = getSiteUrl()) {
  return {
    url: buildNewsletterUnsubscribeUrl(email, source, siteUrl),
    oneClick: buildNewsletterUnsubscribeApiUrl(email, source, siteUrl),
  };
}

export function tally(results: Array<"sent" | "skipped" | "error">): SendResult {
  return {
    sent: results.filter((r) => r === "sent").length,
    skipped: results.filter((r) => r === "skipped").length,
    errors: results.filter((r) => r === "error").length,
  };
}
