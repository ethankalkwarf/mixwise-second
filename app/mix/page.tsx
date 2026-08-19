import { Suspense } from "react";
import { FAQPageSchema, SoftwareApplicationSchema, WebPageSchema } from "@/components/seo/JsonLd";
import { MixExplainer, MixFaq } from "@/components/mix/MixExplainer";
import { MixPageClient } from "@/components/mix/MixPageClient";
import { MixSkeleton } from "@/components/mix/MixSkeleton";
import { NativeMixGate } from "@/components/mobile/NativeMixGate";
import { MIXWISE_TOOL, SITE_CONFIG } from "@/lib/seo";
import { isNativeAppRequest } from "@/lib/mobile/serverNative";

export default async function MixPage() {
  const native = await isNativeAppRequest();

  return (
    <div className="bg-cream min-h-screen">
      {!native ? (
        <>
          <SoftwareApplicationSchema />
          <FAQPageSchema faqs={MIXWISE_TOOL.faqs} />
          <WebPageSchema
            title={MIXWISE_TOOL.title}
            description={MIXWISE_TOOL.mixDescription}
            url={`${SITE_CONFIG.url}/mix`}
          />
        </>
      ) : null}
      {!native ? (
        <div data-web-mix-marketing>
          <NativeMixGate>
            <MixExplainer />
          </NativeMixGate>
        </div>
      ) : null}
      <Suspense fallback={<MixSkeleton />}>
        <MixPageClient />
      </Suspense>
      {!native ? (
        <div data-web-mix-marketing>
          <NativeMixGate>
            <MixFaq />
          </NativeMixGate>
        </div>
      ) : null}
    </div>
  );
}
