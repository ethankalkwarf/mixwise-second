"use client";

import Link from "next/link";
import Image from "next/image";

interface HeroProps {
  title: string;
  subtitle: string;
}

export function Hero({ title, subtitle }: HeroProps) {
  return (
    <section className="bg-cream py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-mist rounded-[3rem] p-8 md:p-12 lg:p-20">
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-forest leading-tight mb-6">
                Discover Your{" "}
                <span className="text-[#6B8E63] italic">Next Favorite</span>{" "}
                Cocktail
              </h1>
              <p className="text-lg sm:text-xl text-charcoal leading-relaxed mb-8 max-w-2xl">
                {subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/mix"
                  className="inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-medium bg-terracotta text-cream hover:bg-terracotta-dark transition-all duration-300 shadow-terracotta"
                >
                  Open My Cabinet
                </Link>
                <Link
                  href="/cocktails"
                  className="inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-medium bg-white text-forest border border-mist hover:bg-mist/50 transition-all duration-300"
                >
                  Browse Cocktails
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="flex-1 relative">
              <div className="relative">
                <Image
                  src="https://usgsomofsav4obpi.public.blob.vercel-storage.com/Gemini_Generated_Image_mqk0vymqk0vymqk0.png"
                  alt="Cocktail preparation with fresh ingredients"
                  width={600}
                  height={500}
                  className="rounded-[2.5rem] shadow-2xl w-full h-auto object-cover"
                  priority
                />
                {/* Cocktail of the Day Badge */}
                <div className="absolute bottom-4 left-4 bg-cream text-charcoal rounded-full px-4 py-2 text-sm font-medium shadow-lg">
                  Cocktail of the Day
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


