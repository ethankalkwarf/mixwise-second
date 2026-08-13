/**
 * Learn is unpublished: keep routes alive for direct-URL preview,
 * but hide every public discovery path until NEXT_PUBLIC_LEARN_PUBLIC=true.
 */

export function isLearnPublic(): boolean {
  return process.env.NEXT_PUBLIC_LEARN_PUBLIC === "true";
}
