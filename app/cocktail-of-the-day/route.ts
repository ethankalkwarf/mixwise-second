import { NextResponse } from "next/server";
import { getTodaysDailyCocktailSlug } from "@/lib/cocktails.server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const slug = await getTodaysDailyCocktailSlug();

  if (!slug) {
    // Must be absolute during prerender/static export
    return NextResponse.redirect(new URL("/cocktails", request.url), 307);
  }

  const destination = `/cocktails/${encodeURIComponent(slug)}?daily=true`;
  // Must be absolute during prerender/static export
  const res = NextResponse.redirect(new URL(destination, request.url), 307);
  res.headers.set("Cache-Control", "no-store");
  return res;
}


