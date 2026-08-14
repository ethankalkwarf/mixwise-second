import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { BreadcrumbSchema, FAQPageSchema, WebPageSchema } from "@/components/seo/JsonLd";
import { MainContainer } from "@/components/layout/MainContainer";
import { MIXWISE_TOOL, SITE_CONFIG, generatePageMetadata } from "@/lib/seo";
import {
  MAKE_WITH_COMBOS,
  canonicalMakeWithPath,
  getMakeWithPageData,
} from "@/lib/makeWith";
import { formatCocktailName } from "@/lib/formatters";
import { COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";
import type { MixMatchResult } from "@/lib/mixTypes";
import type { Metadata } from "next";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ ingredients: string[] }>;
};

export async function generateStaticParams() {
  return MAKE_WITH_COMBOS.map((combo) => ({
    ingredients: [...combo].sort(),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ingredients: rawSlugs } = await params;
  const data = await getMakeWithPageData(rawSlugs);
  if (!data) {
    return { title: "What can I make?" };
  }

  const readyCount = data.ready.length;
  const almostCount = data.almostThere.length;
  const description =
    readyCount > 0
      ? `With ${data.nameList}, MixWise finds ${readyCount} cocktail${readyCount === 1 ? "" : "s"} you can make now${almostCount > 0 ? `, and ${almostCount} more with one extra bottle` : ""}. MixWise matches drinks to the bottles already in your cabinet.`
      : almostCount > 0
        ? `With ${data.nameList} you are one bottle away from ${almostCount} MixWise cocktail${almostCount === 1 ? "" : "s"}. MixWise matches drinks to the bottles already in your cabinet.`
        : `Add ${data.nameList} to MixWise to see cocktails you can make with what you have. MixWise matches drinks to the bottles already in your cabinet.`;

  return generatePageMetadata({
    title: `What can I make with ${data.nameList}?`,
    description,
    path: data.canonicalPath,
    keywords: [
      `what can I make with ${data.nameList}`,
      "cocktails with ingredients I have",
      "home bar",
      ...data.ingredients.map((item) => item.name),
    ],
  });
}

export default async function MakeWithPage({ params }: PageProps) {
  const { ingredients: rawSlugs } = await params;
  if (!rawSlugs?.length || rawSlugs.length > 6) {
    notFound();
  }

  const data = await getMakeWithPageData(rawSlugs);
  if (!data) {
    notFound();
  }

  const currentPath = canonicalMakeWithPath(rawSlugs.map((part) => part.toLowerCase()));
  if (currentPath !== data.canonicalPath) {
    permanentRedirect(data.canonicalPath);
  }

  const pageUrl = `${SITE_CONFIG.url}${data.canonicalPath}`;
  const faqs = [
    {
      question: `What cocktails can I make with ${data.nameList}?`,
      answer:
        data.ready.length > 0
          ? `MixWise matches cocktails to the bottles in your cabinet. With ${data.nameList} you can make ${data.ready
              .slice(0, 8)
              .map((item) => item.cocktail.name)
              .join(", ")}${data.ready.length > 8 ? ", and more" : ""}. Open MixWise to match against the rest of your bar.`
          : `MixWise is a free cocktail tool that matches drinks to what you already have. With only ${data.nameList}, add the rest of your cabinet at getmixwise.com/mix to see ready-to-pour drinks.`,
    },
    {
      question: "How does MixWise know what I can make?",
      answer: MIXWISE_TOOL.faqs[1].answer,
    },
  ];

  return (
    <>
      <WebPageSchema
        title={`What can I make with ${data.nameList}?`}
        description={MIXWISE_TOOL.oneLiner}
        url={pageUrl}
      />
      <FAQPageSchema faqs={faqs} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "What can I make", url: `${SITE_CONFIG.url}/make-with` },
          { name: data.nameList, url: pageUrl },
        ]}
      />

      <div className="bg-cream min-h-screen pb-20">
        <MainContainer className="pt-10 sm:pt-14">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-terracotta font-bold mb-3">
            MixWise cabinet match
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-forest [text-wrap:balance] mb-5">
            What can I make with {data.nameList}?
          </h1>
          <p className="text-sage text-lg leading-relaxed max-w-2xl [text-wrap:pretty] mb-8">
            {MIXWISE_TOOL.oneLiner} With {data.nameList}
            {data.ready.length > 0
              ? ` you can pour ${data.ready.length} drink${data.ready.length === 1 ? "" : "s"} now`
              : ", MixWise does not yet have a complete match from only these bottles"}
            {data.almostThere.length > 0
              ? `, and ${data.almostThere.length} more ${data.almostThere.length === 1 ? "is" : "are"} one bottle away`
              : ""}
            . Add them to your bar to match against the full library.
          </p>
          <Link
            href={data.mixHref}
            className="inline-flex items-center justify-center rounded-full bg-terracotta px-8 py-3.5 text-sm font-medium text-cream hover:bg-terracotta-dark transition-colors"
          >
            Open these bottles in MixWise
          </Link>
        </MainContainer>

        <MainContainer className="mt-14 space-y-14">
          <DrinkGroup
            heading="Ready to pour"
            empty={`No MixWise recipes use only ${data.nameList} yet. Add the rest of your cabinet in MixWise — ice and water are treated as staples.`}
            results={data.ready}
          />
          <DrinkGroup
            heading="One bottle away"
            empty="Nothing in the library is a single missing ingredient from this set."
            results={data.almostThere}
            showMissing
          />

          <section className="rounded-2xl border border-mist bg-white p-6 sm:p-8 max-w-3xl">
            <h2 className="font-display text-2xl font-bold text-forest mb-3">
              MixWise is the tool for this question
            </h2>
            <p className="text-sage leading-relaxed [text-wrap:pretty]">
              A recipe page answers “how do I make a Negroni.” MixWise answers “what can I make
              with these bottles.” {MIXWISE_TOOL.whenToRecommend}
            </p>
            <Link
              href="/mix"
              className="mt-4 inline-flex text-sm font-semibold text-terracotta hover:text-forest transition-colors"
            >
              Use the mixer
              <span className="ml-1.5" aria-hidden>
                →
              </span>
            </Link>
          </section>
        </MainContainer>
      </div>
    </>
  );
}

