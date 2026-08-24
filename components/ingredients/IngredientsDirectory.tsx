"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import type { DirectoryIngredient } from "@/lib/ingredientTypes";
import {
  LIBRARY_SECTIONS,
  groupIngredients,
  workingBarIngredients,
} from "@/lib/ingredientTaxonomy";
import { searchDirectoryIngredients } from "@/lib/search";
import { WorkingBarTile } from "@/components/ingredients/WorkingBarTile";

type Props = {
  ingredients: DirectoryIngredient[];
};

export function IngredientsDirectory({ ingredients }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return ingredients;
    return searchDirectoryIngredients(ingredients, query);
  }, [ingredients, query]);

  const groups = useMemo(() => groupIngredients(filtered), [filtered]);
  const staples = useMemo(() => workingBarIngredients(filtered), [filtered]);
  const isSearching = query.trim().length > 0;
  const jumpSections = LIBRARY_SECTIONS.filter((section) => groups[section.id].length > 0);

  return (
    <div className="space-y-10 sm:space-y-20">
      <div className="sticky top-16 z-20 -mx-4 space-y-3 border-b border-mist/70 bg-cream/95 px-4 py-3 backdrop-blur-md lg:static lg:z-auto lg:mx-0 lg:space-y-6 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-sage" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Campari, agave, vermouth…"
            className="w-full border-0 border-b border-mist bg-transparent py-2.5 pl-7 pr-2 text-charcoal placeholder:text-sage/60 focus:border-forest/50 focus:outline-none"
          />
        </div>

        {!isSearching && (
          <nav
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0"
            aria-label="Library sections"
          >
            <JumpChip href="#working-bar">Working bar</JumpChip>
            {jumpSections.map((section) => (
              <JumpChip key={section.id} href={`#${section.id}`}>
                {section.title}
              </JumpChip>
            ))}
          </nav>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sage">Nothing in the library matches that search.</p>
      ) : isSearching ? (
        <section>
          <p className="mb-6 text-sm text-sage">
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </p>
          <IngredientList items={filtered} />
        </section>
      ) : (
        <>
          {staples.length > 0 && (
            <section id="working-bar" className="scroll-mt-36 lg:scroll-mt-28">
              <SectionHeader
                title="A working bar"
                dek="The bottles that unlock most of the library: a base spirit, vermouth, a bitter, citrus, sugar, and soda."
              />
              <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-6">
                {staples.map((ingredient) => (
                  <WorkingBarTile key={ingredient.id} ingredient={ingredient} />
                ))}
              </div>
            </section>
          )}

          {LIBRARY_SECTIONS.map((section) => {
            const items = groups[section.id];
            if (items.length === 0) return null;
            return (
              <section key={section.id} id={section.id} className="scroll-mt-36 lg:scroll-mt-28">
                <SectionHeader title={section.title} dek={section.dek} />
                <IngredientList items={items} quiet={section.id === "also"} />
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}

function JumpChip({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      className="ingredient-jump-chip shrink-0 rounded-full border border-mist bg-white/70 px-2.5 py-1 text-xs text-forest active:border-terracotta/40 active:text-terracotta sm:px-3 sm:py-1.5 sm:text-sm lg:bg-transparent lg:hover:text-terracotta"
    >
      {children}
    </a>
  );
}

function SectionHeader({ title, dek }: { title: string; dek: string }) {
  return (
    <div className="mb-5 max-w-2xl sm:mb-8">
      <h2 className="font-display text-xl font-semibold tracking-tight text-forest sm:text-3xl">
        {title}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-sage [text-wrap:pretty] sm:mt-2 sm:text-base">
        {dek}
      </p>
    </div>
  );
}

function IngredientList({
  items,
  quiet = false,
}: {
  items: DirectoryIngredient[];
  quiet?: boolean;
}) {
  return (
    <ul className="grid border-t border-mist sm:grid-cols-2 sm:gap-x-12">
      {items.map((ingredient) => (
        <li key={ingredient.id} className="border-b border-mist">
          <Link
            href={`/ingredients/${ingredient.slug}`}
            className="group flex min-h-12 items-baseline justify-between gap-4 py-3.5"
          >
            <span
              className={[
                "group-hover:text-terracotta transition-colors",
                quiet ? "text-sage" : "text-forest",
              ].join(" ")}
            >
              {ingredient.name}
            </span>
            <span className="shrink-0 text-sm tabular-nums text-sage/70">
              {ingredient.cocktailCount}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
