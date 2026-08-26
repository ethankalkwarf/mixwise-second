/**
 * Routes whose content should extend under the status bar in the native shell.
 * MobileLayout skips top safe-area padding on these paths; heroes handle insets locally.
 */
export function nativeBleedsTop(pathname: string): boolean {
  if (pathname === "/" || pathname === "/saved") return true;

  if (pathname.startsWith("/cocktails/") && pathname.length > "/cocktails/".length) {
    return true;
  }

  if (pathname === "/ingredients" || pathname.startsWith("/ingredients/")) {
    return true;
  }

  if (
    pathname.startsWith("/learn/guides/") ||
    pathname.startsWith("/learn/methods/") ||
    pathname.startsWith("/learn/techniques/") ||
    pathname.startsWith("/learn/paths/")
  ) {
    return true;
  }

  if (pathname.startsWith("/occasions/") && pathname.length > "/occasions/".length) {
    return true;
  }

  return false;
}
