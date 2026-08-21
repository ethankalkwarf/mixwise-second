/**
 * Marketing campaign email templates used by /dev/email-drafts and the cron program.
 */

import type { EmailTemplate } from "@/lib/email/templates";
import { emailPad, escapeEmailHtml } from "@/lib/email/templates";
import {
  MIXWISE_EMAIL_SITE,
  bodyHtml,
  cocktailUrl,
  convertCardHtml,
  creamDrinkHtml,
  drinkListHtml,
  forestHeroHtml,
  greetingHtml,
  mutedHtml,
  occasionUrl,
  primaryCtaHtml,
  signoffHtml,
  signoffText,
  stepsHtml,
  wrapMarketingEmail,
} from "@/lib/email/layout";

export type CampaignDrink = {
  name: string;
  slug: string;
  blurb?: string;
  imageUrl?: string;
  imageAlt?: string;
};

export type AlmostThereDrink = CampaignDrink & {
  missingIngredient: string;
};

export type CampaignBase = {
  displayName?: string;
  userEmail: string;
  unsubscribeUrl: string;
  siteUrl?: string;
};

function firstName(displayName?: string): string {
  const name = displayName?.trim().split(/\s+/)[0];
  return name || "there";
}

function hrefFor(drink: CampaignDrink, siteUrl: string): string {
  return cocktailUrl(drink.slug, siteUrl);
}

function asThumb(drink: CampaignDrink, siteUrl: string, blurb?: string) {
  return {
    name: drink.name,
    blurb: blurb ?? drink.blurb,
    href: hrefFor(drink, siteUrl),
    imageUrl: drink.imageUrl,
    imageAlt: drink.imageAlt || drink.name,
  };
}

function textDrinkList(drinks: CampaignDrink[], siteUrl: string): string {
  return drinks
    .map((drink) => `  • ${drink.name}${drink.blurb ? `: ${drink.blurb}` : ""}\n    ${hrefFor(drink, siteUrl)}`)
    .join("\n");
}

function wrap(
  subject: string,
  previewText: string,
  body: string,
  text: string,
  base: CampaignBase
): EmailTemplate {
  const siteUrl = base.siteUrl || MIXWISE_EMAIL_SITE;
  return {
    subject,
    html: wrapMarketingEmail({
      title: subject,
      previewText,
      bodyHtml: body,
      userEmail: base.userEmail,
      unsubscribeUrl: base.unsubscribeUrl,
      siteUrl,
    }),
    text,
  };
}

