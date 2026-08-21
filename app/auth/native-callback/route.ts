import { NextResponse } from "next/server";
import { NATIVE_OAUTH_CALLBACK } from "@/lib/mobile/authRedirect";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Supabase redirects here after Google/Apple (allowlisted HTTPS).
 *
 * Always 302 to the app custom scheme — ASWebAuthenticationSession intercepts
 * HTTP redirects to the callback scheme and dismisses. HTML/JS redirects are
 * more likely to escape into system Safari and leave the user stranded there.
 */
export function GET(request: Request) {
  const incoming = new URL(request.url);
  const target = new URL(NATIVE_OAUTH_CALLBACK);

  incoming.searchParams.forEach((value, key) => {
    if (key === "next") return;
    if (value) target.searchParams.set(key, value);
  });

  const deepLink = target.toString();
  const hasPayload =
    target.searchParams.has("code") ||
    target.searchParams.has("error") ||
    target.searchParams.has("access_token");

  if (!hasPayload) {
    return NextResponse.redirect(new URL("/?mixwise_app=1", incoming.origin), 302);
  }

  return new NextResponse(null, {
    status: 302,
    headers: {
      Location: deepLink,
      "Cache-Control": "no-store",
    },
  });
}
