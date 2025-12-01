import { sanityClient } from "@/lib/sanityClient";
import { MainContainer } from "@/components/layout/MainContainer";
import { CocktailsDirectory } from "@/components/cocktails/CocktailsDirectory";
import Link from "next/link";
import type { SanityCocktail } from "@/lib/sanityTypes";

export const revalidate = 60; // Revalidate every 60 seconds

// GROQ query to fetch all cocktails with their ingredients
const COCKTAILS_QUERY = `*[_type == "cocktail"] | order(name asc) {
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

export default async function CocktailsPage() {
  const cocktails: SanityCocktail[] = await sanityClient.fetch(COCKTAILS_QUERY);

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
        {cocktails.length > 0 && <CocktailsDirectory cocktails={cocktails} />}
      </MainContainer>
    </div>
  );
}
