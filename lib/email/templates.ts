/**
 * Email Templates
 *
 * Dual chrome system (approved direction):
 * - `studio`  — Studio White (Apple/Airbnb): photo-forward marketing
 * - `masthead` — Forest Masthead: auth / transactional / brand-led
 */

import { ACCOUNT_BENEFITS } from "@/lib/accountBenefits";
import { toPublicDeliveryUrl } from "@/lib/mediaDelivery";

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/** studio = marketing / photos · masthead = auth / transactional */
export type EmailChromeTheme = "studio" | "masthead";

export function escapeEmailHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getPreheaderHtml(previewText: string): string {
  const whitespace = "&nbsp;".repeat(100) + "&zwnj;".repeat(50);
  return `
    <!--[if !mso]><!-->
    <div style="display:none;font-size:1px;color:#FFFFFF;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
      ${escapeEmailHtml(previewText)}${whitespace}
    </div>
    <!--<![endif]-->
  `;
}

export const EMAIL_SERIF = "Georgia, 'Times New Roman', Times, serif";

export const EMAIL_SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

export const EMAIL_LOGO_VERSION = "20260820c";
export const EMAIL_DEFAULT_SITE = "https://www.getmixwise.com";

export function emailLogoUrl(
  siteUrl = EMAIL_DEFAULT_SITE,
  variant: "dark" | "cream" = "dark"
): string {
  const base = siteUrl.replace(/\/$/, "");
  const file =
    variant === "cream" ? "mixwise-lockup-cream.png" : "mixwise-lockup.png";
  return `${base}/brand/${file}?v=${EMAIL_LOGO_VERSION}`;
}

/** Studio White CTA — near-black, square. */
export const EMAIL_BTN_STUDIO =
  "display:inline-block;background-color:#111111;color:#FFFFFF;text-decoration:none;padding:14px 24px;border-radius:0;font-weight:600;font-size:15px;letter-spacing:0.01em;border:0;line-height:1.2;";

/** Forest Masthead CTA — terracotta, soft square. */
export const EMAIL_BTN_MASTHEAD =
  "display:inline-block;background-color:#BC5A45;color:#FFFFFF;text-decoration:none;padding:14px 28px;border-radius:4px;font-weight:600;font-size:15px;letter-spacing:0.01em;border:0;line-height:1.2;";

/** @deprecated Prefer emailBtnPrimary(theme) */
export const EMAIL_BTN_PRIMARY = EMAIL_BTN_MASTHEAD;

export const EMAIL_BTN_SECONDARY =
  "display:inline-block;background-color:#3A4D39;color:#FFFFFF;text-decoration:none;padding:14px 28px;border-radius:4px;font-weight:600;font-size:15px;letter-spacing:0.01em;border:0;line-height:1.2;";

export const EMAIL_LINK_CTA_STUDIO =
  "color:#111111;text-decoration:none;font-weight:600;font-size:15px;border-bottom:1px solid #111111;";

export const EMAIL_LINK_CTA_MASTHEAD =
  "color:#3A4D39;text-decoration:none;font-weight:600;font-size:15px;border-bottom:1px solid #3A4D39;";

/** @deprecated Prefer emailLinkCta(theme) */
export const EMAIL_LINK_CTA = EMAIL_LINK_CTA_STUDIO;

export function emailBtnPrimary(theme: EmailChromeTheme = "studio"): string {
  return theme === "masthead" ? EMAIL_BTN_MASTHEAD : EMAIL_BTN_STUDIO;
}

export function emailLinkCta(theme: EmailChromeTheme = "studio"): string {
  return theme === "masthead" ? EMAIL_LINK_CTA_MASTHEAD : EMAIL_LINK_CTA_STUDIO;
}

export function emailLogoHtml(
  siteUrl = EMAIL_DEFAULT_SITE,
  theme: EmailChromeTheme = "studio"
): string {
  const href = escapeEmailHtml(siteUrl);
  const cream = theme === "masthead";
  const src = escapeEmailHtml(emailLogoUrl(siteUrl, cream ? "cream" : "dark"));
  const width = cream ? 148 : 120;
  return `<a href="${href}" style="display:inline-block;text-decoration:none;line-height:0;">
            <img src="${src}" alt="mixwise" width="${width}" style="display:block;${cream ? "margin:0 auto;" : ""}width:${width}px;height:auto;border:0;outline:none;" />
          </a>`;
}

export function emailHeaderHtml(
  siteUrl = EMAIL_DEFAULT_SITE,
  theme: EmailChromeTheme = "studio"
): string {
  if (theme === "masthead") {
    return `
      <tr>
        <td class="email-header" bgcolor="#3A4D39" style="background-color:#3A4D39;padding:40px 48px;text-align:center;">
          ${emailLogoHtml(siteUrl, "masthead")}
        </td>
      </tr>`;
  }
  return `
      <tr>
        <td class="email-header" bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:40px 48px 24px 48px;text-align:left;">
          ${emailLogoHtml(siteUrl, "studio")}
        </td>
      </tr>`;
}