/** Account welcome. One job: add what's in the cabinet. */
export function accountWelcomeDraftTemplate({
  displayName,
  userEmail,
  unsubscribeUrl,
  hero,
  siteUrl = MIXWISE_EMAIL_SITE,
}: CampaignBase & { hero?: CampaignDrink }): EmailTemplate {
  const name = firstName(displayName);
  const subject = "Add your bottles. We'll show you what to make.";
  const previewText = "Add what's in the cabinet. MixWise will show you the drinks those bottles already make.";
  const mixUrl = `${siteUrl}/mix`;

  const body = `
    ${greetingHtml(`Add what's in your cabinet, ${escapeEmailHtml(name)}.`)}
    ${bodyHtml("Your account is ready. MixWise only works once it knows the bottles you already own.")}
    ${stepsHtml([
      { n: "1", title: "Add your bottles", body: "Gin, whiskey, citrus. Whatever is actually there." },
      { n: "2", title: "See what you can make", body: "Every recipe matched to your shelf." },
      { n: "3", title: "Pick one tonight", body: "No extra store run required." },
    ])}
    ${
      hero
        ? forestHeroHtml({
            label: "Waiting on your shelf",
            name: hero.name,
            blurb: hero.blurb,
            href: hrefFor(hero, siteUrl),
            imageUrl: hero.imageUrl,
            imageAlt: hero.imageAlt,
            ctaLabel: "See the recipe",
          })
        : ""
    }
    ${primaryCtaHtml(mixUrl, "Add my bottles")}
    ${signoffHtml("Glad you showed up.")}
  `;

  const text = `
Add what's in your cabinet, ${name}.

Your account is ready. MixWise only works once it knows the bottles you already own.

1. Add your bottles
2. See what you can make
3. Pick one tonight

${hero ? `${hero.name}: ${hrefFor(hero, siteUrl)}\n` : ""}
Add my bottles: ${mixUrl}

${signoffText("Glad you showed up.")}
  `.trim();

  return wrap(subject, previewText, body, text, { userEmail, unsubscribeUrl, siteUrl });
}

/** Day 2. Signed in, bar still empty. */
export function addIngredientsDraftTemplate({
  displayName,
  userEmail,
  unsubscribeUrl,
  hero,
  siteUrl = MIXWISE_EMAIL_SITE,
}: CampaignBase & { hero?: CampaignDrink }): EmailTemplate {
  const name = firstName(displayName);
  const subject = "Your MixWise bar is still empty";
  const previewText = "Add the bottles you already own so MixWise can show you drinks you can actually make.";
  const mixUrl = `${siteUrl}/mix`;

  const body = `
    ${greetingHtml("Your bar is still empty.")}
    ${bodyHtml(`You have an account, ${escapeEmailHtml(name)}. MixWise is guessing until you add what's on the shelf, and it is terrible at guessing.`)}
    ${bodyHtml("Add what's on the shelf. MixWise will show you the drinks it already makes.")}
    ${
      hero
        ? creamDrinkHtml({
            label: "A drink like this, from bottles you already own",
            name: hero.name,
            blurb: hero.blurb,
            href: hrefFor(hero, siteUrl),
            imageUrl: hero.imageUrl,
            imageAlt: hero.imageAlt,
          })
        : ""
    }
    ${primaryCtaHtml(mixUrl, "Add my bottles")}
    ${signoffHtml()}
  `;

  const text = `
Your bar is still empty.

You have an account, ${name}. MixWise is guessing until you add what's on the shelf, and it is terrible at guessing.

Add what's on the shelf. MixWise will show you the drinks it already makes.

${hero ? `${hero.name}: ${hrefFor(hero, siteUrl)}\n` : ""}
Add my bottles: ${mixUrl}

${signoffText()}
  `.trim();

  return wrap(subject, previewText, body, text, { userEmail, unsubscribeUrl, siteUrl });
}

/** Day 5. Created an account, never opened it. */
export function activateAccountDraftTemplate({
  displayName,
  userEmail,
  setupUrl,
  unsubscribeUrl,
  hero,
  siteUrl = MIXWISE_EMAIL_SITE,
}: CampaignBase & { setupUrl: string; hero?: CampaignDrink }): EmailTemplate {
  const name = firstName(displayName);
  const subject = "You signed up. You never opened MixWise.";
  const previewText = "Open the app, add a few bottles, and we'll show you what you can make tonight.";

  const body = `
    ${greetingHtml("Come finish MixWise.")}
    ${bodyHtml(`You made an account, ${escapeEmailHtml(name)}. Then you never opened it. The useful part is still sitting there.`)}
    ${bodyHtml("Add what's in the cabinet. MixWise matches recipes to those bottles. Heart the keepers, skip the rest, and keep notes on what you'd change next time. That's the whole reason to have an account.")}
    ${stepsHtml([
      { n: "1", title: "Open MixWise", body: "One tap. You're in." },
      { n: "2", title: "Add a few bottles", body: "Whatever is actually on the shelf." },
      { n: "3", title: "See what you can make", body: "Tonight, with what you already own." },
    ])}
    ${
      hero
        ? forestHeroHtml({
            label: "Waiting on you",
            name: hero.name,
            blurb: hero.blurb,
            href: hrefFor(hero, siteUrl),
            imageUrl: hero.imageUrl,
            imageAlt: hero.imageAlt,
            ctaLabel: "See the recipe",
          })
        : ""
    }
    ${primaryCtaHtml(setupUrl, "Open MixWise")}
    ${signoffHtml()}
  `;

  const text = `
Come finish MixWise.

You made an account, ${name}. Then you never opened it. The useful part is still sitting there.

Add what's in the cabinet. MixWise matches recipes to those bottles. Heart the keepers, skip the rest, and keep notes on what you'd change next time. That's the whole reason to have an account.

1. Open MixWise
2. Add a few bottles
3. See what you can make

${hero ? `${hero.name}: ${hrefFor(hero, siteUrl)}\n` : ""}
Open MixWise: ${setupUrl}

${signoffText()}
  `.trim();

  return wrap(subject, previewText, body, text, { userEmail, unsubscribeUrl, siteUrl });
}

/** Day 10. Last empty-bar mail. */
export function emptyBarLastNudgeDraftTemplate({
  displayName,
  userEmail,
  unsubscribeUrl,
  hero,
  siteUrl = MIXWISE_EMAIL_SITE,
}: CampaignBase & { hero?: CampaignDrink }): EmailTemplate {
  const name = firstName(displayName);
  const subject = "Got a minute for your MixWise bar?";
  const previewText = "Add a few bottles and we'll show you what you can make at home.";
  const mixUrl = `${siteUrl}/mix`;

  const body = `
    ${greetingHtml("Add a few bottles when you have a minute.")}
    ${bodyHtml(`MixWise is a lot more useful once it knows what's in the cabinet, ${escapeEmailHtml(name)}. Gin, whiskey, a lime. That's enough to start.`)}
    ${
      hero
        ? forestHeroHtml({
            label: "What a few bottles can do",
            name: hero.name,
            blurb: hero.blurb,
            href: hrefFor(hero, siteUrl),
            imageUrl: hero.imageUrl,
            imageAlt: hero.imageAlt,
            ctaLabel: "See the recipe",
          })
        : ""
    }
    ${primaryCtaHtml(mixUrl, "Add my bottles")}
    ${signoffHtml()}
  `;

  const text = `
Add a few bottles when you have a minute.

MixWise is a lot more useful once it knows what's in the cabinet, ${name}. Gin, whiskey, a lime. That's enough to start.

${hero ? `${hero.name}: ${hrefFor(hero, siteUrl)}\n` : ""}
Add my bottles: ${mixUrl}

${signoffText()}
  `.trim();

  return wrap(subject, previewText, body, text, { userEmail, unsubscribeUrl, siteUrl });
}

/** Triggered once: first time the bar has ingredients. */
export function firstBarPayoffDraftTemplate({
  displayName,
  userEmail,
  unsubscribeUrl,
  readyCount,
  drinks,
  siteUrl = MIXWISE_EMAIL_SITE,
}: CampaignBase & { readyCount: number; drinks: CampaignDrink[] }): EmailTemplate {
  const name = firstName(displayName);
  const subject =
    readyCount === 1
      ? "You can make a drink tonight"
      : `You can make ${readyCount} drinks tonight`;
  const previewNames = drinks
    .slice(0, 3)
    .map((d) => d.name)
    .join(", ");
  const previewText = previewNames
    ? `${previewNames}. All from bottles you just added.`
    : "Your shelf already adds up to a real list.";
  const mixUrl = `${siteUrl}/mix`;
  const shown = drinks.slice(0, 4);
  const hero = shown[0];

  const body = `
    ${greetingHtml(`You can make ${escapeEmailHtml(String(readyCount))} drinks tonight.`)}
    ${bodyHtml(`Nice work, ${escapeEmailHtml(name)}. The bottles you added already match ${escapeEmailHtml(String(readyCount))} ${readyCount === 1 ? "cocktail" : "cocktails"}. No extra store run.`)}
    ${
      hero
        ? forestHeroHtml({
            label: "Start here",
            name: hero.name,
            blurb: hero.blurb,
            href: hrefFor(hero, siteUrl),
            imageUrl: hero.imageUrl,
            imageAlt: hero.imageAlt,
            ctaLabel: "Make this one",
          })
        : ""
    }
    ${drinkListHtml(shown.slice(1).map((drink) => asThumb(drink, siteUrl, drink.blurb || "Already in the cabinet.")))}
    ${primaryCtaHtml(mixUrl, readyCount > shown.length ? `See all ${readyCount}` : "Open Mix")}
    ${signoffHtml("Go make one.")}
  `;

  const text = `
You can make ${readyCount} drinks tonight.

Nice work, ${name}. The bottles you added already match ${readyCount} ${readyCount === 1 ? "cocktail" : "cocktails"}. No extra store run.

${textDrinkList(shown, siteUrl)}

${readyCount > shown.length ? `See all ${readyCount}: ${mixUrl}` : `Open Mix: ${mixUrl}`}

${signoffText("Go make one.")}
  `.trim();

  return wrap(subject, previewText, body, text, { userEmail, unsubscribeUrl, siteUrl });
}

/** List-only, about a week after a Thursday. */
export function listConvertFollowUpDraftTemplate({
  userEmail,
  convertUrl,
  unsubscribeUrl,
  hero,
  siteUrl = MIXWISE_EMAIL_SITE,
}: CampaignBase & { convertUrl: string; hero?: CampaignDrink }): EmailTemplate {
  const subject = "See what you can make with your bottles";
  const previewText = "Create a free account and MixWise will match recipes to what's in the cabinet.";

  const body = `
    ${greetingHtml("See what you can make tonight.")}
    ${bodyHtml("Create a free account and tell MixWise what's on the shelf. We'll match the recipes to those bottles.")}
    ${
      hero
        ? creamDrinkHtml({
            label: "From bottles you already own",
            name: hero.name,
            blurb: hero.blurb,
            href: hrefFor(hero, siteUrl),
            imageUrl: hero.imageUrl,
            imageAlt: hero.imageAlt,
          })
        : ""
    }
    ${primaryCtaHtml(convertUrl, "Create my free account")}
    ${signoffHtml()}
  `;

  const text = `
See what you can make tonight.

Create a free account and tell MixWise what's on the shelf. We'll match the recipes to those bottles.

${hero ? `${hero.name}: ${hrefFor(hero, siteUrl)}\n` : ""}
Create my free account: ${convertUrl}

${signoffText()}
  `.trim();

  return wrap(subject, previewText, body, text, { userEmail, unsubscribeUrl, siteUrl });
}

export type ThursdayFeaturedInput = CampaignBase & {
  headline: string;
  intro: string;
  subject?: string;
  previewText?: string;
  signoff?: string;
  relatedHeading?: string;
  ctaLabel?: string;
  kicker?: string;
  featured: CampaignDrink & { label?: string };
  related?: CampaignDrink[];
  occasion?: { slug: string; label: string };
  canMakeTonight?: boolean;
  canMakeNote?: string;
  listConvertUrl?: string;
};

/** Thursday broadcast. Featured cocktail, optionally an event. */
export function thursdayFeaturedDraftTemplate({
  displayName,
  userEmail,
  unsubscribeUrl,
  headline,
  intro,
  subject,
  previewText,
  signoff,
  relatedHeading = "If that's not the mood",
  ctaLabel = "Get the recipe",
  kicker,
  featured,
  related = [],
  occasion,
  canMakeTonight,
  canMakeNote,
  listConvertUrl,
  siteUrl = MIXWISE_EMAIL_SITE,
}: ThursdayFeaturedInput): EmailTemplate {
  const name = firstName(displayName);
  const resolvedSubject = subject || (kicker ? `${kicker}: ${featured.name}` : featured.name);
  const resolvedPreview = previewText || featured.blurb || `This week's drink is the ${featured.name}.`;
  const featuredHref = hrefFor(featured, siteUrl);

  const relatedHtml = related.length
    ? `
        ${drinkListHtml(related.map((drink) => asThumb(drink, siteUrl)))}
      `
    : "";

  const occasionHtml = occasion
    ? emailPad(
        `<p style="margin: 8px 0 0 0; font-size: 14px; color: #5F6F5E; line-height: 1.5;">
          <a href="${escapeEmailHtml(occasionUrl(occasion.slug, siteUrl))}" style="color:#1C241B;text-decoration:none;font-weight:600;border-bottom:1px solid #1C241B;">${escapeEmailHtml(occasion.label)}</a>
        </p>`
      )
    : "";

  const canMakeHtml = canMakeTonight
    ? mutedHtml(
        escapeEmailHtml(canMakeNote || "You already have this. So... tonight?"),
        "text-align:center;"
      )
    : "";

  const convertHtml = listConvertUrl
    ? convertCardHtml({
        href: listConvertUrl,
        heading: "See what you can make tonight",
        body: "Tell MixWise what's in the cabinet. We'll match the recipes. Free.",
        cta: "Create my free account",
      })
    : "";

  const body = `
    ${greetingHtml(escapeEmailHtml(headline.replace("{name}", name)))}
    ${bodyHtml(escapeEmailHtml(intro))}
    ${forestHeroHtml({
      label: featured.label || kicker || "Tonight",
      name: featured.name,
      blurb: featured.blurb,
      href: featuredHref,
      imageUrl: featured.imageUrl,
      imageAlt: featured.imageAlt || featured.name,
      ctaLabel,
    })}
    ${canMakeHtml}
    ${
      related.length
        ? emailPad(
            `<p style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #5F6F5E; margin: 24px 0 8px 0;">${escapeEmailHtml(relatedHeading)}</p>`
          )
        : ""
    }
    ${relatedHtml}
    ${primaryCtaHtml(featuredHref, ctaLabel)}
    ${occasionHtml}
    ${convertHtml}
    ${signoffHtml(signoff)}
  `;

  const relatedText = related.length
    ? `\n${relatedHeading.toUpperCase()}\n${textDrinkList(related, siteUrl)}\n`
    : "";
  const occasionText = occasion
    ? `${occasion.label}: ${occasionUrl(occasion.slug, siteUrl)}\n`
    : "";

  const text = `
