import Link from "next/link";
import { WebPageHero } from "@/components/layout/WebPageHero";
import { MIXWISE_TOOL } from "@/lib/seo";
import { MainContainer } from "@/components/layout/MainContainer";

/** Full acquisition / SEO explainer for guests. */
export function MixExplainer() {
  return (
    <MainContainer className="pt-0">
      <WebPageHero
        eyebrow="Home bar tool"
        title={MIXWISE_TOOL.title}
        description={
          <>
            {MIXWISE_TOOL.oneLiner} {MIXWISE_TOOL.mixDescription}
          </>
        }
      />
    </MainContainer>
  );
}

export function MixFaq() {
  return (
    <MainContainer className="pt-6 pb-24">
      <h2 className="mb-8 font-display text-2xl font-bold text-forest sm:text-3xl">
        MixWise as a cocktail tool
      </h2>
      <dl className="max-w-3xl space-y-8">
        {MIXWISE_TOOL.faqs.map((faq) => (
          <div key={faq.question}>
            <dt className="mb-2 font-semibold text-forest">{faq.question}</dt>
            <dd className="leading-relaxed text-sage [text-wrap:pretty]">{faq.answer}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-10 text-sm text-sage">
        Looking for a specific cabinet? Try{" "}
        <Link href="/make-with/gin/lime-juice" className="font-medium text-terracotta hover:underline">
          what you can make with gin and lime
        </Link>{" "}
        or{" "}
        <Link href="/make-with" className="font-medium text-terracotta hover:underline">
          other common bottles
        </Link>
        .
      </p>
    </MainContainer>
  );
}
