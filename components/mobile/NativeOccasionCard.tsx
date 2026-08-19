"use client";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { AppLink } from "@/components/mobile/AppLink";
import { nativePhotoUrl } from "@/lib/mobile/nativeImage";
import type { OccasionCocktail, OccasionDisplay } from "@/lib/occasions";

type Props = {
  occasion: OccasionDisplay;
  count: number;
  cover?: OccasionCocktail | null;
};

/**
 * Native collection row. Photo + text must not share an <a> — WKWebView rows them.
 */
export function NativeOccasionCard({ occasion, count, cover }: Props) {
  const imageUrl = occasion.staticCoverPath || cover?.image_url || null;
  const href = `/occasions/${occasion.slug}`;

  return (
    <div className="native-occasion-row">
      <div className="native-occasion-row__thumb">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={nativePhotoUrl(imageUrl, 384) || imageUrl}
            alt=""
            decoding="async"
            loading="lazy"
          />
        ) : (
          <div className={`native-occasion-row__fallback bg-gradient-to-br ${occasion.accentClass}`} />
        )}
      </div>
      <div className="native-occasion-row__body">
        <p className="native-occasion-row__name">{occasion.name}</p>
        {occasion.headline ? (
          <p className="native-occasion-row__headline">{occasion.headline}</p>
        ) : null}
        <p className="native-occasion-row__count">
          {count} drink{count === 1 ? "" : "s"}
        </p>
      </div>
      <ChevronRightIcon className="native-occasion-row__chevron" aria-hidden />
      <AppLink href={href} aria-label={occasion.name} className="native-occasion-row__hit">
        <span aria-hidden="true" />
      </AppLink>
    </div>
  );
}
