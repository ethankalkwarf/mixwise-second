/**
 * Recommended PostHog insights for MixWise (create in PostHog UI).
 * Event names match lib/analytics.ts.
 */

export const POSTHOG_INSIGHT_SPECS = [
  {
    name: "Activation funnel",
    description: "guest Mix → cocktail view → favorite → signup",
    events: [
      "mix_tool_used",
      "cocktail_viewed",
      "cocktail_favorited",
      "user_signed_up",
    ],
    type: "funnel" as const,
  },
  {
    name: "Top in-app searches",
    description: "Break down search by query; filter zero_results = true for gaps",
    events: ["search"],
    breakdown: "query",
    type: "trends" as const,
  },
  {
    name: "Cocktail demand",
    description: "cocktail_viewed vs cocktail_favorited by cocktail_slug",
    events: ["cocktail_viewed", "cocktail_favorited"],
    breakdown: "cocktail_slug",
    type: "trends" as const,
  },
  {
    name: "Auth gate conversion",
    description: "auth_gate_shown → user_signed_up by gate",
    events: ["auth_gate_shown", "user_signed_up"],
    breakdown: "gate",
    type: "funnel" as const,
  },
  {
    name: "View source mix",
    description: "Where recipe views come from",
    events: ["cocktail_viewed"],
    breakdown: "source",
    type: "trends" as const,
  },
] as const;
