import { createHmac, timingSafeEqual } from "crypto";
import { getSiteUrl } from "@/lib/site";

function getSigningSecret(): string {
  return (
    process.env.CRON_SECRET ||
    process.env.INTERNAL_API_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ""
  );
}

export function createNewsletterUnsubscribeToken(email: string, source: string): string {
  const secret = getSigningSecret();
  const payload = `${email.trim().toLowerCase()}|${source}`;
  return createHmac("sha256", secret || "dev-newsletter-unsub").update(payload).digest("hex").slice(0, 32);
}

export function verifyNewsletterUnsubscribeToken(
  email: string,
  source: string,
  token: string | null | undefined
): boolean {
  if (!token || typeof token !== "string") return false;
  const expected = createNewsletterUnsubscribeToken(email, source);
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function buildNewsletterUnsubscribeUrl(email: string, source: string, siteUrl = getSiteUrl()): string {
  const token = createNewsletterUnsubscribeToken(email, source);
  const params = new URLSearchParams({
    email: email.trim().toLowerCase(),
    source,
    token,
  });
  return `${siteUrl}/unsubscribe?${params.toString()}`;
}

export function buildNewsletterUnsubscribeApiUrl(email: string, source: string, siteUrl = getSiteUrl()): string {
  const token = createNewsletterUnsubscribeToken(email, source);
  const params = new URLSearchParams({
    email: email.trim().toLowerCase(),
    source,
    token,
  });
  return `${siteUrl}/api/email/newsletter-unsubscribe?${params.toString()}`;
}
