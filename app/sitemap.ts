import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo";
import { sanityClient } from "@/lib/sanityClient";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

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

  // Fetch cocktail slugs from Supabase
  let cocktailPages: MetadataRoute.Sitemap = [];
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase
        .from("cocktails")
        .select("slug, updated_at, is_hidden")
        .eq("is_hidden", false);

      if (error) {
        throw error;
      }

      cocktailPages = (data || []).map((row) => ({
        url: `${baseUrl}/cocktails/${row.slug}`,
        lastModified: new Date(row.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
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





