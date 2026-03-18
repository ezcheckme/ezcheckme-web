/**
 * Auth provider component.
 * Bootstraps auth on app load with graceful error handling.
 * If Cognito fails (e.g., dev mode, no connection), still renders as guest.
 */

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "../store/auth.store";
import { setAuthToken } from "@/shared/services/api-client";

interface AuthProviderProps {
  children: ReactNode;
  splash?: ReactNode;
}

export function AuthProvider({ children, splash }: AuthProviderProps) {
  const init = useAuthStore((s) => s.init);
  const setInit = useAuthStore((s) => s.setInit);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        // Dynamically import cognito to handle cases where it fails to initialize
        const cognito = await import("../services/cognito.service");
        const session = await cognito.getCurrentSession();

        if (cancelled) return;

        if (session) {
          const idToken = session.getIdToken().getJwtToken();
          // Set the auth token before any API calls
          setAuthToken(idToken);
          const setUserFromCognito = useAuthStore.getState().setUserFromCognito;
          await setUserFromCognito(idToken);
        } else {
          // No session — user is a guest
          setInit(true);
        }
      } catch {
        if (!cancelled) {
          setInit(true);
        }
      }

      // Fetch geo-IP data in background (non-blocking)
      if (!cancelled) {
        useAuthStore.getState().fetchConnectionData();
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [setInit]);

  if (!init) {
    return splash ?? null;
  }

  return <>{children}</>;
}