export function emailFooterHtml({
  userEmail,
  unsubscribeUrl,
  siteUrl = EMAIL_DEFAULT_SITE,
  tagline,
  theme = "studio",
}: {
  userEmail?: string;
  unsubscribeUrl?: string;
  siteUrl?: string;
  tagline?: string;
  theme?: EmailChromeTheme;
}): string {
  const year = new Date().getFullYear();
  const safeSite = escapeEmailHtml(siteUrl);
  const muted = theme === "masthead" ? "#5F6F5E" : "#999999";
  const bits: string[] = [
    `<a href="${safeSite}" style="color:${muted};text-decoration:none;">getmixwise.com</a>`,
  ];
  if (unsubscribeUrl) {
    bits.push(
      `<a href="${escapeEmailHtml(unsubscribeUrl)}" style="color:${muted};text-decoration:none;">Unsubscribe</a>`
    );
  }
  const sent = userEmail?.trim()
    ? `<p style="margin:0 0 10px 0;font-size:12px;line-height:1.5;color:${muted};">Sent to ${escapeEmailHtml(userEmail.trim())}</p>`
    : "";

  if (theme === "masthead") {
    return `
      <tr>
        <td class="email-footer" bgcolor="#E6EBE4" style="background-color:#E6EBE4;padding:32px 48px;text-align:center;">
          ${sent}
          <p style="margin:0 0 8px 0;font-size:12px;line-height:1.5;color:#5F6F5E;">
            © ${year} MixWise${tagline ? ` · ${escapeEmailHtml(tagline)}` : ""}
          </p>
          <p style="margin:0;font-size:12px;line-height:1.5;color:#5F6F5E;">
            ${bits.join("&nbsp;·&nbsp;")}
          </p>
        </td>
      </tr>`;
  }

  return `
      <tr>
        <td class="email-footer" style="background-color:#FFFFFF;padding:40px 48px 48px 48px;text-align:left;">
          <div style="height:1px;background-color:#E8E8E8;line-height:1px;font-size:1px;">&nbsp;</div>
          <div style="padding-top:20px;">
            ${sent}
            <p style="margin:0 0 8px 0;font-size:12px;line-height:1.5;color:#999999;">
              © ${year} MixWise${tagline ? ` · ${escapeEmailHtml(tagline)}` : ""}
            </p>
            <p style="margin:0;font-size:12px;line-height:1.5;color:#999999;">
              ${bits.join("&nbsp;·&nbsp;")}
            </p>
          </div>
        </td>
      </tr>`;
}

/** Shared horizontal padding for logo, copy, and photos (one content column). */
export function emailPad(
  inner: string,
  opts?: { top?: number; bottom?: number; theme?: EmailChromeTheme }
): string {
  const top = opts?.top ?? 0;
  const bottom = opts?.bottom ?? 0;
  // Studio and masthead share one gutter so chrome and copy always align.
  const x = 48;
  return `<div class="email-pad" style="padding:${top}px ${x}px ${bottom}px ${x}px;">${inner}</div>`;
}

