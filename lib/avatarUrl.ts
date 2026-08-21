/**
 * Normalize avatar URLs for crisp display.
 * Google OAuth photos often ship as =s96-c; we request a larger size.
 */

const DEFAULT_SIZE = 256;

export function optimizeAvatarUrl(
  url: string | null | undefined,
  size: number = DEFAULT_SIZE
): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const host = new URL(trimmed).hostname;
    if (!host.endsWith("googleusercontent.com")) {
      return trimmed;
    }

    // Common patterns:
    // .../photo.jpg=s96-c
    // .../photo.jpg=s96-c-mo
    // ...?sz=50
    let next = trimmed.replace(/=s\d+(-[a-z0-9]+)*/i, `=s${size}-c`);
    if (next === trimmed && /[?&]sz=\d+/i.test(trimmed)) {
      next = trimmed.replace(/([?&]sz=)\d+/i, `$1${size}`);
    } else if (next === trimmed && !/=s\d+/i.test(trimmed)) {
      next = `${trimmed}${trimmed.includes("?") ? "&" : "="}s${size}-c`;
    }
    return next;
  } catch {
    return trimmed;
  }
}
