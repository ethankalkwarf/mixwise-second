import { NextRequest, NextResponse } from "next/server";
import { syncSearchConsole } from "@/lib/analytics/searchConsole";

export const runtime = "nodejs";
export const maxDuration = 120;

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const qs = request.nextUrl.searchParams.get("secret");
  return bearer === secret || qs === secret;
}

/** Daily Search Console sync. Requires Google service account + GSC_SITE_URL. */
export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    return NextResponse.json({
      ok: false,
      skipped: true,
      reason:
        "Set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, and GSC_SITE_URL after connecting Search Console.",
    });
  }

  try {
    const result = await syncSearchConsole(14);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron/search-console]", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "sync failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
