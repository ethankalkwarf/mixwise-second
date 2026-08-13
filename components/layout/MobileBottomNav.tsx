"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Bars3Icon,
  BookOpenIcon,
  HomeIcon,
  ShareIcon,
  ShoppingBagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  BookOpenIcon as BookOpenIconSolid,
  HomeIcon as HomeIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
} from "@heroicons/react/24/solid";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { CocktailSearch } from "@/components/search/CocktailSearch";
import { getTopLevelOccasions } from "@/lib/occasions";

const TABS = [
  {
    id: "home",
    label: "Home",
    href: "/",
    match: (path: string) => path === "/",
    Icon: HomeIcon,
    IconActive: HomeIconSolid,
  },
  {
    id: "mix",
    label: "Mix",
    href: "/mix",
    match: (path: string) => path === "/mix" || path.startsWith("/mix/"),
    Icon: ShoppingBagIcon,
    IconActive: ShoppingBagIconSolid,
  },
  {
    id: "recipes",
    label: "Recipes",
    href: "/cocktails",
    match: (path: string) =>
      path === "/cocktails" ||
      path.startsWith("/cocktails/") ||
      path.startsWith("/occasions") ||
      path.startsWith("/learn"),
    Icon: BookOpenIcon,
    IconActive: BookOpenIconSolid,
  },
] as const;

const OCCASION_LINKS = getTopLevelOccasions();

export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const { user, profile, isAuthenticated, isLoading, signOut } = useUser();
  const { openAuthDialog } = useAuthDialog();

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
  const userInitial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };

    document.documentElement.classList.add("mobile-sheet-open");
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.documentElement.classList.remove("mobile-sheet-open");
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [moreOpen]);

  const closeMore = () => setMoreOpen(false);

  const handleSignOut = async () => {
    await signOut();
    closeMore();
  };

  return (
    <>
      <nav
        className="mw-tabbar md:hidden"
        aria-label="Mobile navigation"
      >
        {TABS.map((tab) => {
          const active = tab.match(pathname || "");
          const Icon = active ? tab.IconActive : tab.Icon;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`mw-tabbar__item${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="mw-tabbar__icon" aria-hidden />
              <span>{tab.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          className={`mw-tabbar__item${moreOpen ? " is-active" : ""}`}
          aria-expanded={moreOpen}
          aria-controls="mw-mobile-sheet"
          onClick={() => setMoreOpen((open) => !open)}
        >
          {moreOpen ? (
            <XMarkIcon className="mw-tabbar__icon" aria-hidden />
          ) : (
            <Bars3Icon className="mw-tabbar__icon" aria-hidden />
          )}
          <span>More</span>
        </button>
      </nav>

      <div
        id="mw-mobile-sheet"
        className={`mw-mobile-sheet md:hidden${moreOpen ? " is-open" : ""}`}
        hidden={!moreOpen}
      >
        <button
          type="button"
          className="mw-mobile-sheet__backdrop"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={closeMore}
        />
        <div
          className="mw-mobile-sheet__panel"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <div className="mw-mobile-sheet__handle" aria-hidden />
          <div className="mw-mobile-sheet__head">
            <h2 className="mw-mobile-sheet__title">Menu</h2>
            <button
              type="button"
              className="mw-mobile-sheet__close"
              aria-label="Close menu"
              onClick={closeMore}
            >
              &times;
            </button>
          </div>

          <div className="px-1 pb-3">
            {moreOpen ? (
              <CocktailSearch variant="mobile" onClose={closeMore} />
            ) : null}
          </div>

          <div className="space-y-0.5">
            <Link
              href="/cocktail-of-the-day"
              className="block px-3 py-3 text-base font-medium text-charcoal rounded-xl hover:text-terracotta hover:bg-mist/50 transition-colors"
              onClick={closeMore}
            >
              Drink of the Day
            </Link>
            <Link
              href="/mix"
              className="block px-3 py-3 text-base font-medium text-charcoal rounded-xl hover:text-terracotta hover:bg-mist/50 transition-colors"
              onClick={closeMore}
              title="Find cocktails by ingredients in your bar"
            >
              What Can I Make?
            </Link>
            <Link
              href="/cocktails"
              className="block px-3 py-3 text-base font-medium text-charcoal rounded-xl hover:text-terracotta hover:bg-mist/50 transition-colors"
              onClick={closeMore}
            >
              All Recipes
            </Link>

            <div className="pl-3 pb-2 space-y-0.5">
              <p className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-sage">
                By occasion
              </p>
              {OCCASION_LINKS.map((occasion) => (
                <Link
                  key={occasion.slug}
                  href={`/occasions/${occasion.slug}`}
                  className="block px-3 py-2 text-sm rounded-lg text-charcoal hover:text-terracotta hover:bg-mist/50"
                  onClick={closeMore}
                >
                  {occasion.name}
                </Link>
              ))}
              <Link
                href="/learn"
                className="block px-3 py-2 text-sm rounded-lg text-terracotta font-medium hover:bg-mist/50"
                onClick={closeMore}
              >
                Learn mixology
              </Link>
            </div>

            <div className="border-t border-mist mt-4 pt-4">
              {isLoading ? (
                <div className="px-3 py-2">
                  <div className="h-10 bg-mist rounded-xl animate-pulse" />
                </div>
              ) : isAuthenticated ? (
                <>
                  <div className="px-3 py-2 flex items-center gap-3">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt=""
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover border border-mist"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-terracotta/20 flex items-center justify-center text-terracotta font-semibold">
                        {userInitial}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-forest">{displayName}</p>
                      <p className="text-xs text-sage">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    href={`/bar/${profile?.username || profile?.public_slug || user?.id}`}
                    className="flex items-center gap-2 px-3 py-3 text-base font-medium text-charcoal hover:text-terracotta hover:bg-mist/50 rounded-xl transition-colors"
                    onClick={closeMore}
                  >
                    <ShareIcon className="w-5 h-5" />
                    Share My Bar
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-3 text-base font-medium text-charcoal hover:text-terracotta hover:bg-mist/50 rounded-xl transition-colors"
                    onClick={closeMore}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/account"
                    className="block px-3 py-3 text-base font-medium text-charcoal hover:text-terracotta hover:bg-mist/50 rounded-xl transition-colors"
                    onClick={closeMore}
                  >
                    Account Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-3 text-base font-medium text-terracotta hover:bg-terracotta/10 rounded-xl transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="space-y-2 px-3 pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      openAuthDialog({ mode: "login" });
                      closeMore();
                    }}
                    className="block w-full text-center px-4 py-3 text-base font-medium text-charcoal hover:text-terracotta transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openAuthDialog({ mode: "signup" });
                      closeMore();
                    }}
                    className="block w-full text-center px-4 py-3 text-base font-semibold bg-terracotta text-cream rounded-xl hover:bg-terracotta-dark transition-colors"
                  >
                    Sign Up Free
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
