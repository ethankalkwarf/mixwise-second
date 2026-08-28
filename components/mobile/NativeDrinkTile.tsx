"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCocktailName, isNewCocktail } from "@/lib/formatters";
import { AppLink } from "@/components/mobile/AppLink";
import { nativePhotoUrl } from "@/lib/mobile/nativeImage";

/**
 * Native catalog tile. Do not put the photo and title inside an <a>:
 * WKWebView lays those siblings out in a row and clips the name.
 */
export function NativeDrinkTile({
  href,
  name,
  spirit,
  imageUrl,
  createdAt,
  onNavigate,
  photoHeight = 210,
  className = "",
  drinkId,
}: {
  href: string;
  name: string;
  spirit?: string | null;
  imageUrl: string | null | undefined;
  createdAt?: string;
  onNavigate?: () => void;
  photoHeight?: number;
  className?: string;
  /** Stable id for Mix scroll restore (`data-mix-drink-id`). */
  drinkId?: string;
}) {
  const title = formatCocktailName(name);
  const accessLabel = spirit ? `${title}, ${spirit}` : title;
  const router = useRouter();

  useEffect(() => {
    router.prefetch(href);
  }, [href, router]);

  return (
    <div
      className={`native-drink-tile ${className}`.trim()}
      data-mix-drink-id={drinkId || undefined}
    >
      <div className="native-drink-tile__photo" style={{ height: photoHeight }} aria-hidden="true">
        {imageUrl ? (
          // Native shell loads remote catalog URLs directly; next/image fill breaks this layout in WKWebView.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={nativePhotoUrl(imageUrl, 640) || imageUrl} alt="" decoding="async" loading="lazy" />
        ) : (
          <span className="native-drink-tile__fallback">🍸</span>
        )}
        {isNewCocktail(createdAt) ? (
          <span className="native-drink-tile__new">NEW</span>
        ) : null}
      </div>
      <p className="native-drink-tile__name" aria-hidden="true">
        {title}
      </p>
      {spirit ? (
        <p className="native-drink-tile__spirit" aria-hidden="true">
          {spirit}
        </p>
      ) : null}
      <AppLink
        href={href}
        onClick={onNavigate}
        aria-label={accessLabel}
        className="native-drink-tile__hit"
      >
        <span aria-hidden="true" />
      </AppLink>
    </div>
  );
}
