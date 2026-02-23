/**
 * Decorative gradient blur SVG for hero sections.
 * Extracted to reduce bundle size (~5KB inline SVG).
 */
export function HeroGradientBlur() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        width="2083"
        height="1466"
        fill="none"
        className="absolute left-1/2 opacity-30 -top-64 -rotate-[55deg] -translate-x-[60%]"
        aria-hidden="true"
      >
        <g filter="url(#hero-blur-a)" opacity=".6">
          <path
            fill="url(#hero-grad-b)"
            fillOpacity=".6"
            d="M932.495 700.784 356.529 454.401a121.655 121.655 0 0 1-60.47-56.465c-42.885-83.869 21.713-182.56 115.735-176.816l657.176 40.146a262.587 262.587 0 0 1 103.18 28.12l325.6 165.847a262.636 262.636 0 0 1 123.07 132.644l159.07 380.209a262.491 262.491 0 0 1 20.35 101.364v7.88c3.4 100.68-125.3 145.32-184.97 64.16l-36.4-49.52a122.026 122.026 0 0 0-28.08-27.47l-296.64-208.228a262.572 262.572 0 0 0-39.18-22.732L932.495 700.784Z"
          />
        </g>
        <g filter="url(#hero-blur-c)">
          <path
            fill="url(#hero-grad-d)"
            d="M1729.79 1025.62c-6.36 6.7-41.45-57.347-115.01-118.038-94.87-78.275-225.33-191.569-376.28-334.837-267.983-254.351-442.441-320.959-427.873-336.309 14.569-15.349 290.313.993 558.303 255.344 155.89 185.228 227.45 325.373 292.03 400.459 64.58 75.085 75.4 126.461 68.83 133.381Z"
          />
        </g>
        <g filter="url(#hero-blur-e)">
          <path
            fill="url(#hero-grad-f)"
            d="M1519.73 959.26c-9.92 9.421-126.75-102.304-268.18-239.076-57.53-55.631-130.62-104.929-191.43-168.964-210.315-221.47-482.484-101.39-468.528-114.643 13.957-13.253 415.968-121.136 626.288 100.334 210.31 221.471 315.81 409.096 301.85 422.349Z"
          />
        </g>
        <g filter="url(#hero-blur-g)">
          <path
            fill="url(#hero-grad-h)"
            d="M1152.35 708.246c-17.4 17.395-206.571-143.576-422.534-359.54-215.964-215.963 178.922 301.088 196.318 283.693 17.395-17.395-349.288-562.65-133.325-346.686 215.961 215.963 376.931 405.138 359.541 422.533Z"
          />
        </g>
        <defs>
          <linearGradient
            id="hero-grad-b"
            x1="851.347"
            x2="1811.4"
            y1="692.479"
            y2="609.44"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#fff" />
            <stop offset="1" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient
            id="hero-grad-d"
            x1="1109.84"
            x2="1729.18"
            y1="443.109"
            y2="1030.93"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#E5F3FF" />
            <stop offset="1" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient
            id="hero-grad-f"
            x1="1010.97"
            x2="1497.02"
            y1="443.414"
            y2="955.251"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#E5F3FF" />
            <stop offset="1" stopColor="#51A2FF" />
          </linearGradient>
          <linearGradient
            id="hero-grad-h"
            x1="1148.51"
            x2="840.008"
            y1="740.409"
            y2="366.253"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#E2E8F0" />
            <stop offset="1" stopColor="#4F46E5" stopOpacity="0" />
          </linearGradient>
          <filter
            id="hero-blur-a"
            width="2082.55"
            height="1527.37"
            x=".145"
            y="-61.502"
            colorInterpolationFilters="sRGB"
            filterUnits="userSpaceOnUse"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur result="effect1_foregroundBlur" stdDeviation="141.191" />
          </filter>
          <filter
            id="hero-blur-c"
            width="1119.35"
            height="991.42"
            x="710.946"
            y="133.514"
            colorInterpolationFilters="sRGB"
            filterUnits="userSpaceOnUse"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur result="effect1_foregroundBlur" stdDeviation="49.417" />
          </filter>
          <filter
            id="hero-blur-e"
            width="1127.55"
            height="758.782"
            x="492.243"
            y="299.867"
            colorInterpolationFilters="sRGB"
            filterUnits="userSpaceOnUse"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur result="effect1_foregroundBlur" stdDeviation="49.417" />
          </filter>
          <filter
            id="hero-blur-g"
            width="685.899"
            height="672.008"
            x="566.571"
            y="136.359"
            colorInterpolationFilters="sRGB"
            filterUnits="userSpaceOnUse"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur result="effect1_foregroundBlur" stdDeviation="49.417" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