${headline.replace("{name}", name)}

${intro}

${featured.label || kicker || "TONIGHT"}: ${featured.name}
${featured.blurb || ""}
${featuredHref}
${canMakeTonight ? `\n${canMakeNote || "You already have this. So... tonight?"}\n` : ""}
${relatedText}${occasionText}
${ctaLabel}: ${featuredHref}
${listConvertUrl ? `\nSee what you can make tonight.\nCreate my free account: ${listConvertUrl}\n` : ""}
${signoffText(signoff)}
  `.trim();

  return wrap(resolvedSubject, resolvedPreview, body, text, { userEmail, unsubscribeUrl, siteUrl });
}

/** Friday. Accounts with a bar. */
export function fridayPersonalizedDraftTemplate({
  displayName,
  userEmail,
  unsubscribeUrl,
  readyCount,
  canMake,
  almostThere = [],
  headline,
  intro,
  subject,
  signoff,
  siteUrl = MIXWISE_EMAIL_SITE,
}: CampaignBase & {
  readyCount: number;
  canMake: CampaignDrink[];
  almostThere?: AlmostThereDrink[];
  headline?: string;
  intro?: string;
  subject?: string;
  signoff?: string;
}): EmailTemplate {
  const name = firstName(displayName);
  const gap = almostThere[0];
  const leadDrink = canMake[0]?.name;
  const resolvedSubject =
    subject ||
    (gap && leadDrink
      ? `Friday: a ${leadDrink}, or grab ${gap.missingIngredient}`
      : leadDrink
        ? `Friday starts with a ${leadDrink}`
        : `${readyCount} Friday drinks already on your shelf`);
  const previewText =
    canMake[0] && gap
      ? `${canMake[0].name} tonight. ${gap.missingIngredient} unlocks a ${gap.name} if you're heading out.`
      : canMake[0]
        ? `${canMake[0].name} and ${Math.max(readyCount - 1, 0)} more you can pour before the weekend gets loud.`
        : "Your bar already knows what Friday wants.";
  const mixUrl = `${siteUrl}/mix`;
  const shown = canMake.slice(0, 5);
  const resolvedHeadline = (
    headline ||
    (readyCount === 1
      ? `One drink ready for Friday, ${name}.`
      : `Friday menu: ${readyCount} you can pour tonight.`)
  ).replace("{name}", name);
  const resolvedIntro =
    intro ||
    (gap
      ? `These match bottles you already logged. Weekend's coming — ${gap.missingIngredient} is the only errand between you and a couple more.`
      : `These match bottles you already logged. No store run. Just ice and a glass.`);
  const resolvedSignoff = signoff || "Happy Friday. Put ice in something.";

  const almostHtml = almostThere.length
    ? `
        ${emailPad(
          `<p style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #5F6F5E; margin: 28px 0 8px 0;">If you're already out</p>`
        )}
        ${drinkListHtml(
          almostThere.slice(0, 2).map((drink) =>
            asThumb(drink, siteUrl, `Needs ${drink.missingIngredient}. That's it.`)
          )
        )}
      `
    : "";

  const body = `
    ${greetingHtml(escapeEmailHtml(resolvedHeadline))}
    ${bodyHtml(escapeEmailHtml(resolvedIntro))}
    ${drinkListHtml(shown.map((drink) => asThumb(drink, siteUrl, drink.blurb || "Already in the cabinet.")))}
    ${
      readyCount > shown.length
        ? mutedHtml(
            `<a href="${escapeEmailHtml(mixUrl)}" style="color:#BC5A45;text-decoration:none;font-weight:600;">The other ${readyCount - shown.length} are waiting in Mix</a>`
          )
        : ""
    }
    ${almostHtml}
    ${primaryCtaHtml(mixUrl, "Pick tonight's drink")}
    ${signoffHtml(resolvedSignoff)}
  `;
  const almostText = almostThere.length
    ? `\nIF YOU'RE ALREADY OUT\n${almostThere
        .slice(0, 2)
        .map(
          (drink) =>
            `  • ${drink.name}: Needs ${drink.missingIngredient}. That's it.\n    ${hrefFor(drink, siteUrl)}`
        )
        .join("\n")}\n`
    : "";

  const text = `
