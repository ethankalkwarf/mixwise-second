import { NextResponse } from "next/server";
import { getTodaysDailyCocktailSlug } from "@/lib/cocktails.server";

export const runtime = "nodejs";

export async function GET() {
  const slug = await getTodaysDailyCocktailSlug();

  if (!slug) {
    return NextResponse.redirect(new URL("/cocktails", "https://www.getmixwise.com"), 307);
  }

  const destination = `/cocktails/${encodeURIComponent(slug)}?daily=true`;
  const res = NextResponse.redirect(destination, 307);
  res.headers.set("Cache-Control", "no-store");
  return res;
}