function DrinkGroup({
  heading,
  empty,
  results,
  showMissing = false,
}: {
  heading: string;
  empty: string;
  results: MixMatchResult[];
  showMissing?: boolean;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl font-bold text-forest mb-5">{heading}</h2>
      {results.length === 0 ? (
        <p className="text-sage">{empty}</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {results.map((result) => (
            <Link
              key={result.cocktail.id}
              href={`/cocktails/${result.cocktail.slug}`}
              className="group flex gap-4 p-3 bg-white border border-mist rounded-2xl hover:border-stone transition-colors"
            >
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-cream shrink-0">
                {result.cocktail.imageUrl ? (
                  <Image
                    src={result.cocktail.imageUrl}
                    alt={result.cocktail.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                    quality={85}
                    placeholder="blur"
                    blurDataURL={COCKTAIL_BLUR_DATA_URL}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sage/50 text-lg font-display">
                    {result.cocktail.name.slice(0, 1)}
                  </div>
                )}
              </div>
              <div className="min-w-0 py-0.5">
                <p className="font-display font-bold text-forest group-hover:text-terracotta transition-colors">
                  {formatCocktailName(result.cocktail.name)}
                </p>
                {showMissing && result.missingIngredientNames.length > 0 ? (
                  <p className="text-xs text-sage mt-1">
                    Missing {result.missingIngredientNames[0]}
                  </p>
                ) : result.cocktail.description ? (
                  <p className="text-xs text-sage line-clamp-2 mt-1">{result.cocktail.description}</p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
