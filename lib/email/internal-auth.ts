/**
 * Internal API authentication for cron jobs and server-to-server email routes.
 */

import { NextRequest } from "next/server";

/**
 * Returns the shared secret used for cron and internal email API calls.
 * CRON_SECRET is the primary env var; INTERNAL_API_SECRET is an alias.
 */
export function getInternalApiSecret(): string | undefined {
  return process.env.CRON_SECRET || process.env.INTERNAL_API_SECRET;
}

/**
 * Verifies Authorization: Bearer <secret> for cron/internal endpoints.
 * In production, a secret must be configured and match.
 */
export function verifyInternalRequest(request: NextRequest): boolean {
  const secret = getInternalApiSecret();
  const authHeader = request.headers.get("authorization")?.trim();

  if (process.env.NODE_ENV === "production") {
    if (!secret) {
      console.error("[Internal Auth] CRON_SECRET is required in production");
      return false;
    }
    return authHeader === `Bearer ${secret}`;
  }

  // Development: allow if no secret configured; otherwise require match
  if (!secret) return true;
  return authHeader === `Bearer ${secret}`;
}

/**
 * Verifies EMAIL_TEST_SECRET for the email test endpoint.
 */
export function verifyEmailTestSecret(providedSecret: string | undefined): boolean {
  const testSecret = process.env.EMAIL_TEST_SECRET;

  if (process.env.NODE_ENV === "production") {
    if (!testSecret) {
      console.error("[Email Test] EMAIL_TEST_SECRET is required in production");
      return false;
    }
    return providedSecret === testSecret;
  }

  if (!testSecret) return true;
  return providedSecret === testSecret;
}
