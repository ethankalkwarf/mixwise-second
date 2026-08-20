import { headers } from "next/headers";

/**
 * True when the request comes from the Capacitor shell.
 * Requires the MixWiseNative/Capacitor UA — a leftover mixwise_app cookie alone
 * must not flip the public mobile site into the native shell.
 */
export async function isNativeAppRequest(): Promise<boolean> {
  const ua = (await headers()).get("user-agent") ?? "";
  return /MixWiseNative|Capacitor/i.test(ua);
}
