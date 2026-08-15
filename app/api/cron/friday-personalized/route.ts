/**
 * Friday personalized list. Accounts with a bar only.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyInternalRequest } from "@/lib/email/internal-auth";
import { runFridayPersonalized } from "@/lib/email/run-friday";

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  if (!verifyInternalRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.get("dryRun") === "1";

  try {
    const result = await runFridayPersonalized({ dryRun });
    return NextResponse.json({ success: true, dryRun, ...result });
  } catch (error) {
    console.error("[Friday personalized] Failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
