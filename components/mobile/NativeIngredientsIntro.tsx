"use client";

import { useNativeShell } from "@/hooks/useIsNativeApp";
import { useNativeStatusBar } from "@/hooks/useNativeStatusBar";

const HERO_SRC = "/ingredients/origins/juniper.jpg";

export function NativeIngredientsIntro({ count }: { count: number }) {
  const nativeShell = useNativeShell();
  useNativeStatusBar("cream");
  if (!nativeShell) return null;

  return (
    <section className="native-ingredients-hero" aria-label="Cocktail ingredients">
      <div className="native-ingredients-hero__stage">
        {/* eslint-disable-next-line @next/next/no-img-element -- local origin cover; plain img is WKWebView-safe */}
        <img
          className="native-ingredients-hero__photo"
          src={HERO_SRC}
          alt=""
          decoding="async"
        />
        <div className="native-ingredients-hero__shade" aria-hidden />
        <div className="native-ingredients-hero__copy">
          <p className="native-ingredients-hero__eyebrow font-mono">Cocktail ingredients</p>
          <h1 className="native-ingredients-hero__title">The bottles behind the drinks</h1>
          <p className="native-ingredients-hero__description">
            What each spirit, aperitivo, and mixer actually is — and the MixWise recipes that use it.
          </p>
          <p className="native-ingredients-hero__meta">
            {count} guide{count === 1 ? "" : "s"}
          </p>
        </div>
      </div>
    </section>
  );
}
