"use client";

import React, { useState, Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Transition } from "@headlessui/react";
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Squares2X2Icon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { CocktailsReadyBadge, CocktailsReadyBadgeCompact } from "./CocktailsReadyBadge";
import { ShoppingListBadge } from "./ShoppingListBadge";

export interface NavItem {
  label: string;
  href: string;
}

interface SiteHeaderProps {
  navItems: NavItem[];
}

export function SiteHeader({ navItems }: SiteHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, isLoading, signOut, isAuthenticated } = useUser();
  const { openAuthDialog } = useAuthDialog();

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  // Get user display info
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url || null;
  const userInitial = displayName.charAt(0).toUpperCase();
  const barSlug = profile?.username || profile?.public_slug || user?.id || null;

  return (
    <header className="border-b border-mist bg-cream/95 backdrop-blur-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="h-16 sm:h-20 flex items-center justify-between">
          {/* Logo - mixwise. text-based design */}
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta rounded-lg"
              aria-label="MixWise Home"
            >
              <span className="text-3xl font-display font-bold text-forest">
                mixwise.
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta ${
                      isActive
                        ? "text-terracotta bg-terracotta/10"
                        : "text-forest hover:text-terracotta hover:bg-mist/50"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right side: Auth & Stats */}
          <div className="flex items-center gap-3">
            {/* Shopping List Badge */}
            <ShoppingListBadge />

            {/* Cocktails Ready Badge (Desktop) */}
            <CocktailsReadyBadge />

            {/* Cocktails Ready Badge (Mobile) */}
            <div className="md:hidden">
              <CocktailsReadyBadgeCompact />
            </div>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-2">
              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-mist animate-pulse" />
              ) : isAuthenticated ? (
                <UserMenu
                  displayName={displayName}
                  avatarUrl={avatarUrl}
                  userInitial={userInitial}
                  onSignOut={handleSignOut}
                  barSlug={barSlug || user?.id || null}
                />
              ) : (
                <>
                  <button
                    onClick={() => openAuthDialog({ mode: "login" })}
                    className="px-4 py-2 text-forest hover:text-terracotta text-sm font-medium rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => openAuthDialog({ mode: "signup" })}
                    className="px-5 py-2.5 bg-terracotta hover:bg-terracotta-dark text-cream font-semibold text-sm rounded-2xl transition-all shadow-lg shadow-terracotta/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                  >
                    Create Free Account
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-xl text-forest hover:text-terracotta hover:bg-mist/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen Overlay */}
      <Transition show={mobileMenuOpen} as={Fragment}>
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div 
              className="fixed inset-0 bg-forest/20 backdrop-blur-sm" 
              onClick={() => setMobileMenuOpen(false)}
            />
          </Transition.Child>

          {/* Menu Panel */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4"
            enterTo="opacity-100 translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-4"
          >
            <div 
              id="mobile-menu" 
              className="fixed inset-0 bg-cream flex flex-col"
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between px-4 h-16 border-b border-mist">
                <span className="text-3xl font-display font-bold text-forest">
                  mixwise.
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-forest hover:text-terracotta hover:bg-mist/50"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Mobile Menu Content */}
              <div className="flex-1 overflow-y-auto px-6 py-8">
                <ul className="space-y-2 mb-8">
                  {navItems.map((item) => {
                    const isActive =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname === item.href || pathname.startsWith(item.href + "/");

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`block px-4 py-4 rounded-2xl text-2xl font-display font-bold transition-all ${
                            isActive
                              ? "text-terracotta bg-terracotta/10"
                              : "text-forest hover:text-terracotta hover:bg-mist/50"
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {/* Mobile Auth */}
                <div className="border-t border-mist pt-8">
                  {isLoading ? (
                    <div className="px-4 py-3">
                      <div className="h-12 bg-mist rounded-2xl animate-pulse" />
                    </div>
                  ) : isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="px-4 py-2 text-sm text-sage">
                        Signed in as <span className="text-forest font-medium">{displayName}</span>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-4 text-forest hover:text-terracotta hover:bg-mist/50 rounded-2xl text-lg font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Squares2X2Icon className="w-6 h-6" />
                        Dashboard
                      </Link>
                      <Link
                        href="/account"
                        className="flex items-center gap-3 px-4 py-4 text-forest hover:text-terracotta hover:bg-mist/50 rounded-2xl text-lg font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="w-6 h-6" />
                        My Account
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-4 text-terracotta hover:bg-terracotta/10 rounded-2xl text-lg font-medium text-left"
                      >
                        <ArrowRightOnRectangleIcon className="w-6 h-6" />
                        Sign out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          openAuthDialog({ mode: "signup" });
                        }}
                        className="w-full px-6 py-4 bg-terracotta hover:bg-terracotta-dark text-cream font-bold text-lg rounded-2xl transition-all shadow-lg shadow-terracotta/20"
                      >
                        Create Free Account
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          openAuthDialog({ mode: "login" });
                        }}
                        className="w-full px-6 py-4 text-forest hover:text-terracotta hover:bg-mist/50 rounded-2xl transition-colors text-center text-lg font-medium"
                      >
                        Log In
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Transition>
    </header>
  );
}

// User dropdown menu for desktop
function UserMenu({
  displayName,
  avatarUrl,
  userInitial,
  onSignOut,
  barSlug
}: {
  displayName: string;
  avatarUrl: string | null;
  userInitial: string;
  onSignOut: () => void;
  barSlug: string | null;
}) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-mist/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-terracotta/20 flex items-center justify-center text-terracotta font-bold text-sm">
            {userInitial}
          </div>
        )}
        <span className="text-sm text-forest hidden lg:block max-w-[120px] truncate">
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
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-white border border-mist shadow-card focus:outline-none overflow-hidden">
          <div className="px-4 py-3 border-b border-mist">
            <p className="text-sm font-medium text-forest truncate">{displayName}</p>
            <p className="text-xs text-sage">Free account</p>
          </div>

          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm ${
                    active ? "bg-mist/50 text-terracotta" : "text-forest"
                  }`}
                >
                  <Squares2X2Icon className="w-4 h-4" />
                  Dashboard
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  href={`/bar/${barSlug || ''}`}
                  prefetch={false}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm ${
                    active ? "bg-mist/50 text-terracotta" : "text-forest"
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
                  href="/account"
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm ${
                    active ? "bg-mist/50 text-terracotta" : "text-forest"
                  }`}
                >
                  <UserCircleIcon className="w-4 h-4" />
                  My Account
                </Link>
              )}
            </Menu.Item>
          </div>

          <div className="border-t border-mist py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onSignOut}
                  className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left ${
                    active ? "bg-terracotta/10 text-terracotta" : "text-sage"
                  }`}
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Sign out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
