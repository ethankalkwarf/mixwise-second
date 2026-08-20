const TILE_WIDTHS = new Set([384, 640, 750, 828, 1080]);

/** Resize cocktail photos through Next's optimizer so WKWebView does not download masters. */
export function nativePhotoUrl(
  src: string | null | undefined,
  width: 384 | 640 | 750 | 828 | 1080 = 640,
  quality: 70 | 75 | 85 = 75
): string | null {
  if (!src) return null;
  if (src.startsWith("data:") || src.startsWith("blob:")) return src;
  if (src.endsWith(".svg") || src.startsWith("/brand/") || src.startsWith("/occasions/") || src.startsWith("/learn/") || src.startsWith("/media/") || src.startsWith("/ingredients/")) return src;
  if (src.includes("/_next/image?")) return src;
  if (!TILE_WIDTHS.has(width)) width = 640;

  try {
    const absolute = /^https?:\/\//i.test(src)
      ? src
      : typeof window !== "undefined"
        ? new URL(src, window.location.origin).toString()
        : src;
    if (!/^https?:\/\//i.test(absolute)) return src;
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
