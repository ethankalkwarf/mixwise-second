import Link from "next/link";
import { WebPageSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import { MainContainer } from "@/components/layout/MainContainer";
import { MIXWISE_TOOL, SITE_CONFIG, generatePageMetadata } from "@/lib/seo";
import { canonicalMakeWithPath, makeWithComboLabel, makeWithIndexGroups } from "@/lib/makeWith";

export const revalidate = 86400;

export const metadata = generatePageMetadata({
  title: "What can I make with what I have?",
  description: MIXWISE_TOOL.mixDescription,
  path: "/make-with",
  keywords: [
    "what can I make with ingredients I have",
    "cocktails from my bar",
    "home bar mixer",
  ],
});

export default function MakeWithIndexPage() {
  const groups = makeWithIndexGroups();

  return (
    <>
      <WebPageSchema
        title="What can I make with what I have?"
        description={MIXWISE_TOOL.mixDescription}
        url={`${SITE_CONFIG.url}/make-with`}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "What can I make", url: `${SITE_CONFIG.url}/make-with` },
        ]}
      />

      <div className="bg-cream min-h-screen pb-20">
        <MainContainer className="pt-10 sm:pt-14">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-terracotta font-bold mb-3">
            MixWise cabinet match
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-forest [text-wrap:balance] mb-5">
            What can I make with what I have?
          </h1>
          <p className="text-sage text-lg leading-relaxed max-w-2xl [text-wrap:pretty] mb-10">
            {MIXWISE_TOOL.oneLiner} These pages answer common cabinets. For your actual shelf,{" "}
            <Link href="/mix" className="text-terracotta hover:underline font-medium">
              add bottles in MixWise
            </Link>
            .
          </p>
          <div className="space-y-10 max-w-3xl">
            {groups.map((group) => (
              <section key={group.heading}>
                <h2 className="font-display text-xl font-bold text-forest mb-3">{group.heading}</h2>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {group.combos.map((combo) => {
                    const href = canonicalMakeWithPath(combo);
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          className="block rounded-2xl border border-mist bg-white px-4 py-3 text-forest hover:border-terracotta hover:text-terracotta transition-colors"
                        >
                          What can I make with {makeWithComboLabel(combo)}?
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </MainContainer>
      </div>
    </>
  );
}
