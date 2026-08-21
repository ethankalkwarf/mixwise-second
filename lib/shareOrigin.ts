import { SITE_CONFIG } from "@/lib/seo";
import { isNativeApp } from "@/lib/mobile/platform";

/** Origin for share/invite links. Native always uses the public site, never the WebView host. */
export function getShareOrigin(): string {
  const configured = SITE_CONFIG.url.replace(/\/$/, "");
  if (typeof window === "undefined") return configured;
  if (isNativeApp()) return configured;
  return window.location.origin;
}
