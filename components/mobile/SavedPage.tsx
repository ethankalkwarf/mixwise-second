"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { getCocktailImageUrls } from "@/lib/cocktails.client";
import { formatCocktailName } from "@/lib/formatters";
import { trackEmptyStateSeen } from "@/lib/analytics";
import { PrivateBarSetting } from "@/components/account/PrivateBarSetting";
import { FavoriteDrinkRow } from "@/components/bar/FavoriteDrinkRow";
import {
  HeartIcon,
  ClockIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  Cog6ToothIcon,
  TrophyIcon,
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
  QuestionMarkCircleIcon,
  BeakerIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  SparklesIcon,
  Squares2X2Icon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { NotificationSettings } from "@/components/mobile/NotificationSettings";
import { BiometricSettings } from "@/components/mobile/BiometricSettings";
import { OfflineDataSettings } from "@/components/mobile/OfflineDataSettings";
import { PullToRefreshContainer } from "@/components/mobile/PullToRefreshContainer";
import { refreshNativeShellData } from "@/lib/mobile/refreshNativeData";
import { AppLink } from "@/components/mobile/AppLink";
import { ShareBarButton } from "@/components/bar/ShareBarButton";
import { NativeYouSocialSection } from "@/components/mobile/NativeYouSocialSection";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { usePreferredAuthMode } from "@/lib/auth/returning-user";
import { replayNativeIntro } from "@/lib/mobile/nativeIntro";
import { navigateInApp } from "@/lib/mobile/navigate";
import { NativeNamePrompt, currentGivenName } from "@/components/mobile/NativeNamePrompt";
import { TabBarSettings } from "@/components/mobile/TabBarSettings";

export function SavedPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] bg-cream" />}>
      <SavedPageContent />
    </Suspense>
  );
}

