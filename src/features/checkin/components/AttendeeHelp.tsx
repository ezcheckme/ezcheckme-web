/**
 * AttendeeHelp — /w/help
 * Mirrors legacy Help.js: opens Tawk.to live chat widget for attendee support.
 */

import { useEffect } from "react";
import {
  showTawkWidget,
  maximizeTawkWidget,
  isTawktoMinimized,
  isTawktoLoaded,
  tawktoAddTags,
} from "@/shared/services/tawkto.service";

export function AttendeeHelp() {
  useEffect(() => {
    const timer = setTimeout(() => {
      showTawkWidget();
      maximizeTawkWidget();

      // Add device info tags
      const ua = navigator.userAgent;
      const isMobile = /Mobi|Android/i.test(ua);
      const deviceType = isMobile ? "Smartphone" : "PC";
      tawktoAddTags(["Attendee", deviceType, navigator.platform]);

      // Keep chat maximized
      const interval = setInterval(() => {
        if (isTawktoMinimized()) maximizeTawkWidget();
      }, 300);

      return () => clearInterval(interval);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      {isTawktoLoaded() ? (
        <div className="text-center text-gray-600">
          <br />
          Live chat
        </div>
      ) : (
        <div className="text-center text-gray-500">
          <br />
          <br />
          Something went wrong
          <br />
          <br />
          Could not load live chat
        </div>
      )}
    </div>
  );
}
