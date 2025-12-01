import { sanityClient } from "@/lib/sanityClient";
import { getImageUrl } from "@/lib/sanityImage";
import { MainContainer } from "@/components/layout/MainContainer";
import { PortableText } from "@/components/PortableText";
import { RecipeSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import { CocktailActions } from "@/components/cocktails/CocktailActions";
import { BackToCocktails } from "@/components/cocktails/BackToCocktails";
import { CocktailPageClient } from "@/components/cocktails/CocktailPageClient";
import { generateCocktailMetadata, SITE_CONFIG } from "@/lib/seo";
import { notFound } from "next/navigation";
import type { SanityCocktail } from "@/lib/sanityTypes";
import type { Metadata } from "next";

export const revalidate = 60;
export const dynamic = 'force-dynamic';

// GROQ query to fetch a single cocktail by slug
const COCKTAIL_QUERY = `*[_type == "cocktail" && slug.current == $slug][0] {
  _id,
  name,
  slug,
  image,
  description,
  ingredients[],
  instructions[],
  glass,
  method,
  tags,
  hidden,
  funFact,
  funFactSources[]{label, url},
  flavorProfile,
  bestFor,
  seoTitle,
  metaDescription,
  imageAltOverride
}`;

// Category display configuration - Botanical theme
const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  tiki: { label: "Tiki", emoji: "🏝️", color: "bg-terracotta/20 text-terracotta border-terracotta/30" },
  classic: { label: "Classic", emoji: "🎩", color: "bg-forest/20 text-forest border-forest/30" },
  holiday: { label: "Holiday", emoji: "🎄", color: "bg-terracotta/20 text-terracotta border-terracotta/30" },
  modern: { label: "Modern", emoji: "✨", color: "bg-olive/20 text-olive border-olive/30" },
  dessert: { label: "Dessert", emoji: "🍰", color: "bg-terracotta/20 text-terracotta border-terracotta/30" },
  mocktail: { label: "Mocktail", emoji: "🍹", color: "bg-olive/20 text-olive border-olive/30" },
  party: { label: "Party", emoji: "🎉", color: "bg-terracotta/20 text-terracotta border-terracotta/30" },
  summer: { label: "Summer", emoji: "☀️", color: "bg-olive/20 text-olive border-olive/30" },
  winter: { label: "Winter", emoji: "❄️", color: "bg-forest/20 text-forest border-forest/30" },
  fall: { label: "Fall", emoji: "🍂", color: "bg-terracotta/20 text-terracotta border-terracotta/30" },
  spring: { label: "Spring", emoji: "🌸", color: "bg-olive/20 text-olive border-olive/30" },
  strong: { label: "Strong", emoji: "🔥", color: "bg-terracotta/20 text-terracotta border-terracotta/30" },
  refreshing: { label: "Refreshing", emoji: "🌿", color: "bg-olive/20 text-olive border-olive/30" },
  sour: { label: "Sour", emoji: "🍋", color: "bg-olive/20 text-olive border-olive/30" },
  sweet: { label: "Sweet", emoji: "🍯", color: "bg-terracotta/20 text-terracotta border-terracotta/30" },
  boozy: { label: "Boozy", emoji: "🥃", color: "bg-forest/20 text-forest border-forest/30" },
  "low-calorie": { label: "Low-Cal", emoji: "🥗", color: "bg-olive/20 text-olive border-olive/30" },
  quick: { label: "Quick", emoji: "⚡", color: "bg-terracotta/20 text-terracotta border-terracotta/30" },
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cocktail: SanityCocktail | null = await sanityClient.fetch(COCKTAIL_QUERY, { slug });
  
  if (!cocktail) {
    return { title: "Cocktail Not Found" };
  }
  
  return generateCocktailMetadata(cocktail);
}

