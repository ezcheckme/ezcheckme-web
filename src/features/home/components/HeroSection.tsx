/**
 * Hero section — matches legacy DesktopHero + HeroOverlay exactly.
 *
 * The video/poster image (landing_image.mp4 / landing_image.webp) already contains
 * the text "Track your Students' Attendance / At Classroom & Remote Lessons"
 * baked into the media. The legacy HeroOverlay only renders the GET STARTED button.
 *
 * We replicate this exact approach: video + GET STARTED button overlay only.
 */

import { cn } from "@/lib/utils";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="relative bg-white">
      <div className="mx-auto  px-0 py-4">
        {/* Video / Image container */}
        <div
          className="relative mx-auto overflow-hidden rounded-2xl"
          style={{ maxWidth: 1200 }}
        >
          {/* Background Video — text is baked into the video itself */}
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="https://d39ckvvbz0gak7.cloudfront.net/landing_image.webp"
            className="w-full object-cover"
            style={{ height: "auto", minHeight: 448, maxHeight: 448 }}
          >
            <source
              src="https://d39ckvvbz0gak7.cloudfront.net/landing_image.mp4"
              type="video/mp4"
            />
          </video>

          {/* Overlay — only the GET STARTED button (text is in the video) */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-12">
            <button
              onClick={onGetStarted}
              className={cn(
                "rounded px-8 py-2 text-white font-bold text-[1.3em]",
                "transition-all duration-200 hover:brightness-110 shadow-lg cursor-pointer",
              )}
              style={{
                background: "linear-gradient(#469c2e 0%, #469c2e 100%)",
                width: 240,
                height: 52,
              }}
            >
              GET STARTED
            </button>
          </div>
        </div>

        {/* Caption below hero */}
        <h2
          className="text-xl text-center mt-2 mb-4"
          style={{ color: "#333333" }}
        >
          End-to-end Check-in solution for universities, schools, webinars and
          professional training
        </h2>
      </div>
    </section>
  );
}
