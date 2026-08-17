"use client";

import { LearnProgressProvider } from "@/hooks/useLearnProgress";

export function LearnProgressBoundary({ children }: { children: React.ReactNode }) {
  return <LearnProgressProvider>{children}</LearnProgressProvider>;
}
