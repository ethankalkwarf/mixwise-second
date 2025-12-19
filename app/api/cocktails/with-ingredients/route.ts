import { NextRequest, NextResponse } from 'next/server';
import { getCocktailsWithIngredients } from '@/lib/cocktails.server';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Fetching cocktails with ingredients from server-side');

    const cocktails = await getCocktailsWithIngredients();

    console.log(`[API] Returning ${cocktails.length} cocktails with ingredients`);

    return NextResponse.json(cocktails);
  } catch (error) {
    console.error('[API] Error fetching cocktails with ingredients:', error);

    return NextResponse.json(
      { error: 'Failed to fetch cocktails with ingredients' },
      { status: 500 }
    );
  }
}
