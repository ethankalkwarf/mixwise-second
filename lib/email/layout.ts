/**
 * Shared chrome and blocks for MixWise marketing emails.
 * Photography and copy share one padded content column.
 */

import {
  EMAIL_BTN_STUDIO,
  EMAIL_DEFAULT_SITE,
  EMAIL_LINK_CTA_STUDIO,
  EMAIL_SERIF,
  emailDocument,
  emailPad,
  escapeEmailHtml,
} from "@/lib/email/templates";
import { toPublicDeliveryUrl } from "@/lib/mediaDelivery";

export const MIXWISE_EMAIL_SITE = EMAIL_DEFAULT_SITE;

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
  return emailDocument({
    title,
    previewText,
    bodyHtml,
    userEmail,
    unsubscribeUrl,
    siteUrl,
    theme: "studio",
  });
}

export function greetingHtml(text: string): string {
  return emailPad(
    `<h2 class="greeting" style="font-family: ${EMAIL_SERIF}; font-size: 34px; color: #1C241B; margin: 0 0 16px 0; font-weight: 400; line-height: 1.15; letter-spacing: -0.02em;">${text}</h2>`
  );
}

export function bodyHtml(text: string): string {
  return emailPad(
    `<p class="body-text" style="font-size: 17px; color: #2C3628; margin: 0 0 18px 0; line-height: 1.55;">${text}</p>`
  );
}

export function mutedHtml(text: string, extraStyle = ""): string {
  return emailPad(
    `<p class="muted-text" style="font-size: 14px; color: #5F6F5E; margin: 0 0 14px 0; line-height: 1.55;${extraStyle}">${text}</p>`
  );
}

export function sectionLabelHtml(text: string): string {
  return emailPad(
    `<p style="font-size: 12px; font-weight: 600; letter-spacing: 0.04em; color: #5F6F5E; margin: 8px 0 12px 0;">${escapeEmailHtml(text)}</p>`
  );
}

export function primaryCtaHtml(href: string, label: string): string {
  return emailPad(
    `<div class="button-wrapper" style="margin: 28px 0;">
            <a href="${escapeEmailHtml(href)}" class="btn-primary" style="${EMAIL_BTN_STUDIO}">
              ${escapeEmailHtml(label)}
            </a>
          </div>`
  );
}

export function dividerHtml(): string {
  return emailPad(
    `<div class="divider" style="height: 1px; background-color: #E6EBE4; margin: 28px 0; line-height: 1px; font-size: 1px;">&nbsp;</div>`
  );
}

export function signoffHtml(closer?: string): string {
  const signature = `<p style="margin: 16px 0 0 0; font-family: ${EMAIL_SERIF}; font-size: 17px; font-weight: 400; color: #1C241B;">— Ethan</p>`;
  const inner = !closer?.trim()
    ? signature
    : `<p class="muted-text" style="font-size: 14px; color: #5F6F5E; margin: 0; line-height: 1.55;">${escapeEmailHtml(closer)}</p>${signature}`;
  return emailPad(inner, { bottom: 8 });
}

export function signoffText(closer?: string): string {
  return closer?.trim() ? `${closer}\n\n— Ethan` : "— Ethan";
}

export function stepsHtml(
  steps: Array<{ n: string; title: string; body: string }>
): string {
  return emailPad(
    `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 12px 0 4px 0;">${steps
      .map((step, index) => {
        const padY = `${index === 0 ? "8px" : "22px"} 0 ${index === steps.length - 1 ? "8px" : "22px"} 0`;
        const rule =
          index < steps.length - 1 ? "border-bottom:1px solid #E8E8E8;" : "";
        return `
    <tr>
      <td width="36" valign="top" style="width:36px;padding:${padY};${rule}">
        <p style="margin:0;font-family:${EMAIL_SERIF};font-size:28px;line-height:1;font-weight:400;letter-spacing:-0.02em;color:#1C241B;">${escapeEmailHtml(step.n)}</p>
      </td>
      <td valign="top" style="padding:${padY};${rule}">
        <p style="margin:4px 0 6px 0;font-weight:600;color:#1C241B;font-size:16px;line-height:1.3;">${escapeEmailHtml(step.title)}</p>
        <p style="margin:0;font-size:15px;color:#5F6F5E;line-height:1.5;">${escapeEmailHtml(step.body)}</p>
      </td>
    </tr>`;
      })
      .join("")}</table>`
  );
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
  return emailPad(`
    <div style="margin: 28px 0 8px 0; padding: 28px 0; border-top: 1px solid #E6EBE4; border-bottom: 1px solid #E6EBE4;">
      <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; color: #5F6F5E;">Free · takes a minute</p>
      <h3 style="margin: 0 0 10px 0; font-family: ${EMAIL_SERIF}; font-size: 26px; color: #1C241B; font-weight: 400; letter-spacing: -0.02em; line-height: 1.2;">${escapeEmailHtml(heading)}</h3>
      <p style="margin: 0 0 22px 0; font-size: 15px; color: #2C3628; line-height: 1.55;">${escapeEmailHtml(body)}</p>
      <a href="${escapeEmailHtml(href)}" class="btn-primary" style="${EMAIL_BTN_STUDIO}">${escapeEmailHtml(cta)}</a>
    </div>`);
}

