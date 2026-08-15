/**
 * Shared chrome and blocks for MixWise marketing emails.
 * Matches the botanical templates in templates.ts / weekend-kickoff.ts.
 */

import {
  EMAIL_SERIF,
  baseStyles,
  escapeEmailHtml,
  getPreheaderHtml,
} from "@/lib/email/templates";

export const MIXWISE_EMAIL_SITE = "https://www.getmixwise.com";

export function cocktailUrl(slug: string, siteUrl = MIXWISE_EMAIL_SITE): string {
  return `${siteUrl}/cocktails/${encodeURIComponent(slug)}`;
}

export function occasionUrl(slug: string, siteUrl = MIXWISE_EMAIL_SITE): string {
  return `${siteUrl}/occasions/${encodeURIComponent(slug)}`;
}

export function wrapMarketingEmail({
  title,
  previewText,
  bodyHtml,
  userEmail,
  unsubscribeUrl,
  siteUrl = MIXWISE_EMAIL_SITE,
}: {
  title: string;
  previewText: string;
  bodyHtml: string;
  userEmail: string;
  unsubscribeUrl: string;
  siteUrl?: string;
}): string {
  const year = new Date().getFullYear();
  const safeTitle = escapeEmailHtml(title);
  const safeEmail = escapeEmailHtml(userEmail);
  const safeUnsub = escapeEmailHtml(unsubscribeUrl);
  const safeSite = escapeEmailHtml(siteUrl);

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
  ${baseStyles}
</head>
<body>
  ${getPreheaderHtml(previewText)}
  <div class="email-wrapper">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="email-container" style="max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 30px -8px rgba(0, 0, 0, 0.1); border: 1px solid #E6EBE4;">
      <tr>
        <td class="email-header" bgcolor="#3A4D39" style="background-color: #3A4D39; background: linear-gradient(135deg, #3A4D39 0%, #5F6F5E 100%); padding: 48px 40px; text-align: center;">
          <h1 class="logo" style="font-family: ${EMAIL_SERIF}; font-size: 36px; font-weight: 700; color: #FFFFFF; margin: 0; letter-spacing: -0.5px;">
            mixwise.
          </h1>
        </td>
      </tr>
      <tr>
        <td class="email-content" style="padding: 48px 40px;">
          ${bodyHtml}
        </td>
      </tr>
      <tr>
        <td class="email-footer" style="background-color: #E6EBE4; padding: 32px 40px; text-align: center; border-top: 1px solid #D1DAD0;">
          <p class="footer-text" style="font-size: 13px; color: #5F6F5E; margin: 0 0 12px 0;">
            This email was sent to <strong>${safeEmail}</strong>
          </p>
          <p class="footer-text" style="font-size: 13px; color: #5F6F5E; margin: 0;">
            © ${year} MixWise · A smarter way to make cocktails at home
          </p>
          <div class="footer-links" style="margin: 16px 0 0 0;">
            <a href="${safeSite}" style="color: #3A4D39; text-decoration: none; font-size: 13px; margin: 0 8px;">Visit MixWise</a>
            <span style="color: #D1DAD0;">|</span>
            <a href="${safeUnsub}" style="color: #5F6F5E; text-decoration: none; font-size: 13px; margin: 0 8px;">Unsubscribe</a>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `.trim();
}

export function greetingHtml(text: string): string {
  return `<h2 class="greeting" style="font-family: ${EMAIL_SERIF}; font-size: 24px; color: #3A4D39; margin: 0 0 16px 0; font-weight: 400; line-height: 1.3;">${text}</h2>`;
}

export function bodyHtml(text: string): string {
  return `<p class="body-text" style="font-size: 16px; color: #2C3628; margin: 0 0 20px 0; line-height: 1.65;">${text}</p>`;
}

export function mutedHtml(text: string, extraStyle = ""): string {
  return `<p class="muted-text" style="font-size: 14px; color: #5F6F5E; margin: 0 0 16px 0; line-height: 1.6;${extraStyle}">${text}</p>`;
}

export function sectionLabelHtml(text: string): string {
  return `<h3 style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #5F6F5E; margin: 8px 0 16px 0;">${escapeEmailHtml(text)}</h3>`;
}

