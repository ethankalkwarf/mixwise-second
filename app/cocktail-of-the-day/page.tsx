import { redirect } from "next/navigation";
import { getCocktailsList } from "@/lib/cocktails.server";
import { getDailyIndexFromCount } from "@/lib/dailyCocktail";

export const dynamic = "force-dynamic";

export default async function CocktailOfTheDayPage() {
  try {
    // Use the exact same server-side data source as `/cocktails`
    // (proven to work in production), then deterministically pick a daily slug.
    const cocktails = await getCocktailsList();
    const slugs = cocktails
      .map((c) => (c?.slug ? String(c.slug).trim() : ""))
      .filter(Boolean)
      .sort(); // stable ordering so "daily" mapping is deterministic

    if (slugs.length === 0) redirect("/cocktails");

    const index = getDailyIndexFromCount(slugs.length, new Date());
    const slug = slugs[index];

    if (!slug) redirect("/cocktails");
    redirect(`/cocktails/${encodeURIComponent(slug)}?daily=true`);
  } catch (error) {
    console.error("Error determining daily cocktail:", error);
    redirect("/cocktails");
  }
}
