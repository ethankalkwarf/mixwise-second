import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { isNativeApp } from "@/lib/mobile/platform";
import { getShareOrigin } from "@/lib/shareOrigin";
import { trackContentShared } from "@/lib/analytics";

export function buildInviteUrl(origin: string, username: string): string {
  const url = new URL(`/invite/${encodeURIComponent(username)}`, origin);
  url.searchParams.set("ref", username);
  url.searchParams.set("utm_source", "invite");
  url.searchParams.set("utm_medium", isNativeApp() ? "app" : "web");
  url.searchParams.set("utm_campaign", "friend_invite");
  return url.toString();
}

export type InviteShareResult = "shared" | "copied" | "need_username" | "cancelled";

/** One-tap invite share — prefer system share sheet; fall back to clipboard. */
export async function shareInviteLink(username: string): Promise<InviteShareResult> {
  if (!username) return "need_username";

  const inviteUrl = buildInviteUrl(getShareOrigin(), username);
  const text = `Join me on MixWise — see what I’m mixing and follow my bar: ${inviteUrl}`;

  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share({
        title: "Join me on MixWise",
        text,
        url: inviteUrl,
        dialogTitle: "Invite friends",
      });
      void trackContentShared("other", "native_share", { username, medium: "capacitor" });
      return "shared";
    }
    if (typeof navigator.share === "function") {
      await navigator.share({ title: "Join me on MixWise", text, url: inviteUrl });
      void trackContentShared("other", "native_share", { username, medium: "web_share" });
      return "shared";
    }
    await navigator.clipboard.writeText(inviteUrl);
    void trackContentShared("other", "copy_link", { username });
    return "copied";
  } catch (err) {
    if ((err as Error).name === "AbortError") return "cancelled";
    try {
      await navigator.clipboard.writeText(inviteUrl);
      void trackContentShared("other", "copy_link", { username });
      return "copied";
    } catch {
      return "cancelled";
    }
  }
}
