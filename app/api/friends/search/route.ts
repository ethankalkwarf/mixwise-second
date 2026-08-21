import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { countTierBadges, getMixologistTier } from "@/lib/mixologistTiers";

export const dynamic = "force-dynamic";

function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Search public bar profiles by username or display name.
 * GET ?q=ethan&limit=20
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 20), 1), 40);

    if (q.length < 2) {
      return NextResponse.json({ people: [], message: "Type at least 2 characters" });
    }

    // Prefer authenticated client (same RLS); fall back to anon for guests
    let supabase;
    let currentUserId: string | null = null;
    try {
      supabase = await createServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      currentUserId = user?.id ?? null;
    } catch {
      supabase = createPublicClient();
    }

    const pattern = `%${q.replace(/[%_,]/g, " ").replace(/\s+/g, " ").trim()}%`;
    if (pattern === "%%") {
      return NextResponse.json({ people: [], message: "Type at least 2 characters" });
    }

    const [byUsername, byDisplay] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name, username, public_slug, avatar_url, bio")
        .ilike("username", pattern)
        .limit(limit),
      supabase
        .from("profiles")
        .select("id, display_name, username, public_slug, avatar_url, bio")
        .ilike("display_name", pattern)
        .limit(limit),
    ]);

    if (byUsername.error || byDisplay.error) {
      console.error("Friends search error:", byUsername.error || byDisplay.error);
      return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }

    const merged = new Map<string, NonNullable<(typeof byUsername.data)>[number]>();
    for (const p of [...(byUsername.data ?? []), ...(byDisplay.data ?? [])]) {
      merged.set(p.id, p);
    }

    // RLS already limits to owner + public bars; require a shareable slug for discovery.
    const discoverable = [...merged.values()]
      .filter((p) => Boolean(p.username || p.public_slug))
      .filter((p) => !currentUserId || p.id !== currentUserId)
      .slice(0, limit);

    const ids = discoverable.map((p) => p.id);
    let badgeCounts = new Map<string, number>();

    if (ids.length > 0) {
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
      badgeCounts = new Map(
        [...byUser.entries()].map(([id, badgeIds]) => [id, countTierBadges(badgeIds)])
      );
    }

    const people = discoverable.map((p) => {
      const tier = getMixologistTier(badgeCounts.get(p.id) ?? 0);
      return {
        id: p.id,
        display_name: p.display_name,
        username: p.username,
        public_slug: p.public_slug,
        avatar_url: p.avatar_url,
        bio: p.bio,
        tier: { id: tier.id, name: tier.name },
        barPath: p.username
          ? `/bar/${p.username}`
          : p.public_slug
            ? `/bar/${p.public_slug}`
            : null,
      };
    });

    return NextResponse.json({ people });
  } catch (error) {
    console.error("Friends search API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
