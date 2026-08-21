"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AppLink } from "@/components/mobile/AppLink";
import { NativeDrinkTile } from "@/components/mobile/NativeDrinkTile";
import { NativePageHero } from "@/components/mobile/NativePageHero";
import { useFavorites } from "@/hooks/useFavorites";
import { useInfiniteVisibleCount } from "@/hooks/useInfiniteVisibleCount";
import { formatIngredientCategory } from "@/lib/formatters";
import { lookupIngredient } from "@/lib/ingredientMatching";
import { searchMixIngredients } from "@/lib/search";
import type { MixCocktail, MixIngredient, MixMatchGroups } from "@/lib/mixTypes";
import {
  trackEmptyStateSeen,
  trackMixResultClicked,
  trackMixToolUsed,
} from "@/lib/analytics";
import { useUser } from "@/components/auth/UserProvider";
import { readCabinetReadyCount, readHomeSessionHint } from "@/lib/mobile/guestData";
import { randomShuffle } from "@/lib/randomization";

type Pane = "tonight" | "shelf";

const POPULAR = [
  "Vodka",
  "Gin",
  "Rum",
  "Tequila",
  "Whiskey",
  "Lime Juice",
  "Lemon Juice",
  "Simple Syrup",
  "Tonic Water",
  "Club Soda",
];

const CATEGORIES = [
  { key: "Spirit", label: "Spirits" },
  { key: "Liqueur", label: "Liqueurs" },
  { key: "Amaro", label: "Amaro" },
  { key: "Wine & Beer", label: "Wine & Beer" },
  { key: "Mixer", label: "Mixers" },
  { key: "Citrus", label: "Citrus" },
  { key: "Bitters", label: "Bitters" },
  { key: "Syrup", label: "Syrups" },
];

type Props = {
  allIngredients: MixIngredient[];
  ingredientIds: string[];
  selectedIngredients: MixIngredient[];
  stapleIds: string[];
  matchCounts: { canMake: number; almostThere: number };
  mixMatches: MixMatchGroups;
  cocktailsLoading: boolean;
  barLoading: boolean;
  initialPane?: Pane;
  onAddIngredient: (id: string) => void;
  onRemoveIngredient: (id: string) => void;
  onClearAll: () => void;
};

function guessInitialPane(initialPane?: Pane): Pane {
  if (initialPane) return initialPane;
  if (typeof window === "undefined") return "shelf";
  const hint = readHomeSessionHint();
  const readyCount = readCabinetReadyCount();
  if ((hint?.barCount ?? 0) > 0 || readyCount > 0) return "tonight";
  return "shelf";
}

