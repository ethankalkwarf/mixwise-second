import { sanityClient } from "@/lib/sanityClient";
import { MainContainer } from "@/components/layout/MainContainer";
import { PortableText } from "@/components/PortableText";
import { ContactForm } from "@/components/contact/ContactForm";

export const revalidate = 60;

export default async function ContactPage() {
  let page: { title?: string; body?: any } | null = null;
  
  try {
    page = await sanityClient.fetch(
      `*[_type == "page" && slug.current == "contact"][0]{title, body}`
    );
  } catch (error) {
    console.error("[Contact Page] Error fetching Sanity content:", error);
    // Continue with null page - we'll use default title
  }

  return (
    <div className="py-12 sm:py-16 bg-cream min-h-screen">
      <MainContainer>
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-forest mb-4">
              {page?.title || "Contact Us"}
            </h1>
            {page?.body && (
              <div className="text-sage text-lg max-w-2xl mx-auto">
                <PortableText value={page.body} />
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="bg-white border border-mist rounded-3xl p-8 sm:p-12 shadow-soft">
            <ContactForm />
          </div>
        </div>
      </MainContainer>
    </div>
  );
}
