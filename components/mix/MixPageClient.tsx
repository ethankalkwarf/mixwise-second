"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { MixSkeleton } from "@/components/mix/MixSkeleton";
import { ClearBarConfirmDialog } from "@/components/mix/ClearBarConfirmDialog";
import { MixCabinet } from "@/components/mix/MixCabinet";
import { MixMenu } from "@/components/mix/MixMenu";
import { getMixCocktailsClient, getMixIngredients } from "@/lib/cocktails";
import { NativeMixView } from "@/components/mobile/NativeMixView";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import { getMixMatchGroups } from "@/lib/mixMatching";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useUser } from "@/components/auth/UserProvider";
import { useCocktailSkips } from "@/hooks/useCocktailSkips";
import { SaveBarPrompt } from "@/components/auth/SaveBarPrompt";
import type { MixIngredient, MixCocktail, MixMatchGroups } from "@/lib/mixTypes";
import { MainContainer } from "@/components/layout/MainContainer";
import { WebPageHero } from "@/components/layout/WebPageHero";
import { debugLog } from "@/lib/debugLog";
import { slugifyIngredientName } from "@/lib/ingredientSlug";
import { trackMixToolUsed } from "@/lib/analytics";

// Show sign-up prompt after adding this many ingredients
const PROMPT_THRESHOLD = 3;

type MixPane = "cabinet" | "menu";

/**
 * Inner component that uses useSearchParams().
 * Must be a separate component to avoid "useSearchParams without Suspense" error.
 */
