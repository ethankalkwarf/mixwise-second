import { MainContainer } from "@/components/layout/MainContainer";
import { WebPageSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import { SITE_CONFIG, generatePageMetadata } from "@/lib/seo";
import { IngredientActions } from "@/components/ingredients/IngredientActions";
import { getIngredientBySlug, getIngredientsDirectory } from "@/lib/ingredients.server";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const ingredients = await getIngredientsDirectory();
    return ingredients.map((ingredient) => ({ slug: ingredient.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const ingredient = await getIngredientBySlug(slug);

  if (!ingredient) {
    return { title: "Ingredient Not Found" };
  }

  return generatePageMetadata({
    title: `${ingredient.name} | Ingredients`,
    description: `Learn about ${ingredient.name} and discover cocktails you can make with it.`,
    path: `/ingredients/${ingredient.slug}`,
    ogImage: ingredient.imageUrl || undefined,
  });
}

export default async function IngredientDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const ingredient = await getIngredientBySlug(slug);

  if (!ingredient) {
    notFound();
  }

  return (
    <>
      <WebPageSchema
        title={`${ingredient.name} | ${SITE_CONFIG.name}`}
        description={`Learn about ${ingredient.name}.`}
        url={`${SITE_CONFIG.url}/ingredients/${ingredient.slug}`}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Ingredients", url: `${SITE_CONFIG.url}/ingredients` },
          { name: ingredient.name, url: `${SITE_CONFIG.url}/ingredients/${ingredient.slug}` },
        ]}
      />

      <div className="py-10 bg-cream min-h-screen">
        <MainContainer>
          <Link
            href="/ingredients"
            className="inline-flex items-center gap-2 text-sm text-sage hover:text-forest transition-colors mb-6"
          >
            ← All ingredients
          </Link>

          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="relative rounded-2xl overflow-hidden bg-mist aspect-square">
                  {ingredient.imageUrl ? (
                    <Image
                      src={ingredient.imageUrl}
                      alt={ingredient.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                      quality={85}
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sage text-xl font-display">
                      {ingredient.name}
                    </div>
                  )}
                  {ingredient.isStaple && (
                    <span className="absolute top-3 left-3 bg-forest text-cream text-xs font-medium px-2 py-1 rounded">
                      Staple
                    </span>
                  )}
                </div>

                <IngredientActions
                  ingredient={{
                    id: ingredient.id,
                    name: ingredient.name,
                    type: ingredient.type,
                  }}
                />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div>
                {ingredient.type && (
                  <p className="text-sm uppercase tracking-widest text-sage mb-2">{ingredient.type}</p>
                )}
                <h1 className="text-4xl font-display font-bold text-forest mb-4">{ingredient.name}</h1>
                <p className="text-sage">
                  Used in {ingredient.cocktailCount} cocktail{ingredient.cocktailCount !== 1 ? "s" : ""} in the MixWise library.
                </p>
              </div>

              {ingredient.cocktails.length > 0 && (
                <section>
                  <h2 className="text-xl font-display font-bold text-forest mb-4">Cocktails with {ingredient.name}</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {ingredient.cocktails.map((cocktail) => (
                      <Link
                        key={cocktail.id}
                        href={`/cocktails/${cocktail.slug}`}
                        className="flex items-center gap-4 p-3 bg-white border border-mist rounded-xl hover:border-stone transition-colors"
                      >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-mist shrink-0">
                          {cocktail.imageUrl ? (
                            <Image
                              src={cocktail.imageUrl}
                              alt=""
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-medium text-forest">{cocktail.name}</p>
                          {cocktail.primarySpirit && (
                            <p className="text-sm text-sage">{cocktail.primarySpirit}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </MainContainer>
      </div>
    </>
  );
}
