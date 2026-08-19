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
  const token = parsed.searchParams.get("token") || parsed.searchParams.get("token_hash") || "";
  const type = parsed.searchParams.get("type") || "";
  const redirectToParam = parsed.searchParams.get("redirect_to") || "";

  if (token && type) {
    const params = new URLSearchParams({ token, type, token_hash: token });
    if (redirectToParam) {
      try {
        const redirectUrl = new URL(redirectToParam);
        params.set("redirect_to", `${baseUrl}${redirectUrl.pathname}${redirectUrl.search}`);
      } catch {
        params.set("redirect_to", `${baseUrl}/reset-password`);
      }
    }
    return `${baseUrl}/auth/verify?${params.toString()}`;
  }

  return `${baseUrl}/auth/redirect?to=${encodeURIComponent(actionLink)}`;
}