export function emailDocument({
  title,
  previewText,
  bodyHtml,
  userEmail,
  unsubscribeUrl,
  siteUrl = EMAIL_DEFAULT_SITE,
  tagline,
  theme = "studio",
}: {
  title: string;
  previewText: string;
  bodyHtml: string;
  userEmail?: string;
  unsubscribeUrl?: string;
  siteUrl?: string;
  tagline?: string;
  theme?: EmailChromeTheme;
}): string {
  const safeTitle = escapeEmailHtml(title);
  const pageBg = theme === "masthead" ? "#F3F0E8" : "#FFFFFF";
  const outerPad = theme === "masthead" ? "32px 16px" : "0";

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>${safeTitle}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  ${baseStyles}
</head>
<body style="margin:0;padding:0;background-color:${pageBg};">
  ${getPreheaderHtml(previewText)}
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${pageBg};">
    <tr>
      <td align="center" style="padding:${outerPad};">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="width:100%;max-width:600px;margin:0 auto;background-color:#FFFFFF;">
          ${emailHeaderHtml(siteUrl, theme)}
          <tr>
            <td class="email-content" style="padding:0;background-color:#FFFFFF;">
              ${bodyHtml}
            </td>
          </tr>
          ${emailFooterHtml({ userEmail, unsubscribeUrl, siteUrl, tagline, theme })}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export const baseStyles = `
  <style>
    body, html {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    body {
      font-family: ${EMAIL_SANS};
      background-color: #FFFFFF;
      color: #1C241B;
      line-height: 1.55;
    }
    img {
      border: 0;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    .email-container { width: 100%; max-width: 600px; }
    .greeting {
      font-family: ${EMAIL_SERIF};
      font-size: 34px;
      color: #111111;
      margin: 0 0 18px 0;
      font-weight: 400;
      line-height: 1.15;
      letter-spacing: -0.02em;
    }
    .body-text {
      font-size: 17px;
      color: #333333;
      margin: 0 0 18px 0;
      line-height: 1.55;
    }
    .muted-text {
      font-size: 14px;
      color: #777777;
      margin: 0 0 14px 0;
      line-height: 1.55;
    }
    .button-wrapper { margin: 32px 0; }
    .btn-primary {
      display: inline-block;
      background-color: #111111;
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 14px 24px;
      border-radius: 0;
      font-weight: 600;
      font-size: 15px;
    }
    .btn-warning {
      display: inline-block;
      background-color: #3A4D39;
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 15px;
    }
    .fallback-box { margin: 28px 0 0 0; padding: 0; border: 0; background: transparent; }
    .fallback-label { font-size: 12px; font-weight: 500; color: #777777; margin: 0 0 6px 0; }
    .fallback-link {
      word-break: break-all;
      font-family: ${EMAIL_SANS};
      font-size: 13px;
      color: #555555;
      line-height: 1.5;
    }
    .divider { height: 1px; background-color: #E8E8E8; margin: 36px 0; }
    .info-box {
      background: transparent;
      border-radius: 0;
      padding: 18px 0;
      margin: 24px 0;
      border: 0;
      border-top: 1px solid #E8E8E8;
      border-bottom: 1px solid #E8E8E8;
    }
    .info-box p { margin: 0; font-size: 15px; color: #333333; }
    .security-notice {
      background: transparent;
      border: 0;
      border-left: 2px solid #3A4D39;
      padding: 4px 0 4px 14px;
      margin: 24px 0;
    }
    .security-notice p { margin: 0; font-size: 14px; color: #5F6F5E; }
    @media only screen and (max-width: 480px) {
      .email-header, .email-footer, .email-pad {
        padding-left: 32px !important;
        padding-right: 32px !important;
      }
      .greeting { font-size: 28px !important; }
      .body-text { font-size: 16px !important; }
    }
  </style>
`;


/**
 * Email confirmation template for new user signup
 */
export function confirmEmailTemplate({
  confirmUrl,
  userEmail,
  displayName,
}: {
  confirmUrl: string;
  userEmail: string;
  displayName?: string;
}): EmailTemplate {
  const subject = "Welcome to MixWise – Confirm Your Email";
  const previewText =
    "One click to unlock cocktail recipes you can make at home.";
  const safeUrl = escapeEmailHtml(confirmUrl);
  const name =
    displayName?.trim().split(/\s+/)[0] ||
    userEmail.trim().split("@")[0] ||
    "";
  const safeName = escapeEmailHtml(name);
  const greeting = safeName
    ? `Confirm your email, ${safeName}.`
    : "Confirm your email";

  const body = `
          <h2 class="greeting" style="font-family: ${EMAIL_SERIF}; font-size: 34px; color: #1C241B; margin: 0 0 16px 0; font-weight: 400; text-align: left; line-height: 1.15; letter-spacing: -0.02em;">
            ${greeting}
          </h2>
          <p class="body-text" style="font-size: 16px; color: #2C3628; margin: 0 0 20px 0; line-height: 1.65; text-align: left;">
            You're one step away. Confirm to unlock personalized recommendations, saved recipes, tasting notes, and a home bar that remembers what you have.
          </p>
          <div class="button-wrapper" style="text-align: left; margin: 28px 0;">
            <a href="${safeUrl}" class="btn-primary" style="${emailBtnPrimary("masthead")}">
              Confirm email
            </a>
          </div>
          <div class="divider" style="height: 1px; background-color: #E6EBE4; margin: 28px 0;"></div>
          <div class="fallback-box" style="background-color: #F9F7F2; border-radius: 8px; padding: 14px 16px; margin: 0; border: 1px solid #E6EBE4;">
            <p class="fallback-label" style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #5F6F5E; margin: 0 0 8px 0;">
              Or copy this link
            </p>
            <p class="fallback-link" style="word-break: break-all; font-family: monospace; font-size: 12px; color: #3A4D39; margin: 0; line-height: 1.5;">
              ${safeUrl}
            </p>
          </div>
          <p class="muted-text" style="font-size: 13px; color: #5F6F5E; margin: 24px 0 0 0; line-height: 1.6; text-align: left;">
            Didn't sign up for MixWise? You can ignore this email.
          </p>`;

  const html = emailDocument({
    title: subject,
    previewText,
    bodyHtml: emailPad(body, { top: 28, bottom: 32, theme: "masthead" }),
    userEmail,
    theme: "masthead",
  });

  const text = `
${name ? `Confirm your email, ${name}.` : "Confirm your email"}

You're one step away from personalized cocktail recommendations.

Confirm your email:
${confirmUrl}

Didn't sign up for MixWise? You can ignore this email.

---
This email was sent to ${userEmail}
© ${new Date().getFullYear()} MixWise · A smarter way to make cocktails at home
https://www.getmixwise.com
  `.trim();

  return { subject, html, text };
}

/**
 * Weekly-list confirmation for guests. Account holders never receive this.
 */
export function emailListWelcomeTemplate({
  userEmail,
  convertUrl,
  unsubscribeUrl,
  featuredCocktail,
  siteUrl = EMAIL_DEFAULT_SITE,
}: {
  userEmail: string;
  convertUrl: string;
  unsubscribeUrl: string;
  featuredCocktail?: {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
  };
  siteUrl?: string;
}): EmailTemplate {
  const safeConvert = escapeEmailHtml(convertUrl);
  const safeSite = escapeEmailHtml(siteUrl);
  const cocktailName = featuredCocktail?.name
    ? escapeEmailHtml(featuredCocktail.name)
    : "";
  const cocktailSlug = featuredCocktail?.slug
    ? encodeURIComponent(featuredCocktail.slug)
    : "";
  const cocktailDesc = featuredCocktail?.description
    ? escapeEmailHtml(featuredCocktail.description)
    : "";
  const cocktailImage = featuredCocktail?.imageUrl
    ? escapeEmailHtml(toPublicDeliveryUrl(featuredCocktail.imageUrl, "email") || "")
    : "";

  const subject = featuredCocktail
    ? `Thursday just got a lot more interesting — ${featuredCocktail.name} tonight`
    : "Thursday just got a lot more interesting";
  const previewText = featuredCocktail
    ? `Every week we'll send you a curated cocktail you can make at home. Start with a ${featuredCocktail.name} tonight.`
    : "Every week we'll send you a curated cocktail you can make at home.";

  const featuredSection = featuredCocktail
    ? emailPad(`
          <div style="margin: 8px 0 28px 0;">
            ${
              cocktailImage
                ? `<a href="${safeSite}/cocktails/${cocktailSlug}" style="display:block;text-decoration:none;line-height:0;">
                  <img src="${cocktailImage}" alt="${cocktailName}" width="504" style="display:block;width:100%;max-width:504px;height:auto;border:0;" />
                </a>`
                : ""
            }
              <h3 style="margin:20px 0 10px 0;font-family:${EMAIL_SERIF};font-size:30px;color:#1C241B;font-weight:400;letter-spacing:-0.02em;line-height:1.15;">${cocktailName}</h3>
              ${
                cocktailDesc
                  ? `<p style="margin:0 0 14px 0;font-size:16px;color:#2C3628;line-height:1.55;">${cocktailDesc}</p>`
                  : ""
              }
              <p style="margin:0;"><a href="${safeSite}/cocktails/${cocktailSlug}" style="${emailLinkCta("studio")}">Make this one</a></p>
          </div>`)
    : "";

  const benefitsHtml = ACCOUNT_BENEFITS.map(
    (benefit) => `
            <tr>
              <td style="padding:16px 0;border-bottom:1px solid #E6EBE4;">
                <p style="margin:0 0 4px 0;font-weight:600;color:#1C241B;font-size:16px;">${escapeEmailHtml(benefit.title)}</p>
                <p style="margin:0;color:#5F6F5E;font-size:15px;line-height:1.5;">${escapeEmailHtml(benefit.description)}</p>
              </td>
            </tr>`
  ).join("");

  const body = `
          ${emailPad(`
          <h2 class="greeting" style="font-family:${EMAIL_SERIF};font-size:34px;color:#1C241B;margin:0 0 14px 0;font-weight:400;line-height:1.15;letter-spacing:-0.02em;">
            Thursday just got<br>a lot more interesting.
          </h2>
          <p class="body-text" style="font-size:17px;color:#2C3628;margin:0 0 8px 0;line-height:1.55;">
            Every week we'll send you a curated cocktail you can make at home.${featuredCocktail ? " Start with this one tonight." : ""}
          </p>
          `)}
          ${featuredSection}
          ${emailPad(`
          <h2 class="greeting" style="font-family:${EMAIL_SERIF};font-size:26px;color:#1C241B;margin:8px 0 10px 0;font-weight:400;letter-spacing:-0.02em;">
            Your bar, remembered.
          </h2>
          <p class="body-text" style="font-size:16px;color:#2C3628;margin:0 0 8px 0;line-height:1.55;">
            One last step — set a password.
          </p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:8px 0 24px 0;">
            ${benefitsHtml}
          </table>
          <div class="button-wrapper" style="margin:8px 0 20px 0;">
            <a href="${safeConvert}" class="btn-primary" style="${emailBtnPrimary("studio")}">
              Set a password
            </a>
          </div>
          <p class="muted-text" style="font-size:14px;color:#5F6F5E;margin:0 0 20px 0;line-height:1.55;">
            Skip this and you're still getting a new drink every Thursday.
          </p>
          <div class="divider" style="height:1px;background-color:#E6EBE4;margin:8px 0 20px 0;"></div>
          <p class="muted-text" style="font-size:15px;color:#5F6F5E;margin:0;line-height:1.55;">
            See you next week
          </p>
          <p style="margin:12px 0 0 0;font-family:${EMAIL_SERIF};font-size:17px;color:#1C241B;">— Ethan</p>
          `)}`;

  const html = emailDocument({
    title: subject,
    previewText,
    bodyHtml: body,
    userEmail,
    unsubscribeUrl,
    siteUrl,
    theme: "studio",
  });

  const text = `
Thursday just got
a lot more interesting.

Every week we'll send you a curated cocktail you can make at home.${featuredCocktail ? " Start with this one tonight." : ""}

${
  featuredCocktail
    ? `${featuredCocktail.name}
${featuredCocktail.description || ""}
${siteUrl}/cocktails/${featuredCocktail.slug}

`
    : ""
}Your bar, remembered.

One last step — set a password.

${ACCOUNT_BENEFITS.map((b) => `• ${b.title}: ${b.description}`).join("\n")}

Set a password:
${convertUrl}

Skip this and you're still getting a new drink every Thursday.

See you next week!
— Ethan

Unsubscribe: ${unsubscribeUrl}

---
Sent to ${userEmail}
© ${new Date().getFullYear()} MixWise
${siteUrl}
  `.trim();

  return { subject, html, text };
}

/**
 * Finish account setup — magic link for intentional account creation
 */
export function finishAccountSetupTemplate({
  setupUrl,
  userEmail,
}: {
  setupUrl: string;
  userEmail: string;
}): EmailTemplate {
  const subject = "Your MixWise account is ready — one click to open it";
  const previewText =
    "Open your account, save your bar, and optionally add a password so you can sign in anytime.";
  const safeUrl = escapeEmailHtml(setupUrl);

  const body = `
          <h2 class="greeting" style="font-family:${EMAIL_SERIF};font-size:34px;color:#1C241B;margin:0 0 16px 0;font-weight:400;text-align:left;line-height:1.15;letter-spacing:-0.02em;">
            Your account is ready
          </h2>
          <p class="body-text" style="font-size:16px;color:#2C3628;margin:0 0 18px 0;line-height:1.65;">
            Thanks for joining MixWise. Open your account to save your bar, favorites, tasting notes, and shopping list across devices.
          </p>
          <div class="info-box" style="padding:18px 0;margin:24px 0;border-top:1px solid #E6EBE4;border-bottom:1px solid #E6EBE4;">
            <p style="margin:0 0 8px 0;font-size:14px;color:#3A4D39;">No password needed to get started</p>
            <p style="margin:0;font-size:14px;color:#3A4D39;">After you sign in, you can add a password anytime</p>
          </div>
          <div class="button-wrapper" style="margin:28px 0;">
            <a href="${safeUrl}" class="btn-primary" style="${emailBtnPrimary("masthead")}">
              Open MixWise
            </a>
          </div>
          <div class="divider" style="height:1px;background-color:#E6EBE4;margin:28px 0;"></div>
          <div class="fallback-box" style="padding:0;margin:0;border:0;">
            <p class="fallback-label" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#5F6F5E;margin:0 0 8px 0;">
              Or copy this link
            </p>
            <p class="fallback-link" style="word-break:break-all;font-family:monospace;font-size:12px;color:#3A4D39;margin:0;line-height:1.5;">
              ${safeUrl}
            </p>
          </div>
          <p class="muted-text" style="font-size:13px;color:#5F6F5E;margin:24px 0 0 0;line-height:1.6;">
            Didn't mean to sign up? You can ignore this email.
          </p>`;

  const html = emailDocument({
    title: subject,
    previewText,
    bodyHtml: emailPad(body, { top: 28, bottom: 32, theme: "masthead" }),
    userEmail,
    theme: "masthead",
  });

  const text = `
Your MixWise account is ready

Thanks for joining MixWise. Open your account here:
${setupUrl}

No password needed to get started — after you sign in, you can add a password anytime.

Didn't mean to sign up? You can ignore this email.

---
This email was sent to ${userEmail}
© ${new Date().getFullYear()} MixWise
https://www.getmixwise.com
  `.trim();

  return { subject, html, text };
}

/**
 * Password reset template for password recovery
 */
export function resetPasswordTemplate({
  resetUrl,
  userEmail,
}: {
  resetUrl: string;
  userEmail: string;
}): EmailTemplate {
  const subject = "Reset your MixWise password";
  const previewText =
    "Click to securely reset your password. This link expires in 1 hour.";
  const safeUrl = escapeEmailHtml(resetUrl);

  const body = `
          <h2 class="greeting" style="font-family:${EMAIL_SERIF};font-size:34px;color:#1C241B;margin:0 0 16px 0;font-weight:400;text-align:left;line-height:1.15;letter-spacing:-0.02em;">
            Reset your password
          </h2>
          <p class="body-text" style="font-size:16px;color:#2C3628;margin:0 0 18px 0;line-height:1.65;">
            We received a request to reset the password for your MixWise account. If that was you, use the button below.
          </p>
          <div class="security-notice" style="border-left:2px solid #3A4D39;padding:4px 0 4px 14px;margin:24px 0;">
            <p style="margin:0;font-size:14px;color:#5F6F5E;">
              This link expires in <strong style="color:#3A4D39;">1 hour</strong> for your security.
            </p>
          </div>
          <div class="button-wrapper" style="margin:28px 0;">
            <a href="${safeUrl}" class="btn-warning" style="${EMAIL_BTN_SECONDARY}">
              Reset password
            </a>
          </div>
          <div class="divider" style="height:1px;background-color:#E6EBE4;margin:28px 0;"></div>
          <div class="fallback-box" style="padding:0;margin:0;border:0;">
            <p class="fallback-label" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#5F6F5E;margin:0 0 8px 0;">
              Or copy this link
            </p>
            <p class="fallback-link" style="word-break:break-all;font-family:monospace;font-size:12px;color:#3A4D39;margin:0;line-height:1.5;">
              ${safeUrl}
            </p>
          </div>
          <div class="info-box" style="background-color:#F9F7F2;border-radius:8px;padding:18px 20px;margin:24px 0 0 0;border:1px solid #E6EBE4;">
            <p style="margin:0;font-size:14px;color:#3A4D39;">
              <strong>Didn't request this?</strong> Ignore this email and your password stays the same.
            </p>
          </div>`;

  const html = emailDocument({
    title: subject,
    previewText,
    bodyHtml: emailPad(body, { top: 28, bottom: 32, theme: "masthead" }),
    userEmail,
    theme: "masthead",
  });

  const text = `
Reset your MixWise password

We received a request to reset the password for your MixWise account.

Click this link to set a new password:
${resetUrl}

This link expires in 1 hour for your security.

Didn't request this? Ignore this email and your password stays the same.

---
This email was sent to ${userEmail}
© ${new Date().getFullYear()} MixWise · A smarter way to make cocktails at home
https://www.getmixwise.com
  `.trim();

  return { subject, html, text };
}

/**
 * Welcome email template sent after email confirmation
 */
export function welcomeEmailTemplate({
  displayName,
  userEmail,
  unsubscribeUrl,
}: {
  displayName: string;
  userEmail: string;
  unsubscribeUrl: string;
}): EmailTemplate {
  const subject = "Welcome to MixWise — let's make your first cocktail";
  const previewText = `Hey ${displayName}! Add your ingredients and see what you can make tonight.`;
  const safeName = escapeEmailHtml(displayName);

  const body = `
          <h2 class="greeting" style="font-family:${EMAIL_SERIF};font-size:34px;color:#1C241B;margin:0 0 16px 0;font-weight:400;text-align:left;line-height:1.15;letter-spacing:-0.02em;">
            Welcome, ${safeName}
          </h2>
          <p class="body-text" style="font-size:16px;color:#2C3628;margin:0 0 18px 0;line-height:1.65;">
            Your account is ready. MixWise gets better once it knows what's already on your shelf.
          </p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:8px 0 24px 0;">
            <tr>
              <td style="padding:16px 0;border-bottom:1px solid #E6EBE4;">
                <p style="margin:0 0 4px 0;font-weight:600;color:#3A4D39;font-size:15px;">Build your bar</p>
                <p style="margin:0;color:#5F6F5E;font-size:14px;line-height:1.5;">Add the bottles you have and see what you can make right now.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 0;border-bottom:1px solid #E6EBE4;">
                <p style="margin:0 0 4px 0;font-weight:600;color:#3A4D39;font-size:15px;">Save the keepers</p>
                <p style="margin:0;color:#5F6F5E;font-size:14px;line-height:1.5;">Heart recipes you love and find them again from your dashboard.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 0;">
                <p style="margin:0 0 4px 0;font-weight:600;color:#3A4D39;font-size:15px;">Weekly inspiration</p>
                <p style="margin:0;color:#5F6F5E;font-size:14px;line-height:1.5;">A curated drink each Thursday — chosen for home bartenders.</p>
              </td>
            </tr>
          </table>
          <div class="button-wrapper" style="margin:28px 0;">
            <a href="https://www.getmixwise.com/dashboard" class="btn-primary" style="${emailBtnPrimary("masthead")}">
              Open your dashboard
            </a>
          </div>
          <div class="divider" style="height:1px;background-color:#E6EBE4;margin:28px 0;"></div>
          <p class="muted-text" style="font-size:14px;color:#5F6F5E;margin:0;line-height:1.6;">
            Questions? Just reply to this email.
          </p>`;

  const html = emailDocument({
    title: subject,
    previewText,
    bodyHtml: emailPad(body, { top: 28, bottom: 32, theme: "masthead" }),
    userEmail,
    unsubscribeUrl,
    theme: "masthead",
  });

  const text = `
Welcome to MixWise, ${displayName}!

Your account is ready. MixWise gets better once it knows what's already on your shelf.

BUILD YOUR BAR
Add the bottles you have and see what you can make right now.

SAVE THE KEEPERS
Heart recipes you love and find them again from your dashboard.

WEEKLY INSPIRATION
A curated drink each Thursday — chosen for home bartenders.

Get started: https://www.getmixwise.com/dashboard

Questions? Just reply to this email.

---
This email was sent to ${userEmail}
© ${new Date().getFullYear()} MixWise · A smarter way to make cocktails at home
https://www.getmixwise.com

Unsubscribe: ${unsubscribeUrl}
  `.trim();

  return { subject, html, text };
}

/**
 * Weekly digest email template
 * Sent every Thursday with personalized cocktail recommendations
 */
export function weeklyDigestTemplate({
  displayName,
  userEmail,
  unsubscribeUrl,
  cocktailsYouCanMake,
  featuredCocktail,
  barIngredientCount,
}: {
  displayName: string;
  userEmail: string;
  unsubscribeUrl: string;
  cocktailsYouCanMake: Array<{ name: string; slug: string; imageUrl?: string }>;
  featuredCocktail?: { name: string; slug: string; description?: string; imageUrl?: string };
  barIngredientCount: number;
}): EmailTemplate {
  const readyCount = cocktailsYouCanMake.length;
  const subject =
    readyCount > 0
      ? `Your weekly MixWise digest — ${readyCount} cocktail${readyCount === 1 ? "" : "s"} waiting`
      : featuredCocktail
        ? `Your weekly MixWise digest — try ${featuredCocktail.name}`
        : `Your weekly MixWise digest`;

  const previewText =
    readyCount > 0
      ? `You can make ${cocktailsYouCanMake[0].name}${readyCount > 1 ? `, ${cocktailsYouCanMake[1].name}` : ""} and more with what's in your bar.`
      : featuredCocktail
        ? `This week's featured cocktail: ${featuredCocktail.name}.`
        : "Discover new cocktails and build your home bar this week.";

  const cocktailCardsHtml = cocktailsYouCanMake
    .slice(0, 3)
    .map(
      (cocktail) => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #E6EBE4;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="vertical-align:middle;">
              <a href="https://www.getmixwise.com/cocktails/${escapeEmailHtml(cocktail.slug)}" style="color:#3A4D39;text-decoration:none;font-weight:600;font-size:16px;">${escapeEmailHtml(cocktail.name)}</a>
              <p style="margin:4px 0 0 0;font-size:13px;color:#5F6F5E;">You have everything</p>
            </td>
            <td style="width:84px;text-align:right;vertical-align:middle;">
              <a href="https://www.getmixwise.com/cocktails/${escapeEmailHtml(cocktail.slug)}" style="display:inline-block;background-color:#BC5A45;color:#FFFFFF;text-decoration:none;padding:8px 14px;border-radius:6px;font-size:13px;font-weight:600;">Make it</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
    )
    .join("");

  const featuredImage = featuredCocktail?.imageUrl
    ? escapeEmailHtml(toPublicDeliveryUrl(featuredCocktail.imageUrl, "email") || "")
    : "";

  const featuredSection = featuredCocktail
    ? emailPad(`
    <div style="margin:28px 0 8px 0;">
      ${
        featuredImage
          ? `<img src="${featuredImage}" alt="${escapeEmailHtml(featuredCocktail.name)}" width="504" style="display:block;width:100%;max-width:504px;height:auto;border:0;" />`
          : ""
      }
        <p style="margin:20px 0 8px 0;font-size:12px;font-weight:600;letter-spacing:0.04em;color:#5F6F5E;">Featured this week</p>
        <h3 style="margin:0 0 10px 0;font-family:${EMAIL_SERIF};font-size:30px;color:#1C241B;font-weight:400;letter-spacing:-0.02em;line-height:1.15;">${escapeEmailHtml(featuredCocktail.name)}</h3>
        ${
          featuredCocktail.description
            ? `<p style="margin:0 0 14px 0;font-size:16px;color:#2C3628;line-height:1.55;">${escapeEmailHtml(featuredCocktail.description)}</p>`
            : ""
        }
        <p style="margin:0;"><a href="https://www.getmixwise.com/cocktails/${escapeEmailHtml(featuredCocktail.slug)}" style="${emailLinkCta("studio")}">View recipe</a></p>
    </div>`)
    : "";

  const readySection =
    cocktailsYouCanMake.length > 0
      ? `
          <div style="margin-bottom:28px;">
            <p style="font-size:12px;font-weight:600;letter-spacing:0.04em;color:#5F6F5E;margin:0 0 8px 0;">
              Ready to make · ${cocktailsYouCanMake.length} total
            </p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              ${cocktailCardsHtml}
            </table>
            ${
              cocktailsYouCanMake.length > 3
                ? `
            <p style="margin:16px 0 0 0;">
              <a href="https://www.getmixwise.com/mix" style="${emailLinkCta("studio")}">See all ${cocktailsYouCanMake.length} cocktails</a>
            </p>`
                : ""
            }
          </div>`
      : `
          <div style="margin:0 0 24px 0;padding:28px 0;border-top:1px solid #E6EBE4;border-bottom:1px solid #E6EBE4;">
            <h3 style="margin:0 0 10px 0;font-family:${EMAIL_SERIF};font-size:26px;color:#1C241B;font-weight:400;letter-spacing:-0.02em;">Ready to see what you can make?</h3>
            <p style="margin:0 0 18px 0;font-size:16px;color:#5F6F5E;line-height:1.55;">Tell us what's in your bar and we'll match every recipe you can shake tonight.</p>
            <a href="https://www.getmixwise.com/mix" style="${emailBtnPrimary("studio")}">Build my bar</a>
          </div>`;

  const body = `
          ${emailPad(`
          <h2 style="font-family:${EMAIL_SERIF};font-size:34px;color:#1C241B;margin:0 0 10px 0;font-weight:400;line-height:1.15;letter-spacing:-0.02em;">
            Happy Thursday, ${escapeEmailHtml(displayName)}
          </h2>
          <p class="body-text" style="font-size:17px;color:#2C3628;margin:0 0 8px 0;line-height:1.55;">
            Your weekly picks from a bar with <strong>${barIngredientCount}</strong> ingredient${barIngredientCount === 1 ? "" : "s"}.
          </p>
          ${readySection}
          `)}
          ${featuredSection}
          ${emailPad(`
          <div class="divider" style="height:1px;background-color:#E6EBE4;margin:28px 0;"></div>
          <p class="muted-text" style="font-size:15px;color:#5F6F5E;margin:0;line-height:1.55;">
            Cheers
          </p>
          <p style="margin:12px 0 0 0;font-family:${EMAIL_SERIF};font-size:17px;color:#1C241B;">— Ethan</p>
          `)}`;

  const html = emailDocument({
    title: subject,
    previewText,
    bodyHtml: body,
    userEmail,
    unsubscribeUrl,
    theme: "studio",
  });

  const cocktailListText = cocktailsYouCanMake
    .slice(0, 5)
    .map((c) => `  • ${c.name}: https://www.getmixwise.com/cocktails/${c.slug}`)
    .join("\n");

  const text = `
Your Weekly MixWise Digest

Happy Thursday, ${displayName}!

Your weekly picks from a bar with ${barIngredientCount} ingredients.

${
  cocktailsYouCanMake.length > 0
    ? `
READY TO MAKE (${cocktailsYouCanMake.length} total):
${cocktailListText}

See all cocktails: https://www.getmixwise.com/mix
`
    : `
BUILD YOUR BAR
Add ingredients to your bar to see personalized cocktail recommendations.
https://www.getmixwise.com/mix
`
}
${
  featuredCocktail
    ? `
FEATURED THIS WEEK: ${featuredCocktail.name}
${featuredCocktail.description || ""}
https://www.getmixwise.com/cocktails/${featuredCocktail.slug}
`
    : ""
}

Cheers — Ethan at MixWise

---
This email was sent to ${userEmail}
© ${new Date().getFullYear()} MixWise · A smarter way to make cocktails at home
https://www.getmixwise.com

Unsubscribe: ${unsubscribeUrl}
  `.trim();

  return { subject, html, text };
}

/**
 * Wedding Cocktail Recommendations Email Template
 */
export function weddingRecommendationsTemplate({
  recommendations,
}: {
  recommendations: Array<{
    name: string;
    slug: string;
    base_spirit: string | null;
  }>;
}): EmailTemplate {
  const subject = `Your ${recommendations.length} wedding cocktail recommendations`;

  const recommendationsList = recommendations
    .map((rec, index) => {
      const spirit = rec.base_spirit ? ` · ${escapeEmailHtml(rec.base_spirit)}` : "";
      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #E6EBE4;">
            <p style="margin:0 0 4px 0;font-family:${EMAIL_SERIF};font-size:18px;color:#3A4D39;font-weight:400;">
              ${index + 1}. ${escapeEmailHtml(rec.name)}<span style="font-family:${EMAIL_SANS};font-size:13px;color:#5F6F5E;">${spirit}</span>
            </p>
            <a href="https://www.getmixwise.com/cocktails/${escapeEmailHtml(rec.slug)}" style="color:#BC5A45;text-decoration:none;font-size:13px;font-weight:600;">View recipe →</a>
          </td>
        </tr>`;
    })
    .join("");

  const body = `
          <h2 class="greeting" style="font-family:${EMAIL_SERIF};font-size:26px;color:#3A4D39;margin:0 0 14px 0;font-weight:400;line-height:1.25;">
            Your wedding cocktail list
          </h2>
          <p style="margin:0 0 20px 0;font-size:16px;color:#2C3628;line-height:1.65;">
            Here are your <strong>${recommendations.length}</strong> recommendations based on the preferences you shared.
          </p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:8px 0 24px 0;">
            ${recommendationsList}
          </table>
          <div style="text-align:center;margin:28px 0 0 0;">
            <a href="https://www.getmixwise.com/wedding-menu" style="${emailBtnPrimary("masthead")}">
              View all recommendations
            </a>
          </div>`;

  const html = emailDocument({
    title: subject,
    previewText: `Your ${recommendations.length} personalized wedding cocktail recommendations`,
    bodyHtml: emailPad(body, { top: 28, bottom: 32, theme: "masthead" }),
    theme: "masthead",
  });

  const text = `
Your Wedding Cocktail Recommendations

Thank you for using our wedding cocktail finder! Here are your ${recommendations.length} personalized cocktail recommendations:

${recommendations
  .map(
    (rec, index) =>
      `${index + 1}. ${rec.name}${rec.base_spirit ? ` · ${rec.base_spirit}` : ""}\n   View: https://www.getmixwise.com/cocktails/${rec.slug}`
  )
  .join("\n\n")}

View all recommendations: https://www.getmixwise.com/wedding-menu

---
This email was sent from MixWise.
Questions? Visit https://www.getmixwise.com/contact
  `.trim();

  return { subject, html, text };
}

/**
 * Thirsty Thursday Welcome Email Template — Studio White
 */
export function thirstyThursdayWelcomeTemplate({
  userEmail,
  unsubscribeUrl,
  featuredCocktail,
  displayName,
}: {
  userEmail: string;
  unsubscribeUrl: string;
  featuredCocktail?: {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    ingredients?: string;
    instructions?: string;
  };
  displayName?: string;
}): EmailTemplate {
  const subject = "You're on Thirsty Thursday";
  const previewText =
    "Every Thursday, one cocktail for home bartenders. Here's your first.";
  const name =
    displayName?.trim().split(/\s+/)[0] ||
    userEmail.trim().split("@")[0] ||
    "";
  const safeName = escapeEmailHtml(name);
  const greeting = safeName ? `You're on the list, ${safeName}.` : "You're on the list.";

  const cocktailHref = featuredCocktail
    ? `https://www.getmixwise.com/cocktails/${encodeURIComponent(featuredCocktail.slug)}`
    : "https://www.getmixwise.com/cocktails";
  const deliveryUrl = featuredCocktail?.imageUrl
    ? toPublicDeliveryUrl(featuredCocktail.imageUrl, "email")
    : "";

  const featuredBlock = featuredCocktail
    ? `
          <div style="margin:28px 0 8px 0;">
            ${
              deliveryUrl
                ? `<a href="${escapeEmailHtml(cocktailHref)}" style="display:block;text-decoration:none;line-height:0;">
              <img src="${escapeEmailHtml(deliveryUrl)}" alt="${escapeEmailHtml(featuredCocktail.name)}" width="504" style="display:block;width:100%;max-width:504px;height:auto;border:0;" />
            </a>`
                : ""
            }
            <p style="margin:${deliveryUrl ? "20px" : "0"} 0 8px 0;font-size:12px;font-weight:600;letter-spacing:0.04em;color:#5F6F5E;">Your first cocktail</p>
            <h3 style="margin:0 0 10px 0;font-family:${EMAIL_SERIF};font-size:30px;color:#1C241B;font-weight:400;letter-spacing:-0.02em;line-height:1.15;">
              <a href="${escapeEmailHtml(cocktailHref)}" style="color:#1C241B;text-decoration:none;">${escapeEmailHtml(featuredCocktail.name)}</a>
            </h3>
            ${
              featuredCocktail.description
                ? `<p style="margin:0 0 16px 0;font-size:16px;color:#2C3628;line-height:1.55;">${escapeEmailHtml(featuredCocktail.description)}</p>`
                : ""
            }
            <p style="margin:0;"><a href="${escapeEmailHtml(cocktailHref)}" style="${emailLinkCta("studio")}">View recipe</a></p>
          </div>`
    : "";

  const body = `
          <h2 class="greeting" style="font-family:${EMAIL_SERIF};font-size:34px;color:#1C241B;margin:0 0 16px 0;font-weight:400;text-align:left;line-height:1.15;letter-spacing:-0.02em;">
            ${greeting}
          </h2>
          <p class="body-text" style="font-size:17px;color:#2C3628;margin:0 0 8px 0;line-height:1.55;text-align:left;">
            Every Thursday, one cocktail chosen for home bartenders — enough to start the weekend right.
          </p>
          ${featuredBlock}
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:28px 0 8px 0;">
            <tr>
              <td style="padding:18px 0;border-bottom:1px solid #E8E8E8;">
                <p style="margin:0 0 4px 0;font-weight:600;color:#1C241B;font-size:16px;">Every Thursday</p>
                <p style="margin:0;color:#5F6F5E;font-size:15px;line-height:1.5;">One recipe. No pile of newsletters.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 0;border-bottom:1px solid #E8E8E8;">
                <p style="margin:0 0 4px 0;font-weight:600;color:#1C241B;font-size:16px;">Curated, not crowded</p>
                <p style="margin:0;color:#5F6F5E;font-size:15px;line-height:1.5;">We've tested hundreds so you only get the keepers.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 0;">
                <p style="margin:0 0 4px 0;font-weight:600;color:#1C241B;font-size:16px;">Built for home</p>
                <p style="margin:0;color:#5F6F5E;font-size:15px;line-height:1.5;">Techniques and bottles you can actually use.</p>
              </td>
            </tr>
          </table>
          <div class="button-wrapper" style="margin:28px 0;">
            <a href="https://www.getmixwise.com/cocktails" class="btn-primary" style="${emailBtnPrimary("studio")}">
              Browse recipes
            </a>
          </div>
          <p class="muted-text" style="font-size:14px;color:#5F6F5E;margin:24px 0 0 0;line-height:1.55;">
            See you Thursday
          </p>
          <p style="margin:12px 0 0 0;font-family:${EMAIL_SERIF};font-size:17px;color:#1C241B;">— Ethan</p>`;

  const html = emailDocument({
    title: subject,
    previewText,
    bodyHtml: emailPad(body, { top: 8, bottom: 16, theme: "studio" }),
    userEmail,
    unsubscribeUrl,
    theme: "studio",
  });

  const text = `
${name ? `You're on the list, ${name}.` : "You're on the list."}

Every Thursday, one cocktail chosen for home bartenders — enough to start the weekend right.

${
  featuredCocktail
    ? `YOUR FIRST COCKTAIL: ${featuredCocktail.name}
${featuredCocktail.description || ""}
View recipe: ${cocktailHref}

`
    : ""
}EVERY THURSDAY
One recipe. No pile of newsletters.

CURATED, NOT CROWDED
We've tested hundreds so you only get the keepers.

BUILT FOR HOME
Techniques and bottles you can actually use.

Browse recipes: https://www.getmixwise.com/cocktails

See you Thursday

— Ethan

---
This email was sent to ${userEmail}
© ${new Date().getFullYear()} MixWise
https://www.getmixwise.com

Unsubscribe: ${unsubscribeUrl}
  `.trim();

  return { subject, html, text };
}
