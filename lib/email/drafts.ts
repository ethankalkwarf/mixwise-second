/**
 * Reviewable email drafts with sample copy and drinks.
 * Not sent — used by /dev/email-drafts and proof HTML.
 */

import { MIXWISE_EMAIL_SITE } from "@/lib/email/layout";
import {
  accountWelcomeDraftTemplate,
  activateAccountDraftTemplate,
  addIngredientsDraftTemplate,
  almostThereDraftTemplate,
  emptyBarLastNudgeDraftTemplate,
  firstBarPayoffDraftTemplate,
  fridayPersonalizedDraftTemplate,
  listConvertFollowUpDraftTemplate,
  shoppingListReminderDraftTemplate,
  staleBarDraftTemplate,
  thursdayFeaturedDraftTemplate,
  winBackDraftTemplate,
  type CampaignDrink,
} from "@/lib/email/campaigns";
import { toPublicDeliveryUrl } from "@/lib/mediaDelivery";

const EMAIL_IMG =
  "https://ehexkpoxir62prtp.public.blob.vercel-storage.com/email/weekend-kickoff";

const SAMPLE = {
  displayName: "Ethan",
  userEmail: "ethan@getmixwise.com",
  unsubscribeUrl: `${MIXWISE_EMAIL_SITE}/unsubscribe?token=draft&type=all`,
  siteUrl: MIXWISE_EMAIL_SITE,
};

/** Hosted email-sized photos we already use in weekend kickoff. */
export const DRAFT_FALLBACK_IMAGES: Record<string, string> = {
  "limoncello-spritz": `${EMAIL_IMG}/limoncello-spritz-lMpa2ARSjsMZmQUqiFp96u54glmy2e.jpg`,
  paloma: `${EMAIL_IMG}/paloma-Ekt5sOsruN7X4ake9BpzmPzLZlTKek.jpg`,
  "whiskey-smash": `${EMAIL_IMG}/whiskey-smash-JvShfYtbKdYO7bpOkDFs3yrNyTbv5D.jpg`,
  sangria: `${EMAIL_IMG}/sangria-dT0RnkLVETBQqGMKVPxzxgQNpupVj5.jpg`,
  mimosa: `${EMAIL_IMG}/mimosa-a7FfCbiowNHrNcVYvBLXHK1xC1Zxsw.jpg`,
  "virgin-mojito": `${EMAIL_IMG}/virgin-mojito-vk5TTDhrBn3ydPm5o7WW7uE9XooOdn.jpg`,
};

export type EmailDraftGroup = "lifecycle" | "weekly" | "events";

export type EmailDraftMeta = {
  slug: string;
  name: string;
  group: EmailDraftGroup;
  audience: string;
  job: string;
  sendWhen: string;
};

export type EmailDraft = EmailDraftMeta & {
  subject: string;
  preview: string;
  html: string;
  text: string;
};

function drink(
  slug: string,
  name: string,
  blurb: string,
  images: Record<string, string>
): CampaignDrink {
  const imageUrl = images[slug];
  return {
    slug,
    name,
    blurb,
    imageUrl,
    imageAlt: name,
  };
}

export function collectDraftImageSlugs(): string[] {
  return [
    "limoncello-spritz",
    "paloma",
    "whiskey-smash",
    "gin-gin-mule",
    "sangria",
    "mimosa",
    "virgin-mojito",
    "long-island-iced-tea",
    "electric-lemonade",
    "apple-cider-punch",
    "old-fashioned",
    "maple-old-fashioned",
    "manhattan",
    "negroni",
    "boulevardier",
    "ranch-water",
    "margarita",
    "apple-cider-old-fashioned",
    "stone-fence",
    "spiced-pear-cocktail",
    "michelada",
    "black-magic",
    "corpse-reviver-no-2",
    "blood-and-sand",
    "last-word",
    "jungle-bird",
    "daiquiri",
    "strawberry-daiquiri",
    "paper-plane",
  ];
}