${resolvedHeadline}

${resolvedIntro}

YOU CAN MAKE
${textDrinkList(shown, siteUrl)}
${readyCount > shown.length ? `\nThe other ${readyCount - shown.length} are waiting in Mix: ${mixUrl}\n` : ""}
${almostText}
Pick tonight's drink: ${mixUrl}

${signoffText(resolvedSignoff)}
  `.trim();

  return wrap(resolvedSubject, previewText, body, text, { userEmail, unsubscribeUrl, siteUrl });
}

/** Standalone almost-there. Use instead of Friday, or as a one-shot. */
export function almostThereDraftTemplate({
  displayName,
  userEmail,
  unsubscribeUrl,
  missingIngredient,
  unlockedCount,
  drinks,
  siteUrl = MIXWISE_EMAIL_SITE,
}: CampaignBase & {
  missingIngredient: string;
  unlockedCount: number;
  drinks: CampaignDrink[];
}): EmailTemplate {
  const name = firstName(displayName);
  const hero = drinks[0];
  const subject = hero
    ? `You're one ${missingIngredient} from a ${hero.name}`
    : `You're one ${missingIngredient} short`;
  const previewText = drinks.length
    ? `${drinks
        .slice(0, 3)
        .map((d) => d.name)
        .join(", ")}. The bottle is the boring part.`
    : `Add ${missingIngredient} and ${unlockedCount} more drinks show up.`;
  const mixUrl = `${siteUrl}/mix`;

  const body = `
    ${greetingHtml(`You're missing ${escapeEmailHtml(missingIngredient)}.`)}
    ${bodyHtml(`Add <strong>${escapeEmailHtml(missingIngredient)}</strong> and ${unlockedCount} more drinks show up from bottles you already have, ${escapeEmailHtml(name)}. Including a ${escapeEmailHtml(hero?.name || "new round")} this weekend.`)}
    ${
      hero
        ? forestHeroHtml({
            label: `Needs ${missingIngredient}`,
            name: hero.name,
            blurb: hero.blurb,
            href: hrefFor(hero, siteUrl),
            imageUrl: hero.imageUrl,
            imageAlt: hero.imageAlt,
            ctaLabel: `See the ${hero.name}`,
          })
        : ""
    }
    ${drinkListHtml(drinks.slice(1, 4).map((drink) => asThumb(drink, siteUrl)))}
    ${primaryCtaHtml(mixUrl, `Add ${missingIngredient}`)}
    ${signoffHtml()}
  `;

  const text = `
