"use client";

import React, { useState, Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Transition } from "@headlessui/react";
import { 
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Squares2X2Icon
} from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";

export interface NavItem {
  label: string;
  href: string;
}

interface BrutalHeaderProps {
  navItems: NavItem[];
}

export function BrutalHeader({ navItems }: BrutalHeaderProps) {
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
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="bg-cream border-b-4 border-brutal-black sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-brutal-black focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              aria-label="MixWise Home"
            >
              <span className="font-black text-2xl tracking-tighter italic text-brutal-black group-hover:-rotate-2 transition-transform inline-block">
                MIXWISE!
              </span>
            </Link>

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
                      className={`px-4 py-2 font-bold text-sm uppercase tracking-wider transition-all ${
                        isActive
                          ? "text-brutal-blue underline underline-offset-4 decoration-2"
                          : "text-brutal-black hover:text-brutal-blue"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right side: Auth */}
          <div className="flex items-center gap-3">
            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              {isLoading ? (
                <div className="w-24 h-10 bg-brutal-black/10 animate-pulse border-2 border-brutal-black" />
              ) : isAuthenticated ? (
                <BrutalUserMenu
                  displayName={displayName}
                  userInitial={userInitial}
                  onSignOut={handleSignOut}
                />
              ) : (
                <>
                  <button
                    onClick={() => openAuthDialog({ mode: "login" })}
                    className="px-4 py-2 font-bold text-sm uppercase tracking-wider border-2 border-brutal-black text-brutal-black hover:bg-brutal-black hover:text-cream transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => openAuthDialog({ mode: "signup" })}
                    className="px-4 py-2 bg-brutal-yellow font-bold text-sm uppercase tracking-wider border-2 border-brutal-black text-brutal-black shadow-hard-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                  >
                    Join Free
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden p-2 border-2 border-brutal-black text-brutal-black hover:bg-brutal-black hover:text-cream transition-colors"
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden border-t-2 border-brutal-black py-4">
            <ul className="space-y-1 mb-4">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block px-4 py-3 font-bold text-base uppercase tracking-wider transition-all ${
                        isActive
                          ? "text-brutal-blue bg-brutal-blue/10 border-l-4 border-brutal-blue"
                          : "text-brutal-black hover:bg-brutal-black/5 border-l-4 border-transparent"
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
            <div className="border-t-2 border-brutal-black pt-4">
              {isLoading ? (
                <div className="px-4 py-3">
                  <div className="h-12 bg-brutal-black/10 animate-pulse border-2 border-brutal-black" />
                </div>
              ) : isAuthenticated ? (
                <div className="space-y-2 px-4">
                  <div className="py-2 text-sm font-bold text-brutal-black/60 uppercase tracking-wider">
                    Signed in as {displayName}
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 py-3 font-bold text-brutal-black hover:text-brutal-blue"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Squares2X2Icon className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <Link
                    href="/account"
                    className="flex items-center gap-2 py-3 font-bold text-brutal-black hover:text-brutal-blue"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Cog6ToothIcon className="w-5 h-5" />
                    My Account
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full py-3 font-bold text-red-600 hover:text-red-700 text-left"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="space-y-3 px-4">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthDialog({ mode: "signup" });
                    }}
                    className="w-full px-4 py-3 bg-brutal-yellow font-bold uppercase tracking-wider border-4 border-brutal-black text-brutal-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                  >
                    Join Free
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthDialog({ mode: "login" });
                    }}
                    className="w-full px-4 py-3 font-bold uppercase tracking-wider border-4 border-brutal-black text-brutal-black hover:bg-brutal-black hover:text-cream transition-colors text-center"
                  >
                    Log In
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

// User dropdown menu for desktop
function BrutalUserMenu({
  displayName,
  userInitial,
  onSignOut
}: {
  displayName: string;
  userInitial: string;
  onSignOut: () => void;
}) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 px-3 py-2 border-2 border-brutal-black hover:bg-brutal-black hover:text-cream transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brutal-black focus-visible:ring-offset-2">
        <div className="w-7 h-7 bg-brutal-pink border-2 border-brutal-black flex items-center justify-center font-black text-sm text-brutal-black">
          {userInitial}
        </div>
        <span className="text-sm font-bold hidden lg:block max-w-[100px] truncate uppercase">
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
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-cream border-4 border-brutal-black shadow-hard focus:outline-none overflow-hidden">
          <div className="px-4 py-3 border-b-2 border-brutal-black">
            <p className="text-sm font-bold text-brutal-black truncate uppercase">{displayName}</p>
            <p className="text-xs font-mono text-brutal-black/60">Free account</p>
          </div>

          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wider ${
                    active ? "bg-brutal-yellow text-brutal-black" : "text-brutal-black"
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
                  href="/account"
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wider ${
                    active ? "bg-brutal-yellow text-brutal-black" : "text-brutal-black"
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  My Account
                </Link>
              )}
            </Menu.Item>
          </div>

          <div className="border-t-2 border-brutal-black py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onSignOut}
                  className={`flex items-center gap-2 w-full px-4 py-3 text-sm font-bold uppercase tracking-wider text-left ${
                    active ? "bg-red-100 text-red-600" : "text-red-600"
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


