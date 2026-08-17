/** Decorative empty coupe — the 404's visual punchline. */
export function EmptyGlassMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      overflow="visible"
    >
      <defs>
        <linearGradient id="nf-bowl" x1="50" y1="36" x2="190" y2="168">
          <stop offset="0%" stopColor="#F9F7F2" stopOpacity="0.18" />
          <stop offset="55%" stopColor="#F9F7F2" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#F9F7F2" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="nf-stem" x1="120" y1="168" x2="120" y2="268">
          <stop offset="0%" stopColor="#F9F7F2" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#F9F7F2" stopOpacity="0.22" />
        </linearGradient>
      </defs>

      {/* Foot shadow */}
      <ellipse cx="120" cy="292" rx="54" ry="7" fill="#1a2118" opacity="0.45" />

      {/* Foot */}
      <path
        d="M68 278c18-14 86-14 104 0"
        stroke="#F9F7F2"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M64 282c20 8 92 8 112 0"
        stroke="#F9F7F2"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Stem */}
      <path
        d="M120 168v108"
        stroke="url(#nf-stem)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M116.5 176c1 18 6 58 3.5 92"
        stroke="#F9F7F2"
        strokeWidth="0.8"
        opacity="0.28"
      />

      {/* Bowl fill */}
      <path
        d="M42 58c2 52 28 96 78 110 50-14 76-58 78-110C176 42 64 42 42 58Z"
        fill="url(#nf-bowl)"
      />

      {/* Bowl outline */}
      <path
        d="M42 58c2 52 28 96 78 110 50-14 76-58 78-110"
        stroke="#F9F7F2"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.92"
      />

      {/* Rim */}
      <ellipse
        cx="120"
        cy="54"
        rx="78"
        ry="16"
        stroke="#F9F7F2"
        strokeWidth="2.4"
        opacity="0.95"
      />
      <ellipse
        cx="120"
        cy="52"
        rx="62"
        ry="9"
        stroke="#F9F7F2"
        strokeWidth="1"
        opacity="0.28"
      />

      {/* Glass highlight */}
      <path
        d="M58 64c6 38 18 72 48 92"
        stroke="#F9F7F2"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.28"
      />
      <path
        d="M168 70c-2 22-10 48-28 68"
        stroke="#F9F7F2"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.16"
      />

      {/* Empty meniscus — nothing in the glass */}
      <ellipse
        cx="120"
        cy="78"
        rx="58"
        ry="8"
        stroke="#F9F7F2"
        strokeWidth="1"
        strokeDasharray="3 7"
        opacity="0.22"
      />

      {/* Citrus twist as a question mark */}
      <g>
        <path
          d="M168 44c18-18 46-8 42 16-3 18-22 22-32 12 6 4 8 14 2 20"
          stroke="#BC5A45"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M168 44c18-18 46-8 42 16-3 18-22 22-32 12"
          stroke="#D47A68"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <circle cx="178" cy="104" r="3.4" fill="#BC5A45" />
      </g>

      {/* Falling drop */}
      <ellipse
        className="nf-drip"
        cx="132"
        cy="88"
        rx="3"
        ry="4.2"
        fill="#F9F7F2"
      />

      {/* Small botanical leaf, MixWise palette */}
      <g opacity="0.7" transform="translate(28 210) rotate(-18)">
        <path
          d="M0 24C8 4 28 2 42 14 28 18 14 28 0 24Z"
          fill="#8A9A5B"
          opacity="0.85"
        />
        <path
          d="M4 22C14 10 30 8 40 16"
          stroke="#3A4D39"
          strokeWidth="0.8"
          opacity="0.35"
        />
      </g>
    </svg>
  );
}
