"use client";

/** Theme for title + icon. Must match data-theme on .landingTitle. */
export type LandingTitleTheme = "gold" | "violet" | "mint" | "coral" | "cyan" | "futuristic";

const GRADIENTS: Record<LandingTitleTheme, { stops: Array<{ offset: string; color: string }> }> = {
  futuristic: {
    stops: [
      { offset: "0%", color: "#ffffff" },
      { offset: "30%", color: "#b8f4ff" },
      { offset: "60%", color: "#5ce0ff" },
      { offset: "85%", color: "#00d4ff" },
      { offset: "100%", color: "#00b8e6" },
    ],
  },
  gold: {
    stops: [
      { offset: "0%", color: "#fffef5" },
      { offset: "25%", color: "#ffe4a8" },
      { offset: "55%", color: "#f5c96a" },
      { offset: "80%", color: "#e8b84a" },
      { offset: "100%", color: "#d4a030" },
    ],
  },
  violet: {
    stops: [
      { offset: "0%", color: "#f0ebff" },
      { offset: "30%", color: "#c4b0ff" },
      { offset: "60%", color: "#a78bfa" },
      { offset: "100%", color: "#8b5cf6" },
    ],
  },
  mint: {
    stops: [
      { offset: "0%", color: "#e8fff8" },
      { offset: "35%", color: "#6ee7d8" },
      { offset: "70%", color: "#2dd4bf" },
      { offset: "100%", color: "#14b8a6" },
    ],
  },
  coral: {
    stops: [
      { offset: "0%", color: "#fff0f3" },
      { offset: "35%", color: "#fda4af" },
      { offset: "70%", color: "#fb7185" },
      { offset: "100%", color: "#f43f5e" },
    ],
  },
  cyan: {
    stops: [
      { offset: "0%", color: "#ffffff" },
      { offset: "35%", color: "#dcffff" },
      { offset: "65%", color: "#00f0f0" },
      { offset: "100%", color: "#00e6e6" },
    ],
  },
};

/**
 * SmartQR “Q” icon: mini QR-style with finder blocks + Q tail.
 * Pass theme to match the landing title data-theme.
 */
export default function LandingTitleBrain({ theme = "cyan" }: { theme?: LandingTitleTheme }) {
  const grad = GRADIENTS[theme] ?? GRADIENTS.cyan;
  const gradId = `landingBrainGrad-${theme}`;

  return (
    <span className="landingTitleBrain" aria-hidden>
      <svg
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="landingTitleBrainSvg"
        role="img"
        aria-label=""
      >
        <defs>
          <linearGradient
            id={gradId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
            gradientUnits="userSpaceOnUse"
          >
            {grad.stops.map((s) => (
              <stop key={s.offset} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
        </defs>
        <rect
          x="10"
          y="10"
          width="36"
          height="36"
          rx="6"
          ry="6"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="2"
        />
        <g fill={`url(#${gradId})`}>
          <rect x="14" y="14" width="8" height="8" rx="1" />
          <rect x="24" y="14" width="8" height="8" rx="1" />
          <rect x="14" y="24" width="8" height="8" rx="1" />
          <rect x="24" y="24" width="8" height="8" rx="1" />
          <rect x="20" y="20" width="6" height="6" rx="1" />
        </g>
        <path
          d="M42 42 L50 52"
          stroke={`url(#${gradId})`}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
