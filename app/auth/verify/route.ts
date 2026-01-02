import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getSupabaseBaseUrl(): string | null {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;
  try {
    return new URL(supabaseUrl).origin;
  } catch {
    return null;
  }
}

function isAllowedVerifyType(type: string): boolean {
  // Types Supabase supports include: signup, recovery, magiclink, invite, email_change, etc.
  // We allow the ones we use.
  return ["signup", "recovery", "magiclink"].includes(type);
}

/**
 * Email-link friendly verify endpoint.
 *
 * This avoids putting a full Supabase URL in the email href (which can trip Outlook link warnings).
 * We redirect server-side to the Supabase verify endpoint using token + type (+ redirect_to).
 *
 * Query:
 * - token: Supabase verify token
 * - type: signup | recovery | magiclink
 * - redirect_to: where Supabase should send the user after verify (typically your /auth/callback...)
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token");
  const type = requestUrl.searchParams.get("type");
  const redirectTo = requestUrl.searchParams.get("redirect_to");

  if (!token || !type) {
    return NextResponse.redirect(new URL("/?auth_error=missing_verify_params", requestUrl.origin));
  }

  if (!isAllowedVerifyType(type)) {
    return NextResponse.redirect(new URL("/?auth_error=invalid_verify_type", requestUrl.origin));
  }

  const supabaseBaseUrl = getSupabaseBaseUrl();
  if (!supabaseBaseUrl) {
    return NextResponse.redirect(new URL("/?auth_error=missing_supabase_url", requestUrl.origin));
  }

  const verifyUrl = new URL("/auth/v1/verify", supabaseBaseUrl);
  verifyUrl.searchParams.set("token", token);
  verifyUrl.searchParams.set("type", type);
  if (redirectTo) verifyUrl.searchParams.set("redirect_to", redirectTo);

  const res = NextResponse.redirect(verifyUrl.toString());
  res.headers.set("Cache-Control", "no-store");
  return res;
}








