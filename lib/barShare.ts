type BarShareProfile = {
  username?: string | null;
  public_slug?: string | null;
  display_name?: string | null;
} | null | undefined;

export type BarShareStats = {
  ingredientCount?: number;
  makeableCount?: number;
};

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

/** Append attribution UTMs for bar shares (PostHog / signup funnel). */
export function withBarShareUtm(
  url: string,
  extras?: { medium?: string; campaign?: string; content?: string }
): string {
  try {
    const parsed = new URL(url, "https://www.getmixwise.com");
    if (!parsed.searchParams.has("utm_source")) {
      parsed.searchParams.set("utm_source", "bar_share");
    }
    if (!parsed.searchParams.has("utm_medium")) {
      parsed.searchParams.set(
        "utm_medium",
        extras?.medium || "app"
      );
    }
    if (!parsed.searchParams.has("utm_campaign")) {
      parsed.searchParams.set(
        "utm_campaign",
        extras?.campaign || "share_my_bar"
      );
    }
    if (extras?.content && !parsed.searchParams.has("utm_content")) {
      parsed.searchParams.set("utm_content", extras.content);
    }
    if (!parsed.searchParams.has("from")) {
      parsed.searchParams.set("from", "bar_share");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function buildBarShareCopy(
  profile: BarShareProfile,
  stats?: BarShareStats,
  opts?: { forRecipient?: boolean }
): { title: string; text: string } {
  const name =
    profile?.display_name?.trim() ||
    (profile?.username ? `@${profile.username}` : null);
  const forRecipient = opts?.forRecipient === true;

  const title = name
    ? `${name}'s MixWise bar`
    : forRecipient
      ? "MixWise bar"
      : "My MixWise bar";

  const makeable = stats?.makeableCount;
  const bottles = stats?.ingredientCount;

  let text: string;
  if (forRecipient && name) {
    if (typeof makeable === "number" && makeable > 0) {
      text = `See what ${name} can mix — ${makeable} cocktail${makeable === 1 ? "" : "s"} ready at home.`;
    } else if (typeof bottles === "number" && bottles > 0) {
      text = `See what ${name} can mix — ${bottles} bottle${bottles === 1 ? "" : "s"} in their bar.`;
    } else {
      text = `See what ${name} can mix at home.`;
    }
  } else if (typeof makeable === "number" && makeable > 0) {
    text = `I can make ${makeable} cocktail${makeable === 1 ? "" : "s"} at home — see my bar on MixWise.`;
  } else if (typeof bottles === "number" && bottles > 0) {
    text = `Here's my bar — ${bottles} bottle${bottles === 1 ? "" : "s"} and counting on MixWise.`;
  } else {
    text = "Here's what I can mix at home.";
  }

  return { title, text };
}
