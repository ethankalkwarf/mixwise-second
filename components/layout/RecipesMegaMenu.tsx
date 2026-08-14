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
          active={active}
          open={open}
          panelId={panelId}
          toggle={toggle}
        />
      )}
    >
      <div className="grid gap-8 py-7 lg:grid-cols-12 lg:items-stretch lg:gap-10 lg:py-8">
        <div className="flex lg:col-span-4">
          <Link
            href={featuredCover?.href || "/occasions"}
            onClick={controller.closeMenu}
            className="group flex w-full flex-col"
          >
            <div className="relative aspect-[16/11] overflow-hidden bg-mist sm:aspect-[5/3] lg:aspect-auto lg:max-h-[240px] lg:min-h-0 lg:flex-1">
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

        <div className="flex flex-col justify-between gap-7 lg:col-span-8">
          <div>
            <div className="mb-3 flex items-end justify-between border-b border-mist pb-2.5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
                Collections
              </p>
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
            <p className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
              By spirit
            </p>
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
            <div className="mt-5 flex flex-col gap-1 border-t border-mist pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-sage">Search, filter, and browse every cocktail</p>
              <Link
                href="/cocktails"
                onClick={controller.closeMenu}
                className="inline-flex items-center text-sm font-semibold text-forest transition-colors hover:text-terracotta"
              >
                Browse the full library
                <span className="ml-1.5" aria-hidden>
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </NavMegaShell>
  );
}
