import {
  activateAccountDraftTemplate,
  addIngredientsDraftTemplate,
  emptyBarLastNudgeDraftTemplate,
  firstBarPayoffDraftTemplate,
  listConvertFollowUpDraftTemplate,
  shoppingListReminderDraftTemplate,
  staleBarDraftTemplate,
  winBackDraftTemplate,
} from "@/lib/email/campaigns";
import {
  accountUnsub,
  assertCampaignSendsReady,
  countCampaignSends,
  daysBetween,
  dispatchCampaignEmail,
  drinksYouCanMake,
  hasCampaignSend,
  listUnsub,
  loadAccountRecipients,
  loadCocktailsBySlug,
  loadListRecipients,
  loadMatchIndex,
  recentCampaignsForEmail,
  tally,
  toCampaignDrink,
  utcDateKey,
  type AccountRecipient,
  type SendResult,
} from "@/lib/email/campaign-runtime";
import { buildListConvertUrl } from "@/lib/email/newsletter-token";
import { buildSafeAuthUrl } from "@/lib/email/auth-links";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthCallbackUrl, getSiteUrl } from "@/lib/site";
import { debugLog } from "@/lib/debugLog";

const ONCE = "once";
const HERO_SLUGS = ["daiquiri", "whiskey-smash", "paloma", "last-word", "negroni"];

function startOfUtcWeek(now: Date): string {
  const day = now.getUTCDay();
  const offset = day === 0 ? 6 : day - 1;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset));
  return monday.toISOString();
}

function neverReallySignedIn(user: AccountRecipient): boolean {
  if (!user.lastSignInAt) return true;
  const created = new Date(user.createdAt).getTime();
  const signedIn = new Date(user.lastSignInAt).getTime();
  return signedIn - created < 60 * 60 * 1000;
}

async function magicLinkFor(email: string): Promise<string | null> {
  const supabase = createAdminClient();
  const redirectTo = `${getAuthCallbackUrl()}?next=${encodeURIComponent("/dashboard")}`;
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });
  if (error || !data?.properties?.action_link) {
    console.error("[Lifecycle] generateLink failed:", error);
    return null;
  }
  return buildSafeAuthUrl(data.properties.action_link);
}