export function buildEmailDrafts(
  catalogImages: Record<string, string> = {}
): EmailDraft[] {
  const rewrittenCatalog: Record<string, string> = {};
  for (const [slug, url] of Object.entries(catalogImages)) {
    rewrittenCatalog[slug] = toPublicDeliveryUrl(url, "email") || url;
  }
  const images = { ...DRAFT_FALLBACK_IMAGES, ...rewrittenCatalog };

  const d = {
    limoncello: drink(
      "limoncello-spritz",
      "Limoncello Spritz",
      "Lemon, bubbles, leftover daylight. You don't even need the shaker.",
      images
    ),
    strawberryDaiquiri: drink(
      "strawberry-daiquiri",
      "Strawberry Daiquiri",
      "Berries, rum, lime, ice. Last-of-summer in a glass.",
      images
    ),
    paloma: drink(
      "paloma",
      "Paloma",
      "Tequila, grapefruit, a stupid amount of ice. Stay outside until the bugs win.",
      images
    ),
    smash: drink(
      "whiskey-smash",
      "Whiskey Smash",
      "Mint, lemon, crushed ice. For the hour the sun finally knocks it off.",
      images
    ),
    mule: drink(
      "gin-gin-mule",
      "Gin Gin Mule",
      "Gin, mint, ginger, lime. Same weather. Different bottle.",
      images
    ),
    sangria: drink(
      "sangria",
      "Sangria",
      "Fruit in a pitcher. Wine underneath. Stop thinking about it.",
      images
    ),
    virginMojito: drink(
      "virgin-mojito",
      "Virgin Mojito",
      "Mint, lime, bubbles. Same patio. No hangover.",
      images
    ),
    longIsland: drink(
      "long-island-iced-tea",
      "Long Island Iced Tea",
      "Everyone knows the name. Keep the pour from getting cute.",
      images
    ),
    electric: drink(
      "electric-lemonade",
      "Electric Lemonade",
      "Neon lemonade with a job. Crowd drink. Unapologetic.",
      images
    ),
    ciderPunch: drink(
      "apple-cider-punch",
      "Apple Cider Punch",
      "Cider, brandy, citrus, spice. One bowl and you're off the clock.",
      images
    ),
    oldFashioned: drink(
      "old-fashioned",
      "Old Fashioned",
      "Bourbon, sugar, bitters. September can be this quiet.",
      images
    ),
    maple: drink(
      "maple-old-fashioned",
      "Maple Old Fashioned",
      "An Old Fashioned that found the pancake syrup. First cold night energy.",
      images
    ),
    manhattan: drink(
      "manhattan",
      "Manhattan",
      "Whiskey and vermouth. The streetlights beat you home.",
      images
    ),
    ranch: drink(
      "ranch-water",
      "Ranch Water",
      "Tequila, lime, Topo Chico. Shake nothing. Explain nothing.",
      images
    ),
    margarita: drink(
      "margarita",
      "Margarita",
      "If the group only knows one cocktail, make it this one.",
      images
    ),
    ciderOld: drink(
      "apple-cider-old-fashioned",
      "Apple Cider Old Fashioned",
      "Bourbon and cider in a rocks glass. Fall without the cinnamon lecture.",
      images
    ),
    stoneFence: drink(
      "stone-fence",
      "Stone Fence",
      "Cider plus whiskey, built in the glass. Older than your playlist.",
      images
    ),
    pear: drink(
      "spiced-pear-cocktail",
      "Spiced Pear Cocktail",
      "Pear and spice. Holiday-adjacent. Not holiday yet.",
      images
    ),
    michelada: drink(
      "michelada",
      "Michelada",
      "Beer, lime, a little heat. Set it down. Watch the play.",
      images
    ),
    blackMagic: drink(
      "black-magic",
      "Black Magic",
      "Vodka, coffee liqueur, lime. Costume-dark. Still drinkable.",
      images
    ),
    corpse: drink(
      "corpse-reviver-no-2",
      "Corpse Reviver No. 2",
      "Silly name. Serious citrus. Finish it.",
      images
    ),
    bloodSand: drink(
      "blood-and-sand",
      "Blood and Sand",
      "Scotch, cherry, orange. The color does enough.",
      images
    ),
    negroni: drink(
      "negroni",
      "Negroni",
      "Gin, vermouth, Campari. Equal parts. No mystery.",
      images
    ),
    boulevardier: drink(
      "boulevardier",
      "Boulevardier",
      "Swap the gin for whiskey. Same bitter orange hug.",
      images
    ),
    lastWord: drink(
      "last-word",
      "Last Word",
      "Equal parts. Chartreuse talks the loudest.",
      images
    ),
    jungleBird: drink(
      "jungle-bird",
      "Jungle Bird",
      "Rum, Campari, pineapple. Bitter on purpose.",
      images
    ),
    daiquiri: drink(
      "daiquiri",
      "Daiquiri",
      "Rum, lime, sugar. If this is good, you're good.",
      images
    ),
    paperPlane: drink(
      "paper-plane",
      "Paper Plane",
      "Bourbon and amaro, equal parts. Bitter orange in a coupe.",
      images
    ),
  };

  const lifecycle: EmailDraft[] = [
    pack("account-welcome", "Welcome: add ingredients", "lifecycle", {
      audience: "New account, right after confirm",
      job: "Get the first ingredients into Mix",
      sendWhen: "Triggered once, post-confirm",
      email: accountWelcomeDraftTemplate({ ...SAMPLE, hero: d.daiquiri }),
    }),
    pack("add-ingredients", "Don't forget to add ingredients", "lifecycle", {
      audience: "Account, bar still empty",
      job: "Same CTA as welcome, only if they skipped it",
      sendWhen: "Day 2, if bar count is 0",
      email: addIngredientsDraftTemplate({ ...SAMPLE, hero: d.smash }),
    }),
    pack("activate-account", "Never opened the account", "lifecycle", {
      audience: "Signed up, never opened MixWise",
      job: "Get them in. Add bottles. See what they can make.",
      sendWhen: "Day 5, if never signed in",
      email: activateAccountDraftTemplate({
        ...SAMPLE,
        setupUrl: `${MIXWISE_EMAIL_SITE}/auth/callback?token=draft`,
        hero: d.daiquiri,
      }),
    }),
    pack("empty-bar-last", "Empty bar: one more ask", "lifecycle", {
      audience: "Signed in, bar still empty",
      job: "Soft last ask. Then leave the empty-bar sequence.",
      sendWhen: "Day 10, if bar count is 0",
      email: emptyBarLastNudgeDraftTemplate({ ...SAMPLE, hero: d.paloma }),
    }),
    pack("first-bar-payoff", "First bar payoff", "lifecycle", {
      audience: "Account, just added first ingredients",
      job: "Show the aha: you can make N drinks tonight",
      sendWhen: "Triggered once, when bar goes from 0 → N",
      email: firstBarPayoffDraftTemplate({
        ...SAMPLE,
        readyCount: 14,
        drinks: [d.negroni, d.lastWord, d.daiquiri, d.paperPlane],
      }),
    }),
    pack("list-convert", "List → account follow-up", "lifecycle", {
      audience: "List-only, after they've seen a Thursday",
      job: "One convert ask: match recipes to their bottles. Don't explain the email cadence.",
      sendWhen: "Day 7, list-only, no account",
      email: listConvertFollowUpDraftTemplate({
        ...SAMPLE,
        convertUrl: `${MIXWISE_EMAIL_SITE}/join?email=ethan%40getmixwise.com&source=homepage&token=draft`,
        hero: d.daiquiri,
      }),
    }),
    pack("almost-there", "Almost-there (one bottle)", "lifecycle", {
      audience: "Account with a bar, one high-leverage gap",
      job: "Name the bottle. Name the drinks it unlocks.",
      sendWhen: "Use as Friday when the gap is obvious, or a one-shot",
      email: almostThereDraftTemplate({
        ...SAMPLE,
        missingIngredient: "Campari",
        unlockedCount: 6,
        drinks: [d.negroni, d.boulevardier, d.jungleBird],
      }),
    }),
    pack("shopping-list", "Shopping list before the weekend", "lifecycle", {
      audience: "Account with items on the list",
      job: "Get them to the store. Cap at once a week.",
      sendWhen: "Thu night / Fri morning, only if list has items",
      email: shoppingListReminderDraftTemplate({
        ...SAMPLE,
        items: ["Campari", "Grapefruit", "Fresh mint"],
        highlight: { drink: d.paloma, missingItem: "Grapefruit" },
      }),
    }),
    pack("win-back", "Win-back: come make one", "lifecycle", {
      audience: "Had a bar, stopped opening MixWise",
      job: "Show drinks their bar still makes. Get them back in.",
      sendWhen: "30 days since last visit, bar count > 0",
      email: winBackDraftTemplate({
        ...SAMPLE,
        drinks: [d.lastWord, d.negroni, d.daiquiri],
      }),
    }),
    pack("stale-bar", "Bar check: cabinet changed?", "lifecycle", {
      audience: "Has a bar, hasn't edited it in a while",
      job: "Shelf drifts. Get them to update bottles so Mix stays accurate.",
      sendWhen: "45 days since last bar_ingredients change, bar count > 0",
      email: staleBarDraftTemplate({
        ...SAMPLE,
        barCount: 12,
        drinks: [d.negroni, d.smash, d.paloma],
      }),
    }),
  ];

  const weekly: EmailDraft[] = [
    pack("thursday-featured", "Thursday featured (non-event week)", "weekly", {
      audience: "List + accounts (one send, no duplicates)",
      job: "One cocktail. Brand + list growth.",
      sendWhen: "Every Thursday when there isn't a hosting weekend",
      email: thursdayFeaturedDraftTemplate({
        ...SAMPLE,
        headline: "Three ingredients. That's the whole argument.",
        intro: "Rum, lime, sugar. If the Daiquiri is good, the bar is good. If it's not, we have a conversation.",
        subject: "Make a Daiquiri and we'll know if you're serious",
        previewText: "Rum, lime, sugar. If this is good, you're good.",
        featured: { ...d.daiquiri, label: "Tonight's assignment" },
        canMakeTonight: true,
        canMakeNote: "You already have this. So... tonight?",
        ctaLabel: "I'll make this",
        signoff: "Stirred opinions welcome.",
      }),
    }),
    pack("thursday-featured-list", "Thursday featured (list convert line)", "weekly", {
      audience: "List-only",
      job: "Same Thursday drink, then match recipes to their bottles",
      sendWhen: "Same Thursday send, list-only variant",
      email: thursdayFeaturedDraftTemplate({
        ...SAMPLE,
        headline: "Three ingredients. That's the whole argument.",
        intro: "Rum, lime, sugar. If the Daiquiri is good, the bar is good. If it's not, we have a conversation.",
        subject: "Make a Daiquiri and we'll know if you're serious",
        previewText: "Rum, lime, sugar. If this is good, you're good.",
        featured: { ...d.daiquiri, label: "Tonight's assignment" },
        listConvertUrl: `${MIXWISE_EMAIL_SITE}/join?email=ethan%40getmixwise.com&source=homepage&token=draft`,
        ctaLabel: "Get the recipe",
        signoff: "See you Thursday.",
      }),
    }),
    pack("friday-personalized", "Friday personalized list", "weekly", {
      audience: "Accounts with a bar",
      job: "3-5 you can make + 1-2 one-bottle-away. Product moat.",
      sendWhen: "Every Friday. Skip if the bar is empty.",
      email: fridayPersonalizedDraftTemplate({
        ...SAMPLE,
        headline: "11 drinks you can make from your bar",
        intro: "These match bottles you already logged. Two more if Campari makes it home.",
        readyCount: 11,
        canMake: [d.lastWord, d.negroni, d.daiquiri, d.paperPlane, d.smash],
        almostThere: [
          { ...d.boulevardier, missingIngredient: "Campari" },
          { ...d.jungleBird, missingIngredient: "Campari" },
        ],
        signoff: "Go put ice in something.",
      }),
    }),
  ];

  const events: EmailDraft[] = [
    pack("event-aug-20", "Aug 20: last stretch of heat", "events", {
      audience: "List + accounts (this IS Thursday)",
      job: "Highball weather before Labor Day. Not the Limoncello Spritz.",
      sendWhen: "Thursday Aug 20, 2026",
      email: thursdayFeaturedDraftTemplate({
        ...SAMPLE,
        headline: "Still too hot. Make a daiquiri.",
        intro: "August has one job left and it's heat. A Strawberry Daiquiri is rum, berries, lime, and a pile of ice. Blitz it, pour it, sit back down.",
        subject: "Still too hot. Make a daiquiri.",
        previewText: "Berries, rum, lime, ice. Last-of-summer in a glass.",
        featured: { ...d.strawberryDaiquiri, label: "Cold on purpose" },
        related: [d.mule, d.smash],
        relatedHeading: "If you'd rather skip the blender",
        occasion: { slug: "summer", label: "More summer drinks" },
        ctaLabel: "Get the recipe",
        signoff: "Sit outside a little longer.",
      }),
    }),
    pack("event-aug-27", "Aug 27: last summer crowd", "events", {
      audience: "List + accounts (this IS Thursday)",
      job: "Labor Day weekend. Last chance at a summer pitcher.",
      sendWhen: "Thursday Aug 27, 2026",
      email: thursdayFeaturedDraftTemplate({
        ...SAMPLE,
        headline: "Last big weekend of summer.",
        intro: "Labor Day is the last long weekend that still feels like July. Make one sangria. Wine, fruit, a pitcher. Fill glasses until the potato salad is gone. This is not the week to become the bartender.",
        subject: "Last chance for a summer pitcher",
        previewText: "Wine, fruit, ice. The last patio weekend of the year.",
        featured: { ...d.sangria, label: "The one pitcher" },
        related: [d.electric, d.virginMojito],
        relatedHeading: "Same weather, smaller glass",
        occasion: { slug: "summer", label: "More summer drinks" },
        ctaLabel: "Get the pitcher recipe",
        signoff: "Don't become the bartender.",
      }),
    }),
    pack("event-sep-3", "Sep 3: Labor Day, last patio drinks", "events", {
      audience: "List + accounts (this IS Thursday)",
      job: "Labor Day Monday. Last chance at mint, ginger, and sitting outside.",
      sendWhen: "Thursday Sep 3, 2026 (Labor Day is Mon Sep 7)",
      email: thursdayFeaturedDraftTemplate({
        ...SAMPLE,
        headline: "Labor Day. Last patio drinks of the year.",
        intro: "Monday is the holiday. After that the light changes and the drinks get quieter. A Gin Gin Mule is mint, ginger, lime, and gin over a lot of ice. Build it, take it outside, pretend it's still July.",
        subject: "Last patio drink of the year",
        previewText: "Gin, mint, ginger, lime. Take it outside while you still can.",
        featured: { ...d.mule, label: "Built in the glass" },
        related: [d.smash, d.strawberryDaiquiri],
        relatedHeading: "More ice, same idea",
        occasion: { slug: "summer", label: "More summer drinks" },
        ctaLabel: "Get the recipe",
        signoff: "Take it outside.",
      }),
    }),
    pack("event-sep-10", "Sep 10: Bourbon Heritage, quieter nights", "events", {
      audience: "List + accounts (this IS Thursday)",
      job: "Spirit-forward as the lights go on earlier. Fall teaser.",
      sendWhen: "Thursday Sep 10, 2026",
      email: thursdayFeaturedDraftTemplate({
        ...SAMPLE,
        headline: "The porch drinks got quieter.",
        intro: "September decided it was Bourbon Heritage Month, which mostly means we can stop pretending it's still spritz season. Sugar, bitters, bourbon. A cube that takes itself seriously.",
        subject: "Bourbon month. Big cube.",
        previewText: "Sugar, bitters, bourbon. September can be this quiet.",
        featured: { ...d.oldFashioned, label: "After dark" },
        related: [d.maple, d.manhattan],
        relatedHeading: "Same whiskey, different sweater",
        occasion: { slug: "fall", label: "Fall drinks" },
        ctaLabel: "Make the Old Fashioned",
        signoff: "Lights on earlier is not a crisis.",
      }),
    }),
    pack("event-sep-17", "Sep 17: Paloma / ranch water week", "events", {
      audience: "List + accounts (this IS Thursday)",
      job: "Mexican Independence was yesterday. Keep it cold and simple.",
      sendWhen: "Thursday Sep 17, 2026",
      email: thursdayFeaturedDraftTemplate({
        ...SAMPLE,
        headline: "Yesterday was a holiday. Today is a Paloma.",
        intro: "Mexican Independence Day was Wednesday. The correct follow-up is not a themed menu. It's tequila, grapefruit, and enough ice that the glass sweats. Ranch Water if you want even less work.",
        subject: "Grapefruit, tequila, done",
        previewText: "Tequila, grapefruit, a stupid amount of ice.",
        featured: { ...d.paloma, label: "Highball weather" },
        related: [d.ranch, d.margarita],
        relatedHeading: "Still tequila",
        occasion: { slug: "summer", label: "More highballs" },
        ctaLabel: "I'll Paloma this",
        signoff: "Salt the rim if you must.",
      }),
    }),
    pack("event-sep-24", "Sep 24: fall equinox", "events", {
      audience: "List + accounts (this IS Thursday)",
      job: "Switch the catalog to fall. Cider, maple, orchard.",
      sendWhen: "Thursday Sep 24, 2026 (equinox was Sep 22)",
      email: thursdayFeaturedDraftTemplate({
        ...SAMPLE,
        headline: "Fall showed up on Tuesday.",
        intro: "Equinox was two days ago, which you could feel even if you didn't look it up. Cider in the Old Fashioned. Maple if you've got it. A glass you can hold without leaving a puddle.",
        subject: "The light changed. So did the drink.",
        previewText: "Bourbon and cider in a rocks glass. Fall without the cinnamon lecture.",
        featured: { ...d.ciderOld, label: "First sweater drink" },
        related: [d.maple, d.stoneFence],
        relatedHeading: "More orchard, less patio",
        occasion: { slug: "fall", label: "The fall collection" },
        ctaLabel: "Get the recipe",
        signoff: "Welcome to the other half of the year.",
      }),
    }),
    pack("event-oct-1", "Oct 1: game day / Oktoberfest", "events", {
      audience: "List + accounts (this IS Thursday)",
      job: "Beer-adjacent and hosting. Not a costume yet.",
      sendWhen: "Thursday Oct 1, 2026",
      email: thursdayFeaturedDraftTemplate({
        ...SAMPLE,
        headline: "Nobody is shaking a cocktail at 3rd and 8.",
        intro: "Football is on. Oktoberfest is still hanging around. A Michelada is beer, lime, and spice in a glass you can set down without a ceremony. Paloma if the beer people lose the vote.",
        subject: "Between plays, drink this",
        previewText: "Beer, lime, a little heat. Set it down. Watch the play.",
        featured: { ...d.michelada, label: "During the game" },
        related: [d.paloma, d.sangria],
        relatedHeading: "If the beer isn't happening",
        occasion: { slug: "party", label: "Crowd drinks" },
        ctaLabel: "I'll drink this during the game",
        signoff: "Mute the commercials.",
      }),
    }),
    pack("event-oct-8", "Oct 8: Halloween, early", "events", {
      audience: "List + accounts (this IS Thursday)",
      job: "Theatrical drinks that are still worth drinking. Three weeks of runway.",
      sendWhen: "Thursday Oct 8, 2026 (Halloween is Oct 31)",
      email: thursdayFeaturedDraftTemplate({
        ...SAMPLE,
        headline: "Three weeks. Plenty of time to get weird.",
        intro: "Halloween is October 31, which means we have a minute. Black Magic is vodka, coffee liqueur, and lime. Dark enough for the party. Still a drink you'd finish in July. Save the plastic spiders for the porch.",
        subject: "Halloween drinks that aren't candy",
        previewText: "Vodka, coffee liqueur, lime. Costume-dark. Still drinkable.",
        featured: { ...d.blackMagic, label: "Early, on purpose" },
        related: [d.corpse, d.bloodSand],
        relatedHeading: "Same month, less costume",
        occasion: { slug: "halloween", label: "Halloween drinks" },
        ctaLabel: "Get the recipe",
        signoff: "The costume can wait.",
      }),
    }),
  ];

  return [...lifecycle, ...weekly, ...events];
}

function pack(
  slug: string,
  name: string,
  group: EmailDraftGroup,
  opts: {
    audience: string;
    job: string;
    sendWhen: string;
    email: { subject: string; html: string; text: string };
  }
): EmailDraft {
  return {
    slug,
    name,
    group,
    audience: opts.audience,
    job: opts.job,
    sendWhen: opts.sendWhen,
    subject: opts.email.subject,
    preview: extractPreview(opts.email.html) || opts.email.subject,
    html: opts.email.html,
    text: opts.email.text,
  };
}

function extractPreview(html: string): string {
  const match = html.match(
    /<div style="display:none;font-size:1px;[\s\S]*?">([^<&]+)/
  );
  return match?.[1]?.trim() || "";
}

export function emailDraftGroups(): { id: EmailDraftGroup; label: string }[] {
  return [
    { id: "lifecycle", label: "Account & list drip" },
    { id: "weekly", label: "Weekly cadence" },
    { id: "events", label: "Event Thursdays (next 8 weeks)" },
  ];
}

