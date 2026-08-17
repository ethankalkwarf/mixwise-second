/**
 * Learn is public by default (indexed, linked from nav/footer).
 * Set NEXT_PUBLIC_LEARN_PUBLIC=false to hide discovery paths and noindex /learn.
 */

export function isLearnPublic(): boolean {
  return process.env.NEXT_PUBLIC_LEARN_PUBLIC !== "false";
}
