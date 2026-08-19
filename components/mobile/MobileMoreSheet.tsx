"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { navigateInApp } from "@/lib/mobile/navigate";
import {
  BeakerIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  HeartIcon,
  ShoppingCartIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { usePreferredAuthMode } from "@/lib/auth/returning-user";
import { useMobileApp } from "@/components/mobile/MobileAppProvider";
import { replayNativeIntro } from "@/lib/mobile/nativeIntro";

type MoreRow = {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const BROWSE_ROWS: MoreRow[] = [
  {
    href: "/cocktails?browse=collections",
    label: "Collections",
    description: "Curated lists for every mood",
    icon: CalendarDaysIcon,
  },
  {
    href: "/cocktails",
    label: "All recipes",
    description: "Browse the full catalog",
    icon: BookOpenIcon,
  },
  {
    href: "/ingredients",
    label: "Ingredients",
    description: "Guides and bottle picks",
    icon: BeakerIcon,
  },
];

const TOOL_ROWS: MoreRow[] = [
  {
    href: "/saved",
    label: "Favorites",
    description: "Recipes you've saved",
    icon: HeartIcon,
  },
  {
    href: "/shopping-list",
    label: "Shopping list",
    description: "Track what to buy next",
    icon: ShoppingCartIcon,
  },
];

export function MobileMoreSheet() {
  const { moreOpen, closeMore } = useMobileApp();
  const router = useRouter();
  const { user, profile, isAuthenticated, isLoading } = useUser();
  const { openAuthDialog } = useAuthDialog();
  const preferredAuthMode = usePreferredAuthMode();

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
  const userInitial = displayName.charAt(0).toUpperCase();

  const navigate = (href: string) => {
    closeMore();
    navigateInApp(router, href);
  };

  if (!moreOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
        aria-label="Close menu"
        onClick={closeMore}
      />
      <div
        className="absolute bottom-0 left-0 right-0 flex max-h-[88vh] flex-col overflow-hidden rounded-t-[28px] bg-cream shadow-2xl shadow-charcoal/20"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 5rem)" }}
        role="dialog"
        aria-modal="true"
        aria-label="More"
      >
        <div className="flex-shrink-0 px-5 pt-3 pb-2">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-mist" aria-hidden />
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-forest">More</h2>
            <button
              type="button"
              onClick={closeMore}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-sage active:scale-95 transition-transform"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-4">
          <button
            type="button"
            onClick={() => navigate("/cocktail-of-the-day")}
            className="flex w-full items-center gap-4 rounded-3xl bg-gradient-to-r from-forest to-charcoal p-4 text-left text-cream shadow-lg active:scale-[0.98] transition-transform"
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-cream/15">
              <SparklesIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-cream/70">
                Daily spotlight
              </p>
              <p className="font-display text-lg font-bold">Drink of the Day</p>
            </div>
            <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-cream/60" />
          </button>

          <MoreSection title="Browse">
            {BROWSE_ROWS.map((row) => (
              <MoreRowButton key={row.href} row={row} onNavigate={navigate} />
            ))}
          </MoreSection>

          <MoreSection title="Tools">
            {TOOL_ROWS.map((row) => (
              <MoreRowButton key={row.href} row={row} onNavigate={navigate} />
            ))}
          </MoreSection>

          {isLoading ? (
            <div className="h-16 animate-pulse rounded-3xl bg-mist/60" />
          ) : isAuthenticated ? (
            <button
              type="button"
              onClick={() => navigate("/saved")}
              className="flex w-full items-center gap-3 rounded-3xl border border-white/60 bg-white/80 px-4 py-4 text-left shadow-md active:scale-[0.98] transition-transform"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-2xl border border-mist object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-terracotta/15 text-lg font-bold text-terracotta">
                  {userInitial}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-forest">{displayName}</p>
                <p className="truncate text-xs text-sage">Profile, settings, and progress</p>
              </div>
              <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-sage" />
            </button>
          ) : (
            <div className="rounded-3xl border border-white/60 bg-white/80 p-5 text-center shadow-md">
              <p className="mb-1 font-display text-lg font-bold text-forest">Save your bar</p>
              <p className="mb-4 text-sm text-sage">
                Sign in to sync your cabinet, favorites, and progress across devices.
              </p>
              <button
                type="button"
                onClick={() => {
                  openAuthDialog({ mode: preferredAuthMode });
                  closeMore();
                }}
                className="w-full rounded-2xl bg-terracotta py-3.5 text-sm font-bold text-cream shadow-lg shadow-terracotta/25 active:scale-[0.98] transition-transform"
              >
                {preferredAuthMode === "login" ? "Log in" : "Create free account"}
              </button>
              <button
                type="button"
                onClick={() => {
                  openAuthDialog({ mode: preferredAuthMode === "login" ? "signup" : "login" });
                  closeMore();
                }}
                className="mt-2 w-full py-2 text-sm font-medium text-sage"
              >
                {preferredAuthMode === "login" ? "Sign up free" : "Log in instead"}
              </button>
              <button
                type="button"
                onClick={() => {
                  closeMore();
                  replayNativeIntro();
                }}
                className="mt-3 w-full py-2 text-sm font-medium text-terracotta"
              >
                How MixWise works
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MoreSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-sage">{title}</p>
      <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-sm">
        {children}
      </div>
    </section>
  );
}

function MoreRowButton({
  row,
  onNavigate,
}: {
  row: MoreRow;
  onNavigate: (href: string) => void;
}) {
  const Icon = row.icon;

  return (
    <button
      type="button"
      onClick={() => onNavigate(row.href)}
      className="native-menu-row flex w-full items-center gap-3 border-t border-mist/60 px-4 py-3.5 text-left first:border-t-0 active:bg-mist/20"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-cream text-forest">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-forest">{row.label}</p>
        <p className="text-xs text-sage">{row.description}</p>
      </div>
      <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-sage/70" />
    </button>
  );
}