You're missing ${missingIngredient}.

Add ${missingIngredient} and ${unlockedCount} more drinks show up from bottles you already have, ${name}. Including a ${hero?.name || "new round"} this weekend.

${textDrinkList(drinks.slice(0, 4), siteUrl)}

Add ${missingIngredient}: ${mixUrl}

${signoffText()}
  `.trim();

  return wrap(subject, previewText, body, text, { userEmail, unsubscribeUrl, siteUrl });
}

/** Shopping list. Only if they have items. Max 2 lifetime; variant 2 is a sharper nudge. */
export function shoppingListReminderDraftTemplate({
  displayName,
  userEmail,
  unsubscribeUrl,
  items,
  highlight,
  variant = 1,
  siteUrl = MIXWISE_EMAIL_SITE,
}: CampaignBase & {
  items: string[];
  highlight?: { drink: CampaignDrink; missingItem: string };
  /** 1 = first nudge, 2 = last nudge (different copy). */
  variant?: 1 | 2;
}): EmailTemplate {
  const name = firstName(displayName);
  const listed = items.slice(0, 3).join(". ");
  const listUrl = `${siteUrl}/shopping-list`;
  const drinkName = highlight?.drink.name || "drink";
  const isFollowUp = variant === 2;

  const subject = isFollowUp
    ? items.length <= 3
      ? `${listed}. Still sitting there.`
      : `${listed}. Still on the list.`
    : items.length <= 3
      ? `${listed}. That's the list.`
      : `${listed}. And a few more.`;

  const previewText = isFollowUp
    ? highlight
      ? `Last nudge. ${highlight.missingItem} is still between you and a ${highlight.drink.name}.`
      : "Last nudge on this list. Then I'll leave it alone."
    : highlight
      ? `The ${highlight.drink.name} is why ${highlight.missingItem} is on there.`
      : "You saved these. Grab them before the weekend eats the list.";

  const itemRows = items
    .slice(0, 8)
    .map(
      (item, index) => `
        <tr>
          <td style="padding: 14px 0;${index < Math.min(items.length, 8) - 1 ? " border-bottom: 1px solid #E8E8E8;" : ""}">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td width="28" valign="middle" style="width:28px;padding-right:12px;">
                  <div style="width:14px;height:14px;border:1.5px solid #111111;line-height:14px;font-size:1px;">&nbsp;</div>
                </td>
                <td valign="middle" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.4;color:#111111;font-weight:500;">
                  ${escapeEmailHtml(item)}
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    )
    .join("");

  const highlightHtml = highlight
    ? creamDrinkHtml({
        label: isFollowUp
          ? `${highlight.missingItem} is still the holdup`
          : `${highlight.missingItem} is the reason`,
        name: highlight.drink.name,
        blurb: highlight.drink.blurb,
        href: hrefFor(highlight.drink, siteUrl),
        imageUrl: highlight.drink.imageUrl,
        imageAlt: highlight.drink.imageAlt,
      })
    : "";

  const greeting = isFollowUp
    ? "That list is still waiting."
    : "Your shopping list for the weekend";
  const intro = isFollowUp
    ? `Same list as before, ${escapeEmailHtml(name)}. One store stop and that ${escapeEmailHtml(drinkName)} is actually in the glass. I won't email about this again.`
    : `You saved these, ${escapeEmailHtml(name)}. Grab them before Saturday if you want that ${escapeEmailHtml(drinkName)} in the glass.`;
  const cta = isFollowUp ? "Finish the list" : "Open shopping list";
  const closer = isFollowUp ? "Then we're done nagging." : "Don't forget the ice.";

  const body = `
    ${greetingHtml(greeting)}
    ${bodyHtml(intro)}
    ${emailPad(
      `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 4px 0 8px 0; border-top: 1px solid #E8E8E8; border-bottom: 1px solid #E8E8E8;">
      ${itemRows}
    </table>`
    )}
    ${highlightHtml}
    ${primaryCtaHtml(listUrl, cta)}
    ${signoffHtml(closer)}
  `;

  const text = `
${greeting}

${isFollowUp
  ? `Same list as before, ${name}. One store stop and that ${drinkName} is actually in the glass. I won't email about this again.`
  : `You saved these, ${name}. Grab them before Saturday if you want that ${drinkName} in the glass.`}

