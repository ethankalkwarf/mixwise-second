import { MainContainer } from "@/components/layout/MainContainer";
import { WebPageSchema } from "@/components/seo/JsonLd";
import { SITE_CONFIG, generatePageMetadata } from "@/lib/seo";
import { IngredientsDirectory } from "@/components/ingredients/IngredientsDirectory";
import { getIngredientsDirectory } from "@/lib/ingredients.server";

export const revalidate = 60;

export const metadata = generatePageMetadata({
  title: "Cocktail Ingredients",
  description:
    "Browse the MixWise ingredient library. Spirits, mixers, liqueurs, and more to stock your home bar.",
  path: "/ingredients",
});

export default async function IngredientsPage() {
  const ingredients = await getIngredientsDirectory();

  return (
    <>
      <WebPageSchema
        title={`Cocktail Ingredients | ${SITE_CONFIG.name}`}
        description="Browse our complete ingredient library for cocktail making."
        url={`${SITE_CONFIG.url}/ingredients`}
      />

      <div className="py-10 bg-cream min-h-screen">
        <MainContainer>
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-display font-bold text-forest mb-4">
              Ingredient Library
            </h1>
            <p className="text-lg text-sage">
              Everything you need to know about cocktail ingredients. Find spirits, mixers, liqueurs, and more.
            </p>
          </div>

          {ingredients.length > 0 ? (
            <IngredientsDirectory ingredients={ingredients} />
          ) : (
            <div className="text-center py-16 bg-white border border-mist rounded-2xl">
              <h2 className="text-xl font-display font-bold text-forest mb-2">No ingredients yet</h2>
              <p className="text-sage">The library is being restocked. Try the mix tool in the meantime.</p>
            </div>
          )}
        </MainContainer>
      </div>
    </>
  );
}
