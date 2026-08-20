"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AppLink } from "@/components/mobile/AppLink";
import { useNativeShell } from "@/hooks/useIsNativeApp";

type Props = {
  href: string;
  ariaLabel: string;
  className?: string;
  children: ReactNode;
};

/**
 * Learn library cards in native shell. Photo + text must not sit inside <a> — WKWebView breaks layout.
 */
export function NativeLearnCardShell({ href, ariaLabel, className = "", children }: Props) {
  const nativeShell = useNativeShell();

  if (!nativeShell) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <div className={`native-learn-card ${className}`.trim()}>
      {children}
      <AppLink href={href} aria-label={ariaLabel} className="native-learn-card__hit">
        <span aria-hidden="true" />
      </AppLink>
    </div>
  );
}
