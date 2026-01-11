"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/sanityImage";
import type { SanityCocktail } from "@/lib/sanityTypes";

interface HeroProps {
  title: string;
  subtitle: string;
  featuredCocktails?: SanityCocktail[];
}

export function Hero({ title, subtitle, featuredCocktails = [] }: HeroProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Rotate images every 3 seconds if we have featured cocktails
  useEffect(() => {
    if (featuredCocktails.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % featuredCocktails.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [featuredCocktails.length]);

  // Default image if no featured cocktails
  const defaultImageUrl = "https://usgsomofsav4obpi.public.blob.vercel-storage.com/Gemini_Generated_Image_mqk0vymqk0vymqk0.png";
  const hasRotatingImages = featuredCocktails.length > 0;

  return (
    <section className="bg-cream pt-8 pb-12 sm:pt-10 sm:pb-16 lg:pt-12 lg:pb-20 xl:pt-16 xl:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Green hero container */}
        <div className="relative bg-mist border border-mist rounded-3xl p-6 sm:p-10 lg:p-14 shadow-soft overflow-hidden">
          
          <div className="relative flex flex-col xl:flex-row gap-8 xl:gap-16 items-center">
            {/* Content */}
            <div className="flex-1 text-center xl:text-left max-w-2xl xl:max-w-none">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-semibold text-forest leading-tight mb-6 tracking-tight">
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
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-mist shadow-card">
                {hasRotatingImages ? (
                  <>
                    {featuredCocktails.map((cocktail, index) => {
                      const isActive = index === currentImageIndex;
                      const imageUrl = getImageUrl(cocktail.image, {
                        width: 600,
                        height: 800,
                        quality: 90,
                        auto: 'format'
                      }) || cocktail.externalImageUrl;

                      return (
                        <div
                          key={cocktail._id}
                          className={`absolute inset-0 transition-opacity duration-1000 ${
                            isActive ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          {imageUrl ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={imageUrl}
                                alt={cocktail.name}
                                className="absolute inset-0 w-full h-full object-cover"
                                loading={index === 0 ? "eager" : "lazy"}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    const fallback = parent.querySelector('.image-fallback');
                                    if (fallback) (fallback as HTMLElement).style.display = 'flex';
                                  }
                                }}
                              />
                              <div className="image-fallback hidden absolute inset-0 w-full h-full items-center justify-center text-sage text-5xl bg-mist">
                                🍸
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-6">
                                <h3 className="text-white font-display font-bold text-xl md:text-2xl mb-1 drop-shadow-lg">
                                  {cocktail.name}
                                </h3>
                                {cocktail.primarySpirit && (
                                  <p className="text-white/90 text-xs uppercase tracking-widest font-semibold">
                                    {cocktail.primarySpirit}
                                  </p>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="absolute inset-0 w-full h-full flex items-center justify-center text-sage text-5xl">
                              🍸
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <Image
                    src={defaultImageUrl}
                    alt="Cocktail preparation with fresh ingredients"
                    width={600}
                    height={800}
                    className="w-full h-full object-cover"
                    priority
                  />
                )}
                {/* Floating badge */}
                <div className="absolute bottom-4 right-4 bg-white text-charcoal rounded-full px-5 py-3 text-sm font-medium shadow-card border border-mist z-10">
                  ✨ 300+ Cocktail Recipes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
