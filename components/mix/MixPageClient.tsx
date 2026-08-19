"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MixSkeleton } from "@/components/mix/MixSkeleton";
import { ClearBarConfirmDialog } from "@/components/mix/ClearBarConfirmDialog";
import { MixCabinet } from "@/components/mix/MixCabinet";
import { MixMixer } from "@/components/mix/MixMixer";
import { MixMenu } from "@/components/mix/MixMenu";
import { getMixCocktailsClient, getMixIngredients } from "@/lib/cocktails";
import { NativeMixView } from "@/components/mobile/NativeMixView";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import { getMixMatchGroups } from "@/lib/mixMatching";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { getPreferredAuthMode, preferredAuthCopy } from "@/lib/auth/returning-user";
import { navigateInApp } from "@/lib/mobile/navigate";
import { useCocktailSkips } from "@/hooks/useCocktailSkips";
import { SaveBarPrompt } from "@/components/auth/SaveBarPrompt";
import type { MixIngredient, MixCocktail, MixMatchGroups } from "@/lib/mixTypes";
import { HomeIcon, WrenchScrewdriverIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { MainContainer } from "@/components/layout/MainContainer";
import { debugLog } from "@/lib/debugLog";
import { slugifyIngredientName } from "@/lib/ingredientSlug";

// Show sign-up prompt after adding this many ingredients
const PROMPT_THRESHOLD = 3;

/**
 * Inner component that uses useSearchParams().
 * Must be a separate component to avoid "useSearchParams without Suspense" error.
 */
function MixPageContent() {
  const [allIngredients, setAllIngredients] = useState<MixIngredient[]>([]);
  const [allCocktails, setAllCocktails] = useState<MixCocktail[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [cocktailsLoading, setCocktailsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);

  // State for redesigned UI
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Three-step funnel state
  const [currentStep, setCurrentStep] = useState<'cabinet' | 'mixer' | 'menu'>('cabinet');
  const [isProcessing, setIsProcessing] = useState(false);

  // Safe native platform detection (prevents SSR errors and hydration mismatches)
  const nativeShell = useNativeShell();
  const [isNative, setIsNative] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsNative(nativeShell);
  }, [nativeShell]);

  const { isAuthenticated, isLoading: authLoading } = useUser();
  const { openAuthDialog, closeAuthDialog, isOpen: authDialogOpen } = useAuthDialog();
  const router = useRouter();
  const skippedMixAuth = useRef(false);
  const openedMixGate = useRef(false);
  const { skipIds } = useCocktailSkips();
  const {
    ingredientIds,
    isLoading: barLoading,
    addIngredient,
    removeIngredient,
    setIngredients,
    clearAll,
  } = useBarIngredients();

  const searchParams = useSearchParams();
  const haveAppliedRef = useRef<string | null>(null);

  // Allow deep-linking to the Menu step when the user already has ingredients
  useEffect(() => {
    const stepParam = searchParams?.get("step");
    if (stepParam === "menu" && ingredientIds.length > 0) {
      setCurrentStep("menu");
    }
  }, [searchParams, ingredientIds.length]);

  // Prefill the bar from /mix?have=campari,gin (ingredient product pages, QR landers)
  useEffect(() => {
    if (dataLoading || barLoading || allIngredients.length === 0) return;
    const raw = searchParams?.get("have");
    if (!raw) return;
    const key = raw.toLowerCase().trim();
    if (!key || haveAppliedRef.current === key) return;
    haveAppliedRef.current = key;

    const slugs = key.split(",").map((part) => slugifyIngredientName(part)).filter(Boolean);
    if (slugs.length === 0) return;

    const matchedIds = allIngredients
      .filter((ing) => slugs.includes(slugifyIngredientName(ing.name)))
      .map((ing) => ing.id);
    if (matchedIds.length === 0) return;

    const merged = [...new Set([...ingredientIds, ...matchedIds])];
    if (merged.length === ingredientIds.length) return;
    void setIngredients(merged);
  }, [allIngredients, barLoading, dataLoading, ingredientIds, searchParams, setIngredients]);

  // Calculate staple IDs for filtering out basic ingredients
  const stapleIds = useMemo(() => {
    const dbStaples = allIngredients.filter((i) => i?.isStaple).map((i) => i?.id).filter(Boolean);
    const manualStaples = ['ice', 'water']; // Only truly universal basics
    return [...new Set([...dbStaples, ...manualStaples])];
  }, [allIngredients]);

  // Ingredients first so the cabinet can render; cocktails fill in behind it.
  useEffect(() => {
    let cancelled = false;

    function validCocktails(cocktails: MixCocktail[]) {
      return cocktails.filter(
        (cocktail) =>
          cocktail &&
          Array.isArray(cocktail.ingredients) &&
          cocktail.ingredients.length > 0
      );
    }

    async function loadData() {
      try {
        const ingredients = await getMixIngredients();
        if (cancelled) return;
        setAllIngredients(ingredients || []);
        setDataLoading(false);
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to load ingredients:", error);
        setAllIngredients([
          { id: "vodka", name: "Vodka", category: "Spirit", isStaple: false },
          { id: "gin", name: "Gin", category: "Spirit", isStaple: false },
          { id: "rum", name: "Rum", category: "Spirit", isStaple: false },
          { id: "tequila", name: "Tequila", category: "Spirit", isStaple: false },
          { id: "lime-juice", name: "Lime Juice", category: "Citrus", isStaple: false },
          { id: "simple-syrup", name: "Simple Syrup", category: "Syrup", isStaple: false },
          { id: "tonic-water", name: "Tonic Water", category: "Mixer", isStaple: false },
          { id: "angostura-bitters", name: "Angostura Bitters", category: "Bitters", isStaple: false },
        ]);
        setDataLoading(false);
      }

      try {
        const cocktails = await getMixCocktailsClient();
        if (cancelled) return;
        setAllCocktails(validCocktails(cocktails || []));
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to load cocktails:", error);
        debugLog("Cabinet is available; cocktail matching will retry on refresh.");
      } finally {
        if (!cancelled) {
          setCocktailsLoading(false);
        }
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);





  // Native Mix: blur the cabinet behind a signup-first dialog. No X / backdrop dismiss.
  useEffect(() => {
    if (!nativeShell || authLoading || isAuthenticated) return;
    if (skippedMixAuth.current || authDialogOpen) return;

    const mode = getPreferredAuthMode();
    const copy = preferredAuthCopy(mode);
    openAuthDialog({
      mode,
      dismissible: false,
      title: mode === "login" ? "Sign in to mix" : copy.title,
      subtitle:
        mode === "login"
          ? "Your cabinet is right behind this. Sign in to save bottles and see what you can pour."
          : "Your cabinet is right behind this. Create a free account to stock bottles, unlock drinks, and keep them on this phone.",
      escapeLabel: "Browse recipes instead",
      onEscape: () => {
        skippedMixAuth.current = true;
        openedMixGate.current = false;
        navigateInApp(router, "/cocktails");
      },
    });
    openedMixGate.current = true;
  }, [
    nativeShell,
    authLoading,
    isAuthenticated,
    authDialogOpen,
    openAuthDialog,
    router,
  ]);

  useEffect(() => {
    if (isAuthenticated) {
      skippedMixAuth.current = false;
      openedMixGate.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!nativeShell) return;
    return () => {
      if (openedMixGate.current) {
        openedMixGate.current = false;
        closeAuthDialog(true);
      }
    };
  }, [nativeShell, closeAuthDialog]);

  // Show save prompt for anonymous users after threshold (web Mix only — native uses the gate above)
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
  const mixMatches: MixMatchGroups = useMemo(() => {
    const empty: MixMatchGroups = { ready: [], almostThere: [], far: [], makeNow: [] };
    if (!allCocktails?.length || !allIngredients?.length || !ingredientIds) {
      return empty;
    }

    const cocktailsWithIngredients = allCocktails.filter(
      (c) => c.ingredients && c.ingredients.length > 0
    );
    if (cocktailsWithIngredients.length === 0) {
      return empty;
    }

    return getMixMatchGroups({
      cocktails: cocktailsWithIngredients,
      ownedIngredientIds: ingredientIds,
      stapleIngredientIds: stapleIds,
      excludeCocktailIds: skipIds,
    });
  }, [allCocktails, allIngredients, ingredientIds, stapleIds, skipIds]);

  const matchCounts = useMemo(
    () => ({
      canMake: mixMatches.ready.length,
      almostThere: mixMatches.almostThere.length,
    }),
    [mixMatches]
  );

  const goToMenu = useCallback(() => {
    if (isNative || nativeShell) {
      setCurrentStep("menu");
      return;
    }
    setCurrentStep("mixer");
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep("menu");
    }, 2000);
  }, [isNative, nativeShell]);

  if (dataLoading && allIngredients.length === 0) {
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

  if (nativeShell) {
    const shelfParam = searchParams?.get("shelf") === "1";
    const menuParam = searchParams?.get("step") === "menu";

    return (
      <div className={`px-4 pb-4 pt-4 ${authDialogOpen && !isAuthenticated ? "pointer-events-none select-none" : ""}`}>
        <NativeMixView
          allIngredients={allIngredients}
          ingredientIds={ingredientIds}
          selectedIngredients={selectedIngredients}
          stapleIds={stapleIds}
          matchCounts={matchCounts}
          mixMatches={mixMatches}
          cocktailsLoading={cocktailsLoading}
          barLoading={barLoading}
          initialPane={shelfParam ? "shelf" : menuParam ? "tonight" : undefined}
          onAddIngredient={handleAddToInventory}
          onRemoveIngredient={handleRemoveFromInventory}
          onClearAll={handleClearAll}
        />
        <ClearBarConfirmDialog
          isOpen={showClearConfirm}
          onConfirm={handleConfirmClear}
          onCancel={handleCancelClear}
        />
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
            compact={isNative}
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
            matchGroups={mixMatches}
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
    <div className="pb-24 overflow-x-hidden">
      <MainContainer className="mb-10">
        <div className="mb-6">
          {isNative ? (
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold text-forest">
                {currentStep === "menu" ? "Your menu" : "Your cabinet"}
              </h1>
              <p className="mt-1 text-[15px] leading-relaxed text-sage">
                {currentStep === "menu"
                  ? cocktailsLoading
                    ? "Matching drinks to your bottles…"
                    : "Drinks you can pour with what's in your cabinet."
                  : "Tap every bottle you have. Then see what you can pour."}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep("cabinet")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    currentStep === "cabinet"
                      ? "bg-terracotta text-cream"
                      : "bg-white text-sage"
                  }`}
                >
                  Cabinet
                </button>
                <button
                  type="button"
                  onClick={goToMenu}
                  disabled={ingredientIds.length === 0}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    currentStep === "menu"
                      ? "bg-terracotta text-cream"
                      : "bg-white text-sage"
                  } ${ingredientIds.length === 0 ? "opacity-40" : ""}`}
                >
                  Menu
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 min-w-0">
                {ingredientIds.length === 0 && (
                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
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
            </>
          )}
        </div>

        {/* Progress Actions */}
        {ingredientIds.length > 0 && currentStep !== 'menu' && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start mb-6 min-w-0">
            <button
              onClick={goToMenu}
              className="w-full sm:w-auto max-w-full px-6 sm:px-8 py-4 bg-terracotta text-cream rounded-2xl font-bold text-base sm:text-lg shadow-lg hover:bg-terracotta-dark transition-all sm:hover:scale-[1.02] flex items-center justify-center gap-2 text-center"
            >
              <span className="min-w-0">
                {cocktailsLoading && matchCounts.canMake === 0
                  ? "Matching drinks…"
                  : isNative
                    ? "See what I can make →"
                    : "🎉 Ready to Mix! See Your Cocktails →"}
              </span>
            </button>

            {/* Cocktail Counter */}
            {matchCounts.canMake > 0 && (
              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-olive/10 border border-olive/30 rounded-xl flex-shrink-0">
                <span className="text-2xl">🍸</span>
                <span className="font-bold text-olive">{matchCounts.canMake}</span>
                <span className="text-sage">cocktails ready</span>
              </div>
            )}
          </div>
        )}
      </MainContainer>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {renderStepContent()}
      </main>

      {/* Step Navigation - Only show on web, not on native (native uses app tab bar) */}
      {isMounted && !isNative && (
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
                  goToMenu();
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
      )}

      {/* Save Bar Prompt for Anonymous Users */}
      {showSavePrompt && !isAuthenticated && (
        <SaveBarPrompt onDismiss={handleDismissPrompt} />
      )}


      {/* Clear Bar Confirmation Dialog */}
      <ClearBarConfirmDialog
        isOpen={showClearConfirm}
        onConfirm={handleConfirmClear}
        onCancel={handleCancelClear}
      />

      {/* Add padding for mobile navigation - Only on web */}
      {isMounted && !isNative && (
        <div className="lg:hidden h-16" />
      )}
    </div>
  );
}

export function MixPageClient() {
  return <MixPageContent />;
}
