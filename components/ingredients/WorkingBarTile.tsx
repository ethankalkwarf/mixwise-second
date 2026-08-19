"use client";

import Image from "next/image";
import Link from "next/link";
import { AppLink } from "@/components/mobile/AppLink";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import type { DirectoryIngredient } from "@/lib/ingredientTypes";
import { nativePhotoUrl } from "@/lib/mobile/nativeImage";

type Props = {
  ingredient: DirectoryIngredient;
};

/**
 * Working-bar bottle tile. On native, photo + label must not live inside the same <a>
 * — WKWebView rows them horizontally and clips the text.
 */
export function WorkingBarTile({ ingredient }: Props) {
  const nativeShell = useNativeShell();
  const href = `/ingredients/${ingredient.slug}`;

  if (nativeShell) {
    return (
      <div className="native-ingredient-tile">
        <div className="native-ingredient-tile__photo">
          {ingredient.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={nativePhotoUrl(ingredient.imageUrl, 384) || ingredient.imageUrl}
              alt=""
              decoding="async"
              loading="lazy"
            />
          ) : (
            <span className="native-ingredient-tile__fallback">{ingredient.name.charAt(0)}</span>
          )}
        </div>
        <p className="native-ingredient-tile__name">{ingredient.name}</p>
        <AppLink href={href} aria-label={ingredient.name} className="native-ingredient-tile__hit">
          <span aria-hidden="true" />
        </AppLink>
      </div>
    );
  }

  return (
    <Link href={href} className="group flex min-w-0 flex-col items-center text-center">
      <div className="relative flex h-24 w-full items-end justify-center sm:h-44">
        {ingredient.imageUrl ? (
          <Image
            src={ingredient.imageUrl}
            alt=""
            width={160}
            height={200}
            sizes="(max-width: 640px) 33vw, 140px"
            className="max-h-full w-auto object-contain object-bottom mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
            quality={85}
          />
        ) : (
          <div className="flex h-full items-end justify-center text-xs text-sage/40">{ingredient.name}</div>
        )}
      </div>
      <p className="mt-2 flex min-h-[2.5rem] items-start justify-center font-display text-xs leading-snug text-forest sm:mt-3 sm:min-h-0 sm:text-base">
        {ingredient.name}
      </p>
    </Link>
  );
}
