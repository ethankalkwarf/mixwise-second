"use client";

import Link from "next/link";
import { useUser } from "@/components/auth/UserProvider";

export function GuestExperienceSection() {
  const { isAuthenticated } = useUser();

  // Only show for non-authenticated users
  if (isAuthenticated) {
    return null;
  }

  return (
    <section className="py-12 lg:py-16 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full border border-forest/20"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full border border-terracotta/20"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full border border-olive/20"></div>
        <div className="absolute bottom-1/4 right-1/3 w-20 h-20 rounded-full border border-sage/20"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Central content area */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl xl:text-6xl font-display font-bold text-forest mb-6 leading-tight">
            Your Mixology Journey
            <br />
            <span className="text-terracotta italic">Begins Here</span>
          </h2>

          <p className="text-lg xl:text-xl text-sage max-w-2xl mx-auto leading-relaxed mb-8">
            Transform your home bar into a source of endless inspiration. Discover recipes, master techniques, and create unforgettable moments.
          </p>

          {/* Inline CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-medium bg-terracotta text-cream hover:bg-terracotta-dark transition-all duration-300 shadow-terracotta"
            >
              Start Your Journey
            </Link>
            <Link
              href="/mix"
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-medium border-2 border-forest text-forest hover:bg-forest hover:text-cream transition-all duration-300"
            >
              Explore Recipes
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
