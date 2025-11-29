import { sanityClient } from "@/lib/sanityClient";
import { MainContainer } from "@/components/layout/MainContainer";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Button } from "@/components/common/Button";
import Link from "next/link";

export const revalidate = 60;

export default async function HomePage() {
  const settings = await sanityClient.fetch(
    `*[_type == "siteSettings"][0]{heroTitle, heroSubtitle}`
  );

  const heroTitle = settings?.heroTitle || "Your second MixWise instance.";
  const heroSubtitle =
    settings?.heroSubtitle ||
    "This instance is separate from your production site, so you can experiment freely.";

  return (
    <div className="py-10">
      <MainContainer>
        <section className="mb-12 grid gap-8 lg:grid-cols-[1.2fr_1fr] items-center">
          <div className="space-y-5">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-50">
              {heroTitle}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl">
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              <Link href="/mix">
                <Button>Go to Mix tool</Button>
              </Link>
            </div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Separate project • Safe to experiment
            </p>
          </div>

          <div className="rounded-2xl border border-lime-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-4 shadow-xl shadow-lime-500/10">
            <SectionHeader title="What is this?" />
            <p className="text-sm text-slate-200">
              This project is a clean Next.js + Sanity shell for a second MixWise instance.
              You can wire your existing Supabase schema and components into it without
              touching your live production app.
            </p>
          </div>
        </section>
      </MainContainer>
    </div>
  );
}
