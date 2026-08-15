import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { IngredientActions } from "@/components/ingredients/IngredientActions";
import { MainContainer } from "@/components/layout/MainContainer";
import { formatCocktailName, isNewCocktail } from "@/lib/formatters";
import type { IngredientGuide } from "@/lib/ingredientContent/types";
import type { IngredientDetail } from "@/lib/ingredientTypes";
import { cocktailBrowseHref, type IngredientWayfinder } from "@/lib/ingredientTaxonomy";
import { ingredientHeadings } from "@/lib/ingredientContent";
import { getIngredientOriginCover } from "@/lib/ingredientHeroes";
import { COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";
import { MixWiseToolCallout } from "@/components/seo/MixWiseToolCallout";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

type Props = {
  ingredient: IngredientDetail;
  guide: IngredientGuide;
  wayfinder: IngredientWayfinder;
};

const DRINKS_SHOWN = 6;

function splitLeadingSentence(text: string): [string, string] {
  const match = text.match(/^(.+?[.!?])(?:\s+|$)([\s\S]*)$/);
  if (!match) return [text, ""];
  return [match[1], match[2]];
}

function Prose({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/).map((part) => part.trim()).filter(Boolean);

  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph, index) => {
        if (index === 0) {
          const [lead, rest] = splitLeadingSentence(paragraph);
          return (
            <p key={`${paragraph.slice(0, 32)}-${paragraph.length}`} className="leading-relaxed [text-wrap:pretty]">
              <strong className="font-semibold text-charcoal">{lead}</strong>
              {rest ? <span className="text-sage"> {rest}</span> : null}
            </p>
          );
        }
        return (
          <p
            key={`${paragraph.slice(0, 32)}-${paragraph.length}`}
            className="text-sage leading-relaxed [text-wrap:pretty]"
          >
            {paragraph}
          </p>
        );
      })}
    </div>
  );
}

function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl font-bold text-forest">{heading}</h2>
      {typeof children === "string" ? <Prose text={children} /> : children}
    </section>
  );
}

