"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode, type TouchEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/common/BrandLogo";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { hasLikelyAccount } from "@/lib/auth/returning-user";
import { isNativeApp } from "@/lib/mobile/platform";
import {
  hasCompletedNativeIntro,
  markNativeIntroComplete,
  NATIVE_INTRO_EVENT,
} from "@/lib/mobile/nativeIntro";
import { NativeNamePrompt } from "@/components/mobile/NativeNamePrompt";
import { profileNeedsGivenName } from "@/lib/homeHeroHeadline";
import { getTabBarConfig, MOBILE_TAB_DESTINATIONS } from "@/lib/mobile/tabBarConfig";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { trackNativeIntroStep } from "@/lib/analytics";

type IntroPhase = "loading" | "intro" | "ready";

interface NativeIntroFlowProps {
  children: ReactNode;
}

function TabBarPreview({ active }: { active: string }) {
  const bar = getTabBarConfig();
  return (
    <div
      className="mx-auto flex w-full max-w-sm items-stretch rounded-2xl border border-white/15 bg-white/10 p-1.5 backdrop-blur-md"
      aria-hidden
    >
      {bar.map((tabId) => {
        const tab = MOBILE_TAB_DESTINATIONS[tabId];
        const Icon = tab.icon;
        const isActive = tabId === active;
        return (
          <div
            key={tabId}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2.5 transition-all duration-500 ${
              isActive ? "bg-cream scale-[1.04] shadow-lg shadow-charcoal/30" : "opacity-50"
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? "text-terracotta" : "text-cream/70"}`} />
            <span
              className={`text-[9px] font-semibold ${isActive ? "text-forest" : "text-cream/70"}`}
            >
              {tab.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-500 ${
            i === current
              ? "w-7 bg-cream"
              : i < current
                ? "w-1.5 bg-cream/50"
                : "w-1.5 bg-cream/25"
          }`}
        />
      ))}
    </div>
  );
}

function IntroAmbientVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.play().catch(() => {});
  }, []);

  return (
    <>
      <Image
        src="/media/strainer-pour-poster.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="native-intro-media object-cover object-[center_28%]"
        aria-hidden
      />
      <video
        ref={videoRef}
        className="native-intro-media absolute inset-0 h-full w-full object-cover object-[center_28%]"
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        poster="/media/strainer-pour-poster.webp"
        aria-hidden
      >
        <source src="/media/strainer-pour.mp4" type="video/mp4" />
      </video>
    </>
  );
}

const INTRO_SLIDES = [
  {
    id: "welcome",
    tab: null,
    kicker: "Welcome",
    title: "Your home bar,\nin your pocket.",
    body: "Discover cocktails you can actually make — with the bottles you already have.",
    hint: null,
  },
  {
    id: "mix",
    tab: "mix" as const,
    kicker: "Mix",
    title: "Stock your cabinet.",
    body: "Tap the bottles you own. MixWise shows every drink you can pour — and what one bottle unlocks next.",
    hint: "Tap bottles · see your menu",
  },
  {
    id: "search",
    tab: "search" as const,
    kicker: "Search",
    title: "Browse every recipe.",
    body: "Filter by spirit, vibe, or occasion. Find the classic you want — or the one you didn't know you needed.",
    hint: "Curated recipes, ready to filter",
  },
  {
    id: "you",
    tab: "you" as const,
    kicker: "You",
    title: "Heart the keepers.",
    body: "Save favorites, leave tasting notes, and skip what isn't for you — so MixWise learns your taste.",
    hint: "Favorites, notes, and your bar",
  },
  {
    id: "learn",
    tab: "learn" as const,
    kicker: "Learn",
    title: "Shake with confidence.",
    body: "Techniques, bottle guides, and short courses — so every pour tastes like you meant it.",
    hint: "Guides, methods, and courses",
  },
] as const;

/**
 * First-run native onboarding: short product tour, then the app as a guest.
 * Account creation is deferred until the user has mixed or saved something.
 */
