import "server-only";
import { existsSync } from "fs";
import path from "path";

/** Local Envato/cover file under public/occasions/{slug}.jpg|webp if present. */
export function staticOccasionCoverIfPresent(slug: string): string | null {
  const absJpg = path.join(process.cwd(), "public", "occasions", `${slug}.jpg`);
  const absWebp = path.join(process.cwd(), "public", "occasions", `${slug}.webp`);
  if (existsSync(absJpg)) return `/occasions/${slug}.jpg`;
  if (existsSync(absWebp)) return `/occasions/${slug}.webp`;
  return null;
}
