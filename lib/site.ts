/**
 * Site Configuration
 *
 * Provides canonical site URL resolution for production deployments.
 */

/**
 * Gets the canonical base URL for the application.
 * Always uses the production domain in production environments.
 *
 * @param requestUrl - Optional URL object from request (for server-side usage)
 * @returns The canonical site URL
 */
function isLocalOrPrivateHostname(hostname: string): boolean {
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname.endsWith(".local")
  ) {
    return true;
  }
  if (/^10\./.test(hostname) || /^192\.168\./.test(hostname)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)) return true;
  return false;
}

function originFromRequest(requestUrl: URL): string {
  const hostname = requestUrl.hostname;
  if (hostname === "0.0.0.0" || hostname === "127.0.0.1" || hostname === "::1") {
    return `${requestUrl.protocol}//localhost${requestUrl.port ? `:${requestUrl.port}` : ""}`;
  }
  return requestUrl.origin;
}

export function getCanonicalSiteUrl(requestUrl?: URL): string {
  // Local/LAN requests must not inherit NEXT_PUBLIC_SITE_URL (production).
  // Otherwise password-reset and confirm emails bounce to getmixwise.com.
  if (requestUrl && isLocalOrPrivateHostname(requestUrl.hostname)) {
    return originFromRequest(requestUrl);
  }

  if (requestUrl && process.env.NODE_ENV !== "production") {
    return originFromRequest(requestUrl);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    return siteUrl;
  }

  if (requestUrl) {
    return originFromRequest(requestUrl);
  }

  // Final fallback for client-side usage
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Default fallback (should not happen in production)
  return "https://www.getmixwise.com";
}

/**
 * Gets the auth callback URL for the application.
 *
 * @param requestUrl - Optional URL object from request (for server-side usage)
 * @returns The auth callback URL
 */
export function getAuthCallbackUrl(requestUrl?: URL): string {
  return `${getCanonicalSiteUrl(requestUrl)}/auth/callback`;
}

/**
 * Gets the password reset URL for the application.
 *
 * @param requestUrl - Optional URL object from request (for server-side usage)
 * @returns The password reset URL
 */
export function getPasswordResetUrl(requestUrl?: URL): string {
  return `${getCanonicalSiteUrl(requestUrl)}/reset-password`;
}

/**
 * Alias for getCanonicalSiteUrl for backwards compatibility.
 * Returns the base site URL.
 *
 * @param requestUrl - Optional URL object from request (for server-side usage)
 * @returns The site URL
 */
export function getSiteUrl(requestUrl?: URL): string {
  return getCanonicalSiteUrl(requestUrl);
}
