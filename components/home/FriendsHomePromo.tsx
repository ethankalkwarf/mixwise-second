"use client";

import Link from "next/link";
import { UserGroupIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { AppLink } from "@/components/mobile/AppLink";
import { isNativeApp } from "@/lib/mobile/platform";

type Props = {
  compact?: boolean;
};

export function FriendsHomePromo({ compact = false }: Props) {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading || !isAuthenticated) return null;

  const native = isNativeApp();
  const LinkComponent = native ? AppLink : Link;

  return (
    <section className={compact ? "mb-8" : "pb-8 sm:pb-10"}>
      <LinkComponent
        href="/friends"
        className={`group flex items-center gap-3 rounded-2xl border border-mist bg-white transition hover:border-olive/30 hover:bg-cream/40 active:scale-[0.99] ${
          compact ? "px-4 py-3" : "px-5 py-4"
        }`}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-mist/80 bg-cream text-olive">
          <UserGroupIcon className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-serif text-[15px] font-semibold leading-snug text-forest">
            Friends & activity
          </span>
          <span className="mt-0.5 block text-xs leading-snug text-sage">
            Follow friends, see what they&apos;re saving, and share your bar.
          </span>
        </span>
        <ChevronRightIcon
          className="h-4 w-4 shrink-0 text-sage/60 transition group-hover:text-olive"
          aria-hidden
        />
      </LinkComponent>
    </section>
  );
}
