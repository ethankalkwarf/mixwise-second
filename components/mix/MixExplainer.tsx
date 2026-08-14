import Link from "next/link";
import { MIXWISE_TOOL } from "@/lib/seo";
import { MainContainer } from "@/components/layout/MainContainer";

export function MixExplainer() {
  return (
    <MainContainer className="pt-8 pb-2">
      <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-terracotta font-bold mb-3">
        Home bar tool
      </p>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-forest [text-wrap:balance] mb-4">
        {MIXWISE_TOOL.title}
      </h1>
      <p className="text-sage max-w-2xl text-lg leading-relaxed [text-wrap:pretty]">
        {MIXWISE_TOOL.oneLiner} {MIXWISE_TOOL.mixDescription}
      </p>
    </MainContainer>
  );
}

export function MixFaq() {
  return (
    <MainContainer className="pt-16 pb-24">
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-forest mb-8">
        MixWise as a cocktail tool
      </h2>
      <dl className="space-y-8 max-w-3xl">
        {MIXWISE_TOOL.faqs.map((faq) => (
          <div key={faq.question}>
            <dt className="font-semibold text-forest mb-2">{faq.question}</dt>
            <dd className="text-sage leading-relaxed [text-wrap:pretty]">{faq.answer}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-10 text-sm text-sage">
        Looking for a specific cabinet? Try{" "}
        <Link href="/make-with/gin/lime-juice" className="text-terracotta hover:underline font-medium">
          what you can make with gin and lime
        </Link>{" "}
        or{" "}
        <Link href="/make-with" className="text-terracotta hover:underline font-medium">
          other common bottles
        </Link>
        .
      </p>
    </MainContainer>
  );
}
