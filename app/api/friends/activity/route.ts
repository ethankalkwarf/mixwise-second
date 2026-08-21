import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getBadge } from "@/lib/badges";
import { getMixologistTier, countTierBadges } from "@/lib/mixologistTiers";
import type { ActivityItem } from "@/lib/activity";

export const dynamic = "force-dynamic";

export type { ActivityItem } from "@/lib/activity";

/**
 * Activity from people you follow (favorites, badges, bar adds).
 * GET /api/friends/activity?limit=40
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const limit = Math.min(Math.max(Number(new URL(request.url).searchParams.get("limit") || 40), 1), 80);

    const { data: edges, error: followError } = await supabase
      .from("user_follows")
      .select("followee_id")
      .eq("follower_id", user.id);

    if (followError) {
      console.error("Activity followees error:", followError);
      return NextResponse.json({ error: "Failed to load feed" }, { status: 500 });
    }

    const followeeIds = (edges ?? []).map((e) => e.followee_id);
    if (followeeIds.length === 0) {
      return NextResponse.json({ items: [], followingCount: 0 });
    }

    const since = new Date();
    since.setDate(since.getDate() - 60);
    const sinceIso = since.toISOString();

    const [profilesRes, favoritesRes, badgesRes, ingredientsRes, allBadgesRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name, username, public_slug, avatar_url")
        .in("id", followeeIds),
      supabase
        .from("favorites")
        .select("id, user_id, cocktail_id, cocktail_name, cocktail_slug, cocktail_image_url, created_at")
        .in("user_id", followeeIds)
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("user_badges")
        .select("id, user_id, badge_id, earned_at")
        .in("user_id", followeeIds)
        .gte("earned_at", sinceIso)
        .order("earned_at", { ascending: false })
        .limit(limit),
      supabase
        .from("bar_ingredients")
        .select("id, user_id, ingredient_id, ingredient_name, created_at")
        .in("user_id", followeeIds)
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase.from("user_badges").select("user_id, badge_id").in("user_id", followeeIds),
    ]);

    const badgesByUser = new Map<string, string[]>();
    for (const row of allBadgesRes.data ?? []) {
      const list = badgesByUser.get(row.user_id) ?? [];
      list.push(row.badge_id);
      badgesByUser.set(row.user_id, list);
    }

    const actors = new Map(
      (profilesRes.data ?? []).map((p) => {
        const tier = getMixologistTier(countTierBadges(badgesByUser.get(p.id) ?? []));
        return [
          p.id,
          {
            id: p.id,
            display_name: p.display_name,
            username: p.username,
            avatar_url: p.avatar_url,
            barPath: p.username
              ? `/bar/${p.username}`
              : p.public_slug
                ? `/bar/${p.public_slug}`
                : null,
            tierName: tier.name,
          },
        ] as const;
      })
    );

    const items: ActivityItem[] = [];

    for (const row of favoritesRes.data ?? []) {
      const actor = actors.get(row.user_id);
      if (!actor) continue;
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
      const actor = actors.get(row.user_id);
      if (!actor) continue;
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
      const actor = actors.get(row.user_id);
      if (!actor) continue;
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

    return NextResponse.json({
      items: items.slice(0, limit),
      followingCount: followeeIds.length,
    });
  } catch (error) {
    console.error("Friends activity API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
