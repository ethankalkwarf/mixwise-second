import { getCocktailsList } from "@/lib/cocktails.server";
import { redirect } from "next/navigation";

// Helper function to get a deterministic daily cocktail
function getDailyCocktail(cocktails: any[]): any {
  if (!cocktails.length) return null;

  // Use current date to create a deterministic seed
  const today = new Date();
  const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format

  // Simple hash function for the date
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use absolute value to ensure positive index
  const index = Math.abs(hash) % cocktails.length;
  return cocktails[index];
}

export default async function CocktailOfTheDayPage() {
  const cocktails = await getCocktailsList();
  const dailyCocktail = getDailyCocktail(cocktails);

  if (!dailyCocktail) {
    redirect('/cocktails');
  }

  // Redirect to the daily cocktail page with a query parameter to indicate it's the daily cocktail
  redirect(`/cocktails/${dailyCocktail.slug}?daily=true`);
}
