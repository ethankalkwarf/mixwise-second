/**
 * Weekend re-engagement campaign.
 * Same drinks for every recipient. Header/footer match the weekly digest.
 * Defaults use email-sized JPEGs on Vercel Blob. Catalog overrides that still
 * point at Supabase Storage are rewritten through MixWise image delivery.
 */

import { EMAIL_SERIF, baseStyles, getPreheaderHtml, type EmailTemplate } from "@/lib/email/templates";
import { toPublicDeliveryUrl } from "@/lib/mediaDelivery";

export const WEEKEND_KICKOFF_TEMPLATE_ALIAS = "weekend-kickoff";
export const WEEKEND_KICKOFF_SUBJECT = "The weekend called. It wants a spritz.";
export const WEEKEND_KICKOFF_PREVIEW =
  "If your AC is working overtime, your shaker should be too.";

export type WeekendKickoffMode = "literal" | "resend-template" | "resend-broadcast";

export type WeekendDrinkBlock = {
  label: string;
  name: string;
  blurb: string;
  url: string;
  imageUrl: string;
  imageAlt: string;
  altName?: string;
  altUrl?: string;
  altLead?: string;
};

export type WeekendExtraDrink = {
  name: string;
  blurb: string;
  url: string;
  imageUrl: string;
  imageAlt: string;
};

export type WeekendKickoffContent = {
  hero: WeekendDrinkBlock;
  saturday: WeekendDrinkBlock;
  saturdayNight: WeekendDrinkBlock;
  extras: [WeekendExtraDrink, WeekendExtraDrink, WeekendExtraDrink];
  ctaUrl: string;
};

const SITE = "https://www.getmixwise.com";
const EMAIL_IMG =
  "https://ehexkpoxir62prtp.public.blob.vercel-storage.com/email/weekend-kickoff";

/** Email-sized JPEGs on MixWise's public image host (Gmail can fetch these). */
export const WEEKEND_KICKOFF_DEFAULTS: WeekendKickoffContent = {
  hero: {
    label: "Friday night",
    name: "Limoncello Spritz",
    blurb:
      "Lemon, bubbles, and the last of the daylight. Built in the glass — it's too hot to shake anything.",
    url: `${SITE}/cocktails/limoncello-spritz`,
    imageUrl: `${EMAIL_IMG}/limoncello-spritz-lMpa2ARSjsMZmQUqiFp96u54glmy2e.jpg`,
    imageAlt: "Limoncello Spritz in a wine glass over ice, garnished with a lemon wheel",
    altLead: "Rather go bitter and orange?",
    altName: "Aperol Spritz",
    altUrl: `${SITE}/cocktails/aperol-spritz`,
  },
  saturday: {
    label: "Saturday",
    name: "Paloma",
    blurb:
      "Tequila, grapefruit, a pile of ice. Official drink of sitting outside until the mosquitoes win.",
    url: `${SITE}/cocktails/paloma`,
    imageUrl: `${EMAIL_IMG}/paloma-Ekt5sOsruN7X4ake9BpzmPzLZlTKek.jpg`,
    imageAlt: "Paloma in a highball glass over ice with a lime wedge",
    altLead: "Feeling smoky?",
    altName: "Mezcal Paloma",
    altUrl: `${SITE}/cocktails/mezcal-paloma`,
  },
  saturdayNight: {
    label: "Saturday night",
    name: "Whiskey Smash",
    blurb:
      "Mint, lemon, crushed ice. For when the sun finally drops and nobody's going inside.",
    url: `${SITE}/cocktails/whiskey-smash`,
    imageUrl: `${EMAIL_IMG}/whiskey-smash-JvShfYtbKdYO7bpOkDFs3yrNyTbv5D.jpg`,
    imageAlt: "Whiskey Smash over crushed ice with mint and lemon",
    altLead: "Gin people:",
    altName: "Gin Gin Mule",
    altUrl: `${SITE}/cocktails/gin-gin-mule`,
  },
  extras: [
    {
      name: "Sangria",
      blurb: "Pitcher weather. Make one, share it, don't overthink it.",
      url: `${SITE}/cocktails/sangria`,
      imageUrl: `${EMAIL_IMG}/sangria-dT0RnkLVETBQqGMKVPxzxgQNpupVj5.jpg`,
      imageAlt: "Sangria in a wine glass with citrus and berries",
    },
    {
      name: "Mimosa",
      blurb: "Sunday, but make it fizzy.",
      url: `${SITE}/cocktails/mimosa`,
      imageUrl: `${EMAIL_IMG}/mimosa-a7FfCbiowNHrNcVYvBLXHK1xC1Zxsw.jpg`,
      imageAlt: "Mimosa in a champagne flute",
    },
    {
      name: "Virgin Mojito",
      blurb: "Same mint, same lime, zero hangover. Still tastes like a weekend.",
      url: `${SITE}/cocktails/virgin-mojito`,
      imageUrl: `${EMAIL_IMG}/virgin-mojito-vk5TTDhrBn3ydPm5o7WW7uE9XooOdn.jpg`,
      imageAlt: "Virgin Mojito over ice with mint and lime",
    },
  ],
  ctaUrl: `${SITE}/mix`,
};

