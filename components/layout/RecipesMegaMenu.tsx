"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);
  const panelId = useId();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };

  const openMenu = () => {
    cancelClose();
    setOpen(true);
  };

  const closeMenu = () => {
    cancelClose();
    setOpen(false);
  };

  // Don't repeat the featured occasion in the list
  const occasions = occasionCovers
    .filter((item) => item.slug !== featuredCover?.slug)
    .slice(0, 7);

  const panel =
    open && mounted
      ? createPortal(
          <div
            id={panelId}
            className="fixed inset-x-0 top-16 z-[60]"
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
          >
            <div className="absolute inset-x-0 -top-2 h-2" aria-hidden />

            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-x-0 top-0 h-[100vh] -z-10 bg-charcoal/20 backdrop-blur-[2px]"
              onClick={closeMenu}
            />

            <div className="border-b border-mist bg-cream shadow-[0_18px_40px_-28px_rgba(44,54,40,0.45)] animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="grid gap-8 py-7 lg:grid-cols-12 lg:items-stretch lg:gap-10 lg:py-8">
                  {/* Featured — slightly shorter so bottom aligns with spirits column */}
                  <div className="flex lg:col-span-4">
                    <Link
                      href={featuredCover?.href || "/occasions"}
                      onClick={closeMenu}
                      className="group flex w-full flex-col"
                    >
                      <div className="relative aspect-[16/11] overflow-hidden bg-mist sm:aspect-[5/3] lg:aspect-auto lg:min-h-0 lg:flex-1 lg:max-h-[240px]">
                        {featuredCover?.imageUrl ? (
                          <Image
                            src={featuredCover.imageUrl}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                            sizes="(max-width: 1024px) 100vw, 30vw"
                            priority
                          />
                        ) : (
                          <div className="absolute inset-0 bg-forest" />
                        )}
                      </div>
                      <div className="pt-3">
                        <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
                          Featured
                        </p>
                        <h3 className="font-display text-xl font-bold text-charcoal transition-colors group-hover:text-terracotta sm:text-2xl">
                          {featuredCover?.name || "Seasonal collections"}
                        </h3>
                        {featuredCover?.eyebrow ? (
                          <p className="mt-1 max-w-sm text-sm leading-snug text-sage line-clamp-2">
                            {featuredCover.eyebrow}
                          </p>
                        ) : null}
                        <span className="mt-2 inline-flex items-center text-sm font-semibold text-forest transition-colors group-hover:text-terracotta">
                          Explore
                          <span className="ml-1.5 transition-transform group-hover:translate-x-0.5" aria-hidden>
                            →
                          </span>
                        </span>
                      </div>
                    </Link>
                  </div>

                  <div className="flex flex-col justify-between gap-7 lg:col-span-8">
                    <div>
                      <div className="mb-3 flex items-end justify-between border-b border-mist pb-2.5">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
                          By occasion
                        </p>
                        <Link
                          href="/occasions"
                          onClick={closeMenu}
                          className="text-xs font-medium text-sage transition-colors hover:text-terracotta"
                        >
                          View all
                        </Link>
                      </div>
                      <ul className="grid gap-x-8 gap-y-0.5 sm:grid-cols-2">
                        {occasions.map((item) => (
                          <li key={item.slug}>
                            <Link
                              href={item.href}
                              onClick={closeMenu}
                              className="group flex items-center gap-3 rounded-lg py-2 pr-2 transition-colors hover:bg-mist/60"
                            >
                              <span className="relative h-10 w-10 shrink-0 overflow-hidden bg-mist">
                                {item.imageUrl ? (
                                  <Image
                                    src={item.imageUrl}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="40px"
                                  />
                                ) : null}
                              </span>
                              <span className="font-display text-base font-bold text-charcoal transition-colors group-hover:text-terracotta">
                                {item.name}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
                        By spirit
                      </p>
                      <div className="flex flex-wrap gap-x-5 gap-y-2">
                        {SPIRITS.map((spirit) => (
                          <Link
                            key={spirit.href}
                            href={spirit.href}
                            onClick={closeMenu}
                            className="text-sm font-medium text-forest underline-offset-4 transition-colors hover:text-terracotta hover:underline"
                          >
                            {spirit.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-mist py-3.5">
                  <Link
                    href="/cocktails"
                    onClick={closeMenu}
                    className="text-sm font-semibold text-charcoal transition-colors hover:text-terracotta"
                  >
                    All recipes →
                  </Link>
                  <Link
                    href="/mix"
                    onClick={closeMenu}
                    className="text-sm font-medium text-sage transition-colors hover:text-terracotta"
                  >
                    What can I make?
                  </Link>
                  <Link
                    href="/cocktail-of-the-day"
                    onClick={closeMenu}
                    className="text-sm font-medium text-sage transition-colors hover:text-terracotta"
                  >
                    Drink of the day
                  </Link>
                  <Link
                    href="/learn"
                    onClick={closeMenu}
                    className="text-sm font-medium text-sage transition-colors hover:text-terracotta"
                  >
                    Learn
                  </Link>
                  <Link
                    href="/occasions/holidays"
                    onClick={closeMenu}
                    className="text-sm font-medium text-sage transition-colors hover:text-terracotta"
                  >
                    Holidays
                  </Link>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
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
      </div>
      {panel}
    </>
  );
}
