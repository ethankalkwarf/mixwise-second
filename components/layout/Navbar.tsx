"use client";

import { useState, Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { BrandLogo } from "@/components/common/BrandLogo";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, isAuthenticated, isLoading, signOut } = useUser();
  const { openAuthDialog } = useAuthDialog();

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  // Get user display info
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="border-b border-mist bg-cream/95 backdrop-blur-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6" aria-label="Main navigation">
        <div className="h-16 sm:h-18 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <BrandLogo size="md" variant="dark" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/cocktail-of-the-day"
              className="text-charcoal hover:text-terracotta transition-colors font-medium text-sm"
            >
              Cocktail of the Day
            </Link>
            <Link
              href="/cocktails"
              className="text-charcoal hover:text-terracotta transition-colors font-medium text-sm"
            >
              Browse Cocktail Recipes
            </Link>
            <Link
              href="/mix"
              className="text-charcoal hover:text-terracotta transition-colors font-medium text-sm"
            >
              Open Mixology Wizard
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-mist animate-pulse" />
            ) : isAuthenticated ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-mist/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt=""
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover border border-mist"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-terracotta/20 flex items-center justify-center text-terracotta font-bold text-sm">
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
                  className="inline-flex items-center rounded-full px-5 py-2 text-sm font-medium bg-terracotta text-cream hover:bg-terracotta-dark transition-colors shadow-sm"
                >
                  Sign Up Free
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-charcoal hover:text-terracotta transition-colors rounded-xl"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <Transition
          show={mobileMenuOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 -translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-2"
        >
          <div className="md:hidden border-t border-mist bg-cream py-4">
            <div className="space-y-1">
              <Link
                href="/cocktail-of-the-day"
                className="block px-3 py-3 text-base font-medium text-charcoal hover:text-terracotta hover:bg-mist/50 rounded-xl transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cocktail of the Day
              </Link>
              <Link
                href="/cocktails"
                className="block px-3 py-3 text-base font-medium text-charcoal hover:text-terracotta hover:bg-mist/50 rounded-xl transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Cocktail Recipes
              </Link>
              <Link
                href="/mix"
                className="block px-3 py-3 text-base font-medium text-charcoal hover:text-terracotta hover:bg-mist/50 rounded-xl transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Open Mixology Wizard
              </Link>

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
                        <div className="w-10 h-10 rounded-full bg-terracotta/20 flex items-center justify-center text-terracotta font-bold">
                          {userInitial}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-forest">{displayName}</p>
                        <p className="text-xs text-sage">{user?.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-3 py-3 text-base font-medium text-charcoal hover:text-terracotta hover:bg-mist/50 rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/account"
                      className="block px-3 py-3 text-base font-medium text-charcoal hover:text-terracotta hover:bg-mist/50 rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Account Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-3 py-3 text-base font-medium text-terracotta hover:bg-terracotta/10 rounded-xl transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="space-y-2 px-3">
                    <button
                      onClick={() => {
                        openAuthDialog({ mode: "login" });
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-center px-4 py-3 text-base font-medium text-charcoal hover:text-terracotta border border-mist rounded-xl transition-colors"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => {
                        openAuthDialog({ mode: "signup" });
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-center px-4 py-3 text-base font-medium bg-terracotta text-cream rounded-xl hover:bg-terracotta-dark transition-colors"
                    >
                      Sign Up Free
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Transition>
      </nav>
    </header>
  );
}
