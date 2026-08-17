import Image from "next/image";
import Link from "next/link";
import { formatCocktailName } from "@/lib/formatters";
import { COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";
import { EmptyGlassMark } from "./EmptyGlassMark";

type DailySuggestion = {
  slug: string;
  name: string;
  imageUrl: string | null;
};

const DESTINATIONS = [
  { href: "/cocktails", label: "Recipes" },
  { href: "/mix", label: "Your cabinet" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/occasions", label: "Occasions" },
];

export function NotFoundView({ suggestion }: { suggestion: DailySuggestion | null }) {
  const drinkName = suggestion ? formatCocktailName(suggestion.name) : null;

  return (
    <section className="relative isolate flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden bg-charcoal">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 18% 12%, rgba(188,90,69,0.16), transparent 42%), radial-gradient(ellipse at 88% 78%, rgba(138,154,91,0.14), transparent 46%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <p className="sr-only">Page not found</p>

        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="relative mx-auto flex w-full max-w-md flex-col items-center lg:max-w-none">
            <p
              className="font-display text-6xl leading-none tracking-tight text-cream sm:text-7xl lg:text-8xl"
              aria-hidden
            >
              4<span className="italic text-terracotta">0</span>4
            </p>
            <div className="relative -mt-2 w-64 motion-safe:animate-float sm:w-72 lg:w-80">
              <EmptyGlassMark className="h-auto w-full drop-shadow-[0_28px_48px_rgba(0,0,0,0.4)]" />
            </div>
          </div>

          <div className="text-left">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
              404 · empty glass
            </p>
            <h1 className="mt-3 max-w-xl [text-wrap:balance] font-display text-4xl font-semibold leading-[1.08] tracking-tight text-cream sm:text-5xl lg:text-6xl">
              This one&apos;s off the{" "}
              <span className="italic text-terracotta">menu</span>.
            </h1>
            <p className="mt-5 max-w-md [text-wrap:pretty] text-[15px] leading-relaxed text-mist sm:text-base">
              We checked the well, the back bar, and under the Hawthorne.
              This page isn&apos;t pouring tonight — it may have never made the
              list.
            </p>

            <aside
              className="mt-6 max-w-sm rounded-2xl border border-cream/15 bg-cream/[0.06] p-4 sm:p-5"
              aria-label="A recipe for a missing page"
            >
              <p className="font-display text-xl text-cream">The 404</p>
              <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-terracotta">
                Off-menu · serves none
              </p>
              <dl className="mt-4 space-y-1.5 font-mono text-[13px] leading-relaxed text-mist/90">
                <div className="flex gap-4">
                  <dt className="w-12 shrink-0 text-cream/50">2 oz</dt>
                  <dd>silence</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-12 shrink-0 text-cream/50">¾ oz</dt>
                  <dd>a URL that wandered off</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-12 shrink-0 text-cream/50">1 dash</dt>
                  <dd>wrong turn</dd>
                </div>
              </dl>
              <p className="mt-4 border-t border-cream/10 pt-3 text-sm leading-relaxed text-mist/80">
                Shake hard. Strain into the void. Garnish with a recipe that
                actually exists.
              </p>
            </aside>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/cocktails"
                className="inline-flex items-center justify-center rounded-full bg-terracotta px-7 py-3 text-sm font-medium text-cream transition-colors hover:bg-terracotta-dark"
              >
                Browse recipes
              </Link>
              <Link
                href="/mix"
                className="inline-flex items-center justify-center rounded-full border-2 border-cream/80 px-7 py-3 text-sm font-medium text-cream transition-colors hover:bg-cream hover:text-forest"
              >
                Open your cabinet
              </Link>
            </div>

            {suggestion && drinkName ? (
              <Link
                href={`/cocktails/${suggestion.slug}`}
                className="group mt-6 flex max-w-sm items-center gap-4 rounded-2xl border border-cream/15 bg-cream/[0.06] p-2 pr-4 transition-colors hover:border-cream/30 hover:bg-cream/[0.1]"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-mist/20">
                  {suggestion.imageUrl ? (
                    <Image
                      src={suggestion.imageUrl}
                      alt=""
                      fill
                      sizes="64px"
                      placeholder="blur"
                      blurDataURL={COCKTAIL_BLUR_DATA_URL}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-mist/10 text-[10px] font-mono uppercase tracking-widest text-mist/60">
                      Pour
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-terracotta">
                    Bartender&apos;s suggestion
                  </p>
                  <p className="truncate font-display text-lg text-cream group-hover:text-terracotta">
                    {drinkName}
                  </p>
                  <p className="text-xs text-mist/70">Tonight&apos;s drink, still on the list.</p>
                </div>
              </Link>
            ) : null}

            <nav
              aria-label="Other places to look"
              className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-mist/70"
            >
              {DESTINATIONS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="underline-offset-4 transition-colors hover:text-cream hover:underline"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/"
                className="underline-offset-4 transition-colors hover:text-cream hover:underline"
              >
                Home
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
