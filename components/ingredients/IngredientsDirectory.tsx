"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import type { DirectoryIngredient } from "@/lib/ingredientTypes";
import {
  LIBRARY_SECTIONS,
  groupIngredients,
  workingBarIngredients,
} from "@/lib/ingredientTaxonomy";

type Props = {
  ingredients: DirectoryIngredient[];
};

export function IngredientsDirectory({ ingredients }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ingredients;
    return ingredients.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        (item.dek && item.dek.toLowerCase().includes(q))
    );
  }, [ingredients, query]);

  const groups = useMemo(() => groupIngredients(filtered), [filtered]);
  const staples = useMemo(() => workingBarIngredients(filtered), [filtered]);
  const isSearching = query.trim().length > 0;
  const jumpSections = LIBRARY_SECTIONS.filter((section) => groups[section.id].length > 0);

  return (
    <div className="space-y-16 sm:space-y-20">
      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-sage" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Campari, agave, vermouth…"
          className="w-full bg-transparent border-0 border-b border-mist pl-7 pr-2 py-2.5 text-charcoal placeholder:text-sage/60 focus:outline-none focus:border-forest/50"
        />
      </div>

      {!isSearching && (
        <nav className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm" aria-label="Library sections">
          <a href="#working-bar" className="text-forest hover:text-terracotta transition-colors">
            Working bar
          </a>
          {jumpSections.map((section) => (
            <span key={section.id} className="contents">
              <span className="text-mist" aria-hidden>
                ·
              </span>
              <a href={`#${section.id}`} className="text-sage hover:text-terracotta transition-colors">
                {section.title}
              </a>
            </span>
          ))}
        </nav>
      )}

      {filtered.length === 0 ? (
        <p className="text-sage">Nothing in the library matches that search.</p>
      ) : isSearching ? (
        <section>
          <p className="text-sm text-sage mb-6">
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </p>
          <IngredientList items={filtered} />
        </section>
      ) : (
        <>
          {staples.length > 0 && (
            <section id="working-bar" className="scroll-mt-28">
              <SectionHeader
                title="A working bar"
                dek="The bottles that unlock most of the library: a base spirit, vermouth, a bitter, citrus, sugar, and soda."
              />
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
                {staples.map((ingredient) => (
                  <Link
                    key={ingredient.id}
                    href={`/ingredients/${ingredient.slug}`}
                    className="group text-center"
                  >
                    <div className="relative mx-auto h-36 sm:h-44 w-full">
                      {ingredient.imageUrl ? (
                        <Image
                          src={ingredient.imageUrl}
                          alt=""
                          fill
                          sizes="140px"
                          className="object-contain object-bottom mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                          quality={85}
                        />
                      ) : (
                        <div className="h-full flex items-end justify-center text-sage/40 text-xs">
                          {ingredient.name}
                        </div>
                      )}
                    </div>
                    <p className="mt-3 font-display text-base text-forest group-hover:text-terracotta transition-colors">
                      {ingredient.name}
                    </p>
                    <p className="text-xs text-sage mt-0.5 tabular-nums">
                      {ingredient.cocktailCount}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {LIBRARY_SECTIONS.map((section) => {
            const items = groups[section.id];
            if (items.length === 0) return null;
            return (
              <section key={section.id} id={section.id} className="scroll-mt-28">
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

function SectionHeader({ title, dek }: { title: string; dek: string }) {
  return (
    <div className="mb-8 max-w-2xl">
      <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-forest">
        {title}
      </h2>
      <p className="mt-2 text-sage leading-relaxed [text-wrap:pretty]">{dek}</p>
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
    <ul className="grid sm:grid-cols-2 gap-x-12 border-t border-mist">
      {items.map((ingredient) => (
        <li key={ingredient.id} className="border-b border-mist">
          <Link
            href={`/ingredients/${ingredient.slug}`}
            className="group flex items-baseline justify-between gap-4 py-3.5"
          >
            <span
              className={[
                "group-hover:text-terracotta transition-colors",
                quiet ? "text-sage" : "text-forest",
              ].join(" ")}
            >
              {ingredient.name}
            </span>
            <span className="text-sage/70 text-sm tabular-nums shrink-0">
              {ingredient.cocktailCount}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
