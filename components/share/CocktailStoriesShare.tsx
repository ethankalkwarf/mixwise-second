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

/** Transparent text-only sticker — drink photo is the Stories background layer. */
function CocktailPourTextSticker({ cocktail }: { cocktail: Props["cocktail"] }) {
  const name = formatCocktailName(cocktail.name);
  const moment = pourMomentLabel();
  const textShadow = "0 2px 16px rgba(0,0,0,0.65), 0 1px 3px rgba(0,0,0,0.45)";

  return (
    <div
      style={{
        width: 680,
        height: 320,
        background: "transparent",
        color: "#F9F7F2",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        gap: 8,
        padding: "0 8px 8px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-dm-serif), 'DM Serif Display', Georgia, serif",
          fontSize: 30,
          fontWeight: 400,
          letterSpacing: 0.5,
          color: "#F9F7F2",
          lineHeight: 1.2,
          textShadow,
        }}
      >
        {moment}
      </div>
      <div
        style={{
          fontFamily: "var(--font-dm-serif), 'DM Serif Display', Georgia, serif",
          fontSize: name.length > 22 ? 52 : 62,
          fontWeight: 400,
          lineHeight: 1.05,
          color: "#F9F7F2",
          textShadow,
        }}
      >
        {name}
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: "var(--font-jost), Jost, system-ui, sans-serif",
          fontSize: 18,
          fontWeight: 500,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          color: "rgba(249, 247, 242, 0.9)",
          textShadow,
        }}
      >
        made with MixWise
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
      stickerWidth={680}
      stickerHeight={320}
      backgroundImageUrl={cocktail.imageUrl || undefined}
      // Soft fallback only if drink photo can't load — not a solid sticker box
      backgroundTopColor="#1A2E24"
      backgroundBottomColor="#2F4A3A"
      sticker={<CocktailPourTextSticker cocktail={cocktail} />}
    />
  );
}
