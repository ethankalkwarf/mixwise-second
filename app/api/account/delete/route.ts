import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const CONFIRM_PHRASE = "DELETE";

/**
 * Permanently deletes the authenticated user's account and cascaded app data.
 * Requires body: { confirm: "DELETE" }.
 *
 * Storage avatars are removed first — Auth delete fails if the user owns objects.
 */
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

    let body: { confirm?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (body.confirm !== CONFIRM_PHRASE) {
      return NextResponse.json(
        { error: `Type ${CONFIRM_PHRASE} to confirm account deletion` },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Remove avatar objects so auth.admin.deleteUser succeeds.
    try {
      const { data: existing } = await admin.storage.from("avatars").list(user.id);
      if (existing?.length) {
        await admin.storage
          .from("avatars")
          .remove(existing.map((f) => `${user.id}/${f.name}`));
      }
    } catch (storageErr) {
      console.warn("[account/delete] Avatar cleanup warning:", storageErr);
    }

    // Soft-unlink marketing signup rows (no FK to auth.users).
    if (user.email) {
      try {
        await admin
          .from("email_signups")
          .delete()
          .eq("email", user.email.toLowerCase());
      } catch (emailErr) {
        console.warn("[account/delete] email_signups cleanup warning:", emailErr);
      }
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("[account/delete] Auth delete failed:", deleteError);
      return NextResponse.json(
        { error: deleteError.message || "Failed to delete account" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[account/delete] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
