/**
 * DesktopGetApps — displays App Store/Google Play badges
 * with "Are you a student trying to Check-in?" text.
 * Hidden on mobile. Matches legacy DesktopGetApps exactly.
 */

import { Link } from "@tanstack/react-router";

const DOWNLOAD_URL_IPHONE =
  "https://apps.apple.com/app/ezcheck-me/id1455502287";
const DOWNLOAD_URL_ANDROID =
  "https://play.google.com/store/apps/details?id=com.ezcheck.me";

export function DesktopGetApps() {
  return (
    <div className="hidden sm:flex flex-col items-center justify-center my-0">
      <div className="flex items-center gap-3">
        <span className="text-base font-medium" style={{ color: "#333333" }}>
          Are you a student trying to Check-in to a session? Download the App
          or{" "}
        </span>
        <Link
          to="/checkin"
          className="text-base font-medium text-blue-600 hover:underline transition-colors"
        >
          Click here to Check-in from your PC
        </Link>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <a
          href={DOWNLOAD_URL_IPHONE}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity"
        >
          <img
            src="/assets/images/home/ios_app_store.png"
            alt="Download on the App Store"
            className="h-14 w-auto"
            loading="lazy"
          />
        </a>
        <a
          href={DOWNLOAD_URL_ANDROID}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity"
        >
          <img
            src="/assets/images/home/android_app_store.png"
            alt="Get it on Google Play"
            className="h-14 w-auto"
            loading="lazy"
          />
        </a>
      </div>
    </div>
  );
}
