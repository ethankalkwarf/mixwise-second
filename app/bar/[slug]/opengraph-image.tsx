import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  getUserBarIngredients,
  getMixCocktails,
  getStapleIngredientIds,
} from "@/lib/cocktails.server";
import { getMixMatchGroups } from "@/lib/mixMatching";

export const alt = "MixWise bar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 300;

function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function loadBar(slug: string) {
  const supabase = createPublicClient();
  const selectFields = "id, display_name, username, public_slug, avatar_url";

  const byUsername = await supabase
    .from("profiles")
    .select(selectFields)
    .eq("username", slug)
    .maybeSingle();

  let profile = byUsername.data;
  if (!profile) {
    const bySlug = await supabase
      .from("profiles")
      .select(selectFields)
      .eq("public_slug", slug)
      .maybeSingle();
    profile = bySlug.data;
  }

  if (!profile) return null;

  const ingredients = await getUserBarIngredients(profile.id);
  const [cocktails, stapleIds] = await Promise.all([
    getMixCocktails(),
    getStapleIngredientIds(),
  ]);
  const valid = cocktails.filter(
    (c) => c?.ingredients && Array.isArray(c.ingredients) && c.ingredients.length > 0
  );
  const { ready } = getMixMatchGroups({
    cocktails: valid,
    ownedIngredientIds: ingredients.map((i) => String(i.ingredient_id)),
    stapleIngredientIds: stapleIds,
  });

  return {
    displayName: profile.display_name || profile.username || "A home bartender",
    username: profile.username,
    bottleCount: ingredients.length,
    makeableCount: ready.length,
  };
}

async function loadLockupDataUrl() {
  const bytes = await readFile(
    join(process.cwd(), "public/brand/mixwise-lockup-cream.png")
  );
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      slug
    );

  const [bar, lockupSrc] = await Promise.all([
    isUuid ? Promise.resolve(null) : loadBar(slug).catch(() => null),
    loadLockupDataUrl(),
  ]);

  const name = bar?.displayName || "MixWise Bar";
  const bottles = bar?.bottleCount ?? 0;
  const makeable = bar?.makeableCount ?? 0;
  const handle = bar?.username ? `@${bar.username}` : "getmixwise.com";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background: "#1F3A2E",
          color: "#F9F7F2",
          fontFamily: "Georgia, 'Times New Roman', serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Soft light wash — no generic multi-stop brand gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 70% at 100% 0%, rgba(196,120,90,0.22) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 0% 100%, rgba(138,154,91,0.18) 0%, transparent 50%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lockupSrc}
            alt="mixwise"
            width={280}
            height={68}
            style={{ height: 52, width: "auto" }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "rgba(249,247,242,0.62)",
            }}
          >
            Home bar
          </div>
        </div>

        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -1,
              maxWidth: 920,
            }}
          >
            {name}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "rgba(249,247,242,0.72)" }}>
            {handle}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 40,
          }}
        >
          <div style={{ display: "flex", gap: 48 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 56, fontWeight: 700, lineHeight: 1 }}>
                {makeable}
              </div>
              <div style={{ display: "flex", fontSize: 22, color: "rgba(249,247,242,0.62)", marginTop: 6 }}>
                ready to pour
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 56, fontWeight: 700, lineHeight: 1 }}>
                {bottles}
              </div>
              <div style={{ display: "flex", fontSize: 22, color: "rgba(249,247,242,0.62)", marginTop: 6 }}>
                bottles in bar
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "rgba(249,247,242,0.55)",
            }}
          >
            getmixwise.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
