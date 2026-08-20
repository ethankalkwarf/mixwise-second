import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { captureServerEvent } from "@/lib/analytics/serverCapture";
import { debugLog } from "@/lib/debugLog";
import type { Json } from "@/lib/supabase/database.types";

export const runtime = "nodejs";

type ResendWebhookPayload = {
  type?: string;
  created_at?: string;
  data?: {
    email_id?: string;
    to?: string[] | string;
    from?: string;
    subject?: string;
    click?: { link?: string };
    tags?: Array<{ name?: string; value?: string }> | Record<string, string>;
  };
};

function extractEmail(to: string[] | string | undefined): string | null {
  if (!to) return null;
  if (typeof to === "string") return to.trim().toLowerCase();
  if (Array.isArray(to) && to[0]) return String(to[0]).trim().toLowerCase();
  return null;
}

function extractCampaign(
  tags: ResendWebhookPayload["data"] extends { tags?: infer T } ? T : unknown
): string | null {
  if (!tags) return null;
  if (Array.isArray(tags)) {
    const hit = tags.find((t) => t?.name === "category" || t?.name === "campaign");
    return hit?.value || null;
  }
  if (typeof tags === "object") {
    const record = tags as Record<string, string>;
    return record.category || record.campaign || null;
  }
  return null;
}

function cocktailSlugFromUrl(url?: string | null): string | null {
  if (!url) return null;
  const m = /\/cocktails\/([^/?#]+)/.exec(url);
  return m?.[1] || null;
}

function mapEventType(
  type: string
): "email_delivered" | "email_opened" | "email_clicked" | "email_bounced" | "email_complained" | null {
  switch (type) {
    case "email.delivered":
      return "email_delivered";
    case "email.opened":
      return "email_opened";
    case "email.clicked":
      return "email_clicked";
    case "email.bounced":
      return "email_bounced";
    case "email.complained":
      return "email_complained";
    default:
      return null;
  }
}

/**
 * Resend → MixWise webhook.
 * Configure in Resend dashboard: https://www.getmixwise.com/api/webhooks/resend
 * Optional: set RESEND_WEBHOOK_SECRET and pass ?secret=... or Authorization: Bearer ...
 */
export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization") || "";
    const qs = request.nextUrl.searchParams.get("secret");
    const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (qs !== secret && bearer !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: ResendWebhookPayload;
  try {
    body = (await request.json()) as ResendWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = body.type || "";
  const mapped = mapEventType(type);
  if (!mapped) {
    return NextResponse.json({ ok: true, ignored: type });
  }

  const email = extractEmail(body.data?.to);
  const campaign = extractCampaign(body.data?.tags);
  const linkUrl = body.data?.click?.link || null;
  const cocktailSlug = cocktailSlugFromUrl(linkUrl);
  const resendId = body.data?.email_id || null;

  try {
    const supabase = createAdminClient();
    await supabase.from("email_campaign_events").insert({
      resend_email_id: resendId,
      event_type: mapped,
      email,
      campaign,
      link_url: linkUrl,
      cocktail_slug: cocktailSlug,
      payload: body as unknown as Json,
    });
  } catch (err) {
    console.error("[Resend webhook] DB insert failed:", err);
  }

  const distinctId = email || resendId || "resend-unknown";
  await captureServerEvent(mapped, distinctId, {
    campaign,
    link_url: linkUrl,
    cocktail_slug: cocktailSlug,
    resend_email_id: resendId,
    email_domain: email?.includes("@") ? email.split("@")[1] : undefined,
  });

  debugLog("[Resend webhook]", mapped, { campaign, cocktailSlug });
  return NextResponse.json({ ok: true });
}
