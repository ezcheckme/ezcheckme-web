/**
 * Check-in Message Dialog
 * Matches legacy CheckInMessageDialog.js exactly.
 *
 * Layout (from legacy screenshot):
 *   Title: "Are you a student trying to check-in to a session?"
 *   Blue link: "Click here to Check-in from your PC"
 *   Dashed separator line
 *   "Download the App:" label
 *   App Store + Google Play badge images (side by side)
 *   "Text me the App link:" label
 *   Gray container with: "Phone number:" label | country code dropdown | number input | green "Text me the link!" button
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { API_PATHS } from "@/config/constants";
import COUNTRY_CODES from "@/shared/data/country-codes";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { CountryCodesModal } from "@/features/checkin/components/CountryCodesModal";

interface CheckInMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CheckInMessageDialog({
  open,
  onOpenChange,
}: CheckInMessageDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showCaptcha, setShowCaptcha] = useState(false);

  // Auto-detect country code from connection data (IP geolocation)
  const connectionData = useAuthStore((s) => s.connectionData);
  const [prevConnectionData, setPrevConnectionData] = useState(connectionData);

  if (connectionData !== prevConnectionData) {
    setPrevConnectionData(connectionData);
    if (connectionData?.country_code) {
      const match = COUNTRY_CODES.find(
        (cc) =>
          cc.code.toUpperCase() === connectionData.country_code.toUpperCase(),
      );
      if (match) {
        setCountryCode(match.dialCode);
      }
    }
  }

  if (!open) return null;

  const fullPhoneNumber =
    countryCode +
    (phoneNumber.startsWith("0") ? phoneNumber.substring(1) : phoneNumber);

  const handlePhoneSubmit = () => {
    if (fullPhoneNumber.replace(/\D/g, "").length < 8) {
      setError("Please enter a valid phone number");
      return;
    }
    setError("");
    setShowCaptcha(true);
  };

  const executeSend = async () => {
    setSending(true);
    try {
      await fetch(`${API_PATHS.ADMIN}/send_sms/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: fullPhoneNumber,
          message:
            " Welcome to EZCheck.me! Use this link to download the App: https://urlgeni.us/ezcheck.me",
        }),
      });
      setSent(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch {
      setError("Failed to send SMS. Please try again.");
      setSending(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after close
    setTimeout(() => {
      setSent(false);
      setSending(false);
      setShowCaptcha(false);
      setPhoneNumber("");
      setError("");
    }, 300);
  };

  const handleWebCheckin = () => {
    handleClose();
    navigate({ to: "/checkin" });
  };

  return (
    <div className="fixed inset-0 z-[40] flex items-center justify-center p-4">
      {/* Backdrop — matches legacy dark overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
        onClick={handleClose}
      />

      {/* Dialog card — matches legacy MUI Dialog */}
      <div
        className="relative w-full bg-white rounded shadow-2xl"
        style={{ maxWidth: 520 }}
      >
        {/* Title section */}
        <div className="px-6 pt-5 pb-3" style={{ borderBottom: "none" }}>
          <h2
            className="text-center font-medium"
            style={{
              fontSize: 20,
              color: "rgba(0,0,0,0.87)",
              lineHeight: 1.4,
            }}
          >
            {t("homepage - checking-in - title 1")}
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Web check-in link */}
          <div className="text-center mb-4">
            <button
              onClick={handleWebCheckin}
              className="text-sm hover:underline cursor-pointer"
              style={{ color: "#2196f3" }}
            >
              {t("homepage - checking-in - title 2")}
            </button>
          </div>

          {/* Dashed separator — matches legacy */}
          <div
            className="mx-4 mb-5"
            style={{
              borderBottom: "1px dashed rgba(0,0,0,0.2)",
            }}
          />

          {/* Download the App label */}
          <p
            className="text-center mb-4"
            style={{
              fontSize: 14,
              color: "rgba(0,0,0,0.87)",
            }}
          >
            {t("homepage - checking-in - download app")}
          </p>

          {/* App store badges — using local images like legacy */}
          <div className="flex justify-center gap-6 mb-6">
            <a
              href="https://apps.apple.com/us/app/ezcheck-me/id1472247186"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="/assets/images/home/ios_app_store.png"
                alt="Download Apple App Store"
                style={{ height: 48 }}
              />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=me.ezcheck"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="/assets/images/home/android_app_store.png"
                alt="Download Google Play Store"
                style={{ height: 48 }}
              />
            </a>
          </div>

          {/* Text me the App link label */}
          <p
            className="text-center mb-3"
            style={{
              fontSize: 14,
              color: "rgba(0,0,0,0.87)",
            }}
          >
            {t("homepage - checking-in - text link")}
          </p>

          {/* Phone input container — gray bg, rounded, matches legacy */}
          <div
            className="flex items-center gap-2 rounded-lg p-2"
            style={{
              backgroundColor: "#e2e2e2",
              minHeight: 48,
            }}
          >
            {!sent ? (
              !showCaptcha ? (
                <>
                  {/* Phone number label */}
                  <span
                    className="text-sm whitespace-nowrap pl-2"
                    style={{ color: "rgba(0,0,0,0.54)" }}
                  >
                    {t("homepage - checking-in - phone number")}
                  </span>

                  {/* Country code — shows dial code when closed, searchable country names when opened */}
                  <CountryCodesModal value={countryCode} onChange={setCountryCode} />

                  {/* Phone number input */}
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 bg-transparent border-b border-gray-400 outline-none text-sm px-1 py-1"
                    style={{
                      color: "rgba(0,0,0,0.87)",
                      minWidth: 80,
                    }}
                    placeholder=""
                  />

                  {/* Send button — green, matching legacy */}
                  <button
                    onClick={handlePhoneSubmit}
                    disabled={!phoneNumber}
                    className="text-white text-sm font-medium whitespace-nowrap rounded px-4 py-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#4caf50" }}
                  >
                    {sending ? "..." : t("homepage - checking-in - button")}
                  </button>
                </>
              ) : (
                /* Simple CAPTCHA checkbox */
                <div className="flex items-center justify-center w-full gap-3 py-1">
                  <input
                    type="checkbox"
                    id="captcha-check"
                    className="w-5 h-5 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.checked) executeSend();
                    }}
                  />
                  <label
                    htmlFor="captcha-check"
                    className="text-sm cursor-pointer"
                    style={{ color: "rgba(0,0,0,0.7)" }}
                  >
                    I'm not a robot
                  </label>
                </div>
              )
            ) : (
              <div
                className="flex items-center justify-center w-full py-1 font-medium"
                style={{ color: "#4caf50" }}
              >
                {t("homepage - checking-in - sms sent")}
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
