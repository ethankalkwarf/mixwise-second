import {
  almostThereDraftTemplate,
  fridayPersonalizedDraftTemplate,
} from "@/lib/email/campaigns";
import {
  accountUnsub,
  almostThereForBar,
  assertCampaignSendsReady,
  dispatchCampaignEmail,
  drinksYouCanMake,
  loadAccountRecipients,
  loadMatchIndex,
  tally,
  toCampaignDrink,
  utcDateKey,
  type SendResult,
} from "@/lib/email/campaign-runtime";
import { getSiteUrl } from "@/lib/site";
import { debugLog } from "@/lib/debugLog";

export async function runFridayPersonalized(options?: {
  dryRun?: boolean;
  now?: Date;
}): Promise<SendResult> {
  const now = options?.now || new Date();
  await assertCampaignSendsReady();
  const sendKey = utcDateKey(now);
  const siteUrl = getSiteUrl();
  const accounts = (await loadAccountRecipients()).filter(
    (user) => user.weeklyDigest && user.barCount > 0
  );
  const index = await loadMatchIndex();

  debugLog(`[Friday] ${sendKey} candidates=${accounts.length}`);

  const results: Array<"sent" | "skipped" | "error"> = [];
  for (const user of accounts) {
    const ready = drinksYouCanMake(user.ownedIngredientIds, index, user.skippedCocktailIds);
    const almost = almostThereForBar(user.ownedIngredientIds, index, 8, user.skippedCocktailIds);
    const unsub = accountUnsub(user.unsubscribeToken, "digest");

    if (!ready.length && !almost.length) {
      results.push("skipped");
      continue;
    }

    const template =
      ready.length === 0 && almost[0]
        ? almostThereDraftTemplate({
            displayName: user.displayName,
            userEmail: user.email,
            unsubscribeUrl: unsub.url,
            siteUrl,
            missingIngredient: almost[0].missingIngredient,
            unlockedCount: almost.length,
            drinks: almost.slice(0, 3),
          })
        : fridayPersonalizedDraftTemplate({
            displayName: user.displayName,
            userEmail: user.email,
            unsubscribeUrl: unsub.url,
            siteUrl,
            readyCount: ready.length,
            canMake: ready.slice(0, 5).map(toCampaignDrink),
            almostThere: almost.slice(0, 2),
          });

    results.push(
      await dispatchCampaignEmail({
        campaign: "friday-personalized",
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

  return tally(results);
}
