"use client";

import Image from "next/image";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { AppLink } from "@/components/mobile/AppLink";

type Props = {
  href: string;
  name: string;
  imageUrl?: string | null;
  subtitle?: string;
  className?: string;
};

export function FavoriteDrinkRow({
  href,
  name,
  imageUrl,
  subtitle,
  className,
}: Props) {
  const classes = [
    "group flex items-center gap-3 rounded-2xl border border-mist bg-white px-3 py-2.5 transition hover:border-olive/30 hover:bg-cream/40 active:scale-[0.99] outline-none focus:outline-none",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AppLink href={href} className={classes}>
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-mist/80 bg-mist">
        {imageUrl?.startsWith("http") ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl">🍸</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-serif text-[15px] font-semibold leading-snug text-forest line-clamp-2">
          {name}
        </p>
        {subtitle ? (
          <p className="mt-0.5 text-xs leading-snug text-sage">{subtitle}</p>
        ) : null}
      </div>
      <ChevronRightIcon
        className="h-4 w-4 shrink-0 text-sage/60 transition group-hover:text-olive"
        aria-hidden
      />
    </AppLink>
  );
}
