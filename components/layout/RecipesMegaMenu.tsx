"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { OCCASIONS } from "@/lib/occasions";

const SPIRITS = [
  { label: "Vodka", href: "/cocktails?spirit=vodka" },
  { label: "Gin", href: "/cocktails?spirit=gin" },
  { label: "Rum", href: "/cocktails?spirit=rum" },
  { label: "Tequila", href: "/cocktails?spirit=tequila" },
  { label: "Mezcal", href: "/cocktails?spirit=mezcal" },
  { label: "Whiskey", href: "/cocktails?spirit=whiskey" },
  { label: "Non-Alcoholic", href: "/occasions/zero-proof" },
];

const FEATURED = [
  { label: "All recipes", href: "/cocktails", note: "Full library" },
  { label: "New this month", href: "/cocktails?filter=new", note: "Freshly added" },
  { label: "Drink of the Day", href: "/cocktail-of-the-day", note: "One daily pick" },
  { label: "What can I make?", href: "/mix", note: "From your bar" },
];

function navTriggerClass(active: boolean) {
  return [
    "inline-flex items-center gap-1 text-sm transition-colors duration-200",
    active
      ? "font-semibold text-forest"
      : "font-medium text-charcoal hover:text-terracotta",
  ].join(" ");
}

type Props = {
  active: boolean;
};

export function RecipesMegaMenu({ active }: Props) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  return (
    <div className="relative" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
      <Link
        href="/cocktails"
        className={navTriggerClass(active || open)}
        aria-expanded={open}
        onFocus={cancelClose}
      >
        All Recipes
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform ${open ? "rotate-180 text-terracotta" : "text-sage"}`}
          aria-hidden
        />
      </Link>

      {open && (
        <div className="absolute left-1/2 z-50 mt-3 w-screen max-w-4xl -translate-x-1/2 px-4">
          <div className="overflow-hidden rounded-3xl border border-mist bg-cream shadow-2xl shadow-forest/10">
            <div className="grid grid-cols-12">
              <div className="col-span-4 bg-gradient-to-br from-forest to-forest/90 p-6 text-cream">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-olive mb-4">
                  Start here
                </p>
                <ul className="space-y-3">
                  {FEATURED.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="group block rounded-xl px-3 py-2.5 hover:bg-white/10 transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        <span className="block font-display text-lg font-semibold group-hover:text-olive transition-colors">
                          {item.label}
                        </span>
                        <span className="text-xs text-cream/65">{item.note}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-8 p-6 grid grid-cols-2 gap-8 bg-cream">
                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-terracotta font-bold">
                      Occasions
                    </p>
                    <Link
                      href="/occasions"
                      className="text-[11px] font-medium text-sage hover:text-terracotta"
                      onClick={() => setOpen(false)}
                    >
                      View all
                    </Link>
                  </div>
                  <ul className="grid grid-cols-2 gap-1.5">
                    {OCCASIONS.map((occasion) => (
                      <li key={occasion.slug}>
                        <Link
                          href={`/occasions/${occasion.slug}`}
                          className="block rounded-lg px-2.5 py-2 text-sm text-forest hover:bg-mist/70 hover:text-terracotta transition-colors"
                          onClick={() => setOpen(false)}
                        >
                          {occasion.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-terracotta font-bold mb-3">
                    By spirit
                  </p>
                  <ul className="space-y-1">
                    {SPIRITS.map((spirit) => (
                      <li key={spirit.href}>
                        <Link
                          href={spirit.href}
                          className="block rounded-lg px-2.5 py-2 text-sm text-forest hover:bg-mist/70 hover:text-terracotta transition-colors"
                          onClick={() => setOpen(false)}
                        >
                          {spirit.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 pt-4 border-t border-mist">
                    <Link
                      href="/learn"
                      className="block rounded-xl bg-olive/10 px-3 py-3 hover:bg-olive/15 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <span className="block text-sm font-semibold text-forest">Learn mixology</span>
                      <span className="text-xs text-sage">Techniques, tools & smart swaps</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
