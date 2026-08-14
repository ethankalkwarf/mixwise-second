import type { Metadata } from "next";

export const SITE_CONFIG = {
  name: "MixWise",
  tagline: "A smarter way to make cocktails at home",
  description:
    "MixWise is a cocktail platform designed to help people make better drinks at home. Curated recipes, clear instructions, and tools that make cocktail discovery easy.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.getmixwise.com",
  ogImage: "/og-image.jpg",
  logo: "/logo.png",
  twitterHandle: "@mixwise",
  sameAs: [] as string[],
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

function stripSiteSuffix(value: string): string {
  return value.replace(new RegExp(`\\s*[|–-]\\s*${SITE_CONFIG.name}\\s*$`, "i"), "").trim();
}

function absoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return `${SITE_CONFIG.url}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

/**
 * Generate metadata for a page.
 * `title` should not include "| MixWise" — the root title template adds it.
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
    ? `${stripSiteSuffix(title)} | ${SITE_CONFIG.name}`
    : `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`;

  const url = `${SITE_CONFIG.url}${path}`;
  const imageUrl = ogImage ? absoluteUrl(ogImage) : absoluteUrl(SITE_CONFIG.ogImage);

  const metadata: Metadata = {
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
          alt: title ? `${stripSiteSuffix(title)} | ${SITE_CONFIG.name}` : SITE_CONFIG.name,
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

  if (title) {
    metadata.title = stripSiteSuffix(title);
  }

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
  seoTitle?: string;
  metaDescription?: string;
  // eslint-disable-next-line
  ingredients?: Array<any>;
  primarySpirit?: string;
}): Metadata {
  const ingredientNames = cocktail.ingredients
    ?.map((i) => i.ingredient?.name)
    .filter(Boolean)
    .slice(0, 5)
    .join(", ");

  const rawSeo = cocktail.seoTitle?.trim();
  const title =
    rawSeo && rawSeo.length <= 70 && rawSeo !== cocktail.metaDescription
      ? stripSiteSuffix(rawSeo)
      : `${cocktail.name} Recipe`;

  const description =
    cocktail.metaDescription ||
    cocktail.description ||
    `Learn how to make a ${cocktail.name}${cocktail.primarySpirit ? ` with ${cocktail.primarySpirit}` : ""}${ingredientNames ? `. Made with ${ingredientNames}.` : "."}`;

  return generatePageMetadata({
    title,
    description,
    path: `/cocktails/${cocktail.slug?.current}`,
    ogImage: cocktail.externalImageUrl || SITE_CONFIG.ogImage,
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
    ogImage: article.image?.asset?.url || SITE_CONFIG.ogImage,
    type: "article",
    publishedTime: article.publishedAt,
    authors: article.author?.name ? [article.author.name] : undefined,
  });
}
