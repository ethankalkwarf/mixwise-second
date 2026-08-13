import { NextResponse } from 'next/server';
import { getCocktailsWithIngredients } from '@/lib/cocktails.server';

export async function GET() {
  try {
    const cocktails = await getCocktailsWithIngredients();

    const slim = cocktails.map((cocktail) => ({
      id: cocktail.id,
      name: cocktail.name,
      slug: cocktail.slug,
      imageUrl: cocktail.imageUrl,
      primarySpirit: cocktail.primarySpirit,
      isPopular: cocktail.isPopular,
      createdAt: cocktail.createdAt,
      ingredients: (cocktail.ingredientsWithIds || []).map((ing) => ({
        id: ing.id,
        name: ing.name,
        isOptional: Boolean(ing.isOptional),
      })),
    }));

    return NextResponse.json(slim, {
      headers: {
        "Cache-Control":
          "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error('[API] Error in API route:', error);

    return NextResponse.json(
      { error: 'Failed to fetch cocktails with ingredients' },
      { status: 500 }
    );
  }
}
