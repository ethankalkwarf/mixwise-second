"use client";

import { useMemo, useState } from "react";
import {
  BeakerIcon,
  ClockIcon,
  HeartIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import {
  BeakerIcon as BeakerSolid,
  ClockIcon as ClockSolid,
  HeartIcon as HeartSolid,
  Squares2X2Icon as SquaresSolid,
} from "@heroicons/react/24/solid";
import { formatCocktailName, formatIngredientCategory } from "@/lib/formatters";
import { FriendsActivityFeed } from "@/components/friends/FriendsActivityFeed";
import { FavoriteDrinkRow } from "@/components/bar/FavoriteDrinkRow";

type Fav = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
};

type Ingredient = {
  ingredient_id: string;
  ingredient_name: string | null;
  ingredient_category?: string | null;
};

type Tab = "highlights" | "activity" | "cocktails" | "bar";

interface PublicBarBrowseProps {
  userId: string;
  userFirstName?: string;
  favorites: Fav[];
  cocktailCount: number;
  cocktailsSlot: React.ReactNode;
  ingredients: Ingredient[];
}

const CATEGORY_ORDER = [
  "Spirit",
  "Liqueur",
  "Wine",
  "Beer",
  "Mixer",
  "Citrus",
  "Syrup",
  "Bitters",
  "Garnish",
  "Other",
];

function FavoritesGrid({ favorites, initial = 8 }: { favorites: Fav[]; initial?: number }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? favorites : favorites.slice(0, initial);
  const remaining = favorites.length - initial;

  if (favorites.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-mist bg-cream/40 px-5 py-10 text-center">
        <HeartIcon className="mx-auto h-8 w-8 text-sage/50" />
        <p className="mt-3 text-sm text-sage">No favorites saved yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {shown.map((c) => {
        const slug = c.slug || c.id;
        const href = slug ? `/cocktails/${encodeURIComponent(slug)}` : "/cocktails";
        return (
          <FavoriteDrinkRow
            key={c.id}
            href={href}
            name={formatCocktailName(c.name)}
            imageUrl={c.imageUrl}
          />
        );
      })}
      {remaining > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-5 w-full rounded-xl border border-mist bg-white py-2.5 text-sm font-medium text-olive transition hover:border-olive/40 hover:bg-olive/5"
        >
          {expanded ? "Show less" : `Show ${remaining} more favorites`}
        </button>
      )}
    </div>
  );
}

function CompactInventory({ ingredients }: { ingredients: Ingredient[] }) {
  const categoryRank = useMemo(
    () => new Map(CATEGORY_ORDER.map((c, i) => [c, i])),
    []
  );

  const grouped = useMemo(() => {
    const acc: Record<string, Ingredient[]> = {};
    for (const ing of ingredients) {
      const cat = ing.ingredient_category || "Other";
      (acc[cat] ??= []).push(ing);
    }
    return Object.entries(acc).sort(
      ([a], [b]) => (categoryRank.get(a) ?? 999) - (categoryRank.get(b) ?? 999)
    );
  }, [ingredients, categoryRank]);

  if (ingredients.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-mist bg-cream/40 px-5 py-10 text-center">
        <Squares2X2Icon className="mx-auto h-8 w-8 text-sage/50" />
        <p className="mt-3 text-sm text-sage">No ingredients in this bar yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {grouped.map(([category, items]) => (
        <details
          key={category}
          className="group rounded-2xl bg-cream/40 ring-1 ring-mist open:bg-white open:ring-olive/20"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 font-semibold text-forest [&::-webkit-details-marker]:hidden">
            <span>{formatIngredientCategory(category)}</span>
            <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-medium tabular-nums text-sage ring-1 ring-mist group-open:bg-olive/10 group-open:text-olive group-open:ring-olive/20">
              {items.length}
            </span>
          </summary>
          <div className="border-t border-mist/70 px-4 pb-4 pt-3">
            <ul className="columns-2 gap-x-6 text-sm text-charcoal sm:columns-3">
              {[...items]
                .sort((a, b) =>
                  (a.ingredient_name || "").localeCompare(b.ingredient_name || "")
                )
                .map((ing) => (
                  <li key={ing.ingredient_id} className="break-inside-avoid py-0.5">
                    {ing.ingredient_name || "Ingredient"}
                  </li>
                ))}
            </ul>
          </div>
        </details>
      ))}
    </div>
  );
}

