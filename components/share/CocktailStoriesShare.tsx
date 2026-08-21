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

/**
 * Large transparent text sticker for Instagram/Facebook Stories.
 * MixWise opens the camera first; their pour becomes the Stories background.
 * Canvas is story-width so pinch-to-scale starts (and tops out) bigger.
 */
function CocktailPourTextSticker({ cocktail }: { cocktail: Props["cocktail"] }) {
  const name = formatCocktailName(cocktail.name);
  const moment = pourMomentLabel();
  const textShadow = "0 4px 28px rgba(0,0,0,0.75), 0 2px 8px rgba(0,0,0,0.55)";
  const nameSize = name.length > 28 ? 88 : name.length > 18 ? 104 : 120;

  return (
    <div
      style={{
        width: 1080,
        height: 560,
        backgroundColor: "transparent",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: 14,
        padding: "40px 48px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-dm-serif), 'DM Serif Display', Georgia, serif",
          fontSize: 48,
          fontWeight: 400,
          letterSpacing: 0.6,
          color: "#FFFFFF",
          lineHeight: 1.15,
          textShadow,
        }}
      >
        {moment}
      </div>
      <div
        style={{
          fontFamily: "var(--font-dm-serif), 'DM Serif Display', Georgia, serif",
          fontSize: nameSize,
          fontWeight: 400,
          lineHeight: 1.02,
          color: "#FFFFFF",
          textShadow,
          maxWidth: "100%",
          wordBreak: "break-word",
        }}
      >
        {name}
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: "var(--font-jost), Jost, system-ui, sans-serif",
          fontSize: 28,
          fontWeight: 500,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.92)",
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
      stickerWidth={1080}
      stickerHeight={560}
      // Capture pour in MixWise, then hand photo + text sticker to Stories
      cameraBackground
      sticker={<CocktailPourTextSticker cocktail={cocktail} />}
    />
  );
}
