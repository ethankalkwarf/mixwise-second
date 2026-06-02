/**
 * Send Signup Notification API Route
 *
 * Notifies hello@getmixwise.com of a new OAuth signup.
 * Requires authenticated session; only for recently created accounts.
 */

import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { sendSignupNotification } from "@/lib/email/signup-notification";
import { isRecentlyCreatedUser } from "@/lib/email/send-welcome";

export const dynamic = "force-dynamic";

export async function POST() {
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

    if (!isRecentlyCreatedUser(user.created_at)) {
      return NextResponse.json({ ok: true, skipped: true, reason: "not_new_user" });
    }

    const isOAuthSignup =
      user.identities?.some((i) => i.provider === "google" || i.provider === "apple") ??
      false;

    if (!isOAuthSignup) {
      return NextResponse.json({ ok: true, skipped: true, reason: "email_signup_handled_server_side" });
    }

    let signupMethod = "OAuth";
    const provider = user.identities?.[0]?.provider;
    if (provider === "google") signupMethod = "Google";
    else if (provider === "apple") signupMethod = "Apple";

    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email.split("@")[0];

    const result = await sendSignupNotification({
      userId: user.id,
      userEmail: user.email,
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
