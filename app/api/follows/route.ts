import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { countTierBadges, getMixologistTier } from "@/lib/mixologistTiers";

export const dynamic = "force-dynamic";

async function requireUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { supabase, user: null as null };
  }
  return { supabase, user };
}

/** Follow a public bar profile by userId or username */
export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let body: { userId?: unknown; username?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    let followeeId = typeof body.userId === "string" ? body.userId : null;
    const username =
      typeof body.username === "string"
        ? body.username.trim().replace(/^@/, "").toLowerCase()
        : null;

    if (!followeeId && username) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", username)
        .maybeSingle();
      followeeId = profile?.id ?? null;
      if (!followeeId) {
        return NextResponse.json({ error: "Couldn't find that username" }, { status: 404 });
      }
    }

    if (!followeeId) {
      return NextResponse.json({ error: "userId or username is required" }, { status: 400 });
    }
    if (followeeId === user.id) {
      return NextResponse.json({ error: "You can't follow yourself" }, { status: 400 });
    }

    const { error } = await supabase.from("user_follows").insert({
      follower_id: user.id,
      followee_id: followeeId,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ success: true, following: true, userId: followeeId });
      }
      console.error("Follow error:", error);
      return NextResponse.json(
        { error: error.message || "Couldn't follow this bartender" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, following: true, userId: followeeId });
  } catch (error) {
    console.error("Follow API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** Unfollow */
export async function DELETE(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const followeeId = searchParams.get("userId");
    if (!followeeId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("user_follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("followee_id", followeeId);

    if (error) {
      console.error("Unfollow error:", error);
      return NextResponse.json(
        { error: error.message || "Couldn't unfollow" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, following: false });
  } catch (error) {
    console.error("Unfollow API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET ?userId=... → { following, followerCount, followingCount }
 * GET ?list=following|followers → list of people you follow / who follow you
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId");
    const list = searchParams.get("list");

    if (list === "following" || list === "followers") {
      if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

      const column = list === "following" ? "follower_id" : "followee_id";
      const joinColumn = list === "following" ? "followee_id" : "follower_id";

      const { data: edges, error } = await supabase
        .from("user_follows")
        .select(joinColumn)
        .eq(column, user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Follow list error:", error);
        return NextResponse.json({ error: "Failed to load list" }, { status: 500 });
      }

      const ids = (edges ?? []).map((row) => (row as Record<string, string>)[joinColumn]);
      if (ids.length === 0) {
        return NextResponse.json({ people: [] });
      }

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, display_name, username, public_slug, avatar_url, bio")
        .in("id", ids);

      if (profileError) {
        console.error("Follow list profiles error:", profileError);
        return NextResponse.json({ error: "Failed to load profiles" }, { status: 500 });
      }

      const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

      const { data: badges } = await supabase
        .from("user_badges")
        .select("user_id, badge_id")
        .in("user_id", ids);
      const byUser = new Map<string, string[]>();
      for (const row of badges ?? []) {
        const list = byUser.get(row.user_id) ?? [];
        list.push(row.badge_id);
        byUser.set(row.user_id, list);
      }
      const badgeCounts = new Map(
        [...byUser.entries()].map(([id, badgeIds]) => [id, countTierBadges(badgeIds)])
      );

      const people = ids
        .map((id) => byId.get(id))
        .filter(Boolean)
        .map((p) => {
          const tier = getMixologistTier(badgeCounts.get(p!.id) ?? 0);
          return {
            id: p!.id,
            display_name: p!.display_name,
            username: p!.username,
            public_slug: p!.public_slug,
            avatar_url: p!.avatar_url,
            bio: p!.bio,
            tier: { id: tier.id, name: tier.name },
            barPath: p!.username
              ? `/bar/${p!.username}`
              : p!.public_slug
                ? `/bar/${p!.public_slug}`
                : null,
          };
        });

      return NextResponse.json({ people });
    }

    if (!targetUserId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const [followersRes, followingRes, meFollowRes] = await Promise.all([
      supabase
        .from("user_follows")
        .select("follower_id", { count: "exact", head: true })
        .eq("followee_id", targetUserId),
      supabase
        .from("user_follows")
        .select("followee_id", { count: "exact", head: true })
        .eq("follower_id", targetUserId),
      user
        ? supabase
            .from("user_follows")
            .select("follower_id")
            .eq("follower_id", user.id)
            .eq("followee_id", targetUserId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    return NextResponse.json({
      followerCount: followersRes.count ?? 0,
      followingCount: followingRes.count ?? 0,
      following: Boolean(meFollowRes.data),
      isSelf: user?.id === targetUserId,
    });
  } catch (error) {
    console.error("Follows GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