export const WEEKEND_KICKOFF_IMAGE_SLUGS = [
  "limoncello-spritz",
  "paloma",
  "whiskey-smash",
  "sangria",
  "mimosa",
  "virgin-mojito",
] as const;

export function firstNameFromDisplayName(displayName?: string | null, email?: string | null): string {
  const fromName = displayName?.trim().split(/\s+/)[0];
  if (fromName) return fromName;
  const fromEmail = email?.split("@")[0];
  if (fromEmail) return fromEmail;
  return "there";
}

export function applyCatalogImages(
  content: WeekendKickoffContent,
  imageBySlug: Map<string, string>
): WeekendKickoffContent {
  const next = structuredClone(content);
  const assign = (slug: string, setter: (url: string) => void) => {
    const url = imageBySlug.get(slug);
    if (url) setter(toPublicDeliveryUrl(url, "email") || url);
  };
  assign("limoncello-spritz", (url) => {
    next.hero.imageUrl = url;
  });
  assign("paloma", (url) => {
    next.saturday.imageUrl = url;
  });
  assign("whiskey-smash", (url) => {
    next.saturdayNight.imageUrl = url;
  });
  assign("sangria", (url) => {
    next.extras[0].imageUrl = url;
  });
  assign("mimosa", (url) => {
    next.extras[1].imageUrl = url;
  });
  assign("virgin-mojito", (url) => {
    next.extras[2].imageUrl = url;
  });
  return next;
}

