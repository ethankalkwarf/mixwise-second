"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckIcon } from "@heroicons/react/24/outline";
import type { CocktailListItem } from "@/lib/cocktailTypes";
import type { Cocktail } from "@/lib/cocktailTypes";
import type { QuestionnaireAnswers, SelectedCocktails } from "./WeddingCocktailFinder";

interface WeddingRecommendationsProps {
  recommendations: CocktailListItem[];
  selectedCocktails: SelectedCocktails;
  onSelectCocktail: (cocktail: CocktailListItem, type: "his" | "her") => void;
  answers: QuestionnaireAnswers;
  isLoading: boolean;
  isAuthenticated: boolean;
  onSignupClick: () => void;
}

export function WeddingRecommendations({
  recommendations,
  selectedCocktails,
  onSelectCocktail,
  answers,
  isLoading,
  isAuthenticated,
  onSignupClick,
}: WeddingRecommendationsProps) {

  const canCreateMenu = selectedCocktails.hisCocktail && selectedCocktails.herCocktail;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-lg text-sage">Loading recommendations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-forest mb-4">
          Your Perfect Wedding Cocktails
        </h1>
        <p className="text-base sm:text-lg text-sage max-w-2xl mx-auto mb-4">
          Based on your preferences, here are our top recommendations
        </p>
        {!isAuthenticated && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta/10 border border-terracotta/20 rounded-full text-sm text-forest">
            <span>💡</span>
            <span>
              <button
                onClick={onSignupClick}
                className="font-semibold text-terracotta hover:underline"
              >
                Sign up free
              </button>
              {" "}to save your selections
            </span>
          </div>
        )}
      </div>

      {/* Recommendations Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {recommendations.map((cocktail) => {
          const isHisSelected = selectedCocktails.hisCocktail?.id === cocktail.id;
          const isHerSelected = selectedCocktails.herCocktail?.id === cocktail.id;
          const isSelected = isHisSelected || isHerSelected;

          return (
            <div
              key={cocktail.id}
              className={`bg-white border-2 rounded-3xl overflow-hidden transition-all ${
                isSelected
                  ? "border-terracotta shadow-card"
                  : "border-mist hover:shadow-card-hover"
              }`}
            >
              {cocktail.image_url && (
                <div className="aspect-video relative bg-slate-200">
                  <Image
                    src={cocktail.image_url}
                    alt={cocktail.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-display font-bold text-forest mb-2">
                  {cocktail.name}
                </h3>
                {cocktail.short_description && (
                  <p className="text-sm text-sage mb-4 line-clamp-2">
                    {cocktail.short_description}
                  </p>
                )}
                <div className="flex items-center gap-2 mb-4">
                  {cocktail.base_spirit && (
                    <span className="px-2 py-1 bg-mist text-sage text-xs rounded">
                      {cocktail.base_spirit}
                    </span>
                  )}
                  {cocktail.difficulty && (
                    <span className="px-2 py-1 bg-mist text-sage text-xs rounded">
                      {cocktail.difficulty}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onSelectCocktail(cocktail, "his")}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isHisSelected
                        ? "bg-terracotta text-cream"
                        : "bg-mist text-forest hover:bg-terracotta/20"
                    }`}
                  >
                    {isHisSelected ? (
                      <span className="flex items-center justify-center gap-1">
                        <CheckIcon className="w-4 h-4" />
                        His Choice
                      </span>
                    ) : (
                      "His Choice"
                    )}
                  </button>
                  <button
                    onClick={() => onSelectCocktail(cocktail, "her")}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isHerSelected
                        ? "bg-terracotta text-cream"
                        : "bg-mist text-forest hover:bg-terracotta/20"
                    }`}
                  >
                    {isHerSelected ? (
                      <span className="flex items-center justify-center gap-1">
                        <CheckIcon className="w-4 h-4" />
                        Her Choice
                      </span>
                    ) : (
                      "Her Choice"
                    )}
                  </button>
                </div>
                <Link
                  href={`/cocktails/${cocktail.slug}`}
                  className="block text-center text-sm text-terracotta hover:underline mt-3"
                >
                  View Recipe →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Cocktails Summary */}
      {(selectedCocktails.hisCocktail || selectedCocktails.herCocktail) && (
        <div className="bg-white border border-mist rounded-3xl p-6 sm:p-8 mb-8 shadow-soft">
          <h2 className="text-2xl font-display font-bold text-forest mb-4">
            Your Selected Cocktails
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {selectedCocktails.hisCocktail && (
              <div className="p-4 bg-mist rounded-lg">
                <p className="text-sm text-sage mb-1">His Choice</p>
                <p className="font-bold text-forest">{selectedCocktails.hisCocktail.name}</p>
              </div>
            )}
            {selectedCocktails.herCocktail && (
              <div className="p-4 bg-mist rounded-lg">
                <p className="text-sm text-sage mb-1">Her Choice</p>
                <p className="font-bold text-forest">{selectedCocktails.herCocktail.name}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Selections Section */}
      {canCreateMenu && (
        <div className="bg-white border border-mist rounded-3xl p-8 sm:p-12 shadow-soft">
          <h2 className="text-2xl font-display font-bold text-forest mb-6">
            Save Your Selections
          </h2>
          
          {!isAuthenticated ? (
            /* Signup Gate */
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-display font-bold text-forest mb-3">
                Sign Up to Save Your Selections
              </h3>
              <p className="text-sage mb-6 max-w-md mx-auto">
                Create a free account to save your cocktail selections and get personalized recommendations for your home bar.
              </p>
              <button
                onClick={onSignupClick}
                className="px-8 py-4 bg-terracotta hover:bg-terracotta-dark text-cream font-bold text-lg rounded-full transition-colors shadow-lg shadow-terracotta/20 mb-3"
              >
                Sign Up Free
              </button>
              <p className="text-xs text-sage">
                No credit card required • Takes 30 seconds
              </p>
            </div>
          ) : (
            /* Saved Selections Display */
            <div className="space-y-4">
              <div className="bg-mist rounded-xl p-6">
                <p className="text-sm text-sage mb-2">Your Selected Cocktails</p>
                <div className="space-y-2">
                  {selectedCocktails.hisCocktail && (
                    <p className="font-bold text-forest">
                      His Choice: {selectedCocktails.hisCocktail.name}
                    </p>
                  )}
                  {selectedCocktails.herCocktail && (
                    <p className="font-bold text-forest">
                      Her Choice: {selectedCocktails.herCocktail.name}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm text-sage text-center">
                ✓ Your selections have been saved to your account
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

