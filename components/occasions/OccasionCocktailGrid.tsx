"use client";

import { formatCocktailName, isNewCocktail } from "@/lib/formatters";
import { ComingSoonCocktailImage } from "@/components/cocktails/ComingSoonCocktailImage";
import { AppLink } from "@/components/mobile/AppLink";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import { nativePhotoUrl } from "@/lib/mobile/nativeImage";
import type { OccasionCocktail } from "@/lib/occasions";

type Props = {
  cocktails: OccasionCocktail[];
};

export function OccasionCocktailGrid({ cocktails }: Props) {
  const nativeShell = useNativeShell();

  if (cocktails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-mist rounded-3xl bg-white">
        <h2 className="text-xl font-display font-bold text-forest mb-3">No drinks in this occasion yet</h2>
        <p className="text-sage max-w-md text-sm mb-6">
          Browse the full library while we keep tagging seasonal and hosting collections.
        </p>
        <AppLink
          href="/cocktails"
          className="px-6 py-3 bg-terracotta/10 text-terracotta border border-terracotta/30 rounded-xl text-sm font-medium hover:bg-terracotta hover:text-cream transition-colors"
        >
          All recipes
        </AppLink>
      </div>
    );
  }

  return (
    <div
      className={
        nativeShell
          ? "native-collection-drinks"
          : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {cocktails.map((cocktail, index) => {
        const imageUrl = cocktail.image_url || undefined;
        const title = formatCocktailName(cocktail.name);
        const photoSrc = imageUrl ? nativePhotoUrl(imageUrl, 750) || imageUrl : null;
        return (
          <div
            key={cocktail.id}
            className="collection-drink-card group"
            style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
          >
            <div className="collection-drink-card__photo">
              {photoSrc ? (
                // WKWebView: next/image fill inside <a> rows the caption off-center.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoSrc} alt={cocktail.image_alt || title} decoding="async" loading="lazy" />
              ) : (
                <ComingSoonCocktailImage name={cocktail.name} size="card" />
              )}
              {isNewCocktail(cocktail.created_at) ? (
                <span className="collection-drink-card__new">NEW</span>
              ) : null}
            </div>

            <div className="collection-drink-card__body">
              {cocktail.base_spirit ? (
                <p className="collection-drink-card__spirit">{cocktail.base_spirit}</p>
              ) : null}
              <h3 className="collection-drink-card__name">{title}</h3>
              {cocktail.short_description ? (
                <p className="collection-drink-card__desc">{cocktail.short_description}</p>
              ) : null}
            </div>

            <AppLink
              href={`/cocktails/${cocktail.slug}`}
              aria-label={title}
              className="native-hero-hit collection-drink-card__hit"
            >
              <span aria-hidden="true" />
            </AppLink>
          </div>
        );
      })}
    </div>
  );
}
