/**
 * Protected route wrapper.
 * Redirects unauthenticated users (guest/unknown) to /home.
 * Shows splash screen while auth is initializing.
 */

import { Navigate } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { USER_ROLES } from "@/config/constants";
import { SplashScreen } from "./SplashScreen";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Roles allowed to access this route. Defaults to host + attendee. */
  allowedRoles?: string[];
}

export function ProtectedRoute({
  children,
  allowedRoles = [USER_ROLES.HOST, USER_ROLES.ATTENDEE],
}: ProtectedRouteProps) {
  const role = useAuthStore((s) => s.role);
  const init = useAuthStore((s) => s.init);

  // Still initializing — show splash
  if (!init) {
    return <SplashScreen />;
  }

  // Not authenticated — redirect to home
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/home" />;
  }

  return <>{children}</>;
}
