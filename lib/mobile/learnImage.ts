import { nativePhotoUrl } from "@/lib/mobile/nativeImage";

function absoluteStaticUrl(src: string): string {
  if (typeof window === "undefined") return src;
  try {
    return new URL(src, window.location.origin).href;
  } catch {
    return src;
  }
}

/** Resolve Learn cover art for native WebView — static /learn assets skip the optimizer. */
export function learnImageUrl(
  src: string | null | undefined,
  width: 384 | 640 | 750 = 640,
  quality: 70 | 75 | 85 = 85
): string | null {
  if (!src) return null;
  if (
    src.startsWith("/learn/") ||
    src.startsWith("/media/") ||
    src.startsWith("/brand/") ||
    src.startsWith("/occasions/")
  ) {
    return absoluteStaticUrl(src);
  }
  return nativePhotoUrl(src, width, quality) || src;
}
