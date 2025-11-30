"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MainContainer } from "@/components/layout/MainContainer";
import { useUser } from "@/components/auth/UserProvider";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import {
  UserCircleIcon,
  BeakerIcon,
  HeartIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, isLoading, isAuthenticated, signOut } = useUser();
  const { openAuthDialog } = useAuthDialog();
  const { ingredients, removeIngredient, clearAll: clearBar } = useBarIngredients();
  const { favorites, removeFavorite } = useFavorites();
  const { recentlyViewed, clearHistory } = useRecentlyViewed();

  // Redirect to home or show auth dialog if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openAuthDialog({
        title: "Sign in to view your account",
        subtitle: "Create a free account to save your bar, favorites, and more.",
        onSuccess: () => {
          // Stay on account page after sign in
        },
      });
    }
  }, [isLoading, isAuthenticated, openAuthDialog]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <MainContainer>
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-slate-800 rounded-xl" />
            <div className="h-64 bg-slate-800 rounded-xl" />
            <div className="h-64 bg-slate-800 rounded-xl" />
          </div>
        </MainContainer>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="py-12">
        <MainContainer>
          <div className="text-center py-20">
            <UserCircleIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-bold text-slate-200 mb-2">
              Sign in to access your account
            </h1>
            <p className="text-slate-400 mb-6">
              Create a free account to save your bar, favorite cocktails, and more.
            </p>
            <button
              onClick={() => openAuthDialog()}
              className="px-6 py-3 bg-lime-500 text-slate-900 font-bold rounded-lg hover:bg-lime-400 transition-colors"
            >
              Sign in
            </button>
          </div>
        </MainContainer>
      </div>
    );
  }

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url;
  const userInitial = displayName.charAt(0).toUpperCase();
  const email = user?.email;
  const role = profile?.role || "free";

  return (
    <div className="py-12">
      <MainContainer>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-400 font-bold text-2xl">
                    {userInitial}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-serif font-bold text-slate-100">
                    {displayName}
                  </h1>
                  <p className="text-slate-400">{email}</p>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      role === "admin" 
                        ? "bg-purple-500/20 text-purple-300" 
                        : role === "paid" 
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-slate-700 text-slate-300"
                    }`}>
                      {role === "admin" ? "Admin" : role === "paid" ? "Premium" : "Free Plan"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                Sign out
              </button>
            </div>
          </section>

          {/* My Bar */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <BeakerIcon className="w-6 h-6 text-lime-400" />
                <h2 className="text-xl font-serif font-bold text-slate-100">
                  My Bar
                </h2>
                <span className="text-sm text-slate-500">
                  {ingredients.length} ingredient{ingredients.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/mix"
                  className="px-4 py-2 text-sm text-lime-400 hover:text-lime-300 hover:bg-lime-500/10 rounded-lg transition-colors"
                >
                  Edit in Mix Tool
                </Link>
                {ingredients.length > 0 && (
                  <button
                    onClick={clearBar}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Clear all"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="p-6">
              {ingredients.length === 0 ? (
                <div className="text-center py-8">
                  <BeakerIcon className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-400 mb-4">No ingredients in your bar yet.</p>
                  <Link
                    href="/mix"
                    className="text-lime-400 hover:text-lime-300 font-medium"
                  >
                    Add ingredients →
                  </Link>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {ingredients.slice(0, 30).map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-sm"
                    >
                      <span className="text-slate-300">
                        {ingredient.name || ingredient.id}
                      </span>
                      <button
                        onClick={() => removeIngredient(ingredient.id)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {ingredients.length > 30 && (
                    <span className="px-3 py-1.5 text-slate-500 text-sm">
                      +{ingredients.length - 30} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Favorites */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <HeartIcon className="w-6 h-6 text-red-400" />
                <h2 className="text-xl font-serif font-bold text-slate-100">
                  Favorites
                </h2>
                <span className="text-sm text-slate-500">
                  {favorites.length} cocktail{favorites.length !== 1 ? "s" : ""}
                </span>
              </div>
              <Link
                href="/cocktails"
                className="px-4 py-2 text-sm text-lime-400 hover:text-lime-300 hover:bg-lime-500/10 rounded-lg transition-colors"
              >
                Browse Cocktails
              </Link>
            </div>
            <div className="p-6">
              {favorites.length === 0 ? (
                <div className="text-center py-8">
                  <HeartIcon className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-400 mb-4">No favorite cocktails yet.</p>
                  <Link
                    href="/cocktails"
                    className="text-lime-400 hover:text-lime-300 font-medium"
                  >
                    Explore cocktails →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.slice(0, 9).map((fav) => (
                    <Link
                      key={fav.id}
                      href={`/cocktails/${fav.cocktail_slug}`}
                      className="group flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      {fav.cocktail_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={fav.cocktail_image_url}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-2xl">
                          🍸
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-200 group-hover:text-lime-400 truncate transition-colors">
                          {fav.cocktail_name}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFavorite(fav.cocktail_id);
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </Link>
                  ))}
                </div>
              )}
              {favorites.length > 9 && (
                <div className="mt-4 text-center">
                  <span className="text-sm text-slate-500">
                    and {favorites.length - 9} more
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Recently Viewed */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <ClockIcon className="w-6 h-6 text-sky-400" />
                <h2 className="text-xl font-serif font-bold text-slate-100">
                  Recently Viewed
                </h2>
                <span className="text-sm text-slate-500">
                  {recentlyViewed.length} cocktail{recentlyViewed.length !== 1 ? "s" : ""}
                </span>
              </div>
              {recentlyViewed.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Clear history
                </button>
              )}
            </div>
            <div className="p-6">
              {recentlyViewed.length === 0 ? (
                <div className="text-center py-8">
                  <ClockIcon className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-400 mb-4">No recently viewed cocktails.</p>
                  <Link
                    href="/cocktails"
                    className="text-lime-400 hover:text-lime-300 font-medium"
                  >
                    Start exploring →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentlyViewed.slice(0, 9).map((item) => (
                    <Link
                      key={item.id}
                      href={`/cocktails/${item.cocktail_slug}`}
                      className="group flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      {item.cocktail_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.cocktail_image_url}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-2xl">
                          🍸
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-200 group-hover:text-lime-400 truncate transition-colors">
                          {item.cocktail_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(item.viewed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </MainContainer>
    </div>
  );
}