export function IngredientGuideView({ ingredient, guide, wayfinder }: Props) {
  const mixHref = `/mix?have=${encodeURIComponent(ingredient.slug)}`;
  const browseHref = cocktailBrowseHref(ingredient);
  const headings = ingredientHeadings(ingredient.name);
  const origin = getIngredientOriginCover(ingredient.slug);
  const cocktailCover = ingredient.cocktails.find((cocktail) => cocktail.imageUrl);
  const cover = origin
    ? { src: origin.src, alt: origin.alt }
    : cocktailCover?.imageUrl
      ? { src: cocktailCover.imageUrl, alt: `${cocktailCover.name} cocktail made with ${ingredient.name}` }
      : null;
  const preview = ingredient.cocktails.slice(0, DRINKS_SHOWN);
  const remaining = Math.max(0, ingredient.cocktails.length - preview.length);

  return (
    <div>
      <section className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[16rem] overflow-hidden bg-cream lg:h-[22rem]">
          {cover ? (
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_35%]"
              quality={75}
              placeholder="blur"
              blurDataURL={COCKTAIL_BLUR_DATA_URL}
            />
          ) : (
            <div className="absolute inset-0 bg-hero-pattern" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/80 to-cream/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/25 to-transparent" />
        </div>

        <MainContainer className="relative h-auto md:h-[22rem]">
          <div className="grid h-full items-end gap-4 pt-5 pb-5 md:grid-cols-12 md:items-stretch md:gap-6 md:pt-0 md:pb-8">
            <div className="flex min-w-0 flex-col justify-end md:col-span-7">
              <nav
                aria-label="Breadcrumb"
                className="mb-3 flex items-center gap-1.5 text-sm lg:mb-4"
              >
                <Link
                  href="/ingredients"
                  className="font-semibold text-forest hover:text-terracotta transition-colors"
                >
                  Ingredients
                </Link>
                <ChevronRightIcon className="hidden h-4 w-4 shrink-0 text-sage/70 sm:block" />
                <Link
                  href={`/ingredients#${wayfinder.sectionId}`}
                  className="hidden text-sage hover:text-terracotta transition-colors sm:inline"
                >
                  {wayfinder.sectionTitle}
                </Link>
                <ChevronRightIcon className="h-4 w-4 shrink-0 text-sage/70" />
                <span className="truncate font-medium text-charcoal">{ingredient.name}</span>
              </nav>

              <div className="flex items-end gap-4">
                <h1 className="min-w-0 flex-1 font-display text-3xl font-bold leading-tight text-forest [text-wrap:balance] sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                  {headings.h1}
                </h1>
                <div className="relative h-28 w-20 shrink-0 md:hidden">
                  {ingredient.heroImageUrl ? (
                    <Image
                      src={ingredient.heroImageUrl}
                      alt={ingredient.heroImageAlt}
                      fill
                      sizes="80px"
                      className="object-contain object-bottom drop-shadow-lg mix-blend-multiply"
                      quality={85}
                    />
                  ) : null}
                </div>
              </div>
              <p className="mt-2 max-w-xl text-base leading-relaxed text-charcoal/80 [text-wrap:pretty] sm:mt-3 sm:text-lg">
                {guide.dek}
              </p>
              {guide.alsoCalled && <p className="mt-2 text-sm text-sage/80">{guide.alsoCalled}</p>}
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-sage sm:mt-4">
                {guide.abv && (
                  <span className="rounded-full border border-mist bg-white/80 px-2.5 py-1 backdrop-blur-sm">
                    {guide.abv} ABV
                  </span>
                )}
                {ingredient.cocktailCount > 0 ? (
                  <a
                    href="#cocktails"
                    className="rounded-full border border-mist bg-white/80 px-2.5 py-1 backdrop-blur-sm transition-colors hover:border-terracotta/40 hover:text-terracotta"
                  >
                    Used in {ingredient.cocktailCount} cocktail{ingredient.cocktailCount === 1 ? "" : "s"}
                  </a>
                ) : (
                  <span className="rounded-full border border-mist bg-white/80 px-2.5 py-1 backdrop-blur-sm">
                    No matched cocktails yet
                  </span>
                )}
              </div>
            </div>

            <div className="relative hidden h-full overflow-visible md:col-span-5 md:block">
              <div className="absolute right-0 top-6 h-[28rem] w-[20rem]">
                <div className="absolute inset-x-2 bottom-0 top-12 bg-[radial-gradient(ellipse_at_bottom,_rgba(249,247,242,0.92)_30%,_transparent_70%)]" />
                {ingredient.heroImageUrl ? (
                  <Image
                    src={ingredient.heroImageUrl}
                    alt={ingredient.heroImageAlt}
                    fill
                    sizes="320px"
                    className="object-contain object-bottom drop-shadow-2xl mix-blend-multiply"
                    quality={90}
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-end justify-center pb-8 font-display text-xl text-sage">
                    {ingredient.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </MainContainer>
      </section>

      <MainContainer className="pt-4 pb-16 md:pt-24">
        <div className="grid gap-8 md:grid-cols-12 md:gap-14">
          <aside className="md:col-span-4">
            <div className="max-w-sm space-y-4 md:sticky md:top-24">
              <IngredientActions
                mixHref={mixHref}
                ingredient={{
                  id: ingredient.id,
                  name: ingredient.name,
                  type: ingredient.type,
                }}
              />
            </div>
          </aside>

          <div className="md:col-span-8 space-y-10">
            <Section heading={headings.what}>{guide.whatItIs}</Section>
            <Section heading={headings.taste}>{guide.tastingNotes}</Section>
            <Section heading={headings.history}>{guide.history}</Section>
            <Section heading={headings.use}>{guide.howToUse}</Section>
            {guide.funFact && (
              <div className="border-l-2 border-terracotta/60 pl-5 py-1">
                <h2 className="font-display text-lg font-bold text-forest mb-2">Note</h2>
                <Prose text={guide.funFact} />
              </div>
            )}

            {(ingredient.related ?? []).length > 0 && (
              <section className="space-y-4">
                <h2 className="font-display text-2xl font-bold text-forest">{headings.pairs}</h2>
                <div className="flex flex-wrap gap-2">
                  {(ingredient.related ?? []).map((item) => (
                    <Link
                      key={item.id}
                      href={`/ingredients/${item.slug}`}
                      className="px-3 py-2 rounded-full bg-white border border-mist text-sm text-forest hover:border-terracotta hover:text-terracotta transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section id="cocktails" className="space-y-5 scroll-mt-28">
              <div>
                <h2 className="font-display text-2xl font-bold text-forest">
                  {headings.drinks}
                </h2>
                <p className="text-sage mt-2">
                  {ingredient.cocktails.length > 0
                    ? remaining > 0
                      ? `A few of the ${ingredient.cocktails.length} MixWise recipes that call for it.`
                      : "Recipes in the MixWise library whose specs call for this ingredient."
                    : "No matched recipes yet. Adding it to your bar still lets Mix use it as you stock more."}
                </p>
              </div>

              {preview.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {preview.map((cocktail) => (
                    <Link
                      key={cocktail.id}
                      href={`/cocktails/${cocktail.slug}`}
                      className="group flex gap-3 p-2.5 sm:gap-4 sm:p-3 bg-white border border-mist rounded-2xl hover:border-stone transition-colors"
                    >
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-cream shrink-0">
                        {cocktail.imageUrl ? (
                          <Image
                            src={cocktail.imageUrl}
                            alt={cocktail.imageAlt || cocktail.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                            quality={85}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sage/50 text-lg font-display">
                            {cocktail.name.slice(0, 1)}
                          </div>
                        )}
                        {isNewCocktail(cocktail.createdAt) && (
                          <span className="absolute top-1 left-1 bg-terracotta text-cream text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 py-0.5">
                        {cocktail.primarySpirit && (
                          <p className="text-[10px] uppercase tracking-widest text-terracotta font-semibold mb-1">
                            {cocktail.primarySpirit}
                          </p>
                        )}
                        <p className="font-display font-bold text-forest group-hover:text-terracotta transition-colors">
                          {formatCocktailName(cocktail.name)}
                        </p>
                        {cocktail.shortDescription && (
                          <p className="text-xs text-sage line-clamp-2 mt-1">{cocktail.shortDescription}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}

              {ingredient.cocktails.length > 0 && (
                <Link
                  href={browseHref}
                  className="inline-flex items-center text-sm font-semibold text-terracotta hover:text-forest transition-colors"
                >
                  {remaining > 0
                    ? `Browse all ${ingredient.cocktailCount} ${ingredient.name} cocktails`
                    : `Browse ${ingredient.name} cocktails`}
                  <span className="ml-1.5" aria-hidden>
                    →
                  </span>
                </Link>
              )}

              <MixWiseToolCallout
                ingredientName={ingredient.name}
                mixHref={mixHref}
                className="mt-2"
              />
            </section>

            {(wayfinder.prev || wayfinder.next) && (
              <nav
                aria-label="More ingredients"
                className="flex items-center justify-between gap-4 pt-8 border-t border-mist text-sm"
              >
                {wayfinder.prev ? (
                  <Link
                    href={`/ingredients/${wayfinder.prev.slug}`}
                    className="text-sage hover:text-terracotta transition-colors"
                  >
                    ← {wayfinder.prev.name}
                  </Link>
                ) : (
                  <span />
                )}
                <Link
                  href={`/ingredients#${wayfinder.sectionId}`}
                  className="hidden sm:inline text-sage/80 hover:text-forest transition-colors"
                >
                  {wayfinder.sectionTitle}
                </Link>
                {wayfinder.next ? (
                  <Link
                    href={`/ingredients/${wayfinder.next.slug}`}
                    className="text-sage hover:text-terracotta transition-colors"
                  >
                    {wayfinder.next.name} →
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </div>
        </div>
      </MainContainer>
    </div>
  );
}
