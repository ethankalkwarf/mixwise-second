import imageUrlBuilder from "@sanity/image-url";
import { sanityClient, sanityConfig } from "./sanityClient";
import type { SanityImage } from "./sanityTypes";

const builder = imageUrlBuilder(sanityClient);

/**
 * Generate a URL for a Sanity image asset
 */
export function urlFor(source: SanityImage | undefined | null) {
  if (!source?.asset?._ref) {
    return null;
  }
  return builder.image(source);
}

/**
 * Get the URL string for a Sanity image with optional transformations
 */
export function getImageUrl(
  source: SanityImage | undefined | null,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
  }
): string | null {
  const imageBuilder = urlFor(source);
  if (!imageBuilder) return null;

  let result = imageBuilder;
  
  if (options?.width) {
    result = result.width(options.width);
  }
  if (options?.height) {
    result = result.height(options.height);
  }
  if (options?.quality) {
    result = result.quality(options.quality);
  }

  return result.url();
}




