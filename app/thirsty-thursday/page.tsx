import { ThirstyThursdayLanding } from "@/components/thirsty-thursday/ThirstyThursdayLanding";
import { WebPageSchema } from "@/components/seo/JsonLd";
import { SITE_CONFIG, generatePageMetadata } from "@/lib/seo";
import { getCocktailsList } from "@/lib/cocktails.server";
import { debugLog } from "@/lib/debugLog";

export const metadata = generatePageMetadata({
  title: "Thirsty Thursday - Weekly Cocktail Newsletter",
  description:
    "Get a fresh cocktail recipe delivered to your inbox every Thursday. Join thousands of cocktail enthusiasts discovering new drinks weekly. Free forever, no spam.",
  path: "/thirsty-thursday",
  keywords: ["cocktail newsletter", "weekly cocktail", "Thirsty Thursday", "home bartending"],
});

export default async function ThirstyThursdayPage() {
  const allCocktails = await getCocktailsList({ limit: 100 });

  const cocktailsWithImages = allCocktails
    .filter((c) => c.image_url && c.image_url.trim().length > 0)
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  if (cocktailsWithImages.length === 0) {
    console.warn("[Thirsty Thursday] No cocktails with images found. Total cocktails:", allCocktails.length);
  } else {
    debugLog("[Thirsty Thursday] Found", cocktailsWithImages.length, "cocktails with images");
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
