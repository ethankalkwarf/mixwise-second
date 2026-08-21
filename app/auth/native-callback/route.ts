import { NextResponse } from "next/server";
import { NATIVE_OAUTH_CALLBACK } from "@/lib/mobile/authRedirect";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Supabase redirects here after Google/Apple (allowlisted HTTPS).
 * We immediately bounce to the app custom scheme so ASWebAuthenticationSession
 * can dismiss — do this in the first HTML byte, not after React hydration.
 */
export function GET(request: Request) {
  const incoming = new URL(request.url);
  const target = new URL(NATIVE_OAUTH_CALLBACK);

  incoming.searchParams.forEach((value, key) => {
    if (key === "next") return;
    if (value) target.searchParams.set(key, value);
  });

  // Hash fragments never reach the server; PKCE uses ?code= query.
  const deepLink = target.toString();
  const hasPayload =
    target.searchParams.has("code") ||
    target.searchParams.has("error") ||
    target.searchParams.has("access_token");

  if (!hasPayload) {
    return NextResponse.redirect(new URL("/?mixwise_app=1", incoming.origin), 302);
  }

  // Prefer a raw 302 to the custom scheme when the client accepts it.
  // ASWebAuthenticationSession catches this and dismisses the sheet.
  const accept = request.headers.get("accept") || "";
  const wantsHtml = accept.includes("text/html");

  if (!wantsHtml) {
    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: deepLink,
        "Cache-Control": "no-store",
      },
    });
  }

  // HTML fallback (Safari / webviews): instant meta + JS handoff, plus a tap target.
  const safeHref = deepLink.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const safeJs = JSON.stringify(deepLink);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta http-equiv="refresh" content="0;url=${safeHref}"/>
  <title>Returning to MixWise</title>
  <script>window.location.replace(${safeJs});</script>
  <style>
    body{margin:0;min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;
      font-family:system-ui,sans-serif;background:#F9F7F2;color:#3A4D39;text-align:center;padding:24px}
    a{display:inline-block;margin-top:24px;background:#BC5A45;color:#F9F7F2;text-decoration:none;
      font-weight:700;padding:14px 28px;border-radius:16px}
  </style>
</head>
<body>
  <p><strong>Returning to MixWise…</strong></p>
  <p>If the app doesn’t open, tap below.</p>
  <a href="${safeHref}">Open MixWise</a>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
