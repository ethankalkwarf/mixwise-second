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

const STICKER_W = 900;
const STICKER_H = 640;
const STICKER_PAD_X = 36;
const STICKER_PAD_TOP = 48;
const STICKER_PAD_BOTTOM = 44;
const NAME_MAX_WIDTH = STICKER_W - STICKER_PAD_X * 2;
const NAME_MAX_PX = 200;
const NAME_MIN_PX = 64;
const MOMENT_PX = 56;
const MOMENT_LINE = 1.2;
const FOOTER_PX = 32;
const STACK_GAP = 14;
const NAME_LINE = 1.08;
const NAME_FONT = '"DM Serif Display", Georgia, "Times New Roman", serif';

function measureTextWidth(text: string, fontSize: number): number {
  if (typeof document === "undefined") {
    return text.length * fontSize * 0.58;
  }
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return text.length * fontSize * 0.58;
  ctx.font = `400 ${fontSize}px ${NAME_FONT}`;
  return ctx.measureText(text).width;
}

/** How many lines the name needs at this size (wrap only at spaces). */
function nameLineCount(name: string, fontSize: number, allowWrapAtSpaces: boolean): number {
  if (!allowWrapAtSpaces) return 1;
  const limit = NAME_MAX_WIDTH * 0.96;
  const tokens = name.split(/\s+/).filter(Boolean);
  let lines = 1;
  let lineWidth = 0;
  const spaceW = measureTextWidth(" ", fontSize);
  for (const token of tokens) {
    const tw = measureTextWidth(token, fontSize);
    if (lineWidth === 0) {
      lineWidth = tw;
      continue;
    }
    if (lineWidth + spaceW + tw <= limit) {
      lineWidth += spaceW + tw;
    } else {
      lines += 1;
      lineWidth = tw;
    }
  }
  return lines;
}

/**
 * Largest font size where every token fits the sticker width and the full
 * stack (moment + name + footer) fits the sticker height — never mid-word wrap,
 * never clipped letters.
 */
function fitDrinkNameSize(name: string, allowWrapAtSpaces: boolean): number {
  const tokens = allowWrapAtSpaces ? name.split(/\s+/).filter(Boolean) : [name];
  // Slightly under the box so shadows / antialias don't clip
  const widthLimit = NAME_MAX_WIDTH * 0.96;
  // Moment paddingTop (8) keeps serif ascenders / apostrophe inside the capture box
  const momentBlock = 8 + MOMENT_PX * MOMENT_LINE;
  const footerBlock = FOOTER_PX * 1.25;
  // Two flex gaps: moment→name and name→footer
  const heightBudget =
    STICKER_H -
    STICKER_PAD_TOP -
    STICKER_PAD_BOTTOM -
    momentBlock -
    STACK_GAP * 2 -
    footerBlock;

  let lo = NAME_MIN_PX;
  let hi = NAME_MAX_PX;
  let best = NAME_MIN_PX;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const tokensFit = tokens.every((token) => measureTextWidth(token, mid) <= widthLimit);
    const fullFits = allowWrapAtSpaces || measureTextWidth(name, mid) <= widthLimit;
    const lines = nameLineCount(name, mid, allowWrapAtSpaces);
    const nameHeight = lines * mid * NAME_LINE;
    const heightFits = nameHeight <= heightBudget;
    if (tokensFit && fullFits && heightFits) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

/**
 * Large transparent text sticker for Instagram/Facebook Stories.
 * Type scales to fit — words never split, letters never clipped.
 */
function CocktailPourTextSticker({ cocktail }: { cocktail: Props["cocktail"] }) {
  const name = formatCocktailName(cocktail.name);
  const moment = pourMomentLabel();
  const textShadow = "0 6px 32px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.55)";
  const hasSpaces = /\s/.test(name);
  const nameSize = fitDrinkNameSize(name, hasSpaces);

  return (
    <div
      style={{
        width: STICKER_W,
        height: STICKER_H,
        backgroundColor: "transparent",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "flex-start",
        gap: STACK_GAP,
        padding: `${STICKER_PAD_TOP}px ${STICKER_PAD_X}px ${STICKER_PAD_BOTTOM}px`,
        boxSizing: "border-box",
        overflow: "visible",
      }}
    >
      <div
        style={{
          fontFamily: `var(--font-dm-serif), ${NAME_FONT}`,
          fontSize: MOMENT_PX,
          fontWeight: 400,
          letterSpacing: 0.6,
          color: "#FFFFFF",
          lineHeight: MOMENT_LINE,
          // Room for serif ascenders / apostrophe + shadow blur above the line
          paddingTop: 8,
          textShadow,
        }}
      >
        {moment}
      </div>
      <div
        style={{
          fontFamily: `var(--font-dm-serif), ${NAME_FONT}`,
          fontSize: nameSize,
          fontWeight: 400,
          lineHeight: NAME_LINE,
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
          fontFamily: "var(--font-jost), Jost, system-ui, sans-serif",
          fontSize: FOOTER_PX,
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
      stickerWidth={STICKER_W}
      stickerHeight={STICKER_H}
      // Capture pour in MixWise, then hand photo + text sticker to Stories
      cameraBackground
      sticker={<CocktailPourTextSticker cocktail={cocktail} />}
    />
  );
}
