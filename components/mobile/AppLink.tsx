"use client";

import type { AnchorHTMLAttributes, ReactNode, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { navigateInApp } from "@/lib/mobile/navigate";
import { isNativeApp } from "@/lib/mobile/platform";

type Props = {
  href: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

/** In-app navigation for the native shell. Never does a full http load (that opens Safari). */
export function AppLink({ href, children, onClick, ...props }: Props) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (!href.startsWith("/") || href.startsWith("//")) return;

    if (isNativeApp()) {
      event.preventDefault();
      event.stopPropagation();
      navigateInApp(router, href);
    }
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
