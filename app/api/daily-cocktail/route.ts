import { NextResponse } from "next/server";
import { getCocktailBySlug, getTodaysDailyCocktailSlug } from "@/lib/cocktails.server";
import { getCurrentLocalDateString } from "@/lib/dailyCocktail";

export const dynamic = "force-dynamic";

export async function GET() {
  const slug = await getTodaysDailyCocktailSlug();
  if (!slug) {
    return NextResponse.json({ error: "No daily cocktail" }, { status: 404 });
  }

  const cocktail = await getCocktailBySlug(slug);
  if (!cocktail) {
    return NextResponse.json({ error: "Cocktail not found" }, { status: 404 });
  }

  return NextResponse.json({
    dateKey: getCurrentLocalDateString(),
    slug: cocktail.slug,
    name: cocktail.name,
    baseSpirit: cocktail.base_spirit ?? null,
    categories: cocktail.categories_all?.slice(0, 6) ?? [],
    shortDescription: cocktail.short_description ?? null,
  });
}
