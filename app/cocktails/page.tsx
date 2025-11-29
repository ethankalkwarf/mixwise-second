import { sanityClient } from "@/lib/sanityClient";
import { getImageUrl } from "@/lib/sanityImage";
import { MainContainer } from "@/components/layout/MainContainer";
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
  glass,
  method,
  primarySpirit,
  difficulty,
  isPopular,
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
    <div className="py-10">
      <MainContainer>
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-50 mb-4">
            Cocktail Recipes
          </h1>
          <p className="text-slate-400 max-w-2xl">
            Browse our collection of handcrafted cocktail recipes. Each recipe includes detailed ingredients and instructions.
          </p>
        </div>

        {/* Empty State */}
        {cocktails.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-6">🍸</div>
            <h2 className="text-2xl font-serif font-bold text-slate-200 mb-3">
              No cocktails yet
            </h2>
            <p className="text-slate-400 max-w-md">
              Head over to Sanity Studio at{" "}
              <Link href="/studio" className="text-lime-400 hover:underline">
                /studio
              </Link>{" "}
              to create your first cocktail recipe.
            </p>
          </div>
        )}

        {/* Cocktail Grid */}
        {cocktails.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cocktails.map((cocktail) => (
              <CocktailCard key={cocktail._id} cocktail={cocktail} />
            ))}
          </div>
        )}
      </MainContainer>
    </div>
  );
}

function CocktailCard({ cocktail }: { cocktail: SanityCocktail }) {
  const imageUrl = getImageUrl(cocktail.image, { width: 600, height: 400 });
  const ingredientCount = cocktail.ingredients?.length || 0;

  return (
    <Link
      href={`/cocktails/${cocktail.slug?.current || cocktail._id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition-all duration-300 hover:border-lime-500/40 hover:shadow-xl hover:shadow-lime-900/10"
    >
      {/* Image */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-800">
        {imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={cocktail.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-700 text-5xl">
            🍸
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {cocktail.isPopular && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-1 rounded shadow-lg">
              ★ FEATURED
            </span>
          )}
          {cocktail.difficulty && (
            <span className="bg-slate-800/90 text-slate-200 text-[10px] font-medium px-2 py-1 rounded">
              {cocktail.difficulty.charAt(0).toUpperCase() + cocktail.difficulty.slice(1)}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col relative z-10 -mt-12">
        <div className="backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-lg flex-1 flex flex-col bg-slate-950/80">
          <div className="mb-2">
            {cocktail.primarySpirit && (
              <p className="text-[10px] text-lime-400 font-bold tracking-widest uppercase mb-1">
                {cocktail.primarySpirit}
              </p>
            )}
            <h3 className="font-serif font-bold text-xl leading-tight text-slate-100">
              {cocktail.name}
            </h3>
          </div>

          {cocktail.description && (
            <p className="text-xs text-slate-400 line-clamp-2 mb-3">
              {cocktail.description}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
            <span>{ingredientCount} ingredient{ingredientCount !== 1 ? "s" : ""}</span>
            {cocktail.glass && (
              <span className="capitalize">{cocktail.glass.replace("-", " ")}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

