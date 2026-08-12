type Bucket = { count: number; resetTime: number };

const buckets = new Map<string, Bucket>();

/**
 * In-memory IP rate limit. Resets on cold start; still blocks casual abuse
 * on a single instance.
 */
export function isRateLimited(
  key: string,
  maxRequests: number,
  windowMs = 60_000
): boolean {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now > existing.resetTime) {
    buckets.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (existing.count >= maxRequests) {
    return true;
  }

  existing.count += 1;
  return false;
}

export function getClientIp(request: { headers: Headers }): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