export async function runEmailLifecycle(options?: {
  dryRun?: boolean;
  now?: Date;
}): Promise<SendResult & { byCampaign: Record<string, SendResult> }> {
  const now = options?.now || new Date();
  await assertCampaignSendsReady();
  const utcDay = now.getUTCDay();
  const empty: SendResult = { sent: 0, skipped: 0, errors: 0 };
  const byCampaign: Record<string, SendResult> = {};

  if (utcDay === 4 || utcDay === 5) {
    debugLog("[Lifecycle] Skipping Thursday/Friday so weekly sends stay the cap");
    return { ...empty, byCampaign };
  }

  const siteUrl = getSiteUrl();
  const weekStart = startOfUtcWeek(now);
  const heroes = await loadCocktailsBySlug(HERO_SLUGS);
  const daiquiri = heroes.get("daiquiri");
  const smash = heroes.get("whiskey-smash");
  const paloma = heroes.get("paloma");
  const lastWord = heroes.get("last-word");
  const index = await loadMatchIndex();
  const accounts = await loadAccountRecipients();
  const accountEmails = new Set(accounts.map((user) => user.email));
  const list = await loadListRecipients(accountEmails);

  const results: Array<"sent" | "skipped" | "error"> = [];

  const mark = (campaign: string, result: "sent" | "skipped" | "error") => {
    results.push(result);
    const current = byCampaign[campaign] || { sent: 0, skipped: 0, errors: 0 };
    if (result === "sent") current.sent += 1;
    if (result === "skipped") current.skipped += 1;
    if (result === "error") current.errors += 1;
    byCampaign[campaign] = current;
  };

  for (const user of accounts) {
    if (!user.marketingEmails) continue;

    const recent = await recentCampaignsForEmail(user.email, weekStart);
    const marketingThisWeek = [...recent].filter(
      (campaign) => campaign === "thursday-featured" || campaign === "friday-personalized"
    ).length;
    const unsub = accountUnsub(user.unsubscribeToken, "digest");
    const ageDays = daysBetween(user.createdAt, now);
    const ready = drinksYouCanMake(user.ownedIngredientIds, index, user.skippedCocktailIds);
    const readyDrinks = ready.slice(0, 4).map(toCampaignDrink);

    const send = async (
      campaign: Parameters<typeof dispatchCampaignEmail>[0]["campaign"],
      template: Parameters<typeof dispatchCampaignEmail>[0]["template"],
      sendKey = ONCE
    ) => {
      const result = await dispatchCampaignEmail({
        campaign,
        audience: "account",
        email: user.email,
        userId: user.id,
        sendKey,
        template,
        unsubscribeUrl: unsub.url,
        oneClickUnsubscribeUrl: unsub.oneClick,
        dryRun: options?.dryRun,
      });
      mark(campaign, result);
      return result === "sent";
    };

    if (
      user.barCount > 0 &&
      user.barOldestAt &&
      daysBetween(user.barOldestAt, now) <= 7 &&
      readyDrinks.length > 0 &&
      !(await hasCampaignSend("first-bar-payoff", user.email, ONCE))
    ) {
      await send(
        "first-bar-payoff",
        firstBarPayoffDraftTemplate({
          displayName: user.displayName,
          userEmail: user.email,
          unsubscribeUrl: unsub.url,
          siteUrl,
          readyCount: ready.length,
          drinks: readyDrinks,
        })
      );
      continue;
    }

    // Shopping list: Saturdays, ≥28 days apart, max 2 lifetime (2nd uses follow-up copy).
    if (utcDay === 6 && user.shoppingItems.length > 0) {
      const priorSends = await countCampaignSends("shopping-list", user.email);
      if (priorSends < 2) {
        const monthAgo = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 28)
        );
        const recentMonth = await recentCampaignsForEmail(user.email, monthAgo.toISOString());
        if (!recentMonth.has("shopping-list")) {
          const highlightDrink = paloma ? toCampaignDrink(paloma) : readyDrinks[0];
          const variant = priorSends === 0 ? 1 : 2;
          await send(
            "shopping-list",
            shoppingListReminderDraftTemplate({
              displayName: user.displayName,
              userEmail: user.email,
              unsubscribeUrl: unsub.url,
              siteUrl,
              items: user.shoppingItems.slice(0, 8),
              highlight: highlightDrink
                ? { drink: highlightDrink, missingItem: user.shoppingItems[0] }
                : undefined,
              variant,
            }),
            utcDateKey(now)
          );
          continue;
        }
      }
    }

    if (marketingThisWeek >= 2) continue;

    if (
      user.barCount === 0 &&
      ageDays >= 2 &&
      ageDays <= 4 &&
      !neverReallySignedIn(user) &&
      !(await hasCampaignSend("add-ingredients", user.email, ONCE))
    ) {
      await send(
        "add-ingredients",
        addIngredientsDraftTemplate({
          displayName: user.displayName,
          userEmail: user.email,
          unsubscribeUrl: unsub.url,
          siteUrl,
          hero: smash ? toCampaignDrink(smash) : daiquiri ? toCampaignDrink(daiquiri) : undefined,
        })
      );
      continue;
    }

    if (
      user.barCount === 0 &&
      ageDays >= 5 &&
      ageDays <= 8 &&
      neverReallySignedIn(user) &&
      !(await hasCampaignSend("activate-account", user.email, ONCE))
    ) {
      const setupUrl = await magicLinkFor(user.email);
      if (!setupUrl) {
        mark("activate-account", "error");
        continue;
      }
      await send(
        "activate-account",
        activateAccountDraftTemplate({
          displayName: user.displayName,
          userEmail: user.email,
          unsubscribeUrl: unsub.url,
          siteUrl,
          setupUrl,
          hero: daiquiri ? toCampaignDrink(daiquiri) : undefined,
        })
      );
      continue;
    }

    if (
      user.barCount === 0 &&
      ageDays >= 10 &&
      ageDays <= 16 &&
      !neverReallySignedIn(user) &&
      !(await hasCampaignSend("empty-bar-last", user.email, ONCE))
    ) {
      await send(
        "empty-bar-last",
        emptyBarLastNudgeDraftTemplate({
          displayName: user.displayName,
          userEmail: user.email,
          unsubscribeUrl: unsub.url,
          siteUrl,
          hero: paloma ? toCampaignDrink(paloma) : daiquiri ? toCampaignDrink(daiquiri) : undefined,
        })
      );
      continue;
    }

    const inactiveDays = user.lastSignInAt ? daysBetween(user.lastSignInAt, now) : ageDays;
    if (
      user.barCount > 0 &&
      inactiveDays >= 30 &&
      inactiveDays <= 45 &&
      readyDrinks.length > 0 &&
      !(await hasCampaignSend("win-back", user.email, ONCE))
    ) {
      await send(
        "win-back",
        winBackDraftTemplate({
          displayName: user.displayName,
          userEmail: user.email,
          unsubscribeUrl: unsub.url,
          siteUrl,
          drinks: readyDrinks.length ? readyDrinks : lastWord ? [toCampaignDrink(lastWord)] : [],
        })
      );
      continue;
    }

    if (
      user.barCount > 0 &&
      user.barNewestAt &&
      daysBetween(user.barNewestAt, now) >= 45 &&
      daysBetween(user.barNewestAt, now) <= 60 &&
      inactiveDays < 30 &&
      !(await hasCampaignSend("stale-bar", user.email, ONCE))
    ) {
      await send(
        "stale-bar",
        staleBarDraftTemplate({
          displayName: user.displayName,
          userEmail: user.email,
          unsubscribeUrl: unsub.url,
          siteUrl,
          barCount: user.barCount,
          drinks: readyDrinks,
        })
      );
    }
  }

  for (const subscriber of list) {
    const ageDays = daysBetween(subscriber.createdAt, now);
    if (ageDays < 7 || ageDays > 14) continue;
    if (await hasCampaignSend("list-convert", subscriber.email, ONCE)) continue;

    const unsub = listUnsub(subscriber.email, subscriber.source, siteUrl);
    const convertUrl = buildListConvertUrl(subscriber.email, subscriber.source, siteUrl);
    const result = await dispatchCampaignEmail({
      campaign: "list-convert",
      audience: "list",
      email: subscriber.email,
      sendKey: ONCE,
      template: listConvertFollowUpDraftTemplate({
        userEmail: subscriber.email,
        convertUrl,
        unsubscribeUrl: unsub.url,
        siteUrl,
        hero: daiquiri ? toCampaignDrink(daiquiri) : undefined,
      }),
      unsubscribeUrl: unsub.url,
      oneClickUnsubscribeUrl: unsub.oneClick,
      dryRun: options?.dryRun,
    });
    mark("list-convert", result);
  }

  return { ...tally(results), byCampaign };
}
