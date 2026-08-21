import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getBadge } from "@/lib/badges";
import { getMixologistTier, countTierBadges } from "@/lib/mixologistTiers";
import type { ActivityItem } from "@/lib/activity";

export const dynamic = "force-dynamic";

/**
 * Public activity for a bar profile (favorites, badges, bar adds).
 * Only available when public_bar_enabled.
 * GET /api/bar/activity?userId=…&limit=30
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId")?.trim();
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 30), 1), 60);

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("public_bar_enabled")
      .eq("user_id", userId)
      .maybeSingle();

    if (!prefs?.public_bar_enabled) {
      return NextResponse.json({ error: "Bar is private" }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, display_name, username, public_slug, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const since = new Date();
    since.setDate(since.getDate() - 90);
    const sinceIso = since.toISOString();

    const [favoritesRes, badgesRes, ingredientsRes, allBadgesRes] = await Promise.all([
      supabase
        .from("favorites")
        .select("id, user_id, cocktail_id, cocktail_name, cocktail_slug, cocktail_image_url, created_at")
        .eq("user_id", userId)
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("user_badges")
        .select("id, user_id, badge_id, earned_at")
        .eq("user_id", userId)
        .gte("earned_at", sinceIso)
        .order("earned_at", { ascending: false })
        .limit(limit),
      supabase
        .from("bar_ingredients")
        .select("id, user_id, ingredient_id, ingredient_name, created_at")
        .eq("user_id", userId)
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase.from("user_badges").select("badge_id").eq("user_id", userId),
    ]);

    const tier = getMixologistTier(
      countTierBadges((allBadgesRes.data ?? []).map((r) => r.badge_id))
    );
    const actor: ActivityItem["actor"] = {
      id: profile.id,
      display_name: profile.display_name,
      username: profile.username,
      avatar_url: profile.avatar_url,
      barPath: profile.username
        ? `/bar/${profile.username}`
        : profile.public_slug
          ? `/bar/${profile.public_slug}`
          : null,
      tierName: tier.name,
    };

    const items: ActivityItem[] = [];

    for (const row of favoritesRes.data ?? []) {
      items.push({
        id: `favorite-${row.id}`,
        type: "favorite",
        createdAt: row.created_at,
        actor,
        favorite: {
          cocktail_id: row.cocktail_id,
          cocktail_name: row.cocktail_name,
          cocktail_slug: row.cocktail_slug,
          cocktail_image_url: row.cocktail_image_url,
        },
      });
    }

    for (const row of badgesRes.data ?? []) {
      const def = getBadge(row.badge_id);
      items.push({
        id: `badge-${row.id}`,
        type: "badge",
        createdAt: row.earned_at,
        actor,
        badge: {
          badge_id: row.badge_id,
          name: def?.name ?? row.badge_id,
          icon: def?.icon ?? "🏅",
        },
      });
    }

    for (const row of ingredientsRes.data ?? []) {
      items.push({
        id: `bar-${row.id}`,
        type: "bar_ingredient",
        createdAt: row.created_at,
        actor,
        ingredient: {
          ingredient_id: String(row.ingredient_id),
          ingredient_name: row.ingredient_name,
        },
      });
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ items: items.slice(0, limit) });
  } catch (error) {
    console.error("Bar activity API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
