import { Suspense } from "react";
import { FAQPageSchema, SoftwareApplicationSchema, WebPageSchema } from "@/components/seo/JsonLd";
import { MixExplainer, MixFaq } from "@/components/mix/MixExplainer";
import { MixPageClient } from "@/components/mix/MixPageClient";
import { MixSkeleton } from "@/components/mix/MixSkeleton";
import { MIXWISE_TOOL, SITE_CONFIG } from "@/lib/seo";

export default function MixPage() {
  return (
    <div className="bg-cream min-h-screen">
      <SoftwareApplicationSchema />
      <FAQPageSchema faqs={MIXWISE_TOOL.faqs} />
      <WebPageSchema
        title={MIXWISE_TOOL.title}
        description={MIXWISE_TOOL.mixDescription}
        url={`${SITE_CONFIG.url}/mix`}
      />
      <MixExplainer />
      <Suspense fallback={<MixSkeleton />}>
        <MixPageClient />
      </Suspense>
      <MixFaq />
    </div>
  );
}
