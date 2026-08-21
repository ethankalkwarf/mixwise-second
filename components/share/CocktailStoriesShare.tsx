"use client";

import { withShareUtm } from "@/lib/analytics/utm";
import { StoriesShareButtons } from "@/components/share/StoriesShareButtons";
import { formatCocktailName } from "@/lib/formatters";

type Props = {
  cocktail: {
    name: string;
    slug: string;
    imageUrl?: string | null;
    primarySpirit?: string | null;
  };
  /** "recipe" = check out this drink; "mixed" = I made this */
  variant?: "recipe" | "mixed";
  compact?: boolean;
  className?: string;
};

/** Afternoon/evening → Tonight; morning/midday → Today. */
export function pourMomentLabel(date = new Date()): "Today's pour" | "Tonight's pour" {
  const hour = date.getHours();
  return hour >= 16 ? "Tonight's pour" : "Today's pour";
}

function CocktailStorySticker({ cocktail }: { cocktail: Props["cocktail"] }) {
  const name = formatCocktailName(cocktail.name);
  const moment = pourMomentLabel();

  return (
    <div
      style={{
        width: 720,
        height: 900,
        position: "relative",
        overflow: "hidden",
        borderRadius: 40,
        background: "#1A2E24",
        color: "#F9F7F2",
      }}
    >
      {cocktail.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cocktail.imageUrl}
          alt=""
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(165deg, #1A2E24 0%, #2F4A3A 45%, #5C4033 100%)",
          }}
        />
      )}

      {/* Soft bottom scrim so type stays readable on any drink */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "55%",
          background:
            "linear-gradient(to top, rgba(15, 26, 20, 0.88) 0%, rgba(15, 26, 20, 0.45) 55%, transparent 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 44,
          right: 44,
          bottom: 52,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-dm-serif), 'DM Serif Display', Georgia, serif",
            fontSize: 28,
            fontWeight: 400,
            letterSpacing: 0.5,
            color: "#E8D5C4",
            lineHeight: 1.2,
          }}
        >
          {moment}
        </div>
        <div
          style={{
            fontFamily: "var(--font-dm-serif), 'DM Serif Display', Georgia, serif",
            fontSize: name.length > 22 ? 48 : 56,
            fontWeight: 400,
            lineHeight: 1.05,
            color: "#F9F7F2",
          }}
        >
          {name}
        </div>
        <div
          style={{
            marginTop: 8,
            fontFamily: "var(--font-jost), Jost, system-ui, sans-serif",
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            color: "rgba(249, 247, 242, 0.72)",
          }}
        >
          made with MixWise
        </div>
      </div>
    </div>
  );
}

export function CocktailStoriesShare({
  cocktail,
  variant = "recipe",
  compact = false,
  className,
}: Props) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://www.getmixwise.com";
  const shareUrl = withShareUtm(`${origin}/cocktails/${cocktail.slug}`, {
    medium: "stories",
    source: variant === "mixed" ? "cocktail_mixed_share" : "cocktail_share",
    campaign: variant === "mixed" ? "i_mixed_this" : "share_cocktail",
    content: cocktail.slug,
  });

  return (
    <StoriesShareButtons
      entity="cocktail"
      shareUrl={shareUrl}
      compact={compact}
      className={className}
      backgroundTopColor="#1A2E24"
      backgroundBottomColor="#5C4033"
      sticker={<CocktailStorySticker cocktail={cocktail} />}
    />
  );
}
