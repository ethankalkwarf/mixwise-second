"use client";

import Link from "next/link";
import { CopyTextButton } from "@/components/brand/CopyTextButton";
import { SectionEyebrow, SectionTitle } from "@/components/brand/brandSections";
import { MainContainer } from "@/components/layout/MainContainer";
import {
  APPROVED_ASSETS,
  BOILERPLATE,
  BRAND_KIT_ZIP,
  BRAND_VOICE,
  PRESS_VOICE_SUMMARY,
} from "@/lib/brand/kit";

const SURFACE_CLASS = {
  cream: "bg-cream",
  forest: "bg-forest",
  mist: "bg-mist",
  white: "bg-white",
} as const;

function BoilerplateBlock({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-mist bg-white p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-display text-xl text-forest">{title}</h3>
        <CopyTextButton text={body} />
      </div>
      <p className="whitespace-pre-line [text-wrap:pretty] text-sm leading-relaxed text-sage sm:text-base">
        {body}
      </p>
    </div>
  );
}

export function BrandLogosContent() {
  return (
    <div className="bg-cream pb-20 pt-10 sm:pt-14 lg:pb-28">
      <MainContainer className="max-w-5xl">
        <div className="mb-10 sm:mb-14">
          <p className="mb-4">
            <Link
              href="/about"
              className="text-xs text-sage underline decoration-mist underline-offset-4 transition-colors hover:text-forest"
            >
              About MixWise
            </Link>
          </p>
          <SectionEyebrow>Brand</SectionEyebrow>
          <h1 className="mb-3 [text-wrap:balance] font-display text-4xl leading-tight text-forest sm:text-5xl">
            Logos
          </h1>
          <p className="max-w-xl [text-wrap:pretty] text-lg leading-relaxed text-sage">
            Approved lockups, boilerplate, and naming for articles, listings,
            and partnerships.
          </p>
        </div>

        <section className="mb-16 sm:mb-20">
          <SectionEyebrow>Voice</SectionEyebrow>
          <p className="max-w-2xl [text-wrap:pretty] text-lg leading-relaxed text-sage">
            {PRESS_VOICE_SUMMARY}
          </p>
        </section>

        <section className="mb-16 sm:mb-20">
          <SectionEyebrow>Boilerplate</SectionEyebrow>
          <SectionTitle>Copy-ready blurbs</SectionTitle>
          <p className="mb-8 max-w-2xl [text-wrap:pretty] text-sage">
            Ready-to-use descriptions. Choose the length that fits your format.
          </p>
          <div className="space-y-4">
            <BoilerplateBlock title="One-liner" body={BOILERPLATE.oneLiner} />
            <BoilerplateBlock title="Short" body={BOILERPLATE.short} />
            <BoilerplateBlock title="Long" body={BOILERPLATE.long} />
          </div>
        </section>

        <section className="mb-16 sm:mb-20">
          <SectionEyebrow>Naming</SectionEyebrow>
          <SectionTitle>Product references</SectionTitle>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {Object.entries(BRAND_VOICE.naming).map(([key, value]) => (
              <div
                key={key}
                className="rounded-2xl border border-mist bg-white p-4 sm:p-5"
              >
                <dt className="font-mono text-[10px] font-bold uppercase tracking-widest text-terracotta">
                  {key}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-sage">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <SectionEyebrow>Downloads</SectionEyebrow>
          <SectionTitle>Logo files</SectionTitle>
          <p className="mb-6 max-w-2xl [text-wrap:pretty] text-sage">
            Approved lockups, app icon, and lime mark. SVG preferred; PNG
            included where helpful.
          </p>
          <a
            href={BRAND_KIT_ZIP}
            download
            className="mb-10 inline-flex items-center justify-center rounded-2xl bg-terracotta px-6 py-3 text-sm font-semibold text-cream shadow-lg shadow-terracotta/20 transition-colors hover:bg-terracotta-dark"
          >
            Download brand kit (ZIP)
          </a>

          <div className="grid gap-4 sm:grid-cols-2">
            {APPROVED_ASSETS.map((asset) => (
              <article
                key={asset.id}
                className="overflow-hidden rounded-2xl border border-mist bg-white"
              >
                <div
                  className={`flex h-36 items-center justify-center px-6 ${SURFACE_CLASS[asset.surface]}`}
                >
                  {asset.id === "lime-wheel" || asset.id === "app-icon" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.files[0].href}
                      alt=""
                      className={
                        asset.id === "app-icon"
                          ? "h-20 w-20 rounded-2xl shadow-soft"
                          : "h-16 w-16"
                      }
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.files[0].href}
                      alt=""
                      className="h-10 w-auto max-w-[min(100%,240px)] sm:h-11"
                    />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="mb-1 font-display text-xl text-forest">
                    {asset.name}
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-sage">
                    {asset.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {asset.files.map((file) => (
                      <a
                        key={file.href}
                        href={file.href}
                        download
                        className="rounded-xl border border-mist bg-cream px-3 py-1.5 text-xs font-semibold text-forest transition-colors hover:bg-mist/50"
                      >
                        {file.format}
                      </a>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </MainContainer>
    </div>
  );
}
