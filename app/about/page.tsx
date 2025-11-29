import { sanityClient } from "@/lib/sanityClient";
import { MainContainer } from "@/components/layout/MainContainer";
import { PortableText } from "@/components/PortableText";

export const revalidate = 60;

export default async function AboutPage() {
  const page = await sanityClient.fetch(
    `*[_type == "page" && slug.current == "about"][0]{title, body}`
  );

  return (
    <div className="py-10">
      <MainContainer>
        <h1 className="text-3xl font-serif font-bold text-slate-50 mb-4">
          {page?.title || "About this instance"}
        </h1>
        <PortableText value={page?.body} />
      </MainContainer>
    </div>
  );
}
