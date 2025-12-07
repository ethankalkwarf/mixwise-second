"use client";

import { useState } from "react";
import { QuantitySelector } from "@/components/cocktails/QuantitySelector";
import { ShoppingListButton } from "@/components/cocktails/ShoppingListButton";
import { BartendersNoteCard } from "@/components/cocktails/BartendersNoteCard";
import { FlavorProfileCard } from "@/components/cocktails/FlavorProfileCard";
import Image from "next/image";
import { RecipeActions } from "@/components/cocktails/RecipeActions";

interface RecipeContentProps {
  cocktail: any;
  sanityCocktail: any;
  ingredients: Array<{ text: string }>;
  instructionSteps: string[];
  tagLine: string;
  imageUrl: string | null;
  similarRecipes: any[];
}

function scaleIngredient(ingredientText: string, scale: number): string {
  // Simple regex to find measurements like "1.5 oz", "2 cups", "1/2 tsp", etc.
  const measurementRegex = /(\d+(?:\.\d+)?|\d+\/\d+)\s*(oz|cup|cups|tbsp|tsp|ml|cl|dash|dashes|drop|drops|slice|slices|piece|pieces|sprig|sprigs|leaf|leaves|wheel|wheels|twist|twists|rim|rims)/gi;

  return ingredientText.replace(measurementRegex, (match, amount, unit) => {
    const numericAmount = amount.includes('/') ? eval(amount) : parseFloat(amount);
    const scaledAmount = numericAmount * scale;

    // Format the scaled amount nicely
    let formattedAmount: string;
    if (scaledAmount % 1 === 0) {
      formattedAmount = scaledAmount.toString();
    } else if (scaledAmount < 1) {
      // Convert to fraction for amounts less than 1
      const fractions: { [key: number]: string } = {
        0.125: "1/8",
        0.25: "1/4",
        0.33: "1/3",
        0.5: "1/2",
        0.67: "2/3",
        0.75: "3/4",
      };
      formattedAmount = fractions[scaledAmount] || scaledAmount.toFixed(2);
    } else {
      formattedAmount = scaledAmount.toFixed(1);
    }

    return `${formattedAmount} ${unit}`;
  });
}

