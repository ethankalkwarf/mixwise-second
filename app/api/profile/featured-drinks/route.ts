import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type FeaturedSlot = {
  cocktail_id: string;
  cocktail_name: string | null;
  cocktail_slug: string | null;
  cocktail_image_url: string | null;
};

type FeaturedBody = {
  slots?: Array<FeaturedSlot | null>;
};

const MAX_SLOTS = 3;

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

    const { data, error } = await supabase
      .from("profile_featured_drinks")
      .select("*")
      .eq("user_id", user.id)
      .order("rank", { ascending: true });

    if (error) {
      console.error("Featured drinks GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ slots: data ?? [] });
  } catch (error) {
    console.error("Featured drinks GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
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

    let body: FeaturedBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!Array.isArray(body.slots)) {
      return NextResponse.json({ error: "slots array is required" }, { status: 400 });
    }

    if (body.slots.length > MAX_SLOTS) {
      return NextResponse.json(
        { error: `At most ${MAX_SLOTS} featured drinks allowed` },
        { status: 400 }
      );
    }

    const normalized = body.slots
      .map((slot, index) => {
        if (!slot?.cocktail_id) return null;
        return {
          user_id: user.id,
          cocktail_id: slot.cocktail_id,
          rank: index + 1,
          cocktail_name: slot.cocktail_name ?? null,
          cocktail_slug: slot.cocktail_slug ?? null,
          cocktail_image_url: slot.cocktail_image_url ?? null,
          updated_at: new Date().toISOString(),
        };
      })
      .filter(Boolean) as Array<{
      user_id: string;
      cocktail_id: string;
      rank: number;
      cocktail_name: string | null;
      cocktail_slug: string | null;
      cocktail_image_url: string | null;
      updated_at: string;
    }>;

    const cocktailIds = normalized.map((row) => row.cocktail_id);
    if (new Set(cocktailIds).size !== cocktailIds.length) {
      return NextResponse.json(
        { error: "Each featured drink must be unique" },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from("profile_featured_drinks")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Featured drinks delete error:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    if (normalized.length > 0) {
      const { error: insertError } = await supabase
        .from("profile_featured_drinks")
        .insert(normalized);

      if (insertError) {
        console.error("Featured drinks insert error:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    const { data, error: fetchError } = await supabase
      .from("profile_featured_drinks")
      .select("*")
      .eq("user_id", user.id)
      .order("rank", { ascending: true });

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, slots: data ?? [] });
  } catch (error) {
    console.error("Featured drinks PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
