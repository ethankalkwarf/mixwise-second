/**
 * Unsubscribe URL builders for registered-user emails.
 */

import { getSiteUrl } from "@/lib/site";

export function buildUserUnsubscribeUrl(
  unsubscribeToken: string,
  type: "all" | "digest" | "welcome" = "all"
): string {
  const siteUrl = getSiteUrl();
  const typeParam = type === "digest" ? "digest" : "all";
  return `${siteUrl}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}&type=${typeParam}`;
}

/** One-click List-Unsubscribe header target (RFC 8058) */
export function buildUserOneClickUnsubscribeUrl(unsubscribeToken: string): string {
  const siteUrl = getSiteUrl();
  return `${siteUrl}/api/email/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}&type=digest`;
}
