import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { CookiePolicyDialog } from "./CookiePolicyDialog";

export function CookieBanner() {
  const { t } = useTranslation();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const updateUserData = useAuthStore((s) => s.updateUserData);

  const [show, setShow] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);

  const [prevDeps, setPrevDeps] = useState({
    user,
    role,
    pathname: location.pathname,
  });

  if (
    user !== prevDeps.user ||
    role !== prevDeps.role ||
    location.pathname !== prevDeps.pathname
  ) {
    setPrevDeps({ user, role, pathname: location.pathname });

    // Determine whether to show the banner
    const agreedLocal = localStorage.getItem("cookiesAgreed");
    const agreedDB = user && user.cookiesAgreed;
    const isGuest = role === "guest" || role === "unknown";

    if (isGuest) {
      if (!agreedLocal) {
        setShow(true);
      } else {
        setShow(false);
      }
    } else {
      // Host - don't show on session or auto paths
      if (
        !agreedDB &&
        !location.pathname.includes("/session/") &&
        !location.pathname.includes("/auto")
      ) {
        setShow(true);
      } else {
        setShow(false);
      }
    }
  }

  const handleAgree = async () => {
    const now = new Date().toString();
    localStorage.setItem("cookiesAgreed", now);
    if (role !== "guest" && role !== "unknown") {
      try {
        await updateUserData({ cookiesAgreed: now });
      } catch (e) {
        console.error("Failed to update user cookie preference", e);
      }
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 max-w-4xl flex items-center gap-4 text-center sm:text-left">
          <span className="text-3xl" aria-hidden="true">
            🍪
          </span>
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300">
            <strong className="font-semibold text-slate-900 dark:text-slate-100">
              {t("We value your privacy.")}
            </strong>{" "}
            {t(
              "We use cookies to enhance your experience and analyze our traffic. By clicking 'Agree', you consent to our use of cookies.",
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setPolicyOpen(true)}
            className="px-5 py-2 font-bold border border-[#689F38] bg-white text-[#333333] rounded hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {t("Details")}
          </button>
          <button
            onClick={handleAgree}
            className="px-5 py-2 font-bold border border-[#689F38] bg-[#689F38] text-white rounded hover:bg-[#558B2F] transition-colors min-w-[100px] cursor-pointer"
          >
            {t("Agree")}
          </button>
        </div>
      </div>

      <CookiePolicyDialog open={policyOpen} onOpenChange={setPolicyOpen} />
    </>
  );
}
