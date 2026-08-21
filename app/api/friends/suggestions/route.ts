import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { countTierBadges, getMixologistTier } from "@/lib/mixologistTiers";

export const dynamic = "force-dynamic";

/**
 * Suggested people to follow:
 * 1) Mutual — followed by people you follow
 * 2) Popular public bars (fallback)
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

    const limit = Math.min(Math.max(Number(new URL(request.url).searchParams.get("limit") || 12), 1), 24);

    const { data: followingEdges } = await supabase
      .from("user_follows")
      .select("followee_id")
      .eq("follower_id", user.id);

    const followingIds = new Set((followingEdges ?? []).map((e) => e.followee_id));
    followingIds.add(user.id);

    const scores = new Map<string, { mutual: number; reason: string }>();

    if (followingEdges && followingEdges.length > 0) {
      const followeeList = followingEdges.map((e) => e.followee_id);
      const { data: secondDegree } = await supabase
        .from("user_follows")
        .select("follower_id, followee_id")
        .in("follower_id", followeeList)
        .limit(500);

      for (const edge of secondDegree ?? []) {
        if (followingIds.has(edge.followee_id)) continue;
        const prev = scores.get(edge.followee_id) ?? { mutual: 0, reason: "Followed by friends" };
        prev.mutual += 1;
        scores.set(edge.followee_id, prev);
      }
    }

    let candidateIds = [...scores.entries()]
      .sort((a, b) => b[1].mutual - a[1].mutual)
      .map(([id]) => id)
      .slice(0, limit);

    // Fallback: recent public bars you're not following
    if (candidateIds.length < limit) {
      const { data: publics } = await supabase
        .from("profiles")
        .select("id")
        .not("username", "is", null)
        .neq("id", user.id)
        .order("updated_at", { ascending: false })
        .limit(40);

      for (const p of publics ?? []) {
        if (followingIds.has(p.id) || scores.has(p.id)) continue;
        scores.set(p.id, { mutual: 0, reason: "Public bar on MixWise" });
        candidateIds.push(p.id);
        if (candidateIds.length >= limit) break;
      }
    }

    candidateIds = candidateIds.slice(0, limit);
    if (candidateIds.length === 0) {
      return NextResponse.json({ people: [] });
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, username, public_slug, avatar_url, bio")
      .in("id", candidateIds);

    // Filter to public-bar-enabled via preferences
    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("user_id")
      .in("user_id", candidateIds)
      .eq("public_bar_enabled", true);
    const publicSet = new Set((prefs ?? []).map((p) => p.user_id));

    const { data: badges } = await supabase
      .from("user_badges")
      .select("user_id, badge_id")
      .in("user_id", candidateIds);
    const byUser = new Map<string, string[]>();
    for (const row of badges ?? []) {
      const list = byUser.get(row.user_id) ?? [];
      list.push(row.badge_id);
      byUser.set(row.user_id, list);
    }

    const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
    const people = candidateIds
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p && publicSet.has(p.id) && (p.username || p.public_slug)))
      .map((p) => {
        const meta = scores.get(p.id);
        const tier = getMixologistTier(countTierBadges(byUser.get(p.id) ?? []));
        return {
          id: p.id,
          display_name: p.display_name,
          username: p.username,
          avatar_url: p.avatar_url,
          bio: p.bio,
          tier: { id: tier.id, name: tier.name },
          reason:
            meta && meta.mutual > 0
              ? `Followed by ${meta.mutual} friend${meta.mutual === 1 ? "" : "s"}`
              : meta?.reason || "Suggested for you",
          barPath: p.username
            ? `/bar/${p.username}`
            : p.public_slug
              ? `/bar/${p.public_slug}`
              : null,
        };
      });

    return NextResponse.json({ people });
  } catch (error) {
    console.error("Suggestions API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
