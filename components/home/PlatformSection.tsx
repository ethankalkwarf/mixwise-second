"use client";

import Link from "next/link";

export function PlatformSection() {
  return (
    <section className="bg-charcoal text-cream py-16 sm:py-20 lg:py-24 px-6 md:px-10 lg:px-20 relative overflow-hidden">
      {/* Watermark Numbers */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute -top-12 -left-4 text-[140px] leading-none font-display italic text-white opacity-[0.05]">
          1
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-[140px] leading-none font-display italic text-white opacity-[0.05]">
          2
        </div>
        <div className="absolute -top-12 -right-4 text-[140px] leading-none font-display italic text-white opacity-[0.05]">
          3
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Column 1 */}
          <div className="text-center md:text-left">
            <div className="text-sm font-bold uppercase tracking-widest text-white/70 mb-4">
              Curated Recipes
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">
              Expert-Crafted Cocktails
            </h3>
            <p className="text-white/80 leading-relaxed mb-6">
              Discover professionally crafted cocktail recipes from mixologists around the world.
              Each recipe includes detailed instructions, ingredient lists, and serving suggestions.
            </p>
            <Link
              href="/cocktails"
              className="inline-block text-white/90 hover:text-white transition-colors underline underline-offset-4"
            >
              Start Browsing →
            </Link>
          </div>

          {/* Column 2 */}
          <div className="text-center md:text-left">
            <div className="text-sm font-bold uppercase tracking-widest text-white/70 mb-4">
              My Cabinet
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">
              Smart Ingredient Matching
            </h3>
            <p className="text-white/80 leading-relaxed mb-6">
              Tell us what you have at home and we&apos;ll show you exactly which cocktails you can make.
              No more guessing or disappointing trips to the liquor store.
            </p>
            <Link
              href="/mix"
              className="inline-block text-white/90 hover:text-white transition-colors underline underline-offset-4"
            >
              Launch My Cabinet →
            </Link>
          </div>

          {/* Column 3 */}
          <div className="text-center md:text-left">
            <div className="text-sm font-bold uppercase tracking-widest text-white/70 mb-4">
              Master Class
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">
              Learn the Craft
            </h3>
            <p className="text-white/80 leading-relaxed mb-6">
              Master the fundamentals of mixology with our comprehensive guides, technique tutorials,
              and expert tips for creating exceptional cocktails at home.
            </p>
            <Link
              href="/about"
              className="inline-block text-white/90 hover:text-white transition-colors underline underline-offset-4"
            >
              Read Guides →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
