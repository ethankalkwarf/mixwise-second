import {
  thursdayFeaturedDraftTemplate,
  type CampaignDrink,
} from "@/lib/email/campaigns";
import {
  BLOCKED_THURSDAY_SLUGS,
  fallbackThursdaySlug,
  getThursdayIssue,
} from "@/lib/email/thursday-calendar";
import {
  accountUnsub,
  assertCampaignSendsReady,
  dispatchCampaignEmail,
  loadAccountRecipients,
  loadCocktailsBySlug,
  loadListRecipients,
  loadMatchIndex,
  drinksYouCanMake,
  listUnsub,
  tally,
  toCampaignDrink,
  utcDateKey,
  type SendResult,
} from "@/lib/email/campaign-runtime";
import { buildListConvertUrl } from "@/lib/email/newsletter-token";
import { getSiteUrl } from "@/lib/site";
import { debugLog } from "@/lib/debugLog";

export async function runThursdayFeatured(options?: {
  dryRun?: boolean;
  now?: Date;
}): Promise<SendResult & { featured?: string; list: SendResult; accounts: SendResult }> {
  const now = options?.now || new Date();
  await assertCampaignSendsReady();
  const sendKey = utcDateKey(now);
  const siteUrl = getSiteUrl();
  const issue = getThursdayIssue(now);

  const neededSlugs = issue
    ? [issue.featuredSlug, ...issue.relatedSlugs]
    : [fallbackThursdaySlug(now)];
  const catalog = await loadCocktailsBySlug(neededSlugs);

  let featured = issue ? catalog.get(issue.featuredSlug) : catalog.get(neededSlugs[0]);
  if (!featured || BLOCKED_THURSDAY_SLUGS.has(featured.slug)) {
    const fallback = await loadCocktailsBySlug([fallbackThursdaySlug(now), "daiquiri"]);
    featured = fallback.get(fallbackThursdaySlug(now)) || fallback.get("daiquiri");
  }
  if (!featured) {
    throw new Error("Thursday featured cocktail could not be loaded");
  }

  const related: CampaignDrink[] = (issue?.relatedSlugs || [])
    .map((slug) => catalog.get(slug))
    .filter((drink): drink is NonNullable<typeof drink> => Boolean(drink))
    .map(toCampaignDrink);

  const featuredDrink: CampaignDrink & { label?: string } = {
    ...toCampaignDrink(featured),
    label: issue?.featuredLabel || "Tonight",
  };

  const accounts = (await loadAccountRecipients()).filter((user) => user.weeklyDigest);
  const accountEmails = new Set(accounts.map((user) => user.email));
  const list = await loadListRecipients(accountEmails);
  const matchIndex = await loadMatchIndex();

  debugLog(
    `[Thursday] ${sendKey} featuring ${featured.name} (${issue ? "event" : "fallback"}) accounts=${accounts.length} list=${list.length}`
  );

  const accountResults: Array<"sent" | "skipped" | "error"> = [];
  for (const user of accounts) {
    const unsub = accountUnsub(user.unsubscribeToken, "digest");
    const canMake = drinksYouCanMake(user.ownedIngredientIds, matchIndex, user.skippedCocktailIds);
    const canMakeTonight = canMake.some((drink) => drink.slug === featured.slug);
    const template = thursdayFeaturedDraftTemplate({
      displayName: user.displayName,
      userEmail: user.email,
      unsubscribeUrl: unsub.url,
      siteUrl,
      headline: issue?.headline || featured.blurb || featured.name,
      intro: issue?.intro || featured.blurb || `This week's drink is the ${featured.name}.`,
      subject: issue?.subject,
      previewText: issue?.previewText,
      signoff: issue?.signoff || "Go put ice in something.",
      ctaLabel: issue?.ctaLabel || "Get the recipe",
      featured: featuredDrink,
      related,
      relatedHeading: issue?.relatedHeading,
      occasion: issue?.occasion,
      canMakeTonight,
      canMakeNote: canMakeTonight ? "You already have this. So... tonight?" : undefined,
    });

    accountResults.push(
      await dispatchCampaignEmail({
        campaign: "thursday-featured",
        audience: "account",
        email: user.email,
        userId: user.id,
        sendKey,
        template,
        unsubscribeUrl: unsub.url,
        oneClickUnsubscribeUrl: unsub.oneClick,
        dryRun: options?.dryRun,
      })
    );
  }

  const listResults: Array<"sent" | "skipped" | "error"> = [];
  for (const subscriber of list) {
    const unsub = listUnsub(subscriber.email, subscriber.source, siteUrl);
    const convertUrl = buildListConvertUrl(subscriber.email, subscriber.source, siteUrl);
    const template = thursdayFeaturedDraftTemplate({
      userEmail: subscriber.email,
      unsubscribeUrl: unsub.url,
      siteUrl,
      headline: issue?.headline || featured.blurb || featured.name,
      intro: issue?.intro || featured.blurb || `This week's drink is the ${featured.name}.`,
      subject: issue?.subject,
      previewText: issue?.previewText,
      signoff: issue?.signoff || "See you Thursday.",
      ctaLabel: issue?.ctaLabel || "Get the recipe",
      featured: featuredDrink,
      related,
      relatedHeading: issue?.relatedHeading,
      occasion: issue?.occasion,
      listConvertUrl: convertUrl,
    });

    listResults.push(
      await dispatchCampaignEmail({
        campaign: "thursday-featured",
        audience: "list",
        email: subscriber.email,
        sendKey,
        template,
        unsubscribeUrl: unsub.url,
        oneClickUnsubscribeUrl: unsub.oneClick,
        dryRun: options?.dryRun,
      })
    );
  }

  const accountsTally = tally(accountResults);
  const listTally = tally(listResults);
  return {
    featured: featured.name,
    accounts: accountsTally,
    list: listTally,
    sent: accountsTally.sent + listTally.sent,
    skipped: accountsTally.skipped + listTally.skipped,
    errors: accountsTally.errors + listTally.errors,
  };
}
