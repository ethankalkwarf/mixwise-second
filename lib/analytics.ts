/**
 * Product analytics for MixWise.
 *
 * Clarity stays for web session replay/heatmaps.
 * PostHog (via lib/analytics/client) is the product-event layer for web + native.
 * All track* helpers no-op safely when PostHog is not configured.
 */

import {
  captureEvent,
  identifyUser,
  resetAnalyticsUser,
} from "@/lib/analytics/client";
import { debugLog } from "@/lib/debugLog";

export type AnalyticsSource =
  | "mix"
  | "browse"
  | "search"
  | "saved"
  | "learn"
  | "home"
  | "deep_link"
  | "related"
  | "email"
  | "notification"
  | "share"
  | "unknown";

function baseProps(extra?: Record<string, unknown>): Record<string, unknown> {
  return { ...extra };
}

/** Infer cocktail view source from the current URL / referrer path. */
export function inferCocktailViewSource(
  pathname?: string | null,
  search?: string | null
): AnalyticsSource {
  if (typeof window === "undefined" && !pathname) return "unknown";
  const path = pathname ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const qs =
    search ??
    (typeof window !== "undefined" ? window.location.search : "");
  const params = new URLSearchParams(qs.startsWith("?") ? qs.slice(1) : qs);
  const from = params.get("from") || params.get("src") || params.get("utm_medium");
  const utmSource = params.get("utm_source");

  if (from === "mix" || path.startsWith("/mix")) return "mix";
  if (from === "search" || params.get("q")) return "search";
  if (from === "saved" || path.startsWith("/saved")) return "saved";
  if (from === "learn" || path.startsWith("/learn")) return "learn";
  if (from === "related") return "related";
  if (from === "email" || utmSource === "resend") return "email";
  if (from === "notification" || params.get("utm_medium") === "push") return "notification";
  if (
    from === "cocktail_share" ||
    from === "share" ||
    utmSource === "cocktail_share" ||
    utmSource === "bar_share"
  ) {
    return "share";
  }
  if (from === "home" || path === "/" || path === "/dashboard") return "home";
  if (from === "deep_link" || params.get("mixwise_app") === "1") return "deep_link";
  if (path.startsWith("/cocktails") && !path.includes("/", 11)) return "browse";
  if (typeof document !== "undefined" && document.referrer) {
    try {
      const ref = new URL(document.referrer);
      if (ref.pathname.startsWith("/mix")) return "mix";
      if (ref.pathname.startsWith("/learn")) return "learn";
      if (ref.pathname.startsWith("/saved")) return "saved";
      if (ref.pathname === "/" || ref.pathname === "/dashboard") return "home";
      if (ref.pathname.startsWith("/cocktails")) return "browse";
    } catch {
      /* ignore */
    }
  }
  return "unknown";
}

/** Track when a new user signs up. */
export async function trackUserSignup(
  userId: string,
  email?: string | null
): Promise<void> {
  identifyUser(userId, email ? { email } : undefined);
  captureEvent("user_signed_up", baseProps({ has_email: Boolean(email) }));
  debugLog("[Analytics] User signed up:", { userId, email: email || "N/A" });
}

/** Track when a user signs in. */
export async function trackUserSignIn(userId: string): Promise<void> {
  identifyUser(userId);
  captureEvent("user_signed_in", baseProps());
  debugLog("[Analytics] User signed in:", userId);
}

/** Clear identified user (logout). */
export function trackUserSignOut(): void {
  captureEvent("user_signed_out");
  resetAnalyticsUser();
}

/** Track when a user adds an ingredient to their bar. */
export async function trackIngredientAdded(
  userId: string | null,
  ingredientId: string,
  ingredientName: string,
  extras?: { bar_size?: number; guest?: boolean }
): Promise<void> {
  captureEvent(
    "ingredient_added",
    baseProps({
      user_id: userId,
      ingredient_id: ingredientId,
      ingredient_name: ingredientName,
      bar_size: extras?.bar_size,
      guest: extras?.guest ?? !userId,
    })
  );
}

