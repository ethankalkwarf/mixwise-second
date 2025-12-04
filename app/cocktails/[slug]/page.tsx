import { getCocktailBySlug, getCocktailsList } from "@/lib/cocktails.server";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";
import { SITE_CONFIG } from "@/lib/seo";
import { notFound } from "next/navigation";
import type { SanityCocktail } from "@/lib/sanityTypes";
import type { Metadata } from "next";
import Image from "next/image";
import { FlavorProfileCard } from "@/components/cocktails/FlavorProfileCard";

// --- helpers for data normalization ---

type IngredientLike =
  | null
  | undefined
  | string
  | { text?: string }
  | Array<string | { text?: string }>;

function normalizeIngredients(raw: IngredientLike): { text: string }[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((item) =>
        typeof item === "string"
          ? { text: item }
          : { text: String(item.text ?? "").trim() }
      )
      .filter((i) => i.text.length > 0);
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return normalizeIngredients(parsed);
    } catch {
      const parts = raw
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
      return parts.map((text) => ({ text }));
    }
  }

  const text = String(raw.text ?? "").trim();
  return text ? [{ text }] : [];
}

function normalizeInstructions(
  raw: string | string[] | null | undefined
): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((s) => s.trim().length > 0);

  const value = raw.trim();

  const numbered = value
    .split(/\s*\d+\)\s*/g)
    .map((s) => s.trim())
    .filter(Boolean);

  if (numbered.length > 1) return numbered;

  return value
    .split(/\.\s+/g)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter(Boolean);
}

function normalizeTags(
  raw: string | string[] | null | undefined
): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((t) => t.trim().length > 0);

  return raw
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

