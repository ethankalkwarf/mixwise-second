"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/components/auth/UserProvider";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useFavorites } from "@/hooks/useFavorites";
import { getImageUrl, COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";
import { formatCocktailName } from "@/lib/formatters";
import { 
  SparklesIcon, 
  MagnifyingGlassIcon, 
  HeartIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  PlusCircleIcon,
  FireIcon
} from "@heroicons/react/24/outline";
import type { SanityCocktail, SanityImage } from "@/lib/sanityTypes";

interface MobileHomePageProps {
  featuredCocktails: SanityCocktail[];
  allCocktails: SanityCocktail[];
}

export function MobileHomePage({ featuredCocktails, allCocktails }: MobileHomePageProps) {
  const { isAuthenticated } = useUser();
  const { ingredientIds } = useBarIngredients();
  const { favorites } = useFavorites();

  // Modern quick action cards with gradients - Focused on core actions
  const quickActions = [
    {
      title: "Discover",
      description: "Browse 300+ recipes",
      icon: MagnifyingGlassIcon,
      href: "/cocktails",
      gradient: "from-forest to-charcoal",
      iconBg: "bg-forest/20",
    },
    {
      title: "Build Bar",
      description: "Add ingredients",
      icon: ShoppingBagIcon,
      href: "/mix",
      gradient: "from-terracotta to-terracotta-dark",
      iconBg: "bg-terracotta/20",
    },
  ];

  // Calculate cocktails user can make
  const readyToMake = useMemo(() => {
    if (ingredientIds.length === 0) return [];
    
    const ingredientSet = new Set(ingredientIds);
    const ready: SanityCocktail[] = [];
    
    allCocktails.forEach((cocktail) => {
      const requiredIngredients = cocktail.ingredients?.filter(i => i.ingredient) || [];
      if (requiredIngredients.length === 0) return;
      
      const missing = requiredIngredients.filter(i => 
        i.ingredient && !ingredientSet.has(i.ingredient._id)
      );
      
      if (missing.length === 0) {
        ready.push(cocktail);
      }
    });
    
    return ready.slice(0, 6);
  }, [allCocktails, ingredientIds]);

  // Get featured cocktails for hero
  const heroCocktails = featuredCocktails.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-cream to-mist/30 pb-28">
      {/* Modern Hero Section with Glassmorphism */}
      <div className="relative pt-8 pb-6 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-terracotta/5 via-transparent to-olive/5" />
        <div className="relative max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-terracotta/20 blur-xl rounded-full" />
              <SparklesIcon className="relative w-7 h-7 text-terracotta" />
            </div>
            <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-forest to-olive bg-clip-text text-transparent">
              MixWise
            </h1>
          </div>
          <p className="text-sage text-base leading-relaxed font-medium">
            Discover cocktails you can make with ingredients you have
          </p>
        </div>
      </div>

      {/* Modern Quick Actions with Glassmorphism - Now 2 columns for better focus */}
      <div className="px-4 mb-8">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg shadow-black/5 active:scale-95 transition-all duration-300"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-active:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative p-4 flex flex-col items-center text-center">
                    <div className={`${action.iconBg} w-12 h-12 rounded-2xl flex items-center justify-center mb-2 group-active:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-forest" />
                    </div>
                    <span className="text-xs font-bold text-forest mb-0.5">{action.title}</span>
                    <span className="text-[10px] text-sage font-medium">{action.description}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ready to Make Section - Modern Cards */}
      {isAuthenticated && readyToMake.length > 0 && (
        <div className="px-4 mb-8">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-display font-bold text-forest mb-1">
                  Ready to Make
                </h2>
                <p className="text-xs text-sage">Cocktails you can make now</p>
              </div>
              <Link
                href="/mix"
                className="flex items-center gap-1 text-xs text-terracotta font-semibold px-3 py-1.5 rounded-full bg-terracotta/10 hover:bg-terracotta/20 transition-colors"
              >
                See all <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {readyToMake.map((cocktail, index) => (
                <ModernCocktailCard key={cocktail._id} cocktail={cocktail} index={index} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Featured Cocktails - Premium List Design */}
      <div className="px-4 mb-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <FireIcon className="w-5 h-5 text-terracotta" />
            <h2 className="text-xl font-display font-bold text-forest">
              Featured
            </h2>
          </div>
          <div className="space-y-2">
            {heroCocktails.map((cocktail, index) => (
              <ModernFeaturedCard key={cocktail._id} cocktail={cocktail} index={index} />
            ))}
          </div>
          <Link
            href="/cocktails"
            className="block mt-4 text-center text-sm text-terracotta font-semibold hover:text-terracotta-dark transition-colors"
          >
            Browse All Recipes →
          </Link>
        </div>
      </div>

      {/* Modern Empty State */}
      {!isAuthenticated && ingredientIds.length === 0 && (
        <div className="px-4">
          <div className="max-w-md mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/90 to-mist/50 backdrop-blur-xl border border-white/50 shadow-xl shadow-black/5 p-8">
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-terracotta/10 mb-4">
                  <ShoppingBagIcon className="w-8 h-8 text-terracotta" />
                </div>
                <h3 className="text-xl font-display font-bold text-forest mb-2">
                  Start Building Your Bar
                </h3>
                <p className="text-sm text-sage mb-6 leading-relaxed">
                  Add ingredients from your cabinet to discover cocktails you can make right now
                </p>
                <Link
                  href="/mix"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-terracotta to-terracotta-dark text-cream px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-terracotta/30 hover:shadow-xl hover:shadow-terracotta/40 active:scale-95 transition-all duration-300"
                >
                  <PlusCircleIcon className="w-5 h-5" />
                  Build Your Bar
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModernCocktailCard({ cocktail, index }: { cocktail: SanityCocktail; index: number }) {
  const imageUrl = getImageUrl(cocktail.image, {
    width: 600,
    height: 400,
    quality: 90,
  }) || cocktail.externalImageUrl;

  return (
    <Link
      href={`/cocktails/${cocktail.slug?.current || cocktail._id}`}
      className="group relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-lg shadow-black/5 active:scale-[0.97] transition-all duration-300"
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div className="relative h-36 bg-gradient-to-br from-mist to-sage/20 overflow-hidden">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={cocktail.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover group-active:scale-110 transition-transform duration-500"
              quality={90}
              placeholder="blur"
              blurDataURL={COCKTAIL_BLUR_DATA_URL}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sage text-4xl">
            🍸
          </div>
        )}
        <div className="absolute bottom-2 left-2 right-2">
          <span className="inline-flex items-center gap-1 bg-olive/95 backdrop-blur-sm text-cream text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
            <span className="w-1.5 h-1.5 bg-cream rounded-full animate-pulse" />
            Ready
          </span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-display font-bold text-sm text-forest line-clamp-2 group-active:text-terracotta transition-colors">
          {formatCocktailName(cocktail.name)}
        </h3>
      </div>
    </Link>
  );
}

function ModernFeaturedCard({ cocktail, index }: { cocktail: SanityCocktail; index: number }) {
  const imageUrl = getImageUrl(cocktail.image, {
    width: 320,
    height: 320,
    quality: 90,
  }) || cocktail.externalImageUrl;

  return (
    <Link
      href={`/cocktails/${cocktail.slug?.current || cocktail._id}`}
      className="group flex gap-3 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-md shadow-black/5 p-3 active:scale-[0.98] transition-all duration-300 hover:shadow-lg hover:shadow-black/10"
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-mist to-sage/20 flex-shrink-0 shadow-md">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={cocktail.name}
            fill
            sizes="80px"
            className="object-cover group-active:scale-110 transition-transform duration-500"
            quality={90}
            placeholder="blur"
            blurDataURL={COCKTAIL_BLUR_DATA_URL}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sage text-2xl">
            🍸
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="font-display font-bold text-base text-forest mb-1 line-clamp-2 group-active:text-terracotta transition-colors">
          {formatCocktailName(cocktail.name)}
        </h3>
        {cocktail.primarySpirit && (
          <p className="text-xs text-sage uppercase tracking-wider font-semibold">
            {cocktail.primarySpirit}
          </p>
        )}
      </div>
      <div className="flex-shrink-0 self-center">
        <div className="w-8 h-8 rounded-full bg-mist/50 flex items-center justify-center group-active:bg-terracotta/10 transition-colors">
          <ArrowRightIcon className="w-4 h-4 text-sage group-active:text-terracotta transition-colors" />
        </div>
      </div>
    </Link>
  );
}
