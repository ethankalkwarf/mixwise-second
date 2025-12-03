import { MainContainer } from "@/components/layout/MainContainer";
import { CocktailsDirectory } from "@/components/cocktails/CocktailsDirectory";
import Link from "next/link";
import { getAllCocktails } from "@/lib/cocktails";

export const revalidate = 300; // Revalidate every 5 minutes for better performance

export default async function CocktailsPage() {
  const cocktails = await getAllCocktails();

  // Temporary random ordering until search/filters are implemented
  const shuffledCocktails = [...cocktails].sort(() => Math.random() - 0.5);

  return (
    <div className="py-10 bg-cream min-h-screen">
      <MainContainer>
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-forest mb-4">
            Cocktail Recipes
          </h1>
          <p className="text-sage max-w-2xl">
            Browse our collection of {shuffledCocktails.length} handcrafted cocktail recipes. Each recipe includes detailed ingredients and instructions.
          </p>
        </div>

        {/* Empty State */}
        {shuffledCocktails.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-6">🍸</div>
            <h2 className="text-2xl font-display font-bold text-forest mb-3">
              No cocktails yet
            </h2>
            <p className="text-sage max-w-md">
              We&rsquo;re still importing recipes. Check back soon or upload new cocktails through the Supabase seed workflow.
            </p>
          </div>
        )}

        {/* Cocktail Directory with Search, Filters, and Grid */}
        {shuffledCocktails.length > 0 && <CocktailsDirectory cocktails={shuffledCocktails} />}
      </MainContainer>
    </div>
  );
}
