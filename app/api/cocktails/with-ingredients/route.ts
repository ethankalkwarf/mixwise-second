import { NextResponse } from 'next/server';
import { getCocktailsWithIngredients } from '@/lib/cocktails.server';

export async function GET() {
  try {
    const cocktails = await getCocktailsWithIngredients();

    return NextResponse.json(cocktails, {
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
