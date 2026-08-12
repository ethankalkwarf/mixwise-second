"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";
import { formatCocktailName } from "@/lib/formatters";
import {
  HeartIcon,
  ClockIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  ArrowRightIcon,
  Cog6ToothIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

export function SavedPage() {
  const { favorites, isLoading: favsLoading } = useFavorites();
  const { recentlyViewed, isLoading: recentLoading } = useRecentlyViewed();
  const { ingredientIds } = useBarIngredients();
  const [activeTab, setActiveTab] = useState<'favorites' | 'recent' | 'bar' | 'profile'>('favorites');

  const tabs = [
    { id: 'favorites' as const, label: 'Favorites', icon: HeartIcon, count: favorites.length },
    { id: 'recent' as const, label: 'Recent', icon: ClockIcon, count: recentlyViewed.length },
    { id: 'bar' as const, label: 'My Bar', icon: ShoppingBagIcon, count: ingredientIds.length },
    { id: 'profile' as const, label: 'Profile', icon: UserCircleIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-cream to-mist/30 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-white/50">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-2xl font-display font-bold text-forest mb-4">Saved</h1>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold text-sm whitespace-nowrap
                    transition-all duration-300
                    ${isActive
                      ? 'bg-terracotta text-cream shadow-lg shadow-terracotta/30'
                      : 'bg-white/50 text-sage hover:bg-mist/50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`
                      px-1.5 py-0.5 rounded-full text-[10px] font-bold
                      ${isActive ? 'bg-cream/20 text-cream' : 'bg-terracotta/10 text-terracotta'}
                    `}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6">
        {activeTab === 'favorites' && <FavoritesTab favorites={favorites} loading={favsLoading} />}
        {activeTab === 'recent' && <RecentTab recent={recentlyViewed} loading={recentLoading} />}
        {activeTab === 'bar' && <BarTab ingredientIds={ingredientIds} />}
        {activeTab === 'profile' && <ProfileTab />}
      </div>
    </div>
  );
}

function FavoritesTab({ favorites, loading }: { favorites: any[]; loading: boolean }) {
  if (loading) {
    return <div className="text-center py-12 text-sage">Loading...</div>;
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <HeartIcon className="w-16 h-16 text-sage/30 mx-auto mb-4" />
        <h3 className="text-lg font-display font-bold text-forest mb-2">No favorites yet</h3>
        <p className="text-sm text-sage mb-6">Start exploring and save cocktails you love</p>
        <Link
          href="/cocktails"
          className="inline-flex items-center gap-2 bg-terracotta text-cream px-6 py-3 rounded-2xl font-bold text-sm shadow-lg"
        >
          Discover Cocktails <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {favorites.map((fav) => (
        <Link
          key={fav.cocktail_id}
          href={`/cocktails/${fav.cocktail_slug || fav.cocktail_id}`}
          className="flex gap-3 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-md p-3 active:scale-[0.98] transition-all"
        >
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-mist flex-shrink-0">
            {fav.cocktail_image_url ? (
              <Image
                src={fav.cocktail_image_url}
                alt={fav.cocktail_name}
                fill
                sizes="80px"
                className="object-cover"
                quality={80}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sage text-2xl">🍸</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-base text-forest mb-1 line-clamp-2">
              {formatCocktailName(fav.cocktail_name || 'Cocktail')}
            </h3>
            <p className="text-xs text-sage">Saved favorite</p>
          </div>
          <ArrowRightIcon className="w-5 h-5 text-sage flex-shrink-0 self-center" />
        </Link>
      ))}
    </div>
  );
}

function RecentTab({ recent, loading }: { recent: any[]; loading: boolean }) {
  if (loading) {
    return <div className="text-center py-12 text-sage">Loading...</div>;
  }

  if (recent.length === 0) {
    return (
      <div className="text-center py-12">
        <ClockIcon className="w-16 h-16 text-sage/30 mx-auto mb-4" />
        <h3 className="text-lg font-display font-bold text-forest mb-2">No recent views</h3>
        <p className="text-sm text-sage">Cocktails you view will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recent.map((item) => (
        <Link
          key={item.cocktail_id}
          href={`/cocktails/${item.cocktail_slug || item.cocktail_id}`}
          className="flex gap-3 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-md p-3 active:scale-[0.98] transition-all"
        >
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-mist flex-shrink-0">
            {item.cocktail_image_url ? (
              <Image
                src={item.cocktail_image_url}
                alt={item.cocktail_name}
                fill
                sizes="80px"
                className="object-cover"
                quality={80}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sage text-2xl">🍸</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-base text-forest mb-1 line-clamp-2">
              {formatCocktailName(item.cocktail_name || 'Cocktail')}
            </h3>
            <p className="text-xs text-sage">Recently viewed</p>
          </div>
          <ArrowRightIcon className="w-5 h-5 text-sage flex-shrink-0 self-center" />
        </Link>
      ))}
    </div>
  );
}

function BarTab({ ingredientIds }: { ingredientIds: string[] }) {
  return (
    <div>
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-md p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-display font-bold text-forest mb-1">Your Bar</h3>
            <p className="text-sm text-sage">{ingredientIds.length} ingredients</p>
          </div>
          <Link
            href="/mix"
            className="px-4 py-2 bg-terracotta text-cream rounded-xl font-semibold text-sm shadow-lg"
          >
            Manage
          </Link>
        </div>
      </div>
      
      {ingredientIds.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBagIcon className="w-16 h-16 text-sage/30 mx-auto mb-4" />
          <h3 className="text-lg font-display font-bold text-forest mb-2">No ingredients yet</h3>
          <p className="text-sm text-sage mb-6">Add ingredients to discover cocktails</p>
          <Link
            href="/mix"
            className="inline-flex items-center gap-2 bg-terracotta text-cream px-6 py-3 rounded-2xl font-bold text-sm shadow-lg"
          >
            Build Your Bar <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

function ProfileTab() {
  return (
    <div className="space-y-4">
      <Link
        href="/account"
        className="flex items-center gap-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-md p-4 active:scale-[0.98] transition-all"
      >
        <div className="w-12 h-12 rounded-2xl bg-terracotta/10 flex items-center justify-center">
          <UserCircleIcon className="w-6 h-6 text-terracotta" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-base text-forest">Account Settings</h3>
          <p className="text-xs text-sage">Profile, preferences, and more</p>
        </div>
        <ArrowRightIcon className="w-5 h-5 text-sage" />
      </Link>

      <Link
        href="/dashboard"
        className="flex items-center gap-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-md p-4 active:scale-[0.98] transition-all"
      >
        <div className="w-12 h-12 rounded-2xl bg-olive/10 flex items-center justify-center">
          <TrophyIcon className="w-6 h-6 text-olive" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-base text-forest">Badges & Achievements</h3>
          <p className="text-xs text-sage">View your progress and badges</p>
        </div>
        <ArrowRightIcon className="w-5 h-5 text-sage" />
      </Link>
    </div>
  );
}
