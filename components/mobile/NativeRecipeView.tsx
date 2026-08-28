"use client";

import { useRouter } from "next/navigation";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  ShareIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { formatCocktailName, isNewCocktail } from "@/lib/formatters";
import { scaleIngredientLines } from "@/lib/scaleRecipe";
import { nativePhotoUrl } from "@/lib/mobile/nativeImage";
import { cacheRecipeDetail } from "@/lib/mobile/offlineSync";
import { NativeDrinkTile } from "@/components/mobile/NativeDrinkTile";
import { AppLink } from "@/components/mobile/AppLink";
import { navigateInApp } from "@/lib/mobile/navigate";
import { consumeMixRecipeReturn, peekMixRecipeReturn } from "@/lib/mobile/mixPourSession";
import { FavoriteButton } from "@/components/cocktails/FavoriteButton";
import { NoteButton } from "@/components/cocktails/NoteButton";
import { SkipButton } from "@/components/cocktails/SkipButton";
import { IngredientAvailability } from "@/components/cocktails/IngredientAvailability";
import { InstructionStepText } from "@/components/cocktails/InstructionStepText";
import { TechniqueCue } from "@/components/cocktails/TechniqueCue";
import { ComingSoonCocktailImage } from "@/components/cocktails/ComingSoonCocktailImage";
import { useRecordCocktailView } from "@/hooks/useRecentlyViewed";
import { trackGuestRecipeView } from "@/lib/mobile/guestEngagement";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { useToast } from "@/components/ui/toast";
import { getSupabaseClient } from "@/lib/supabase/client";
import { awardSharingBadge, checkExplorationBadges } from "@/lib/badgeEngine";
import { notifyBadgesUpdated } from "@/hooks/useUserBadges";
import { markDrinkMade, hasMixedCocktail } from "@/lib/mobile/pourStreak";
import {
  hasSeenFirstPourShare,
  markFirstPourShareSeen,
} from "@/lib/mobile/firstPourShare";
import { useEffect, useRef, useState } from "react";
import type { MatchedIngredient } from "@/lib/ingredientMatching";
import { findWholePhraseIndex } from "@/lib/ingredientMatching";
import { withShareUtm } from "@/lib/analytics/utm";
import { CocktailStoriesShare } from "@/components/share/CocktailStoriesShare";
import { FirstPourShareSpotlight } from "@/components/mobile/FirstPourShareSpotlight";
import { useNativeStatusBar } from "@/hooks/useNativeStatusBar";

interface NativeRecipeViewProps {
  cocktail: {
    id: string;
    name: string;
    slug: string;
    short_description?: string | null;
    long_description?: string | null;
    base_spirit?: string | null;
    category_primary?: string | null;
    glassware?: string | null;
    technique?: string | null;
    image_url?: string | null;
    notes?: string | null;
    created_at?: string | null;
    metadata_json?: {
      is_community_favorite?: boolean;
      is_mixwise_original?: boolean;
    };
    categories_all?: string[] | null;
  };
  name: string;
  ingredients: Array<{ text: string }>;
  matchedIngredients?: MatchedIngredient[];
  instructionSteps: string[];
  imageUrl: string | null;
  similarRecipes: Array<{
    id: string;
    name: string;
    slug: string;
    short_description?: string | null;
    image_url?: string | null;
  }>;
  shoppingListIngredients: Array<{ id: string; name: string; category?: string }>;
  bestFor?: string[];
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function IngredientLine({
  text,
  matched,
}: {
  text: string;
  matched?: MatchedIngredient;
}) {
  if (!matched?.name) {
    return <span className="min-w-0 flex-1 leading-5">{text}</span>;
  }
  const idx = findWholePhraseIndex(text, matched.name);
  if (idx < 0) return <span className="min-w-0 flex-1 leading-5">{text}</span>;
  return (
    <span className="min-w-0 flex-1 leading-5">
      {text.slice(0, idx)}
      <span className="font-medium">{text.slice(idx, idx + matched.name.length)}</span>
      {text.slice(idx + matched.name.length)}
    </span>
  );
}

function SpecCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-3 py-2">
      <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-sage">{label}</dt>
      <dd className="mt-0.5 font-display text-sm font-bold leading-snug text-forest">{value}</dd>
    </div>
  );
}

