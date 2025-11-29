import { sanityClient } from "@/lib/sanityClient";
import { MainContainer } from "@/components/layout/MainContainer";
import { PortableText } from "@/components/PortableText";

export const revalidate = 60;

export default async function ContactPage() {
  const page = await sanityClient.fetch(
    `*[_type == "page" && slug.current == "contact"][0]{title, body}`
  );

  return (
    <div className="py-10">
      <MainContainer>
        <h1 className="text-3xl font-serif font-bold text-slate-50 mb-4">
          {page?.title || "Contact"}
        </h1>
        <PortableText value={page?.body} />
      </MainContainer>
    </div>
  );
}