export function primaryCtaHtml(href: string, label: string): string {
  return `
          <div class="button-wrapper" style="text-align: center; margin: 32px 0;">
            <a href="${escapeEmailHtml(href)}" class="btn-primary" style="display: inline-block; background-color: #BC5A45; background: linear-gradient(135deg, #BC5A45 0%, #A04532 100%); color: #FFFFFF; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-weight: 600; font-size: 16px;">
              ${escapeEmailHtml(label)}
            </a>
          </div>`;
}

export function dividerHtml(): string {
  return `<div class="divider" style="height: 1px; background: linear-gradient(90deg, transparent, #D1DAD0, transparent); margin: 32px 0;"></div>`;
}

/** Closer line (optional), then a letter-style signature. */
export function signoffHtml(closer?: string): string {
  const signature = `<p style="margin: 12px 0 0 0; font-family: ${EMAIL_SERIF}; font-size: 16px; font-weight: 400; color: #3A4D39; text-align: center;">- Ethan at MixWise</p>`;
  if (!closer?.trim()) return signature;
  return `<p class="muted-text" style="font-size: 14px; color: #5F6F5E; margin: 0; line-height: 1.6; text-align: center;">${escapeEmailHtml(closer)}</p>${signature}`;
}

export function signoffText(closer?: string): string {
  return closer?.trim() ? `${closer}\n\n- Ethan at MixWise` : "- Ethan at MixWise";
}

export function stepsHtml(
  steps: Array<{ n: string; title: string; body: string }>
): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 8px 0 24px 0;">${steps
    .map(
      (step, index) => `
    <tr>
      <td style="padding: 16px; background-color: #F9F7F2; border-radius: 12px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td width="40" valign="top" style="width: 40px;">
              <div style="width: 32px; height: 32px; border-radius: 16px; background-color: #3A4D39; color: #FFFFFF; text-align: center; line-height: 32px; font-weight: 600; font-size: 14px;">${escapeEmailHtml(step.n)}</div>
            </td>
            <td style="padding-left: 12px;">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #3A4D39; font-size: 16px;">${escapeEmailHtml(step.title)}</p>
              <p style="margin: 0; font-size: 14px; color: #5F6F5E; line-height: 1.5;">${escapeEmailHtml(step.body)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${index < steps.length - 1 ? `<tr><td style="height: 8px;"></td></tr>` : ""}`
    )
    .join("")}</table>`;
}

export function convertCardHtml({
  href,
  heading,
  body,
  cta,
}: {
  href: string;
  heading: string;
  body: string;
  cta: string;
}): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 28px 0 8px 0; background-color: #F9F7F2; border: 1px solid #E6EBE4; border-radius: 16px;">
      <tr>
        <td style="padding: 28px 24px; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #8A9A5B;">Free, takes a minute</p>
          <h3 style="margin: 0 0 10px 0; font-family: ${EMAIL_SERIF}; font-size: 22px; color: #3A4D39;">${escapeEmailHtml(heading)}</h3>
          <p style="margin: 0 0 20px 0; font-size: 14px; color: #2C3628; line-height: 1.6;">${escapeEmailHtml(body)}</p>
          <a href="${escapeEmailHtml(href)}" class="btn-primary" style="display: inline-block; background-color: #BC5A45; background: linear-gradient(135deg, #BC5A45 0%, #A04532 100%); color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 50px; font-weight: 600; font-size: 15px;">${escapeEmailHtml(cta)}</a>
        </td>
      </tr>
    </table>`;
}

