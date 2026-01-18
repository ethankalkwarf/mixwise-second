/**
 * Send Signup Notification API Route
 *
 * API endpoint wrapper for sendSignupNotification function.
 * This endpoint is kept for backwards compatibility and external calls.
 */

import { NextRequest, NextResponse } from "next/server";
import { sendSignupNotification } from "@/lib/email/signup-notification";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { userId, userEmail, displayName, signupMethod = "Unknown" } = body;

    // Validate required fields
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!userEmail || typeof userEmail !== "string") {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Call the shared function
    const result = await sendSignupNotification({
      userId,
      userEmail,
      displayName,
      signupMethod,
    });

    if (result.skipped) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send notification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("[Signup Notification API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

