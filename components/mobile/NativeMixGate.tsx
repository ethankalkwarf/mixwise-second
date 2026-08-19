"use client";

import { useNativeShell } from "@/hooks/useIsNativeApp";
import type { ReactNode } from "react";

/** Hides website marketing chrome inside the native Mix tab. */
export function NativeMixGate({ children }: { children: ReactNode }) {
  const nativeShell = useNativeShell();
  if (nativeShell) return null;
  return <>{children}</>;
}
