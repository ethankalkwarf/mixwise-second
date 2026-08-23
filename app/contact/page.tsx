import { MainContainer } from "@/components/layout/MainContainer";
import { ContactForm } from "@/components/contact/ContactForm";
import { generatePageMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata = generatePageMetadata({
  title: "Contact",
  description:
    "Get in touch with MixWise. Questions, feedback, or partnership ideas — we'd like to hear from you.",
  path: "/contact",
});

const TOPIC_PREFIX: Record<string, string> = {
  distillery:
    "Partnership inquiry (distillery):\n\n",
  creator: "Partnership inquiry (content creator):\n\n",
  press: "Press inquiry:\n\n",
  partners: "Partnership inquiry:\n\n",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams?: Promise<{ topic?: string }>;
}) {
  const params = (await searchParams) || {};
  const topic = params.topic?.toLowerCase();
  const defaultMessage = topic ? TOPIC_PREFIX[topic] ?? "" : "";

  return (
    <div className="min-h-screen bg-cream py-12 sm:py-16">
      <MainContainer>
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 font-display text-3xl font-bold text-forest sm:text-4xl lg:text-5xl">
              Contact Us
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-sage">
              Questions, feedback, or something we should add to the bar? Send a
              note and we&apos;ll get back to you.
            </p>
          </div>

          <div className="rounded-3xl border border-mist bg-white p-8 shadow-soft sm:p-12">
            <ContactForm defaultMessage={defaultMessage} />
          </div>
        </div>
      </MainContainer>
    </div>
  );
}
