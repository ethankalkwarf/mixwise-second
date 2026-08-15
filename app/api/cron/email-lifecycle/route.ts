/**
 * Daily lifecycle drip. Skips Thursday and Friday so weekly sends stay the cap.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyInternalRequest } from "@/lib/email/internal-auth";
import { runEmailLifecycle } from "@/lib/email/run-lifecycle";

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  if (!verifyInternalRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.get("dryRun") === "1";

  try {
    const result = await runEmailLifecycle({ dryRun });
    return NextResponse.json({ success: true, dryRun, ...result });
  } catch (error) {
    console.error("[Email lifecycle] Failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