export function NativeRecipeView({
  cocktail,
  name,
  ingredients,
  matchedIngredients,
  instructionSteps,
  imageUrl,
  similarRecipes,
  shoppingListIngredients,
  bestFor,
}: NativeRecipeViewProps) {
  const router = useRouter();
  const recordView = useRecordCocktailView();
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const { openAuthDialog } = useAuthDialog();
  const toast = useToast();
  const [quantity, setQuantity] = useState(1);
  const [pouredToday, setPouredToday] = useState(false);
  const [showShareSpotlight, setShowShareSpotlight] = useState(false);
  const sharePanelRef = useRef<HTMLDivElement>(null);
  const scaledIngredients = scaleIngredientLines(ingredients, quantity);

  useEffect(() => {
    setPouredToday(hasMixedCocktail(cocktail.slug));
    setShowShareSpotlight(false);
  }, [cocktail.slug]);

  useNativeStatusBar("photo");

  useEffect(() => {
    if (!showShareSpotlight) return;
    const t = window.setTimeout(() => {
      sharePanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [showShareSpotlight]);

  const dismissShareSpotlight = () => {
    markFirstPourShareSeen();
    setShowShareSpotlight(false);
  };

  useEffect(() => {
    recordView({
      id: cocktail.id,
      name: cocktail.name,
      slug: cocktail.slug,
      imageUrl: cocktail.image_url ?? undefined,
    });
    trackGuestRecipeView(cocktail.slug);
    void cacheRecipeDetail(cocktail.slug, cocktail);
  }, [cocktail, recordView]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const supabase = getSupabaseClient();
    void checkExplorationBadges(supabase, user.id, {
      primarySpirit: cocktail.base_spirit || undefined,
      categories: cocktail.categories_all || undefined,
    }).then((result) => {
      result.awarded.forEach((badge) => {
        toast.success(`${badge.icon} ${badge.name} unlocked`);
      });
      if (result.awarded.length > 0) notifyBadgesUpdated();
    });
  }, [cocktail.base_spirit, cocktail.categories_all, isAuthenticated, toast, user]);

  const pills = [
    cocktail.base_spirit && titleCase(cocktail.base_spirit),
    cocktail.category_primary && titleCase(cocktail.category_primary),
    cocktail.glassware && titleCase(cocktail.glassware),
    cocktail.technique && titleCase(cocktail.technique),
  ].filter((value): value is string => Boolean(value));

  const shareRecipe = async () => {
    const url = withShareUtm(
      `${window.location.origin}/cocktails/${cocktail.slug}`,
      {
        medium: Capacitor.isNativePlatform() ? "native_share" : "web_share",
        content: cocktail.slug,
      }
    );
    const title = `${formatCocktailName(name)} cocktail`;
    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({ title, url, dialogTitle: title });
      } else if (navigator.share) {
        await navigator.share({ title, url });
      }
      if (user) {
        const supabase = getSupabaseClient();
        const result = await awardSharingBadge(supabase, user.id, "cocktail");
        result.awarded.forEach((badge) => {
          toast.success(`${badge.icon} ${badge.name} unlocked`);
        });
        if (result.awarded.length > 0) notifyBadgesUpdated();
      }
    } catch {
      /* cancelled */
    }
  };

  const goBack = () => {
    const params =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    const from = params?.get("from");
    const browse = params?.get("browse");
    const fromMix = from === "mix" || peekMixRecipeReturn();

    if (fromMix) {
      // Always go to Mix explicitly — history.back() often returns to Search
      // when Search was visited earlier in the WebView session.
      consumeMixRecipeReturn();
      router.replace("/mix?step=menu", { scroll: false });
      return;
    }

    if (from === "search") {
      const tab =
        browse === "collections" || browse === "recipes"
          ? browse
          : (() => {
              try {
                const saved = sessionStorage.getItem("mixwise-cocktails-filters");
                if (saved) {
                  const state = JSON.parse(saved) as { browseTab?: string };
                  if (state.browseTab === "recipes" || state.browseTab === "collections") {
                    return state.browseTab;
                  }
                }
              } catch {
                /* ignore */
              }
              return "recipes";
            })();
      router.push(`/cocktails?browse=${tab}`, { scroll: false });
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("mixwise-cocktails-filters");
        if (saved) {
          const state = JSON.parse(saved) as { browseTab?: string };
          if (state.browseTab === "recipes" || state.browseTab === "collections") {
            router.push(`/cocktails?browse=${state.browseTab}`, { scroll: false });
            return;
          }
        }
      } catch {
        /* ignore */
      }
    }
    router.push("/cocktails", { scroll: false });
  };

  return (
    <article data-native-recipe className="native-recipe-root relative -mx-4 sm:-mx-6">
      <header className="native-recipe-hero relative overflow-hidden bg-charcoal">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={nativePhotoUrl(imageUrl, 828) || imageUrl}
            alt={formatCocktailName(name)}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <ComingSoonCocktailImage name={name} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-black/20" />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-32 bg-gradient-to-b from-black/70 via-black/35 to-transparent md:h-36"
          aria-hidden
        />

        <div
          className="native-recipe-hero__toolbar absolute inset-x-0 top-0 z-10 flex items-center justify-between"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.5rem)" }}
        >
          <button
            type="button"
            onClick={goBack}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-cream backdrop-blur-md"
            aria-label="Back"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <FavoriteButton
              cocktail={{
                id: cocktail.id,
                name: cocktail.name,
                slug: cocktail.slug,
                imageUrl: cocktail.image_url ?? undefined,
              }}
              size="md"
              className="!rounded-full !bg-black/35 !text-cream backdrop-blur-md hover:!bg-black/50 !p-2.5"
            />
            <button
              type="button"
              onClick={shareRecipe}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-cream backdrop-blur-md"
              aria-label="Share recipe"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="native-recipe-hero__copy absolute inset-x-0 bottom-0 z-10 pb-6">
          {isNewCocktail(cocktail.created_at) && (
            <span className="mb-2 inline-flex rounded-full bg-terracotta px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-cream">
              New
            </span>
          )}
          <h1 className="font-display text-[2.15rem] font-bold leading-[1.05] text-cream drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] [text-wrap:balance]">
            {formatCocktailName(name)}
          </h1>
        </div>
      </header>

      <div className="native-recipe-body native-frame pt-5 pb-8">
        {cocktail.short_description && (
          <p className="mb-4 text-[17px] font-medium leading-snug text-forest">
            {cocktail.short_description}
          </p>
        )}

        {Capacitor.isNativePlatform() && (
          <div className="mb-5 space-y-3">
            <button
              type="button"
              onClick={() => {
                const alreadySeenShare = hasSeenFirstPourShare();
                const { streak, isNewToday, isNewForCocktail } = markDrinkMade(cocktail.slug);
                setPouredToday(true);
                const shouldSpotlight = isNewForCocktail && !alreadySeenShare;
                if (shouldSpotlight) {
                  markFirstPourShareSeen();
                  setShowShareSpotlight(true);
                } else if (isNewToday) {
                  toast.success(
                    streak > 1 ? `${streak}-day pour streak!` : "Nice pour — streak started"
                  );
                } else if (!isNewForCocktail) {
                  toast.info("Already marked this one as mixed");
                } else {
                  toast.success("Nice pour");
                }
              }}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-colors ${
                pouredToday
                  ? "bg-forest/10 text-forest"
                  : "bg-terracotta text-cream active:scale-[0.98]"
              }`}
            >
              {pouredToday ? "✓ Mixed" : "I mixed this"}
            </button>
            {pouredToday && (
              <div className="relative">
                {showShareSpotlight && (
                  <>
                    <button
                      type="button"
                      aria-label="Dismiss share tip"
                      onClick={dismissShareSpotlight}
                      className="fixed inset-0 z-[80] bg-charcoal/50"
                    />
                    <FirstPourShareSpotlight onDismiss={dismissShareSpotlight} />
                  </>
                )}
                <div
                  ref={sharePanelRef}
                  className={`rounded-2xl border border-mist bg-cream p-3.5 ${
                    showShareSpotlight
                      ? "relative z-[81] ring-2 ring-terracotta ring-offset-2 ring-offset-cream shadow-2xl shadow-charcoal/25"
                      : "bg-cream/80"
                  }`}
                >
                  <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-sage">
                    Share your pour
                  </p>
                  <CocktailStoriesShare
                    variant="mixed"
                    className="flex w-full flex-wrap items-center justify-evenly gap-2"
                    cocktail={{
                      name: cocktail.name,
                      slug: cocktail.slug,
                      imageUrl: cocktail.image_url,
                      primarySpirit: cocktail.base_spirit,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {pills.length > 0 && (
          <dl className="mb-5 grid grid-cols-2 gap-2">
            {cocktail.base_spirit && (
              <SpecCell label="Spirit" value={titleCase(cocktail.base_spirit)} />
            )}
            {cocktail.category_primary && (
              <SpecCell label="Style" value={titleCase(cocktail.category_primary)} />
            )}
            {cocktail.glassware && (
              <SpecCell label="Glass" value={titleCase(cocktail.glassware)} />
            )}
            {cocktail.technique && (
              <SpecCell label="Method" value={titleCase(cocktail.technique)} />
            )}
          </dl>
        )}

        {cocktail.long_description && (
          <p className="mb-6 text-[15px] leading-relaxed text-charcoal">
            {cocktail.long_description}
          </p>
        )}

        {(bestFor && bestFor.length > 0) || cocktail.notes ? (
          <section className="mb-6 space-y-3">
            {bestFor && bestFor.length > 0 && (
              <div>
                <h2 className="mb-2 font-display text-lg font-bold text-forest">Best for</h2>
                <div className="mw-pill-row flex flex-wrap gap-2">
                  {bestFor.map((tag) => (
                    <span key={tag} className="mw-pill mw-pill--meta">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {cocktail.notes && (
              <div className="rounded-2xl bg-white p-4">
                <h3 className="mb-1.5 font-display text-base font-bold text-forest">
                  Bartender&apos;s note
                </h3>
                <p className="text-[15px] leading-relaxed text-charcoal">{cocktail.notes}</p>
              </div>
            )}
          </section>
        ) : null}

        <section className="mb-8">
          <h2 className="mb-3 font-display text-xl font-bold text-forest">Ingredients</h2>
          {scaledIngredients.length === 0 ? (
            <p className="text-sm text-sage">Ingredient list isn&apos;t available yet.</p>
          ) : (
            <ul className="overflow-hidden rounded-2xl bg-white">
              {scaledIngredients.map((ing, idx) => {
                const matched = matchedIngredients?.[idx];
                const href = matched?.guideSlug ? `/ingredients/${matched.guideSlug}` : null;
                const row = (
                  <div className="flex w-full min-h-[3.25rem] items-center gap-3 px-4 text-left text-[15px] text-forest">
                    <IngredientLine text={ing.text} matched={matched} />
                    {href ? (
                      <ChevronRightIcon className="ml-auto h-4 w-4 flex-shrink-0 text-sage/45" />
                    ) : null}
                  </div>
                );
                return (
                  <li key={`${ing.text}-${idx}`} className="border-b border-mist/70 last:border-b-0">
                    {href ? (
                      <button
                        type="button"
                        className="native-recipe-ingredient-row"
                        onClick={() => navigateInApp(router, href)}
                      >
                        {row}
                      </button>
                    ) : (
                      row
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-3 flex items-center justify-end gap-1.5 text-sage">
            <span className="text-[11px] font-medium">Scale recipe</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-semibold text-forest"
              aria-label="Fewer servings"
            >
              −
            </button>
            <span className="w-4 text-center font-display text-sm font-bold text-forest">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-semibold text-forest"
              aria-label="More servings"
            >
              +
            </button>
          </div>

          {shoppingListIngredients.length > 0 && !authLoading && (
            <div className="mt-4">
              {isAuthenticated ? (
                <IngredientAvailability ingredients={shoppingListIngredients} quantity={quantity} />
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    openAuthDialog({
                      title: "Track the bottles you're missing",
                      subtitle: "Sign in to save missing ingredients to your cabinet and shopping list.",
                    })
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-terracotta py-3.5 text-sm font-bold text-cream"
                >
                  <ShoppingBagIcon className="h-4 w-4" />
                  See what you&apos;re missing
                </button>
              )}
            </div>
          )}
        </section>

        <section className="mb-8">
          <h2 className="mb-3 font-display text-xl font-bold text-forest">How to make it</h2>
          <TechniqueCue technique={cocktail.technique} />
          {instructionSteps.length === 0 ? (
            <p className="text-sm text-sage">Steps aren&apos;t listed for this recipe yet.</p>
          ) : (
            <ol className="space-y-3">
              {instructionSteps.map((step, idx) => (
                <li
                  key={idx}
                  id={`step-${idx + 1}`}
                  className="flex gap-3 rounded-2xl bg-white p-4 scroll-mt-24"
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-terracotta/12 font-display text-sm font-bold text-terracotta">
                    {idx + 1}
                  </span>
                  <div className="pt-0.5 text-[15px] leading-relaxed text-forest">
                    <InstructionStepText text={step} />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <div className="mb-8">
          <div className="flex items-stretch justify-center gap-2">
            <FavoriteButton
              cocktail={{
                id: cocktail.id,
                name: cocktail.name,
                slug: cocktail.slug,
                imageUrl: cocktail.image_url ?? undefined,
              }}
              size="md"
              showLabel
              className="flex flex-1 items-center justify-center rounded-2xl bg-white px-3 py-3"
            />
            <NoteButton
              cocktail={{
                id: cocktail.id,
                name: cocktail.name,
                slug: cocktail.slug,
                imageUrl: cocktail.image_url ?? undefined,
              }}
              size="md"
              showLabel
              className="flex flex-1 items-center justify-center rounded-2xl bg-white px-3 py-3"
            />
            <SkipButton
              cocktail={{
                id: cocktail.id,
                name: cocktail.name,
                slug: cocktail.slug,
                imageUrl: cocktail.image_url ?? undefined,
              }}
              size="md"
              showLabel
              className="flex flex-1 items-center justify-center rounded-2xl bg-white px-3 py-3"
            />
          </div>
          <AppLink
            href="/saved"
            className="mt-3 flex items-center justify-center gap-1.5 py-1 text-sm font-semibold text-sage"
          >
            <HeartIcon className="h-4 w-4 text-terracotta" />
            Favorites
          </AppLink>
        </div>

        {similarRecipes.length > 0 && (
          <section>
            <h2 className="mb-3 font-display text-xl font-bold text-forest">More like this</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {similarRecipes.slice(0, 8).map((recipe) => (
                <NativeDrinkTile
                  key={recipe.id}
                  href={`/cocktails/${recipe.slug}`}
                  name={recipe.name}
                  imageUrl={recipe.image_url}
                  photoHeight={144}
                  className="w-36 shrink-0 snap-start"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
