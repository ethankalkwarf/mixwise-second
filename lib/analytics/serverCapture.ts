/**
 * Server-side PostHog capture (Resend webhooks, crons, GSC sync).
 * Uses the public project key via HTTP — safe when key is unset (no-op).
 */

const HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ||
  process.env.POSTHOG_HOST ||
  "https://us.i.posthog.com";
const KEY =
  process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.POSTHOG_PROJECT_API_KEY;

export async function captureServerEvent(
  event: string,
  distinctId: string,
  properties?: Record<string, unknown>
): Promise<void> {
  if (!KEY) return;

  try {
    const res = await fetch(`${HOST.replace(/\/$/, "")}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: KEY,
        event,
        distinct_id: distinctId || "server",
        properties: {
          ...properties,
          $lib: "mixwise-server",
          app_surface: "server",
        },
      }),
    });
    if (!res.ok) {
      console.warn("[Analytics] PostHog capture failed:", res.status, await res.text());
    }
  } catch (err) {
    console.warn("[Analytics] PostHog capture error:", err);
  }
}
