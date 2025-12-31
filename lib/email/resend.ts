/**
 * Resend Email Client
 *
 * Configured Resend client for sending transactional emails.
 * Server-only - should not be imported in client components.
 */

import { Resend } from "resend";

/**
 * Creates and returns a configured Resend client.
 * Only call this in server-only contexts.
 */
export function createResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is required");
  }

  return new Resend(apiKey);
}

/**
 * Default sender email for MixWise emails
 */
// Use verified domain email - update this after verifying your domain in Resend
// For testing, Resend allows sending from onboarding@resend.dev
export const MIXWISE_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "MixWise <onboarding@resend.dev>";
