/**
 * Append MixWise email campaign UTMs for PostHog attribution.
 */

/** Append attribution UTMs for on-site share actions (PostHog / acquisition). */
export function withShareUtm(
  url: string,
  extras: {
    medium: string;
    source?: string;
    campaign?: string;
    content?: string;
  }
): string {
  try {
    const parsed = new URL(url, "https://www.getmixwise.com");
    const source = extras.source || "cocktail_share";
    if (!parsed.searchParams.has("utm_source")) {
      parsed.searchParams.set("utm_source", source);
    }
    if (!parsed.searchParams.has("utm_medium")) {
      parsed.searchParams.set("utm_medium", extras.medium);
    }
    if (!parsed.searchParams.has("utm_campaign")) {
      parsed.searchParams.set(
        "utm_campaign",
        extras.campaign || "share_cocktail"
      );
    }
    if (extras.content && !parsed.searchParams.has("utm_content")) {
      parsed.searchParams.set("utm_content", extras.content);
    }
    if (!parsed.searchParams.has("from")) {
      parsed.searchParams.set("from", source);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function withEmailUtm(
  url: string,
  campaign: string,
  extras?: { content?: string; medium?: string }
): string {
  try {
    const parsed = new URL(url, "https://www.getmixwise.com");
    if (!parsed.hostname.includes("getmixwise.com") && !parsed.hostname.includes("localhost")) {
      return url;
    }
    if (!parsed.searchParams.has("utm_source")) {
      parsed.searchParams.set("utm_source", "resend");
    }
    if (!parsed.searchParams.has("utm_medium")) {
      parsed.searchParams.set("utm_medium", extras?.medium || "email");
    }
    if (!parsed.searchParams.has("utm_campaign")) {
      parsed.searchParams.set("utm_campaign", campaign);
    }
    if (extras?.content && !parsed.searchParams.has("utm_content")) {
      parsed.searchParams.set("utm_content", extras.content);
    }
    // Help cocktail_viewed source inference
    if (!parsed.searchParams.has("from")) {
      parsed.searchParams.set("from", "email");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

/** Rewrite getmixwise.com hrefs / bare URLs in email HTML or text. */
export function applyEmailUtmsToContent(
  content: string,
  campaign: string
): string {
  let out = content.replace(
    /href=("|&quot;)(https?:\/\/(?:www\.)?getmixwise\.com[^"&]*)\1/gi,
    (_m, quote, url) => {
      const cocktailMatch = /\/cocktails\/([^/?#]+)/.exec(url);
      return `href=${quote}${withEmailUtm(url, campaign, {
        content: cocktailMatch?.[1],
      })}${quote}`;
    }
  );

  out = out.replace(
    /(^|[\s<(])(https?:\/\/(?:www\.)?getmixwise\.com[^\s)<]*)/gi,
    (_m, prefix, url) => {
      if (url.includes("utm_source=")) return `${prefix}${url}`;
      const cocktailMatch = /\/cocktails\/([^/?#]+)/.exec(url);
      return `${prefix}${withEmailUtm(url, campaign, {
        content: cocktailMatch?.[1],
      })}`;
    }
  );

  return out;
}
