"use client";

import { withBarShareUtm, type BarShareStats } from "@/lib/barShare";
import { StoriesShareButtons } from "@/components/share/StoriesShareButtons";

type Props = {
  displayName: string;
  sharePath: string;
  username?: string | null;
  avatarUrl?: string | null;
  stats?: BarShareStats;
  mode?: "owner" | "recipient";
};

function BarStorySticker({
  displayName,
  username,
  avatarUrl,
  stats,
  sharePath,
}: {
  displayName: string;
  username?: string | null;
  avatarUrl?: string | null;
  stats?: BarShareStats;
  sharePath: string;
}) {
  const makeable = stats?.makeableCount;
  const bottles = stats?.ingredientCount;

  return (
    <div
      style={{
        width: 720,
        height: 900,
        background: "linear-gradient(160deg, #1F3A2E 0%, #2F4A3A 50%, #5C4033 100%)",
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
            fontSize: 22,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#C4B5A0",
            marginBottom: 16,
          }}
        >
          MixWise Bar
        </div>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.1 }}>{displayName}</div>
        {username ? (
          <div style={{ fontSize: 24, color: "#D4C4B0", marginTop: 8 }}>@{username}</div>
        ) : null}
      </div>

      <div style={{ display: "flex", gap: 40 }}>
        {typeof makeable === "number" ? (
          <div>
            <div style={{ fontSize: 56, fontWeight: 700 }}>{makeable}</div>
            <div style={{ fontSize: 20, color: "#C4B5A0" }}>cocktails ready</div>
          </div>
        ) : null}
        {typeof bottles === "number" ? (
          <div>
            <div style={{ fontSize: 56, fontWeight: 700 }}>{bottles}</div>
            <div style={{ fontSize: 20, color: "#C4B5A0" }}>bottles</div>
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            width={56}
            height={56}
            style={{ borderRadius: 999, objectFit: "cover" }}
            crossOrigin="anonymous"
          />
        ) : (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "#C4785A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            MW
          </div>
        )}
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>MixWise</div>
          <div style={{ fontSize: 18, color: "#C4B5A0" }}>
            getmixwise.com{sharePath}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BarStoriesShareActions({
  displayName,
  sharePath,
  username,
  avatarUrl,
  stats,
  mode = "owner",
}: Props) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.getmixwise.com";
  const shareUrl = withBarShareUtm(`${origin}${sharePath}`, {
    medium: "stories",
    campaign: mode === "owner" ? "share_my_bar" : "reshare_public_bar",
    content: username || sharePath.replace("/bar/", ""),
  });

  return (
    <StoriesShareButtons
      entity="bar"
      shareUrl={shareUrl}
      sticker={
        <BarStorySticker
          displayName={displayName}
          username={username}
          avatarUrl={avatarUrl}
          stats={stats}
          sharePath={sharePath}
        />
      }
    />
  );
}
