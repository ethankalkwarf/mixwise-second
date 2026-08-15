"use client";

import { useEffect, useState, type ReactNode } from "react";
import { HardNavLink } from "@/components/layout/HardNavLink";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Bars3Icon,
  BookOpenIcon,
  HomeIcon,
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
import { isLearnPublic } from "@/lib/learnAccess";
import { usePreferredAuthMode } from "@/lib/auth/returning-user";
import { ShareBarButton } from "@/components/bar/ShareBarButton";

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
      path.startsWith("/learn") ||
      path.startsWith("/ingredients"),
    Icon: BookOpenIcon,
    IconActive: BookOpenIconSolid,
  },
] as const;

const SHEET_ROW =
  "flex min-h-12 w-full items-center gap-2 px-4 text-[16px] font-medium text-charcoal active:bg-mist/70";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const { user, profile, isAuthenticated, isLoading, signOut } = useUser();
  const { openAuthDialog } = useAuthDialog();
  const preferredAuthMode = usePreferredAuthMode();

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
      <nav className="mw-tabbar md:hidden" aria-label="Mobile navigation">
        {TABS.map((tab) => {
          const active = tab.match(pathname || "");
          const Icon = active ? tab.IconActive : tab.Icon;
          return (
            <HardNavLink
              key={tab.id}
              href={tab.href}
              className={`mw-tabbar__item${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="mw-tabbar__icon" aria-hidden />
              <span>{tab.label}</span>
            </HardNavLink>
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
          aria-label="More"
        >
          <div className="mw-mobile-sheet__handle" aria-hidden />
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="font-display text-xl text-forest">More</h2>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full text-sage active:bg-mist/70"
              aria-label="Close menu"
              onClick={closeMore}
            >
              <XMarkIcon className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <SheetGroup>
            <SheetLink href="/cocktail-of-the-day" onClick={closeMore}>
              Drink of the Day
            </SheetLink>
            <SheetLink href="/ingredients" onClick={closeMore}>
              Ingredients
            </SheetLink>
            <SheetLink href="/occasions" onClick={closeMore}>
              Collections
            </SheetLink>
            {isLearnPublic() ? (
              <SheetLink href="/learn" onClick={closeMore}>
                Learn
              </SheetLink>
            ) : null}
          </SheetGroup>

          <div className="mt-3">
            {isLoading ? (
              <div className="h-12 animate-pulse rounded-2xl bg-mist" />
            ) : isAuthenticated ? (
              <SheetGroup>
                <div className="flex items-center gap-3 px-4 py-3">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full border border-mist object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta/20 text-sm font-semibold text-terracotta">
                      {userInitial}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-forest">{displayName}</p>
                    <p className="truncate text-xs text-sage">{user?.email}</p>
                  </div>
                </div>
                <SheetLink href="/dashboard" onClick={closeMore}>
                  Dashboard
                </SheetLink>
                <ShareBarButton
                  variant="menu"
                  className={SHEET_ROW}
                  onShared={closeMore}
                />
                <SheetLink href="/account" onClick={closeMore}>
                  Account
                </SheetLink>
                <button type="button" onClick={handleSignOut} className={SHEET_ROW}>
                  Sign out
                </button>
              </SheetGroup>
            ) : (
              <div className="px-1 pt-1">
                {preferredAuthMode === "login" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        openAuthDialog({ mode: "login" });
                        closeMore();
                      }}
                      className="flex w-full items-center justify-center rounded-xl bg-terracotta px-4 py-3 text-base font-semibold text-cream !justify-center !text-center"
                    >
                      Log in
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        openAuthDialog({ mode: "signup" });
                        closeMore();
                      }}
                      className="mt-1 flex w-full items-center justify-center px-4 py-2.5 text-sm font-medium text-sage !justify-center !text-center"
                    >
                      Sign up free
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        openAuthDialog({ mode: "signup" });
                        closeMore();
                      }}
                      className="flex w-full items-center justify-center rounded-xl bg-terracotta px-4 py-3 text-base font-semibold text-cream !justify-center !text-center"
                    >
                      Sign up free
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        openAuthDialog({ mode: "login" });
                        closeMore();
                      }}
                      className="mt-1 flex w-full items-center justify-center px-4 py-2.5 text-sm font-medium text-sage !justify-center !text-center"
                    >
                      Log in
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function SheetGroup({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white/70 divide-y divide-mist/80">
      {children}
    </div>
  );
}

function SheetLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <HardNavLink href={href} className={SHEET_ROW} onClick={onClick}>
      {children}
    </HardNavLink>
  );
}
