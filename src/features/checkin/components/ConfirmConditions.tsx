/**
 * ConfirmConditions — ToS & Privacy acceptance dialog.
 * Matches old ConfirmConditions.js (283 lines).
 * Can be rendered as a full-page view or as a dialog.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

interface ConfirmConditionsProps {
  onConfirm: () => void;
}

export function ConfirmConditions({ onConfirm }: ConfirmConditionsProps) {
  const { t } = useTranslation();
  const [showText, setShowText] = useState<"toc" | "privacy" | null>(null);

  // ── Full-text view ──
  if (showText) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#ecf0f3]">
        <div className="relative w-full max-w-md h-[90vh] bg-[#ecf0f3] overflow-hidden">
          <button
            onClick={() => setShowText(null)}
            className="absolute top-3 right-3 z-10 p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>
          <div className="h-full overflow-y-auto px-4 pt-10 pb-4 text-left text-sm text-gray-700 whitespace-pre-wrap">
            {showText === "toc" ? <TosText /> : <PrivacyText />}
          </div>
        </div>
      </div>
    );
  }

  // ── Main acceptance view ──
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#ecf0f3]">
      <div className="flex flex-col items-center w-[85%] max-w-sm bg-[#dbdbdb] rounded-[20px] py-4">
        <div className="bg-white rounded-[20px] w-[80%] mb-3 flex flex-col text-center">
          <span className="text-center p-4 text-base font-medium text-gray-800">
            {t("mobile app - signup - toc - description") !==
            "mobile app - signup - toc - description"
              ? t("mobile app - signup - toc - description")
              : "By using this service, you agree to our Terms of Service and Privacy Policy."}
          </span>
          <button
            onClick={() => setShowText("toc")}
            className="text-[#0068e0] text-lg font-bold my-4 cursor-pointer hover:underline"
          >
            {t("mobile app - signup - toc - review toc") !==
            "mobile app - signup - toc - review toc"
              ? t("mobile app - signup - toc - review toc")
              : "Review Terms of Service"}
          </button>
          <button
            onClick={() => setShowText("privacy")}
            className="text-[#0068e0] text-lg font-bold my-4 cursor-pointer hover:underline"
          >
            {t("mobile app - signup - toc - review privacy") !==
            "mobile app - signup - toc - review privacy"
              ? t("mobile app - signup - toc - review privacy")
              : "Review Privacy Policy"}
          </button>
        </div>
        <button
          id="confirm_btn"
          onClick={onConfirm}
          className="w-[80%] bg-[#0068e0] rounded-[15px] py-4 mb-2 cursor-pointer hover:bg-[#0057c0] transition-colors"
        >
          <span className="text-white text-lg font-bold">
            {t("mobile app - signup - toc - agree") !== "mobile app - signup - toc - agree"
              ? t("mobile app - signup - toc - agree")
              : "I Agree"}
          </span>
        </button>
      </div>
    </div>
  );
}

// ── Terms of Service text ──
function TosText() {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Terms of Service</h2>
      <p className="mb-2">
        Welcome to EZCheck.me. By accessing or using our service, you agree to be bound by these
        Terms of Service. If you do not agree with any of these terms, please do not use our
        service.
      </p>
      <h3 className="font-bold mt-4 mb-2">1. Description of Service</h3>
      <p className="mb-2">
        EZCheck.me provides an attendance tracking and check-in service for educational institutions
        and organizations. The service allows instructors to create sessions and attendees to check
        in using QR codes, icon quizzes, or other verification methods.
      </p>
      <h3 className="font-bold mt-4 mb-2">2. User Accounts</h3>
      <p className="mb-2">
        You must provide accurate and complete information when creating an account. You are
        responsible for maintaining the confidentiality of your account credentials and for all
        activities that occur under your account.
      </p>
      <h3 className="font-bold mt-4 mb-2">3. Acceptable Use</h3>
      <p className="mb-2">
        You agree not to use the service for any unlawful purpose or in any way that could damage,
        disable, or impair the service. You must not attempt to check in on behalf of another person
        or use automated means to interact with the service.
      </p>
      <h3 className="font-bold mt-4 mb-2">4. Data Collection</h3>
      <p className="mb-2">
        We collect attendance data, location information (when permitted), and other information
        necessary to provide the service. This data is used solely for the purpose of providing
        attendance tracking services.
      </p>
      <h3 className="font-bold mt-4 mb-2">5. Termination</h3>
      <p>
        We may terminate or suspend your access to the service at any time, without prior notice,
        for any reason, including breach of these Terms.
      </p>
    </div>
  );
}

// ── Privacy Policy text ──
function PrivacyText() {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Privacy Policy</h2>
      <p className="mb-2">
        EZCheck.me is committed to protecting your privacy. This Privacy Policy explains how we
        collect, use, and share information about you when you use our services.
      </p>
      <h3 className="font-bold mt-4 mb-2">1. Information We Collect</h3>
      <p className="mb-2">
        We collect information you provide directly, such as your name, email address, phone number,
        and student/employee ID. We also collect usage data, device information, and location data
        (with your permission) for check-in verification.
      </p>
      <h3 className="font-bold mt-4 mb-2">2. How We Use Your Information</h3>
      <p className="mb-2">
        We use your information to provide, maintain, and improve our services; to verify your
        identity during check-in; to communicate with you about the service; and to ensure the
        security and integrity of attendance records.
      </p>
      <h3 className="font-bold mt-4 mb-2">3. Information Sharing</h3>
      <p className="mb-2">
        We share your attendance information with the instructors and institutions that manage the
        courses you are enrolled in. We do not sell your personal information to third parties.
      </p>
      <h3 className="font-bold mt-4 mb-2">4. Data Security</h3>
      <p className="mb-2">
        We implement appropriate security measures to protect your personal information. However, no
        method of electronic storage is 100% secure.
      </p>
      <h3 className="font-bold mt-4 mb-2">5. Contact Us</h3>
      <p>
        If you have questions about this Privacy Policy, please contact us at support@ezcheck.me.
      </p>
    </div>
  );
}
