import { MainContainer } from "@/components/layout/MainContainer";
import { ContactForm } from "@/components/contact/ContactForm";
import { generatePageMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata = generatePageMetadata({
  title: "Contact",
  description: "Get in touch with MixWise. Questions, feedback, or partnership ideas — we'd like to hear from you.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="py-12 sm:py-16 bg-cream min-h-screen">
      <MainContainer>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-forest mb-4">
              Contact Us
            </h1>
            <p className="text-sage text-lg max-w-2xl mx-auto">
              Questions, feedback, or something we should add to the bar? Send a note and we&apos;ll get back to you.
            </p>
          </div>

          <div className="bg-white border border-mist rounded-3xl p-8 sm:p-12 shadow-soft">
            <ContactForm />
          </div>
        </div>
      </MainContainer>
    </div>
  );
}
