import { WebPageSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import { generatePageMetadata, SITE_CONFIG } from "@/lib/seo";
import { AboutPageContent } from "@/components/about/AboutPageContent";

export const metadata = generatePageMetadata({
  title: "About",
  description:
    "MixWise helps everyone make better cocktails at home. Learn the craft, match drinks to your cabinet, follow friends who pour, and build a bar memory worth keeping.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <WebPageSchema
        title="About MixWise"
        description="MixWise helps everyone make better cocktails at home. Learn the craft, match drinks to your cabinet, follow friends who pour, and build a bar memory worth keeping."
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