${items.map((item) => `  • ${item}`).join("\n")}
${
  highlight
    ? `\n${isFollowUp ? `${highlight.missingItem} is still the holdup` : `${highlight.missingItem} is the reason`}: ${highlight.drink.name}\n${hrefFor(highlight.drink, siteUrl)}\n`
    : ""
}
${cta}: ${listUrl}

${signoffText(closer)}
  `.trim();

  return wrap(subject, previewText, body, text, { userEmail, unsubscribeUrl, siteUrl });
}

/** 30-day win-back for people who had a bar and went dark. */
export function winBackDraftTemplate({
  displayName,
  userEmail,
  unsubscribeUrl,
  drinks,
  siteUrl = MIXWISE_EMAIL_SITE,
}: CampaignBase & { drinks: CampaignDrink[] }): EmailTemplate {
  const name = firstName(displayName);
  const hero = drinks[0];
  const subject = hero
    ? `Come make a ${hero.name}`
    : "Come make something";
  const previewText = hero
    ? `It's been a while. Your MixWise bar still makes a ${hero.name}.`
    : "It's been a while. Your MixWise bar is still here.";
  const mixUrl = `${siteUrl}/mix`;

  const body = `
    ${greetingHtml("It's been a while.")}
    ${bodyHtml(`You haven't been in MixWise, ${escapeEmailHtml(name)}. The bottles you logged are still there.`)}
    ${bodyHtml(hero ? `Which means you can still make a ${escapeEmailHtml(hero.name)}. And a few others.` : "Which means the drinks they make are still there too.")}
    ${
      hero
        ? forestHeroHtml({
            label: "Still in your bar",
            name: hero.name,
            blurb: hero.blurb,
            href: hrefFor(hero, siteUrl),
            imageUrl: hero.imageUrl,
            imageAlt: hero.imageAlt,
            ctaLabel: "Make this",
          })
        : ""
    }
    ${
      drinks.length > 1
        ? drinkListHtml(drinks.slice(1, 4).map((drink) => asThumb(drink, siteUrl)))
        : ""
    }
    ${primaryCtaHtml(mixUrl, "Open MixWise")}
    ${signoffHtml()}
  `;

  const text = `
