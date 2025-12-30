import { redirect } from "next/navigation";
import { getTodaysDailyCocktailSlug } from "@/lib/cocktails.server";

export const dynamic = "force-dynamic";

export default async function CocktailOfTheDayPage() {
  try {
    const slug = await getTodaysDailyCocktailSlug();
    if (!slug) redirect("/cocktails");
    redirect(`/cocktails/${encodeURIComponent(slug)}?daily=true`);
  } catch (error) {
    console.error("Error determining daily cocktail:", error);
    redirect("/cocktails");
  }
}
