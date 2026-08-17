import type { Metadata } from "next";
import { getTodaysDailyCocktailCover } from "@/lib/cocktails.server";
import { NotFoundView } from "@/components/not-found/NotFoundView";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "This page isn't on the MixWise menu. Browse recipes or open your cabinet to find something worth pouring.",
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  let suggestion: Awaited<ReturnType<typeof getTodaysDailyCocktailCover>> = null;
  try {
    suggestion = await getTodaysDailyCocktailCover();
  } catch {
    suggestion = null;
  }

  return <NotFoundView suggestion={suggestion} />;
}
