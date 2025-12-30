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
export function getCanonicalSiteUrl(requestUrl?: URL): string {
  // Always use the configured site URL if available
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    return siteUrl;
  }

  // Fallback to request URL origin for server-side requests
  if (requestUrl) {
    return requestUrl.origin;
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
