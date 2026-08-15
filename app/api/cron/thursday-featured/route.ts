/**
 * Thursday featured send. Event weeks replace the regular Thursday cocktail.
 * Also keeps /api/cron/weekly-digest working (same job, new templates).
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyInternalRequest } from "@/lib/email/internal-auth";
import { runThursdayFeatured } from "@/lib/email/run-thursday";

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  if (!verifyInternalRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.get("dryRun") === "1";

  try {
    const result = await runThursdayFeatured({ dryRun });
    return NextResponse.json({ success: true, dryRun, ...result });
  } catch (error) {
    console.error("[Thursday featured] Failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
