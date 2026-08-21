"use client";

import { withShareUtm } from "@/lib/analytics/utm";
import { StoriesShareButtons } from "@/components/share/StoriesShareButtons";
import { formatCocktailName } from "@/lib/formatters";

type Drink = { name: string; slug?: string };

type Props = {
  hostName?: string;
  drinks: Drink[];
  missingBottle?: string | null;
  className?: string;
};

function HostNightSticker({
  hostName,
  drinks,
  missingBottle,
}: {
  hostName?: string;
  drinks: Drink[];
  missingBottle?: string | null;
}) {
  const shown = drinks.slice(0, 5);
  const title = missingBottle
    ? `One bottle unlocks more`
    : hostName
      ? `${hostName}'s Host Night`
      : "Host Night";

  return (
    <div
      style={{
        width: 720,
        height: 900,
        background: "linear-gradient(155deg, #24352C 0%, #3D4F3A 45%, #6B4A38 100%)",
        color: "#F9F7F2",
        padding: 48,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "Georgia, 'Times New Roman', serif",
        borderRadius: 48,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 20,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#C4B5A0",
            marginBottom: 16,
          }}
        >
          MixWise
        </div>
        <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.1, marginBottom: 12 }}>
          {title}
        </div>
        {missingBottle ? (
          <div style={{ fontSize: 24, color: "#E8D5C4" }}>
            Grab {missingBottle} and unlock tonight&apos;s menu.
          </div>
        ) : (
          <div style={{ fontSize: 24, color: "#E8D5C4" }}>
            Ready to pour from this bar
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {shown.map((d, i) => (
          <div
            key={`${d.name}-${i}`}
            style={{
              fontSize: 28,
              fontWeight: 600,
              padding: "12px 18px",
              borderRadius: 16,
              background: "rgba(249,247,242,0.1)",
            }}
          >
            {formatCocktailName(d.name)}
          </div>
        ))}
      </div>

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
          <div style={{ fontSize: 20, fontWeight: 700 }}>getmixwise.com</div>
          <div style={{ fontSize: 16, color: "#C4B5A0" }}>Share your bar · Host Night</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Stories template for party hosting / "tonight's menu" / missing-bottle hooks.
 */
export function HostNightStoriesShare({
  hostName,
  drinks,
  missingBottle,
  className,
}: Props) {
  if (drinks.length === 0) return null;

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://www.getmixwise.com";
  const shareUrl = withShareUtm(`${origin}/mix`, {
    medium: "stories",
    source: "host_night_share",
    campaign: missingBottle ? "missing_bottle" : "host_night",
    content: drinks[0]?.slug || drinks[0]?.name,
  });

  return (
    <StoriesShareButtons
      entity="other"
      shareUrl={shareUrl}
      className={className}
      backgroundTopColor="#24352C"
      backgroundBottomColor="#6B4A38"
      sticker={
        <HostNightSticker
          hostName={hostName}
          drinks={drinks}
          missingBottle={missingBottle}
        />
      }
    />
  );
}
