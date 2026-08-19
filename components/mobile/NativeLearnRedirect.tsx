"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import { navigateInApp } from "@/lib/mobile/navigate";

/** Learn library stays on the website. Native app keeps recipe tooltips only. */
export function NativeLearnRedirect({ children }: { children: ReactNode }) {
  const nativeShell = useNativeShell();
  const router = useRouter();

  useEffect(() => {
    if (nativeShell) {
      navigateInApp(router, "/");
    }
  }, [nativeShell, router]);

  if (nativeShell) return null;
  return <>{children}</>;
}
