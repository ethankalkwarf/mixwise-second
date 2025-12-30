import { getTodaysDailyCocktail } from "@/lib/dailyCocktail";
import { redirect } from "next/navigation";

import { getCocktailsList } from "@/lib/cocktails.server";

export const dynamic = "force-dynamic";

export default async function CocktailOfTheDayPage() {
  try {
    const cocktails = await getCocktailsList();
    const dailyCocktail = getTodaysDailyCocktail(cocktails);

    if (!dailyCocktail?.slug) {
      redirect("/cocktails");
    }

    redirect(`/cocktails/${encodeURIComponent(dailyCocktail.slug)}?daily=true`);
  } catch (error) {
    console.error("Error determining daily cocktail:", error);
    redirect("/cocktails");
  }
}
