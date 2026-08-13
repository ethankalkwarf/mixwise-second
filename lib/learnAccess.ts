/**
 * Learn is hidden from guests until published.
 * Set NEXT_PUBLIC_LEARN_PUBLIC=true to open it to everyone.
 * While gated, signed-in users can still preview at /learn.
 */

export function isLearnPublic(): boolean {
  return process.env.NEXT_PUBLIC_LEARN_PUBLIC === "true";
}

export function isLearnRoute(pathname: string): boolean {
  return pathname === "/learn" || pathname.startsWith("/learn/");
}
