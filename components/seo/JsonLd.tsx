import { MIXWISE_TOOL, SITE_CONFIG } from "@/lib/seo";

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
  /** Single block of instruction text, or pre-split steps. */
  instructions?: string | string[];
  prepTime?: string; // ISO 8601 duration (e.g., "PT5M" for 5 minutes)
  totalTime?: string;
  servings?: number;
  category?: string | null;
  url: string;
  calories?: number | null;
};

function stepNameFromInstruction(text: string): string {
  const cleaned = text.replace(/^\d+[\.\)]\s*/, "").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  let name = words.slice(0, Math.min(5, words.length)).join(" ");
  name = name.replace(/[.,;:!]+$/, "");
  if (name.length > 48) {
    name = name.slice(0, 45).replace(/\s+\S*$/, "") || name.slice(0, 45);
  }
  return name || "Mix";
}

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
  calories,
}: RecipeSchemaProps) {
  const recipeImage = image || `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`;
  const instructionSteps = Array.isArray(instructions)
    ? instructions.filter((s) => typeof s === "string" && s.trim())
    : instructions
      ? [instructions]
      : [];

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name,
    description: description || `Learn how to make a ${name} cocktail.`,
    image: recipeImage,
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
    ...(instructionSteps.length > 0
      ? {
          recipeInstructions: instructionSteps.map((text, index) => ({
            "@type": "HowToStep",
            name: stepNameFromInstruction(text),
            text,
            url: `${url}#step-${index + 1}`,
            image: recipeImage,
            position: index + 1,
          })),
        }
      : {}),
    url,
    keywords: [name, "cocktail", "drink recipe", "mixology", category].join(", "),
  };

  if (calories != null && calories > 0) {
    schema.nutrition = {
      "@type": "NutritionInformation",
      calories: `${Math.round(calories)} calories`,
    };
  }

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
      {
        "@type": ["SoftwareApplication", "WebApplication"],
        "@id": `${SITE_CONFIG.url}/mix#app`,
        name: SITE_CONFIG.name,
        url: `${SITE_CONFIG.url}/mix`,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        description: MIXWISE_TOOL.oneLiner,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        publisher: { "@id": organizationId },
        featureList: [
          "Match cocktails to ingredients you already have",
          "See drinks that are one bottle away",
          "Save a home bar, favorites, tasting notes, and shopping list",
          "Skip drinks you won't make again",
        ],
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

type IngredientTermSchemaProps = {
  name: string;
  description: string;
  url: string;
  image?: string | null;
  faqs?: Array<{ question: string; answer: string }>;
  cocktails?: Array<{ name: string; url: string }>;
};

export function IngredientTermSchema({
  name,
  description,
  url,
  image,
  faqs = [],
  cocktails = [],
}: IngredientTermSchemaProps) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Article",
      headline: `What is ${name}? Taste, history, and cocktails`,
      description,
      image: image || `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
      author: organizationRef,
      publisher: {
        ...organizationRef,
        logo: organizationLogo,
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      url,
    },
  ];

  if (faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }

  if (cocktails.length > 0) {
    graph.push({
      "@type": "ItemList",
      name: `Cocktails with ${name}`,
      numberOfItems: cocktails.length,
      itemListElement: cocktails.slice(0, 20).map((cocktail, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: cocktail.name,
        url: cocktail.url,
      })),
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}

export function SoftwareApplicationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
    "@id": `${SITE_CONFIG.url}/mix#app`,
    name: SITE_CONFIG.name,
    url: `${SITE_CONFIG.url}/mix`,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    description: MIXWISE_TOOL.oneLiner,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: organizationRef,
    featureList: [
      "Match cocktails to ingredients you already have",
      "See drinks that are one bottle away",
      "Save a home bar, favorites, tasting notes, and shopping list",
      "Skip drinks you won't make again",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

type FAQPageSchemaProps = {
  faqs: Array<{ question: string; answer: string }>;
};

export function FAQPageSchema({ faqs }: FAQPageSchemaProps) {
  if (faqs.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

type CollectionPageSchemaProps = {
  name: string;
  description: string;
  url: string;
  items: Array<{ name: string; url: string }>;
};

export function CollectionPageSchema({ name, description, url, items }: CollectionPageSchemaProps) {
  const listed = items.slice(0, 40);
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    isPartOf: {
      "@type": "WebSite",
      "@id": websiteId,
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: listed.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    },
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




