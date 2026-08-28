"use client";

import { useState } from "react";
import { AppLink } from "@/components/mobile/AppLink";
import { nativePhotoUrl } from "@/lib/mobile/nativeImage";
import type { OccasionDefinition } from "@/lib/occasions";

type Props = {
  occasion: OccasionDefinition;
  variant?: "portrait" | "grid" | "stack";
  coverImageUrl?: string | null;
  className?: string;
  onNavigate?: () => void;
};

/**
 * Collection tile for native shell. Image and link must stay separate — WKWebView
 * lays out <a> + <img> siblings as a broken horizontal row.
 */
export function NativeCollectionTile({
  occasion,
  variant = "grid",
  coverImageUrl,
  className = "",
  onNavigate,
}: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = coverImageUrl || occasion.staticCoverPath;
  const label = occasion.navName || occasion.name;
  const href = `/occasions/${occasion.slug}?from=search`;

  return (
    <div className={`native-collection-tile native-collection-tile--${variant} ${className}`.trim()}>
      <div className="native-collection-tile__photo">
        {imageUrl && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={nativePhotoUrl(imageUrl, variant === "portrait" ? 384 : 640) || imageUrl}
            alt=""
            decoding="async"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className={`native-collection-tile__fallback bg-gradient-to-br ${occasion.accentClass}`} />
        )}
        {variant === "grid" || variant === "stack" ? (
          <div className="native-collection-tile__shade" aria-hidden />
        ) : null}
        {variant === "grid" || variant === "stack" ? (
          <div className="native-collection-tile__overlay">
            <p className="native-collection-tile__name">{label}</p>
            {occasion.headline ? (
              <p className="native-collection-tile__headline">{occasion.headline}</p>
            ) : null}
          </div>
        ) : null}
      </div>
      {variant === "portrait" ? (
        <p className="native-collection-tile__caption">{label}</p>
      ) : null}
      <AppLink
        href={href}
        aria-label={label}
        className="native-collection-tile__hit"
        onClick={onNavigate}
      >
        <span aria-hidden="true" />
      </AppLink>
    </div>
  );
}
