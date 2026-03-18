/**
 * LogosSlider — infinite horizontal scroll of institution logos.
 * Fetches logos.json from public assets and duplicates the list for seamless loop.
 *
 * Source: old LogosSlider.js (67 lines) → ~80 lines with CSS animation.
 */

import { useState, useEffect } from "react";

interface Logo {
  url: string;
  alt?: string;
}

interface LogosData {
  logos: Logo[];
  speed: number;
}

export function LogosSlider() {
  const [data, setData] = useState<LogosData | null>(null);

  useEffect(() => {
    fetch("/assets/images/logos_slider/logos.json")
      .then((r) => r.json())
      .then((d: LogosData) => {
        // Shuffle logos
        const shuffled = [...d.logos].sort(() => Math.random() - 0.5);
        setData({ ...d, logos: shuffled });
      })
      .catch(() => {});
  }, []);

  // Skip on Safari/iPad (matching legacy behaviour)
  const isSafari =
    typeof navigator !== "undefined" &&
    /Safari/i.test(navigator.userAgent) &&
    !/Chrome/i.test(navigator.userAgent);

  if (isSafari || !data || data.logos.length === 0) return null;

  const speed = data.speed || 30;

  const logos = data.logos.map((logo) => (
    <img
      key={logo.url}
      src={`/assets/images/logos_slider/${logo.url}`}
      alt={logo.alt || "Institution logo"}
      className="h-[50px] w-[220px] object-contain mx-6 flex-shrink-0"
      loading="lazy"
    />
  ));

  return (
    <div className="w-full overflow-hidden py-0 bg-white">
      <div
        className="flex mx-auto overflow-hidden"
        style={{
          maxWidth: 1200,
          maskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <div
          className="flex animate-scroll"
          style={{
            animationDuration: `${speed}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }}
        >
          {logos}
          {logos} {/* Duplicate for seamless loop */}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation-name: scroll;
        }
      `}</style>
    </div>
  );
}
