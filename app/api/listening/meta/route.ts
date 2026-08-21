import { NextRequest, NextResponse } from "next/server";
import { resolveDeezerTrack } from "@/lib/listening";
import { DEEZER_TRACK_ID_RE } from "@/lib/spotifyShared";

export const dynamic = "force-dynamic";

/** Public metadata for a pinned Deezer track (preview URL + art). */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("deezerId")?.trim() ?? "";
  if (!DEEZER_TRACK_ID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid track" }, { status: 400 });
  }

  try {
    const track = await resolveDeezerTrack(id);
    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: track.id,
      name: track.name,
      artists: track.artists,
      albumArtUrl: track.albumArtUrl,
      previewUrl: track.previewUrl,
      externalUrl: track.externalUrl,
    });
  } catch (error) {
    console.error("Listening meta error:", error);
    return NextResponse.json({ error: "Failed to load track" }, { status: 500 });
  }
}