export function forestHeroHtml({
  label,
  name,
  blurb,
  href,
  imageUrl,
  imageAlt,
  ctaLabel = "View Recipe →",
}: {
  label?: string;
  name: string;
  blurb?: string;
  href: string;
  imageUrl?: string;
  imageAlt?: string;
  ctaLabel?: string;
}): string {
  const safeHref = escapeEmailHtml(href);
  const img = imageUrl
    ? `<a href="${safeHref}" style="display:block;text-decoration:none;line-height:0;">
        <img src="${escapeEmailHtml(imageUrl)}" alt="${escapeEmailHtml(imageAlt || name)}" width="560" style="display:block;width:100%;max-width:560px;height:auto;border:0;" />
      </a>`
    : "";

  return `
    <div style="background-color: #3A4D39; background: linear-gradient(135deg, #3A4D39 0%, #5F6F5E 100%); border-radius: 16px; overflow: hidden; margin: 24px 0;">
      ${img}
      <div style="background-color: #3A4D39; padding: 24px; text-align: center;">
        ${
          label
            ? `<p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #8A9A5B;">${escapeEmailHtml(label)}</p>`
            : ""
        }
        <h3 style="margin: 0 0 12px 0; font-family: ${EMAIL_SERIF}; font-size: 28px; color: #FFFFFF;">${escapeEmailHtml(name)}</h3>
        ${
          blurb
            ? `<p style="margin: 0 0 16px 0; font-size: 14px; color: #E6EBE4; line-height: 1.5;">${escapeEmailHtml(blurb)}</p>`
            : ""
        }
        <a href="${safeHref}" style="display: inline-block; background-color: #BC5A45; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 25px; font-size: 14px; font-weight: 600;">${escapeEmailHtml(ctaLabel)}</a>
      </div>
    </div>`;
}

export function creamDrinkHtml({
  label,
  name,
  blurb,
  href,
  imageUrl,
  imageAlt,
}: {
  label?: string;
  name: string;
  blurb?: string;
  href: string;
  imageUrl?: string;
  imageAlt?: string;
}): string {
  const safeHref = escapeEmailHtml(href);
  const img = imageUrl
    ? `<tr>
        <td style="padding: 0;">
          <a href="${safeHref}" style="display:block;text-decoration:none;line-height:0;">
            <img src="${escapeEmailHtml(imageUrl)}" alt="${escapeEmailHtml(imageAlt || name)}" width="560" style="display:block;width:100%;max-width:560px;height:auto;border:0;" />
          </a>
        </td>
      </tr>`
    : "";

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 24px 0; background-color: #F9F7F2; border: 1px solid #E6EBE4; border-radius: 16px; overflow: hidden;">
      ${img}
      <tr>
        <td style="padding: 20px;">
          ${
            label
              ? `<p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #5F6F5E;">${escapeEmailHtml(label)}</p>`
              : ""
          }
          <h3 style="margin: 0 0 10px 0; font-family: ${EMAIL_SERIF}; font-size: 22px; color: #3A4D39;">
            <a href="${safeHref}" style="color: #3A4D39; text-decoration: none;">${escapeEmailHtml(name)}</a>
          </h3>
          ${
            blurb
              ? `<p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #2C3628;">${escapeEmailHtml(blurb)}</p>`
              : ""
          }
          <p style="margin: 0;">
            <a href="${safeHref}" style="color: #BC5A45; text-decoration: none; font-weight: 600; font-size: 14px;">View Recipe →</a>
          </p>
        </td>
      </tr>
    </table>`;
}

export function thumbRowHtml({
  name,
  blurb,
  href,
  imageUrl,
  imageAlt,
}: {
  name: string;
  blurb?: string;
  href: string;
  imageUrl?: string;
  imageAlt?: string;
}): string {
  const safeHref = escapeEmailHtml(href);
  const thumb = imageUrl
    ? `<td width="72" valign="middle" style="width: 72px; padding-right: 14px;">
              <a href="${safeHref}" style="display: block; text-decoration: none;">
                <img src="${escapeEmailHtml(imageUrl)}" alt="${escapeEmailHtml(imageAlt || name)}" width="72" height="72" style="display: block; width: 72px; height: 72px; object-fit: cover; border-radius: 12px; border: 0;" />
              </a>
            </td>`
    : "";

  return `
    <tr>
      <td style="padding: 12px 16px; background-color: #F9F7F2; border-radius: 12px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            ${thumb}
            <td valign="middle">
              <a href="${safeHref}" style="color: #3A4D39; text-decoration: none; font-weight: 600; font-size: 16px;">${escapeEmailHtml(name)}</a>
              ${
                blurb
                  ? `<p style="margin: 4px 0 0 0; font-size: 13px; color: #5F6F5E;">${escapeEmailHtml(blurb)}</p>`
                  : ""
              }
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height: 8px;"></td></tr>`;
}

export function drinkListHtml(
  rows: Array<{
    name: string;
    blurb?: string;
    href: string;
    imageUrl?: string;
    imageAlt?: string;
  }>
): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">${rows
    .map((row) => thumbRowHtml(row))
    .join("")}</table>`;
}
