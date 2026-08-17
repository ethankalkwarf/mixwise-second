/**
 * Public catalog photos should live on Vercel Blob (`image_url`).
 * This helper is a fallback: leftover Supabase Storage URLs are rewritten
 * through /_next/image so email/OG/preloads do not hotlink Storage.
 */

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.getmixwise.com"
).replace(/\/$/, "");

/** Widths must exist in next.config.js images.deviceSizes / imageSizes. */
export const MEDIA_DELIVERY = {
  email: { width: 640, quality: 75 },
  emailThumb: { width: 128, quality: 70 },
  og: { width: 1200, quality: 75 },
  schema: { width: 1200, quality: 75 },
} as const;

export type MediaDeliveryPurpose = keyof typeof MEDIA_DELIVERY;

export function isSupabaseStorageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.endsWith(".supabase.co") &&
      parsed.pathname.includes("/storage/")
    );
  } catch {
    return false;
  }
}

/**
 * Absolute /_next/image URL for email, OG, schema, and other hotlink surfaces.
 * Non-Supabase URLs (Vercel Blob, Sanity, site assets) pass through unchanged.
 */
export function toPublicDeliveryUrl(
  url: string | null | undefined,
  purpose: MediaDeliveryPurpose = "email"
): string | undefined {
  if (!url) return undefined;
  if (!isSupabaseStorageUrl(url)) return url;

  const { width, quality } = MEDIA_DELIVERY[purpose];
  const params = new URLSearchParams({
    url,
    w: String(width),
    q: String(quality),
  });
  return `${SITE_URL}/_next/image?${params.toString()}`;
}

/** Same-origin optimizer path for in-app preloads (no absolute host). */
export function toOptimizedImagePath(
  url: string | null | undefined,
  purpose: MediaDeliveryPurpose = "email"
): string | undefined {
  if (!url) return undefined;
  if (!isSupabaseStorageUrl(url)) return url;

  const { width, quality } = MEDIA_DELIVERY[purpose];
  const params = new URLSearchParams({
    url,
    w: String(width),
    q: String(quality),
  });
  return `/_next/image?${params.toString()}`;
}
