import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getAllowedSupabaseHost(): string | null {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;
  try {
    return new URL(supabaseUrl).host;
  } catch {
    return null;
  }
}

function isAllowedTarget(url: URL, allowedSupabaseHost: string | null): boolean {
  if (url.protocol !== "https:") return false;

  // Strict allowlist:
  // - your Supabase project host (preferred)
  // - any *.supabase.co project host (fallback)
  const hostOk =
    (allowedSupabaseHost && url.host === allowedSupabaseHost) ||
    url.host.endsWith(".supabase.co");

  if (!hostOk) return false;

  // Only allow auth verify endpoint redirects
  return url.pathname.startsWith("/auth/v1/verify");
}

/**
 * Safe redirect wrapper for email links.
 *
 * Outlook (and other inboxes) may flag raw Supabase links as "unsafe" due to cross-domain redirects.
 * This route lets us send a first-click link on getmixwise.com, then redirect to the Supabase verify URL.
 *
 * Query:
 * - to: full Supabase action_link URL
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const to = requestUrl.searchParams.get("to");

  if (!to) {
    return NextResponse.redirect(new URL("/?auth_error=missing_redirect", requestUrl.origin));
  }

  let target: URL;
  try {
    target = new URL(to);
  } catch {
    return NextResponse.redirect(new URL("/?auth_error=bad_redirect", requestUrl.origin));
  }

  const allowedSupabaseHost = getAllowedSupabaseHost();
  if (!isAllowedTarget(target, allowedSupabaseHost)) {
    return NextResponse.redirect(new URL("/?auth_error=blocked_redirect", requestUrl.origin));
  }

  const res = NextResponse.redirect(target.toString());
  res.headers.set("Cache-Control", "no-store");
  return res;
}


