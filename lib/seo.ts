import type { Metadata } from "next";

// Base site configuration
export const SITE_CONFIG = {
  name: "MixWise",
  tagline: "A smarter way to make cocktails at home",
  description: "MixWise is a cocktail platform designed to help people make better drinks at home. Curated recipes, clear instructions, and tools that make cocktail discovery easy.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://getmixwise.com",
  ogImage: "/og-image.jpg",
  twitterHandle: "@mixwise",
};

type MetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  keywords?: string[];
};

/**
 * Generate metadata for a page
 */
export function generatePageMetadata(options: MetadataOptions = {}): Metadata {
  const {
    title,
    description = SITE_CONFIG.description,
    path = "",
    ogImage = SITE_CONFIG.ogImage,
    noIndex = false,
    type = "website",
    publishedTime,
    modifiedTime,
    authors,
    keywords,
  } = options;

  const pageTitle = title 
    ? `${title} | ${SITE_CONFIG.name}` 
    : `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`;
  
  const url = `${SITE_CONFIG.url}${path}`;
  const imageUrl = ogImage 
    ? (ogImage.startsWith("http") ? ogImage : `${SITE_CONFIG.url}${ogImage}`)
    : `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`;

  const metadata: Metadata = {
    title: pageTitle,
    description,
    metadataBase: new URL(SITE_CONFIG.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      locale: "en_US",
      url,
      title: pageTitle,
      description,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title || SITE_CONFIG.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [imageUrl],
      creator: SITE_CONFIG.twitterHandle,
    },
    robots: noIndex 
      ? { index: false, follow: false } 
      : { index: true, follow: true },
  };

  if (keywords && keywords.length > 0) {
    metadata.keywords = keywords;
  }

  if (type === "article" && metadata.openGraph) {
    const og = metadata.openGraph as Record<string, unknown>;
    if (publishedTime) og.publishedTime = publishedTime;
    if (modifiedTime) og.modifiedTime = modifiedTime;
    if (authors) og.authors = authors;
  }

  return metadata;
}

/**
 * Generate cocktail-specific metadata
 */
export function generateCocktailMetadata(cocktail: {
  name: string;
  slug?: { current: string };
  description?: string;
  externalImageUrl?: string;
  // eslint-disable-next-line
  ingredients?: Array<any>;
  primarySpirit?: string;
}): Metadata {
  const ingredientNames = cocktail.ingredients
    ?.map((i) => i.ingredient?.name)
    .filter(Boolean)
    .slice(0, 5)
    .join(", ");

  const description = cocktail.description 
    || `Learn how to make a ${cocktail.name}${cocktail.primarySpirit ? ` with ${cocktail.primarySpirit}` : ""}${ingredientNames ? `. Made with ${ingredientNames}.` : "."}`;

  // Handle image from Sanity or external URL
  const imageUrl = cocktail.externalImageUrl;

  return generatePageMetadata({
    title: `${cocktail.name} Recipe`,
    description,
    path: `/cocktails/${cocktail.slug?.current}`,
    ogImage: imageUrl,
    keywords: [
      cocktail.name,
      "cocktail recipe",
      "cocktail",
      cocktail.primarySpirit,
      ...(cocktail.ingredients?.map((i) => i.ingredient?.name).filter(Boolean) || []),
    ].filter(Boolean) as string[],
  });
}

/**
 * Generate article-specific metadata
 */
export function generateArticleMetadata(article: {
  title: string;
  slug: { current: string };
  excerpt?: string;
  image?: { asset?: { url?: string } };
  publishedAt?: string;
  author?: { name?: string };
}): Metadata {
  return generatePageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/blog/${article.slug.current}`,
    ogImage: article.image?.asset?.url,
    type: "article",
    publishedTime: article.publishedAt,
    authors: article.author?.name ? [article.author.name] : undefined,
  });
}

