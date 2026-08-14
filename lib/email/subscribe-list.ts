/**
 * Newsletter list vs MixWise account — keep these identities separate.
 *
 * List-only:  email_signups + Resend contact (mixwise_list=true)
 * Account:    auth.users / profiles / email_preferences
 * Both:       both records on the same email; Resend stays subscribed
 *             unless they have no account AND no remaining list rows.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { createResendClient } from "@/lib/email/resend";

export const RESEND_GENERAL_SEGMENT_ID =
  process.env.RESEND_GENERAL_SEGMENT_ID || "00b59ef5-ab0d-4516-a309-d45ad6ac74a7";

export async function lookupMixwiseAccount(email: string): Promise<{
  hasAccount: boolean;
  userId?: string;
}> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("[Email List] Account lookup failed:", error);
      return { hasAccount: false };
    }

    return { hasAccount: Boolean(data?.id), userId: data?.id };
  } catch (error) {
    console.error("[Email List] Account lookup exception:", error);
    return { hasAccount: false };
  }
}

export async function persistEmailSignup(email: string, source: string): Promise<{
  saved: boolean;
  alreadySubscribed: boolean;
  error?: string;
}> {
  try {
    const supabase = createAdminClient();
    const { data: existing, error: selectError } = await supabase
      .from("email_signups")
      .select("id")
      .eq("email", email)
      .eq("source", source)
      .maybeSingle();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("[Email List] Lookup failed:", selectError);
      return { saved: false, alreadySubscribed: false, error: selectError.message };
    }

    if (existing) {
      return { saved: true, alreadySubscribed: true };
    }

    const { error: insertError } = await supabase.from("email_signups").insert({
      email,
      source,
    });

    if (insertError?.code === "23505") {
      return { saved: true, alreadySubscribed: true };
    }

    if (insertError) {
      console.error("[Email List] Insert failed:", insertError);
      return { saved: false, alreadySubscribed: false, error: insertError.message };
    }

    return { saved: true, alreadySubscribed: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Email List] Persist exception:", message);
    return { saved: false, alreadySubscribed: false, error: message };
  }
}

export async function addToResendAudience(
  email: string,
  options?: { hasAccount?: boolean }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const hasAccount =
      options?.hasAccount ?? (await lookupMixwiseAccount(email)).hasAccount;
    const resend = createResendClient();
    const properties = {
      mixwise_list: "true",
      mixwise_account: hasAccount ? "true" : "false",
    };

    const created = await resend.contacts.create({
      email,
      unsubscribed: false,
      audienceId: RESEND_GENERAL_SEGMENT_ID,
      properties,
    });

    if (!created.error) {
      return { ok: true };
    }

    const updated = await resend.contacts.update({
      email,
      unsubscribed: false,
      properties,
    });
    if (updated.error) {
      console.warn("[Email List] Resend contact update failed:", updated.error.message);
    }

    const added = await resend.contacts.segments.add({
      email,
      segmentId: RESEND_GENERAL_SEGMENT_ID,
    });
    if (added.error) {
      console.warn("[Email List] Resend segment add failed:", added.error.message);
      return { ok: false, error: added.error.message };
    }

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Email List] Resend audience exception:", message);
    return { ok: false, error: message };
  }
}

export async function markResendContactUnsubscribed(email: string): Promise<void> {
  try {
    const resend = createResendClient();
    const { error } = await resend.contacts.update({
      email,
      unsubscribed: true,
      properties: { mixwise_list: "false" },
    });
    if (error) {
      console.warn("[Email List] Resend unsubscribe failed:", error.message);
    }
  } catch (error) {
    console.warn("[Email List] Resend unsubscribe exception:", error);
  }
}

/**
 * List unsubscribe only. Account holders stay subscribed in Resend so
 * transactional mail and opted-in account broadcasts are not killed.
 */
export async function syncResendAfterListUnsubscribe(email: string): Promise<void> {
  const { hasAccount } = await lookupMixwiseAccount(email);

  if (hasAccount) {
    try {
      const resend = createResendClient();
      await resend.contacts.update({
        email,
        properties: { mixwise_list: "false" },
      });
    } catch (error) {
      console.warn("[Email List] Resend list-flag update failed:", error);
    }
    return;
  }

  await markResendContactUnsubscribed(email);
}
