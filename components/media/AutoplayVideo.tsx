"use client";

import { useEffect, useRef, useState } from "react";

type AutoplayVideoProps = {
  src: string;
  webmSrc?: string;
  poster: string;
  className?: string;
  videoClassName?: string;
  alt?: string;
};

/**
 * Muted looping background video with a still poster fallback.
 * Respects prefers-reduced-motion and only plays when in view.
 */
export function AutoplayVideo({
  src,
  webmSrc,
  poster,
  className = "",
  videoClassName = "absolute inset-0 h-full w-full object-cover",
  alt = "",
}: AutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldPlay, setShouldPlay] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShouldPlay(entry.isIntersecting),
      { rootMargin: "100px", threshold: 0.05 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion) return;

    if (shouldPlay) {
      const play = () => {
        video.play().catch(() => {});
      };
      if (video.readyState >= 2) {
        play();
      } else {
        video.addEventListener("loadeddata", play, { once: true });
      }
    } else {
      video.pause();
    }
  }, [shouldPlay, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none relative overflow-hidden ${className}`}
      aria-hidden={alt ? undefined : true}
      style={{
        backgroundImage: `url(${poster})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt={alt}
        className={`${videoClassName} z-0`}
        aria-hidden={alt ? undefined : true}
        draggable={false}
      />
      {!reducedMotion && (
        <video
          ref={videoRef}
          className={`${videoClassName} pointer-events-none z-[1]`}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          poster={poster}
          controls={false}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          aria-hidden="true"
        >
          {webmSrc ? <source src={webmSrc} type="video/webm" /> : null}
          <source src={src} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
