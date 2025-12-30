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
    format?: 'webp' | 'jpg' | 'png';
    auto?: 'format' | 'compress';
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

  // Default to high quality (85) if not specified, or use provided quality
  const quality = options?.quality ?? 85;
  result = result.quality(quality);

  // Auto-format for better compression and modern browser support
  if (options?.auto === 'format' || !options?.format) {
    result = result.auto('format');
  }

  // Use WebP format for better compression if specified
  if (options?.format) {
    result = result.format(options.format);
  }

  return result.url();
}

/**
 * Get responsive image URLs for different screen sizes
 */
export function getResponsiveImageUrls(
  source: SanityImage | undefined | null,
  breakpoints: { [key: string]: { width: number; height: number } }
): { [key: string]: string } | null {
  const imageBuilder = urlFor(source);
  if (!imageBuilder) return null;

  const urls: { [key: string]: string } = {};

  for (const [key, { width, height }] of Object.entries(breakpoints)) {
    urls[key] = imageBuilder
      .width(width)
      .height(height)
      .quality(85)
      .auto('format')
      .url();
  }

  return urls;
}

/**
 * Generate appropriate sizes attribute for responsive images
 */
export function getImageSizes(breakpoints: { [key: string]: number }): string {
  const sizes = Object.entries(breakpoints)
    .map(([media, width]) => {
      if (media === 'default') return `${width}px`;
      return `${media} ${width}px`;
    })
    .join(', ');

  return sizes;
}

/**
 * Preload critical images for better performance
 */
export function preloadImage(src: string): void {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
}

/**
 * Generate preload link tags for critical images
 */
export function generatePreloadLinks(imageUrls: string[]): React.ReactElement[] {
  return imageUrls.map((url, index) => (
    <link
      key={`preload-${index}`}
      rel="preload"
      as="image"
      href={url}
      crossOrigin="anonymous"
    />
  ));
}

/**
 * Default blur placeholder data URL for cocktail images
 */
export const COCKTAIL_BLUR_DATA_URL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMEB//EACUQAAIBAwMEAwEBAAAAAAAAAAECAwAEEQUSITFBURNhcZEigf/EABUBAFEAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEQMRAD8A4+iiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q==";





