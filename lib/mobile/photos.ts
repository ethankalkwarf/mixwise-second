/** Widths that exist in next.config.js `images.deviceSizes` / `imageSizes`. */
export type NativePhotoWidth = 384 | 640 | 750 | 828 | 1080;
export type NativePhotoQuality = 70 | 75 | 85;

/**
 * Route catalog photos through Next's image optimizer so WKWebView
 * does not download full-resolution Blob masters for every tile.
 */
export function nativePhotoUrl(
  src: string | null | undefined,
  width: NativePhotoWidth = 640,
  quality: NativePhotoQuality = 75
): string | null {
  if (!src) return null;
  if (src.startsWith("data:") || src.startsWith("blob:")) return src;
  if (src.includes("/_next/image?")) return src;
  if (src.endsWith(".svg") || src.startsWith("/brand/")) return src;

  try {
    const absolute = src.startsWith("http://") || src.startsWith("https://") ? src : src;
    const params = new URLSearchParams({
      url: absolute,
      w: String(width),
      q: String(quality),
    });
    return `/_next/image?${params.toString()}`;
  } catch {
    return src;
  }
}
