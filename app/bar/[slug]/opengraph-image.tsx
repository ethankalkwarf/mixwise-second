import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getUserBarIngredients } from "@/lib/cocktails.server";
import { getMixCocktails, getStapleIngredientIds } from "@/lib/cocktails.server";
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

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Owner UUID routes are private — generic card
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      slug
    );

  const bar = isUuid ? null : await loadBar(slug).catch(() => null);
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
          padding: 64,
          background: "linear-gradient(135deg, #1F3A2E 0%, #2F4A3A 45%, #5C4033 100%)",
          color: "#F9F7F2",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#C4B5A0",
            }}
          >
            MixWise Bar
          </div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, lineHeight: 1.05 }}>
            {name}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#D4C4B0" }}>{handle}</div>
        </div>

        <div style={{ display: "flex", gap: 48, alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 56, fontWeight: 700 }}>{makeable}</div>
            <div style={{ display: "flex", fontSize: 22, color: "#C4B5A0" }}>
              cocktails ready
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 56, fontWeight: 700 }}>{bottles}</div>
            <div style={{ display: "flex", fontSize: 22, color: "#C4B5A0" }}>
              bottles in bar
            </div>
          </div>
          <div
            style={{
              display: "flex",
              marginLeft: "auto",
              fontSize: 24,
              color: "#E8D5C4",
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
