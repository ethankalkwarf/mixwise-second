/**
 * Public JPEG proxy for MixWise emails.
 *
 * Catalog photos are WebP. Outlook (and some Gmail/proxy paths) will not
 * render them. This endpoint always returns image/jpeg from an allowlisted
 * source so <img> tags in Resend HTML work in every major client.
 */

import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import {
  MEDIA_DELIVERY,
  isAllowedEmailImageSource,
} from "@/lib/mediaDelivery";

export const runtime = "nodejs";

const MAX_SOURCE_BYTES = 8 * 1024 * 1024;
const MIN_WIDTH = 32;
const MAX_WIDTH = 1200;
const MIN_QUALITY = 40;
const MAX_QUALITY = 90;

function clamp(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("url");
  if (!source || !isAllowedEmailImageSource(source)) {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }

  const width = clamp(
    Number(request.nextUrl.searchParams.get("w")),
    MIN_WIDTH,
    MAX_WIDTH,
    MEDIA_DELIVERY.email.width
  );
  const quality = clamp(
    Number(request.nextUrl.searchParams.get("q")),
    MIN_QUALITY,
    MAX_QUALITY,
    MEDIA_DELIVERY.email.quality
  );

  try {
    const upstream = await fetch(source, {
      headers: { Accept: "image/*" },
      redirect: "error",
      cache: "force-cache",
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Upstream image failed" },
        { status: 502 }
      );
    }

    const contentLength = Number(upstream.headers.get("content-length") || 0);
    if (contentLength > MAX_SOURCE_BYTES) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }

    const sourceBytes = Buffer.from(await upstream.arrayBuffer());
    if (sourceBytes.length > MAX_SOURCE_BYTES) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }

    const jpeg = await sharp(sourceBytes)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    return new NextResponse(new Uint8Array(jpeg), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[email-image] Failed to convert image:", error);
    return NextResponse.json({ error: "Image conversion failed" }, { status: 502 });
  }
}
