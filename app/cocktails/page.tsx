import Link from "next/link";
import { getCocktailsList } from "@/lib/cocktails.server";
import { getCocktailsRandomizationSeed, seededRandom } from "@/lib/randomization";
import { MainContainer } from "@/components/layout/MainContainer";
import { CocktailsDirectory } from "@/components/cocktails/CocktailsDirectory";
import { generatePageMetadata } from "@/lib/seo";
import type { SanityCocktail } from "@/lib/sanityTypes";
import type { CocktailListItem } from "@/lib/cocktailTypes";

export const revalidate = 300;

export const metadata = generatePageMetadata({
  title: "Cocktail Recipes",
  description: "Browse handcrafted cocktail recipes with ingredients, instructions, and photos.",
  path: "/cocktails",
});

// Deterministic shuffle using Fisher-Yates algorithm with seeded randomness
function deterministicShuffle<T>(array: T[], seed: string): T[] {
  try {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
      // Generate a seeded random index between 0 and i
      const randomValue = seededRandom(seed + i.toString(), 'shuffle');
      const j = Math.floor(randomValue * (i + 1));

      // Swap elements
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  } catch (error) {
    console.warn('Error in deterministicShuffle, returning original array:', error);
    // Return original array if shuffle fails
    return [...array];
  }
}

function mapCocktailListToSanity(cocktails: CocktailListItem[]): SanityCocktail[] {
  return cocktails.map((cocktail) => ({
    _id: cocktail.id,
    _type: "cocktail" as const,
    name: cocktail.name,
    slug: { _type: "slug" as const, current: cocktail.slug },
    description: cocktail.short_description || undefined,
    externalImageUrl: cocktail.image_url || undefined,
    glass: cocktail.glassware || undefined,
    primarySpirit: cocktail.base_spirit || undefined,
    difficulty: cocktail.difficulty as SanityCocktail["difficulty"] | undefined,
    drinkCategories: cocktail.categories_all || [],
    tags: cocktail.tags || [],
    isPopular: false,
    isFavorite: false,
    isTrending: false,
    createdAt: cocktail.created_at || undefined,
    ingredientNames: cocktail.ingredientNames || [],
  }));
}

export default async function CocktailsPage({
  searchParams,
}: {
  searchParams?: Promise<{ spirit?: string; filter?: string; q?: string; ingredient?: string }>;
}) {
  const params = (await searchParams) || {};
  const initialSpirit = params.spirit?.toLowerCase() || null;
  const initialFilter = params.filter?.toLowerCase() || null;
  const initialQuery = (params.ingredient || params.q || "").trim();

  // UTC-day seed keeps shuffle stable without cookies() (so ISR can work)
  const randomizationSeed = getCocktailsRandomizationSeed();

  const cocktails = await getCocktailsList({ includeIngredients: true });
  const sanityCocktails: SanityCocktail[] = mapCocktailListToSanity(cocktails);

  // Apply deterministic randomization when no filters are applied
  const randomizedCocktails = deterministicShuffle(sanityCocktails, randomizationSeed);

  return (
    <div className="py-10 bg-cream min-h-screen">
      <MainContainer>
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-forest mb-4">
            Cocktail Recipes
          </h1>
          <p className="text-sage max-w-2xl">
            Browse our collection of {cocktails.length} handcrafted cocktail recipes. Each recipe includes detailed ingredients and instructions.             Looking up a bottle? See the{" "}
            <Link href="/ingredients" className="text-terracotta hover:underline">
              ingredient guides
            </Link>
            .
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
              We&apos;re restocking the back bar. Check back soon, or try the{" "}
              <a href="/mix" className="text-terracotta hover:underline">
                mix tool
              </a>{" "}
              with what you have at home.
            </p>
          </div>
        )}

        {/* Cocktail Directory with Search, Filters, and Grid */}
        {cocktails.length > 0 && (
          <CocktailsDirectory
            cocktails={randomizedCocktails}
            initialSpirit={initialSpirit}
            initialFilter={initialFilter}
            initialQuery={initialQuery || null}
          />
        )}
      </MainContainer>
    </div>
  );
}
