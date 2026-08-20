import { NextResponse } from "next/server";
import { getCocktailBySlug, getTodaysDailyCocktailSlug } from "@/lib/cocktails.server";
import { getCurrentLocalDateString } from "@/lib/dailyCocktail";
import { getDailyCocktailForecast } from "@/lib/dailyCocktailCalendar.server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const daysParam = searchParams.get("days");

  if (daysParam != null) {
    const days = Number.parseInt(daysParam, 10);
    if (!Number.isFinite(days) || days < 1) {
      return NextResponse.json({ error: "Invalid days" }, { status: 400 });
    }

    const forecast = await getDailyCocktailForecast(days);
    if (!forecast.length) {
      return NextResponse.json({ error: "No daily cocktail forecast" }, { status: 404 });
    }

    return NextResponse.json({
      days: forecast.length,
      items: forecast,
    });
  }

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
