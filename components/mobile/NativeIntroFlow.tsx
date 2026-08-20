"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
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
import { getTabBarConfig, MOBILE_TAB_DESTINATIONS, type MobileTabId } from "@/lib/mobile/tabBarConfig";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { trackNativeIntroStep } from "@/lib/analytics";

type IntroPhase = "loading" | "intro" | "ready";

interface NativeIntroFlowProps {
  children: ReactNode;
}

function TabBarPreview({ active }: { active: string }) {
  const bar = getTabBarConfig();
  return (
    <div
      className="mx-auto flex w-full max-w-sm items-stretch rounded-2xl border border-mist/80 bg-white/90 p-1 shadow-lg shadow-charcoal/10"
      aria-hidden
    >
      {bar.map((tabId) => {
        const tab = MOBILE_TAB_DESTINATIONS[tabId];
        const Icon = tab.icon;
        const isActive = tabId === active;
        return (
          <div
            key={tabId}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2 transition-all ${
              isActive ? "bg-terracotta/12 scale-[1.02]" : "opacity-45"
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? "text-terracotta" : "text-sage"}`} />
            <span
              className={`text-[9px] font-semibold ${isActive ? "text-terracotta" : "text-sage"}`}
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
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current ? "w-6 bg-terracotta" : i < current ? "w-1.5 bg-terracotta/40" : "w-1.5 bg-mist"
          }`}
        />
      ))}
    </div>
  );
}

const INTRO_SLIDES = [
  {
    id: "welcome",
    kicker: "Welcome",
    title: "Your home bar,\nin your pocket.",
    body: "Discover cocktails you can actually make — with the bottles you already have.",
    hero: true as const,
  },
  {
    id: "mix",
    kicker: "Mix",
    title: "Stock your cabinet.",
    body: "Tap the bottles you own. MixWise instantly shows every drink you can pour — and what one bottle away unlocks next.",
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

  const totalSteps = INTRO_SLIDES.length;
  const lastIntro = step === INTRO_SLIDES.length - 1;
  const slide = INTRO_SLIDES[step] ?? null;

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

  const goNext = () => {
    void trackNativeIntroStep("step", { step, is_replay: isReplay });
    if (isReplay && lastIntro) {
      setIsReplay(false);
      setPhase("ready");
      return;
    }
    if (!lastIntro && step === 0 && !isReplay) {
      enterApp("/mix");
      return;
    }
    if (!lastIntro) {
      setStep((s) => s + 1);
      return;
    }
    enterApp("/mix");
  };

  if (!native || (phase === "ready" && !isReplay)) {
    return <>{children}</>;
  }

  if (phase === "loading") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6">
        <BrandLogo variant="dark" size="lg" linked={false} render="img" />
        <p className="mt-6 text-sm text-sage">Opening your bar…</p>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col bg-gradient-to-b from-cream via-cream to-mist/30"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* Welcome hero slide */}
      {slide?.id === "welcome" && (
        <div className="relative mx-5 mt-4 overflow-hidden rounded-[1.75rem] bg-charcoal shadow-xl shadow-charcoal/20">
          <div className="relative h-52">
            <Image
              src="/media/strainer-pour-poster.webp"
              alt=""
              fill
              priority
              className="object-cover object-[center_30%]"
              aria-hidden
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-charcoal/20" />
            <div className="absolute inset-0 flex flex-col justify-between p-5">
              <BrandLogo variant="light" size="lg" linked={false} render="img" />
              <p className="text-sm text-cream/80">Cocktails, matched to your cabinet</p>
            </div>
          </div>
        </div>
      )}

      {/* Feature slides — tab preview */}
      {slide && slide.id !== "welcome" && (
        <div className="flex flex-1 flex-col justify-end px-5 pt-6">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-terracotta/10">
            <SparklesIcon className="h-7 w-7 text-terracotta" />
          </div>
          <div className="mb-auto rounded-[1.75rem] border border-mist/60 bg-white/80 p-5 shadow-sm">
            <TabBarPreview active={slide.id as MobileTabId} />
            <p className="mt-4 text-center text-xs text-sage">
              Tap bottles · see your menu
            </p>
          </div>
        </div>
      )}

      {/* Copy block for intro slides */}
      {slide && (
        <div className="px-6 pb-4 pt-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-terracotta">
            {slide.kicker}
          </p>
          <h2 className="mt-2 whitespace-pre-line font-display text-[1.65rem] font-bold leading-tight text-forest">
            {slide.title}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-sage">{slide.body}</p>
        </div>
      )}

      {/* Footer controls */}
      <div
        className="mt-auto px-6 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] pt-4"
      >
        <ProgressDots total={totalSteps} current={step} />

        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={goNext}
            className="w-full rounded-2xl bg-terracotta py-3.5 text-sm font-bold text-cream shadow-lg shadow-terracotta/20 active:scale-[0.98] transition-transform"
          >
            {isReplay && lastIntro
              ? "Done"
              : step === 0 && !isReplay
                ? "Get started"
                : lastIntro
                  ? "Start exploring"
                  : "Next"}
          </button>
          {!isReplay && step === 0 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2.5 text-sm font-medium text-sage"
            >
              How it works
            </button>
          )}
          {!isReplay && step === 1 && (
            <button
              type="button"
              onClick={() => enterApp("/mix")}
              className="w-full py-2.5 text-sm font-medium text-sage"
            >
              Skip
            </button>
          )}
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
                className="w-full rounded-2xl bg-forest py-3.5 text-sm font-bold text-cream"
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
                className="w-full py-2.5 text-sm font-medium text-sage"
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
              className="w-full py-2.5 text-sm font-medium text-sage"
            >
              Close
            </button>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] text-sage/80">
          Step {step + 1} of {totalSteps}
        </p>
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
