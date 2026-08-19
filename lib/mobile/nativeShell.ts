import { isNativeApp } from "@/lib/mobile/platform";

/** True when the Capacitor shell should render (bridge, UA, or persisted flag). */
export function isNativeShell(): boolean {
  if (typeof window === "undefined") return false;
  return isNativeApp();
}
