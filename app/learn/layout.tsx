import type { Metadata } from "next";
import { isLearnPublic } from "@/lib/learnAccess";

export const metadata: Metadata = isLearnPublic()
  ? {}
  : {
      robots: {
        index: false,
        follow: false,
      },
    };

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
