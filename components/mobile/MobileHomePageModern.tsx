"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useUser } from "@/components/auth/UserProvider";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { getMixCocktailsClient } from "@/lib/cocktails";
import { getMixMatchGroups } from "@/lib/mixMatching";
import { AppLink } from "@/components/mobile/AppLink";
import { cocktailImageUrl } from "@/components/mobile/NativeCocktailImage";
import { NativeDrinkTile } from "@/components/mobile/NativeDrinkTile";
import { HomeCollectionsRail } from "@/components/mobile/HomeCollectionsRail";
import { HomeCinematicHero } from "@/components/mobile/HomeCinematicHero";
import { NativeBadgeProgressCard } from "@/components/mobile/NativeBadgeProgressCard";
import { NativeNotificationPrompt } from "@/components/mobile/NativeNotificationPrompt";
import { cacheCabinetReadyCount, readCabinetReadyCount, readHomeSessionHint, writeHomeSessionHint } from "@/lib/mobile/guestData";
import { ShakePourOverlay, type ShakeOverlayMode } from "@/components/mobile/ShakePourOverlay";
import { useShakeGesture } from "@/hooks/useShakeGesture";
import {
  getHomeContextSubtitle,
  getHomeGreetingEyebrow,
  getHomePourPrompt,
  greetingFirstName,
  readOrCreatePourPromptSessionKey,
} from "@/lib/homeHeroHeadline";
import { getIngredientOriginCover } from "@/lib/ingredientHeroes";
import type { MixCocktail } from "@/lib/mixTypes";
import type { SanityCocktail } from "@/lib/sanityTypes";

interface MobileHomePageProps {
  featuredCocktails: SanityCocktail[];
  allCocktails: SanityCocktail[];
  occasionCovers?: Record<string, string | null>;
}

const SHAKE_PREF_KEY = "mixwise-shake-granted";
const SHAKE_INTRO_KEY = "mixwise-shake-intro-seen";

/** Home spirit browse — photos match ingredient-page origin covers. */
const HOME_SPIRITS = [
  { value: "gin", slug: "gin", label: "Gin", hint: "Botanical & bright" },
  { value: "whiskey", slug: "whiskey", label: "Whiskey", hint: "Oak & warmth" },
  { value: "rum", slug: "rum", label: "Rum", hint: "Cane & spice" },
  { value: "tequila", slug: "tequila", label: "Tequila", hint: "Agave & citrus" },
  { value: "vodka", slug: "vodka", label: "Vodka", hint: "Clean & cold" },
  { value: "mezcal", slug: "mezcal", label: "Mezcal", hint: "Smoke & earth" },
] as const;

type HomeDrink = {
  name: string;
  slug: string;
  imageUrl: string | null;
  spirit?: string | null;
  createdAt?: string;
};

function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)] ?? null;
}

