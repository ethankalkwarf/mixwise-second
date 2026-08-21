import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { listeningUnlocked, searchListeningTracks } from "@/lib/listening";

export const dynamic = "force-dynamic";

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

    const { data: badges } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", user.id);
    const badgeIds = (badges ?? []).map((b) => b.badge_id);
    if (!listeningUnlocked(badgeIds)) {
      return NextResponse.json(
        { error: "Unlock Bar soundtrack at Mixologist (5 badges)", code: "LOCKED" },
        { status: 403 }
      );
    }

    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    if (q.length < 2) {
      return NextResponse.json({ tracks: [] });
    }
    if (q.length > 120) {
      return NextResponse.json({ error: "Query too long" }, { status: 400 });
    }

    const tracks = await searchListeningTracks(q, 8);
    return NextResponse.json({ tracks });
  } catch (error) {
    console.error("Listening search API error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
