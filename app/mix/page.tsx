import { Suspense } from "react";
import { FAQPageSchema, SoftwareApplicationSchema, WebPageSchema } from "@/components/seo/JsonLd";
import { MixMarketingChrome } from "@/components/mix/MixMarketingChrome";
import { MixPageClient } from "@/components/mix/MixPageClient";
import { MixSkeleton } from "@/components/mix/MixSkeleton";
import { MIXWISE_TOOL, SITE_CONFIG } from "@/lib/seo";
import { isNativeAppRequest } from "@/lib/mobile/serverNative";

export default async function MixPage() {
  const native = await isNativeAppRequest();

  return (
    <div
      className={`bg-cream min-h-screen ${native ? "" : "py-10"}`}
      data-native-mix-page
    >
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
          <MixMarketingChrome slot="top" />
        </div>
      ) : null}
      <Suspense fallback={<MixSkeleton />}>
        <MixPageClient forceNative={native} />
      </Suspense>
      {!native ? (
        <div data-web-mix-marketing>
          <MixMarketingChrome slot="bottom" />
        </div>
      ) : null}
    </div>
  );
}
