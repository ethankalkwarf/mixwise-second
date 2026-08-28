"use client";

import { useId } from "react";
import { nativePhotoUrl } from "@/lib/mobile/nativeImage";

export type ShakePourPhase = "idle" | "filling" | "loading" | "poured";

type Props = {
  phase: ShakePourPhase;
  imageUrl?: string | null;
  className?: string;
};

/**
 * Coupe that fills while MixWise listens for a shake.
 * Photo + fill live in a bowl clip — never inside an <a> (WKWebView).
 */
export function ShakePourGlass({ phase, imageUrl, className = "" }: Props) {
  const uid = useId().replace(/:/g, "");
  const bowl = `mw-bowl-${uid}`;
  const liquid = `mw-liq-${uid}`;
  const glass = `mw-gls-${uid}`;
  const stem = `mw-stm-${uid}`;
  const photo = imageUrl ? nativePhotoUrl(imageUrl, 640) || imageUrl : null;

  return (
    <div className={`mw-pour-glass mw-pour-glass--${phase} ${className}`.trim()} aria-hidden>
      <div className="mw-pour-glow" />
      <svg viewBox="0 0 240 340" className="mw-pour-svg" fill="none">
        <defs>
          <linearGradient id={liquid} x1="80" y1="200" x2="170" y2="60">
            <stop offset="0%" stopColor="#8F3A2C" />
            <stop offset="42%" stopColor="#BC5A45" />
            <stop offset="78%" stopColor="#E09A5A" />
            <stop offset="100%" stopColor="#F4D4A0" />
          </linearGradient>
          <linearGradient id={glass} x1="50" y1="50" x2="190" y2="190">
            <stop offset="0%" stopColor="#F9F7F2" stopOpacity="0.28" />
            <stop offset="55%" stopColor="#F9F7F2" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#F9F7F2" stopOpacity="0.16" />
          </linearGradient>
          <linearGradient id={stem} x1="120" y1="192" x2="120" y2="288">
            <stop offset="0%" stopColor="#F9F7F2" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#F9F7F2" stopOpacity="0.22" />
          </linearGradient>
          <clipPath id={bowl}>
            <path d="M36 72C38 128 70 176 120 192C170 176 202 128 204 72C198 54 42 54 36 72Z" />
          </clipPath>
        </defs>

        <ellipse cx="120" cy="318" rx="52" ry="7" fill="#0c0a08" opacity="0.55" />

        {phase === "filling" || phase === "loading" ? (
          <rect
            className="mw-pour-stream"
            x="117.5"
            y="4"
            width="5"
            height="68"
            rx="2.5"
            fill="#E8B87A"
          />
        ) : null}

        <path
          d="M36 72C38 128 70 176 120 192C170 176 202 128 204 72C198 54 42 54 36 72Z"
          fill={`url(#${glass})`}
        />

        <g clipPath={`url(#${bowl})`}>
          <g className="mw-pour-fill">
            <rect x="32" y="52" width="176" height="148" fill={`url(#${liquid})`} />
            <ellipse cx="120" cy="64" rx="78" ry="11" fill="#F9F7F2" opacity="0.22" />
            <ellipse cx="92" cy="128" rx="7" ry="5" fill="#F9F7F2" className="mw-pour-bubble" opacity="0.35" />
            <ellipse cx="148" cy="150" rx="5" ry="3.5" fill="#F9F7F2" className="mw-pour-bubble mw-pour-bubble--b" opacity="0.28" />
            <ellipse cx="118" cy="168" rx="4" ry="3" fill="#F9F7F2" className="mw-pour-bubble mw-pour-bubble--c" opacity="0.22" />
          </g>
          {photo ? (
            <image
              href={photo}
              xlinkHref={photo}
              x="32"
              y="48"
              width="176"
              height="152"
              preserveAspectRatio="xMidYMid slice"
              className="mw-pour-photo"
            />
          ) : null}
        </g>

        <path
          d="M36 72C38 128 70 176 120 192C170 176 202 128 204 72"
          stroke="#F9F7F2"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.92"
        />
        <ellipse cx="120" cy="66" rx="84" ry="16" stroke="#F9F7F2" strokeWidth="2.4" opacity="0.95" />
        <ellipse cx="120" cy="64" rx="64" ry="9" stroke="#F9F7F2" strokeWidth="1" opacity="0.28" />
        <path d="M56 78c8 42 22 78 52 100" stroke="#F9F7F2" strokeWidth="1.5" strokeLinecap="round" opacity="0.28" />
        <path d="M174 84c-4 28-14 58-34 80" stroke="#F9F7F2" strokeWidth="0.9" strokeLinecap="round" opacity="0.16" />

        <path d="M120 192v92" stroke={`url(#${stem})`} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M116.5 200c1 16 6 52 3.5 80" stroke="#F9F7F2" strokeWidth="0.8" opacity="0.28" />
        <path d="M72 292c16-12 80-12 96 0" stroke="#F9F7F2" strokeWidth="2.2" strokeLinecap="round" opacity="0.88" />
        <path d="M68 296c18 7 86 7 104 0" stroke="#F9F7F2" strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />

        <g className="mw-pour-twist">
          <path
            d="M178 52c16-16 40-8 36 14-3 16-20 20-28 10 5 4 7 12 2 18"
            stroke="#BC5A45"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M178 52c16-16 40-8 36 14-3 16-20 20-28 10"
            stroke="#E09A7A"
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.75"
          />
        </g>
      </svg>
    </div>
  );
}
