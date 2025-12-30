"use client";

import { getCocktailsList } from "@/lib/cocktails.server";
import { getTodaysDailyCocktail } from "@/lib/dailyCocktail";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function CocktailOfTheDayPage() {
  useEffect(() => {
    // Fetch cocktails and determine daily cocktail on the client side
    const fetchAndRedirect = async () => {
      try {
        const cocktails = await getCocktailsList();
        const dailyCocktail = getTodaysDailyCocktail(cocktails);

        if (!dailyCocktail) {
          redirect('/cocktails');
          return;
        }

        // Redirect to the daily cocktail page with a query parameter to indicate it's the daily cocktail
        redirect(`/cocktails/${dailyCocktail.slug}?daily=true`);
      } catch (error) {
        console.error('Error fetching daily cocktail:', error);
        redirect('/cocktails');
      }
    };

    fetchAndRedirect();
  }, []);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta mx-auto mb-4"></div>
        <p className="text-sage">Finding today's cocktail...</p>
      </div>
    </div>
  );
}