export function weekendKickoffResendVariables(content: WeekendKickoffContent) {
  const stringVar = (key: string, fallbackValue: string) =>
    ({ key, type: "string" as const, fallbackValue });

  return [
    stringVar("HERO_IMAGE", content.hero.imageUrl),
    stringVar("HERO_ALT", content.hero.imageAlt),
    stringVar("DRINK1_LABEL", content.hero.label),
    stringVar("DRINK1_NAME", content.hero.name),
    stringVar("DRINK1_BLURB", content.hero.blurb),
    stringVar("DRINK1_URL", content.hero.url),
    stringVar("DRINK1_ALT_LEAD", content.hero.altLead || ""),
    stringVar("DRINK1_ALT_NAME", content.hero.altName || ""),
    stringVar("DRINK1_ALT_URL", content.hero.altUrl || ""),
    stringVar("DRINK2_LABEL", content.saturday.label),
    stringVar("DRINK2_NAME", content.saturday.name),
    stringVar("DRINK2_BLURB", content.saturday.blurb),
    stringVar("DRINK2_URL", content.saturday.url),
    stringVar("DRINK2_IMAGE", content.saturday.imageUrl),
    stringVar("DRINK2_ALT", content.saturday.imageAlt),
    stringVar("DRINK2_ALT_LEAD", content.saturday.altLead || ""),
    stringVar("DRINK2_ALT_NAME", content.saturday.altName || ""),
    stringVar("DRINK2_ALT_URL", content.saturday.altUrl || ""),
    stringVar("DRINK3_LABEL", content.saturdayNight.label),
    stringVar("DRINK3_NAME", content.saturdayNight.name),
    stringVar("DRINK3_BLURB", content.saturdayNight.blurb),
    stringVar("DRINK3_URL", content.saturdayNight.url),
    stringVar("DRINK3_IMAGE", content.saturdayNight.imageUrl),
    stringVar("DRINK3_ALT", content.saturdayNight.imageAlt),
    stringVar("DRINK3_ALT_LEAD", content.saturdayNight.altLead || ""),
    stringVar("DRINK3_ALT_NAME", content.saturdayNight.altName || ""),
    stringVar("DRINK3_ALT_URL", content.saturdayNight.altUrl || ""),
    stringVar("EXTRA1_NAME", content.extras[0].name),
    stringVar("EXTRA1_BLURB", content.extras[0].blurb),
    stringVar("EXTRA1_URL", content.extras[0].url),
    stringVar("EXTRA1_IMAGE", content.extras[0].imageUrl),
    stringVar("EXTRA1_ALT", content.extras[0].imageAlt),
    stringVar("EXTRA2_NAME", content.extras[1].name),
    stringVar("EXTRA2_BLURB", content.extras[1].blurb),
    stringVar("EXTRA2_URL", content.extras[1].url),
    stringVar("EXTRA2_IMAGE", content.extras[1].imageUrl),
    stringVar("EXTRA2_ALT", content.extras[1].imageAlt),
    stringVar("EXTRA3_NAME", content.extras[2].name),
    stringVar("EXTRA3_BLURB", content.extras[2].blurb),
    stringVar("EXTRA3_URL", content.extras[2].url),
    stringVar("EXTRA3_IMAGE", content.extras[2].imageUrl),
    stringVar("EXTRA3_ALT", content.extras[2].imageAlt),
    stringVar("CTA_URL", content.ctaUrl),
    stringVar("GIVEN_NAME", "there"),
  ];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function attr(mode: WeekendKickoffMode, key: string, fallback: string): string {
  if (mode === "resend-template") return `{{{${key}}}}`;
  return escapeHtml(fallback);
}

function text(mode: WeekendKickoffMode, key: string, fallback: string): string {
  if (mode === "resend-template") return `{{{${key}}}}`;
  return escapeHtml(fallback);
}

function greetingName(mode: WeekendKickoffMode, firstName?: string): string {
  if (mode === "resend-broadcast") return "{{{contact.first_name|there}}}";
  if (mode === "resend-template") return "{{{GIVEN_NAME}}}";
  return escapeHtml(firstName || "there");
}

function footerEmail(mode: WeekendKickoffMode, userEmail?: string): string {
  if (mode === "resend-broadcast") return "{{{contact.email}}}";
  if (mode === "resend-template") return "{{{EMAIL}}}";
  return escapeHtml(userEmail || "");
}

function unsubscribeHref(mode: WeekendKickoffMode, unsubscribeUrl?: string): string {
  if (mode === "resend-broadcast" || mode === "resend-template") {
    return "{{{RESEND_UNSUBSCRIBE_URL}}}";
  }
  return escapeHtml(unsubscribeUrl || `${SITE}/unsubscribe`);
}

function catalogImage(opts: {
  mode: WeekendKickoffMode;
  imageKey: string;
  altKey: string;
  urlKey: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
}): string {
  const deliveryUrl = toPublicDeliveryUrl(opts.imageUrl, "email") || opts.imageUrl;
  return `
      <a href="${attr(opts.mode, opts.urlKey, opts.href)}" style="display:block;text-decoration:none;line-height:0;">
        <img src="${attr(opts.mode, opts.imageKey, deliveryUrl)}" alt="${attr(opts.mode, opts.altKey, opts.imageAlt)}" width="560" style="display:block;width:100%;max-width:560px;height:auto;border:0;" />
      </a>
  `;
}

function featuredDrinkCard(opts: {
  mode: WeekendKickoffMode;
  drink: WeekendDrinkBlock;
  imageKey: string;
  altKey: string;
  labelKey: string;
  nameKey: string;
  blurbKey: string;
  urlKey: string;
  altLeadKey: string;
  altNameKey: string;
  altUrlKey: string;
}): string {
  const { mode, drink } = opts;
  return `
    <div style="background-color: #3A4D39; background: linear-gradient(135deg, #3A4D39 0%, #5F6F5E 100%); border-radius: 16px; overflow: hidden; margin: 24px 0;">
      ${catalogImage({
        mode,
        imageKey: opts.imageKey,
        altKey: opts.altKey,
        urlKey: opts.urlKey,
        imageUrl: drink.imageUrl,
        imageAlt: drink.imageAlt,
        href: drink.url,
      })}
      <div style="background-color: #3A4D39; padding: 24px; text-align: center;">
        <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #8A9A5B;">${text(mode, opts.labelKey, drink.label)}</p>
        <h3 style="margin: 0 0 12px 0; font-family: ${EMAIL_SERIF}; font-size: 28px; color: #FFFFFF;">${text(mode, opts.nameKey, drink.name)}</h3>
        <p style="margin: 0 0 16px 0; font-size: 14px; color: #E6EBE4; line-height: 1.5;">${text(mode, opts.blurbKey, drink.blurb)}</p>
        <a href="${attr(mode, opts.urlKey, drink.url)}" style="display: inline-block; background-color: #BC5A45; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 25px; font-size: 14px; font-weight: 600;">View Recipe →</a>
        ${
          drink.altName && drink.altUrl
            ? `<p style="margin: 14px 0 0 0; font-size: 13px; color: #E6EBE4;">${text(mode, opts.altLeadKey, drink.altLead || "")} <a href="${attr(mode, opts.altUrlKey, drink.altUrl)}" style="color: #FFFFFF; font-weight: 600; text-decoration: none;">${text(mode, opts.altNameKey, drink.altName)}</a></p>`
            : ""
        }
      </div>
    </div>
  `;
}

function creamDrinkCard(opts: {
  mode: WeekendKickoffMode;
  drink: WeekendDrinkBlock;
  imageKey: string;
  altKey: string;
  labelKey: string;
  nameKey: string;
  blurbKey: string;
  urlKey: string;
  altLeadKey: string;
  altNameKey: string;
  altUrlKey: string;
}): string {
  const { mode, drink } = opts;
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 24px 0; background-color: #F9F7F2; border: 1px solid #E6EBE4; border-radius: 16px; overflow: hidden;">
      <tr>
        <td style="padding: 0;">
          ${catalogImage({
            mode,
            imageKey: opts.imageKey,
            altKey: opts.altKey,
            urlKey: opts.urlKey,
            imageUrl: drink.imageUrl,
            imageAlt: drink.imageAlt,
            href: drink.url,
          })}
        </td>
      </tr>
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #5F6F5E;">${text(mode, opts.labelKey, drink.label)}</p>
          <h3 style="margin: 0 0 10px 0; font-family: ${EMAIL_SERIF}; font-size: 22px; color: #3A4D39;">
            <a href="${attr(mode, opts.urlKey, drink.url)}" style="color: #3A4D39; text-decoration: none;">${text(mode, opts.nameKey, drink.name)}</a>
          </h3>
          <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #2C3628;">${text(mode, opts.blurbKey, drink.blurb)}</p>
          <p style="margin: 0 0 8px 0;">
            <a href="${attr(mode, opts.urlKey, drink.url)}" style="color: #BC5A45; text-decoration: none; font-weight: 600; font-size: 14px;">View Recipe →</a>
          </p>
          ${
            drink.altName && drink.altUrl
              ? `<p style="margin: 0; font-size: 13px; color: #5F6F5E;">${text(mode, opts.altLeadKey, drink.altLead || "")} <a href="${attr(mode, opts.altUrlKey, drink.altUrl)}" style="color: #3A4D39; font-weight: 600; text-decoration: none;">${text(mode, opts.altNameKey, drink.altName)}</a></p>`
              : ""
          }
        </td>
      </tr>
    </table>
  `;
}

function extraRow(opts: {
  mode: WeekendKickoffMode;
  extra: WeekendExtraDrink;
  nameKey: string;
  blurbKey: string;
  urlKey: string;
  imageKey: string;
  altKey: string;
}): string {
  const { mode, extra } = opts;
  const deliveryUrl = toPublicDeliveryUrl(extra.imageUrl, "emailThumb") || extra.imageUrl;
  return `
    <tr>
      <td style="padding: 12px 16px; background-color: #F9F7F2; border-radius: 12px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td width="72" valign="middle" style="width: 72px; padding-right: 14px;">
              <a href="${attr(mode, opts.urlKey, extra.url)}" style="display: block; text-decoration: none;">
                <img src="${attr(mode, opts.imageKey, deliveryUrl)}" alt="${attr(mode, opts.altKey, extra.imageAlt)}" width="72" height="72" style="display: block; width: 72px; height: 72px; object-fit: cover; border-radius: 12px; border: 0;" />
              </a>
            </td>
            <td valign="middle">
              <a href="${attr(mode, opts.urlKey, extra.url)}" style="color: #3A4D39; text-decoration: none; font-weight: 600; font-size: 16px;">${text(mode, opts.nameKey, extra.name)}</a>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #5F6F5E;">${text(mode, opts.blurbKey, extra.blurb)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height: 8px;"></td></tr>
  `;
}

export function weekendKickoffTemplate({
  content = WEEKEND_KICKOFF_DEFAULTS,
  mode = "literal",
  firstName,
  userEmail,
  unsubscribeUrl,
}: {
  content?: WeekendKickoffContent;
  mode?: WeekendKickoffMode;
  firstName?: string;
  userEmail?: string;
  unsubscribeUrl?: string;
} = {}): EmailTemplate {
  const year = new Date().getFullYear();
  const sentTo = footerEmail(mode, userEmail);

  const html = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>${escapeHtml(WEEKEND_KICKOFF_SUBJECT)}</title>
  ${baseStyles}
</head>
<body>
  ${getPreheaderHtml(WEEKEND_KICKOFF_PREVIEW)}
  <div class="email-wrapper">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="email-container" style="max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 30px -8px rgba(0, 0, 0, 0.1); border: 1px solid #E6EBE4;">
      
      <!-- Header -->
      <tr>
        <td class="email-header" bgcolor="#3A4D39" style="background-color: #3A4D39; background: linear-gradient(135deg, #3A4D39 0%, #5F6F5E 100%); padding: 48px 40px; text-align: center;">
          <h1 class="logo" style="font-family: ${EMAIL_SERIF}; font-size: 36px; font-weight: 700; color: #FFFFFF; margin: 0; letter-spacing: -0.5px;">
            mixwise.
          </h1>
        </td>
      </tr>
      
      <!-- Content -->
      <tr>
        <td class="email-content" style="padding: 48px 40px;">
          <h2 style="font-family: ${EMAIL_SERIF}; font-size: 24px; color: #3A4D39; margin: 0 0 8px 0; font-weight: 400;">
            Happy Friday, ${greetingName(mode, firstName)}! ☀️
          </h2>
          
          <p class="body-text" style="font-size: 16px; color: #2C3628; margin: 0 0 24px 0; line-height: 1.65;">
            If your AC is working overtime, your shaker should be too. A few cold ones for the next 48 hours.
          </p>

          ${featuredDrinkCard({
            mode,
            drink: content.hero,
            imageKey: "HERO_IMAGE",
            altKey: "HERO_ALT",
            labelKey: "DRINK1_LABEL",
            nameKey: "DRINK1_NAME",
            blurbKey: "DRINK1_BLURB",
            urlKey: "DRINK1_URL",
            altLeadKey: "DRINK1_ALT_LEAD",
            altNameKey: "DRINK1_ALT_NAME",
            altUrlKey: "DRINK1_ALT_URL",
          })}

          ${creamDrinkCard({
            mode,
            drink: content.saturday,
            imageKey: "DRINK2_IMAGE",
            altKey: "DRINK2_ALT",
            labelKey: "DRINK2_LABEL",
            nameKey: "DRINK2_NAME",
            blurbKey: "DRINK2_BLURB",
            urlKey: "DRINK2_URL",
            altLeadKey: "DRINK2_ALT_LEAD",
            altNameKey: "DRINK2_ALT_NAME",
            altUrlKey: "DRINK2_ALT_URL",
          })}

          ${creamDrinkCard({
            mode,
            drink: content.saturdayNight,
            imageKey: "DRINK3_IMAGE",
            altKey: "DRINK3_ALT",
            labelKey: "DRINK3_LABEL",
            nameKey: "DRINK3_NAME",
            blurbKey: "DRINK3_BLURB",
            urlKey: "DRINK3_URL",
            altLeadKey: "DRINK3_ALT_LEAD",
            altNameKey: "DRINK3_ALT_NAME",
            altUrlKey: "DRINK3_ALT_URL",
          })}

          <div style="margin-bottom: 32px;">
            <h3 style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #5F6F5E; margin: 0 0 16px 0;">
              Also worth making
            </h3>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              ${extraRow({
                mode,
                extra: content.extras[0],
                nameKey: "EXTRA1_NAME",
                blurbKey: "EXTRA1_BLURB",
                urlKey: "EXTRA1_URL",
                imageKey: "EXTRA1_IMAGE",
                altKey: "EXTRA1_ALT",
              })}
              ${extraRow({
                mode,
                extra: content.extras[1],
                nameKey: "EXTRA2_NAME",
                blurbKey: "EXTRA2_BLURB",
                urlKey: "EXTRA2_URL",
                imageKey: "EXTRA2_IMAGE",
                altKey: "EXTRA2_ALT",
              })}
              ${extraRow({
                mode,
                extra: content.extras[2],
                nameKey: "EXTRA3_NAME",
                blurbKey: "EXTRA3_BLURB",
                urlKey: "EXTRA3_URL",
                imageKey: "EXTRA3_IMAGE",
                altKey: "EXTRA3_ALT",
              })}
            </table>
          </div>

          <div class="button-wrapper" style="text-align: center; margin: 32px 0;">
            <a href="${attr(mode, "CTA_URL", content.ctaUrl)}" class="btn-primary" style="display: inline-block; background-color: #BC5A45; background: linear-gradient(135deg, #BC5A45 0%, #A04532 100%); color: #FFFFFF; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-weight: 600; font-size: 16px;">
              See what you can mix →
            </a>
          </div>
          
          <div class="divider" style="height: 1px; background: linear-gradient(90deg, transparent, #D1DAD0, transparent); margin: 32px 0;"></div>
          
          <p class="muted-text" style="font-size: 14px; color: #5F6F5E; margin: 0; line-height: 1.6; text-align: center;">
            Cheers to a great weekend — Ethan at MixWise
          </p>
        </td>
      </tr>
      
      <!-- Footer -->
      <tr>
        <td class="email-footer" style="background-color: #E6EBE4; padding: 32px 40px; text-align: center; border-top: 1px solid #D1DAD0;">
          <p class="footer-text" style="font-size: 13px; color: #5F6F5E; margin: 0 0 12px 0;">
            This email was sent to <strong>${sentTo}</strong>
          </p>
          <p class="footer-text" style="font-size: 13px; color: #5F6F5E; margin: 0;">
            © ${year} MixWise · A smarter way to make cocktails at home
          </p>
          <div class="footer-links" style="margin: 16px 0 0 0;">
            <a href="https://www.getmixwise.com" style="color: #3A4D39; text-decoration: none; font-size: 13px; margin: 0 8px;">Visit MixWise</a>
            <span style="color: #D1DAD0;">|</span>
            <a href="${unsubscribeHref(mode, unsubscribeUrl)}" style="color: #5F6F5E; text-decoration: none; font-size: 13px; margin: 0 8px;">Unsubscribe</a>
          </div>
        </td>
      </tr>
      
    </table>
  </div>
</body>
</html>
  `.trim();

  const textVersion = `
Happy Friday, ${firstName || "there"}!

If your AC is working overtime, your shaker should be too. A few cold ones for the next 48 hours.

FRIDAY — ${content.hero.name}
${content.hero.blurb}
${content.hero.url}
${content.hero.altName ? `${content.hero.altLead || ""} ${content.hero.altName}: ${content.hero.altUrl}` : ""}

SATURDAY — ${content.saturday.name}
${content.saturday.blurb}
${content.saturday.url}
${content.saturday.altName ? `${content.saturday.altLead || ""} ${content.saturday.altName}: ${content.saturday.altUrl}` : ""}

SATURDAY NIGHT — ${content.saturdayNight.name}
${content.saturdayNight.blurb}
${content.saturdayNight.url}
${content.saturdayNight.altName ? `${content.saturdayNight.altLead || ""} ${content.saturdayNight.altName}: ${content.saturdayNight.altUrl}` : ""}

ALSO WORTH MAKING
${content.extras.map((extra) => `${extra.name} — ${extra.blurb}\n${extra.url}`).join("\n\n")}

See what you can mix: ${content.ctaUrl}

Cheers to a great weekend — Ethan at MixWise

---
This email was sent to ${mode === "literal" ? userEmail || "" : "{{{contact.email}}}"}
© ${year} MixWise · A smarter way to make cocktails at home
https://www.getmixwise.com

Unsubscribe: ${mode === "literal" ? unsubscribeUrl || `${SITE}/unsubscribe` : "{{{RESEND_UNSUBSCRIBE_URL}}}"}
  `.trim();

  return {
    subject: WEEKEND_KICKOFF_SUBJECT,
    html,
    text: textVersion,
  };
}
