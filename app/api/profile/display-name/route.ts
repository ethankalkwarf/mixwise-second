import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { debugLog } from "@/lib/debugLog";

export const dynamic = "force-dynamic";

const NAME_MAX_LENGTH = 100;

function normalizeName(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") {
    throw new Error("INVALID_TYPE");
  }
  const trimmed = value.trim();
  if (trimmed.length > NAME_MAX_LENGTH) {
    throw new Error("TOO_LONG");
  }
  return trimmed || null;
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const updatePayload: {
      display_name?: string | null;
      first_name?: string | null;
      last_name?: string | null;
    } = {};

    try {
      if ("display_name" in body) {
        updatePayload.display_name = normalizeName(body.display_name);
      }
      if ("first_name" in body) {
        updatePayload.first_name = normalizeName(body.first_name);
      }
      if ("last_name" in body) {
        updatePayload.last_name = normalizeName(body.last_name);
      }
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_TYPE") {
        return NextResponse.json(
          { error: "Name fields must be strings" },
          { status: 400 }
        );
      }
      if (err instanceof Error && err.message === "TOO_LONG") {
        return NextResponse.json(
          { error: `Names must be ${NAME_MAX_LENGTH} characters or less` },
          { status: 400 }
        );
      }
      throw err;
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { error: "No profile fields provided" },
        { status: 400 }
      );
    }

    const { data: updatedData, error: updateError } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id)
      .select("display_name, first_name, last_name")
      .single();

    if (updateError) {
      console.error("Error updating profile names:", updateError);
      return NextResponse.json(
        { error: updateError.message || "Failed to update profile" },
        { status: 500 }
      );
    }

    if (updatedData) {
      debugLog("Profile name update succeeded:", {
        userId: user.id,
        ...updatedData,
      });

      return NextResponse.json({
        success: true,
        display_name: updatedData.display_name,
        first_name: updatedData.first_name,
        last_name: updatedData.last_name,
      });
    }

    return NextResponse.json({
      success: true,
      ...updatePayload,
    });
  } catch (error) {
    console.error("Profile name API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
