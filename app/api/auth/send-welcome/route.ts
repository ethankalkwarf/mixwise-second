/**
 * Send Welcome Email API Route
 *
 * Sends welcome email once after the user has a confirmed email.
 * Requires an authenticated session (user can only email themselves).
 */

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { sendWelcomeEmail } from "@/lib/email/send-welcome";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.email_confirmed_at) {
      return NextResponse.json({ ok: true, skipped: true, reason: "email_not_confirmed" });
    }

    const body = await request.json().catch(() => ({}));
    const displayName =
      (typeof body.displayName === "string" && body.displayName.trim()) ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email.split("@")[0];

    const result = await sendWelcomeEmail({
      userId: user.id,
      userEmail: user.email,
      displayName,
    });

    if (result.alreadySent || result.optedOut) {
      return NextResponse.json({ ok: true, ...result });
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send welcome email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, emailSent: true, resendId: result.resendId });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Send Welcome] Unexpected error:", errorMessage);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
