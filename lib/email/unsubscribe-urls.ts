/**
 * Unsubscribe URL builders for transactional and newsletter emails.
 */

import { getSiteUrl } from "@/lib/site";

export function buildUserUnsubscribeUrl(
  unsubscribeToken: string,
  type: "all" | "digest" | "welcome" = "all"
): string {
  const siteUrl = getSiteUrl();
  const typeParam = type === "digest" ? "digest" : type === "welcome" ? "all" : "all";
  return `${siteUrl}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}&type=${typeParam}`;
}

/** One-click List-Unsubscribe header target (RFC 8058) */
export function buildUserOneClickUnsubscribeUrl(unsubscribeToken: string): string {
  const siteUrl = getSiteUrl();
  return `${siteUrl}/api/email/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}&type=digest`;
}

export function buildNewsletterUnsubscribeUrl(
  email: string,
  source: string,
  unsubscribeToken: string
): string {
  const siteUrl = getSiteUrl();
  return `${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}&source=${encodeURIComponent(source)}&token=${encodeURIComponent(unsubscribeToken)}`;
}

export function buildNewsletterOneClickUnsubscribeUrl(
  email: string,
  source: string,
  unsubscribeToken: string
): string {
  const siteUrl = getSiteUrl();
  return `${siteUrl}/api/email/unsubscribe?email=${encodeURIComponent(email)}&source=${encodeURIComponent(source)}&token=${encodeURIComponent(unsubscribeToken)}`;
}
