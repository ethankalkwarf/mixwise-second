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
/** Normalize key pasted into Vercel (whitespace, quotes, accidental newlines). */
function normalizeResendApiKey(raw: string): string {
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }
  return key.replace(/[\r\n]+/g, "");
}

function getResendApiKey(): string {
  const raw = process.env.RESEND_API_KEY;
  if (!raw) {
    throw new Error("RESEND_API_KEY environment variable is required");
  }

  const apiKey = normalizeResendApiKey(raw);
  if (!apiKey.startsWith("re_")) {
    throw new Error("RESEND_API_KEY must start with re_");
  }

  return apiKey;
}

export function createResendClient() {
  return new Resend(getResendApiKey());
}

/** For startup checks without exposing the full key */
export function getResendApiKeyFingerprint(): string | null {
  try {
    const key = getResendApiKey();
    return `${key.slice(0, 8)}…${key.slice(-4)} (len=${key.length})`;
  } catch {
    return null;
  }
}

/**
 * Default sender email for MixWise emails
 */
// Use verified domain email
export const MIXWISE_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL?.trim() || "MixWise <hello@getmixwise.com>";