export default async function CocktailDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const cocktail: SanityCocktail | null = await sanityClient.fetch(COCKTAIL_QUERY, { slug });

  if (!cocktail) {
    notFound();
  }

  // Use uploaded Sanity image, or fall back to external URL
  const imageUrl = getImageUrl(cocktail.image, { width: 800, height: 600 }) || cocktail.externalImageUrl;

  // Build ingredients list for schema
  const ingredientsList = cocktail.ingredients?.map((item) => 
    `${item.amount ? item.amount + " " : ""}${item.ingredient?.name || "Unknown"}`
  ) || [];

  return (
    <>
      {/* JSON-LD Structured Data */}
      <RecipeSchema
        name={cocktail.name}
        description={cocktail.description}
        image={imageUrl}
        ingredients={ingredientsList}
        category={cocktail.primarySpirit ? `${cocktail.primarySpirit} Cocktail` : "Cocktail"}
        url={`${SITE_CONFIG.url}/cocktails/${cocktail.slug.current}`}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Cocktails", url: `${SITE_CONFIG.url}/cocktails` },
          { name: cocktail.name, url: `${SITE_CONFIG.url}/cocktails/${cocktail.slug.current}` },
        ]}
      />

      <div className="py-10 bg-cream min-h-screen">
        <MainContainer>
          {/* Back Link */}
          <div className="mb-6">
            <BackToCocktails />
          </div>

          <article>
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              {/* Image */}
              <figure className="relative rounded-3xl overflow-hidden bg-mist aspect-[4/3] shadow-card">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={cocktail.imageAltOverride || cocktail.image?.alt || `${cocktail.name} cocktail`}
                    className="w-full h-full object-cover mix-blend-multiply"
                    loading="eager"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sage text-8xl" aria-hidden="true">
                    🍸
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[70%]">
                  {cocktail.isTrending && (
                    <span className="bg-terracotta text-cream text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      🔥 Trending
                    </span>
                  )}
                  {cocktail.isPopular && !cocktail.isTrending && (
                    <span className="bg-terracotta text-cream text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      ★ Featured
                    </span>
                  )}
                  {cocktail.isFavorite && (
                    <span className="bg-terracotta text-cream text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      ❤️ Favorite
                    </span>
                  )}
                </div>
              </figure>

              {/* Details */}
              <div className="space-y-6">
                {/* Title & Meta */}
                <header>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {cocktail.primarySpirit && (
                        <p className="font-mono text-sm text-terracotta font-bold tracking-widest uppercase mb-2">
                          {cocktail.primarySpirit}
                        </p>
                      )}
                      <h1 className="text-3xl sm:text-4xl font-display font-bold text-forest mb-3">
                        {cocktail.name}
                      </h1>
                    </div>
                    {/* Favorite Button */}
                    <CocktailActions
                      cocktail={{
                        id: cocktail._id,
                        name: cocktail.name,
                        slug: cocktail.slug.current,
                        imageUrl: imageUrl || undefined,
                      }}
                    />
                  </div>
                  {cocktail.description && (
                    <p className="text-lg text-sage leading-relaxed">
                      {cocktail.description}
                    </p>
                  )}
                </header>

                {/* Fun Fact Section */}
                {cocktail.funFact && (
                  <section className="bg-white border border-mist rounded-3xl p-6 shadow-card">
                    <h2 className="text-lg font-display font-bold text-forest mb-3 flex items-center gap-2">
                      <span aria-hidden="true">💡</span> Fun Fact
                    </h2>
                    <p className="text-base text-sage leading-relaxed mb-3">
                      {cocktail.funFact}
                    </p>
                    {cocktail.funFactSources && cocktail.funFactSources.length > 0 && (
                      <div className="text-sm text-sage">
                        <span className="font-medium">Sources: </span>
                        {cocktail.funFactSources.map((source, index) => (
                          <span key={index}>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-terracotta hover:text-terracotta/80 underline"
                            >
                              {source.label}
                            </a>
                            {index < cocktail.funFactSources!.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {/* Flavor Profile */}
                {cocktail.flavorProfile && (
                  <div className="flex flex-wrap gap-2" role="list" aria-label="Flavor profile">
                    {cocktail.flavorProfile.strength && (
                      <span className="bg-mist text-sage text-sm px-3 py-1.5 rounded-full">
                        Strength: {cocktail.flavorProfile.strength}
                      </span>
                    )}
                    {cocktail.flavorProfile.sweetness && (
                      <span className="bg-mist text-sage text-sm px-3 py-1.5 rounded-full">
                        Sweetness: {cocktail.flavorProfile.sweetness}
                      </span>
                    )}
                    {cocktail.flavorProfile.tartness && (
                      <span className="bg-mist text-sage text-sm px-3 py-1.5 rounded-full">
                        Tartness: {cocktail.flavorProfile.tartness}
                      </span>
                    )}
                    {cocktail.flavorProfile.bitterness && (
                      <span className="bg-mist text-sage text-sm px-3 py-1.5 rounded-full">
                        Bitterness: {cocktail.flavorProfile.bitterness}
                      </span>
                    )}
                    {cocktail.flavorProfile.aroma && (
                      <span className="bg-mist text-sage text-sm px-3 py-1.5 rounded-full">
                        Aroma: {cocktail.flavorProfile.aroma}
                      </span>
                    )}
                    {cocktail.flavorProfile.texture && (
                      <span className="bg-mist text-sage text-sm px-3 py-1.5 rounded-full">
                        Texture: {cocktail.flavorProfile.texture}
                      </span>
                    )}
                  </div>
                )}

                {/* Best For Tags */}
                {cocktail.bestFor && cocktail.bestFor.length > 0 && (
                  <div className="flex flex-wrap gap-2" role="list" aria-label="Best for occasions">
                    {cocktail.bestFor.map((occasion, index) => (
                      <span
                        key={index}
                        className="bg-mist text-sage text-sm px-3 py-1.5 rounded-full"
                        role="listitem"
                      >
                        {occasion}
                      </span>
                    ))}
                  </div>
                )}

                {/* Category Tags */}
                {cocktail.drinkCategories && cocktail.drinkCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2" role="list" aria-label="Cocktail categories">
                    {cocktail.drinkCategories.map((cat) => {
                      const config = CATEGORY_CONFIG[cat];
                      if (!config) return null;
                      return (
                        <span
                          key={cat}
                          className={`text-sm font-medium px-3 py-1.5 rounded-full border ${config.color}`}
                          role="listitem"
                        >
                          <span aria-hidden="true">{config.emoji}</span> {config.label}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Quick Info */}
                <div className="flex flex-wrap gap-3">
                  {cocktail.glass && (
                    <span className="bg-white border border-mist text-forest text-sm px-4 py-2 rounded-xl capitalize shadow-soft">
                      🥃 {cocktail.glass.replace(/-/g, " ")}
                    </span>
                  )}
                  {cocktail.method && (
                    <span className="bg-white border border-mist text-forest text-sm px-4 py-2 rounded-xl capitalize shadow-soft">
                      {cocktail.method}
                    </span>
                  )}
                  {cocktail.garnish && (
                    <span className="bg-white border border-mist text-forest text-sm px-4 py-2 rounded-xl shadow-soft">
                      🍒 {cocktail.garnish}
                    </span>
                  )}
                </div>

                {/* Ingredients - Paper-like recipe card */}
                {cocktail.ingredients && cocktail.ingredients.length > 0 && (
                  <section className="bg-white border border-mist rounded-3xl p-6 shadow-card">
                    <h2 className="text-lg font-display font-bold text-forest mb-4 flex items-center gap-2">
                      <span aria-hidden="true">📝</span> Ingredients
                    </h2>
                    <ul className="space-y-3">
                      {cocktail.ingredients.map((item) => (
                        <li key={item._key} className="flex items-start gap-3">
                          <span 
                            className="flex-shrink-0 w-5 h-5 rounded-full bg-olive/20 text-olive flex items-center justify-center text-xs mt-0.5"
                            aria-hidden="true"
                          >
                            ✓
                          </span>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="font-medium text-forest text-base">
                                {item.ingredient?.name || "Unknown ingredient"}
                              </span>
                              {item.amount && (
                                <span className="text-sm text-sage">
                                  {item.amount}
                                </span>
                              )}
                              {item.isOptional && (
                                <span className="text-xs text-sage italic">
                                  (optional)
                                </span>
                              )}
                            </div>
                            {item.notes && (
                              <p className="text-sm text-sage mt-1">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Tags */}
                {cocktail.tags && cocktail.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2" role="list" aria-label="Tags">
                    {cocktail.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-mist text-sage text-sm px-3 py-1.5 rounded-full"
                        role="listitem"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Client-side interactive components */}
                <CocktailPageClient
                  cocktailId={cocktail._id}
                  cocktailName={cocktail.name}
                  cocktailSlug={cocktail.slug.current}
                  cocktailDescription={cocktail.description}
                  ingredients={cocktail.ingredients || []}
                />
              </div>
            </div>

            {/* Instructions */}
            {cocktail.instructions && cocktail.instructions.length > 0 && (
              <section className="mt-12 max-w-3xl">
                <h2 className="text-2xl font-display font-bold text-forest mb-6">
                  Instructions
                </h2>
                <div className="prose prose-lg prose-botanical max-w-none text-charcoal">
                  <PortableText value={cocktail.instructions} />
                </div>
              </section>
            )}

            {/* History */}
            {cocktail.history && cocktail.history.length > 0 && (
              <section className="mt-12 max-w-3xl">
                <h2 className="text-2xl font-display font-bold text-forest mb-6">
                  History
                </h2>
                <div className="prose prose-lg prose-botanical max-w-none text-charcoal">
                  <PortableText value={cocktail.history} />
                </div>
              </section>
            )}

            {/* Pro Tips */}
            {cocktail.tips && cocktail.tips.length > 0 && (
              <section className="mt-12 max-w-3xl">
                <h2 className="text-2xl font-display font-bold text-forest mb-6">
                  Pro Tips
                </h2>
                <div className="bg-olive/10 border border-olive/20 rounded-3xl p-6">
                  <div className="prose prose-lg prose-botanical max-w-none text-charcoal">
                    <PortableText value={cocktail.tips} />
                  </div>
                </div>
              </section>
            )}
          </article>
        </MainContainer>
      </div>
    </>
  );
}

// Generate static paths for known cocktails
export async function generateStaticParams() {
  const cocktails = await sanityClient.fetch<Array<{ slug: { current: string } }>>(
    `*[_type == "cocktail" && defined(slug.current)]{slug}`
  );

  return cocktails.map((cocktail) => ({
    slug: cocktail.slug.current,
  }));
}