/** Drink hero — photo and caption share the padded content column. */
export function forestHeroHtml({
  label,
  name,
  blurb,
  href,
  imageUrl,
  imageAlt,
  ctaLabel = "View recipe",
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
  const deliveryUrl = toPublicDeliveryUrl(imageUrl, "email");
  const img = deliveryUrl
    ? `<a href="${safeHref}" style="display:block;text-decoration:none;line-height:0;">
            <img src="${escapeEmailHtml(deliveryUrl)}" alt="${escapeEmailHtml(imageAlt || name)}" width="504" style="display:block;width:100%;max-width:504px;height:auto;border:0;" />
          </a>`
    : "";

  return emailPad(
    `<div style="margin: 28px 0 8px 0;">
      ${img}
      ${label ? `<p style="margin: 20px 0 8px 0; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; color: #5F6F5E;">${escapeEmailHtml(label)}</p>` : img ? `<div style="height:20px;line-height:20px;font-size:1px;">&nbsp;</div>` : ""}
      <h3 style="margin: 0 0 10px 0; font-family: ${EMAIL_SERIF}; font-size: 30px; color: #1C241B; font-weight: 400; letter-spacing: -0.02em; line-height: 1.15;">
        <a href="${safeHref}" style="color: #1C241B; text-decoration: none;">${escapeEmailHtml(name)}</a>
      </h3>
      ${blurb ? `<p style="margin: 0 0 16px 0; font-size: 16px; color: #2C3628; line-height: 1.55;">${escapeEmailHtml(blurb)}</p>` : ""}
      <p style="margin: 0;"><a href="${safeHref}" style="${EMAIL_LINK_CTA_STUDIO}">${escapeEmailHtml(ctaLabel)}</a></p>
    </div>`,
    { bottom: 8 }
  );
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
  const deliveryUrl = toPublicDeliveryUrl(imageUrl, "email");
  const img = deliveryUrl
    ? `<a href="${safeHref}" style="display:block;text-decoration:none;line-height:0;">
            <img src="${escapeEmailHtml(deliveryUrl)}" alt="${escapeEmailHtml(imageAlt || name)}" width="504" style="display:block;width:100%;max-width:504px;height:auto;border:0;" />
          </a>`
    : "";

  return emailPad(
    `<div style="margin: 28px 0 8px 0;">
      ${img}
      ${label ? `<p style="margin: ${img ? "16px" : "0"} 0 8px 0; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; color: #777777;">${escapeEmailHtml(label)}</p>` : img ? `<div style="height:16px;line-height:16px;font-size:1px;">&nbsp;</div>` : ""}
      <h3 style="margin: 0 0 10px 0; font-family: ${EMAIL_SERIF}; font-size: 26px; color: #111111; font-weight: 400; letter-spacing: -0.02em; line-height: 1.2;">
        <a href="${safeHref}" style="color: #111111; text-decoration: none;">${escapeEmailHtml(name)}</a>
      </h3>
      ${blurb ? `<p style="margin: 0 0 14px 0; font-size: 15px; line-height: 1.55; color: #333333;">${escapeEmailHtml(blurb)}</p>` : ""}
      <p style="margin: 0;"><a href="${safeHref}" style="${EMAIL_LINK_CTA_STUDIO}">View recipe</a></p>
    </div>`,
    { bottom: 8 }
  );
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
  const deliveryUrl = toPublicDeliveryUrl(imageUrl, "emailThumb");
  const thumb = deliveryUrl
    ? `<td width="72" valign="top" style="width: 72px; padding-right: 16px;">
              <a href="${safeHref}" style="display: block; text-decoration: none; line-height: 0;">
                <img src="${escapeEmailHtml(deliveryUrl)}" alt="${escapeEmailHtml(imageAlt || name)}" width="72" height="72" style="display: block; width: 72px; height: 72px; object-fit: cover; border-radius: 0; border: 0;" />
              </a>
            </td>`
    : "";

  return `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #E6EBE4;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            ${thumb}
            <td valign="middle">
              <a href="${safeHref}" style="color: #1C241B; text-decoration: none; font-weight: 600; font-size: 16px;">${escapeEmailHtml(name)}</a>
              ${
                blurb
                  ? `<p style="margin: 4px 0 0 0; font-size: 14px; color: #5F6F5E; line-height: 1.45;">${escapeEmailHtml(blurb)}</p>`
                  : ""
              }
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
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
  return emailPad(
    `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">${rows
      .map((row) => thumbRowHtml(row))
      .join("")}</table>`
  );
}

/** @deprecated Prefer composing with self-padded helpers. */
export function paddedCampaignBody(inner: string): string {
  return emailPad(inner, { top: 4, bottom: 8 });
}
