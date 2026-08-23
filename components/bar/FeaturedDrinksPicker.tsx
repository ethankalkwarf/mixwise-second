"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useFavorites } from "@/hooks/useFavorites";
import { useFeaturedDrinks, type FeaturedDrinkSlot } from "@/hooks/useFeaturedDrinks";
import { useToast } from "@/components/ui/toast";
import { formatCocktailName } from "@/lib/formatters";
import { COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";
import { getCocktailImageUrls } from "@/lib/cocktails.client";

const SLOT_COUNT = 3;

export function FeaturedDrinksPicker() {
  const { favorites } = useFavorites();
  const { slots, isLoading, isSaving, saveSlots } = useFeaturedDrinks();
  const toast = useToast();
  const [pickerOpen, setPickerOpen] = useState<number | null>(null);
  const [liveImages, setLiveImages] = useState<Map<string, string | null>>(() => new Map());

  const slotMap = useMemo(() => {
    const map = new Map<number, FeaturedDrinkSlot>();
    for (const slot of slots) {
      if (slot.rank) map.set(slot.rank, slot);
    }
    return map;
  }, [slots]);

  const usedIds = useMemo(
    () => new Set(slots.map((s) => s.cocktail_id)),
    [slots]
  );

  const orderedSlots = useMemo(
    () =>
      Array.from({ length: SLOT_COUNT }, (_, i) => slotMap.get(i + 1) ?? null),
    [slotMap]
  );

  const imageIdsKey = useMemo(() => {
    const ids = new Set<string>();
    for (const slot of slots) ids.add(slot.cocktail_id);
    for (const fav of favorites) ids.add(fav.cocktail_id);
    return [...ids].sort().join("|");
  }, [slots, favorites]);

  useEffect(() => {
    if (!imageIdsKey) {
      setLiveImages(new Map());
      return;
    }
    let cancelled = false;
    void getCocktailImageUrls(imageIdsKey.split("|"))
      .then((urls) => {
        if (!cancelled) setLiveImages(urls);
      })
      .catch(() => {
        /* keep stored URLs */
      });
    return () => {
      cancelled = true;
    };
  }, [imageIdsKey]);

  const resolveImage = (cocktailId: string, stored?: string | null) => {
    const live = liveImages.get(cocktailId)?.trim() || null;
    const fallback = stored?.trim() || null;
    return live || fallback;
  };

  const persist = async (next: Array<FeaturedDrinkSlot | null>) => {
    const ok = await saveSlots(next);
    if (ok) {
      toast.success("Featured drinks updated");
      setPickerOpen(null);
    } else {
      toast.error("Couldn't update featured drinks");
    }
  };

  const setSlot = async (index: number, favorite: (typeof favorites)[number] | null) => {
    const next = [...orderedSlots];
    next[index] = favorite
      ? {
          cocktail_id: favorite.cocktail_id,
          cocktail_name: favorite.cocktail_name,
          cocktail_slug: favorite.cocktail_slug,
          cocktail_image_url:
            resolveImage(favorite.cocktail_id, favorite.cocktail_image_url) ??
            favorite.cocktail_image_url,
        }
      : null;
    await persist(next);
  };

  const clearSlot = async (index: number) => {
    const next = [...orderedSlots];
    next[index] = null;
    await persist(next);
  };

  if (isLoading) {
    return <p className="text-sm text-sage">Loading featured drinks…</p>;
  }

  if (favorites.length === 0) {
    return (
      <p className="text-sm text-sage">
        Save a few drinks first, then pin up to three as featured drinks on your profile.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-sage">
        Tap a slot to pick from your saved favorites. They appear at the top of your public bar.
      </p>

      <div className="grid grid-cols-3 gap-2.5">
        {orderedSlots.map((slot, index) => {
          const imageUrl = slot
            ? resolveImage(slot.cocktail_id, slot.cocktail_image_url)
            : null;
          return (
            <div key={index} className="relative">
              {slot ? (
                <div className="group relative overflow-hidden rounded-xl ring-1 ring-mist">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={slot.cocktail_name ?? "Cocktail"}
                      width={120}
                      height={160}
                      className="aspect-[3/4] w-full object-cover"
                      placeholder="blur"
                      blurDataURL={COCKTAIL_BLUR_DATA_URL}
                    />
                  ) : (
                    <div className="flex aspect-[3/4] items-center justify-center bg-mist/40 text-2xl">
                      🍸
                    </div>
                  )}
                  <div className="border-t border-mist/80 bg-forest/90 px-2 py-2">
                    <p className="line-clamp-2 text-[10px] font-semibold leading-tight text-cream">
                      {slot.cocktail_name
                        ? formatCocktailName(slot.cocktail_name)
                        : "Cocktail"}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => void clearSlot(index)}
                    className="absolute right-1 top-1 rounded-full bg-forest/70 p-1 text-cream sm:opacity-0 sm:transition sm:group-hover:opacity-100"
                    aria-label="Remove featured drink"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setPickerOpen(index)}
                  className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-mist bg-cream/50 text-sage transition hover:border-olive/40 hover:text-forest"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span className="text-[10px] font-semibold">Add</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {pickerOpen !== null && (
        <div className="rounded-xl border border-mist bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-forest">Choose a saved drink</p>
            <button
              type="button"
              onClick={() => setPickerOpen(null)}
              className="rounded-lg p-1 text-sage hover:bg-mist/50"
              aria-label="Close picker"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
          <ul className="max-h-48 space-y-1 overflow-y-auto">
            {favorites
              .filter((fav) => !usedIds.has(fav.cocktail_id))
              .map((fav) => {
                const imageUrl = resolveImage(fav.cocktail_id, fav.cocktail_image_url);
                return (
                  <li key={fav.cocktail_id}>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => void setSlot(pickerOpen, fav)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-mist/40"
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt=""
                          width={36}
                          height={48}
                          className="h-12 w-9 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <span className="flex h-12 w-9 shrink-0 items-center justify-center rounded-md bg-mist/50 text-lg">
                          🍸
                        </span>
                      )}
                      <span className="min-w-0 text-sm font-medium text-forest">
                        {fav.cocktail_name
                          ? formatCocktailName(fav.cocktail_name)
                          : "Cocktail"}
                      </span>
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>
      )}
    </div>
  );
}
