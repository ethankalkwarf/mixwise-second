import { SITE_CONFIG } from "@/lib/seo";

const organizationId = `${SITE_CONFIG.url}/#organization`;
const websiteId = `${SITE_CONFIG.url}/#website`;

const organizationLogo = {
  "@type": "ImageObject",
  url: `${SITE_CONFIG.url}${SITE_CONFIG.logo}`,
  width: 512,
  height: 512,
};

const organizationRef = {
  "@type": "Organization",
  "@id": organizationId,
  name: SITE_CONFIG.name,
  url: SITE_CONFIG.url,
};

type WebPageSchemaProps = {
  title: string;
  description: string;
  url: string;
};

export function WebPageSchema({ title, description, url }: WebPageSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    isPartOf: {
      "@type": "WebSite",
      "@id": websiteId,
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

type RecipeSchemaProps = {
  name: string;
  description?: string;
  image?: string | null;
  ingredients: string[];
  instructions?: string;
  prepTime?: string; // ISO 8601 duration (e.g., "PT5M" for 5 minutes)
  totalTime?: string;
  servings?: number;
  category?: string | null;
  url: string;
};

export function RecipeSchema({
  name,
  description,
  image,
  ingredients,
  instructions,
  prepTime = "PT5M",
  totalTime = "PT10M",
  servings = 1,
  category = "Cocktail",
  url,
}: RecipeSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name,
    description: description || `Learn how to make a ${name} cocktail.`,
    image: image || `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
    author: organizationRef,
    publisher: {
      ...organizationRef,
      logo: organizationLogo,
    },
    prepTime,
    totalTime,
    recipeYield: `${servings} serving${servings > 1 ? "s" : ""}`,
    recipeCategory: category || "Cocktail",
    recipeCuisine: "International",
    recipeIngredient: ingredients,
    recipeInstructions: instructions
      ? {
          "@type": "HowToStep",
          text: instructions,
        }
      : undefined,
    url,
    keywords: [name, "cocktail", "drink recipe", "mixology", category].join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

type ArticleSchemaProps = {
  title: string;
  description: string;
  image?: string;
  publishedAt: string;
  modifiedAt?: string;
  author?: string;
  url: string;
};

export function ArticleSchema({
  title,
  description,
  image,
  publishedAt,
  modifiedAt,
  author,
  url,
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: image || `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
    author: author
      ? {
          "@type": "Person",
          name: author,
        }
      : {
          "@type": "Organization",
          name: SITE_CONFIG.name,
          url: SITE_CONFIG.url,
        },
    publisher: {
      ...organizationRef,
      logo: organizationLogo,
    },
    datePublished: publishedAt,
    dateModified: modifiedAt || publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        description: SITE_CONFIG.description,
        logo: organizationLogo,
        image: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
        ...(SITE_CONFIG.sameAs.length > 0 ? { sameAs: SITE_CONFIG.sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        description: SITE_CONFIG.description,
        publisher: { "@id": organizationId },
        inLanguage: "en-US",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}




