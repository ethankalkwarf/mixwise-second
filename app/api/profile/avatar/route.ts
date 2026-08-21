import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

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

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Use a JPEG, PNG, WebP, or GIF image" },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image must be 2MB or smaller" }, { status: 400 });
    }

    const ext = extensionForMime(file.type);
    const path = `${user.id}/avatar.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    // Clear previous avatar variants so we don't leave stale files
    const { data: existing } = await supabase.storage.from("avatars").list(user.id);
    if (existing?.length) {
      await supabase.storage
        .from("avatars")
        .remove(existing.map((f) => `${user.id}/${f.name}`));
    }

    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, bytes, {
      contentType: file.type,
      upsert: true,
      cacheControl: "3600",
    });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      return NextResponse.json(
        { error: uploadError.message || "Failed to upload avatar" },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);

    // Cache-bust so browsers pick up replacements at the same path
    const avatarUrl = `${publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id);

    if (updateError) {
      console.error("Avatar profile update error:", updateError);
      return NextResponse.json(
        { error: updateError.message || "Failed to save avatar" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, avatar_url: avatarUrl });
  } catch (error) {
    console.error("Avatar API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: existing } = await supabase.storage.from("avatars").list(user.id);
    if (existing?.length) {
      await supabase.storage
        .from("avatars")
        .remove(existing.map((f) => `${user.id}/${f.name}`));
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || "Failed to remove avatar" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, avatar_url: null });
  } catch (error) {
    console.error("Avatar delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