export function NativeMixView({
  allIngredients,
  ingredientIds,
  selectedIngredients,
  stapleIds,
  matchCounts,
  mixMatches,
  cocktailsLoading,
  barLoading,
  initialPane,
  onAddIngredient,
  onRemoveIngredient,
  onClearAll,
}: Props) {
  const [pane, setPane] = useState<Pane>(() => guessInitialPane(initialPane));
  const [ready, setReady] = useState(() => Boolean(initialPane));
  const [query, setQuery] = useState("");
  const { user } = useUser();
  const mixTracked = useRef(false);
  const [category, setCategory] = useState<string | null>(null);
  const { favorites } = useFavorites();
  const [readyEpoch, setReadyEpoch] = useState(0);

  useEffect(() => {
    if (pane === "tonight") {
      setReadyEpoch((n) => n + 1);
    }
  }, [pane]);

  useEffect(() => {
    if (ready || barLoading) return;
    if (initialPane) {
      setPane(initialPane);
    } else {
      setPane(ingredientIds.length > 0 ? "tonight" : "shelf");
    }
    setReady(true);
  }, [barLoading, ingredientIds.length, initialPane, ready]);

  useEffect(() => {
    if (!ready || pane !== "tonight" || cocktailsLoading || mixTracked.current) return;
    if (ingredientIds.length === 0) return;
    mixTracked.current = true;
    void trackMixToolUsed(user?.id ?? null, ingredientIds.length, matchCounts.canMake, {
      almost_there: matchCounts.almostThere,
      step: "tonight",
    });
  }, [
    ready,
    pane,
    cocktailsLoading,
    ingredientIds.length,
    matchCounts.canMake,
    matchCounts.almostThere,
    user?.id,
  ]);

  const catalog = useMemo(
    () => allIngredients.filter((item) => !stapleIds.includes(item.id)),
    [allIngredients, stapleIds]
  );

  const filtered = useMemo(() => {
    let next = catalog;
    if (category) {
      next = next.filter((item) => (item.category || "Garnish") === category);
    }
    if (query.trim()) {
      return searchMixIngredients(next, query);
    }
    return [...next].sort((a, b) => a.name.localeCompare(b.name));
  }, [catalog, category, query]);

  const { visibleItems, hasMore, loadMoreRef } = useInfiniteVisibleCount(filtered, 40);
  const readyDrinks = useMemo(() => {
    void readyEpoch;
    return randomShuffle(mixMatches.ready.map((match) => match.cocktail));
  }, [mixMatches.ready, readyEpoch]);
  const drinkPager = useInfiniteVisibleCount(readyDrinks, 24);

  const popular = useMemo(() => {
    const next: MixIngredient[] = [];
    for (const name of POPULAR) {
      const item = lookupIngredient(name, allIngredients);
      if (item && !ingredientIds.includes(item.id)) next.push(item);
    }
    return next;
  }, [allIngredients, ingredientIds]);

  const almost = mixMatches.almostThere
    .filter((match) => match.missingIngredientIds.length === 1)
    .slice(0, 5);

  const toggle = (id: string) => {
    if (ingredientIds.includes(id)) onRemoveIngredient(id);
    else onAddIngredient(id);
  };

  return (
    <div>
      <NativePageHero
        eyebrow="Your cabinet"
        title="Mix"
        description="See what you can pour with what's on your shelf."
        action={
          <AppLink
            href="/saved"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-forest shadow-sm"
            aria-label="Open favorites"
          >
            <HeartIcon className="h-4 w-4 text-terracotta" />
            Favorites
            {favorites.length > 0 ? (
              <span className="rounded-full bg-terracotta/10 px-1.5 py-0.5 text-[10px] font-bold text-terracotta">
                {favorites.length}
              </span>
            ) : null}
          </AppLink>
        }
        meta={
          ingredientIds.length === 0
            ? "Start by adding a few bottles below."
            : cocktailsLoading && matchCounts.canMake === 0
              ? "Matching drinks to your ingredients…"
              : `${matchCounts.canMake} drink${matchCounts.canMake === 1 ? "" : "s"} ready · ${ingredientIds.length} ingredient${ingredientIds.length === 1 ? "" : "s"} in your cabinet`
        }
      />

      <div className="mb-4 grid grid-cols-2 rounded-2xl bg-mist/50 p-1">
        <PaneButton
          label="You can pour"
          active={pane === "tonight"}
          disabled={ingredientIds.length === 0}
          badge={matchCounts.canMake || undefined}
          onClick={() => setPane("tonight")}
        />
        <PaneButton
          label="Cabinet"
          active={pane === "shelf"}
          onClick={() => setPane("shelf")}
        />
      </div>

      {pane === "tonight" ? (
        <TonightPane
          drinks={drinkPager.visibleItems}
          hasMore={drinkPager.hasMore}
          loadMoreRef={drinkPager.loadMoreRef}
          canMake={matchCounts.canMake}
          cocktailsLoading={cocktailsLoading}
          almost={almost}
          allIngredients={allIngredients}
          onAddIngredient={onAddIngredient}
          onOpenShelf={() => setPane("shelf")}
        />
      ) : (
        <ShelfPane
          query={query}
          onQuery={setQuery}
          category={category}
          onCategory={setCategory}
          selected={selectedIngredients}
          popular={popular}
          catalog={catalog}
          visibleItems={visibleItems}
          hasMore={hasMore}
          loadMoreRef={loadMoreRef}
          ingredientIds={ingredientIds}
          canMake={matchCounts.canMake}
          onToggle={toggle}
          onClearAll={onClearAll}
          onSeeTonight={() => setPane("tonight")}
        />
      )}
    </div>
  );
}

