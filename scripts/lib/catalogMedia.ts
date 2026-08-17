/**
 * Publish MixWise catalog photos to Vercel Blob and keep Supabase Storage
 * as a private archive. Scripts only — do not import from the Next.js app
 * (pulls in sharp).
 */

import { put } from "@vercel/blob";
import sharp from "sharp";
import type { SupabaseClient } from "@supabase/supabase-js";

export const CATALOG_STORAGE_BUCKET = "cocktail-images-fullsize";
export const CATALOG_PUBLIC_WIDTH = 1200;
export const CATALOG_WEBP_QUALITY = 80;
export const CATALOG_CACHE_SECONDS = 60 * 60 * 24 * 365;

export function cocktailBlobPath(slug: string): string {
  return `catalog/cocktails/${slug}.webp`;
}

export function ingredientBlobPath(slug: string): string {
  return `catalog/ingredients/${slug}.webp`;
}

export function isVercelBlobUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes(".public.blob.vercel-storage.com");
}

export function isSupabaseStorageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.endsWith(".supabase.co") &&
      parsed.pathname.includes("/storage/")
    );
  } catch {
    return false;
  }
}

export function storagePathFromPublicUrl(
  url: string,
  bucket = CATALOG_STORAGE_BUCKET
): string | null {
  const markers = [
    `/storage/v1/object/public/${bucket}/`,
    `/storage/v1/object/sign/${bucket}/`,
    `/storage/v1/object/authenticated/${bucket}/`,
  ];
  for (const marker of markers) {
    const idx = url.indexOf(marker);
    if (idx === -1) continue;
    const rest = url.slice(idx + marker.length).split("?")[0];
    try {
      return decodeURIComponent(rest);
    } catch {
      return rest;
    }
  }
  return null;
}

export async function downloadStorageObject(
  supabase: SupabaseClient,
  path: string,
  bucket = CATALOG_STORAGE_BUCKET
): Promise<Buffer> {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error || !data) {
    throw new Error(error?.message || `Failed to download ${bucket}/${path}`);
  }
  return Buffer.from(await data.arrayBuffer());
}

export async function toCatalogWebp(image: Buffer): Promise<Buffer> {
  return sharp(image)
    .rotate()
    .resize({ width: CATALOG_PUBLIC_WIDTH, withoutEnlargement: true })
    .webp({ quality: CATALOG_WEBP_QUALITY })
    .toBuffer();
}

export async function publishWebpToBlob(
  pathname: string,
  image: Buffer
): Promise<{ url: string; bytes: number }> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is required. Add the Vercel Blob store token to .env.local."
    );
  }

  const webp = await toCatalogWebp(image);
  const blob = await put(pathname, webp, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "image/webp",
    cacheControlMaxAge: CATALOG_CACHE_SECONDS,
  });

  return { url: blob.url, bytes: webp.length };
}

export async function publishStorageObjectToBlob(
  supabase: SupabaseClient,
  opts: { storagePath: string; blobPath: string }
): Promise<{ url: string; sourceBytes: number; publicBytes: number }> {
  const source = await downloadStorageObject(supabase, opts.storagePath);
  const published = await publishWebpToBlob(opts.blobPath, source);
  return {
    url: published.url,
    sourceBytes: source.length,
    publicBytes: published.bytes,
  };
}
