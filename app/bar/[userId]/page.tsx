import { Metadata } from "next";
import React from "react";

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
  LockClosedIcon,
  GlobeAltIcon,
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

  // Fetch user preferences to check if bar is public
  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("public_bar_enabled")
    .eq("user_id", userId)
    .single();

  const isPublicBar = preferences?.public_bar_enabled || false;

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
    <BarContentWrapper
      userId={userId}
      profile={profile as UserProfile}
      isPublicBar={isPublicBar}
      displayName={displayName}
      userInitial={userInitial}
      barIngredients={barIngredients}
      cocktailMatches={cocktailMatches}
      favorites={favorites as Favorite[]}
    />
  );
}

interface BarContentWrapperProps {
  userId: string;
  profile: UserProfile;
  isPublicBar: boolean;
  displayName: string;
  userInitial: string;
  barIngredients: BarIngredient[];
  cocktailMatches: CocktailMatch[];
  favorites: Favorite[];
}

function BarContentWrapper({
  userId,
  profile,
  isPublicBar,
  displayName,
  userInitial,
  barIngredients,
  cocktailMatches,
  favorites,
}: BarContentWrapperProps) {
  return (
    <BarContent
      userId={userId}
      profile={profile}
      isPublicBar={isPublicBar}
      displayName={displayName}
      userInitial={userInitial}
      barIngredients={barIngredients}
      cocktailMatches={cocktailMatches}
      favorites={favorites}
    />
  );
}

