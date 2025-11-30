import { sanityClient } from "@/lib/sanityClient";
import { getImageUrl } from "@/lib/sanityImage";
import { MainContainer } from "@/components/layout/MainContainer";
import { PortableText } from "@/components/PortableText";
import { RecipeSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import { generateCocktailMetadata, SITE_CONFIG } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { SanityCocktail } from "@/lib/sanityTypes";
import type { Metadata } from "next";

export const revalidate = 60;

// GROQ query to fetch a single cocktail by slug
const COCKTAIL_QUERY = `*[_type == "cocktail" && slug.current == $slug][0] {
  _id,
  name,
  slug,
  description,
  image,
  externalImageUrl,
  glass,
  method,
  primarySpirit,
  isPopular,
  isFavorite,
  isTrending,
  drinkCategories,
  garnish,
  tags,
  instructions,
  history,
  tips,
  "ingredients": ingredients[] {
    _key,
    amount,
    isOptional,
    notes,
    "ingredient": ingredient-> {
      _id,
      name,
      type,
      description
    }
  }
}`;

// Category display configuration
const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  tiki: { label: "Tiki", emoji: "🏝️", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  classic: { label: "Classic", emoji: "🎩", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  holiday: { label: "Holiday", emoji: "🎄", color: "bg-red-500/20 text-red-300 border-red-500/30" },
  modern: { label: "Modern", emoji: "✨", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  dessert: { label: "Dessert", emoji: "🍰", color: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
  mocktail: { label: "Mocktail", emoji: "🍹", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  party: { label: "Party", emoji: "🎉", color: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30" },
  summer: { label: "Summer", emoji: "☀️", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  winter: { label: "Winter", emoji: "❄️", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  fall: { label: "Fall", emoji: "🍂", color: "bg-orange-600/20 text-orange-300 border-orange-600/30" },
  spring: { label: "Spring", emoji: "🌸", color: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
  strong: { label: "Strong", emoji: "🔥", color: "bg-red-600/20 text-red-300 border-red-600/30" },
  refreshing: { label: "Refreshing", emoji: "🌿", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  sour: { label: "Sour", emoji: "🍋", color: "bg-lime-500/20 text-lime-300 border-lime-500/30" },
  sweet: { label: "Sweet", emoji: "🍯", color: "bg-amber-400/20 text-amber-200 border-amber-400/30" },
  boozy: { label: "Boozy", emoji: "🥃", color: "bg-stone-500/20 text-stone-300 border-stone-500/30" },
  "low-calorie": { label: "Low-Cal", emoji: "🥗", color: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
  quick: { label: "Quick", emoji: "⚡", color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
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

      <div className="py-10">
        <MainContainer>
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-lime-400 transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">→</li>
              <li>
                <Link href="/cocktails" className="hover:text-lime-400 transition-colors">
                  Cocktails
                </Link>
              </li>
              <li aria-hidden="true">→</li>
              <li className="text-slate-200 font-medium" aria-current="page">
                {cocktail.name}
              </li>
            </ol>
          </nav>

          <article>
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              {/* Image */}
              <figure className="relative rounded-2xl overflow-hidden bg-slate-800 aspect-[4/3]">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={`${cocktail.name} cocktail`}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700 text-8xl" aria-hidden="true">
                    🍸
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[70%]">
                  {cocktail.isTrending && (
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      🔥 Trending
                    </span>
                  )}
                  {cocktail.isPopular && !cocktail.isTrending && (
                    <span className="bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      ★ Featured
                    </span>
                  )}
                  {cocktail.isFavorite && (
                    <span className="bg-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      ❤️ Favorite
                    </span>
                  )}
                </div>
              </figure>

              {/* Details */}
              <div className="space-y-6">
                {/* Title & Meta */}
                <header>
                  {cocktail.primarySpirit && (
                    <p className="text-sm text-lime-400 font-bold tracking-widest uppercase mb-2">
                      {cocktail.primarySpirit}
                    </p>
                  )}
                  <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-50 mb-3">
                    {cocktail.name}
                  </h1>
                  {cocktail.description && (
                    <p className="text-lg text-slate-300 leading-relaxed">
                      {cocktail.description}
                    </p>
                  )}
                </header>

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
                    <span className="bg-slate-800 text-slate-300 text-sm px-4 py-2 rounded-lg capitalize">
                      🥃 {cocktail.glass.replace(/-/g, " ")}
                    </span>
                  )}
                  {cocktail.method && (
                    <span className="bg-slate-800 text-slate-300 text-sm px-4 py-2 rounded-lg capitalize">
                      {cocktail.method}
                    </span>
                  )}
                  {cocktail.garnish && (
                    <span className="bg-slate-800 text-slate-300 text-sm px-4 py-2 rounded-lg">
                      🍒 {cocktail.garnish}
                    </span>
                  )}
                </div>

                {/* Ingredients */}
                {cocktail.ingredients && cocktail.ingredients.length > 0 && (
                  <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                      <span aria-hidden="true">📝</span> Ingredients
                    </h2>
                    <ul className="space-y-3">
                      {cocktail.ingredients.map((item) => (
                        <li key={item._key} className="flex items-start gap-3">
                          <span 
                            className="flex-shrink-0 w-5 h-5 rounded-full bg-lime-500/20 text-lime-400 flex items-center justify-center text-xs mt-0.5"
                            aria-hidden="true"
                          >
                            ✓
                          </span>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="font-medium text-slate-200 text-base">
                                {item.ingredient?.name || "Unknown ingredient"}
                              </span>
                              {item.amount && (
                                <span className="text-sm text-slate-400">
                                  {item.amount}
                                </span>
                              )}
                              {item.isOptional && (
                                <span className="text-xs text-slate-500 italic">
                                  (optional)
                                </span>
                              )}
                            </div>
                            {item.notes && (
                              <p className="text-sm text-slate-500 mt-1">
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
                        className="bg-slate-800 text-slate-400 text-sm px-3 py-1.5 rounded-full"
                        role="listitem"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            {cocktail.instructions && cocktail.instructions.length > 0 && (
              <section className="mt-12 max-w-3xl">
                <h2 className="text-2xl font-serif font-bold text-slate-100 mb-6">
                  Instructions
                </h2>
                <div className="prose prose-lg prose-invert prose-slate max-w-none">
                  <PortableText value={cocktail.instructions} />
                </div>
              </section>
            )}

            {/* History */}
            {cocktail.history && cocktail.history.length > 0 && (
              <section className="mt-12 max-w-3xl">
                <h2 className="text-2xl font-serif font-bold text-slate-100 mb-6">
                  History
                </h2>
                <div className="prose prose-lg prose-invert prose-slate max-w-none">
                  <PortableText value={cocktail.history} />
                </div>
              </section>
            )}

            {/* Pro Tips */}
            {cocktail.tips && cocktail.tips.length > 0 && (
              <section className="mt-12 max-w-3xl">
                <h2 className="text-2xl font-serif font-bold text-slate-100 mb-6">
                  Pro Tips
                </h2>
                <div className="bg-lime-500/5 border border-lime-500/20 rounded-xl p-6">
                  <div className="prose prose-lg prose-invert prose-slate max-w-none">
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
