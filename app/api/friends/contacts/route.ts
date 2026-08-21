import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { hashPhoneForMatch, hashPhoneList } from "@/lib/phoneHash";
import { countTierBadges, getMixologistTier } from "@/lib/mixologistTiers";

export const dynamic = "force-dynamic";

/** Save / clear your findable phone (hashed only) */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const clear = body.clear === true || body.phone === null;
    const findable = body.findable !== false;

    if (clear) {
      const { error } = await supabase
        .from("profiles")
        .update({ phone_hash: null, phone_findable: false })
        .eq("id", user.id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, phone_findable: false });
    }

    if (typeof body.phone !== "string") {
      return NextResponse.json({ error: "phone is required" }, { status: 400 });
    }

    const phoneHash = hashPhoneForMatch(body.phone);
    if (!phoneHash) {
      return NextResponse.json(
        { error: "Enter a valid phone number (include area code)" },
        { status: 400 }
      );
    }

    // Unique constraint — another user may already have this hash
    const { error } = await supabase
      .from("profiles")
      .update({ phone_hash: phoneHash, phone_findable: findable })
      .eq("id", user.id);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "That number is already linked to another account" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, phone_findable: findable });
  } catch (error) {
    console.error("Phone PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** Match contact phone numbers to findable MixWise users */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const phones = Array.isArray(body.phones)
      ? body.phones.filter((p: unknown) => typeof p === "string").slice(0, 2000)
      : [];

    if (phones.length === 0) {
      return NextResponse.json({ people: [], matched: 0 });
    }

    const hashes = hashPhoneList(phones);
    if (hashes.length === 0) {
      return NextResponse.json({ people: [], matched: 0 });
    }

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, display_name, username, public_slug, avatar_url, bio")
      .eq("phone_findable", true)
      .in("phone_hash", hashes)
      .neq("id", user.id)
      .limit(50);

    if (error) {
      console.error("Contacts match error:", error);
      return NextResponse.json({ error: "Match failed" }, { status: 500 });
    }

    const ids = (profiles ?? []).map((p) => p.id);
    let followingSet = new Set<string>();
    if (ids.length > 0) {
      const { data: edges } = await supabase
        .from("user_follows")
        .select("followee_id")
        .eq("follower_id", user.id)
        .in("followee_id", ids);
      followingSet = new Set((edges ?? []).map((e) => e.followee_id));
    }

    const badgeCounts = new Map<string, number>();
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
      for (const [id, list] of byUser) {
        badgeCounts.set(id, countTierBadges(list));
      }
    }

    const people = (profiles ?? [])
      .filter((p) => p.username || p.public_slug)
      .map((p) => {
        const tier = getMixologistTier(badgeCounts.get(p.id) ?? 0);
        return {
          id: p.id,
          display_name: p.display_name,
          username: p.username,
          avatar_url: p.avatar_url,
          bio: p.bio,
          tier: { id: tier.id, name: tier.name },
          following: followingSet.has(p.id),
          barPath: p.username
            ? `/bar/${p.username}`
            : p.public_slug
              ? `/bar/${p.public_slug}`
              : null,
        };
      });

    return NextResponse.json({ people, matched: people.length });
  } catch (error) {
    console.error("Contacts match API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data } = await supabase
      .from("profiles")
      .select("phone_findable, phone_hash")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      phone_findable: Boolean(data?.phone_findable && data?.phone_hash),
    });
  } catch (error) {
    console.error("Phone GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