function PaneButton({
  label,
  active,
  onClick,
  disabled,
  badge,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative rounded-xl py-2.5 text-sm font-semibold transition-colors outline-none focus:outline-none focus-visible:outline-none ${
        active ? "bg-white text-forest shadow-sm" : "text-sage"
      } ${disabled ? "opacity-40" : ""}`}
    >
      {label}
      {typeof badge === "number" && badge > 0 && !active ? (
        <span className="ml-1.5 rounded-full bg-terracotta/15 px-1.5 py-0.5 text-[10px] font-bold text-terracotta">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function EmptyTonight({
  cocktailsLoading,
  onOpenShelf,
}: {
  cocktailsLoading: boolean;
  onOpenShelf: () => void;
}) {
  useEffect(() => {
    if (!cocktailsLoading) {
      void trackEmptyStateSeen("mix_tonight");
    }
  }, [cocktailsLoading]);

  return (
    <div className="rounded-3xl bg-white px-5 py-12 text-center">
      <p className="font-display text-xl font-bold text-forest">
        {cocktailsLoading ? "Matching drinks…" : "Nothing you can pour yet"}
      </p>
      <p className="mt-2 text-sm text-sage">
        Add a mixer or citrus — lime juice and simple syrup unlock a lot.
      </p>
      <button
        type="button"
        onClick={onOpenShelf}
        className="mt-5 rounded-2xl bg-terracotta px-5 py-3 text-sm font-bold text-cream"
      >
        Edit cabinet
      </button>
    </div>
  );
}

function TonightPane({
  drinks,
  hasMore,
  loadMoreRef,
  canMake,
  cocktailsLoading,
  almost,
  allIngredients,
  onAddIngredient,
  onOpenShelf,
}: {
  drinks: MixCocktail[];
  hasMore: boolean;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  canMake: number;
  cocktailsLoading: boolean;
  almost: MixMatchGroups["almostThere"];
  allIngredients: MixIngredient[];
  onAddIngredient: (id: string) => void;
  onOpenShelf: () => void;
}) {
  if (canMake === 0) {
    return (
      <EmptyTonight
        cocktailsLoading={cocktailsLoading}
        onOpenShelf={onOpenShelf}
      />
    );
  }

  return (
    <>
      <div
        className="native-recipe-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          columnGap: 12,
          rowGap: 20,
        }}
      >
        {drinks.map((cocktail) => (
          <NativeDrinkTile
            key={cocktail.id}
            href={`/cocktails/${cocktail.slug}?from=mix`}
            name={cocktail.name}
            spirit={cocktail.primarySpirit}
            imageUrl={cocktail.imageUrl}
            createdAt={cocktail.createdAt}
            onNavigate={() => {
              void trackMixResultClicked(cocktail.slug, "tonight");
            }}
          />
        ))}
      </div>
      {hasMore ? (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          <div className="spinner" />
        </div>
      ) : null}

      {almost.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-xl font-bold text-forest">One more bottle</h2>
          <ul className="overflow-hidden rounded-2xl bg-white">
            {almost.map((match) => {
              const missingId = match.missingIngredientIds[0];
              const missing = allIngredients.find((item) => item.id === missingId);
              if (!missing) return null;
              return (
                <li
                  key={match.cocktail.id}
                  className="flex min-h-[3.25rem] items-center gap-3 border-b border-mist/70 px-4 last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-[15px] font-bold text-forest">
                      {match.cocktail.name}
                    </p>
                    <p className="truncate text-xs text-sage">Needs {missing.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAddIngredient(missing.id)}
                    className="flex-shrink-0 rounded-full bg-terracotta/10 px-3 py-1.5 text-xs font-bold text-terracotta"
                  >
                    Add
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <button
        type="button"
        onClick={onOpenShelf}
        className="mt-6 w-full rounded-2xl bg-white py-3.5 text-sm font-semibold text-forest"
      >
        Edit cabinet
      </button>
    </>
  );
}

function ShelfPane({
  query,
  onQuery,
  category,
  onCategory,
  selected,
  popular,
  catalog,
  visibleItems,
  hasMore,
  loadMoreRef,
  ingredientIds,
  canMake,
  onToggle,
  onClearAll,
  onSeeTonight,
}: {
  query: string;
  onQuery: (value: string) => void;
  category: string | null;
  onCategory: (value: string | null) => void;
  selected: MixIngredient[];
  popular: MixIngredient[];
  catalog: MixIngredient[];
  visibleItems: MixIngredient[];
  hasMore: boolean;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  ingredientIds: string[];
  canMake: number;
  onToggle: (id: string) => void;
  onClearAll: () => void;
  onSeeTonight: () => void;
}) {
  const searching = Boolean(query.trim()) || Boolean(category);

  return (
    <div className="pb-20">
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-sage" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search bottles"
          className="w-full rounded-2xl border-0 bg-white py-3.5 pl-11 pr-10 text-base text-forest shadow-sm placeholder:text-sage"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sage"
            aria-label="Clear search"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      {selected.length > 0 && !category ? (
        <section className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-sage">In your cabinet</h2>
            <button type="button" onClick={onClearAll} className="text-xs font-semibold text-terracotta">
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selected.slice(0, 24).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggle(item.id)}
                className="rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-cream"
              >
                {item.name} ×
              </button>
            ))}
            {selected.length > 24 ? (
              <span className="self-center text-xs text-sage">+{selected.length - 24} more</span>
            ) : null}
          </div>
        </section>
      ) : null}

      {category ? (
        <button
          type="button"
          onClick={() => {
            onCategory(null);
            onQuery("");
          }}
          className="mb-3 flex items-center gap-1 text-sm font-semibold text-terracotta"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          All categories
        </button>
      ) : null}

      {searching ? (
        <>
          {category && !query ? (
            <h2 className="mb-3 font-display text-lg font-bold text-forest">
              {formatIngredientCategory(category)}
            </h2>
          ) : null}
          <ul className="overflow-hidden rounded-2xl bg-white">
            {visibleItems.map((item) => {
              const on = ingredientIds.includes(item.id);
              return (
                <li key={item.id} className="border-b border-mist/70 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => onToggle(item.id)}
                    aria-pressed={on}
                    className="flex min-h-[3.25rem] w-full items-center gap-3 px-4 text-left"
                  >
                    <span
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                        on ? "bg-olive text-cream" : "bg-mist text-sage"
                      }`}
                    >
                      {on ? <CheckIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0 flex-1 font-medium text-forest">{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {visibleItems.length === 0 ? (
            <p className="mt-4 text-center text-sm text-sage">No matching bottles.</p>
          ) : null}
          {hasMore ? <div ref={loadMoreRef} className="h-8" /> : null}
        </>
      ) : (
        <>
          {popular.length > 0 ? (
            <section className="mb-6">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-sage">
                Quick add
              </h2>
              <div className="flex flex-wrap gap-2">
                {popular.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onToggle(item.id)}
                    className="rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-forest shadow-sm"
                  >
                    + {item.name}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-sage">
              Browse
            </h2>
            <div className="overflow-hidden rounded-2xl bg-white">
              {CATEGORIES.map((entry) => {
                const count = catalog.filter(
                  (item) => (item.category || "Garnish") === entry.key
                ).length;
                const owned = selected.filter(
                  (item) => (item.category || "Garnish") === entry.key
                ).length;
                return (
                  <button
                    key={entry.key}
                    type="button"
                    onClick={() => onCategory(entry.key)}
                    className="flex min-h-[3.25rem] w-full items-center gap-3 border-b border-mist/70 px-4 text-left last:border-b-0"
                  >
                    <span className="min-w-0 flex-1 font-display font-bold text-forest">
                      {entry.label}
                    </span>
                    <span className="text-xs text-sage">
                      {owned > 0 ? `${owned} of ${count}` : `${count}`}
                    </span>
                    <ChevronRightIcon className="h-4 w-4 text-sage/50" />
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}

      {canMake > 0 ? (
        <div
          className="pointer-events-none sticky z-20 mt-6"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 5.5rem)" }}
        >
          <button
            type="button"
            onClick={onSeeTonight}
            className="pointer-events-auto w-full rounded-2xl bg-terracotta py-3.5 text-sm font-bold text-cream shadow-lg shadow-terracotta/25"
          >
            See {canMake} you can pour
          </button>
        </div>
      ) : null}
    </div>
  );
}
