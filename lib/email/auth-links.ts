/**
 * Builds MixWise-hosted auth links for email templates (better deliverability than raw Supabase URLs).
 */

import { getCanonicalSiteUrl } from "@/lib/site";

export function buildSafeAuthUrl(
  actionLink: string,
  requestUrl?: URL
): string {
  const baseUrl = getCanonicalSiteUrl(requestUrl);
  const parsed = new URL(actionLink);
  const token = parsed.searchParams.get("token") || "";
  const type = parsed.searchParams.get("type") || "";
  const redirectToParam = parsed.searchParams.get("redirect_to") || "";

  if (token && type) {
    const params = new URLSearchParams({ token, type });
    if (redirectToParam) params.set("redirect_to", redirectToParam);
    return `${baseUrl}/auth/verify?${params.toString()}`;
  }

  return `${baseUrl}/auth/redirect?to=${encodeURIComponent(actionLink)}`;
}
