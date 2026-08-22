"use client";

import { PlusIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { formatCocktailName } from "@/lib/formatters";
import { FavoriteDrinkRow } from "@/components/bar/FavoriteDrinkRow";
import { AppLink } from "@/components/mobile/AppLink";

export type FeaturedDrink = {
  cocktail_id: string;
  cocktail_name: string | null;
  cocktail_slug: string | null;
  cocktail_image_url: string | null;
};

type Props = {
  drinks: FeaturedDrink[];
  /** Owner viewing their public profile */
  isOwner?: boolean;
  className?: string;
};

export function ProfileFeaturedDrinks({ drinks, isOwner = false, className }: Props) {
  if (drinks.length === 0) {
    if (!isOwner) return null;

    return (
      <div className={className}>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-sage">
          Featured drinks
        </p>
        <AppLink
          href="/account#featured-drinks"
          className="group flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 ring-1 ring-mist/80 transition hover:bg-cream/40 hover:ring-olive/20 active:scale-[0.99]"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cream text-olive ring-1 ring-black/[0.04]">
            <PlusIcon className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-serif text-[15px] font-semibold leading-snug text-forest">
              Pin your favorite drinks
            </span>
            <span className="mt-0.5 block text-xs leading-snug text-sage">
              Choose up to 3 to highlight on your profile.
            </span>
          </span>
          <ChevronRightIcon
            className="h-4 w-4 shrink-0 text-sage/60 transition group-hover:text-olive"
            aria-hidden
          />
        </AppLink>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sage">
          {isOwner ? "Your featured drinks" : "Featured drinks"}
        </p>
        {isOwner ? (
          <AppLink
            href="/account#featured-drinks"
            className="text-xs font-medium text-olive hover:text-olive-dark"
          >
            Edit
          </AppLink>
        ) : null}
      </div>
      <div className="space-y-2">
        {drinks.map((drink) => {
          const slug = drink.cocktail_slug;
          const name = drink.cocktail_name
            ? formatCocktailName(drink.cocktail_name)
            : "Cocktail";

          if (!slug) {
            return (
              <div
                key={drink.cocktail_id}
                className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 ring-1 ring-mist/80"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-mist text-xl">
                  🍸
                </div>
                <p className="font-serif text-[15px] font-semibold text-forest">{name}</p>
              </div>
            );
          }

          return (
            <FavoriteDrinkRow
              key={drink.cocktail_id}
              href={`/cocktails/${slug}`}
              name={name}
              imageUrl={drink.cocktail_image_url}
            />
          );
        })}
      </div>
    </div>
  );
}
