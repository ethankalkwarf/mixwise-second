"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useUser();
  const { openAuthDialog } = useAuthDialog();

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-b border-mist bg-cream/95 backdrop-blur-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="h-16 sm:h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl font-display font-medium text-forest hover:text-terracotta transition-colors"
            >
              mixwise.
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/cocktails"
              className="text-charcoal hover:text-terracotta transition-colors font-medium"
            >
              Browse Recipes
            </Link>
            <Link
              href="/mix"
              className="text-charcoal hover:text-terracotta transition-colors font-medium"
            >
              Mix With What You Have
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <Menu as="div" className="relative">
                <Menu.Button className="text-charcoal hover:text-terracotta transition-colors font-medium">
                  {user?.email?.split("@")[0] || "Account"}
                </Menu.Button>
                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-white border border-mist rounded-xl shadow-lg py-2 z-50">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/dashboard"
                          className={`block px-4 py-2 text-sm ${
                            active ? "bg-mist text-forest" : "text-charcoal"
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
                          className={`block px-4 py-2 text-sm ${
                            active ? "bg-mist text-forest" : "text-charcoal"
                          }`}
                        >
                          Account
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleSignOut}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            active ? "bg-mist text-forest" : "text-charcoal"
                          }`}
                        >
                          Sign Out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <>
                <button
                  onClick={() => openAuthDialog({ title: "Sign In", subtitle: "Access your personalized dashboard" })}
                  className="text-charcoal hover:text-terracotta transition-colors font-medium"
                >
                  Log In
                </button>
                <Link
                  href="/account-benefits"
                  className="inline-flex items-center rounded-full px-6 py-2.5 text-sm font-medium bg-terracotta text-cream hover:bg-terracotta-dark transition-colors"
                >
                  Sign Up For Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-charcoal hover:text-terracotta transition-colors"
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
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <div className="md:hidden border-t border-mist bg-cream/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/cocktails"
                className="block px-3 py-2 text-base font-medium text-charcoal hover:text-terracotta transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Recipes
              </Link>
              <Link
                href="/mix"
                className="block px-3 py-2 text-base font-medium text-charcoal hover:text-terracotta transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Mix With What You Have
              </Link>

              <div className="border-t border-mist mt-4 pt-4">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 text-sm text-sage">
                      Signed in as {user?.email?.split("@")[0]}
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 text-base font-medium text-charcoal hover:text-terracotta transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/account"
                      className="block px-3 py-2 text-base font-medium text-charcoal hover:text-terracotta transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Account
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-charcoal hover:text-terracotta transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        openAuthDialog({ title: "Sign In", subtitle: "Access your personalized dashboard" });
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-charcoal hover:text-terracotta transition-colors"
                    >
                      Log In
                    </button>
                    <Link
                      href="/account-benefits"
                      className="block px-3 py-2 text-base font-medium bg-terracotta text-cream rounded-lg mx-3 mt-2 text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up For Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </Transition>
      </nav>
    </header>
  );
}
