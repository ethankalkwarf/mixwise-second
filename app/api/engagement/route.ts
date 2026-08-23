import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  emptyEngagementPayload,
  mergeEngagementPayload,
  parseEngagementPayload,
  type EngagementPayload,
} from "@/lib/engagement.shared";

export const dynamic = "force-dynamic";

async function getAuthenticatedUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase: null, user: null };
  }

  return { supabase, user };
}

async function readEngagement(
  supabase: NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>["supabase"]>,
  userId: string
): Promise<EngagementPayload> {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("engagement_json")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return parseEngagementPayload(data?.engagement_json);
}

export async function GET() {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    if (!supabase || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const engagement = await readEngagement(supabase, user.id);
    return NextResponse.json({ engagement });
  } catch (error) {
    console.error("Engagement GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    if (!supabase || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let body: { engagement?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    const incoming = parseEngagementPayload(body.engagement);
    const existing = await readEngagement(supabase, user.id);
    const merged = mergeEngagementPayload(incoming, existing);

    const { data, error } = await supabase
      .from("user_preferences")
      .upsert(
        {
          user_id: user.id,
          engagement_json: merged,
        },
        { onConflict: "user_id" }
      )
      .select("engagement_json")
      .single();

    if (error) {
      console.error("Engagement PATCH error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update engagement" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      engagement: parseEngagementPayload(data?.engagement_json ?? emptyEngagementPayload()),
    });
  } catch (error) {
    console.error("Engagement PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
