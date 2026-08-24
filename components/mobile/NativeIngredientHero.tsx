"use client";

import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { AppLink } from "@/components/mobile/AppLink";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import { useNativeStatusBar } from "@/hooks/useNativeStatusBar";
import { nativePhotoUrl } from "@/lib/mobile/nativeImage";

type Props = {
  title: string;
  name: string;
  sectionTitle: string;
  description: string;
  alsoCalled?: string | null;
  heroImageUrl?: string | null;
  heroImageAlt?: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string;
  abv?: string | null;
  cocktailCount: number;
};

/** Native ingredient header — index-style wash, copy left, bottle right. */
export function NativeIngredientHero({
  title,
  name,
  sectionTitle,
  description,
  alsoCalled,
  heroImageUrl,
  heroImageAlt,
  coverImageUrl,
  coverImageAlt,
  abv,
  cocktailCount,
}: Props) {
  const nativeShell = useNativeShell();
  useNativeStatusBar("cream");
  if (!nativeShell) return null;

  const bottleSrc = heroImageUrl
    ? nativePhotoUrl(heroImageUrl, 640, 85) || heroImageUrl
    : null;
  const coverSrc = coverImageUrl
    ? nativePhotoUrl(coverImageUrl, 1080, 85) || coverImageUrl
    : null;

  const scrollToCocktails = () => {
    document.getElementById("cocktails")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="native-ingredient-hero">
      <div className="native-ingredient-hero__stage">
        {coverSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="native-ingredient-hero__cover"
            src={coverSrc}
            alt={coverImageAlt || ""}
          />
        ) : (
          <div className="native-ingredient-hero__cover-fallback" aria-hidden />
        )}
        <div className="native-ingredient-hero__shade" aria-hidden />

        <AppLink href="/ingredients" className="native-ingredient-hero__back">
          <ChevronLeftIcon aria-hidden />
          <span>Ingredients</span>
        </AppLink>

        <div className="native-ingredient-hero__layout">
          <div className="native-ingredient-hero__copy">
            <p className="native-ingredient-hero__eyebrow font-mono">{sectionTitle}</p>
            <h1 className="native-ingredient-hero__title">{title}</h1>
            <p className="native-ingredient-hero__description">{description}</p>
            {alsoCalled ? <p className="native-ingredient-hero__also">{alsoCalled}</p> : null}
            <div className="mw-pill-row native-ingredient-hero__meta">
              {abv ? <span className="mw-pill mw-pill--meta">{abv} ABV</span> : null}
              {cocktailCount > 0 ? (
                <button
                  type="button"
                  className="mw-pill mw-pill--meta"
                  onClick={scrollToCocktails}
                >
                  Used in {cocktailCount} cocktail{cocktailCount === 1 ? "" : "s"}
                </button>
              ) : (
                <span className="mw-pill mw-pill--meta">No matched cocktails yet</span>
              )}
            </div>
          </div>

          <div className="native-ingredient-hero__bottle-col">
            {bottleSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="native-ingredient-hero__bottle"
                src={bottleSrc}
                alt={heroImageAlt || name}
              />
            ) : (
              <div className="native-ingredient-hero__fallback" aria-hidden>
                {name.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
