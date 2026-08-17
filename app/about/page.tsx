import { WebPageSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import { generatePageMetadata, SITE_CONFIG } from "@/lib/seo";
import { AboutPageContent } from "@/components/about/AboutPageContent";

export const metadata = generatePageMetadata({
  title: "About",
  description:
    "MixWise helps you make better drinks at home. Browse curated recipes, mix with what you have, keep tasting notes, and skip drinks you won't remake.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <WebPageSchema
        title="About MixWise"
        description="MixWise helps you make better drinks at home. Browse curated recipes, mix with what you have, keep tasting notes, and skip drinks you won't remake."
        url={`${SITE_CONFIG.url}/about`}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "About", url: `${SITE_CONFIG.url}/about` },
        ]}
      />
      <AboutPageContent />
    </>
  );
}
