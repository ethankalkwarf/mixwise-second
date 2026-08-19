"use client";

import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { AppLink } from "@/components/mobile/AppLink";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import { nativePhotoUrl } from "@/lib/mobile/nativeImage";

type Props = {
  title: string;
  name: string;
  sectionTitle: string;
  description: string;
  alsoCalled?: string | null;
  heroImageUrl?: string | null;
  heroImageAlt?: string;
  abv?: string | null;
  cocktailCount: number;
};

/** Native ingredient header — large bottle photo, no website breadcrumbs or cream wash. */
export function NativeIngredientHero({
  title,
  name,
  sectionTitle,
  description,
  alsoCalled,
  heroImageUrl,
  heroImageAlt,
  abv,
  cocktailCount,
}: Props) {
  const nativeShell = useNativeShell();
  if (!nativeShell) return null;

  const src = heroImageUrl ? nativePhotoUrl(heroImageUrl, 640, 85) || heroImageUrl : null;

  return (
    <section className="native-ingredient-hero">
      <AppLink href="/ingredients" className="native-ingredient-hero__back">
        <ChevronLeftIcon aria-hidden />
        <span>Ingredients</span>
      </AppLink>

      <div className="native-ingredient-hero__stage">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="native-ingredient-hero__bottle" src={src} alt={heroImageAlt || name} />
        ) : (
          <div className="native-ingredient-hero__fallback">{name.charAt(0)}</div>
        )}
      </div>

      <div className="native-ingredient-hero__copy">
        <p className="native-ingredient-hero__eyebrow">{sectionTitle}</p>
        <h1 className="native-ingredient-hero__title">{title}</h1>
        <p className="native-ingredient-hero__description">{description}</p>
        {alsoCalled ? <p className="native-ingredient-hero__also">{alsoCalled}</p> : null}
        <div className="native-ingredient-hero__meta">
          {abv ? <span className="native-ingredient-hero__pill">{abv} ABV</span> : null}
          {cocktailCount > 0 ? (
            <AppLink href="#cocktails" className="native-ingredient-hero__pill">
              Used in {cocktailCount} cocktail{cocktailCount === 1 ? "" : "s"}
            </AppLink>
          ) : (
            <span className="native-ingredient-hero__pill">No matched cocktails yet</span>
          )}
        </div>
      </div>
    </section>
  );
}
