import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { listeningUnlocked, resolveDeezerTrack } from "@/lib/listening";
import { DEEZER_TRACK_ID_RE } from "@/lib/spotifyShared";

export const dynamic = "force-dynamic";

type ListeningPayload = {
  listening_spotify_id: string | null;
  listening_deezer_id: string | null;
  listening_track_name: string | null;
  listening_track_artist: string | null;
};

const SELECT_FIELDS =
  "listening_spotify_id, listening_deezer_id, listening_track_name, listening_track_artist" as const;

async function assertListeningUnlocked(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string
): Promise<boolean> {
  const { data: badges } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId);
  return listeningUnlocked((badges ?? []).map((b) => b.badge_id));
}

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

    let body: {
      clear?: unknown;
      deezerId?: unknown;
      name?: unknown;
      artist?: unknown;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    if (body.clear === true) {
      const payload: ListeningPayload = {
        listening_spotify_id: null,
        listening_deezer_id: null,
        listening_track_name: null,
        listening_track_artist: null,
      };
      const { data, error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", user.id)
        .select(SELECT_FIELDS)
        .single();

      if (error) {
        console.error("Error clearing listening track:", error);
        return NextResponse.json(
          { error: error.message || "Failed to clear track" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, listening: data });
    }

    if (!(await assertListeningUnlocked(supabase, user.id))) {
      return NextResponse.json(
        { error: "Unlock Bar soundtrack at Mixologist (5 badges)", code: "LOCKED" },
        { status: 403 }
      );
    }

    const deezerId =
      typeof body.deezerId === "string" && DEEZER_TRACK_ID_RE.test(body.deezerId)
        ? body.deezerId
        : null;

    if (!deezerId) {
      return NextResponse.json({ error: "Pick a song from search" }, { status: 400 });
    }

    let name =
      typeof body.name === "string" && body.name.trim()
        ? body.name.trim().slice(0, 200)
        : null;
    let artist =
      typeof body.artist === "string" && body.artist.trim()
        ? body.artist.trim().slice(0, 200)
        : null;

    if (!name || !artist) {
      const resolved = await resolveDeezerTrack(deezerId);
      if (!resolved) {
        return NextResponse.json({ error: "Could not resolve that track" }, { status: 400 });
      }
      name = name || resolved.name;
      artist = artist || resolved.artists;
    }

    const payload: ListeningPayload = {
      listening_spotify_id: null,
      listening_deezer_id: deezerId,
      listening_track_name: name,
      listening_track_artist: artist,
    };

    const { data, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", user.id)
      .select(SELECT_FIELDS)
      .single();

    if (error) {
      console.error("Error updating listening track:", error);
      return NextResponse.json(
        { error: error.message || "Failed to save track" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, listening: data });
  } catch (error) {
    console.error("Listening track API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
