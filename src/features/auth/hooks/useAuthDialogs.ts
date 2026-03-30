/**
 * useAuthDialogs hook.
 * Reads route path/params and opens the correct auth dialog step.
 * Replaces the 6 useEffect triggers in legacy Home.js.
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useAuthStore } from "../store/auth.store";
import { USER_ROLES } from "@/config/constants";

type AuthStep = "login" | "signup" | "forgot" | "verify" | "change-password";

interface AuthDialogState {
  open: boolean;
  step: AuthStep;
  email: string;
  code: string;
}

export function useAuthDialogs() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const isAuthenticated =
    role === USER_ROLES.HOST || role === USER_ROLES.ATTENDEE;

  const [gatewayOpen, setGatewayOpen] = useState(false);
  const [dialog, setDialog] = useState<AuthDialogState>({
    open: false,
    step: "login",
    email: "",
    code: "",
  });

  useEffect(() => {
    const path = location.pathname;

    if (path === "/login" && !isAuthenticated) {
      setGatewayOpen(false);
      setDialog({ open: true, step: "login", email: "", code: "" });
    } else if (path === "/signup" && !isAuthenticated) {
      setGatewayOpen(true);
      setDialog({ open: false, step: "signup", email: "", code: "" });
    } else if (path === "/forgot") {
      setDialog({ open: true, step: "forgot", email: "", code: "" });
    } else if (
      path.startsWith("/verify/") &&
      !path.startsWith("/verify-password/")
    ) {
      const segments = path.split("/");
      const email = decodeURIComponent(segments[2] || "");
      const code = decodeURIComponent(segments[3] || "");
      setDialog({ open: true, step: "verify", email, code });
    } else if (path.startsWith("/verify-password/")) {
      const segments = path.split("/");
      const email = decodeURIComponent(segments[2] || "");
      const code = decodeURIComponent(segments[3] || "");
      setDialog({ open: true, step: "change-password", email, code });
    }
  }, [location.pathname, isAuthenticated]);

  const openAuth = (step: AuthStep = "login", skipGateway = false) => {
    if (step === "signup" && !skipGateway) {
      setGatewayOpen(true);
      setDialog({ open: false, step: "signup", email: "", code: "" });
    } else {
      setGatewayOpen(false);
      setDialog({ open: true, step, email: "", code: "" });
    }
  };

  const closeAuth = () => {
    setGatewayOpen(false);
    setDialog({ open: false, step: "login", email: "", code: "" });
    // Navigate back to /home if we were on an auth route
    const authRoutes = ["/login", "/signup", "/forgot"];
    const path = location.pathname;
    if (authRoutes.includes(path) || path.startsWith("/verify")) {
      navigate({ to: "/home" });
    }
  };

  return {
    gatewayOpen,
    dialogOpen: dialog.open,
    dialogStep: dialog.step,
    dialogEmail: dialog.email,
    dialogCode: dialog.code,
    openAuth,
    closeAuth,
    setGatewayOpen,
  };
}

