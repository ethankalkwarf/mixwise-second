import Link from "next/link";
import { Suspense } from "react";
import { getCocktailsList } from "@/lib/cocktails.server";
import { MainContainer } from "@/components/layout/MainContainer";
import { CocktailsDirectory } from "@/components/cocktails/CocktailsDirectory";
import { generatePageMetadata } from "@/lib/seo";
import { isNativeAppRequest } from "@/lib/mobile/serverNative";
import type { SanityCocktail } from "@/lib/sanityTypes";
import type { CocktailListItem } from "@/lib/cocktailTypes";

export const revalidate = 300;

export const metadata = generatePageMetadata({
  title: "Cocktail Recipes",
  description: "Browse handcrafted cocktail recipes with ingredients, instructions, and photos.",
  path: "/cocktails",
});

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
  searchParams?: Promise<{ spirit?: string; filter?: string; q?: string; ingredient?: string; browse?: string }>;
}) {
  const params = (await searchParams) || {};
  const initialSpirit = params.spirit?.toLowerCase() || null;
  const initialFilter = params.filter?.toLowerCase() || null;
  const initialQuery = (params.ingredient || params.q || "").trim();
  const browse = params.browse?.toLowerCase();
  const initialBrowse =
    browse === "collections" || browse === "recipes" ? browse : null;

  const native = await isNativeAppRequest();

  const cocktails = await getCocktailsList({
    includeIngredients: !native,
  });
  const sanityCocktails: SanityCocktail[] = mapCocktailListToSanity(cocktails);

  return (
    <div
      className={`bg-cream min-h-screen ${native ? "pb-8" : "py-10"}`}
      data-native-recipes-page
    >
      <MainContainer>
        {/* Web-only marketing header — native Search tab uses NativePageHero instead. */}
        {!native ? (
          <div data-web-recipes-chrome className="mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-forest mb-4">
              Cocktail Recipes
            </h1>
            <p className="text-sage max-w-2xl">
              Browse our collection of {cocktails.length} handcrafted cocktail recipes. Each
              recipe includes detailed ingredients and instructions. Looking up a bottle? See
              the{" "}
              <Link href="/ingredients" className="text-terracotta hover:underline">
                ingredient guides
              </Link>
              .
            </p>
          </div>
        ) : null}

        {/* Empty State */}
        {cocktails.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-6">🍸</div>
            <h2 className="text-2xl font-display font-bold text-forest mb-3">
              No cocktails yet
            </h2>
            <p className="text-sage max-w-md">
              We&apos;re restocking the back bar. Check back soon, or try the{" "}
              <Link href="/mix" className="text-terracotta hover:underline">
                mix tool
              </Link>{" "}
              with what you have at home.
            </p>
          </div>
        )}

        {/* Cocktail Directory with Search, Filters, and Grid */}
        {cocktails.length > 0 && (
          <Suspense fallback={null}>
            <CocktailsDirectory
              cocktails={sanityCocktails}
              initialSpirit={initialSpirit}
              initialFilter={initialFilter}
              initialQuery={initialQuery || null}
              initialBrowse={initialBrowse}
            />
          </Suspense>
        )}
      </MainContainer>
    </div>
  );
}
