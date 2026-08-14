"use client";

import { useState, useEffect } from "react";
import { QuantitySelector } from "@/components/cocktails/QuantitySelector";
import { IngredientAvailability } from "@/components/cocktails/IngredientAvailability";
import { BartendersNoteCard } from "@/components/cocktails/BartendersNoteCard";
import Image from "next/image";
import { OptimizedCocktailImage } from "@/components/cocktails/OptimizedCocktailImage";
import { ComingSoonCocktailImage } from "@/components/cocktails/ComingSoonCocktailImage";
import { RecipeActions } from "@/components/cocktails/RecipeActions";
import { InstructionStepText } from "@/components/cocktails/InstructionStepText";
import { TechniqueCue } from "@/components/cocktails/TechniqueCue";
import { Button } from "@/components/common/Button";
import { formatCocktailName, isNewCocktail } from "@/lib/formatters";
import { scaleIngredientLines } from "@/lib/scaleRecipe";
import {
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import type { MatchedIngredient } from "@/lib/ingredientMatching";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import Link from "next/link";
import { isLearnPublic } from "@/lib/learnAccess";

interface RecipeContentProps {
  cocktail: any;
  sanityCocktail: any;
  ingredients: Array<{ text: string }>;
  matchedIngredients?: MatchedIngredient[];
  instructionSteps: string[];
  tagLine: string;
  imageUrl: string | null;
  similarRecipes: any[];
}

function RecipeIngredientLine({
  text,
  matched,
}: {
  text: string;
  matched?: MatchedIngredient;
}) {
  if (!matched?.guideSlug || !matched.name) {
    return <>• {text}</>;
  }

  const lowerText = text.toLowerCase();
  const lowerName = matched.name.toLowerCase();
  const idx = lowerText.lastIndexOf(lowerName);
  if (idx < 0) {
    return (
      <>
        • {text}{" "}
        <Link
          href={`/ingredients/${matched.guideSlug}`}
          className="mw-inline-term text-terracotta hover:underline"
        >
          {matched.name}
        </Link>
      </>
    );
  }

  return (
    <>
      • {text.slice(0, idx)}
      <Link
        href={`/ingredients/${matched.guideSlug}`}
        className="mw-inline-term text-terracotta hover:underline"
      >
        {text.slice(idx, idx + matched.name.length)}
      </Link>
      {text.slice(idx + matched.name.length)}
    </>
  );
}

export function RecipeContent({
  cocktail,
  sanityCocktail,
  ingredients,
  matchedIngredients,
  instructionSteps,
  tagLine,
  imageUrl,
  similarRecipes,
}: RecipeContentProps) {
  const [quantity, setQuantity] = useState(1);
  const { isAuthenticated, isLoading: authLoading } = useUser();
  const { openAuthDialog } = useAuthDialog();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const scaledIngredients = scaleIngredientLines(ingredients, quantity);

  // Helper function to extract ingredient name from text (matches ingredientMatching.ts logic)
  const extractIngredientNameFromText = (fullText: string): string => {
    return fullText
      .trim()
      .replace(/^\d+(\/\d+)?\.?\s*(oz|cup|cups|tbsp|tsp|dash|dashes|drop|drops|ml|cl|shot|jigger|part|parts|slice|slices|wheel|wheels|twist|twists|peel|peels|wedge|wedges|sprig|sprigs|leaf|leaves|piece|pieces)\s+/i, '')
      .replace(/^\d+\s+/, '')
      .trim();
  };

  // Use matched ingredients if available, but VALIDATE that they correspond to actual ingredients
  // This prevents non-recipe ingredients from appearing in the shopping list
  let shoppingListIngredients: Array<{ id: string; name: string; category?: string }>;
  
  if (matchedIngredients && matchedIngredients.length === ingredients.length) {
    // Validate that matchedIngredients correspond to actual ingredients
    const validatedIngredients: Array<{ id: string; name: string; category?: string }> = [];
    
    for (let i = 0; i < ingredients.length && i < matchedIngredients.length; i++) {
      const originalText = ingredients[i].text.trim();
      const matched = matchedIngredients[i];
      
      // Extract the ingredient name from the original text
      const extractedName = extractIngredientNameFromText(originalText);
      const extractedNameLower = extractedName.toLowerCase();
      const matchedNameLower = (matched.name || '').toLowerCase();
      
      // Verify that the matched ingredient name is related to the original ingredient text
      // This prevents incorrect matches from fuzzy matching
      const isMatchValid = 
        extractedNameLower === matchedNameLower ||
        extractedNameLower.includes(matchedNameLower) ||
        matchedNameLower.includes(extractedNameLower) ||
        extractedName.startsWith(matched.name?.split(' ')[0] || '') ||
        matched.name?.toLowerCase().startsWith(extractedName.split(' ')[0].toLowerCase() || '');
      
      if (isMatchValid) {
        validatedIngredients.push({
          id: matched.id,
          name: matched.name,
          category: matched.category || 'cocktail',
        });
      } else {
        // Fallback to parsing the original ingredient text if match is invalid
        const cleanedName = extractedName || originalText.replace(/^\d+(\/\d+|\.\d+)?\s*(oz|cup|cups|tbsp|tsp|ml|cl|dash|dashes|drop|drops|slice|slices|piece|pieces|sprig|sprigs|leaf|leaves|wheel|wheels|twist|twists|rim|rims|part|parts)\s+/i, '').replace(/^\d+(\/\d+|\.\d+)?\s+/, '').trim();
        const ingredientId = cleanedName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
        
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[RecipeContent] Invalid ingredient match: "${extractedName}" was matched to "${matched.name}". Using fallback.`);
        }
        
        validatedIngredients.push({
          id: ingredientId || `ingredient-${i}`,
          name: cleanedName || originalText,
          category: 'cocktail',
        });
      }
    }
    
    shoppingListIngredients = validatedIngredients;
  } else {
    // Fallback: Better ingredient name extraction
    shoppingListIngredients = ingredients.map((ing, index) => {
      const text = ing.text.trim();
      const cleanedName = extractIngredientNameFromText(text);
      const ingredientId = cleanedName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');

      return {
        id: ingredientId || `ingredient-${index}`,
        name: cleanedName || text,
        category: 'cocktail',
      };
    });
  }

  return (
    <>
      {/* HERO SECTION */}
      <section className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start mb-16">
        {/* Text */}
        <div className="flex-1">
          {/* Status badges above title */}
          {isNewCocktail(cocktail.created_at) && (
            <div className="mb-2 mr-2 inline-flex items-center gap-1 rounded-full bg-terracotta px-2 py-0.5 text-[11px] font-semibold text-cream">
              NEW
            </div>
          )}
          {cocktail.metadata_json?.is_community_favorite && (
            <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
              ★ Community Favorite
            </div>
          )}
          {!cocktail.metadata_json?.is_community_favorite && cocktail.metadata_json?.is_mixwise_original && (
            <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
              MixWise Original
            </div>
          )}

          {/* Drink title */}
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-6 break-words [text-wrap:balance]">
            {formatCocktailName(sanityCocktail.name)}
          </h1>

          <hr className="border-mist mb-6" />

          {/* Short description */}
          {cocktail.short_description && (
            <p className="text-lg font-medium text-foreground mb-6 leading-tight">
              {cocktail.short_description}
            </p>
          )}

          <hr className="border-mist mb-6" />

          {/* Drink properties (difficulty, glassware, etc.) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Base Spirit */}
            {cocktail.base_spirit && (
              <div>
                <div className="mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Base spirit
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-mist text-sage text-sm font-medium rounded-full">
                    {cocktail.base_spirit.charAt(0).toUpperCase() + cocktail.base_spirit.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
            )}

            {/* Style */}
            {cocktail.category_primary && (
              <div>
                <div className="mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Style
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-mist text-sage text-sm font-medium rounded-full">
                    {cocktail.category_primary.charAt(0).toUpperCase() + cocktail.category_primary.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
            )}

            {/* Glassware */}
            {cocktail.glassware && (
              <div>
                <div className="mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Glassware
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-mist text-sage text-sm font-medium rounded-full">
                    {cocktail.glassware.charAt(0).toUpperCase() + cocktail.glassware.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
            )}

            {/* Technique */}
            {cocktail.technique && (
              <div>
                <div className="mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Technique
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-mist text-sage text-sm font-medium rounded-full">
                    {cocktail.technique.charAt(0).toUpperCase() + cocktail.technique.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
            )}

          </div>

          <hr className="border-mist mb-6" />

          {/* Long description */}
          {cocktail.long_description && (
            <div className="prose prose-gray max-w-none mb-6">
              <p className="text-base leading-relaxed">{cocktail.long_description}</p>
            </div>
          )}

          <hr className="border-mist mb-6" />

          {/* Jump to recipe button */}
          <Button
            variant="secondary"
            className="w-full sm:w-auto mb-6"
            onClick={() => {
              document.getElementById('recipe')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Jump to recipe
          </Button>

          {/* Share icons */}
          <div>
            <RecipeActions
              cocktail={{
                id: cocktail.id,
                name: cocktail.name,
                slug: cocktail.slug,
                image_url: cocktail.image_url,
                base_spirit: cocktail.base_spirit,
                categories_all: cocktail.categories_all,
              }}
            />
          </div>
        </div>

        {/* Image */}
        <div className="w-full max-w-2xl lg:max-w-lg">
          <div className="relative overflow-hidden rounded-xl border bg-black/5">
            <div className="aspect-[4/5] relative">
              {imageUrl ? (
                <OptimizedCocktailImage
                  src={imageUrl}
                  alt={cocktail.image_alt ?? cocktail.name}
                  priority
                  quality={92}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 512px"
                />
              ) : (
                <ComingSoonCocktailImage name={cocktail.name} />
              )}
            </div>

            {/* Ribbon badge */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
              {isNewCocktail(cocktail.created_at) && (
                <div className="rounded-full bg-terracotta px-2 py-0.5 text-[11px] font-semibold text-cream shadow-lg">
                  NEW
                </div>
              )}
              {cocktail.metadata_json?.is_community_favorite && (
                <div className="rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-amber-200">
                  ★ Community Favorite
                </div>
              )}
              {!cocktail.metadata_json?.is_community_favorite && cocktail.metadata_json?.is_mixwise_original && (
                <div className="rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-amber-200">
                  MixWise Original
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* INGREDIENTS COLUMN */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl shadow-soft border border-gray-100 lg:sticky lg:top-24">
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-4">Ingredients</h2>
            <div className="mb-6">
              <QuantitySelector
                quantity={quantity}
                onQuantityChange={setQuantity}
              />
            </div>

            {ingredients.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Ingredient list isn&apos;t available for this recipe yet.
              </p>
            ) : (
              <ul className="mt-3 space-y-1 text-sm">
                {scaledIngredients.map((ing, idx) => (
                  <li key={idx}>
                    <RecipeIngredientLine text={ing.text} matched={matchedIngredients?.[idx]} />
                  </li>
                ))}
              </ul>
            )}

            {ingredients.length > 0 && mounted && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                {!authLoading && isAuthenticated ? (
                  <>
                    <IngredientAvailability 
                      ingredients={shoppingListIngredients} 
                      quantity={quantity}
                    />
                  </>
                ) : !authLoading && !isAuthenticated ? (
                  <>
                    <button
                      onClick={() => openAuthDialog({
                        title: "Track the bottles you're missing",
                        subtitle: "Sign in to save missing ingredients and add them to your bar when you pick them up.",
                      })}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-terracotta hover:bg-terracotta-dark text-cream font-semibold rounded-xl transition-colors"
                    >
                      <ShoppingBagIcon className="w-4 h-4" />
                      Get the missing bottles
                    </button>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>


        {/* RIGHT COLUMN */}
        <div className="lg:col-span-7 space-y-10">

          {/* Best For */}
          {sanityCocktail.bestFor && sanityCocktail.bestFor.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
              <h3 className="font-serif font-bold text-lg text-gray-900 mb-4">Best For</h3>
              <div className="flex flex-wrap gap-2">
                {sanityCocktail.bestFor.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-mist text-sage text-sm font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Did you know? */}
          {sanityCocktail.funFact && (
            <BartendersNoteCard
              note={sanityCocktail.funFact}
              sources={sanityCocktail.funFactSources}
            />
          )}

          {/* Bartender's Note */}
          {cocktail.notes && (
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
              <h3 className="font-serif font-bold text-lg text-gray-900 mb-4">Bartender&apos;s Note</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{cocktail.notes}</p>
            </div>
          )}

          {isLearnPublic() && (
            <p className="text-xs text-sage">
              Missing a bottle?{" "}
              <Link href="/learn/swaps" className="mw-inline-term text-terracotta hover:underline font-medium">
                See smart swaps in Learn
              </Link>
              .
            </p>
          )}
        </div>
      </div>

      {/* Instructions Section */}
      <section id="recipe" className="mt-16">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mb-8 border-b border-gray-200 pb-4 break-words">
          How to make the {formatCocktailName(sanityCocktail.name)}
        </h2>

        {instructionSteps.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Step-by-step instructions aren&apos;t listed for this recipe yet.
          </p>
        ) : (
          <>
            <TechniqueCue technique={cocktail.technique} />
            <ol className="space-y-3">
              {instructionSteps.map((step, idx) => (
                <li key={idx} className="flex gap-3 items-start">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold">
                    {idx + 1}
                  </span>
                  <InstructionStepText text={step} />
                </li>
              ))}
            </ol>
          </>
        )}
      </section>

      {/* Drinks similar to [Drink Name] */}
      {similarRecipes.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mb-8 border-b border-gray-200 pb-4 break-words">
            Drinks similar to {formatCocktailName(sanityCocktail.name)}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarRecipes.slice(0, 3).map((recipe) => {
              const slug = recipe.slug || recipe.id;
              return (
                <a
                  key={recipe.id}
                  href={`/cocktails/${slug}`}
                  className="group bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video relative">
                    {recipe.image_url ? (
                      <OptimizedCocktailImage
                        src={recipe.image_url}
                        alt={recipe.name}
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        quality={85}
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    ) : (
                      <ComingSoonCocktailImage name={recipe.name} size="card" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-terracotta transition-colors">
                      {formatCocktailName(recipe.name)}
                    </h3>
                    {recipe.short_description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {recipe.short_description}
                      </p>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
