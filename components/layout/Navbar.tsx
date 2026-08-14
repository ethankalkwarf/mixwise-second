"use client";

import { useState, Fragment, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon, ShareIcon } from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { BrandLogo } from "@/components/common/BrandLogo";
import { CocktailSearch } from "@/components/search/CocktailSearch";
import { RecipesMegaMenu } from "@/components/layout/RecipesMegaMenu";
import { ExplainerMegaMenu } from "@/components/layout/ExplainerMegaMenu";
import type { NavMegaController, NavMegaId } from "@/components/layout/MegaMenuFrame";
import { MEGA_ROOT_ID } from "@/components/layout/MegaMenuFrame";
import type { MegaMenuData } from "@/lib/megaMenu";

export function Navbar({ megaMenu }: { megaMenu?: MegaMenuData }) {
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [megaMounted, setMegaMounted] = useState(false);
  const [openMega, setOpenMega] = useState<NavMegaId | null>(null);
  const megaCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, profile, isAuthenticated, isLoading, signOut } = useUser();
  const { openAuthDialog } = useAuthDialog();

  useEffect(() => setMegaMounted(true), []);

  useEffect(() => {
    return () => {
      if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
    };
  }, []);

  const openMenu = useCallback((id: NavMegaId) => {
    if (megaCloseTimer.current) {
      clearTimeout(megaCloseTimer.current);
      megaCloseTimer.current = null;
    }
    setOpenMega(id);
  }, []);

  const closeMenu = useCallback(() => {
    if (megaCloseTimer.current) {
      clearTimeout(megaCloseTimer.current);
      megaCloseTimer.current = null;
    }
    setOpenMega(null);
  }, []);

  const scheduleClose = useCallback(() => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
    megaCloseTimer.current = setTimeout(() => setOpenMega(null), 280);
  }, []);

  const megaController: NavMegaController = useMemo(
    () => ({
      openId: openMega,
      mounted: megaMounted,
      openMenu,
      scheduleClose,
      closeMenu,
    }),
    [openMega, megaMounted, openMenu, scheduleClose, closeMenu]
  );

  const pathnameRef = useRef(pathname);
  useEffect(() => {
    if (pathnameRef.current === pathname) return;
    pathnameRef.current = pathname;
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (desktopSearchOpen) closeMenu();
  }, [desktopSearchOpen, closeMenu]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname?.startsWith(`${href}/`));

  const handleSignOut = async () => {
    await signOut();
  };

  // Get user display info
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
  const userInitial = displayName.charAt(0).toUpperCase();

  // Close search when clicking outside or pressing Escape
  useEffect(() => {
    if (!desktopSearchOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setDesktopSearchOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDesktopSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [desktopSearchOpen]);

  // Keyboard shortcut: Cmd/Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setDesktopSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      {/* Search Modal Overlay */}
      {desktopSearchOpen && (
        <Transition
          show={desktopSearchOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-forest/20 backdrop-blur-sm z-[1300] flex items-start justify-center pt-20 sm:pt-32">
            <div
              ref={searchContainerRef}
              className="w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <CocktailSearch
                variant="desktop"
                onClose={() => setDesktopSearchOpen(false)}
              />
            </div>
          </div>
        </Transition>
      )}

      <header className="border-b border-mist bg-cream/95 backdrop-blur-md sticky top-0 z-50 relative">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 relative" aria-label="Main navigation">
          <div className="h-16 flex items-center justify-between relative">
            {/* Logo */}
            <div className="flex items-center">
              <BrandLogo size="md" variant="dark" />
            </div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
              <ExplainerMegaMenu
                id="daily"
                controller={megaController}
                active={isActive("/cocktail-of-the-day")}
                href="/cocktail-of-the-day"
                label="Drink of the Day"
                eyebrow="Daily pour"
                title={megaMenu?.dailyDrink?.name || "Drink of the Day"}
                body="A new recipe every day — worth making tonight."
                cta="See today’s drink"
                imageUrl={megaMenu?.dailyDrink?.imageUrl || "/media/strainer-pour-poster.webp"}
                imageAlt={megaMenu?.dailyDrink?.name || "Drink of the Day"}
              />
              <ExplainerMegaMenu
                id="mix"
                controller={megaController}
                active={isActive("/mix")}
                href="/mix"
                label="What Can I Make?"
                eyebrow="Your cabinet"
                title="What can you make tonight?"
                body="Add what’s in your bar. We’ll show what’s ready to pour."
                cta="Open your cabinet"
                imageUrl="/media/kitchen-shelf.webp"
                imageFocusClass="object-[center_40%]"
              />
              <RecipesMegaMenu
                active={isActive("/cocktails") || isActive("/occasions") || isActive("/learn")}
                occasionCovers={megaMenu?.occasionCovers || []}
                featuredCover={megaMenu?.featuredCover || null}
                controller={megaController}
              />
            </div>

            {/* Search + Actions — search stays available on mobile; auth is desktop-only (in More sheet) */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setDesktopSearchOpen(!desktopSearchOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 text-sm font-medium text-sage hover:text-forest border border-mist/70 rounded-md hover:border-mist hover:bg-mist/40 active:scale-[0.98] transition-all duration-200"
                aria-label="Search cocktails (Cmd+K or Ctrl+K)"
                aria-expanded={desktopSearchOpen}
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                <span className="hidden lg:inline">Search</span>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-sage/80 bg-mist/40 border border-mist/40 rounded">
                  <span>
                    {megaMounted && /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent)
                      ? "⌘"
                      : "Ctrl"}
                  </span>
                  <span>K</span>
                </kbd>
              </button>

              <div className="hidden lg:flex items-center gap-3">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-mist animate-pulse" />
            ) : isAuthenticated ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-2 px-2.5 py-1.5 rounded-full hover:bg-mist/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt=""
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover border border-mist"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-terracotta/20 flex items-center justify-center text-terracotta font-semibold text-sm">
                      {userInitial}
                    </div>
                  )}
                  <span className="text-sm text-forest font-medium max-w-[100px] truncate">
                    {displayName}
                  </span>
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 bg-white border border-mist rounded-2xl shadow-card py-2 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-mist">
                      <p className="text-sm font-medium text-forest truncate">{displayName}</p>
                      <p className="text-xs text-sage truncate">{user?.email}</p>
                    </div>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href={`/bar/${profile?.username || profile?.public_slug || user?.id}`}
                          className={`flex items-center gap-2 px-4 py-2.5 text-sm ${
                            active ? "bg-mist/50 text-terracotta" : "text-charcoal"
                          }`}
                        >
                          <ShareIcon className="w-4 h-4" />
                          Share My Bar
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/dashboard"
                          className={`block px-4 py-2.5 text-sm ${
                            active ? "bg-mist/50 text-terracotta" : "text-charcoal"
                          }`}
                        >
                          Dashboard
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/account"
                          className={`block px-4 py-2.5 text-sm ${
                            active ? "bg-mist/50 text-terracotta" : "text-charcoal"
                          }`}
                        >
                          Account Settings
                        </Link>
                      )}
                    </Menu.Item>
                    <div className="border-t border-mist mt-1 pt-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleSignOut}
                            className={`block w-full text-left px-4 py-2.5 text-sm ${
                              active ? "bg-terracotta/10 text-terracotta" : "text-sage"
                            }`}
                          >
                            Sign Out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <>
                <button
                  onClick={() => openAuthDialog({ mode: "login" })}
                  className="text-charcoal hover:text-terracotta transition-colors font-medium text-sm"
                >
                  Log In
                </button>
                <button
                  onClick={() => openAuthDialog({ mode: "signup" })}
                  className="inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold bg-terracotta text-cream hover:bg-terracotta-dark active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Sign Up Free
                </button>
              </>
            )}
              </div>
            </div>
        </div>
      </nav>
      <div id={MEGA_ROOT_ID} className="absolute inset-x-0 top-full z-[60]" />
    </header>
    </>
  );
}
