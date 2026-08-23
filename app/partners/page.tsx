import { WebPageSchema, BreadcrumbSchema, FAQPageSchema } from "@/components/seo/JsonLd";
import { PartnersPageContent } from "@/components/partners/PartnersPageContent";
import { PARTNERS_FAQ } from "@/lib/partners";
import { generatePageMetadata, SITE_CONFIG } from "@/lib/seo";

const PARTNERS_DESCRIPTION =
  "Partner with MixWise: collaborations for distilleries, cocktail content creators, and press covering home mixology. Cabinet matching, curated recipes, Learn paths, and logos at getmixwise.com/brand/logos.";

export const metadata = generatePageMetadata({
  title: "Partners",
  description: PARTNERS_DESCRIPTION,
  path: "/partners",
  keywords: [
    "MixWise partners",
    "cocktail app partnership",
    "distillery marketing",
    "home mixology",
    "cocktail content creator",
    "press kit",
    "getmixwise.com partners",
  ],
});

export default function PartnersPage() {
  return (
    <>
      <WebPageSchema
        title="Partners"
        description={PARTNERS_DESCRIPTION}
        url={`${SITE_CONFIG.url}/partners`}
      />
      <FAQPageSchema faqs={[...PARTNERS_FAQ]} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Partners", url: `${SITE_CONFIG.url}/partners` },
        ]}
      />
      <PartnersPageContent />
    </>
  );
}