function BarContent({
  userId,
  profile,
  isPublicBar,
  displayName,
  userInitial,
  barIngredients,
  cocktailMatches,
  favorites,
}: BarContentWrapperProps) {
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  // Check if current user is the owner of this bar
  const isOwner = currentUser?.id === userId;

  // Show private message if bar is not public and user is not the owner
  if (!isLoading && !isPublicBar && !isOwner) {
    return (
      <div className="min-h-screen bg-botanical-gradient py-8 sm:py-16">
        <MainContainer>
          <div className="max-w-2xl mx-auto text-center">
            <div className="card p-12">
              <div className="w-20 h-20 bg-stone/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <LockClosedIcon className="w-10 h-10 text-sage" />
              </div>
              <h1 className="text-3xl font-display font-bold text-forest mb-4">
                Private Bar Profile
              </h1>
              <p className="text-sage text-lg mb-8">
                {displayName}'s bar is currently private. They need to enable public sharing in their settings.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream rounded-xl transition-colors font-medium"
                >
                  <ArrowRightIcon className="w-4 h-4" />
                  Explore MixWise
                </Link>
                <Link
                  href="/account-benefits"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-mist hover:bg-stone text-forest rounded-xl transition-colors font-medium"
                >
                  Create Your Bar
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </MainContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-botanical-gradient py-8 sm:py-16">
      <MainContainer>
        {/* Header */}
        <div className="relative mb-16">
          <div className="absolute inset-0 bg-hero-pattern rounded-3xl blur-3xl"></div>
          <div className="relative card card-hover p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row sm:items-center gap-8">
              <div className="flex-shrink-0">
                {(profile as UserProfile).avatar_url ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-terracotta/30 to-olive/30 rounded-full blur-lg"></div>
                    <img
                      src={(profile as UserProfile).avatar_url!}
                      alt=""
                      className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-mist"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-terracotta/10 to-olive/10 border-2 border-mist flex items-center justify-center">
                      <span className="text-4xl sm:text-5xl font-display font-bold text-terracotta">
                        {userInitial}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-forest">
                    {displayName}&apos;s Bar
                  </h1>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    isPublicBar
                      ? 'bg-olive/10 text-olive border border-olive/20'
                      : 'bg-stone/30 text-sage border border-stone/40'
                  }`}>
                    {isPublicBar ? (
                      <>
                        <GlobeAltIcon className="w-4 h-4" />
                        <span>Public</span>
                      </>
                    ) : (
                      <>
                        <LockClosedIcon className="w-4 h-4" />
                        <span>Private</span>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-lg text-sage mb-6">
                  {barIngredients.length} ingredients • {cocktailMatches.length} cocktails possible
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-4 text-sm">
                  <div className="flex items-center gap-2 px-4 py-2 bg-mist/50 rounded-xl border border-mist">
                    <BeakerIcon className="w-4 h-4 text-olive" />
                    <span className="text-forest font-medium">{barIngredients.length} ingredients</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-mist/50 rounded-xl border border-mist">
                    <span className="text-xl">🍸</span>
                    <span className="text-forest font-medium">{cocktailMatches.length} cocktails</span>
                  </div>
                  {favorites && favorites.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-mist/50 rounded-xl border border-mist">
                      <HeartIcon className="w-4 h-4 text-terracotta" />
                      <span className="text-forest font-medium">{favorites.length} favorites</span>
                    </div>
                  )}
                </div>
                {isOwner && (
                  <div className="mt-6 text-center sm:text-left">
                    <Link
                      href="/settings"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-mist/50 hover:bg-mist/70 text-forest rounded-xl transition-colors text-sm font-medium border border-mist"
                    >
                      {isPublicBar ? (
                        <>
                          <GlobeAltIcon className="w-4 h-4" />
                          Manage Public Settings
                        </>
                      ) : (
                        <>
                          <LockClosedIcon className="w-4 h-4" />
                          Make Bar Public
                        </>
                      )}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          <div className="card card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-olive/10 rounded-xl flex items-center justify-center">
                <BeakerIcon className="w-6 h-6 text-olive" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-display font-bold text-forest">{barIngredients.length}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-forest">Ingredients</p>
            <p className="text-xs text-sage mt-1">Available in bar</p>
          </div>

          <div className="card card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-terracotta/10 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🍸</span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-display font-bold text-forest">{cocktailMatches.length}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-forest">Cocktails Ready</p>
            <p className="text-xs text-sage mt-1">Can make now</p>
          </div>

          <div className="card card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-stone/50 rounded-xl flex items-center justify-center">
                <HeartIcon className="w-6 h-6 text-terracotta" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-display font-bold text-forest">{(favorites || []).length}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-forest">Favorites</p>
            <p className="text-xs text-sage mt-1">Saved cocktails</p>
          </div>
        </div>

          {/* Bar Inventory */}
          <section className="card card-hover mb-12">
            <div className="flex items-center justify-between p-8 border-b border-mist">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-olive/10 rounded-xl flex items-center justify-center">
                  <BeakerIcon className="w-6 h-6 text-olive" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-forest">
                    Bar Inventory
                  </h2>
                  <p className="text-sm text-sage mt-1">
                    {barIngredients.length} ingredients available
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8">
              {barIngredients.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {barIngredients.map((item) => (
                    <span
                      key={item.ingredient_id}
                      className="px-4 py-2 bg-stone/30 hover:bg-stone/50 text-forest text-sm font-medium rounded-xl border border-mist hover:border-stone transition-colors"
                    >
                      {item.ingredient_name || item.ingredient_id}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-mist/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BeakerIcon className="w-8 h-8 text-sage" />
                  </div>
                  <h3 className="text-xl font-semibold text-forest mb-4">No ingredients added yet</h3>
                  <p className="text-sage mb-8 max-w-md mx-auto">
                    Start building your bar to discover amazing cocktails you can make.
                  </p>
                  <Link
                    href="/account-benefits"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-olive hover:bg-olive/80 text-cream rounded-xl transition-colors font-medium"
                  >
                    Add Ingredients
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Cocktails They Can Make */}
          <section className="card card-hover mb-12">
            <div className="flex items-center justify-between p-8 border-b border-mist">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-terracotta/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🍸</span>
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-forest">
                    Cocktails {displayName} Can Make
                  </h2>
                  <p className="text-sm text-sage mt-1">
                    {cocktailMatches.length} cocktails ready to mix
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8">
              {cocktailMatches.length > 0 ? (
                <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {cocktailMatches.map((cocktail) => (
                    <Link
                      key={cocktail._id}
                      href={`/cocktails/${cocktail.slug?.current}`}
                      className="group block"
                    >
                      <div className="bg-mist/30 hover:bg-mist/50 border border-mist rounded-2xl p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            {cocktail.externalImageUrl ? (
                              <img
                                src={cocktail.externalImageUrl}
                                alt=""
                                className="w-16 h-16 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-stone/50 flex items-center justify-center">
                                <span className="text-2xl">🍸</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-forest group-hover:text-terracotta truncate transition-colors">
                              {cocktail.name}
                            </h3>
                            {cocktail.primarySpirit && (
                              <p className="text-sm text-sage mt-1">{cocktail.primarySpirit}</p>
                            )}
                            <div className="flex items-center gap-2 mt-3">
                              <div className="w-2 h-2 bg-olive rounded-full"></div>
                              <span className="text-xs text-olive font-medium">Ready to make</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-mist/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🍸</span>
                  </div>
                  <h3 className="text-xl font-semibold text-forest mb-4">No cocktails ready yet</h3>
                  <p className="text-sage mb-8 max-w-md mx-auto">
                    Add more ingredients to your bar to discover amazing cocktails you can make.
                  </p>
                  <Link
                    href="/account-benefits"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream rounded-xl transition-colors font-medium"
                  >
                    Add Ingredients
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              )}
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

interface BarContentWrapperProps {
  userId: string;
  profile: UserProfile;
  isPublicBar: boolean;
  displayName: string;
  userInitial: string;
  barIngredients: BarIngredient[];
  cocktailMatches: CocktailMatch[];
  favorites: Favorite[];
}

function BarContentWrapper({
  userId,
  profile,
  isPublicBar,
  displayName,
  userInitial,
  barIngredients,
  cocktailMatches,
  favorites,
}: BarContentWrapperProps) {
  return (
    <BarContent
      userId={userId}
      profile={profile}
      isPublicBar={isPublicBar}
      displayName={displayName}
      userInitial={userInitial}
      barIngredients={barIngredients}
      cocktailMatches={cocktailMatches}
      favorites={favorites}
    />
  );
}

function BarContent({
  userId,
  profile,
  isPublicBar,
  displayName,
  userInitial,
  barIngredients,
  cocktailMatches,
  favorites,
}: BarContentWrapperProps) {
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  // Check if current user is the owner of this bar
  const isOwner = currentUser?.id === userId;

  // Show private message if bar is not public and user is not the owner
  if (!isLoading && !isPublicBar && !isOwner) {
    return (
      <div className="min-h-screen bg-botanical-gradient py-8 sm:py-16">
        <MainContainer>
          <div className="max-w-2xl mx-auto text-center">
            <div className="card p-12">
              <div className="w-20 h-20 bg-stone/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <LockClosedIcon className="w-10 h-10 text-sage" />
              </div>
              <h1 className="text-3xl font-display font-bold text-forest mb-4">
                Private Bar Profile
              </h1>
              <p className="text-sage text-lg mb-8">
                {displayName}'s bar is currently private. They need to enable public sharing in their settings.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream rounded-xl transition-colors font-medium"
                >
                  <ArrowRightIcon className="w-4 h-4" />
                  Explore MixWise
                </Link>
                <Link
                  href="/account-benefits"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-mist hover:bg-stone text-forest rounded-xl transition-colors font-medium"
                >
                  Create Your Bar
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </MainContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-botanical-gradient py-8 sm:py-16">
      <MainContainer>

