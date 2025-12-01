import { MetadataRoute } from "next";
import { sanityClient } from "@/lib/sanityClient";
import { SITE_CONFIG } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/cocktails`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/mix`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // Fetch cocktail slugs from Sanity
  let cocktailPages: MetadataRoute.Sitemap = [];
  try {
    const cocktails = await sanityClient.fetch<Array<{ slug: { current: string }; _updatedAt: string }>>(
      `*[_type == "cocktail" && defined(slug.current)]{ slug, _updatedAt }`
    );
    
    cocktailPages = cocktails.map((cocktail) => ({
      url: `${baseUrl}/cocktails/${cocktail.slug.current}`,
      lastModified: new Date(cocktail._updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Failed to fetch cocktails for sitemap:", error);
  }

  // Fetch article slugs from Sanity
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const articles = await sanityClient.fetch<Array<{ slug: { current: string }; _updatedAt: string }>>(
      `*[_type == "article" && defined(slug.current)]{ slug, _updatedAt }`
    );
    
    articlePages = articles.map((article) => ({
      url: `${baseUrl}/blog/${article.slug.current}`,
      lastModified: new Date(article._updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Failed to fetch articles for sitemap:", error);
  }

  return [...staticPages, ...cocktailPages, ...articlePages];
}




