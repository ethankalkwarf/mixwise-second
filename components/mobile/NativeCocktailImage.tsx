"use client";

import { getImageUrl } from "@/lib/sanityImage";
import { nativePhotoUrl } from "@/lib/mobile/nativeImage";
import type { SanityCocktail } from "@/lib/sanityTypes";

/**
 * Cocktail photo for Capacitor WebView.
 * `fill` covers a positioned parent (heroes). Leave it off for stacked cards
 * so the name can sit under the photo instead of overlapping it.
 */
export function NativeCocktailImage({
  src,
  alt = "",
  className = "",
  priority = false,
  fill = false,
  width = 1080,
}: {
  src: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  width?: 384 | 640 | 750 | 828 | 1080;
}) {
  const optimized = nativePhotoUrl(src, width, fill || priority ? 85 : 75) || src;
  return (
    // Native shell loads remote catalog URLs directly; next/image fill is unreliable in WKWebView.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={optimized}
      alt={alt}
      className={
        fill
          ? `absolute inset-0 h-full w-full max-w-none object-cover ${className}`
          : `block h-full w-full object-cover ${className}`
      }
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      loading={priority ? "eager" : "lazy"}
    />
  );
}

export function cocktailImageUrl(cocktail: SanityCocktail): string | null {
  return (
    getImageUrl(cocktail.image, {
      width: 900,
      height: 600,
      quality: 85,
      auto: "format",
    }) || cocktail.externalImageUrl || null
  );
}
