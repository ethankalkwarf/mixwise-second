import { Metadata } from "next";
import { ThirstyThursdayLanding } from "@/components/thirsty-thursday/ThirstyThursdayLanding";
import { WebPageSchema } from "@/components/seo/JsonLd";
import { SITE_CONFIG } from "@/lib/seo";
import { getCocktailsList } from "@/lib/cocktails.server";

export const metadata: Metadata = {
  title: "Thirsty Thursday - Weekly Cocktail Newsletter | MixWise",
  description: "Get a fresh cocktail recipe delivered to your inbox every Thursday. Join thousands of cocktail enthusiasts discovering new drinks weekly. Free forever, no spam.",
  openGraph: {
    title: "Thirsty Thursday - Weekly Cocktail Newsletter",
    description: "Get a fresh cocktail recipe delivered to your inbox every Thursday. Join thousands of cocktail enthusiasts discovering new drinks weekly.",
    type: "website",
    url: `${SITE_CONFIG.url}/thirsty-thursday`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Thirsty Thursday - Weekly Cocktail Newsletter",
    description: "Get a fresh cocktail recipe delivered to your inbox every Thursday.",
  },
};

export default async function ThirstyThursdayPage() {
  // Fetch cocktails with images for background rotation
  const allCocktails = await getCocktailsList({ limit: 100 });
  
  // Filter to cocktails with images and randomize
  const cocktailsWithImages = allCocktails
    .filter(c => c.image_url && c.image_url.trim().length > 0)
    .sort(() => Math.random() - 0.5)
    .slice(0, 5); // Use 5 cocktails for rotation

  // Log for debugging (remove in production)
  if (cocktailsWithImages.length === 0) {
    console.warn("[Thirsty Thursday] No cocktails with images found. Total cocktails:", allCocktails.length);
  } else {
    console.log("[Thirsty Thursday] Found", cocktailsWithImages.length, "cocktails with images");
  }

  return (
    <>
      <WebPageSchema
        title="Thirsty Thursday - Weekly Cocktail Newsletter"
        description="Get a fresh cocktail recipe delivered to your inbox every Thursday. Join thousands of cocktail enthusiasts discovering new drinks weekly."
        url={`${SITE_CONFIG.url}/thirsty-thursday`}
      />
      <ThirstyThursdayLanding backgroundCocktails={cocktailsWithImages} />
    </>
  );
}