/** Track when a user removes an ingredient from their bar. */
export async function trackIngredientRemoved(
  userId: string | null,
  ingredientId: string,
  extras?: { bar_size?: number }
): Promise<void> {
  captureEvent(
    "ingredient_removed",
    baseProps({
      user_id: userId,
      ingredient_id: ingredientId,
      bar_size: extras?.bar_size,
      guest: !userId,
    })
  );
}

/** Track when a user favorites a cocktail. */
export async function trackCocktailFavorited(
  userId: string,
  cocktailId: string,
  cocktailName: string
): Promise<void> {
  captureEvent(
    "cocktail_favorited",
    baseProps({
      user_id: userId,
      cocktail_id: cocktailId,
      cocktail_name: cocktailName,
    })
  );
}

/** Track when a user removes a favorite. */
export async function trackCocktailUnfavorited(
  userId: string | null,
  cocktailId: string,
  extras?: { cocktail_name?: string; guest?: boolean }
): Promise<void> {
  captureEvent(
    "cocktail_unfavorited",
    baseProps({
      user_id: userId,
      cocktail_id: cocktailId,
      cocktail_name: extras?.cocktail_name,
      guest: extras?.guest ?? !userId,
    })
  );
}

/** Track when a user views a cocktail. */
export async function trackCocktailView(
  userId: string | null,
  cocktailId: string,
  cocktailName: string,
  extras?: { slug?: string; source?: AnalyticsSource }
): Promise<void> {
  const source = extras?.source ?? inferCocktailViewSource();
  captureEvent(
    "cocktail_viewed",
    baseProps({
      user_id: userId,
      cocktail_id: cocktailId,
      cocktail_name: cocktailName,
      cocktail_slug: extras?.slug,
      source,
      guest: !userId,
    })
  );
}

/** Track when a user uses the Mix tool (views matches). */
export async function trackMixToolUsed(
  userId: string | null,
  ingredientCount: number,
  matchCount: number,
  extras?: { almost_there?: number; step?: string }
): Promise<void> {
  captureEvent(
    "mix_tool_used",
    baseProps({
      user_id: userId,
      ingredient_count: ingredientCount,
      match_count: matchCount,
      almost_there: extras?.almost_there,
      step: extras?.step,
      guest: !userId,
      zero_matches: matchCount === 0,
    })
  );
}

/** Click on a Mix result cocktail. */
export async function trackMixResultClicked(
  cocktailSlug: string,
  bucket: "ready" | "almost" | "far" | "tonight",
  extras?: Record<string, unknown>
): Promise<void> {
  captureEvent(
    "mix_result_clicked",
    baseProps({ cocktail_slug: cocktailSlug, bucket, ...extras })
  );
}

/**
 * Track newsletter / lead-magnet signup.
 * Does not send the raw email to PostHog (PII) — only source + success.
 */
export async function trackEmailSignup(
  email: string,
  source: string
): Promise<void> {
  captureEvent(
    "email_signup",
    baseProps({
      source,
      email_domain: email.includes("@")
        ? email.split("@")[1]?.toLowerCase()
        : undefined,
    })
  );
}

/** Learn lesson started. */
export async function trackLearnLessonStarted(
  kind: string,
  slug: string
): Promise<void> {
  captureEvent(
    "learn_lesson_started",
    baseProps({ lesson_kind: kind, lesson_slug: slug })
  );
}

/** Learn lesson completed. */
export async function trackLearnLessonCompleted(
  kind: string,
  slug: string,
  extras?: { xp?: number; checks_correct?: number; checks_total?: number }
): Promise<void> {
  captureEvent(
    "learn_lesson_completed",
    baseProps({
      lesson_kind: kind,
      lesson_slug: slug,
      xp: extras?.xp,
      checks_correct: extras?.checks_correct,
      checks_total: extras?.checks_total,
    })
  );
}

