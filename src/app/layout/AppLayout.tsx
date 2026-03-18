/**
 * Root application layout.
 * Toolbar + content area + footer. No sidebar — navigation is in the toolbar.
 */

import { Outlet, useLocation } from "@tanstack/react-router";
import { preconnect, prefetchDNS } from "react-dom";
import { AppToolbar } from "./AppToolbar";
import { CookieBanner } from "@/shared/components/CookieBanner";
import { Footer } from "@/features/home/components/Footer";

// React 19 resource preloading — runs once at module load
preconnect("https://fonts.googleapis.com");
preconnect("https://fonts.gstatic.com", { crossOrigin: "anonymous" });
prefetchDNS("https://maps.googleapis.com");
prefetchDNS("https://cognito-idp.us-east-1.amazonaws.com");

export function AppLayout() {
  const location = useLocation();
  const isSessionRoute =
    location.pathname === "/m_session" ||
    location.pathname.startsWith("/session/") ||
    location.pathname === "/auto";

  // Attendee journey routes — no header/footer (standalone window like old app)
  const isAttendeeRoute =
    location.pathname.startsWith("/attendee-signup") ||
    location.pathname.startsWith("/sessionlogin") ||
    location.pathname.startsWith("/getsessionid") ||
    location.pathname.startsWith("/checkin") ||
    location.pathname.startsWith("/quiz") ||
    location.pathname.startsWith("/download") ||
    location.pathname.startsWith("/attendee") ||
    location.pathname.startsWith("/w/");

  const hideChrome = isSessionRoute || isAttendeeRoute;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white">
      {!hideChrome && <AppToolbar />}
      <main
        className="flex-1 overflow-y-auto"
        style={{ background: hideChrome ? "#fff" : "linear-gradient(to bottom, #d5dadc 0%, #ebeff1 73px)" }}
      >
        <Outlet />
      </main>
      {!hideChrome && <Footer />}
      <CookieBanner />
    </div>
  );
}
