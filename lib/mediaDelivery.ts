/**
 * Public catalog photos live on Vercel Blob as WebP (`image_url`).
 *
 * Email clients (Outlook especially) do not render WebP, and `/_next/image`
 * can emit AVIF/WebP based on Accept headers — both break in Gmail/Outlook.
 * Email/thumb purposes therefore go through `/api/email-image`, which always
 * returns JPEG. OG/schema still rewrite leftover Supabase Storage URLs
 * through `/_next/image`.
 */

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.getmixwise.com"
).replace(/\/$/, "");

/** Widths for `/_next/image` must exist in next.config.js images.deviceSizes / imageSizes. */
export const MEDIA_DELIVERY = {
  email: { width: 640, quality: 75 },
  emailThumb: { width: 128, quality: 70 },
  og: { width: 1200, quality: 75 },
  schema: { width: 1200, quality: 75 },
} as const;

export type MediaDeliveryPurpose = keyof typeof MEDIA_DELIVERY;

const EMAIL_SAFE_RASTER = /\.(?:jpe?g|png|gif)$/i;

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

export function isAllowedEmailImageSource(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    if (host.endsWith(".public.blob.vercel-storage.com")) return true;
    if (host.endsWith(".supabase.co") && parsed.pathname.includes("/storage/")) {
      return true;
    }
    if (host === "www.getmixwise.com" || host === "getmixwise.com") return true;
    if (host === "cdn.sanity.io") return true;
    return false;
  } catch {
    return false;
  }
}

function absolutize(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${SITE_URL}${url}`;
  return url;
}

function isEmailImageProxyUrl(url: string): boolean {
  try {
    const parsed = new URL(url, SITE_URL);
    return parsed.pathname === "/api/email-image";
  } catch {
    return url.includes("/api/email-image?");
  }
}

function isEmailSafeRasterUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    // Next optimizer may emit AVIF/WebP from Accept — never put this in email.
    if (parsed.pathname === "/_next/image") return false;
    return EMAIL_SAFE_RASTER.test(parsed.pathname);
  } catch {
    return false;
  }
}

function wrapNextImage(url: string, purpose: MediaDeliveryPurpose): string {
  const { width, quality } = MEDIA_DELIVERY[purpose];
  const params = new URLSearchParams({
    url,
    w: String(width),
    q: String(quality),
  });
  return `${SITE_URL}/_next/image?${params.toString()}`;
}

function wrapEmailImage(
  url: string,
  purpose: Extract<MediaDeliveryPurpose, "email" | "emailThumb">
): string {
  const { width, quality } = MEDIA_DELIVERY[purpose];
  const params = new URLSearchParams({
    url,
    w: String(width),
    q: String(quality),
  });
  return `${SITE_URL}/api/email-image?${params.toString()}`;
}

function toEmailDeliveryUrl(
  url: string,
  purpose: Extract<MediaDeliveryPurpose, "email" | "emailThumb">
): string {
  const absolute = absolutize(url);
  if (isEmailImageProxyUrl(absolute)) return absolute;
  if (isEmailSafeRasterUrl(absolute)) return absolute;
  return wrapEmailImage(absolute, purpose);
}

/**
 * Absolute delivery URL for email, OG, schema, and other hotlink surfaces.
 * Email purposes always resolve to JPEG (or an already-safe JPEG/PNG/GIF).
 */
export function toPublicDeliveryUrl(
  url: string | null | undefined,
  purpose: MediaDeliveryPurpose = "email"
): string | undefined {
  if (!url) return undefined;
  if (purpose === "email" || purpose === "emailThumb") {
    return toEmailDeliveryUrl(url, purpose);
  }
  if (!isSupabaseStorageUrl(url)) return url;
  return wrapNextImage(url, purpose);
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