It's been a while.

You haven't been in MixWise, ${name}. The bottles you logged are still there.

${hero ? `Which means you can still make a ${hero.name}. And a few others.` : "Which means the drinks they make are still there too."}

${textDrinkList(drinks.slice(0, 4), siteUrl)}

Open MixWise: ${mixUrl}

${signoffText()}
  `.trim();

  return wrap(subject, previewText, body, text, { userEmail, unsubscribeUrl, siteUrl });
}

/** Later lifecycle: bar exists but hasn't been edited in a while. */
export function staleBarDraftTemplate({
  displayName,
  userEmail,
  unsubscribeUrl,
  barCount,
  drinks,
  siteUrl = MIXWISE_EMAIL_SITE,
}: CampaignBase & { barCount: number; drinks: CampaignDrink[] }): EmailTemplate {
  const name = firstName(displayName);
  const subject = "Has the cabinet changed?";
  const previewText = "Bottles get used. New ones show up. A quick update keeps MixWise honest.";
  const mixUrl = `${siteUrl}/mix`;
  const countLabel = `${barCount} bottle${barCount === 1 ? "" : "s"}`;

  const body = `
    ${greetingHtml("Time for a quick bar check.")}
    ${bodyHtml(`You set up your MixWise bar a while ago, ${escapeEmailHtml(name)}. MixWise still thinks you have ${escapeEmailHtml(countLabel)} in there.`)}
    ${bodyHtml("Bottles get used. New ones show up. Two minutes in Mix and the drinks we show you match the shelf again.")}
    ${drinkListHtml(
      drinks.slice(0, 3).map((drink) =>
        asThumb(drink, siteUrl, drink.blurb || "Based on the last time you updated.")
      )
    )}
    ${primaryCtaHtml(mixUrl, "Update my bar")}
    ${signoffHtml()}
  `;

  const text = `
Time for a quick bar check.

You set up your MixWise bar a while ago, ${name}. MixWise still thinks you have ${countLabel} in there.

Bottles get used. New ones show up. Two minutes in Mix and the drinks we show you match the shelf again.

${textDrinkList(drinks.slice(0, 3), siteUrl)}

Update my bar: ${mixUrl}

${signoffText()}
  `.trim();

  return wrap(subject, previewText, body, text, { userEmail, unsubscribeUrl, siteUrl });
}
