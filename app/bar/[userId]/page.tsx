import { Metadata } from "next";

export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { MainContainer } from "@/components/layout/MainContainer";
import { getCocktailsWithIngredients } from "@/lib/cocktails.server";
import { getUserBarIngredients } from "@/lib/cocktails.server";
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
  const { userId } = params;

  if (!userId) {
    notFound();
  }

  const supabase = createServerComponentClient({ cookies });

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // Fetch bar ingredients with fallback logic
  const barIngredients = await getUserBarIngredients(params.userId);

  // Fetch favorites (public)
  const { data: favorites } = await supabase
    .from("favorites")
    .select("cocktail_id, cocktail_name, cocktail_slug, cocktail_image_url")
    .eq("user_id", params.userId)
    .limit(6);

  // Calculate cocktails they can make
  const ingredientIds = barIngredients.map((i) => i.ingredient_id);
  let cocktailMatches: CocktailMatch[] = [];

  if (ingredientIds.length > 0) {
    const cocktails = await getCocktailsWithIngredients();

    const ingredientSet = new Set(ingredientIds);
    cocktailMatches = cocktails
      .filter((cocktail) => {
        try {
          const ingredients = cocktail.ingredientsWithIds || [];
          const required = ingredients
            .filter(ing => !ing.isOptional)
            .map(ing => ing.id);
          if (required.length === 0) return false;
          return required.every((id) => ingredientSet.has(id));
        } catch (error) {
          // Skip cocktails with malformed ingredient data
          return false;
        }
      })
      .map(cocktail => ({
        _id: cocktail.id,
        name: cocktail.name,
        slug: { current: cocktail.slug },
        externalImageUrl: cocktail.imageUrl || undefined,
        primarySpirit: cocktail.primarySpirit || undefined,
      }))
      .slice(0, 12);
  }

  const displayName = (profile as UserProfile).display_name || "User";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="py-8 sm:py-16">
        <MainContainer>
          {/* Header */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-lime-500/10 via-transparent to-terracotta/10 rounded-3xl blur-3xl"></div>
            <div className="relative bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-8 sm:p-12">
              <div className="flex flex-col sm:flex-row sm:items-center gap-8">
                <div className="flex-shrink-0">
                  {(profile as UserProfile).avatar_url ? (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-lime-400 to-terracotta rounded-full blur-md opacity-50"></div>
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={(profile as UserProfile).avatar_url!}
                        alt=""
                        className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-slate-700/50"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-lime-500/30 to-terracotta/30 rounded-full blur-lg"></div>
                      <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-lime-500/20 to-terracotta/20 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center">
                        <span className="text-4xl sm:text-5xl font-bold text-lime-400 drop-shadow-lg">
                          {userInitial}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-transparent bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-clip-text mb-3">
                    {displayName}&apos;s Bar
                  </h1>
                  <p className="text-lg text-slate-400 mb-4">
                    {barIngredients.length} ingredients • {cocktailMatches.length} cocktails possible
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-4 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-700/50">
                      <BeakerIcon className="w-4 h-4 text-lime-400" />
                      <span className="text-slate-300">{barIngredients.length} ingredients</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-700/50">
                      <span className="text-xl">🍸</span>
                      <span className="text-slate-300">{cocktailMatches.length} cocktails</span>
                    </div>
                    {favorites && favorites.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-700/50">
                        <HeartIcon className="w-4 h-4 text-pink-400" />
                        <span className="text-slate-300">{favorites.length} favorites</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-lime-500/20 to-lime-400/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 hover:bg-slate-900/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-lime-500/20 to-lime-400/20 rounded-xl">
                    <BeakerIcon className="w-6 h-6 text-lime-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-slate-100">{barIngredients.length}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-400">Ingredients</p>
                <p className="text-xs text-slate-500 mt-1">Available in bar</p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-terracotta/20 to-orange-400/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 hover:bg-slate-900/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-terracotta/20 to-orange-400/20 rounded-xl">
                    <span className="text-2xl">🍸</span>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-slate-100">{cocktailMatches.length}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-400">Cocktails Ready</p>
                <p className="text-xs text-slate-500 mt-1">Can make now</p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-rose-400/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 hover:bg-slate-900/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-pink-500/20 to-rose-400/20 rounded-xl">
                    <HeartIcon className="w-6 h-6 text-pink-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-slate-100">{(favorites || []).length}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-400">Favorites</p>
                <p className="text-xs text-slate-500 mt-1">Saved cocktails</p>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <section className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-800/20 to-slate-700/20 rounded-3xl blur-2xl"></div>
            <div className="relative bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-3xl overflow-hidden">
              <div className="p-8 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-lime-500/20 to-lime-400/20 rounded-xl">
                    <BeakerIcon className="w-6 h-6 text-lime-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-slate-100">
                      Bar Inventory
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      {barIngredients.length} ingredients available
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                {barIngredients.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {barIngredients.map((item) => (
                      <div
                        key={item.ingredient_id}
                        className="group relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-lime-500/20 to-terracotta/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="relative px-4 py-2 bg-slate-800/60 hover:bg-slate-800/80 backdrop-blur-sm text-slate-200 hover:text-slate-100 text-sm font-medium rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200">
                          {item.ingredient_name || item.ingredient_id}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BeakerIcon className="w-8 h-8 text-slate-500" />
                    </div>
                    <p className="text-slate-400 text-lg">No ingredients added yet.</p>
                    <p className="text-slate-500 text-sm mt-2">Start building your bar to discover amazing cocktails!</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Cocktails They Can Make */}
          <section className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-terracotta/10 to-orange-500/10 rounded-3xl blur-2xl"></div>
            <div className="relative bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-3xl overflow-hidden">
              <div className="p-8 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-terracotta/20 to-orange-400/20 rounded-xl">
                    <span className="text-2xl">🍸</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-slate-100">
                      Cocktails {displayName} Can Make
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      {cocktailMatches.length} cocktails ready to mix
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                {cocktailMatches.length > 0 ? (
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {cocktailMatches.map((cocktail) => (
                      <Link
                        key={cocktail._id}
                        href={`/cocktails/${cocktail.slug?.current}`}
                        className="group relative block"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-terracotta/20 to-orange-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative bg-slate-800/40 hover:bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 hover:border-terracotta/30 rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02]">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              {cocktail.externalImageUrl ? (
                                <div className="relative">
                                  <div className="absolute inset-0 bg-gradient-to-r from-terracotta/30 to-orange-400/30 rounded-xl blur-sm"></div>
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={cocktail.externalImageUrl}
                                    alt=""
                                    className="relative w-16 h-16 rounded-xl object-cover border border-slate-600/50"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600/50">
                                  <span className="text-2xl">🍸</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-200 group-hover:text-terracotta truncate transition-colors">
                                {cocktail.name}
                              </h3>
                              {cocktail.primarySpirit && (
                                <p className="text-sm text-slate-400 mt-1">{cocktail.primarySpirit}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
                                <span className="text-xs text-lime-400 font-medium">Ready to make</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl">🍸</span>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">No cocktails ready yet</h3>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">
                      Add more ingredients to your bar to discover amazing cocktails you can make.
                    </p>
                    <Link
                      href="/account-benefits"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/60 hover:bg-slate-800/80 text-slate-300 hover:text-slate-200 rounded-lg transition-colors text-sm font-medium"
                    >
                      Add Ingredients
                      <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Favorites */}
          {favorites && favorites.length > 0 && (
            <section className="relative mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-3xl blur-2xl"></div>
              <div className="relative bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-3xl overflow-hidden">
                <div className="p-8 border-b border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-pink-500/20 to-rose-400/20 rounded-xl">
                      <HeartIcon className="w-6 h-6 text-pink-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-slate-100">
                        {displayName}&apos;s Favorites
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">
                        {favorites.length} favorite cocktails
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {(favorites as Favorite[]).filter(fav => fav.cocktail_slug).map((fav) => (
                      <Link
                        key={fav.cocktail_id}
                        href={`/cocktails/${fav.cocktail_slug}`}
                        className="group relative block"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-rose-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative bg-slate-800/40 hover:bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 hover:border-pink-400/30 rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02]">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              {fav.cocktail_image_url ? (
                                <div className="relative">
                                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 to-rose-400/30 rounded-xl blur-sm"></div>
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={fav.cocktail_image_url}
                                    alt=""
                                    className="relative w-16 h-16 rounded-xl object-cover border border-slate-600/50"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600/50">
                                  <span className="text-2xl">🍸</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-200 group-hover:text-pink-400 truncate transition-colors">
                                {fav.cocktail_name}
                              </h3>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                                <span className="text-xs text-pink-400 font-medium">Favorite</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-lime-500/20 via-terracotta/20 to-pink-500/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-slate-950/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-gradient-to-r from-lime-500/20 to-terracotta/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BeakerIcon className="w-10 h-10 text-lime-400" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-transparent bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-clip-text mb-4">
                  Build Your Own Bar
                </h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  Create a free MixWise account to track your ingredients, get personalized recommendations, discover new cocktails, and share your bar with friends.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link
                    href="/account-benefits"
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-lime-500 to-lime-400 hover:from-lime-400 hover:to-lime-300 text-slate-900 font-bold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-lime-500/25"
                  >
                    <span>Create Free Account</span>
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/mix"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/60 hover:bg-slate-800/80 backdrop-blur-sm text-slate-300 hover:text-slate-200 rounded-xl transition-all duration-200 border border-slate-700/50 hover:border-slate-600/50"
                  >
                    Try Mix Tool
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
      </MainContainer>
    </div>
  );
}

