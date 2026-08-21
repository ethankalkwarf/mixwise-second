import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "MixWise — a smarter way to make cocktails at home";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadLockupDataUrl() {
  const bytes = await readFile(
    join(process.cwd(), "public/brand/mixwise-lockup-cream.png")
  );
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

/** Default site Open Graph — current lockup (replaces legacy /og-image.jpg). */
export default async function Image() {
  const lockupSrc = await loadLockupDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#1F3A2E",
          color: "#F9F7F2",
          fontFamily: "Georgia, 'Times New Roman', serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 60% at 100% 10%, rgba(196,120,90,0.2) 0%, transparent 55%), radial-gradient(ellipse 50% 45% at 0% 90%, rgba(138,154,91,0.16) 0%, transparent 50%)",
          }}
        />
        <div style={{ position: "relative", display: "flex" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lockupSrc}
            alt="mixwise"
            width={320}
            height={78}
            style={{ height: 58, width: "auto" }}
          />
        </div>
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 54,
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: -1,
              maxWidth: 860,
            }}
          >
            A smarter way to make cocktails at home
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "rgba(249,247,242,0.68)" }}>
            Match drinks to the bottles already on your shelf.
          </div>
        </div>
        <div
          style={{
            position: "relative",
            display: "flex",
            fontSize: 22,
            color: "rgba(249,247,242,0.55)",
          }}
        >
          getmixwise.com
        </div>
      </div>
    ),
    { ...size }
  );
}
