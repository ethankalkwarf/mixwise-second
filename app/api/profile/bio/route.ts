import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const BIO_MAX_LENGTH = 160;

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

    let body: { bio?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    if (!("bio" in body)) {
      return NextResponse.json({ error: "bio is required" }, { status: 400 });
    }

    let bio: string | null;
    if (body.bio === null || body.bio === undefined) {
      bio = null;
    } else if (typeof body.bio !== "string") {
      return NextResponse.json({ error: "bio must be a string" }, { status: 400 });
    } else {
      const trimmed = body.bio.trim();
      if (trimmed.length > BIO_MAX_LENGTH) {
        return NextResponse.json(
          { error: `Bio must be ${BIO_MAX_LENGTH} characters or less` },
          { status: 400 }
        );
      }
      bio = trimmed || null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ bio })
      .eq("id", user.id)
      .select("bio")
      .single();

    if (error) {
      console.error("Error updating bio:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update bio" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, bio: data?.bio ?? null });
  } catch (error) {
    console.error("Bio API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
