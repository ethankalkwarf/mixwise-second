import { Metadata } from "next";

export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { MainContainer } from "@/components/layout/MainContainer";
import { sanityClient } from "@/lib/sanityClient";
import {
  BeakerIcon,
  HeartIcon,
  ShareIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

interface PageProps {
  params: { userId: string };
}

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface BarIngredient {
  ingredient_id: string;
  ingredient_name: string | null;
}

interface Favorite {
  cocktail_id: string;
  cocktail_name: string | null;
  cocktail_slug: string | null;
  cocktail_image_url: string | null;
}

interface CocktailMatch {
  _id: string;
  name: string;
  slug: { current: string };
  externalImageUrl?: string;
  primarySpirit?: string;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies });

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", params.userId)
    .single();

  const name = profile?.display_name || "Someone";

  return {
    title: `${name}'s Bar | MixWise`,
    description: `Check out ${name}'s home bar on MixWise. See their ingredients and what cocktails they can make.`,
    openGraph: {
      title: `${name}'s Bar | MixWise`,
      description: `Check out ${name}'s home bar on MixWise.`,
    },
  };
}

export default async function PublicBarPage({ params }: PageProps) {
  const supabase = createServerComponentClient({ cookies });

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .eq("id", params.userId)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // Fetch bar ingredients
  const { data: barIngredients } = await supabase
    .from("bar_ingredients")
    .select("ingredient_id, ingredient_name")
    .eq("user_id", params.userId);

  // Fetch favorites (public)
  const { data: favorites } = await supabase
    .from("favorites")
    .select("cocktail_id, cocktail_name, cocktail_slug, cocktail_image_url")
    .eq("user_id", params.userId)
    .limit(6);

  // Calculate cocktails they can make
  const ingredientIds = (barIngredients || []).map((i) => i.ingredient_id);
  let cocktailMatches: CocktailMatch[] = [];

  if (ingredientIds.length > 0) {
    const cocktails = await sanityClient.fetch<(CocktailMatch & { ingredientIds: string[] })[]>(`
      *[_type == "cocktail"][0...100] {
        _id,
        name,
        slug,
        externalImageUrl,
        primarySpirit,
        "ingredientIds": ingredients[].ingredient->._id
      }
    `);

    const ingredientSet = new Set(ingredientIds);
    cocktailMatches = cocktails
      .filter((cocktail) => {
        const required = cocktail.ingredientIds || [];
        if (required.length === 0) return false;
        return required.every((id) => ingredientSet.has(id));
      })
      .slice(0, 12);
  }

  const displayName = (profile as UserProfile).display_name || "User";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="py-8 sm:py-12">
      <MainContainer>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
          {(profile as UserProfile).avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={(profile as UserProfile).avatar_url!}
              alt=""
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-400 font-bold text-3xl">
              {userInitial}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-100">
              {displayName}&apos;s Bar
            </h1>
            <p className="text-slate-400 mt-1">
              {ingredientIds.length} ingredients • {cocktailMatches.length} cocktails possible
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
            <BeakerIcon className="w-6 h-6 text-lime-400 mb-2" />
            <p className="text-2xl font-bold text-slate-100">{ingredientIds.length}</p>
            <p className="text-sm text-slate-400">Ingredients</p>
          </div>
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
            <div className="text-2xl mb-2">🍸</div>
            <p className="text-2xl font-bold text-slate-100">{cocktailMatches.length}</p>
            <p className="text-sm text-slate-400">Cocktails Ready</p>
          </div>
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
            <HeartIcon className="w-6 h-6 text-pink-400 mb-2" />
            <p className="text-2xl font-bold text-slate-100">{(favorites || []).length}</p>
            <p className="text-sm text-slate-400">Favorites</p>
          </div>
        </div>

        {/* Ingredients */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-serif font-bold text-slate-100">
              Bar Inventory
            </h2>
          </div>
          <div className="p-6">
            {barIngredients && barIngredients.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(barIngredients as BarIngredient[]).map((item) => (
                  <span
                    key={item.ingredient_id}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 text-sm rounded-lg"
                  >
                    {item.ingredient_name || item.ingredient_id}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No ingredients added yet.</p>
            )}
          </div>
        </section>

        {/* Cocktails They Can Make */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-serif font-bold text-slate-100">
              Cocktails {displayName} Can Make
            </h2>
          </div>
          <div className="p-6">
            {cocktailMatches.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cocktailMatches.map((cocktail) => (
                  <Link
                    key={cocktail._id}
                    href={`/cocktails/${cocktail.slug?.current}`}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors group"
                  >
                    {cocktail.externalImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cocktail.externalImageUrl}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-xl">
                        🍸
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-200 group-hover:text-lime-400 truncate transition-colors">
                        {cocktail.name}
                      </p>
                      {cocktail.primarySpirit && (
                        <p className="text-xs text-slate-500">{cocktail.primarySpirit}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">
                Add more ingredients to see matching cocktails.
              </p>
            )}
          </div>
        </section>

        {/* Favorites */}
        {favorites && favorites.length > 0 && (
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-serif font-bold text-slate-100">
                {displayName}&apos;s Favorites
              </h2>
            </div>
            <div className="p-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(favorites as Favorite[]).map((fav) => (
                  <Link
                    key={fav.cocktail_id}
                    href={`/cocktails/${fav.cocktail_slug}`}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors group"
                  >
                    {fav.cocktail_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={fav.cocktail_image_url}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-xl">
                        🍸
                      </div>
                    )}
                    <p className="font-medium text-slate-200 group-hover:text-lime-400 truncate transition-colors">
                      {fav.cocktail_name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="text-center py-8 px-6 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl">
          <h2 className="text-2xl font-serif font-bold text-slate-100 mb-3">
            Build Your Own Bar
          </h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Create a free MixWise account to track your ingredients, get recommendations, and share your bar with friends.
          </p>
          <Link
            href="/account-benefits"
            className="inline-flex items-center gap-2 px-6 py-3 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold rounded-lg transition-colors"
          >
            Create Free Account
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </MainContainer>
    </div>
  );
}

