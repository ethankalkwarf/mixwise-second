/**
 * Resend configuration health check (does not send email).
 * Protected: requires CRON_SECRET in production.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyInternalRequest } from "@/lib/email/internal-auth";
import {
  createResendClient,
  getResendApiKeyFingerprint,
  MIXWISE_FROM_EMAIL,
} from "@/lib/email/resend";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!verifyInternalRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fingerprint = getResendApiKeyFingerprint();
  if (!fingerprint) {
    return NextResponse.json({
      ok: false,
      error: "RESEND_API_KEY missing or invalid format",
    });
  }

  try {
    const resend = createResendClient();
    const { data, error } = await resend.domains.list();

    return NextResponse.json({
      ok: !error,
      keyFingerprint: fingerprint,
      fromEmail: MIXWISE_FROM_EMAIL,
      resendOk: !error,
      domainCount: Array.isArray(data?.data) ? data.data.length : null,
      resendError: error?.message ?? null,
      hint: error?.message?.toLowerCase().includes("invalid")
        ? "Resend rejected this key — delete RESEND_API_KEY in Vercel Production, paste a fresh key (no quotes), redeploy, then retry."
        : error
          ? "Check Resend dashboard and Vercel env scope (Production only)."
          : "Key works with Resend API",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      ok: false,
      keyFingerprint: fingerprint,
      error: message,
    });
  }
}
