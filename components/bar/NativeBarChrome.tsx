"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import { AppLink } from "@/components/mobile/AppLink";
import { navigateInApp } from "@/lib/mobile/navigate";

/** Native-only top chrome for public bar pages. */
export function NativeBarChrome({
  isOwner,
  editHref = "/account",
}: {
  isOwner?: boolean;
  editHref?: string;
}) {
  const native = useNativeShell();
  const router = useRouter();

  if (!native) return null;

  return (
    <div
      className="sticky top-0 z-20 -mx-4 mb-4 flex items-center justify-between gap-3 border-b border-mist/60 bg-cream/95 px-4 py-3 backdrop-blur-md sm:-mx-0 sm:rounded-2xl sm:border sm:border-mist/70"
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))" }}
    >
      <button
        type="button"
        onClick={() => {
          if (window.history.length > 1) router.back();
          else navigateInApp(router, "/");
        }}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-forest shadow-sm"
        aria-label="Back"
      >
        <ArrowLeftIcon className="h-5 w-5" />
      </button>
      <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-forest">
        Public profile
      </p>
      {isOwner ? (
        <AppLink
          href={editHref}
          className="flex h-10 items-center gap-1.5 rounded-full bg-white px-3 text-sm font-semibold text-forest shadow-sm"
        >
          <PencilSquareIcon className="h-4 w-4 text-olive" />
          Edit
        </AppLink>
      ) : (
        <span className="w-10" aria-hidden />
      )}
    </div>
  );
}
