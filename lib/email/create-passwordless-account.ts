/**
 * Shared helpers for creating MixWise accounts from an email address
 * (passwordless magic-link, or password set in one step from the list welcome).
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { createResendClient, MIXWISE_FROM_EMAIL } from "@/lib/email/resend";
import { finishAccountSetupTemplate } from "@/lib/email/templates";
import { getAuthCallbackUrl } from "@/lib/site";
import { buildSafeAuthUrl } from "@/lib/email/auth-links";
import { sendSignupNotification } from "@/lib/email/signup-notification";
import { debugLog } from "@/lib/debugLog";

export async function createPasswordlessAccountFromEmail(options: {
  email: string;
  source: string;
  requestUrl?: URL;
  nextPath?: string;
  notify?: boolean;
  sendMagicLinkEmail?: boolean;
}): Promise<{
  ok: boolean;
  userId?: string;
  isNewUser?: boolean;
  emailSent?: boolean;
  setupUrl?: string;
  error?: string;
}> {
  const {
    email,
    source,
    requestUrl,
    nextPath = "/mix",
    notify = true,
    sendMagicLinkEmail = true,
  } = options;

  const trimmedEmail = email.trim().toLowerCase();

  let supabaseAdmin;
  try {
    supabaseAdmin = createAdminClient();
  } catch (adminError) {
    console.error("[Create Account] Admin client failed:", adminError);
    return { ok: false, error: "Server configuration error" };
  }

  let userId: string | null = null;
  let isNewUser = false;

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: trimmedEmail,
    email_confirm: true,
    user_metadata: {
      needs_password: true,
      signup_source: source,
    },
  });

  if (!createError && created.user?.id) {
    userId = created.user.id;
    isNewUser = true;
  } else if (createError) {
    const alreadyExists =
      createError.message?.toLowerCase().includes("already") ||
      createError.message?.toLowerCase().includes("registered") ||
      (createError as { code?: string }).code === "email_exists";

    if (!alreadyExists) {
      console.error("[Create Account] createUser failed:", createError);
      return { ok: false, error: "Failed to create account" };
    }
  }

  const redirectTo = `${getAuthCallbackUrl(requestUrl)}?next=${encodeURIComponent(nextPath)}`;
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: trimmedEmail,
    options: { redirectTo },
  });

  if (!userId && linkData?.user?.id) {
    userId = linkData.user.id;
  }

  if (!userId) {
    console.error("[Create Account] Could not resolve user id", { createError, linkError });
    return { ok: false, error: "Failed to create account" };
  }

  // For brand-new email-list conversions, ensure needs_password stays true
  if (isNewUser) {
    try {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          needs_password: true,
          signup_source: source,
        },
      });
    } catch {
      // non-fatal
    }
  }

  try {
    await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email: trimmedEmail,
        display_name: trimmedEmail.split("@")[0],
        role: "free",
        preferences: {},
      },
      { onConflict: "id" }
    );
  } catch (profileError) {
    console.error("[Create Account] Profile upsert failed (non-fatal):", profileError);
  }

  let emailSent = false;
  let setupUrl: string | undefined;

  if (linkError || !linkData?.properties?.action_link) {
    console.error("[Create Account] generateLink failed:", linkError);
  } else {
    setupUrl = buildSafeAuthUrl(linkData.properties.action_link, requestUrl);

    if (sendMagicLinkEmail) {
      if (!process.env.RESEND_API_KEY || !MIXWISE_FROM_EMAIL) {
        console.warn("[Create Account] Resend not configured — skipping user email");
      } else {
        const template = finishAccountSetupTemplate({
          setupUrl,
          userEmail: trimmedEmail,
        });
        try {
          const resend = createResendClient();
          const { error: emailError } = await resend.emails.send({
            from: MIXWISE_FROM_EMAIL,
            replyTo: "hello@getmixwise.com",
            to: trimmedEmail,
            subject: template.subject,
            html: template.html,
            text: template.text,
            tags: [
              { name: "category", value: "finish_account_setup" },
              { name: "source", value: source },
              { name: "environment", value: process.env.NODE_ENV || "production" },
            ],
          });
          if (emailError) {
            console.error("[Create Account] Resend send failed:", emailError);
          } else {
            emailSent = true;
            debugLog(`[Create Account] Magic link emailed to ${trimmedEmail}`);
          }
        } catch (sendErr) {
          console.error("[Create Account] Resend exception:", sendErr);
        }
      }
    }
  }

  if (notify) {
    sendSignupNotification({
      userId,
      userEmail: trimmedEmail,
      displayName: trimmedEmail.split("@")[0],
      signupMethod: isNewUser
        ? `Account creation (${source})`
        : `Account sign-in link (${source})`,
    }).catch((err) => {
      console.error("[Create Account] Notification failed (non-fatal):", err);
    });
  }

  return {
    ok: true,
    userId,
    isNewUser,
    emailSent,
    setupUrl,
  };
}

/**
 * List-welcome conversion: create a confirmed account with the password they
 * just typed, so the join page can sign them in immediately.
 */
export async function createAccountWithPassword(options: {
  email: string;
  password: string;
  source: string;
}): Promise<{
  ok: boolean;
  userId?: string;
  alreadyExists?: boolean;
  error?: string;
}> {
  const trimmedEmail = options.email.trim().toLowerCase();
  const password = options.password;

  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters" };
  }

  let supabaseAdmin;
  try {
    supabaseAdmin = createAdminClient();
  } catch (adminError) {
    console.error("[Create Account] Admin client failed:", adminError);
    return { ok: false, error: "Server configuration error" };
  }

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: trimmedEmail,
    password,
    email_confirm: true,
    user_metadata: {
      needs_password: false,
      signup_source: options.source,
    },
  });

  if (createError) {
    const alreadyExists =
      createError.message?.toLowerCase().includes("already") ||
      createError.message?.toLowerCase().includes("registered") ||
      (createError as { code?: string }).code === "email_exists";

    if (alreadyExists) {
      return {
        ok: false,
        alreadyExists: true,
        error: "This email already has a MixWise account.",
      };
    }

    console.error("[Create Account] createUser with password failed:", createError);
    return { ok: false, error: "Failed to create account" };
  }

  const userId = created.user?.id;
  if (!userId) {
    return { ok: false, error: "Failed to create account" };
  }

  try {
    await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email: trimmedEmail,
        display_name: trimmedEmail.split("@")[0],
        role: "free",
        preferences: {},
      },
      { onConflict: "id" }
    );
  } catch (profileError) {
    console.error("[Create Account] Profile upsert failed (non-fatal):", profileError);
  }

  sendSignupNotification({
    userId,
    userEmail: trimmedEmail,
    displayName: trimmedEmail.split("@")[0],
    signupMethod: `Account creation (${options.source})`,
  }).catch((err) => {
    console.error("[Create Account] Notification failed (non-fatal):", err);
  });

  debugLog(`[Create Account] Password account created for ${trimmedEmail}`);

  return { ok: true, userId };
}
