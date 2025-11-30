import { sanityClient } from "@/lib/sanityClient";
import { MainContainer } from "@/components/layout/MainContainer";
import { PortableText } from "@/components/PortableText";
import { WebPageSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import { generatePageMetadata, SITE_CONFIG } from "@/lib/seo";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 60;

// Default content if CMS is empty
const DEFAULT_CONTENT = {
  title: "About MixWise",
  subtitle: "A smarter way to make cocktails at home.",
  body: [
    {
      _type: "block",
      _key: "1",
      style: "normal",
      children: [
        {
          _type: "span",
          text: "MixWise is a cocktail platform designed to help people make better drinks at home. It provides curated recipes, clear instructions, high quality images, and simple tools that make cocktail discovery easy.",
        },
      ],
    },
    {
      _type: "block",
      _key: "2",
      style: "normal",
      children: [
        {
          _type: "span",
          text: "The platform focuses on clarity and accuracy. Each recipe includes exact measurements, proper glassware, garnish details, and straightforward instructions. Images follow a consistent visual style so users can quickly understand what a finished drink should look like.",
        },
      ],
    },
    {
      _type: "block",
      _key: "3",
      style: "normal",
      children: [
        {
          _type: "span",
          text: "MixWise also includes a growing library of educational content. The Education section covers fundamental topics such as cocktail families, syrups, shaking, stirring, and glassware. These guides help people understand core techniques and build confidence behind the bar.",
        },
      ],
    },
    {
      _type: "block",
      _key: "4",
      style: "normal",
      children: [
        {
          _type: "span",
          text: "The Mix tool allows users to select the ingredients they have and instantly see which cocktails match their home bar. This feature supports exploration, reduces waste, and encourages people to try new drinks without extra purchases.",
        },
      ],
    },
    {
      _type: "block",
      _key: "5",
      style: "normal",
      children: [
        {
          _type: "span",
          text: "MixWise continues to add new recipes, guides, and features that support anyone interested in improving their cocktail skills. The goal is to make cocktail learning simple, accessible, and enjoyable for every home bartender.",
        },
      ],
    },
  ],
};

export const metadata: Metadata = generatePageMetadata({
  title: "About",
  description: "MixWise is a cocktail platform designed to help people make better drinks at home. Curated recipes, clear instructions, and tools that make cocktail discovery easy.",
  path: "/about",
});

export default async function AboutPage() {
  // Try to fetch from CMS, fall back to default
  let page;
  try {
    page = await sanityClient.fetch(
      `*[_type == "page" && slug.current == "about"][0]{title, body}`
    );
  } catch (error) {
    console.error("Failed to fetch about page from CMS:", error);
  }

  const title = page?.title || DEFAULT_CONTENT.title;
  const body = page?.body || DEFAULT_CONTENT.body;

  return (
    <>
      {/* JSON-LD Structured Data */}
      <WebPageSchema
        title={title}
        description="Learn about MixWise, a cocktail platform designed to help people make better drinks at home."
        url={`${SITE_CONFIG.url}/about`}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "About", url: `${SITE_CONFIG.url}/about` },
        ]}
      />

      <div className="py-12 sm:py-16">
        <MainContainer>
          <article className="max-w-3xl mx-auto">
            {/* Header */}
            <header className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-50 mb-4">
                {title}
              </h1>
              <p className="text-xl text-lime-400 font-medium">
                {DEFAULT_CONTENT.subtitle}
              </p>
            </header>

            {/* Body Content */}
            <div className="prose prose-lg prose-invert prose-slate max-w-none mb-16">
              <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
                <PortableText value={body} />
              </div>
            </div>

            {/* Internal Links */}
            <section className="border-t border-slate-800 pt-12">
              <h2 className="text-2xl font-serif font-bold text-slate-100 mb-6 text-center">
                Get Started
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InternalLink
                  href="/cocktails"
                  title="Explore Cocktails"
                  description="Browse our collection of curated cocktail recipes"
                  emoji="🍸"
                />
                <InternalLink
                  href="/mix"
                  title="Try the Mix Tool"
                  description="Find drinks you can make with what you have"
                  emoji="🧪"
                />
              </div>
            </section>
          </article>
        </MainContainer>
      </div>
    </>
  );
}

function InternalLink({
  href,
  title,
  description,
  emoji,
}: {
  href: string;
  title: string;
  description: string;
  emoji: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-lime-500/30 hover:bg-slate-900/80 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
    >
      <span className="text-3xl flex-shrink-0" aria-hidden="true">
        {emoji}
      </span>
      <div>
        <h3 className="font-bold text-slate-100 group-hover:text-lime-400 transition-colors mb-1">
          {title}
        </h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </Link>
  );
}
