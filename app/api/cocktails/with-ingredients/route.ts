import { NextRequest, NextResponse } from 'next/server';
import { getCocktailsWithIngredients } from '@/lib/cocktails.server';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] API route called - fetching cocktails with ingredients from server-side');

    const cocktails = await getCocktailsWithIngredients();

    console.log(`[API] API returning ${cocktails.length} cocktails with ingredients`);
    console.log(`[API] First cocktail has ingredients: ${cocktails[0]?.ingredients?.length || 0}`);
    console.log(`[API] First cocktail keys:`, Object.keys(cocktails[0] || {}));
    console.log(`[API] First cocktail sample:`, JSON.stringify(cocktails[0], null, 2));

    return NextResponse.json(cocktails);
  } catch (error) {
    console.error('[API] Error in API route:', error);

    return NextResponse.json(
      { error: 'Failed to fetch cocktails with ingredients' },
      { status: 500 }
    );
  }
}