function SavedPageContent() {
  const searchParams = useSearchParams();
  const { favorites, isLoading: favsLoading } = useFavorites();
  const { recentlyViewed, isLoading: recentLoading } = useRecentlyViewed();
  const { ingredientIds } = useBarIngredients();
  const { profile, user, isAuthenticated } = useUser();
  const { openAuthDialog } = useAuthDialog();
  const preferredAuthMode = usePreferredAuthMode();
  const [activeTab, setActiveTab] = useState<"favorites" | "recent" | "bar">("favorites");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "favorites" || tab === "recent" || tab === "bar") {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [settingsView, setSettingsView] = useState<"closed" | "main" | "tabBar">("closed");
  const settingsOpen = settingsView !== "closed";
  const givenName = currentGivenName({
    firstName: profile?.first_name,
    displayName: profile?.display_name,
    email: user?.email,
  });

  const tabs = [
    { id: "favorites" as const, label: "Favorites", icon: HeartIcon, count: favorites.length },
    { id: "recent" as const, label: "Recent", icon: ClockIcon, count: recentlyViewed.length },
    { id: "bar" as const, label: "My Bar", icon: ShoppingBagIcon, count: ingredientIds.length },
  ];

  return (
    <PullToRefreshContainer
      className="bg-gradient-to-b from-cream via-cream to-mist/30 pb-8"
      onRefresh={async () => {
        await refreshNativeShellData();
      }}
    >
      <div
        className="sticky z-10 border-b border-mist/40 bg-cream/95 backdrop-blur-xl"
        style={{
          top: 0,
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)",
        }}
      >
        <div className="px-4 pb-2">
          {settingsOpen ? (
            <div className="mb-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setSettingsView((view) => (view === "tabBar" ? "main" : "closed"))
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-mist/70 text-forest"
                aria-label="Back"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h1 className="font-display text-2xl font-bold text-forest">
                {settingsView === "tabBar" ? "Tab bar" : "Settings"}
              </h1>
            </div>
          ) : (
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="font-display text-2xl font-bold text-forest">You</h1>
                {givenName ? (
                  <p className="mt-0.5 text-sm text-sage">Hi, {givenName}</p>
                ) : (
                  <p className="mt-0.5 text-sm text-sage">Your saves, bar, and profile</p>
                )}
              </div>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setSettingsView("main")}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-forest shadow-sm"
                  aria-label="Settings"
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthDialog({ mode: preferredAuthMode })}
                  className="flex-shrink-0 rounded-full bg-terracotta px-3.5 py-2 text-sm font-bold text-cream shadow-sm"
                >
                  Log in or join
                </button>
              )}
            </div>
          )}

          {!settingsOpen ? (
            <div className="flex gap-2 overflow-x-auto overscroll-x-contain scrollbar-hide -mx-4 px-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      native-compact-cta inline-flex h-9 items-center gap-1.5 rounded-2xl px-3.5 text-sm font-semibold whitespace-nowrap
                      transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta
                      ${
                        isActive
                          ? "bg-terracotta text-cream"
                          : "bg-white/70 text-sage active:bg-white"
                      }
                    `}
                  >
                    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="leading-none">{tab.label}</span>
                    {tab.count > 0 && (
                      <span
                        className={`
                      shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none
                      ${isActive ? "bg-cream/20 text-cream" : "bg-terracotta/10 text-terracotta"}
                    `}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      <div className="px-4 pt-6">
        {settingsView === "tabBar" ? (
          <TabBarSettings />
        ) : settingsView === "main" ? (
          <SettingsScreen onOpenTabBar={() => setSettingsView("tabBar")} />
        ) : (
          <>
            <NativeNamePrompt />

            {/* Tab content first — so Favorites/Recent/My Bar match the selected chip */}
            <div className="mb-8">
              {activeTab === "favorites" && <FavoritesTab favorites={favorites} loading={favsLoading} />}
              {activeTab === "recent" && <RecentTab recent={recentlyViewed} loading={recentLoading} />}
              {activeTab === "bar" && <BarTab />}
            </div>

            {/* Social — friends + public bar in one hub */}
            {isAuthenticated ? <NativeYouSocialSection /> : null}

            <YouGroupedSection title="Explore">
              <ExploreRow
                href="/cocktail-of-the-day"
                icon={SparklesIcon}
                label="Drink of the Day"
                description="Today's featured pour"
              />
              <ExploreRow
                href="/cocktails?browse=collections"
                icon={CalendarDaysIcon}
                label="Collections"
                description="Seasons, holidays, and styles"
              />
              <ExploreRow
                href="/learn"
                icon={BookOpenIcon}
                label="Learn"
                description="Guides, methods, and paths"
              />
              <ExploreRow
                href="/ingredients"
                icon={BeakerIcon}
                label="Ingredients"
                description="Guides and bottle picks"
              />
              <ExploreRow
                href="/shopping-list"
                icon={ShoppingBagIcon}
                label="Shopping list"
                description="What to pick up next"
              />
              <ExploreRow
                href="/badges"
                icon={TrophyIcon}
                label="Badges"
                description="See what you've earned"
              />
              <ExploreRow
                href="/contact"
                icon={ChatBubbleLeftRightIcon}
                label="Contact us"
                description="Questions, feedback, or ideas"
              />
            </YouGroupedSection>
          </>
        )}
      </div>
    </PullToRefreshContainer>
  );
}

function YouGroupedSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-6">
      <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-sage">
        {title}
      </p>
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">{children}</div>
    </section>
  );
}

function ExploreRow({
  href,
  icon: Icon,
  label,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}) {
  return (
    <AppLink
      href={href}
      className="native-menu-row flex w-full min-h-[3.25rem] items-center gap-3 border-t border-mist/70 px-4 py-3 text-left first:border-t-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta active:bg-mist/30"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cream text-forest">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-tight text-forest">{label}</span>
        <span className="mt-0.5 block text-xs leading-snug text-sage">{description}</span>
      </span>
      <ArrowRightIcon className="h-4 w-4 shrink-0 text-sage/60" />
    </AppLink>
  );
}

function useLiveCocktailImages(
  items: { cocktail_id: string; cocktail_image_url?: string | null }[],
  loading: boolean
) {
  const [imageUrls, setImageUrls] = useState<Map<string, string | null>>(() => new Map());
  const idsKey = items.map((item) => item.cocktail_id).join("|");

  useEffect(() => {
    if (loading || !idsKey) {
      setImageUrls(new Map());
      return;
    }

    let cancelled = false;
    const cocktailIds = idsKey.split("|");

    void getCocktailImageUrls(cocktailIds)
      .then((urls) => {
        if (!cancelled) setImageUrls(urls);
      })
      .catch((error) => {
        console.error("Error fetching cocktail images:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [idsKey, loading]);

  return imageUrls;
}

function resolveCocktailImageUrl(
  cocktailId: string,
  storedUrl: string | null | undefined,
  liveUrls: Map<string, string | null>
) {
  const live = liveUrls.get(cocktailId);
  const liveTrimmed = live?.trim() || null;
  const storedTrimmed = storedUrl?.trim() || null;
  return liveTrimmed || storedTrimmed;
}

const FAVORITES_PREVIEW = 8;

function FavoritesTab({ favorites, loading }: { favorites: any[]; loading: boolean }) {
  const liveImageUrls = useLiveCocktailImages(favorites, loading);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!loading && favorites.length === 0) {
      void trackEmptyStateSeen("saved_favorites");
    }
  }, [loading, favorites.length]);

  if (loading) {
    return <div className="text-center py-12 text-sage">Loading...</div>;
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <HeartIcon className="w-16 h-16 text-sage/30 mx-auto mb-4" />
        <h3 className="text-lg font-display font-bold text-forest mb-2">No favorites yet</h3>
        <p className="text-sm text-sage mb-6">Start exploring and save cocktails you love</p>
        <AppLink
          href="/cocktails"
          className="inline-flex items-center gap-2 bg-terracotta text-cream px-6 py-3 rounded-2xl font-bold text-sm shadow-lg"
        >
          Discover Cocktails <ArrowRightIcon className="w-4 h-4" />
        </AppLink>
      </div>
    );
  }

  const shown =
    expanded || favorites.length <= FAVORITES_PREVIEW
      ? favorites
      : favorites.slice(0, FAVORITES_PREVIEW);
  const hiddenCount = favorites.length - shown.length;

  return (
    <div className="space-y-2">
      {shown.map((fav) => (
        <FavoriteDrinkRow
          key={fav.cocktail_id}
          href={`/cocktails/${fav.cocktail_slug || fav.cocktail_id}`}
          name={formatCocktailName(fav.cocktail_name || "Cocktail")}
          imageUrl={resolveCocktailImageUrl(
            fav.cocktail_id,
            fav.cocktail_image_url,
            liveImageUrls
          )}
          subtitle="Saved favorite"
        />
      ))}
      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex w-full items-center justify-center gap-1 rounded-2xl border border-mist bg-white px-4 py-3 text-sm font-semibold text-terracotta"
        >
          View all {favorites.length} favorites
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      ) : null}
      {expanded && favorites.length > FAVORITES_PREVIEW ? (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="flex w-full items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium text-sage"
        >
          Show less
        </button>
      ) : null}
    </div>
  );
}

function RecentTab({ recent, loading }: { recent: any[]; loading: boolean }) {
  const liveImageUrls = useLiveCocktailImages(recent, loading);

  if (loading) {
    return <div className="text-center py-12 text-sage">Loading...</div>;
  }

  if (recent.length === 0) {
    return (
      <div className="text-center py-12">
        <ClockIcon className="w-16 h-16 text-sage/30 mx-auto mb-4" />
        <h3 className="text-lg font-display font-bold text-forest mb-2">No recent views</h3>
        <p className="text-sm text-sage">Cocktails you view will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recent.map((item) => (
        <FavoriteDrinkRow
          key={item.cocktail_id}
          href={`/cocktails/${item.cocktail_slug || item.cocktail_id}`}
          name={formatCocktailName(item.cocktail_name || "Cocktail")}
          imageUrl={resolveCocktailImageUrl(
            item.cocktail_id,
            item.cocktail_image_url,
            liveImageUrls
          )}
          subtitle="Recently viewed"
        />
      ))}
    </div>
  );
}

function BarTab() {
  const { ingredients, ingredientIds, isLoading, removeIngredient } = useBarIngredients();

  if (isLoading) {
    return <div className="text-center py-12 text-sage">Loading...</div>;
  }

  return (
    <div>
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-md p-6 mb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-lg font-display font-bold text-forest mb-1">Your Bar</h3>
            <p className="text-sm text-sage">
              {ingredientIds.length} {ingredientIds.length === 1 ? "bottle" : "bottles"}
            </p>
          </div>
          <AppLink
            href="/mix?shelf=1"
            className="px-4 py-2 bg-terracotta text-cream rounded-xl font-semibold text-sm shadow-lg"
          >
            Manage
          </AppLink>
        </div>
      </div>

      {ingredientIds.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBagIcon className="w-16 h-16 text-sage/30 mx-auto mb-4" />
          <h3 className="text-lg font-display font-bold text-forest mb-2">No ingredients yet</h3>
          <p className="text-sm text-sage mb-6">Add ingredients to discover cocktails</p>
          <AppLink
            href="/mix"
            className="inline-flex items-center gap-2 bg-terracotta text-cream px-6 py-3 rounded-2xl font-bold text-sm shadow-lg"
          >
            Build Your Bar <ArrowRightIcon className="w-4 h-4" />
          </AppLink>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-md divide-y divide-mist/70">
          {[...ingredients]
            .sort((a, b) => (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" }))
            .map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-cream text-forest">
                <BeakerIcon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 font-medium text-forest truncate">
                {item.name || "Ingredient"}
              </span>
              <button
                type="button"
                onClick={() => void removeIngredient(item.id)}
                className="flex-shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-sage hover:bg-mist hover:text-terracotta"
                aria-label={`Remove ${item.name || "ingredient"}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SettingsScreen({ onOpenTabBar }: { onOpenTabBar: () => void }) {
  const router = useRouter();
  const { user, profile, isAuthenticated, isLoading, signOut } = useUser();
  const { openAuthDialog } = useAuthDialog();
  const preferredAuthMode = usePreferredAuthMode();
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Guest";

  const handleSignOut = async () => {
    await signOut();
    navigateInApp(router, "/");
  };

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-3xl bg-mist/60" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl bg-white p-5 text-center shadow-sm">
          <p className="font-display text-lg font-bold text-forest">Save your bar</p>
          <p className="mt-1 text-sm text-sage">
            Sign in to sync favorites, bottles, and settings across devices.
          </p>
          <button
            type="button"
            onClick={() => openAuthDialog({ mode: preferredAuthMode })}
            className="mt-4 w-full rounded-2xl bg-terracotta py-3.5 text-sm font-bold text-cream"
          >
            {preferredAuthMode === "login" ? "Log in" : "Create free account"}
          </button>
          <button
            type="button"
            onClick={() =>
              openAuthDialog({
                mode: preferredAuthMode === "login" ? "signup" : "login",
              })
            }
            className="mt-2 w-full py-2.5 text-sm font-medium text-sage"
          >
            {preferredAuthMode === "login" ? "Create a free account" : "Log in instead"}
          </button>
        </div>
        <NotificationSettings />
        <BiometricSettings />
        <OfflineDataSettings />
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <button
            type="button"
            onClick={onOpenTabBar}
            className="native-menu-row flex w-full items-center gap-3 px-4 py-3.5 text-left"
          >
            <Squares2X2Icon className="h-5 w-5 flex-shrink-0 text-sage" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-forest">Tab bar</span>
              <span className="block text-xs text-sage">Customize bottom navigation</span>
            </span>
            <ArrowRightIcon className="h-4 w-4 flex-shrink-0 text-sage" />
          </button>
        </div>
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <AppLink
            href="/contact"
            className="native-menu-row flex w-full items-center gap-3 px-4 py-3.5 text-left"
          >
            <EnvelopeIcon className="h-5 w-5 flex-shrink-0 text-sage" />
            <span className="min-w-0 flex-1 font-medium text-forest">Contact us</span>
            <ArrowRightIcon className="h-4 w-4 text-sage" />
          </AppLink>
        </div>
        <button
          type="button"
          onClick={() => replayNativeIntro()}
          className="native-menu-row flex w-full items-center gap-3 rounded-3xl bg-white px-4 py-4 text-left shadow-sm"
        >
          <QuestionMarkCircleIcon className="h-5 w-5 flex-shrink-0 text-sage" />
          <span className="min-w-0 flex-1 font-medium text-forest">How MixWise works</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl bg-white px-4 py-4 shadow-sm">
        <p className="font-display text-lg font-bold text-forest">{displayName}</p>
        <p className="truncate text-sm text-sage">{user?.email}</p>
        <AppLink
          href="/account"
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-olive"
        >
          Edit profile & featured drinks
          <ArrowRightIcon className="h-4 w-4" />
        </AppLink>
      </div>

      <div>
        <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-sage">
          Preferences
        </p>
        <div className="space-y-3">
          <NotificationSettings />
          <BiometricSettings />
          <OfflineDataSettings />
          <PrivateBarSetting className="rounded-3xl bg-white px-4 py-3.5 shadow-sm" />
        </div>
      </div>

      <div>
        <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-sage">
          App
        </p>
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <button
            type="button"
            onClick={onOpenTabBar}
            className="native-menu-row flex w-full items-center gap-3 px-4 py-3.5 text-left"
          >
            <Squares2X2Icon className="h-5 w-5 flex-shrink-0 text-sage" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-forest">Tab bar</span>
              <span className="block text-xs text-sage">Customize bottom navigation</span>
            </span>
            <ArrowRightIcon className="h-4 w-4 flex-shrink-0 text-sage" />
          </button>
          <button
            type="button"
            onClick={() => replayNativeIntro()}
            className="native-menu-row flex w-full items-center gap-3 border-t border-mist/70 px-4 py-3.5 text-left"
          >
            <QuestionMarkCircleIcon className="h-5 w-5 flex-shrink-0 text-sage" />
            <span className="min-w-0 flex-1 font-medium text-forest">How MixWise works</span>
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-sage">
          Support
        </p>
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <AppLink
            href="/contact"
            className="native-menu-row flex w-full items-center gap-3 px-4 py-3.5 text-left"
          >
            <EnvelopeIcon className="h-5 w-5 flex-shrink-0 text-sage" />
            <span className="min-w-0 flex-1 font-medium text-forest">Contact us</span>
            <ArrowRightIcon className="h-4 w-4 text-sage" />
          </AppLink>
          <ShareBarButton
            variant="menu"
            className="native-menu-row flex w-full items-center gap-3 border-t border-mist/70 px-4 py-3.5 text-left text-[15px] font-medium text-forest"
          />
          <button
            type="button"
            onClick={handleSignOut}
            className="native-menu-row flex w-full items-center gap-3 border-t border-mist/70 px-4 py-3.5 text-left"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0 text-terracotta" />
            <span className="min-w-0 flex-1 font-medium text-terracotta">Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

