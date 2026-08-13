import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo";
import { getCocktailsList } from "@/lib/cocktails.server";
import { getIngredientsDirectory } from "@/lib/ingredients.server";
import { OCCASIONS } from "@/lib/occasions";
import { getAllTechniqueLearnEntries } from "@/lib/cocktailTechniqueGlossary";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/cocktail-of-the-day`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/cocktails`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/occasions`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/learn`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/mix`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/ingredients`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/wedding-menu`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/thirsty-thursday`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    ...OCCASIONS.map((occasion) => ({
      url: `${baseUrl}/occasions/${occasion.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...getAllTechniqueLearnEntries().map((term) => ({
      url: `${baseUrl}/learn/techniques/${term.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.55,
    })),
  ];

  let cocktailPages: MetadataRoute.Sitemap = [];
  try {
    const cocktails = await getCocktailsList();
    cocktailPages = cocktails
      .filter((c) => c.slug)
      .map((cocktail) => ({
        url: `${baseUrl}/cocktails/${cocktail.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
  } catch (error) {
    console.error("Failed to fetch cocktails for sitemap:", error);
  }

  let ingredientPages: MetadataRoute.Sitemap = [];
  try {
    const ingredients = await getIngredientsDirectory();
    ingredientPages = ingredients.map((ingredient) => ({
      url: `${baseUrl}/ingredients/${ingredient.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
  } catch (error) {
    console.error("Failed to fetch ingredients for sitemap:", error);
  }

  return [...staticPages, ...cocktailPages, ...ingredientPages];
}
