"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { MixResultsPanel } from "@/components/mix/MixResultsPanel";
import { MixSkeleton } from "@/components/mix/MixSkeleton";
import { CategoryPicker } from "@/components/mix/CategoryPicker";
import { IngredientTile } from "@/components/mix/IngredientTile";
import { YourBarPanel } from "@/components/mix/YourBarPanel";
import { ClearBarConfirmDialog } from "@/components/mix/ClearBarConfirmDialog";
import { MixCabinet } from "@/components/mix/MixCabinet";
import { MixMixer } from "@/components/mix/MixMixer";
import { MixMenu } from "@/components/mix/MixMenu";
import { getMixDataClient, getUserBarIngredientIdsClient } from "@/lib/cocktails";
import { getMixMatchGroups } from "@/lib/mixMatching";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useUser } from "@/components/auth/UserProvider";
import type { MixIngredient, MixCocktail } from "@/lib/mixTypes";
import { InformationCircleIcon, BookmarkIcon, PlusIcon, HomeIcon, WrenchScrewdriverIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";
import { MainContainer } from "@/components/layout/MainContainer";

// Show sign-up prompt after adding this many ingredients
const PROMPT_THRESHOLD = 3;

export default function MixPage() {
  const [allIngredients, setAllIngredients] = useState<MixIngredient[]>([]);
  const [allCocktails, setAllCocktails] = useState<MixCocktail[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);

  // State for redesigned UI
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Three-step funnel state
  const [currentStep, setCurrentStep] = useState<'cabinet' | 'mixer' | 'menu'>('cabinet');
  const [isProcessing, setIsProcessing] = useState(false);

  const { isAuthenticated, user } = useUser();
  const {
    ingredientIds,
    isLoading: barLoading,
    addIngredient,
    removeIngredient,
    setIngredients,
    clearAll,
    promptToSave,
  } = useBarIngredients();

  const searchParams = useSearchParams();

  // Allow deep-linking to the Menu step when the user already has ingredients
  useEffect(() => {
    const stepParam = searchParams?.get("step");
    if (stepParam === "menu" && ingredientIds.length > 0) {
      setCurrentStep("menu");
    }
  }, [searchParams, ingredientIds.length]);

  // Calculate staple IDs for filtering out basic ingredients
  const stapleIds = useMemo(() => {
    const dbStaples = allIngredients.filter((i) => i?.isStaple).map((i) => i?.id).filter(Boolean);
    const manualStaples = ['ice', 'water']; // Only truly universal basics
    return [...new Set([...dbStaples, ...manualStaples])];
  }, [allIngredients]);

  // Load data from Supabase (with fallback for development)
  useEffect(() => {
    async function loadData() {
        try {
        const { ingredients, cocktails } = await getMixDataClient();

        // Debug: Check cocktail structure
        if (process.env.NODE_ENV === 'development' && cocktails.length > 0) {
          console.log('[MIX-DEBUG] First cocktail structure:', {
            id: cocktails[0].id,
            name: cocktails[0].name,
            hasIngredients: !!cocktails[0].ingredients,
            ingredientsType: typeof cocktails[0].ingredients,
            ingredientsIsArray: Array.isArray(cocktails[0].ingredients),
            ingredientsLength: cocktails[0].ingredients?.length || 0,
            sampleIngredient: cocktails[0].ingredients?.[0]
          });
        }

        // Guard: Filter out cocktails with missing or empty ingredients arrays
        console.log('[MIX-DEBUG] Filtering cocktails, total:', cocktails.length);
        console.log('[MIX-DEBUG] First cocktail sample:', JSON.stringify(cocktails[0], null, 2));

        // Track excluded cocktails for diagnostics
        const excludedByReason: {
          nullIngredients: typeof cocktails;
          emptyIngredients: typeof cocktails;
          notArray: typeof cocktails;
        } = {
          nullIngredients: [],
          emptyIngredients: [],
          notArray: [],
        };

        const validCocktails = cocktails.filter(cocktail => {
          const isValid = cocktail &&
                         cocktail.ingredients &&
                         Array.isArray(cocktail.ingredients) &&
                         cocktail.ingredients.length > 0;

          if (!isValid) {
            // Categorize the reason for exclusion
            if (!cocktail.ingredients) {
              excludedByReason.nullIngredients.push(cocktail);
            } else if (!Array.isArray(cocktail.ingredients)) {
              excludedByReason.notArray.push(cocktail);
            } else if (cocktail.ingredients.length === 0) {
              excludedByReason.emptyIngredients.push(cocktail);
            }

            console.log('[MIX-DEBUG] Invalid cocktail:', cocktail.name, {
              id: cocktail.id,
              hasIngredients: !!cocktail.ingredients,
              ingredientsType: typeof cocktail.ingredients,
              ingredientsIsArray: Array.isArray(cocktail.ingredients),
              ingredientsLength: cocktail.ingredients?.length || 0,
              ingredients: cocktail.ingredients,
              cocktailKeys: Object.keys(cocktail)
            });
          }

          return isValid;
        });

        console.log('[MIX-DEBUG] After filtering: valid cocktails:', validCocktails.length);
        if (validCocktails.length > 0) {
          console.log('[MIX-DEBUG] First valid cocktail:', JSON.stringify(validCocktails[0], null, 2));
        }

        // Development-only warning for excluded cocktails with detailed breakdown
        if (process.env.NODE_ENV === 'development') {
          const excludedCount = cocktails.length - validCocktails.length;
          if (excludedCount > 0) {
            console.warn(`
╔════════════════════════════════════════╗
║    COCKTAIL DATA QUALITY REPORT        ║
╠════════════════════════════════════════╣
║ Total cocktails loaded: ${cocktails.length}
║ Valid cocktails: ${validCocktails.length} (${((validCocktails.length / cocktails.length) * 100).toFixed(1)}%)
║ EXCLUDED: ${excludedCount} (${((excludedCount / cocktails.length) * 100).toFixed(1)}%)
╠════════════════════════════════════════╣
║ Excluded cocktails breakdown:
║   • Null/undefined ingredients: ${excludedByReason.nullIngredients.length}
║   • Empty ingredient array: ${excludedByReason.emptyIngredients.length}
║   • Not an array (invalid type): ${excludedByReason.notArray.length}
╚════════════════════════════════════════╝
            `);

            // Show first 10 excluded cocktails
            if (excludedByReason.nullIngredients.length > 0) {
              console.log('[MIX-DEBUG] Null ingredients cocktails (first 5):');
              excludedByReason.nullIngredients.slice(0, 5).forEach((c, i) => {
                console.log(`  ${i + 1}. ${c.name} (${c.id})`);
              });
            }

            if (excludedByReason.emptyIngredients.length > 0) {
              console.log('[MIX-DEBUG] Empty ingredient array cocktails (first 5):');
              excludedByReason.emptyIngredients.slice(0, 5).forEach((c, i) => {
                console.log(`  ${i + 1}. ${c.name} (${c.id})`);
              });
            }

            if (excludedByReason.notArray.length > 0) {
              console.log('[MIX-DEBUG] Invalid type cocktails (first 5):');
              excludedByReason.notArray.slice(0, 5).forEach((c, i) => {
                console.log(`  ${i + 1}. ${c.name} (${c.id}) - type: ${typeof c.ingredients}`);
              });
            }
          }
        }

        console.log(`[MIX-DEBUG] Setting state: ${ingredients.length} ingredients, ${validCocktails.length} valid cocktails`);
        setAllIngredients(ingredients || []);
        setAllCocktails(validCocktails || []);
      } catch (error) {
        console.error('Failed to load data from Supabase:', error);
        console.log('Using mock data for development...');

        // Mock data for development when API is unavailable
        const mockIngredients: MixIngredient[] = [
          { id: 'vodka', name: 'Vodka', category: 'Spirit', isStaple: false },
          { id: 'gin', name: 'Gin', category: 'Spirit', isStaple: false },
          { id: 'rum', name: 'Rum', category: 'Spirit', isStaple: false },
          { id: 'tequila', name: 'Tequila', category: 'Spirit', isStaple: false },
          { id: 'lime-juice', name: 'Lime Juice', category: 'Citrus', isStaple: false },
          { id: 'simple-syrup', name: 'Simple Syrup', category: 'Syrup', isStaple: false },
          { id: 'tonic-water', name: 'Tonic Water', category: 'Mixer', isStaple: false },
          { id: 'angostura-bitters', name: 'Angostura Bitters', category: 'Bitters', isStaple: false },
        ];

        const mockCocktails: MixCocktail[] = [
          {
            id: 'vodka-tonic',
            name: 'Vodka Tonic',
            slug: 'vodka-tonic',
            ingredients: [
              { id: 'vodka', name: 'Vodka', amount: '2 oz', isOptional: false },
              { id: 'tonic-water', name: 'Tonic Water', amount: '4 oz', isOptional: false },
              { id: 'lime-juice', name: 'Lime Juice', amount: '0.5 oz', isOptional: true },
            ],
            primarySpirit: 'Vodka',
            isPopular: true,
          },
          {
            id: 'gin-tonic',
            name: 'Gin & Tonic',
            slug: 'gin-tonic',
            ingredients: [
              { id: 'gin', name: 'Gin', amount: '2 oz', isOptional: false },
              { id: 'tonic-water', name: 'Tonic Water', amount: '4 oz', isOptional: false },
              { id: 'lime-juice', name: 'Lime Juice', amount: '0.5 oz', isOptional: true },
            ],
            primarySpirit: 'Gin',
            isPopular: true,
          },
        ];

        setAllIngredients(mockIngredients);
        setAllCocktails(mockCocktails);
        // Don't set dataError for mock data - allow the UI to work
      } finally {
        setDataLoading(false);
      }
    }

    loadData();
  }, []);





  // Show save prompt for anonymous users after threshold
  useEffect(() => {
    if (
      !isAuthenticated &&
      !promptDismissed &&
      ingredientIds.length >= PROMPT_THRESHOLD
    ) {
      setShowSavePrompt(true);
    }
  }, [isAuthenticated, promptDismissed, ingredientIds.length]);

  // Handle ingredient toggle
  const handleInventoryChange = useCallback(async (newIds: string[]) => {
    await setIngredients(newIds);
  }, [setIngredients]);

  const handleAddToInventory = useCallback(async (id: string) => {
    const ingredient = allIngredients.find(i => i.id === id);
    await addIngredient(id, ingredient?.name);
  }, [addIngredient, allIngredients]);

  const handleRemoveFromInventory = useCallback(async (id: string) => {
    await removeIngredient(id);
  }, [removeIngredient]);

  const handleClearAll = useCallback(async () => {
    setShowClearConfirm(true);
  }, []);

  const handleConfirmClear = useCallback(async () => {
    setShowClearConfirm(false);
    await clearAll();
    // Reset to step 1 (cabinet) after clearing
    setCurrentStep('cabinet');
  }, [clearAll]);

  const handleCancelClear = useCallback(() => {
    setShowClearConfirm(false);
  }, []);

  const handleDismissPrompt = () => {
    setShowSavePrompt(false);
    setPromptDismissed(true);
  };

  const handleSavePromptClick = () => {
    setShowSavePrompt(false);
    promptToSave();
  };

  // Get selected ingredient objects
  const selectedIngredients = useMemo(() => {
    if (!ingredientIds || !allIngredients) return [];
    return ingredientIds
      .map((id) => allIngredients.find((i) => i.id === id))
      .filter((i): i is MixIngredient => i !== undefined);
  }, [ingredientIds, allIngredients]);

  // Get selected ingredients for current category (for "Selected" section)
  const selectedInCategory = useMemo(() => {
    if (!selectedCategory) return [];
    return selectedIngredients.filter((i) => i.category === selectedCategory);
  }, [selectedIngredients, selectedCategory]);

  // Filter ingredients for display
  const filteredIngredients = useMemo(() => {
    if (!allIngredients || allIngredients.length === 0) return [];

    let filtered = allIngredients.filter((i) => !stapleIds.includes(i.id));

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((i) => (i.category || "Garnish") === selectedCategory);
    }

    return filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [allIngredients, selectedCategory, stapleIds]);

  // Get match counts for display - only run when all data is loaded and stable
  const matchCounts = useMemo(() => {
    // CRITICAL: Only run matching when ALL data is loaded and we have cocktails with ingredients
    if (dataLoading || !allCocktails || allCocktails.length === 0 || !allIngredients || allIngredients.length === 0 || !ingredientIds) {
      console.log('[MIX-DEBUG] Skipping matching - data not ready:', {
        dataLoading,
        cocktailsLoaded: allCocktails?.length || 0,
        ingredientsLoaded: allIngredients?.length || 0,
        hasIngredientIds: !!ingredientIds
      });
      return { canMake: 0, almostThere: 0 };
    }

    // Additional check: ensure at least one cocktail has ingredients
    const cocktailsWithIngredients = allCocktails.filter(c => c.ingredients && c.ingredients.length > 0);
    if (cocktailsWithIngredients.length === 0) {
      console.log('[MIX-DEBUG] Skipping matching - no cocktails have ingredients data');
      return { canMake: 0, almostThere: 0 };
    }

    // stapleIds is now calculated at component level

    // TEMPORARY DEBUG LOGGING - ALWAYS SHOW FOR TROUBLESHOOTING
    console.log('[MIX-DEBUG] 🟢 RUNNING MATCHING LOGIC');
    console.log('[MIX-DEBUG] ownedIngredientIds (first 10):', ingredientIds.slice(0, 10));
    console.log('[MIX-DEBUG] stapleIds (first 10):', stapleIds.slice(0, 10));
    console.log('[MIX-DEBUG] cocktailsLoaded:', allCocktails.length);
    console.log('[MIX-DEBUG] cocktailsWithIngredients:', cocktailsWithIngredients.length);

    if (process.env.NODE_ENV === 'development') {
      console.log('[MIX-DEBUG] ownedIngredientIds:', ingredientIds);
      console.log('[MIX-DEBUG] stapleIds:', stapleIds);
      console.log('[MIX-DEBUG] cocktailsWithIngredients count:', cocktailsWithIngredients.length);

      if (allCocktails && allCocktails.length > 0) {
        console.log('[MIX-DEBUG] first cocktail ingredients (first 3):', allCocktails[0]?.ingredients?.slice(0, 3) || []);
        // Find Margarita specifically
        const margarita = allCocktails.find(c => c.name.toLowerCase().includes('margarita'));
        if (margarita) {
          console.log('[MIX-DEBUG] Margarita found:', margarita.name, 'ID:', margarita.id);
          console.log('[MIX-DEBUG] Margarita ingredients:', margarita.ingredients);
          console.log('[MIX-DEBUG] Margarita ingredient IDs:', margarita.ingredients?.map(i => ({id: i.id, name: i.name, optional: i.isOptional})) || []);
        } else {
          console.log('[MIX-DEBUG] Margarita not found in cocktails');
          console.log('[MIX-DEBUG] Available cocktail names (sample):', allCocktails.slice(0, 10).map(c => c.name));
        }

        // Check if Margarita's ingredients are in owned list
        if (margarita) {
          const margaritaRequired = margarita.ingredients.filter(i => !i.isOptional);
          const margaritaRequiredIds = margaritaRequired.map(i => i.id);
          const ownedSet = new Set(ingredientIds);
          const missingFromMargarita = margaritaRequiredIds.filter(id => !ownedSet.has(id));
          console.log('[MIX-DEBUG] Margarita required IDs:', margaritaRequiredIds);
          console.log('[MIX-DEBUG] Currently owned IDs:', ingredientIds);
          console.log('[MIX-DEBUG] Missing from Margarita:', missingFromMargarita);
          console.log('[MIX-DEBUG] Margarita match status:', missingFromMargarita.length === 0 ? 'READY' : `MISSING ${missingFromMargarita.length}`);
        }

        // Debug ingredient ID mismatches
        console.log('[MIX-DEBUG] Cocktail ingredient IDs sample (first cocktail):', allCocktails[0]?.ingredients?.slice(0, 3).map(i => ({id: i.id, name: i.name})) || []);
        console.log('[MIX-DEBUG] All ingredients IDs sample:', allIngredients.slice(0, 10).map(i => ({id: i.id, name: i.name})) || []);
        console.log('[MIX-DEBUG] ID type check - cocktail ID:', typeof allCocktails[0]?.ingredients?.[0]?.id, 'ingredients ID:', typeof allIngredients[0]?.id);

        // Debug selected ingredients
        if (ingredientIds.length > 0) {
          console.log('[MIX-DEBUG] Selected ingredient IDs:', ingredientIds);
          const selectedIngredientDetails = ingredientIds.map(id => {
            const ing = allIngredients.find(i => i.id === id);
            return {id, name: ing?.name || 'NOT FOUND', found: !!ing};
          });
          console.log('[MIX-DEBUG] Selected ingredient details:', selectedIngredientDetails);

          // Check for Margarita ingredients specifically
          const tequila = allIngredients.find(i => i.name?.toLowerCase().includes('tequila'));
          const tripleSec = allIngredients.find(i => i.name?.toLowerCase().includes('triple sec') || i.name?.toLowerCase().includes('triple-sec'));
          const limeJuice = allIngredients.find(i => i.name?.toLowerCase().includes('lime juice'));

          console.log('[MIX-DEBUG] Margarita ingredient lookup:');
          console.log('[MIX-DEBUG] - Tequila found:', tequila ? {id: tequila.id, name: tequila.name} : 'NOT FOUND');
          console.log('[MIX-DEBUG] - Triple Sec found:', tripleSec ? {id: tripleSec.id, name: tripleSec.name} : 'NOT FOUND');
          console.log('[MIX-DEBUG] - Lime Juice found:', limeJuice ? {id: limeJuice.id, name: limeJuice.name} : 'NOT FOUND');

          const hasTequila = tequila && ingredientIds.includes(tequila.id);
          const hasTripleSec = tripleSec && ingredientIds.includes(tripleSec.id);
          const hasLimeJuice = limeJuice && ingredientIds.includes(limeJuice.id);

          console.log('[MIX-DEBUG] Margarita ingredients owned:');
          console.log('[MIX-DEBUG] - Has Tequila:', hasTequila);
          console.log('[MIX-DEBUG] - Has Triple Sec:', hasTripleSec);
          console.log('[MIX-DEBUG] - Has Lime Juice:', hasLimeJuice);
          console.log('[MIX-DEBUG] - Margarita should be READY:', hasTequila && hasTripleSec && hasLimeJuice);

          // Show what ingredients user actually has selected
          console.log('[MIX-DEBUG] User selected ingredients:');
          ingredientIds.forEach(id => {
            const ing = allIngredients.find(i => i.id === id);
            console.log(`[MIX-DEBUG] - ${id}: ${ing ? ing.name : 'NOT FOUND'}`);
          });
        }
      }
    }

    const result = getMixMatchGroups({
      cocktails: cocktailsWithIngredients,
      ownedIngredientIds: ingredientIds,
      stapleIngredientIds: stapleIds,
    });

    const matchCounts = {
      canMake: result.ready.length,
      almostThere: result.almostThere.length,
    };

    console.log('[MIX WIZARD DEBUG] Final match counts:', {
      canMake: matchCounts.canMake,
      almostThere: matchCounts.almostThere,
      totalCocktails: allCocktails.length,
      ingredientIdsCount: ingredientIds.length,
      stapleIds: stapleIds
    });

    return matchCounts;
  }, [allCocktails, allIngredients, ingredientIds, dataLoading]);

  if (dataLoading || barLoading) {
    return <MixSkeleton />;
  }

  if (dataError) {
    return (
      <div className="mix-page flex items-center justify-center min-h-[60vh] bg-cream">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-display font-bold text-forest mb-3">
            Unable to Load Data
          </h2>
          <p className="text-sage text-lg">{dataError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-terracotta text-cream rounded-2xl font-bold hover:bg-terracotta-dark transition-all shadow-lg shadow-terracotta/20"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 'cabinet':
        return (
          <MixCabinet
            allIngredients={allIngredients}
            ingredientIds={ingredientIds}
            selectedCategory={selectedCategory}
            stapleIds={stapleIds}
            onSelectCategory={setSelectedCategory}
            onAddIngredient={handleAddToInventory}
            onRemoveIngredient={handleRemoveFromInventory}
            matchCounts={matchCounts}
            onStepChange={setCurrentStep}
          />
        );
      case 'mixer':
        return (
          <MixMixer
            ingredientIds={ingredientIds}
            selectedIngredients={selectedIngredients}
            matchCounts={matchCounts}
            isProcessing={isProcessing}
            onComplete={() => setCurrentStep('menu')}
          />
        );
      case 'menu':
        return (
          <MixMenu
            inventoryIds={ingredientIds}
            allCocktails={allCocktails}
            allIngredients={allIngredients}
            onAddToInventory={handleAddToInventory}
            matchCounts={matchCounts}
            selectedIngredients={selectedIngredients}
            onRemoveIngredient={handleRemoveFromInventory}
            onClearAll={handleClearAll}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="py-10 bg-cream min-h-screen">
      {/* Page Header - Matching website aesthetic */}
      <MainContainer className="mb-10">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-forest">
              MixWise Bar Builder
            </h1>
            {ingredientIds.length === 0 && (
              <div className="hidden sm:flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  currentStep === 'cabinet'
                    ? 'bg-terracotta text-white'
                    : 'bg-mist text-sage'
                }`}>
                  Step 1
                </div>
                <div className="text-sage">→</div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  currentStep === 'mixer'
                    ? 'bg-olive text-white'
                    : 'bg-mist text-sage'
                }`}>
                  Step 2
                </div>
                <div className="text-sage">→</div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  currentStep === 'menu'
                    ? 'bg-forest text-white'
                    : 'bg-mist text-sage'
                }`}>
                  Step 3
                </div>
              </div>
            )}
          </div>
          <p className="text-sage max-w-2xl text-lg leading-relaxed">
            {currentStep === 'cabinet' && "Start by adding ingredients from your cabinet. The more you add, the more cocktails you'll unlock!"}
            {currentStep === 'mixer' && "Finding the perfect cocktails for your ingredients..."}
            {currentStep === 'menu' && "Explore your personalized cocktail menu with recipes you can make right now!"}
          </p>
        </div>

        {/* Progress Actions */}
        {ingredientIds.length > 0 && currentStep !== 'menu' && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start mb-6">
            {/* Ready to Mix Button */}
            <button
              onClick={() => {
                setCurrentStep('mixer');
                setIsProcessing(true);
                setTimeout(() => {
                  setIsProcessing(false);
                  setCurrentStep('menu');
                }, 2000);
              }}
              className="px-8 py-4 bg-terracotta text-cream rounded-2xl font-bold text-lg shadow-lg hover:bg-terracotta-dark transition-all hover:scale-105 flex items-center gap-2"
            >
              🎉 Ready to Mix! See Your Cocktails →
            </button>

            {/* Cocktail Counter */}
            {matchCounts.canMake > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-olive/10 border border-olive/30 rounded-xl">
                <span className="text-2xl">🍸</span>
                <span className="font-bold text-olive">{matchCounts.canMake}</span>
                <span className="text-sage">cocktails ready</span>
              </div>
            )}
          </div>
        )}
      </MainContainer>

      {/* Main Content */}
      <main className="flex-1">
        {renderStepContent()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-mist z-50 safe-area-inset-bottom">
        <div className="grid grid-cols-3 py-safe">
          <button
            onClick={() => setCurrentStep('cabinet')}
            className={`flex flex-col items-center py-3 px-2 transition-colors relative ${
              currentStep === 'cabinet'
                ? 'text-terracotta bg-terracotta/10'
                : 'text-sage hover:text-forest'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
              currentStep === 'cabinet'
                ? 'bg-terracotta text-white'
                : 'bg-mist text-sage'
            }`}>
              {ingredientIds.length === 0 ? '1' : <HomeIcon className="w-3 h-3" />}
            </div>
            <span className="text-xs font-medium">Cabinet</span>
            <span className="text-xs text-sage/70">Add ingredients</span>
          </button>
          <button
            onClick={() => {
              if (ingredientIds.length > 0) {
                setCurrentStep('mixer');
                setIsProcessing(true);
                setTimeout(() => {
                  setIsProcessing(false);
                  setCurrentStep('menu');
                }, 2000);
              }
            }}
            className={`flex flex-col items-center py-3 px-2 transition-colors relative ${
              currentStep === 'mixer'
                ? 'text-olive bg-olive/10'
                : 'text-sage hover:text-forest'
            } ${ingredientIds.length === 0 ? 'opacity-50' : ''}`}
            disabled={ingredientIds.length === 0}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
              currentStep === 'mixer'
                ? 'bg-olive text-white'
                : ingredientIds.length === 0 ? 'bg-mist/50 text-sage/50' : 'bg-mist text-sage'
            }`}>
              {ingredientIds.length === 0 ? '2' : <WrenchScrewdriverIcon className="w-3 h-3" />}
            </div>
            <span className="text-xs font-medium">Mix</span>
            <span className="text-xs text-sage/70">Find cocktails</span>
          </button>
          <button
            onClick={() => setCurrentStep('menu')}
            className={`flex flex-col items-center py-3 px-2 transition-colors relative ${
              currentStep === 'menu'
                ? 'text-forest bg-forest/10'
                : 'text-sage hover:text-forest'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
              currentStep === 'menu'
                ? 'bg-forest text-white'
                : 'bg-mist text-sage'
            }`}>
              {ingredientIds.length === 0 ? '3' : <BookOpenIcon className="w-3 h-3" />}
            </div>
            <span className="text-xs font-medium">Menu</span>
            <span className="text-xs text-sage/70">See recipes</span>
          </button>
        </div>
      </nav>

      {/* Save Bar Prompt for Anonymous Users */}
      {showSavePrompt && !isAuthenticated && (
        <div className="fixed bottom-20 left-4 right-4 lg:bottom-4 lg:left-auto lg:right-4 lg:max-w-sm bg-white/95 backdrop-blur-md border-2 border-olive/40 rounded-2xl p-4 shadow-xl z-40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-olive/20 rounded-xl flex items-center justify-center border border-olive/30">
              <BookmarkIcon className="w-5 h-5 text-olive" />
            </div>
            <div className="flex-1">
              <p className="text-forest font-bold">Want to save your bar?</p>
              <p className="text-sm text-sage">Create a free account so you never lose your ingredient list.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleDismissPrompt}
              className="flex-1 px-3 py-2 text-sm text-sage hover:text-forest transition-colors border border-mist rounded-xl"
            >
              Not now
            </button>
            <button
              onClick={handleSavePromptClick}
              className="flex-1 px-4 py-2 bg-terracotta text-cream font-bold text-sm rounded-xl hover:bg-terracotta-dark transition-all shadow-lg shadow-terracotta/20"
            >
              Save my bar
            </button>
          </div>
        </div>
      )}


      {/* Clear Bar Confirmation Dialog */}
      <ClearBarConfirmDialog
        isOpen={showClearConfirm}
        onConfirm={handleConfirmClear}
        onCancel={handleCancelClear}
      />

      {/* Add padding for mobile navigation */}
      <div className="lg:hidden h-16" />
    </div>
  );
}