/** Catalog / directory search. */
export async function trackSearch(
  query: string,
  resultCount: number,
  extras?: { filters?: Record<string, string | null> }
): Promise<void> {
  const trimmed = query.trim();
  if (!trimmed) return;
  captureEvent(
    "search",
    baseProps({
      query_length: trimmed.length,
      query: trimmed.slice(0, 120),
      result_count: resultCount,
      zero_results: resultCount === 0,
      ...extras?.filters,
    })
  );
}

/** Auth gate / signup nudge shown. */
export async function trackAuthGateShown(
  gate: string,
  extras?: Record<string, unknown>
): Promise<void> {
  captureEvent("auth_gate_shown", baseProps({ gate, ...extras }));
}

/** Soft limit / upgrade prompt moment (when limits are enforced). */
export async function trackLimitHit(
  feature: string,
  extras?: Record<string, unknown>
): Promise<void> {
  captureEvent("limit_hit", baseProps({ feature, ...extras }));
}

/** Empty state displayed (no matches, no saved, etc.). */
export async function trackEmptyStateSeen(
  surface: string,
  extras?: Record<string, unknown>
): Promise<void> {
  captureEvent("empty_state_seen", baseProps({ surface, ...extras }));
}

/** Share recipe, bar, or other content. */
export async function trackContentShared(
  entity: "cocktail" | "bar" | "lesson" | "other",
  channel: string,
  extras?: Record<string, unknown>
): Promise<void> {
  captureEvent(
    "content_shared",
    baseProps({ entity, channel, ...extras })
  );
}

/** Glossary / educational term opened on a recipe. */
export async function trackGlossaryTermOpened(
  term: string,
  extras?: Record<string, unknown>
): Promise<void> {
  captureEvent(
    "glossary_term_opened",
    baseProps({ term, ...extras })
  );
}

/** Native / push notification permission result. */
export async function trackNotificationPermission(
  granted: boolean,
  extras?: Record<string, unknown>
): Promise<void> {
  captureEvent(
    "notification_permission",
    baseProps({ granted, ...extras })
  );
}

/** Notification or deep link opened into the app. */
export async function trackDeepLinkOpened(
  href: string,
  origin: "notification" | "deep_link" | "universal_link" | "other",
  extras?: Record<string, unknown>
): Promise<void> {
  captureEvent(
    "deep_link_opened",
    baseProps({ href: href.slice(0, 300), origin, ...extras })
  );
}

/** First-win celebration shown. */
export async function trackFirstWinShown(
  readyCount: number
): Promise<void> {
  captureEvent("first_win_shown", baseProps({ ready_count: readyCount }));
}

/** Pour streak updated. */
export async function trackPourStreakUpdated(
  streak: number
): Promise<void> {
  captureEvent("pour_streak_updated", baseProps({ streak }));
}

/** Shopping list item added. */
export async function trackShoppingItemAdded(
  extras?: Record<string, unknown>
): Promise<void> {
  captureEvent("shopping_item_added", baseProps(extras));
}

/** Native intro funnel step. */
export async function trackNativeIntroStep(
  step: string,
  extras?: Record<string, unknown>
): Promise<void> {
  captureEvent("native_intro_step", baseProps({ step, ...extras }));
}

/** Email campaign engagement (from Resend webhooks / server). */
export async function trackEmailCampaignEvent(
  event:
    | "email_delivered"
    | "email_opened"
    | "clicked"
    | "email_bounced"
    | "email_complained",
  extras?: Record<string, unknown>
): Promise<void> {
  const name =
    event === "clicked" ? "email_clicked" : event;
  captureEvent(name, baseProps(extras));
}

// Make trackEmailSignup available globally for legacy modal hooks
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).trackEmailSignup = trackEmailSignup;
}