export function RecipeContent({
  cocktail,
  sanityCocktail,
  ingredients,
  instructionSteps,
  tagLine,
  imageUrl,
  similarRecipes,
}: RecipeContentProps) {
  const [quantity, setQuantity] = useState(1);

  const scaledIngredients = ingredients.map(ing => ({
    ...ing,
    text: quantity === 1 ? ing.text : scaleIngredient(ing.text, quantity),
  }));

  // Extract ingredients for shopping list (simplified - would need better parsing in real app)
  const shoppingListIngredients = ingredients.map((ing, index) => ({
    id: `ing-${index}`,
    name: ing.text.split(' ').slice(1).join(' ') || ing.text, // Rough extraction
    category: 'cocktail',
  }));

  return (
    <>
      {/* HERO SECTION */}
      <section className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start mb-16">
        {/* Text */}
        <div className="flex-1">
          {/* Status badges above title */}
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

          {/* Recipe Actions (Heart + Share) */}
          <div className="mb-4">
            <RecipeActions cocktail={cocktail} />
          </div>

          <h1 className="text-4xl font-semibold tracking-tight mb-2">
            {sanityCocktail.name}
          </h1>

          {/* Short Description */}
          {cocktail.short_description && (
            <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
              {cocktail.short_description}
            </p>
          )}

          {/* Long Description */}
          {cocktail.long_description && (
            <div className="prose prose-gray max-w-none mb-6">
              <p className="text-base leading-relaxed">{cocktail.long_description}</p>
            </div>
          )}

          {tagLine && (
            <p className="mt-1 text-xs text-muted-foreground tracking-wide mb-4">
              {tagLine}
            </p>
          )}

          {/* Meta chips row */}
          {(() => {
            const baseSpiritChip = cocktail.base_spirit
              ? cocktail.base_spirit
              : null;

            const categoryChip = cocktail.category_primary
              ? cocktail.category_primary
              : null;

            const glassChip = cocktail.glassware
              ? `Glass: ${cocktail.glassware}`
              : null;

            const difficultyChip = cocktail.difficulty
              ? `Difficulty: ${cocktail.difficulty}`
              : null;

            // style_tags might be missing on some cocktails; guard it
            const styleTagsRaw = cocktail.style_tags ?? null;
            const styleTags = styleTagsRaw ? [styleTagsRaw] : [];

            const metaChips = [
              baseSpiritChip,
              categoryChip,
              glassChip,
              difficultyChip,
              ...styleTags,
            ].filter(Boolean) as string[];

            return (
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                {metaChips.map((chip, i) => (
                  <span
                    key={i}
                    className="rounded-full border px-2 py-0.5 bg-white/60"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Image */}
        <div className="w-full max-w-2xl lg:max-w-lg">
          <div className="relative overflow-hidden rounded-xl border bg-black/5">
            <div className="aspect-[4/5] relative">
              {cocktail.image_url ? (
                <Image
                  src={cocktail.image_url}
                  alt={cocktail.image_alt ?? cocktail.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  No image available
                </div>
              )}
            </div>

            {/* Ribbon badge */}
            {cocktail.metadata_json?.is_community_favorite && (
              <div className="absolute top-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-amber-200">
                ★ Community Favorite
              </div>
            )}

            {!cocktail.metadata_json?.is_community_favorite && cocktail.metadata_json?.is_mixwise_original && (
              <div className="absolute top-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-amber-200">
                MixWise Original
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* INGREDIENTS COLUMN */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-soft border border-gray-100 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-bold text-gray-900">Ingredients</h2>
              <QuantitySelector
                quantity={quantity}
                onQuantityChange={setQuantity}
                label="servings"
              />
            </div>

            {ingredients.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Ingredients coming soon.
              </p>
            ) : (
              <ul className="mt-3 space-y-1 text-sm">
                {scaledIngredients.map((ing, idx) => (
                  <li key={idx}>• {ing.text}</li>
                ))}
              </ul>
            )}

            {ingredients.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <ShoppingListButton
                  ingredients={shoppingListIngredients}
                  quantity={quantity}
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-7 space-y-10">
          {/* Flavor Profile - moved lower */}
          <FlavorProfileCard
            flavor={{
              strength: cocktail.flavor_strength,
              sweetness: cocktail.flavor_sweetness,
              tartness: cocktail.flavor_tartness,
              bitterness: cocktail.flavor_bitterness,
              aroma: cocktail.flavor_aroma,
              texture: cocktail.flavor_texture,
            }}
          />

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

          {/* Bartender's Note */}
          {sanityCocktail.funFact && (
            <BartendersNoteCard
              note={sanityCocktail.funFact}
              sources={sanityCocktail.funFactSources}
            />
          )}

          {/* Additional Notes */}
          {cocktail.notes && (
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
              <h3 className="font-serif font-bold text-lg text-gray-900 mb-4">Additional Notes</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{cocktail.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions Section */}
      <section className="mt-16">
        <h2 className="font-serif text-3xl font-bold text-gray-900 mb-8 border-b border-gray-200 pb-4">
          How to Make It {sanityCocktail.name}
        </h2>

        {instructionSteps.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Instructions coming soon.
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {instructionSteps.map((step, idx) => (
              <li key={idx} className="flex gap-3 items-start">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold">
                  {idx + 1}
                </span>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* You Might Also Like */}
      {similarRecipes.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-3xl font-bold text-gray-900 mb-8 border-b border-gray-200 pb-4">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarRecipes.slice(0, 6).map((recipe) => (
              <a
                key={recipe.id}
                href={`/cocktails/${recipe.slug}`}
                className="group bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video relative">
                  {recipe.image_url ? (
                    <Image
                      src={recipe.image_url}
                      alt={recipe.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground bg-gray-50">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-terracotta transition-colors">
                    {recipe.name}
                  </h3>
                  {recipe.short_description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {recipe.short_description}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
