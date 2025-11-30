"use client";

import React, { useState, Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Transition } from "@headlessui/react";
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";

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

  return (
    <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-lg sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 rounded-lg"
              aria-label="MixWise Home"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-lime-400 to-emerald-600 shadow-lg shadow-lime-500/20 flex items-center justify-center text-sm font-serif font-bold text-slate-900 group-hover:shadow-lime-500/40 transition-shadow">
                MW
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold tracking-tight text-xl text-slate-100 group-hover:text-white transition-colors">
                  MixWise
                </span>
              </div>
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
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 ${
                      isActive
                        ? "text-lime-400 bg-lime-500/10"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right side: Auth */}
          <div className="flex items-center gap-3">
            {/* Desktop Auth */}
            <div className="hidden md:flex items-center">
              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />
              ) : isAuthenticated ? (
                <UserMenu
                  displayName={displayName}
                  avatarUrl={avatarUrl}
                  userInitial={userInitial}
                  onSignOut={handleSignOut}
                />
              ) : (
                <button
                  onClick={() => openAuthDialog()}
                  className="px-4 py-2 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold text-sm rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Sign in
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
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
          <div id="mobile-menu" className="md:hidden border-t border-white/5 py-4">
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
                      className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${
                        isActive
                          ? "text-lime-400 bg-lime-500/10"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
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
            <div className="border-t border-white/5 pt-4">
              {isLoading ? (
                <div className="px-4 py-3">
                  <div className="h-10 bg-slate-800 rounded-lg animate-pulse" />
                </div>
              ) : isAuthenticated ? (
                <div className="space-y-1">
                  <div className="px-4 py-2 text-sm text-slate-400">
                    Signed in as <span className="text-slate-200 font-medium">{displayName}</span>
                  </div>
                  <Link
                    href="/account"
                    className="flex items-center gap-2 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Cog6ToothIcon className="w-5 h-5" />
                    My Account
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full px-4 py-3 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-left"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthDialog();
                  }}
                  className="w-full px-4 py-3 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold rounded-lg transition-colors"
                >
                  Sign in / Create account
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

// User dropdown menu for desktop
function UserMenu({
  displayName,
  avatarUrl,
  userInitial,
  onSignOut
}: {
  displayName: string;
  avatarUrl: string | null;
  userInitial: string;
  onSignOut: () => void;
}) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-400 font-bold text-sm">
            {userInitial}
          </div>
        )}
        <span className="text-sm text-slate-300 hidden lg:block max-w-[120px] truncate">
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
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-slate-900 border border-slate-700 shadow-xl focus:outline-none overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-sm font-medium text-slate-200 truncate">{displayName}</p>
            <p className="text-xs text-slate-500">Free account</p>
          </div>

          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/account"
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm ${
                    active ? "bg-white/5 text-white" : "text-slate-300"
                  }`}
                >
                  <UserCircleIcon className="w-4 h-4" />
                  My Account
                </Link>
              )}
            </Menu.Item>
          </div>

          <div className="border-t border-slate-700 py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onSignOut}
                  className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left ${
                    active ? "bg-red-500/10 text-red-400" : "text-slate-400"
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