export function NativeIntroFlow({ children }: NativeIntroFlowProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useUser();
  const { openAuthDialog } = useAuthDialog();

  const [native] = useState(() => (typeof window !== "undefined" ? isNativeApp() : false));
  const [phase, setPhase] = useState<IntroPhase>("loading");
  const [step, setStep] = useState(0);
  const [isReplay, setIsReplay] = useState(false);
  const [entered, setEntered] = useState(false);
  const swipeRef = useRef<{ x: number; y: number; active: boolean } | null>(null);

  const totalSteps = INTRO_SLIDES.length;
  const lastIntro = step === INTRO_SLIDES.length - 1;
  const slide = INTRO_SLIDES[step] ?? null;
  const isWelcome = slide?.id === "welcome";

  const enterApp = useCallback(
    (path?: string) => {
      void trackNativeIntroStep("complete", { path: path || "/", is_replay: isReplay });
      markNativeIntroComplete();
      setIsReplay(false);
      setPhase("ready");
      if (path) router.push(path);
    },
    [router, isReplay]
  );

  const resolvePhase = useCallback(() => {
    if (!native) {
      setPhase("ready");
      return;
    }

    if (isReplay) return;

    // Returning users: show the app immediately. Don't wait on auth.
    if (hasCompletedNativeIntro()) {
      setPhase("ready");
      return;
    }

    if (isLoading) {
      setPhase("loading");
      return;
    }

    if (isAuthenticated) {
      markNativeIntroComplete();
      setPhase("ready");
      return;
    }

    setPhase("intro");
    void trackNativeIntroStep("shown");
  }, [native, isLoading, isAuthenticated, isReplay]);

  useEffect(() => {
    resolvePhase();
  }, [resolvePhase]);

  useEffect(() => {
    if (!native) return;

    const handleReplay = () => {
      setIsReplay(true);
      setStep(0);
      setPhase("intro");
    };

    window.addEventListener(NATIVE_INTRO_EVENT, handleReplay);
    return () => window.removeEventListener(NATIVE_INTRO_EVENT, handleReplay);
  }, [native]);

  useEffect(() => {
    if (phase !== "intro") {
      setEntered(false);
      return;
    }
    setEntered(false);
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, [phase, step]);

  const goNext = useCallback(() => {
    void trackNativeIntroStep("step", { step, is_replay: isReplay });
    if (isReplay && lastIntro) {
      setIsReplay(false);
      setPhase("ready");
      return;
    }
    if (!lastIntro) {
      setStep((s) => s + 1);
      return;
    }
    enterApp("/");
  }, [enterApp, isReplay, lastIntro, step]);

  const goPrev = useCallback(() => {
    if (step <= 0) return;
    void trackNativeIntroStep("step", { step, is_replay: isReplay, direction: "back" });
    setStep((s) => Math.max(0, s - 1));
  }, [isReplay, step]);

  const onSwipeTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    swipeRef.current = { x: touch.clientX, y: touch.clientY, active: true };
  };

  const onSwipeTouchEnd = (e: TouchEvent) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start?.active) return;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // Horizontal swipe only — ignore taps and vertical scrolls.
    if (absX < 48 || absX < absY * 1.2) return;

    if (dx < 0) goNext();
    else goPrev();
  };

  const onSwipeTouchCancel = () => {
    swipeRef.current = null;
  };

  if (!native || (phase === "ready" && !isReplay)) {
    return <>{children}</>;
  }

  if (phase === "loading") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-cream px-6">
        <BrandLogo variant="dark" size="lg" linked={false} />
        <p className="mt-6 text-sm text-sage">Opening your bar…</p>
      </div>
    );
  }

  return (
    <div
      className="native-intro fixed inset-0 z-[90] overflow-hidden bg-charcoal touch-pan-y"
      onTouchStart={onSwipeTouchStart}
      onTouchEnd={onSwipeTouchEnd}
      onTouchCancel={onSwipeTouchCancel}
    >
      <div className="absolute inset-0">
        <IntroAmbientVideo />
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            isWelcome
              ? "bg-gradient-to-t from-charcoal via-charcoal/55 to-charcoal/25"
              : "bg-gradient-to-t from-charcoal via-charcoal/70 to-charcoal/45"
          }`}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-charcoal/50 to-transparent" />
      </div>

      <div
        className="relative flex h-full flex-col"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div
          className={`native-intro__brand px-6 pt-5 transition-all duration-700 ${
            entered ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
          }`}
        >
          <BrandLogo variant="light" size="lg" linked={false} />
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-end px-6 pb-2 pt-8">
          {!isWelcome && slide?.tab && (
            <div
              className={`mb-8 transition-all delay-100 duration-700 ${
                entered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              <TabBarPreview active={slide.tab} />
              {slide.hint ? (
                <p className="mt-4 text-center text-xs font-medium tracking-wide text-cream/65">
                  {slide.hint}
                </p>
              ) : null}
            </div>
          )}

          {slide && (
            <div
              key={slide.id}
              className={`native-intro__copy max-w-md transition-all delay-150 duration-700 ${
                entered ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
              }`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-terracotta">
                {slide.kicker}
              </p>
              <h1 className="mt-3 whitespace-pre-line font-display text-[2.05rem] font-bold leading-[1.08] text-cream sm:text-[2.25rem]">
                {slide.title}
              </h1>
              <p className="mt-3 max-w-[20rem] text-[15px] leading-relaxed text-white">
                {slide.body}
              </p>
            </div>
          )}
        </div>

        <div
          className={`native-intro__footer px-6 pb-5 pt-5 transition-all delay-250 duration-700 ${
            entered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <ProgressDots total={totalSteps} current={step} />

          <div className="mt-5 space-y-2">
            <button
              type="button"
              onClick={goNext}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-terracotta py-3.5 text-sm font-bold text-cream shadow-lg shadow-terracotta/35 active:scale-[0.98] transition-transform"
            >
              {isReplay && lastIntro
                ? "Done"
                : lastIntro
                  ? "Start exploring"
                  : step === 0
                    ? "See how it works"
                    : "Next"}
              {!(isReplay && lastIntro) && <ArrowRightIcon className="h-4 w-4" aria-hidden />}
            </button>

            {!isReplay && lastIntro && (
              <div className="mt-1 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    enterApp("/");
                    openAuthDialog({
                      mode: hasLikelyAccount() ? "login" : "signup",
                      dismissible: true,
                      title: hasLikelyAccount() ? "Welcome back" : "Create your free account",
                      subtitle: hasLikelyAccount()
                        ? "Sign in to restore your cabinet and favorites."
                        : "Save your bar and favorites so nothing is lost on this phone.",
                    });
                  }}
                  className="w-full rounded-2xl bg-cream py-3.5 text-sm font-bold text-forest"
                >
                  {hasLikelyAccount() ? "Log in" : "Create free account"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    enterApp("/");
                    openAuthDialog({
                      mode: hasLikelyAccount() ? "signup" : "login",
                      dismissible: true,
                      title: hasLikelyAccount() ? "Create another account" : "Welcome back",
                      subtitle: hasLikelyAccount()
                        ? "Start fresh with a new MixWise account."
                        : "Sign in to restore your cabinet and favorites.",
                    });
                  }}
                  className="w-full py-2.5 text-sm font-medium text-cream/70"
                >
                  {hasLikelyAccount() ? "Create a new account" : "I already have an account"}
                </button>
              </div>
            )}

            {isReplay && (
              <button
                type="button"
                onClick={() => {
                  setIsReplay(false);
                  setPhase("ready");
                }}
                className="w-full py-2.5 text-sm font-medium text-cream/70"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** After sign-in: ask for a first name, then offer the cabinet if they skipped that. */
export function NativePostAuthNudge() {
  const router = useRouter();
  const { isAuthenticated, isLoading, profile, user } = useUser();
  const [native] = useState(() => (typeof window !== "undefined" ? isNativeApp() : false));
  const [cabinetVisible, setCabinetVisible] = useState(false);

  const needsName =
    isAuthenticated &&
    !isLoading &&
    profileNeedsGivenName({
      firstName: profile?.first_name,
      displayName: profile?.display_name,
      email: user?.email,
    });

  useEffect(() => {
    if (!native || isLoading || !isAuthenticated || needsName) return;
    try {
      const key = "mixwise_native_post_auth_nudge";
      if (localStorage.getItem(key) === "1") return;
      if (!hasCompletedNativeIntro()) return;
      localStorage.setItem(key, "1");
      setCabinetVisible(true);
    } catch {
      /* ignore */
    }
  }, [native, isLoading, isAuthenticated, needsName]);

  if (!native || isLoading || !isAuthenticated) return null;

  if (needsName) {
    return <NativeNamePrompt variant="sheet" />;
  }

  if (!cabinetVisible) return null;

  return (
    <div className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] z-[70] mx-auto max-w-md">
      <div className="rounded-2xl border border-mist/60 bg-white p-4 shadow-xl shadow-charcoal/10">
        <p className="font-display text-base font-bold text-forest">Start with your cabinet</p>
        <p className="mt-1 text-sm text-sage">Add a few bottles to see what you can pour.</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setCabinetVisible(false);
              router.push("/mix");
            }}
            className="flex-1 rounded-xl bg-terracotta py-2.5 text-sm font-bold text-cream"
          >
            Add bottles
          </button>
          <button
            type="button"
            onClick={() => setCabinetVisible(false)}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-sage"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

// Re-export for More sheet
export { replayNativeIntro } from "@/lib/mobile/nativeIntro";