function MixPageContent({ forceNative = false }: { forceNative?: boolean }) {
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

  // Dual-pane Mix: Cabinet (edit shelf) vs Menu (drinks you can pour)
  const [currentStep, setCurrentStep] = useState<MixPane>("cabinet");
  const [paneReady, setPaneReady] = useState(false);

  // Safe native platform detection (prevents SSR errors and hydration mismatches)
  const nativeShell = useNativeShell();
  const isNativeShell = forceNative || nativeShell;
  const [isNative, setIsNative] = useState(forceNative);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsNative(isNativeShell);
  }, [isNativeShell]);

  const { isAuthenticated, isLoading: authLoading, user } = useUser();
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
  const mixTrackedForStep = useRef(false);

  // Pick initial pane once the bar loads: drinks-first when stocked, cabinet when empty.
  // Respect ?step=menu|cabinet and ?shelf=1 deep links.
  useEffect(() => {
    if (barLoading || paneReady) return;

    const stepParam = searchParams?.get("step");
    const shelfParam = searchParams?.get("shelf") === "1";
    const hasBar = ingredientIds.length > 0;

    if (shelfParam || stepParam === "cabinet") {
      setCurrentStep("cabinet");
    } else if ((stepParam === "menu" || !stepParam) && hasBar) {
      setCurrentStep("menu");
    } else {
      setCurrentStep("cabinet");
    }
    setPaneReady(true);
  }, [barLoading, ingredientIds.length, paneReady, searchParams]);

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


  // Show save prompt for anonymous users after they stock a few bottles
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
    setCurrentStep("cabinet");
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

  // Fire once when the user lands on Mix results (menu step)
  useEffect(() => {
    if (currentStep !== "menu") {
      mixTrackedForStep.current = false;
      return;
    }
    if (mixTrackedForStep.current || dataLoading || cocktailsLoading) return;
    mixTrackedForStep.current = true;
    void trackMixToolUsed(user?.id ?? null, ingredientIds.length, matchCounts.canMake, {
      almost_there: matchCounts.almostThere,
      step: "menu",
    });
  }, [
    currentStep,
    dataLoading,
    cocktailsLoading,
    user?.id,
    ingredientIds.length,
    matchCounts.canMake,
    matchCounts.almostThere,
  ]);

  const goToMenu = useCallback(() => {
    if (ingredientIds.length === 0) return;
    setCurrentStep("menu");
  }, [ingredientIds.length]);

  const goToCabinet = useCallback(() => {
    setCurrentStep("cabinet");
  }, []);

  if (dataLoading && allIngredients.length === 0) {
    return <MixSkeleton />;
  }

  // Web only: wait for bar load so we land on pour vs cabinet without a flash
  if (!isNativeShell && !paneReady) {
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

  if (isNativeShell) {
    const shelfParam = searchParams?.get("shelf") === "1";
    const menuParam = searchParams?.get("step") === "menu";

    return (
      <div className="native-frame pb-4 pt-4">
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
        {showSavePrompt && !isAuthenticated && (
          <SaveBarPrompt onDismiss={handleDismissPrompt} />
        )}
      </div>
    );
  }

  // Render content based on current pane
  const renderStepContent = () => {
    switch (currentStep) {
      case "cabinet":
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
      case "menu":
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
            onEditCabinet={goToCabinet}
          />
        );
      default:
        return null;
    }
  };

  const hasBar = ingredientIds.length > 0;
  const pourMeta =
    !hasBar
      ? "Start by adding a few bottles below."
      : cocktailsLoading && matchCounts.canMake === 0
        ? "Matching drinks to your ingredients…"
        : `${matchCounts.canMake} drink${matchCounts.canMake === 1 ? "" : "s"} ready · ${ingredientIds.length} ingredient${ingredientIds.length === 1 ? "" : "s"} in your cabinet`;

  // Guests get the SEO MixExplainer h1 above; signed-in users get this product hero.
  // While auth is loading, prefer the product hero to avoid a flash of marketing copy.
  const showProductHero = authLoading || isAuthenticated;

  const paneDescription =
    currentStep === "menu"
      ? cocktailsLoading
        ? "Matching drinks to your bottles…"
        : "Drinks you can pour with what's in your cabinet."
      : hasBar
        ? "Edit what's on your shelf. Drink matches update as you go."
        : "Add what's in your bar — then see what you can pour tonight.";

  const paneToggle = (
    <div className="grid max-w-md grid-cols-2 rounded-2xl bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={goToMenu}
        disabled={!hasBar}
        className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-sm font-semibold transition-colors ${
          currentStep === "menu" ? "bg-terracotta text-cream" : "text-forest"
        } ${!hasBar ? "opacity-40" : ""}`}
      >
        <span>You can pour</span>
        {matchCounts.canMake > 0 && currentStep !== "menu" ? (
          <span className="rounded-full bg-terracotta/15 px-1.5 py-0.5 text-[10px] font-bold text-terracotta">
            {matchCounts.canMake}
          </span>
        ) : null}
      </button>
      <button
        type="button"
        onClick={goToCabinet}
        className={`inline-flex items-center justify-center rounded-xl px-2 py-2.5 text-sm font-semibold transition-colors ${
          currentStep === "cabinet" ? "bg-terracotta text-cream" : "text-forest"
        }`}
      >
        Cabinet
      </button>
    </div>
  );

  return (
    <div className="overflow-x-hidden pb-24">
      <MainContainer>
        {showProductHero ? (
          <WebPageHero
            title="Mix"
            description={paneDescription}
            meta={hasBar ? pourMeta : undefined}
          >
            {paneToggle}
          </WebPageHero>
        ) : (
          <div className="mb-8 min-w-0">
            {hasBar ? (
              <p className="mb-3 text-sm font-semibold leading-snug text-forest">{pourMeta}</p>
            ) : null}
            {paneToggle}
          </div>
        )}

        {/* Sticky payoff while editing the cabinet */}
        {hasBar && currentStep === "cabinet" && (
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={goToMenu}
              className="inline-flex w-full max-w-full items-center justify-center gap-2 rounded-2xl bg-terracotta px-6 py-3.5 text-base font-bold text-cream shadow-lg transition-all hover:bg-terracotta-dark sm:w-auto sm:hover:scale-[1.02]"
            >
              {cocktailsLoading && matchCounts.canMake === 0
                ? "Matching drinks…"
                : matchCounts.canMake > 0
                  ? `See ${matchCounts.canMake} drink${matchCounts.canMake === 1 ? "" : "s"} you can pour →`
                  : "See what I can pour →"}
            </button>
            {matchCounts.canMake > 0 ? (
              <p className="text-sm text-sage sm:pl-1">
                Matches update live as you add or remove bottles.
              </p>
            ) : null}
          </div>
        )}
      </MainContainer>

      {/* Main Content */}
      <main className="min-w-0 flex-1 overflow-x-hidden">
        {renderStepContent()}
      </main>

      {/* Mobile pane switcher — web only (native uses NativeMixView) */}
      {isMounted && !isNative && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-mist bg-white safe-area-inset-bottom lg:hidden">
          <div className="grid grid-cols-2 py-safe">
            <button
              type="button"
              onClick={goToMenu}
              disabled={!hasBar}
              className={`flex flex-col items-center px-2 py-3 transition-colors ${
                currentStep === "menu"
                  ? "bg-terracotta/10 text-terracotta"
                  : "text-sage hover:text-forest"
              } ${!hasBar ? "opacity-50" : ""}`}
            >
              <span className="text-xs font-semibold">You can pour</span>
              <span className="text-[11px] text-sage/80">
                {hasBar
                  ? matchCounts.canMake > 0
                    ? `${matchCounts.canMake} ready`
                    : "Your drinks"
                  : "Add bottles first"}
              </span>
            </button>
            <button
              type="button"
              onClick={goToCabinet}
              className={`flex flex-col items-center px-2 py-3 transition-colors ${
                currentStep === "cabinet"
                  ? "bg-terracotta/10 text-terracotta"
                  : "text-sage hover:text-forest"
              }`}
            >
              <span className="text-xs font-semibold">Cabinet</span>
              <span className="text-[11px] text-sage/80">
                {hasBar ? `${ingredientIds.length} on shelf` : "Add ingredients"}
              </span>
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
      {isMounted && !isNative && <div className="h-16 lg:hidden" />}
    </div>
  );
}

export function MixPageClient({ forceNative = false }: { forceNative?: boolean }) {
  return <MixPageContent forceNative={forceNative} />;
}
