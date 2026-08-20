"use client";

import Image from "next/image";
import { useState } from "react";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import { learnImageUrl } from "@/lib/mobile/learnImage";

type Props = {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  /** Fill a positioned parent (native library thumbs + heroes). */
  fill?: boolean;
};

/** Keep object-cover unless the caller already set an object-* fit. */
function withObjectCover(className?: string) {
  if (!className) return "object-cover";
  if (/\bobject-(?:contain|cover|fill|none|scale-down)\b/.test(className)) {
    return className;
  }
  return `object-cover ${className}`;
}

/**
 * Learn thumbnails and heroes. Native shell uses plain <img> — next/image fill breaks in WKWebView.
 * Do not render inside <a> on native; use NativeLearnCardShell instead.
 */
export function LearnCoverImage({
  src,
  alt,
  className,
  containerClassName,
  sizes = "100vw",
  priority = false,
  width,
  height,
  fill = false,
}: Props) {
  const nativeShell = useNativeShell();
  const [failed, setFailed] = useState(false);
  const resolved = learnImageUrl(src, 640, 85) || src;
  const imageClassName = withObjectCover(className);

  if (nativeShell) {
    const imgClass = [
      fill ? "native-learn-cover native-learn-cover--fill" : "native-learn-cover",
      imageClassName,
    ]
      .filter(Boolean)
      .join(" ");

    if (failed) {
      return (
        <div
          className={[
            fill ? "native-learn-cover-fallback native-learn-cover-fallback--fill" : "native-learn-cover-fallback",
            containerClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          Learn
        </div>
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolved}
        alt={alt}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        onError={() => setFailed(true)}
        className={imgClass}
      />
    );
  }

  if (width && height) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className={imageClassName}
      />
    );
  }

  return (
    <div className={containerClassName ?? "relative h-full w-full"}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={imageClassName} />
    </div>
  );
}
