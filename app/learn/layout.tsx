import type { Metadata } from "next";
import { isLearnPublic } from "@/lib/learnAccess";
import { LearnProgressBoundary } from "@/components/learn/LearnProgressBoundary";
import { NativeLearnRedirect } from "@/components/mobile/NativeLearnRedirect";

export const metadata: Metadata = isLearnPublic()
  ? {}
  : {
      robots: {
        index: false,
        follow: false,
      },
    };

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <LearnProgressBoundary>
      <NativeLearnRedirect>{children}</NativeLearnRedirect>
    </LearnProgressBoundary>
  );
}
