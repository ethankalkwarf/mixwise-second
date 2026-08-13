"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

type MegaCover = {
  slug: string;
  name: string;
  href: string;
  imageUrl: string | null;
  eyebrow?: string;
};

const SPIRITS = [
  { label: "Vodka", href: "/cocktails?spirit=vodka" },
  { label: "Gin", href: "/cocktails?spirit=gin" },
  { label: "Rum", href: "/cocktails?spirit=rum" },
  { label: "Tequila", href: "/cocktails?spirit=tequila" },
  { label: "Mezcal", href: "/cocktails?spirit=mezcal" },
  { label: "Whiskey", href: "/cocktails?spirit=whiskey" },
  { label: "Zero-Proof", href: "/occasions/zero-proof" },
];

type Props = {
  active: boolean;
  occasionCovers: MegaCover[];
  featuredCover?: MegaCover | null;
};

export function RecipesMegaMenu({ active, occasionCovers, featuredCover }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  const topOccasions = occasionCovers.slice(0, 6);

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={[
          "inline-flex items-center gap-1 text-sm transition-colors duration-200",
          active || open
            ? "font-semibold text-forest"
            : "font-medium text-charcoal hover:text-terracotta",
        ].join(" ")}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        All Recipes
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-200 ${
            open ? "rotate-180 text-terracotta" : "text-sage"
          }`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          id={panelId}
          className="fixed inset-x-0 top-16 sm:top-18 z-40 px-3 sm:px-6"
        >
          <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-mist bg-cream shadow-[0_30px_80px_-20px_rgba(35,52,40,0.35)]">
            <div className="grid lg:grid-cols-[1.15fr_1fr]">
              {/* Visual lead */}
              <div className="relative min-h-[280px] lg:min-h-[360px] overflow-hidden">
                {featuredCover?.imageUrl ? (
                  <Image
                    src={featuredCover.imageUrl}
                    alt={featuredCover.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-forest via-forest/90 to-olive/50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/45 to-forest/10" />
                <div className="relative z-10 flex h-full flex-col justify-end p-7 sm:p-9">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-olive mb-3">
                    {featuredCover?.eyebrow || "Featured"}
                  </p>
                  <h3 className="font-display text-3xl sm:text-4xl font-bold text-cream max-w-md leading-tight mb-3">
                    {featuredCover?.name || "Explore the library"}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={featuredCover?.href || "/cocktails"}
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center rounded-full bg-cream px-4 py-2 text-sm font-semibold text-forest hover:bg-olive transition-colors"
                    >
                      Open collection
                    </Link>
                    <Link
                      href="/cocktails"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center rounded-full border border-cream/35 px-4 py-2 text-sm font-medium text-cream hover:bg-cream/10 transition-colors"
                    >
                      All recipes
                    </Link>
                  </div>
                </div>
              </div>

              {/* Navigation columns */}
              <div className="p-6 sm:p-8 flex flex-col gap-7 bg-cream">
                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-terracotta font-bold">
                      Occasions
                    </p>
                    <Link
                      href="/occasions"
                      onClick={() => setOpen(false)}
                      className="text-[11px] font-medium text-sage hover:text-terracotta"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {topOccasions.map((item) => (
                      <Link
                        key={item.slug}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="group relative overflow-hidden rounded-2xl border border-mist bg-mist/40 aspect-[4/3]"
                      >
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="160px"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-olive/30 to-forest/20" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/20 to-transparent" />
                        <span className="absolute bottom-2 left-2 right-2 font-display text-sm font-semibold text-cream drop-shadow">
                          {item.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-terracotta font-bold mb-3">
                    By spirit
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SPIRITS.map((spirit) => (
                      <Link
                        key={spirit.href}
                        href={spirit.href}
                        onClick={() => setOpen(false)}
                        className="rounded-full border border-mist bg-white px-3.5 py-1.5 text-sm text-forest hover:border-terracotta/40 hover:text-terracotta transition-colors"
                      >
                        {spirit.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2 pt-1 border-t border-mist">
                  <Link
                    href="/cocktails?filter=new"
                    onClick={() => setOpen(false)}
                    className="rounded-2xl px-3 py-3 hover:bg-mist/60 transition-colors"
                  >
                    <span className="block text-sm font-semibold text-forest">New</span>
                    <span className="text-xs text-sage">Added this month</span>
                  </Link>
                  <Link
                    href="/mix"
                    onClick={() => setOpen(false)}
                    className="rounded-2xl px-3 py-3 hover:bg-mist/60 transition-colors"
                  >
                    <span className="block text-sm font-semibold text-forest">Your bar</span>
                    <span className="text-xs text-sage">What can I make?</span>
                  </Link>
                  <Link
                    href="/cocktail-of-the-day"
                    onClick={() => setOpen(false)}
                    className="rounded-2xl px-3 py-3 hover:bg-mist/60 transition-colors"
                  >
                    <span className="block text-sm font-semibold text-forest">Daily drink</span>
                    <span className="text-xs text-sage">One pick today</span>
                  </Link>
                  <Link
                    href="/learn"
                    onClick={() => setOpen(false)}
                    className="rounded-2xl px-3 py-3 hover:bg-mist/60 transition-colors"
                  >
                    <span className="block text-sm font-semibold text-forest">Learn</span>
                    <span className="text-xs text-sage">Train at home</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
