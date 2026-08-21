"use client";

import type { AnchorHTMLAttributes, ReactNode, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { navigateInApp } from "@/lib/mobile/navigate";
import { isNativeApp } from "@/lib/mobile/platform";

type Props = {
  href: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

function stayInNativeShell(): boolean {
  if (typeof document !== "undefined" && document.documentElement.classList.contains("native-app")) {
    return true;
  }
  return isNativeApp();
}

/**
 * Full-document navigation on web. Client router navigation in the native shell
 * so recipe pages stay inside the app WebView.
 */
export function HardNavLink({ href, children, onClick, ...props }: Props) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (!href.startsWith("/") || href.startsWith("//")) return;

    if (stayInNativeShell()) {
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
