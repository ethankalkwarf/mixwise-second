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

function CocktailStorySticker({
  cocktail,
  variant,
}: {
  cocktail: Props["cocktail"];
  variant: "recipe" | "mixed";
}) {
  const name = formatCocktailName(cocktail.name);
  const eyebrow = variant === "mixed" ? "I mixed this" : "Tonight's pour";

  return (
    <div
      style={{
        width: 720,
        height: 900,
        background: "linear-gradient(165deg, #1A2E24 0%, #2F4A3A 40%, #5C4033 100%)",
        color: "#F9F7F2",
        padding: 40,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Georgia, 'Times New Roman', serif",
        borderRadius: 48,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontSize: 20,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: "#C4B5A0",
          marginBottom: 16,
        }}
      >
        {eyebrow}
      </div>

      <div
        style={{
          flex: 1,
          borderRadius: 32,
          overflow: "hidden",
          background: "#0F1A14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 28,
        }}
      >
        {cocktail.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cocktail.imageUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            crossOrigin="anonymous"
          />
        ) : (
          <div style={{ fontSize: 120 }}>🍸</div>
        )}
      </div>

      <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
        {name}
      </div>
      {cocktail.primarySpirit ? (
        <div style={{ fontSize: 22, color: "#D4C4B0", marginBottom: 20 }}>
          {cocktail.primarySpirit}
        </div>
      ) : (
        <div style={{ height: 12 }} />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 999,
            background: "#C4785A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          MW
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>MixWise</div>
          <div style={{ fontSize: 16, color: "#C4B5A0" }}>
            getmixwise.com/cocktails/{cocktail.slug}
          </div>
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
      sticker={<CocktailStorySticker cocktail={cocktail} variant={variant} />}
    />
  );
}
