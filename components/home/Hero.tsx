"use client";

import Link from "next/link";
import Image from "next/image";

interface HeroProps {
  title: string;
  subtitle: string;
}

export function Hero({ title, subtitle }: HeroProps) {
  return (
    <section className="bg-cream pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24 xl:pt-20 xl:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Green hero container */}
        <div className="relative bg-mist border border-mist rounded-3xl p-6 sm:p-10 lg:p-14 shadow-soft overflow-hidden">
          
          <div className="relative flex flex-col xl:flex-row gap-8 xl:gap-16 items-center">
            {/* Content */}
            <div className="flex-1 text-center xl:text-left max-w-2xl xl:max-w-none">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold text-forest leading-tight mb-6 tracking-tight">
                Find Your<br className="hidden xl:block" />
                <span className="xl:hidden"> </span>
                <span className="italic text-olive">Next Favorite</span> Cocktail
              </h1>
              <p className="text-base sm:text-lg xl:text-xl text-sage leading-relaxed mb-8 max-w-xl mx-auto xl:mx-0">
                {subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center xl:justify-start">
                <Link
                  href="/mix"
                  className="inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-medium bg-terracotta text-cream hover:bg-terracotta-dark transition-all duration-300 shadow-terracotta hover:shadow-terracotta"
                >
                  Discover Your Perfect Drink
                </Link>
                <Link
                  href="/cocktails"
                  className="inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-medium border-2 border-forest text-forest hover:bg-forest hover:text-cream transition-all duration-300"
                >
                  Browse All Recipes
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="flex-shrink-0 w-full max-w-sm xl:max-w-lg 2xl:max-w-xl">
              <div className="relative">
                <Image
                  src="https://usgsomofsav4obpi.public.blob.vercel-storage.com/Gemini_Generated_Image_mqk0vymqk0vymqk0.png"
                  alt="Cocktail preparation with fresh ingredients"
                  width={600}
                  height={480}
                  className="rounded-3xl shadow-card w-full h-auto object-cover"
                  priority
                />
                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 bg-white text-charcoal rounded-full px-5 py-3 text-sm font-medium shadow-card border border-mist">
                  ✨ 190+ Cocktail Recipes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