function hashKey(key: string): number {
  let hash = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

/** Pick a drink by day+salt+slug so growing ready lists don't reshuffle the hero. */
function pickDailyDrink<T extends { slug: string }>(items: T[], salt: string): T | null {
  if (items.length === 0) return null;
  const day = new Date().toISOString().slice(0, 10);
  const prefix = `${day}:${salt}`;
  let best: T | null = null;
  let bestScore = -1;
  for (const item of items) {
    const score = hashKey(`${prefix}:${item.slug}`);
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return best;
}

function fromMix(cocktail: MixCocktail): HomeDrink {
  return {
    name: cocktail.name,
    slug: cocktail.slug,
    imageUrl: cocktail.imageUrl || null,
    spirit: cocktail.primarySpirit,
    createdAt: cocktail.createdAt,
  };
}

function fromSanity(cocktail: SanityCocktail): HomeDrink {
  return {
    name: cocktail.name,
    slug: cocktail.slug?.current || cocktail._id,
    imageUrl: cocktailImageUrl(cocktail),
    spirit: cocktail.primarySpirit,
    createdAt: cocktail.createdAt,
  };
}

function sessionHeroDrink(
  hint: ReturnType<typeof readHomeSessionHint>
): HomeDrink | null {
  if (!hint?.heroImageUrl) return null;
  return {
    name: hint.heroName || "Tonight's pour",
    slug: hint.heroSlug || "cached",
    imageUrl: hint.heroImageUrl,
  };
}

export function MobileHomePage({
  featuredCocktails,
  allCocktails,
  occasionCovers,
}: MobileHomePageProps) {
  const router = useRouter();
  const { profile, user, isAuthenticated, isLoading: authLoading } = useUser();
  const { ingredientIds, isLoading: barLoading } = useBarIngredients();
  const [sessionHint] = useState(readHomeSessionHint);
  const [cachedReadyCount] = useState(readCabinetReadyCount);
  const [pourPromptSessionKey] = useState(readOrCreatePourPromptSessionKey);
  const [mixCocktails, setMixCocktails] = useState<MixCocktail[]>([]);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [committedHero, setCommittedHero] = useState<HomeDrink | null>(() =>
    sessionHeroDrink(readHomeSessionHint())
  );
  const heroLockedRef = useRef(false);
  const [hour, setHour] = useState(18);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayMode, setOverlayMode] = useState<ShakeOverlayMode>("listening");
  const [enablingShake, setEnablingShake] = useState(false);
  const [picked, setPicked] = useState<{
    name: string;
    slug: string;
    imageUrl: string | null;
    fromCabinet: boolean;
  } | null>(null);
  const navigating = useRef(false);
  const navTimer = useRef<number>(0);

  const signedIn = authLoading ? Boolean(sessionHint?.signedIn) : isAuthenticated;

  const firstName = useMemo(
    () => {
      if (!signedIn) return null;
      if (authLoading) return sessionHint?.firstName ?? null;
      return greetingFirstName({
        firstName: profile?.first_name,
        displayName: profile?.display_name,
        email: user?.email,
      });
    },
    [
      authLoading,
      signedIn,
      sessionHint?.firstName,
      profile?.first_name,
      profile?.display_name,
      user?.email,
    ]
  );

  const greetingEyebrow = useMemo(() => getHomeGreetingEyebrow({ hour }), [hour]);

  const pourPrompt = useMemo(
    () => getHomePourPrompt({ firstName, sessionKey: pourPromptSessionKey }),
    [firstName, pourPromptSessionKey]
  );

  useEffect(() => {
    setHour(new Date().getHours());
  }, []);

  useEffect(() => {
    void getMixCocktailsClient()
      .then((cocktails) => {
        setMixCocktails(cocktails);
      })
      .catch((error) => {
        console.warn("[MobileHome] Catalog load failed:", error);
      })
      .finally(() => {
        setCatalogLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    void StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    return () => {
      void StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    };
  }, []);

  useEffect(() => {
    return () => {
      if (navTimer.current) window.clearTimeout(navTimer.current);
    };
  }, []);

  const readyToMake = useMemo(() => {
    if (ingredientIds.length === 0 || mixCocktails.length === 0) return [];
    return getMixMatchGroups({
      cocktails: mixCocktails,
      ownedIngredientIds: ingredientIds,
      stapleIngredientIds: ["ice", "water"],
    }).ready.map((match) => match.cocktail);
  }, [ingredientIds, mixCocktails]);

  const contextSubtitle = useMemo(
    () =>
      getHomeContextSubtitle({
        barLoading,
        barCount: ingredientIds.length,
        readyCount: readyToMake.length,
      }),
    [barLoading, ingredientIds.length, readyToMake.length]
  );

  useEffect(() => {
    cacheCabinetReadyCount(readyToMake.length);
  }, [readyToMake.length]);

  const catalogDrinks = useMemo(() => {
    if (mixCocktails.length > 0) return mixCocktails.map(fromMix);
    return allCocktails.map(fromSanity);
  }, [allCocktails, mixCocktails]);

  const liveHero = useMemo(() => {
    if (readyToMake.length > 0) {
      const pick = pickDailyDrink(readyToMake, "tonight");
      return pick ? fromMix(pick) : null;
    }
    const featuredHero = featuredCocktails.map(fromSanity).find((drink) => drink.imageUrl);
    return featuredHero ?? catalogDrinks.find((drink) => drink.imageUrl) ?? catalogDrinks[0] ?? null;
  }, [catalogDrinks, featuredCocktails, readyToMake]);

  const homeSettled = !authLoading && !barLoading;
  /** Auth + bar + catalog settled enough to choose a lasting hero. */
  const heroResolved =
    homeSettled && (catalogLoaded || ingredientIds.length === 0);
  /** Confirmed empty bar — only then do we use the pour-prompt / stock CTA. */
  const emptyCabinetConfirmed = homeSettled && ingredientIds.length === 0;
  /**
   * While auth/bar are still loading, assume a cabinet if the user is signed in
   * or we have a prior session / ready-count cache. Avoids flashing the idle
   * “What’s a good pour…” line before the rotating drink hero.
   */
  const expectCabinet =
    ingredientIds.length > 0 ||
    (sessionHint?.barCount ?? 0) > 0 ||
    cachedReadyCount > 0 ||
    Boolean(sessionHint?.heroImageUrl) ||
    (signedIn && !homeSettled);

  // Commit one hero for the session: hold session/cache until matching is ready,
  // then lock the cabinet (or featured) pick so imageUrl stops thrashing.
  useEffect(() => {
    if (heroLockedRef.current) return;

    if (!heroResolved) {
      const hold = sessionHeroDrink(sessionHint);
      if (hold && (expectCabinet || !homeSettled)) {
        setCommittedHero((prev) => {
          if (prev?.imageUrl === hold.imageUrl && prev?.slug === hold.slug) return prev;
          return hold;
        });
      }
      return;
    }

    if (expectCabinet && readyToMake.length === 0 && !catalogLoaded) {
      return;
    }

    if (liveHero) {
      setCommittedHero(liveHero);
      heroLockedRef.current = true;
    }
  }, [
    catalogLoaded,
    expectCabinet,
    heroResolved,
    homeSettled,
    liveHero,
    readyToMake.length,
    sessionHint,
  ]);

  const heroDrink = useMemo(() => {
    if (committedHero) return committedHero;
    // Prefer an empty stage over a featured-drink flash while the cabinet match loads.
    if (!heroResolved && expectCabinet) return null;
    return liveHero;
  }, [committedHero, expectCabinet, heroResolved, liveHero]);

  useEffect(() => {
    if (!heroResolved || !heroLockedRef.current) return;
    writeHomeSessionHint({
      signedIn: isAuthenticated,
      firstName: isAuthenticated
        ? greetingFirstName({
            firstName: profile?.first_name,
            displayName: profile?.display_name,
            email: user?.email,
          })
        : null,
      barCount: ingredientIds.length,
      heroName: heroDrink?.name ?? null,
      heroSlug: heroDrink?.slug ?? null,
      heroImageUrl: heroDrink?.imageUrl ?? null,
    });
  }, [
    heroResolved,
    isAuthenticated,
    profile?.first_name,
    profile?.display_name,
    user?.email,
    ingredientIds.length,
    heroDrink?.name,
    heroDrink?.slug,
    heroDrink?.imageUrl,
  ]);

  const worthAPour = useMemo(() => {
    const heroSlug = heroDrink?.slug;
    const take = (drinks: HomeDrink[]) =>
      drinks.filter((drink) => Boolean(drink.imageUrl) && drink.slug !== heroSlug).slice(0, 8);

    const fromFeatured = take(featuredCocktails.map(fromSanity));
    if (fromFeatured.length >= 3) return fromFeatured;

    const fromAll = take(allCocktails.map(fromSanity));
    if (fromAll.length >= 3) return fromAll;

    return take(mixCocktails.map(fromMix));
  }, [allCocktails, featuredCocktails, mixCocktails, heroDrink?.slug]);

  const pourRail = readyToMake.slice(0, 14).map(fromMix);
  const useCabinetForShake = readyToMake.length >= 1;
  const heroFromCabinet = useMemo(() => {
    if (!homeSettled && expectCabinet) return true;
    if (!heroDrink || readyToMake.length === 0) return false;
    return readyToMake.some((cocktail) => cocktail.slug === heroDrink.slug);
  }, [heroDrink, readyToMake, homeSettled, expectCabinet]);

  const heroTitle = heroDrink?.name ?? "What are you pouring?";
  // Drink headline whenever we expect bottles; pour prompt only for empty-cabinet CTA.
  const revealName = !emptyCabinetConfirmed && expectCabinet && Boolean(heroDrink?.name);
  const showStockCta = emptyCabinetConfirmed;
  const heroKicker = revealName
    ? heroFromCabinet
      ? "From your cabinet"
      : "Tonight's pick"
    : null;

  const heroSubtitle = emptyCabinetConfirmed
    ? "Add a few bottles. We'll show every drink you can pour tonight."
    : homeSettled
      ? contextSubtitle
      : expectCabinet
        ? getHomeContextSubtitle({
            barLoading: true,
            barCount: Math.max(sessionHint?.barCount ?? 0, ingredientIds.length),
            readyCount: readyToMake.length || cachedReadyCount,
          })
        : "Add a few bottles. We'll show every drink you can pour tonight.";

  const shakeImageUrl =
    worthAPour.find((drink) => drink.imageUrl && drink.slug !== heroDrink?.slug)?.imageUrl ||
    heroDrink?.imageUrl ||
    null;
  const dailyImageUrl =
    worthAPour.find((drink) => drink.imageUrl && drink.slug !== heroDrink?.slug && drink.imageUrl !== shakeImageUrl)
      ?.imageUrl ||
    shakeImageUrl ||
    heroDrink?.imageUrl ||
    null;

  const pourRandom = useCallback(() => {
    if (navigating.current) return;

    const fromCabinet = useCabinetForShake;
    const pool = fromCabinet ? readyToMake.map(fromMix) : catalogDrinks;
    const drink = pickRandom(pool);
    if (!drink) return;

    navigating.current = true;
    setPicked({
      name: drink.name,
      slug: drink.slug,
      imageUrl: drink.imageUrl,
      fromCabinet,
    });
    setOverlayMode("result");
    try {
      navigator.vibrate?.(40);
    } catch {
      /* ignore */
    }
    navTimer.current = window.setTimeout(() => {
      router.push(`/cocktails/${drink.slug}`);
      setOverlayOpen(false);
      setPicked(null);
      navigating.current = false;
    }, 1600);
  }, [catalogDrinks, readyToMake, router, useCabinetForShake]);

  const { permission, requestPermission } = useShakeGesture(
    pourRandom,
    overlayOpen && overlayMode === "listening" && !picked
  );

  useEffect(() => {
    if (permission !== "granted") return;
    try {
      window.localStorage.setItem(SHAKE_PREF_KEY, "1");
    } catch {
      /* ignore */
    }
  }, [permission]);

  const closeOverlay = () => {
    if (navTimer.current) window.clearTimeout(navTimer.current);
    navigating.current = false;
    setOverlayOpen(false);
    setOverlayMode("listening");
    setEnablingShake(false);
    setPicked(null);
  };

  const startShake = () => {
    setPicked(null);
    navigating.current = false;
    setOverlayMode(permission !== "granted" ? "intro" : "listening");
    setOverlayOpen(true);
  };

  const enableShake = async () => {
    setEnablingShake(true);
    try {
      window.localStorage.setItem(SHAKE_INTRO_KEY, "1");
    } catch {
      /* ignore */
    }

    if (permission !== "granted") {
      await requestPermission();
    }

    setEnablingShake(false);
    setOverlayMode("listening");
  };

  const handlePickNow = () => {
    try {
      window.localStorage.setItem(SHAKE_INTRO_KEY, "1");
    } catch {
      /* ignore */
    }
    pourRandom();
  };

  const shakeLabel = useCabinetForShake
    ? `${readyToMake.length} in your cabinet`
    : "Surprise me";

  return (
    <div className="w-full min-w-0 pb-8" data-native-home>
      <ShakePourOverlay
        mode={overlayOpen ? (picked ? "result" : overlayMode) : null}
        picked={picked}
        fromCabinet={picked?.fromCabinet ?? false}
        motionDenied={permission === "denied" || permission === "unavailable"}
        enabling={enablingShake}
        onCancel={closeOverlay}
        onEnableShake={() => void enableShake()}
        onPickNow={handlePickNow}
      />

      <HomeCinematicHero
        eyebrow={greetingEyebrow}
        title={heroTitle}
        idleTitle={pourPrompt}
        subtitle={heroSubtitle}
        imageUrl={heroDrink?.imageUrl}
        recipeHref={revealName && heroDrink ? `/cocktails/${heroDrink.slug}` : null}
        kicker={heroKicker}
        revealName={revealName}
        showStockCta={showStockCta}
        onShake={startShake}
        shakeLabel={shakeLabel}
        shakeImageUrl={shakeImageUrl}
        dailyImageUrl={dailyImageUrl}
      />

      <div className="px-4 pt-7">
        {pourRail.length > 0 ? (
          <section className="mb-10">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
                  Your cabinet
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-forest">Ready to pour</h2>
              </div>
              <AppLink href="/mix" className="text-xs font-semibold text-terracotta">
                Open Mix
              </AppLink>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {pourRail.map((drink) => (
                <PortraitCard key={drink.slug} drink={drink} />
              ))}
            </div>
          </section>
        ) : null}

        <NativeNotificationPrompt />

        <HomeCollectionsRail initialCovers={occasionCovers} />

        {worthAPour.length > 0 && (
          <section className="mb-10">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
                  Discover
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-forest">Worth a pour</h2>
              </div>
              <AppLink href="/cocktails" className="text-xs font-semibold text-terracotta">
                All recipes
              </AppLink>
            </div>
            <div className="flex gap-3.5 overflow-x-auto pb-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {worthAPour.map((drink) => (
                <PortraitCard key={drink.slug} drink={drink} wide />
              ))}
            </div>
          </section>
        )}

        <NativeBadgeProgressCard hidePreview />

        <section className="pb-2">
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
            Browse by bottle
          </p>
          <h2 className="mb-5 font-display text-[1.65rem] font-bold leading-none tracking-tight text-forest">
            Start with a spirit
          </h2>
          <ul className="grid gap-3">
            {HOME_SPIRITS.map((spirit) => {
              const cover = getIngredientOriginCover(spirit.slug);
              const photo = cover?.src ?? null;
              return (
                <li key={spirit.value}>
                  <AppLink
                    href={`/cocktails?spirit=${encodeURIComponent(spirit.value)}`}
                    className="native-card-link home-spirit-row group relative flex flex-row items-stretch overflow-hidden rounded-[1.25rem] active:opacity-95"
                    aria-label={`Browse ${spirit.label} cocktails`}
                  >
                    <span className="home-spirit-row__shade" aria-hidden />
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- local origin covers; plain img is WKWebView-safe
                      <img
                        src={photo}
                        alt=""
                        className="home-spirit-row__photo"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                    <span className="home-spirit-row__copy">
                      <span className="home-spirit-row__name">{spirit.label}</span>
                      <span className="home-spirit-row__hint">{spirit.hint}</span>
                    </span>
                    <span className="home-spirit-row__arrow" aria-hidden>
                      →
                    </span>
                  </AppLink>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-center">
            <AppLink href="/ingredients" className="text-[13px] font-semibold text-terracotta">
              All ingredients
            </AppLink>
          </p>
        </section>
      </div>
    </div>
  );
}

function PortraitCard({ drink, wide = false }: { drink: HomeDrink; wide?: boolean }) {
  return (
    <NativeDrinkTile
      href={`/cocktails/${drink.slug}`}
      name={drink.name}
      spirit={drink.spirit}
      imageUrl={drink.imageUrl}
      createdAt={drink.createdAt}
      photoHeight={wide ? 224 : 200}
      className={`${wide ? "w-44" : "w-[9.5rem]"} shrink-0 snap-start`}
    />
  );
}
