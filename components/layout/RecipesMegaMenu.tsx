"use client";

import Link from "next/link";
import Image from "next/image";
import {
  NavMegaShell,
  NavMegaTrigger,
  type NavMegaController,
} from "@/components/layout/MegaMenuFrame";

type MegaCover = {
  slug: string;
  name: string;
  href: string;
  imageUrl: string | null;
  eyebrow?: string;
  focusClass?: string;
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
  controller: NavMegaController;
};

export function RecipesMegaMenu({
  active,
  occasionCovers,
  featuredCover,
  controller,
}: Props) {
  // Don't repeat the featured occasion in the list — 8 items fill a 2-col grid evenly
  const occasions = occasionCovers
    .filter((item) => item.slug !== featuredCover?.slug)
    .slice(0, 8);

  return (
    <NavMegaShell
      id="recipes"
      controller={controller}
      trigger={({ open, panelId, toggle }) => (
        <NavMegaTrigger
          href="/cocktails"
          label="Browse All Recipes"
          compactLabel="Recipes"
          active={active}
          open={open}
          panelId={panelId}
          toggle={toggle}
        />
      )}
    >
      <div className="grid gap-8 py-7 md:grid-cols-12 md:items-stretch md:gap-10 md:py-8">
        <div className="flex md:col-span-4">
          <Link
            href={featuredCover?.href || "/occasions"}
            onClick={controller.closeMenu}
            className="group flex w-full flex-col"
          >
            <div className="relative aspect-[16/11] overflow-hidden bg-mist sm:aspect-[5/3] md:aspect-auto md:max-h-[240px] md:min-h-0 md:flex-1">
              {featuredCover?.imageUrl ? (
                <Image
                  src={featuredCover.imageUrl}
                  alt=""
                  fill
                  className={[
                    "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]",
                    featuredCover.focusClass || "",
                  ].join(" ")}
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
              <h3 className="font-display text-xl font-semibold leading-tight tracking-tight text-charcoal transition-colors group-hover:text-terracotta sm:text-2xl">
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

        <div className="flex flex-col justify-between gap-7 md:col-span-8">
          <div>
            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              <Link
                href="/cocktails"
                onClick={controller.closeMenu}
                className="flex items-center justify-between gap-4 rounded-xl border border-mist bg-white px-4 py-3.5 transition-colors hover:border-terracotta/40 hover:bg-mist/40"
              >
                <span>
                  <span className="mb-0.5 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
                    Full library
                  </span>
                  <span className="block text-[15px] font-semibold tracking-tight text-charcoal">
                    Browse every cocktail
                  </span>
                </span>
                <span className="inline-flex shrink-0 items-center text-sm font-semibold text-forest">
                  Recipes
                  <span className="ml-1.5" aria-hidden>
                    →
                  </span>
                </span>
              </Link>
              <Link
                href="/ingredients"
                onClick={controller.closeMenu}
                className="flex items-center justify-between gap-4 rounded-xl border border-mist bg-white px-4 py-3.5 transition-colors hover:border-terracotta/40 hover:bg-mist/40"
              >
                <span>
                  <span className="mb-0.5 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
                    The bottles
                  </span>
                  <span className="block text-[15px] font-semibold tracking-tight text-charcoal">
                    Ingredient guides
                  </span>
                </span>
                <span className="inline-flex shrink-0 items-center text-sm font-semibold text-forest">
                  Guides
                  <span className="ml-1.5" aria-hidden>
                    →
                  </span>
                </span>
              </Link>
            </div>

            <div className="mb-3 flex items-end justify-between border-b border-mist pb-2.5">
              <Link
                href="/occasions"
                onClick={controller.closeMenu}
                className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta transition-colors hover:text-forest"
              >
                Collections
              </Link>
              <Link
                href="/occasions"
                onClick={controller.closeMenu}
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
                    onClick={controller.closeMenu}
                    className="group flex items-center gap-3 rounded-lg py-2 pr-2 transition-colors hover:bg-mist/60"
                  >
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden bg-mist">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt=""
                          fill
                          className={["object-cover", item.focusClass || ""].join(" ")}
                          sizes="40px"
                        />
                      ) : null}
                    </span>
                    <span className="text-[15px] font-semibold tracking-tight text-charcoal transition-colors group-hover:text-terracotta">
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-2.5 flex items-end justify-between">
              <Link
                href="/cocktails"
                onClick={controller.closeMenu}
                className="inline-block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta transition-colors hover:text-forest"
              >
                By spirit
              </Link>
              <Link
                href="/ingredients"
                onClick={controller.closeMenu}
                className="text-xs font-medium text-sage transition-colors hover:text-terracotta"
              >
                Bottle guides
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {SPIRITS.map((spirit) => (
                <Link
                  key={spirit.href}
                  href={spirit.href}
                  onClick={controller.closeMenu}
                  className="text-sm font-medium text-forest underline-offset-4 transition-colors hover:text-terracotta hover:underline"
                >
                  {spirit.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </NavMegaShell>
  );
}
