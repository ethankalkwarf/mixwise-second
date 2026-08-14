type BarShareProfile = {
  username?: string | null;
  public_slug?: string | null;
} | null | undefined;

/** Public bar path segment. Never fall back to user id — that route is owner-only. */
export function getBarShareSlug(profile: BarShareProfile): string | null {
  return profile?.username || profile?.public_slug || null;
}

export function getBarSharePath(profile: BarShareProfile): string | null {
  const slug = getBarShareSlug(profile);
  return slug ? `/bar/${slug}` : null;
}

export function getBarShareUrl(origin: string, profile: BarShareProfile): string | null {
  const path = getBarSharePath(profile);
  return path ? `${origin}${path}` : null;
}
