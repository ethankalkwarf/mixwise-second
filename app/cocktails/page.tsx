import { getCocktailsList } from "@/lib/cocktails.server";
import { MainContainer } from "@/components/layout/MainContainer";
import { CocktailsDirectory } from "@/components/cocktails/CocktailsDirectory";
import Link from "next/link";
import type { CocktailListItem } from "@/lib/cocktailTypes";
import type { SanityCocktail } from "@/lib/sanityTypes";

export const revalidate = 300; // Revalidate every 5 minutes for better performance

// GROQ query to fetch all cocktails with their ingredients
// Default ordering: cocktails with images first, then alphabetically
const COCKTAILS_QUERY = `*[_type == "cocktail"] {
  _id,
  name,
  slug,
  description,
  image,
  externalImageUrl,
  glass,
  method,
  primarySpirit,
  difficulty,
  isPopular,
  isFavorite,
  isTrending,
  drinkCategories,
  garnish,
  tags,
  "ingredients": ingredients[] {
    _key,
    amount,
    isOptional,
    notes,
    "ingredient": ingredient-> {
      _id,
      name,
      type
    }
  }
}`;

// Temporary mapping function to convert Supabase types to Sanity types for component compatibility
function mapCocktailListToSanity(cocktails: CocktailListItem[]): SanityCocktail[] {
  return cocktails.map(cocktail => ({
    _id: cocktail.id,
    _type: "cocktail" as const,
    name: cocktail.name,
    slug: { _type: "slug" as const, current: cocktail.slug },
    description: cocktail.short_description || undefined,
    externalImageUrl: cocktail.image_url || undefined,
    glass: cocktail.glassware || undefined,
    method: cocktail.technique || undefined,
    primarySpirit: cocktail.base_spirit || undefined,
    difficulty: cocktail.difficulty || undefined,
    drinkCategories: cocktail.categories_all || [],
    tags: cocktail.tags || [],
    // Add other required fields with defaults
    isPopular: false,
    isFavorite: false,
    isTrending: false,
    ingredients: [], // Will be populated when needed
  }));
}

export default async function CocktailsPage() {
  const cocktails: CocktailListItem[] = await getCocktailsList();
  const sanityCocktails: SanityCocktail[] = mapCocktailListToSanity(cocktails);

  // Sort cocktails: images first, then alphabetically by name (cocktails without images at the end)
  const sortedCocktails = [...sanityCocktails].sort((a, b) => {
    // Prioritize cocktails with valid images (non-empty string)
    const aHasImage = a.externalImageUrl && typeof a.externalImageUrl === 'string' && a.externalImageUrl.trim().length > 0;
    const bHasImage = b.externalImageUrl && typeof b.externalImageUrl === 'string' && b.externalImageUrl.trim().length > 0;

    if (aHasImage && !bHasImage) return -1;
    if (!aHasImage && bHasImage) return 1;

    // If both have or don't have images, sort alphabetically by name
    return a.name.localeCompare(b.name);
  });

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    const withImages = sortedCocktails.filter(c => c.externalImageUrl && typeof c.externalImageUrl === 'string' && c.externalImageUrl.trim().length > 0);
    const withoutImages = sortedCocktails.filter(c => !c.externalImageUrl || typeof c.externalImageUrl !== 'string' || c.externalImageUrl.trim().length === 0);

    console.log(`[COCKTAILS SORT] Total: ${sortedCocktails.length}, With images: ${withImages.length}, Without images: ${withoutImages.length}`);
    console.log(`[COCKTAILS SORT] First 5: ${sortedCocktails.slice(0, 5).map(c => `${c.name} (${c.externalImageUrl ? 'has image' : 'no image'})`).join(', ')}`);
    console.log(`[COCKTAILS SORT] Last 5: ${sortedCocktails.slice(-5).map(c => `${c.name} (${c.externalImageUrl ? 'has image' : 'no image'})`).join(', ')}`);
  }

  return (
    <div className="py-10 bg-cream min-h-screen">
      <MainContainer>
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-forest mb-4">
            Cocktail Recipes
          </h1>
          <p className="text-sage max-w-2xl">
            Browse our collection of {cocktails.length} handcrafted cocktail recipes. Each recipe includes detailed ingredients and instructions.
          </p>
        </div>

        {/* Empty State */}
        {cocktails.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-6">🍸</div>
            <h2 className="text-2xl font-display font-bold text-forest mb-3">
              No cocktails yet
            </h2>
            <p className="text-sage max-w-md">
              Head over to Sanity Studio at{" "}
              <Link href="/studio" className="text-terracotta hover:underline">
                /studio
              </Link>{" "}
              to create your first cocktail recipe.
            </p>
          </div>
        )}

        {/* Cocktail Directory with Search, Filters, and Grid */}
        {cocktails.length > 0 && <CocktailsDirectory cocktails={sortedCocktails} />}
      </MainContainer>
    </div>
  );
}
