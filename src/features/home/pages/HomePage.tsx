/**
 * Home page — public landing page.
 * Replaces Home.js (322 lines) from legacy app.
 *
 * Handles: route-based auth dialog triggers, role-based redirection,
 * hero section, features, and footer.
 */

import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useAuthDialogs } from "@/features/auth/hooks/useAuthDialogs";
import { AuthDialog } from "@/features/auth/components/AuthDialog";
import { SignupGatewayDialog } from "@/features/auth/components/SignupGatewayDialog";
import { HeroSection } from "../components/HeroSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { DesktopGetApps } from "../components/DesktopGetApps";
import { LogosSlider } from "../components/LogosSlider";

import { USER_ROLES } from "@/config/constants";

export function HomePage() {
  const role = useAuthStore((s) => s.role);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const {
    dialogOpen,
    dialogStep,
    dialogEmail,
    dialogCode,
    openAuth,
    closeAuth,
    gatewayOpen,
    setGatewayOpen,
  } = useAuthDialogs();

  // Redirect authenticated users
  useEffect(() => {
    if (role === USER_ROLES.HOST) {
      // Admin users → /admin, regular hosts → /courses
      if (user?.groupmanager || user?.facultyManager) {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/courses" });
      }
    }
  }, [role, user, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <title>ezCheckMe — Smart Attendance Tracking</title>
      <HeroSection onGetStarted={() => openAuth("signup")} />
      <LogosSlider />
      <div className="flex-1">
        <FeaturesSection />
        <DesktopGetApps />
      </div>


      {/* Gateway dialog (Role selection) */}
      <SignupGatewayDialog
        open={gatewayOpen}
        onClose={closeAuth}
        onSelect={(type) => {
          if (type === "host") {
            setGatewayOpen(false);
            openAuth("signup", true);
          } else {
            setGatewayOpen(false);
            // Open the checkin page for attendees or show the mobile instructions
            navigate({ to: "/checkin" });
          }
        }}
      />

      {/* Auth dialog (triggered by routes or CTA) */}
      <AuthDialog
        open={dialogOpen}
        onClose={closeAuth}
        initialStep={dialogStep}
        initialEmail={dialogEmail}
        initialCode={dialogCode}
      />
    </div>
  );
}
