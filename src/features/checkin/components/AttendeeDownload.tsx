/**
 * AttendeeDownload — /download
 * Mirrors legacy Download.js: shows app store download badges for iOS and Android.
 */

import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";

const DOWNLOAD_URL_IPHONE =
  "https://apps.apple.com/us/app/ezcheck-me/id1472247186";
const DOWNLOAD_URL_ANDROID =
  "https://play.google.com/store/apps/details?id=me.ezcheck";

export function AttendeeDownload() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-sm text-center">
        <img
          className="w-48 mx-auto mb-6"
          src="/assets/images/logos/logo.svg"
          alt="EZCheck.me logo"
        />

        <p className="text-gray-600 mb-6">
          {t("mobile - home - download text")}
        </p>

        <div className="flex flex-col items-center gap-3 mb-6">
          <a
            href={DOWNLOAD_URL_IPHONE}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="h-12"
              src="/assets/images/home/ios_app_store.png"
              alt="Download on the App Store"
            />
          </a>
          <a
            href={DOWNLOAD_URL_ANDROID}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="h-12"
              src="/assets/images/home/android_app_store.png"
              alt="Get it on Google Play"
            />
          </a>
        </div>

        <div className="text-gray-600 text-sm space-y-1 mb-6">
          <p>{t("mobile - home - download incentive 1")}</p>
          <p>{t("mobile - home - download incentive 2")}</p>
          <p>{t("mobile - home - download incentive 3")}</p>
          <p>{t("mobile - home - download incentive 4")}</p>
        </div>

        <Link
          to="/checkin"
          className="text-link font-medium hover:underline"
        >
          {t("mobile - home - download incentive check-in")}
        </Link>
      </div>
    </div>
  );
}
