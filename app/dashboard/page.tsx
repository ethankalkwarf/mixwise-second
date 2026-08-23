"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { MainContainer } from "@/components/layout/MainContainer";
import { useUser } from "@/components/auth/UserProvider";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useFavorites } from "@/hooks/useFavorites";
import { useCocktailSkips } from "@/hooks/useCocktailSkips";
import { useCocktailNotes } from "@/hooks/useCocktailNotes";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { useShoppingList } from "@/hooks/useShoppingList";
import { ShareBarButton } from "@/components/bar/ShareBarButton";
import { DashboardLearnCard } from "@/components/learn/DashboardLearnCard";
import { usePreferredAuthMode } from "@/lib/auth/returning-user";
import { getMixDataClient } from "@/lib/cocktails";
import { getMixMatchGroups } from "@/lib/mixMatching";
import { formatCocktailName } from "@/lib/formatters";
import { getCocktailImageUrls } from "@/lib/cocktails.client";
import Image from "next/image";
import type { MixIngredient } from "@/lib/mixTypes";
import {
  BeakerIcon,
  HeartIcon,
  PencilSquareIcon,
  ClockIcon,
  TrophyIcon,
  PlusCircleIcon,
  XMarkIcon,
  ShoppingBagIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { debugLog } from "@/lib/debugLog";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import { getHomeHeroHeadline, greetingFirstName } from "@/lib/homeHeroHeadline";
import { DashboardEngagementSidebar } from "@/components/home/WebEngagementSection";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiBmaWxsPSIjRTZFQkU0Ii8+Cjx0ZXh0IHg9IjI4IiB5PSIzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNUY2RjVFIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn424PC90ZXh0Pgo8L3N2Zz4=";

interface RecommendedCocktail {
  _id: string;
  name: string;
  slug: { current: string };
  externalImageUrl?: string;
  primarySpirit?: string;
  matchScore?: number;
}

export default function DashboardPage() {
  const { user, profile, isAuthenticated, isLoading: authLoading } = useUser();
  const { openAuthDialog } = useAuthDialog();
  const preferredAuthMode = usePreferredAuthMode();
  const { ingredientIds, isLoading: barLoading, removeIngredient } = useBarIngredients();
  const { favorites, isLoading: favsLoading } = useFavorites();
  const { skips, skipIds, isLoading: skipsLoading, unskipCocktail } = useCocktailSkips();
  const { notes: cocktailNotes, isLoading: notesLoading } = useCocktailNotes();
  const { recentlyViewed, isLoading: recentLoading } = useRecentlyViewed();
  const { addItems, isLoading: shoppingLoading, itemCount: shoppingCount } = useShoppingList();

  const [allIngredients, setAllIngredients] = useState<MixIngredient[]>([]);
  const [allCocktails, setAllCocktails] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedCocktail[]>([]);
  const [almostThereCocktails, setAlmostThereCocktails] = useState<Array<{
    _id: string;
    name: string;
    slug: { current: string };
    externalImageUrl?: string;
    missingIngredientNames: string[];
    missingIngredientIds: string[];
  }>>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);
  const [favoriteImageUrls, setFavoriteImageUrls] = useState<Map<string, string | null>>(new Map());
  const [recentImageUrls, setRecentImageUrls] = useState<Map<string, string | null>>(new Map());
  const [skipsExpanded, setSkipsExpanded] = useState(false);
  const DASHBOARD_READY_LIMIT = 10;
  const nativeShell = useNativeShell();

  const hasFetchedMixData = useRef(false);
  const hasShownAuthDialog = useRef(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated && !hasShownAuthDialog.current) {
      hasShownAuthDialog.current = true;
      openAuthDialog({
        mode: "login",
        title: "Sign in to view your dashboard",
        subtitle: "Log in or create a free account to track your progress and get recommendations.",
      });
    }
    if (isAuthenticated) {
      hasShownAuthDialog.current = false;
    }
  }, [authLoading, isAuthenticated, openAuthDialog]);

  useEffect(() => {
    if (hasFetchedMixData.current) return;
    hasFetchedMixData.current = true;

    async function fetchData() {
      try {
        setDataLoadError(null);
        const { ingredients, cocktails } = await getMixDataClient();
        setAllIngredients(ingredients || []);
        setAllCocktails(cocktails || []);
      } catch (error) {
        console.error("Error fetching mix data:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to load data";
        setDataLoadError(errorMessage);
        setLoadingRecs(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!isAuthenticated || ingredientIds.length === 0 || allCocktails.length === 0 || allIngredients.length === 0) {
        setRecommendations([]);
        setLoadingRecs(false);
        return;
      }

      try {
        const dbStaples = allIngredients.filter((i) => i?.isStaple).map((i) => i?.id).filter(Boolean);
        const manualStaples = ['ice', 'water'];
        const stapleIds = [...new Set([...dbStaples, ...manualStaples])];

        const result = getMixMatchGroups({
          cocktails: allCocktails,
          ownedIngredientIds: ingredientIds,
          stapleIngredientIds: stapleIds,
          excludeCocktailIds: skipIds,
        });

        if (process.env.NODE_ENV === "development") {
          debugLog("[DASHBOARD DEBUG] Matching results:", {
            totalCocktails: allCocktails.length,
            ingredientIdsCount: ingredientIds.length,
            stapleIds,
            readyCount: result.ready.length,
            almostThereCount: result.almostThere.length,
            farCount: result.far.length,
            readySample: result.ready.slice(0, 3).map((c) => c.cocktail.name),
          });
        }

        const formattedCocktails: RecommendedCocktail[] = result.ready.map(match => ({
          _id: match.cocktail.id,
          name: match.cocktail.name,
          slug: { current: match.cocktail.slug },
          externalImageUrl: match.cocktail.imageUrl || undefined,
          primarySpirit: match.cocktail.primarySpirit || undefined,
        }));

        const formattedAlmostThere = result.almostThere.map(match => ({
          _id: match.cocktail.id,
          name: match.cocktail.name,
          slug: { current: match.cocktail.slug },
          externalImageUrl: match.cocktail.imageUrl || undefined,
          missingIngredientNames: match.missingIngredientNames || [],
          missingIngredientIds: match.missingRequiredIngredientIds || [],
        }));

        setRecommendations(formattedCocktails);
        setAlmostThereCocktails(formattedAlmostThere);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoadingRecs(false);
      }
    }

    fetchRecommendations();
  }, [isAuthenticated, ingredientIds, allCocktails, allIngredients, skipIds]);

  useEffect(() => {
    async function fetchFavoriteImages() {
      if (favorites.length === 0) {
        setFavoriteImageUrls(new Map());
        return;
      }

      try {
        const cocktailIds = favorites.map(fav => fav.cocktail_id);
        const imageUrls = await getCocktailImageUrls(cocktailIds);
        setFavoriteImageUrls(imageUrls);
      } catch (error) {
        console.error("Error fetching favorite images:", error);
      }
    }

    if (!favsLoading && favorites.length > 0) {
      fetchFavoriteImages();
    }
  }, [favorites, favsLoading]);

  useEffect(() => {
    async function fetchRecentImages() {
      if (recentlyViewed.length === 0) {
        setRecentImageUrls(new Map());
        return;
      }

      try {
        const cocktailIds = recentlyViewed.map(item => item.cocktail_id);
        const imageUrls = await getCocktailImageUrls(cocktailIds);
        setRecentImageUrls(imageUrls);
      } catch (error) {
        console.error("Error fetching recent images:", error);
      }
    }

    if (!recentLoading && recentlyViewed.length > 0) {
      fetchRecentImages();
    }
  }, [recentlyViewed, recentLoading]);

  const greeting = useMemo(() => {
    const firstName = isAuthenticated
      ? greetingFirstName({
          firstName: profile?.first_name,
          displayName: profile?.display_name,
          email: user?.email,
        })
      : null;

    return getHomeHeroHeadline({ firstName });
  }, [isAuthenticated, profile?.first_name, profile?.display_name, user?.email]);

  const rankedRecommendations = useMemo(() => {
    const favoriteIds = new Set(favorites.map((fav) => String(fav.cocktail_id)));
    return [...recommendations].sort((a, b) => {
      const aFav = favoriteIds.has(String(a._id)) ? 0 : 1;
      const bFav = favoriteIds.has(String(b._id)) ? 0 : 1;
      return aFav - bFav;
    });
  }, [recommendations, favorites]);

  const engineSubtitle = useMemo(() => {
    if (barLoading || loadingRecs) {
      return "See what you can make with what you have.";
    }
    if (ingredientIds.length === 0) {
      return "Add what's in your bar to see what you can make.";
    }
    if (rankedRecommendations.length > 0) {
      const drinkWord = rankedRecommendations.length === 1 ? "drink" : "drinks";
      return `${rankedRecommendations.length} ${drinkWord} ready · ${ingredientIds.length} in your bar`;
    }
    return "Nothing's a full match yet — add a bottle or check Almost There.";
  }, [barLoading, loadingRecs, ingredientIds.length, rankedRecommendations.length]);

  const handleRemoveFromInventory = useCallback(async (id: string) => {
    await removeIngredient(id);
  }, [removeIngredient]);

  const handleAddAllMissing = useCallback(async () => {
    const ingredientMap = new Map<string, { id: string; name: string; category?: string }>();
    almostThereCocktails.forEach((cocktail) => {
      cocktail.missingIngredientIds.forEach((ingId) => {
        if (!ingredientMap.has(ingId)) {
          const ingredient = allIngredients.find((ing) => ing.id === ingId);
          if (ingredient) {
            ingredientMap.set(ingId, {
              id: ingredient.id,
              name: ingredient.name,
              category: ingredient.category,
            });
          }
        }
      });
    });
    const uniqueIngredients = Array.from(ingredientMap.values());
    if (uniqueIngredients.length > 0) {
      await addItems(uniqueIngredients);
    }
  }, [almostThereCocktails, allIngredients, addItems]);

  if (authLoading) {
    return (
      <div className="py-12 bg-cream min-h-screen">
        <MainContainer>
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-mist rounded-2xl w-64" />
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-mist rounded-3xl" />
              ))}
            </div>
            <div className="h-64 bg-mist rounded-3xl" />
          </div>
        </MainContainer>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="py-12 bg-cream min-h-screen">
        <MainContainer>
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-mist rounded-full flex items-center justify-center mx-auto mb-6">
              <TrophyIcon className="w-10 h-10 text-sage" />
            </div>
            <h1 className="text-3xl font-display font-bold text-forest mb-3">
              Your Personal Dashboard
            </h1>
            <p className="text-sage mb-8 max-w-md mx-auto">
              Sign in to see what you can make with your bar, plus favorites and notes.
            </p>
            <button
              onClick={() => openAuthDialog({ mode: preferredAuthMode })}
              className="px-8 py-4 bg-terracotta text-cream font-bold rounded-2xl hover:bg-terracotta-dark transition-all shadow-lg shadow-terracotta/20"
            >
              {preferredAuthMode === "login" ? "Log In" : "Create Free Account"}
            </button>
          </div>
        </MainContainer>
      </div>
    );
  }

  try {
    return (
      <div className={`${nativeShell ? "py-4" : "py-8 sm:py-12"} bg-cream min-h-screen`} data-native-dashboard={nativeShell ? "" : undefined}>
        <MainContainer>
          <div
            key="dashboard-header"
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6"
          >
            <div>
              <h1 className="text-3xl font-display font-bold text-forest">
                {greeting}
              </h1>
              <p className="text-sage mt-1">
                {engineSubtitle}
              </p>
            </div>
            {ingredientIds.length > 0 && (
              <ShareBarButton
                stats={{ ingredientCount: ingredientIds.length }}
              />
            )}
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <Link
              href="/mix"
              className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta text-cream font-bold rounded-2xl hover:bg-terracotta-dark transition-all text-sm shadow-lg shadow-terracotta/20"
            >
              <BeakerIcon className="w-4 h-4" />
              Mix Wizard
            </Link>
            {shoppingCount > 0 && (
              <Link
                href="/shopping-list"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-mist hover:border-stone text-forest rounded-2xl transition-all text-sm font-medium shadow-soft"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                Shopping List ({shoppingCount})
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="contents md:col-span-2 md:flex md:flex-col md:gap-6">
              <section className="card overflow-hidden order-1 md:order-none">
                <div className="flex items-center justify-between p-6 border-b border-mist">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-olive/20 rounded-xl flex items-center justify-center">
                      <BeakerIcon className="w-5 h-5 text-olive" />
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-bold text-forest">
                        What You Can Make
                      </h2>
                      <span className="text-sm text-sage block min-h-[1.25rem]">
                        {loadingRecs ? "Loading..." : rankedRecommendations.length > 0 ? `${rankedRecommendations.length} cocktail${rankedRecommendations.length !== 1 ? "s" : ""} ready` : ""}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/mix?step=menu"
                    className="text-sm text-terracotta hover:text-terracotta-dark transition-colors font-medium"
                  >
                    View all →
                  </Link>
                </div>
                <div className="p-6">
                  {dataLoadError ? (
                    <div className="text-center py-8">
                      <p className="text-terracotta mb-4">
                        {dataLoadError}
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center gap-2 text-forest hover:text-terracotta font-medium"
                      >
                        Refresh Page
                      </button>
                    </div>
                  ) : loadingRecs ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-mist rounded-2xl animate-pulse" />
                      ))}
                    </div>
                  ) : rankedRecommendations.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {rankedRecommendations.slice(0, DASHBOARD_READY_LIMIT).map((cocktail) => (
                        <Link
                          key={cocktail._id}
                          href={`/cocktails/${cocktail.slug?.current}`}
                          className="flex items-center gap-4 p-3 bg-cream hover:bg-mist rounded-2xl transition-all group"
                        >
                          <Image
                            src={cocktail.externalImageUrl || PLACEHOLDER_IMAGE}
                            alt={cocktail.name}
                            width={56}
                            height={56}
                            className="w-14 h-14 rounded-xl object-cover"
                            onError={(e) => {
                              e.currentTarget.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-forest group-hover:text-terracotta truncate transition-colors">
                              {formatCocktailName(cocktail.name)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sage mb-4">
                        Add ingredients to your bar to see cocktails you can make.
                      </p>
                      <Link
                        href="/mix"
                        className="inline-flex items-center gap-2 text-terracotta hover:text-terracotta-dark font-medium"
                      >
                        <PlusCircleIcon className="w-5 h-5" />
                        Build Your Bar
                      </Link>
                    </div>
                  )}

                  {!loadingRecs && rankedRecommendations.length > DASHBOARD_READY_LIMIT && (
                    <div className="mt-4 text-sm text-sage">
                      Showing {DASHBOARD_READY_LIMIT} of {rankedRecommendations.length}.{" "}
                      <Link
                        href="/mix?step=menu"
                        className="text-terracotta hover:text-terracotta-dark font-medium"
                      >
                        View all
                      </Link>
                      .
                    </div>
                  )}
                </div>
              </section>

              {!loadingRecs && almostThereCocktails.length > 0 ? (
                <section className="card overflow-hidden order-3 md:order-none">
                  <div className="flex items-center justify-between p-6 border-b border-mist">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-terracotta/20 rounded-xl flex items-center justify-center">
                        <BeakerIcon className="w-5 h-5 text-terracotta" />
                      </div>
                      <div>
                        <h2 className="text-xl font-display font-bold text-forest">
                          Almost There
                        </h2>
                        <span className="text-sm text-sage block min-h-[1.25rem]">
                          {almostThereCocktails.length} cocktail{almostThereCocktails.length !== 1 ? "s" : ""} close to ready
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleAddAllMissing}
                        disabled={shoppingLoading}
                        className="text-sm text-terracotta hover:text-terracotta-dark transition-colors font-medium disabled:opacity-50"
                      >
                        Add all missing →
                      </button>
                      <Link
                        href="/mix"
                        className="text-sm text-sage hover:text-forest transition-colors font-medium"
                      >
                        Build bar →
                      </Link>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {almostThereCocktails.slice(0, 6).map((cocktail) => {
                        const missingIngredients = cocktail.missingIngredientIds
                          .map(id => {
                            const ing = allIngredients.find(i => i.id === id);
                            return ing ? { id: ing.id, name: ing.name, category: ing.category } : null;
                          })
                          .filter(Boolean) as Array<{ id: string; name: string; category?: string }>;

                        return (
                          <div
                            key={cocktail._id}
                            className="flex items-center gap-4 p-3 bg-cream hover:bg-mist rounded-2xl transition-all group"
                          >
                            <Link
                              href={`/cocktails/${cocktail.slug?.current}`}
                              className="flex items-center gap-4 flex-1 min-w-0"
                            >
                              <Image
                                src={cocktail.externalImageUrl || PLACEHOLDER_IMAGE}
                                alt={cocktail.name}
                                width={56}
                                height={56}
                                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.src = PLACEHOLDER_IMAGE;
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-forest group-hover:text-terracotta truncate transition-colors">
                                  {formatCocktailName(cocktail.name)}
                                </p>
                                {cocktail.missingIngredientNames.length > 0 && (
                                  <p className="text-sm text-sage truncate">
                                    Missing: {cocktail.missingIngredientNames.slice(0, 2).join(", ")}
                                    {cocktail.missingIngredientNames.length > 2 ? "…" : ""}
                                  </p>
                                )}
                              </div>
                            </Link>
                            {missingIngredients.length > 0 && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await addItems(missingIngredients);
                                }}
                                disabled={shoppingLoading}
                                className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-olive/10 hover:bg-olive/20 text-olive rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                title="Add missing ingredients to shopping list"
                              >
                                Add to list
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              ) : null}

              <section className="card overflow-hidden order-4 md:order-none">
                <div className="flex items-center justify-between p-6 border-b border-mist">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-terracotta/15 rounded-xl flex items-center justify-center">
                      <HeartIcon className="w-5 h-5 text-terracotta" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-forest">
                      Favorites
                    </h2>
                  </div>
                  <Link
                    href="/cocktails"
                    className="text-sm text-terracotta hover:text-terracotta-dark font-medium"
                  >
                    Browse →
                  </Link>
                </div>
                <div className="p-6">
                  {favsLoading ? (
                    <div className="flex gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex-shrink-0 w-32">
                          <div className="w-32 h-24 bg-mist rounded-2xl mb-2 animate-pulse" />
                          <div className="h-4 bg-mist rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                  ) : favorites.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                      {favorites.slice(0, 6).map((fav) => {
                        const supabaseImageUrl = favoriteImageUrls.get(fav.cocktail_id);
                        const storedImageUrl = fav.cocktail_image_url;
                        const imageUrl =
                          (supabaseImageUrl && supabaseImageUrl.trim() ? supabaseImageUrl.trim() : null) ||
                          (storedImageUrl && storedImageUrl.trim() ? storedImageUrl.trim() : null) ||
                          PLACEHOLDER_IMAGE;

                        return (
                          <Link
                            key={fav.id}
                            href={`/cocktails/${fav.cocktail_slug}`}
                            className="flex-shrink-0 w-32 group"
                          >
                            <Image
                              src={imageUrl}
                              alt={fav.cocktail_name || "Cocktail"}
                              width={128}
                              height={96}
                              className="w-32 h-24 rounded-2xl object-cover mb-2"
                              onError={(e) => {
                                e.currentTarget.src = PLACEHOLDER_IMAGE;
                              }}
                            />
                            <p className="text-sm text-forest group-hover:text-terracotta truncate transition-colors">
                              {formatCocktailName(fav.cocktail_name || "Cocktail")}
                            </p>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sage text-sm">
                      Save cocktails you like to see them here.
                    </p>
                  )}
                </div>
              </section>

              {!notesLoading && cocktailNotes.length > 0 ? (
                <section className="card overflow-hidden order-5 md:order-none">
                  <div className="flex items-center justify-between p-6 border-b border-mist">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-forest/10 rounded-xl flex items-center justify-center">
                        <PencilSquareIcon className="w-5 h-5 text-forest" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-forest">
                        Your notes
                      </h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                      {cocktailNotes.slice(0, 8).map((note) => {
                        const storedImageUrl = note.cocktail_image_url;
                        const imageUrl =
                          storedImageUrl && storedImageUrl.trim()
                            ? storedImageUrl.trim()
                            : PLACEHOLDER_IMAGE;

                        return (
                          <div key={note.id} className="flex-shrink-0 w-40">
                            {note.cocktail_slug ? (
                              <Link href={`/cocktails/${note.cocktail_slug}`} className="group block">
                                <Image
                                  src={imageUrl}
                                  alt={note.cocktail_name || "Cocktail"}
                                  width={160}
                                  height={96}
                                  className="w-40 h-24 rounded-2xl object-cover mb-2"
                                />
                                <p className="text-sm text-forest group-hover:text-terracotta truncate transition-colors">
                                  {formatCocktailName(note.cocktail_name || "Cocktail")}
                                </p>
                              </Link>
                            ) : (
                              <>
                                <Image
                                  src={imageUrl}
                                  alt={note.cocktail_name || "Cocktail"}
                                  width={160}
                                  height={96}
                                  className="w-40 h-24 rounded-2xl object-cover mb-2"
                                />
                                <p className="text-sm text-forest truncate">
                                  {formatCocktailName(note.cocktail_name || "Cocktail")}
                                </p>
                              </>
                            )}
                            <p className="text-xs text-sage line-clamp-3 mt-1">{note.notes}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              ) : null}

              {!recentLoading && recentlyViewed.length > 0 ? (
                <section className="card overflow-hidden order-6 md:order-none">
                  <div className="flex items-center justify-between p-6 border-b border-mist">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-forest/10 rounded-xl flex items-center justify-center">
                        <ClockIcon className="w-5 h-5 text-sage" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-forest">
                        Recently Viewed
                      </h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                      {recentlyViewed.slice(0, 6).map((item) => {
                        const supabaseImageUrl = recentImageUrls.get(item.cocktail_id);
                        const storedImageUrl = item.cocktail_image_url;
                        const imageUrl =
                          (supabaseImageUrl && supabaseImageUrl.trim() ? supabaseImageUrl.trim() : null) ||
                          (storedImageUrl && storedImageUrl.trim() ? storedImageUrl.trim() : null) ||
                          PLACEHOLDER_IMAGE;

                        return (
                          <Link
                            key={item.id}
                            href={`/cocktails/${item.cocktail_slug}`}
                            className="flex-shrink-0 w-32 group"
                          >
                            <Image
                              src={imageUrl}
                              alt={item.cocktail_name || "Cocktail"}
                              width={128}
                              height={96}
                              className="w-32 h-24 rounded-2xl object-cover mb-2"
                              onError={(e) => {
                                e.currentTarget.src = PLACEHOLDER_IMAGE;
                              }}
                            />
                            <p className="text-sm text-forest group-hover:text-terracotta truncate transition-colors">
                              {formatCocktailName(item.cocktail_name || "Cocktail")}
                            </p>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </section>
              ) : null}
            </div>

            <div className="contents md:flex md:flex-col md:gap-6">
              <DashboardEngagementSidebar />
              <section className="card overflow-hidden order-2 md:order-none">
                <div className="flex items-center justify-between p-6 border-b border-mist">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-olive/20 rounded-xl flex items-center justify-center">
                      <BeakerIcon className="w-5 h-5 text-olive" />
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-bold text-forest">
                        My Bar
                      </h2>
                      <span className="text-sm text-sage block min-h-[1.25rem]">
                        {barLoading ? "Loading..." : `${ingredientIds.length} ingredient${ingredientIds.length !== 1 ? "s" : ""}`}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/mix"
                    className="px-4 py-2 text-sm text-terracotta hover:text-terracotta-dark hover:bg-terracotta/10 rounded-xl transition-colors font-medium"
                  >
                    Add
                  </Link>
                </div>
                <div className="p-6">
                  {barLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-cream rounded-xl animate-pulse">
                          <div className="w-8 h-8 bg-mist rounded-lg" />
                          <div className="flex-1 h-4 bg-mist rounded" />
                        </div>
                      ))}
                    </div>
                  ) : ingredientIds.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-mist rounded-full flex items-center justify-center mx-auto mb-4">
                        <BeakerIcon className="w-8 h-8 text-sage" />
                      </div>
                      <p className="text-sage mb-4">Your bar is empty.</p>
                      <Link
                        href="/mix"
                        className="text-terracotta hover:text-terracotta-dark font-medium"
                      >
                        Add your first ingredient →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
                      {ingredientIds.map((id) => {
                        const ingredient = allIngredients.find(i => String(i.id) === String(id));

                        if (process.env.NODE_ENV === 'development') {
                          debugLog(`[DASHBOARD] Looking for ingredient ID ${id} (type: ${typeof id})`);
                          debugLog(`[DASHBOARD] Found ingredient:`, ingredient ? `${ingredient.name} (${ingredient.id})` : 'NOT FOUND');
                        }

                        return (
                          <div
                            key={id}
                            className="flex items-center justify-between px-4 py-3 bg-cream rounded-xl text-sm group"
                          >
                            <span className="text-forest">
                              {ingredient?.name || id}
                            </span>
                            <button
                              onClick={() => handleRemoveFromInventory(id)}
                              className="text-sage hover:text-terracotta opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

              <div className="order-7 md:order-none">
                {nativeShell ? null : <DashboardLearnCard />}
              </div>

              {!skipsLoading && skips.length > 0 ? (
                <div className="order-8 md:order-none px-1">
                  <button
                    type="button"
                    onClick={() => setSkipsExpanded((open) => !open)}
                    className="flex items-center gap-1 text-sm text-sage hover:text-forest transition-colors"
                    aria-expanded={skipsExpanded}
                  >
                    {skips.length} drink{skips.length !== 1 ? "s" : ""} hidden from Mix
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform ${skipsExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                  {skipsExpanded ? (
                    <ul className="mt-3 space-y-2">
                      {skips.map((skip) => (
                        <li
                          key={skip.id}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          {skip.cocktail_slug ? (
                            <Link
                              href={`/cocktails/${skip.cocktail_slug}`}
                              className="text-forest hover:text-terracotta truncate"
                            >
                              {formatCocktailName(skip.cocktail_name || "Cocktail")}
                            </Link>
                          ) : (
                            <span className="text-forest truncate">
                              {formatCocktailName(skip.cocktail_name || "Cocktail")}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => unskipCocktail(skip.cocktail_id)}
                            className="shrink-0 text-xs font-medium text-terracotta hover:text-terracotta-dark"
                          >
                            Restore
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </MainContainer>
      </div>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    return (
      <div className="py-12 bg-cream min-h-screen">
        <MainContainer>
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XMarkIcon className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-display font-bold text-forest mb-3">
              Something went wrong
            </h1>
            <p className="text-sage mb-8 max-w-md mx-auto">
              We encountered an error loading your dashboard. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream rounded-xl font-medium"
            >
              Refresh Page
            </button>
          </div>
        </MainContainer>
      </div>
    );
  }
}
