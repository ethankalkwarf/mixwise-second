import { createHash, createHmac } from "crypto";

/**
 * Normalize to a best-effort E.164-ish digit string for hashing.
 * US default: 10-digit numbers → +1…
 */
export function normalizePhoneDigits(input: string, defaultCountry = "1"): string | null {
  const raw = input.trim();
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  if (digits.length === 10 && defaultCountry === "1") {
    digits = `1${digits}`;
  }
  return digits;
}

function getPepper(): string {
  const pepper =
    process.env.PHONE_HASH_PEPPER ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!pepper) {
    throw new Error("PHONE_HASH_PEPPER is not configured");
  }
  return pepper;
}

/** Server-only HMAC of normalized phone digits */
export function hashPhoneForMatch(input: string): string | null {
  const digits = normalizePhoneDigits(input);
  if (!digits) return null;
  return createHmac("sha256", getPepper()).update(digits).digest("hex");
}

export function hashPhoneList(phones: string[]): string[] {
  const hashes = new Set<string>();
  for (const phone of phones) {
    const h = hashPhoneForMatch(phone);
    if (h) hashes.add(h);
  }
  return [...hashes];
}

/** Stable short fingerprint for logging (not reversible) */
export function phoneLogFingerprint(hash: string): string {
  return createHash("sha256").update(hash).digest("hex").slice(0, 8);
}
