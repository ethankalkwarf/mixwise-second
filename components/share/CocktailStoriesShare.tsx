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
 * Tight bounds + big type so pinch-to-scale tops out larger in Stories.
 */
function CocktailPourTextSticker({ cocktail }: { cocktail: Props["cocktail"] }) {
  const name = formatCocktailName(cocktail.name);
  const moment = pourMomentLabel();
  const textShadow = "0 6px 32px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.55)";
  const hasSpaces = /\s/.test(name);
  // Long unbroken names shrink to stay on one line instead of hyphenating mid-word
  const longestToken = Math.max(...name.split(/\s+/).map((w) => w.length), 0);
  const nameSize =
    longestToken > 16 ? 120 : longestToken > 12 ? 148 : name.length > 22 ? 160 : name.length > 14 ? 176 : 200;

  return (
    <div
      style={{
        width: 900,
        height: 560,
        backgroundColor: "transparent",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "flex-start",
        gap: 12,
        padding: "32px 36px 40px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-dm-serif), 'DM Serif Display', Georgia, serif",
          fontSize: 56,
          fontWeight: 400,
          letterSpacing: 0.6,
          color: "#FFFFFF",
          lineHeight: 1.1,
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
          lineHeight: 1.05,
          color: "#FFFFFF",
          textShadow,
          maxWidth: "100%",
          // Never split a word — only wrap at spaces (e.g. "Espresso Martini")
          whiteSpace: hasSpaces ? "normal" : "nowrap",
          wordBreak: "normal",
          overflowWrap: "normal",
          hyphens: "none",
        }}
      >
        {name}
      </div>
      <div
        style={{
          marginTop: 8,
          fontFamily: "var(--font-jost), Jost, system-ui, sans-serif",
          fontSize: 32,
          fontWeight: 500,
          letterSpacing: 2.2,
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
      stickerWidth={900}
      stickerHeight={560}
      // Capture pour in MixWise, then hand photo + text sticker to Stories
      cameraBackground
      sticker={<CocktailPourTextSticker cocktail={cocktail} />}
    />
  );
}
