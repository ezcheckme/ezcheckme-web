/**
 * Analytics Service
 * Mirrors legacy googleanalyticsservice.js.
 * Sends events to Google Analytics (gtag) and to the backend (sendInfo).
 */

import { sendInfo } from "./host.service";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

interface UserLike {
  displayName?: string;
  email?: string;
}

/**
 * Send an analytics event to GA and to the backend.
 */
export async function sendAnalytics(
  action: string,
  eventLabel: string,
  user?: UserLike | null,
): Promise<void> {
  // Google Analytics
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", action, { event_label: eventLabel });
    }
  } catch {
    // gtag not available
  }

  // Backend logging
  if (user?.email) {
    try {
      await sendInfo({
        event: "general",
        action,
        eventLabel,
        name: user.displayName || "",
        email: user.email,
      });
    } catch {
      // Non-critical
    }
  }
}
