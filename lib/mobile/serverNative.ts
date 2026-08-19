import { cookies } from "next/headers";

/** True when the request comes from the Capacitor shell (cookie set in proxy.ts). */
export async function isNativeAppRequest(): Promise<boolean> {
  const store = await cookies();
  return store.get("mixwise_app")?.value === "1";
}
