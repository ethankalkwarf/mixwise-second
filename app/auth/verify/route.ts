import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function isAllowedVerifyType(type: string): boolean {
  return ["signup", "recovery", "magiclink", "invite", "email_change"].includes(type);
}

function appOrigin(request: NextRequest): string {
  const requestUrl = new URL(request.url);
  const hostHeader = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const host = hostHeader || requestUrl.host;
  const protoHeader = request.headers.get("x-forwarded-proto");
  const proto = protoHeader || requestUrl.protocol.replace(":", "");
  const hostname = host.split(":")[0];
  const port = host.includes(":") ? host.slice(host.indexOf(":") + 1) : requestUrl.port;
  const safeHost =
    hostname === "0.0.0.0" || hostname === "127.0.0.1" || hostname === "::1"
      ? "localhost"
      : hostname;
  return `${proto}://${safeHost}${port ? `:${port}` : ""}`;
}

/**
 * Email-link verify endpoint.
 *
 * Stay on this app origin. Do not 302 through supabase.co/auth/v1/verify —
 * GoTrue then sends the browser to the project's Site URL (getmixwise.com),
 * which breaks local development.
 *
 * The destination page calls supabase.auth.verifyOtp({ token_hash, type }).
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const tokenHash =
    requestUrl.searchParams.get("token_hash") || requestUrl.searchParams.get("token");
  const type = requestUrl.searchParams.get("type");
  const redirectTo = requestUrl.searchParams.get("redirect_to");
  const origin = appOrigin(request);

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL("/?auth_error=missing_verify_params", origin));
  }

  if (!isAllowedVerifyType(type)) {
    return NextResponse.redirect(new URL("/?auth_error=invalid_verify_type", origin));
  }

  const dest =
    type === "recovery"
      ? new URL("/reset-password", origin)
      : new URL("/auth/callback", origin);

  dest.searchParams.set("token_hash", tokenHash);
  dest.searchParams.set("type", type);

  if (redirectTo && type !== "recovery") {
    try {
      const next = new URL(redirectTo).searchParams.get("next");
      if (next) dest.searchParams.set("next", next);
    } catch {
      // ignore malformed redirect_to
    }
  }

  const res = NextResponse.redirect(dest);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