export function PublicBarBrowse({
  userId,
  favorites,
  cocktailCount,
  cocktailsSlot,
  ingredients,
}: PublicBarBrowseProps) {
  const [tab, setTab] = useState<Tab>(
    favorites.length > 0 ? "highlights" : cocktailCount > 0 ? "cocktails" : "bar"
  );

  const tabs: {
    id: Tab;
    label: string;
    Outline: typeof HeartIcon;
    Solid: typeof HeartSolid;
  }[] = [
    {
      id: "highlights",
      label: "Favorite Drinks",
      Outline: HeartIcon,
      Solid: HeartSolid,
    },
    {
      id: "activity",
      label: "Activity",
      Outline: ClockIcon,
      Solid: ClockSolid,
    },
    {
      id: "cocktails",
      label: "Ready to Make",
      Outline: BeakerIcon,
      Solid: BeakerSolid,
    },
    {
      id: "bar",
      label: "Bar Inventory",
      Outline: Squares2X2Icon,
      Solid: SquaresSolid,
    },
  ];

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-mist">
      <div className="border-b border-mist/80 bg-gradient-to-b from-cream/80 to-white p-3 sm:p-4">
        <div
          role="tablist"
          aria-label="Bar sections"
          className="grid grid-cols-4 gap-1 rounded-2xl bg-mist/60 p-1"
        >
          {tabs.map((t) => {
            const active = tab === t.id;
            const Icon = active ? t.Solid : t.Outline;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-1.5 py-2.5 text-center transition sm:flex-row sm:justify-center sm:gap-1.5 sm:px-2 ${
                  active
                    ? "bg-white text-forest shadow-sm ring-1 ring-black/5"
                    : "text-sage hover:text-forest"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-olive" : ""}`} />
                <span className="text-[10px] font-semibold leading-tight sm:text-sm">
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 sm:p-7" role="tabpanel">
        {tab === "highlights" && (
          <div>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-forest">Favorite Drinks</h3>
                <p className="mt-0.5 text-sm text-sage">Drinks they love most</p>
              </div>
            </div>
            <FavoritesGrid favorites={favorites} />
          </div>
        )}
        {tab === "activity" && (
          <div>
            <div className="mb-2">
              <h3 className="font-serif text-lg font-bold text-forest">Activity</h3>
              <p className="mt-0.5 text-sm text-sage">
                Recent saves, badges, and bar updates
              </p>
            </div>
            <FriendsActivityFeed
              userId={userId}
              variant="profile"
              emptyMessage="No recent saves, badges, or bar updates yet."
            />
          </div>
        )}
        {tab === "cocktails" && (
          <div>
            <div className="mb-4">
              <h3 className="font-serif text-lg font-bold text-forest">Ready to Make</h3>
              <p className="mt-0.5 text-sm text-sage">
                {cocktailCount > 0
                  ? `${cocktailCount} cocktails with what’s in this bar`
                  : "No cocktails ready yet"}
              </p>
            </div>
            {cocktailsSlot}
          </div>
        )}
        {tab === "bar" && (
          <div>
            <div className="mb-4">
              <h3 className="font-serif text-lg font-bold text-forest">Bar Inventory</h3>
              <p className="mt-0.5 text-sm text-sage">
                {ingredients.length} bottles & mixers · tap a category to expand
              </p>
            </div>
            <CompactInventory ingredients={ingredients} />
          </div>
        )}
      </div>
    </div>
  );
}
