"use client";

import Link from "next/link";
import Image from "next/image";

interface HeroProps {
  title: string;
  subtitle: string;
}

export function Hero({ title, subtitle }: HeroProps) {
  return (
    <section className="bg-cream py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Green hero container */}
        <div className="relative bg-mist border border-mist rounded-3xl p-6 sm:p-10 lg:p-14 shadow-soft overflow-hidden">
          
          <div className="relative flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-forest leading-tight mb-4">
                Find your next favorite cocktail
              </h1>
              <p className="text-base sm:text-lg text-sage leading-relaxed mb-6 max-w-xl mx-auto lg:mx-0">
                {subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  href="/mix"
                  className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium bg-terracotta text-cream hover:bg-terracotta-dark transition-all duration-300 shadow-terracotta"
                >
                  Discover Your Perfect Drink
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="flex-shrink-0 w-full max-w-sm lg:max-w-md">
              <div className="relative">
                <Image
                  src="https://usgsomofsav4obpi.public.blob.vercel-storage.com/Gemini_Generated_Image_mqk0vymqk0vymqk0.png"
                  alt="Cocktail preparation with fresh ingredients"
                  width={500}
                  height={400}
                  className="rounded-2xl shadow-card w-full h-auto object-cover"
                  priority
                />
                {/* Floating badge */}
                <div className="absolute -bottom-3 -right-3 bg-white text-charcoal rounded-full px-4 py-2 text-xs font-medium shadow-card border border-mist">
                  ✨ 400+ Recipes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