function titleCase(s: string): string {
  return s
    .split(/[\s-]+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function buildTagLine(tags: string[]): string {
  if (!tags.length) return "";
  return tags.map(titleCase).join(" · ");
}

export const revalidate = 300; // Revalidate every 5 minutes for better performance
export const dynamic = 'force-dynamic';

// Helper function to map Supabase cocktail to expected shape for the component
function mapSupabaseToSanityCocktail(cocktail: any) {
  return {
    _id: cocktail.id,
    _type: "cocktail" as const,
    name: cocktail.name,
    slug: { _type: "slug" as const, current: cocktail.slug },
    description: cocktail.short_description || cocktail.long_description,
    externalImageUrl: cocktail.image_url,
    glass: cocktail.glassware,
    method: cocktail.technique,
    tags: cocktail.tags || [],
    funFact: cocktail.fun_fact,
    funFactSources: cocktail.fun_fact_source ? [{ label: cocktail.fun_fact_source, url: "#" }] : [],
    flavorProfile: cocktail.flavor_strength || cocktail.flavor_sweetness || cocktail.flavor_tartness || cocktail.flavor_bitterness ? {
      strength: cocktail.flavor_strength,
      sweetness: cocktail.flavor_sweetness,
      tartness: cocktail.flavor_tartness,
      bitterness: cocktail.flavor_bitterness,
      aroma: cocktail.flavor_aroma,
      texture: cocktail.flavor_texture,
    } : undefined,
    bestFor: cocktail.metadata_json?.bestFor || [],
    seoTitle: cocktail.metadata_json?.seoTitle || cocktail.seo_description,
    metaDescription: cocktail.seo_description,
    imageAltOverride: cocktail.image_alt,
    // Map ingredients from Supabase format
    ingredients: (cocktail.ingredients || []).map((ing: any, index: number) => ({
      _key: `ing${index}`,
      ingredient: ing.ingredient ? {
        _id: ing.ingredient.id,
        name: ing.ingredient.name,
        type: ing.ingredient.type || 'other'
      } : null,
      amount: ing.amount,
      isOptional: ing.isOptional,
      notes: ing.notes,
    })),
    // Map instructions - convert from text to block format
    instructions: cocktail.instructions ? [{
      _key: "inst1",
      _type: "block",
      children: [{
        _key: "s1",
        _type: "span",
        marks: [],
        text: cocktail.instructions
      }],
      markDefs: [],
      style: "normal"
    }] : [],
  };
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cocktail = await getCocktailBySlug(slug);
  const sanityCocktail = cocktail ? mapSupabaseToSanityCocktail(cocktail) : null;

  if (!sanityCocktail) {
    return { title: "Cocktail Not Found" };
  }

  const title = sanityCocktail.seoTitle || sanityCocktail.name;
  const description = sanityCocktail.metaDescription || sanityCocktail.description || `${sanityCocktail.name} cocktail recipe with ingredients and instructions.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: sanityCocktail.externalImageUrl ? [{ url: sanityCocktail.externalImageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: sanityCocktail.externalImageUrl ? [{ url: sanityCocktail.externalImageUrl }] : [],
    },
  };
}

// Generate JSON-LD Recipe Schema
function generateRecipeSchema(cocktail: SanityCocktail, imageUrl: string | null) {
  const ingredients = cocktail.ingredients?.map((item) =>
    `${item.amount ? item.amount + " " : ""}${item.ingredient?.name || "Ingredient"}`
  ) || [];

  const instructions = cocktail.instructions?.map((instruction, index) => ({
    "@type": "HowToStep",
    "text": instruction.children?.map(child => child.text).join("") || "",
    "position": index + 1
  })) || [];

  const keywords = [
    ...(cocktail.tags || []),
    ...(cocktail.bestFor || [])
  ].join(", ");

  return {
    "@context": "https://schema.org/",
    "@type": "Recipe",
    "name": cocktail.name,
    "description": cocktail.description,
    "image": imageUrl,
    "recipeIngredient": ingredients,
    "recipeInstructions": instructions,
    "keywords": keywords,
    "recipeCategory": "Cocktail",
    "recipeCuisine": "Cocktail",
    "author": {
      "@type": "Organization",
      "name": "MixWise"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MixWise"
    }
  };
}

export default async function CocktailDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const cocktail = await getCocktailBySlug(slug);

  if (!cocktail) {
    notFound();
  }

  const sanityCocktail = mapSupabaseToSanityCocktail(cocktail);

  // Normalize data from Supabase
  const ingredients = normalizeIngredients(cocktail.ingredients as any);
  const instructionSteps = normalizeInstructions(cocktail.instructions as any);
  const tags = normalizeTags(cocktail.tags as any);
  const tagLine = buildTagLine(tags);

  // Use external image URL from Supabase
  const imageUrl = sanityCocktail.externalImageUrl || null;

  const recipeSchema = generateRecipeSchema(sanityCocktail, imageUrl);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(recipeSchema),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Cocktails", url: `${SITE_CONFIG.url}/cocktails` },
          { name: sanityCocktail.name, url: `${SITE_CONFIG.url}/cocktails/${sanityCocktail.slug.current}` },
        ]}
      />

      {/* MAIN PAGE WRAPPER */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Back Link */}
        <div className="mb-8">
          <a
            href="/cocktails"
            className="inline-flex items-center gap-2 text-sage hover:text-forest transition-colors"
          >
            ← Back to Cocktails
          </a>
        </div>

        {/* HERO SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16 items-start">
          {/* Image Side */}
          <div className="relative group">
            <div className="aspect-[4/5] md:aspect-square w-full overflow-hidden rounded-2xl shadow-soft bg-gray-200 relative">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={cocktail.imageAltOverride || cocktail.image?.alt || `${cocktail.name} cocktail`}
                  fill
                  priority
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sage text-6xl">
                  🍸
                </div>
              )}
            </div>
          </div>

          {/* Content Side */}
          <div className="flex flex-col justify-center h-full space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-forest leading-tight mb-4">
                {sanityCocktail.name}
              </h1>

              {/* Tag Line */}
              {tagLine && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {tagLine}
                </p>
              )}

              {/* Description */}
              {sanityCocktail.description && (
                <p className="text-lg text-sage leading-relaxed mb-6">
                  {sanityCocktail.description}
                </p>
              )}
            </div>

            {/* Meta Row */}
            <div className="grid grid-cols-2 gap-4 py-6 border-t border-b border-gray-100">
              {/* Method */}
              {sanityCocktail.method && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-blue-600"></div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Method</p>
                    <p className="font-medium text-gray-900 capitalize">{sanityCocktail.method}</p>
                  </div>
                </div>
              )}

              {/* Glassware */}
              {sanityCocktail.glass && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-orange-600"></div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Glassware</p>
                    <p className="font-medium text-gray-900 capitalize">{sanityCocktail.glass.replace(/-/g, " ")}</p>
                  </div>
                </div>
              )}

              {/* Strength Rating */}
              {sanityCocktail.flavorProfile?.strength && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-green-600"></div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Strength</p>
                    <p className="font-medium text-gray-900">{sanityCocktail.flavorProfile.strength}/5</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* INGREDIENTS COLUMN */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-soft border border-gray-100 sticky top-24">
              <h2 className="font-serif text-2xl font-bold text-gray-900 mb-6">Ingredients</h2>

              {ingredients.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Ingredients coming soon.
                </p>
              ) : (
                <ul className="mt-3 space-y-1 text-sm">
                  {ingredients.map((ing, idx) => (
                    <li key={idx}>• {ing.text}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-7 space-y-10">
            {/* Flavor Profile */}
            <FlavorProfileCard
              flavor={{
                strength: cocktail.flavor_strength,
                sweetness: cocktail.flavor_sweetness,
                tartness: cocktail.flavor_tartness,
                bitterness: cocktail.flavor_bitterness,
                aroma: cocktail.flavor_aroma,
                texture: cocktail.flavor_texture,
              }}
            />

            {/* Best For */}
            {sanityCocktail.bestFor && sanityCocktail.bestFor.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                <h3 className="font-serif font-bold text-lg text-gray-900 mb-4">Best For</h3>
                <div className="flex flex-wrap gap-2">
                  {sanityCocktail.bestFor.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-mist text-sage text-sm font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Fun Fact */}
            {sanityCocktail.funFact && (
              <div className="bg-amber-50 rounded-2xl p-6 md:p-8 border border-amber-100 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-amber-600">💡</div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-amber-800">Did you know?</h3>
                  </div>
                  <p className="font-serif italic text-lg md:text-xl text-amber-900 leading-relaxed mb-4">
                    "{sanityCocktail.funFact}"
                  </p>
                  {sanityCocktail.funFactSources && sanityCocktail.funFactSources.length > 0 && (
                    <div className="flex flex-wrap gap-x-2 text-xs text-amber-700/70">
                      <span className="font-bold">Sources:</span>
                      {sanityCocktail.funFactSources.map((source, i) => (
                        <span key={i}>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-amber-900 transition-colors"
                          >
                            {source.label}
                          </a>
                          {i < sanityCocktail.funFactSources!.length - 1 && ", "}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions Section */}
        <section className="mt-16">
          <h2 className="font-serif text-3xl font-bold text-gray-900 mb-8 border-b border-gray-200 pb-4">
            Instructions
          </h2>

          {instructionSteps.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Instructions coming soon.
            </p>
          ) : (
            <ol className="mt-4 space-y-3">
              {instructionSteps.map((step, idx) => (
                <li key={idx} className="flex gap-3 items-start">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold">
                    {idx + 1}
                  </span>
                  <span className="text-sm">{step}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>
    </>
  );
}

// Generate static paths for known cocktails
export async function generateStaticParams() {
  const cocktails = await getCocktailsList();

  return cocktails.map((cocktail) => ({
    slug: cocktail.slug,
  }));
}
