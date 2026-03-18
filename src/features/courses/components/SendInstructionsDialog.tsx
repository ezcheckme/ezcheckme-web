/**
 * Send Instructions Dialog — provides attendees with app download links.
 * Matches the old app's SendInstructionsToAttendees dialog exactly:
 *
 *  - Title: "Please ask your attendees to download the App!"
 *  - Apple icon (blue) + "iPhone App link:" label, URL below
 *  - Android icon (green/teal) + "Android App link:" label, URL below
 *  - Cancel (white contained MUI btn) | Copy Instructions (orange #cb8c1d) | Email Instructions (maroon #880000)
 *  - All buttons: 4px border-radius, MUI contained shadow, Title Case, 36px height
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

// ---------------------------------------------------------------------------
// App download URLs — matching production old app exactly
// ---------------------------------------------------------------------------

const DOWNLOAD_URLS = {
  IPHONE: "https://apps.apple.com/us/app/ezcheck-me/id1472247186",
  ANDROID: "https://play.google.com/store/apps/details?id=me.ezcheck",
} as const;

// ---------------------------------------------------------------------------
// Shared MUI‑contained button base style
// ---------------------------------------------------------------------------

const muiContainedBase: React.CSSProperties = {
  fontFamily: "'Heebo', 'Roboto', sans-serif",
  fontSize: "0.875rem",
  fontWeight: 500,
  lineHeight: 1.75,
  letterSpacing: "0.02857em",
  textTransform: "none",
  minWidth: 64,
  padding: "6px 16px",
  borderRadius: 4,
  border: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  transition:
    "background-color 250ms cubic-bezier(0.4,0,0.2,1), box-shadow 250ms cubic-bezier(0.4,0,0.2,1)",
  boxShadow:
    "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
};

// ---------------------------------------------------------------------------
// Material‑style icon paths (24×24 viewBox)
// ---------------------------------------------------------------------------

function AppleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#2196f3">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function AndroidIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#4caf50">
      <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V7H6v11zM3.5 7C2.67 7 2 7.67 2 8.5v7c0 .83.67 1.5 1.5 1.5S5 16.33 5 15.5v-7C5 7.67 4.33 7 3.5 7zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z" />
    </svg>
  );
}

/** Material "file_copy" icon — used in Copy Instructions button */
function FileCopyIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm-1 4l6 6v10c0 1.1-.9 2-2 2H7.99C6.89 23 6 22.1 6 21l.01-14c0-1.1.89-2 1.99-2h7zm-1 7h5.5L14 6.5V12z" />
    </svg>
  );
}

/** Material "email" icon — used in Email Instructions button */
function EmailIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SendInstructionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SendInstructionsDialog({
  open,
  onOpenChange,
}: SendInstructionsDialogProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  // Build email link
  const mailBody = (
    t("first-time - mail body") ||
    `Hi all, \n\nWe will be using the EZCheck.me App to check-in to the course sessions.\n\nPlease download and install the App BEFORE THE FIRST SESSION, so you can check-in easily.\n\nDownload for iPhone\n{IPHONE}\n\nDownload for Android\n{ANDROID}\n\nThanks`
  )
    .replace("{IPHONE}", DOWNLOAD_URLS.IPHONE)
    .replace("{ANDROID}", DOWNLOAD_URLS.ANDROID);

  const mailSubject =
    t("first-time - mail subject") ||
    "Please download the EZCheck.me App before our first session";

  const mailto = `mailto:?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

  // Build clipboard text
  const clipboardText = [
    t("send attendees instructions - dialog - text 1") ||
      "Before running your first session, it's highly recommended to ask your attendees to download and install the EZCheck.me App:",
    "",
    "iPhone App link:",
    DOWNLOAD_URLS.IPHONE,
    "",
    "Android App link:",
    DOWNLOAD_URLS.ANDROID,
  ].join("\n");

  function handleCopy() {
    navigator.clipboard.writeText(clipboardText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Override the shadcn/radix DialogContent to match MUI Paper look */}
      <DialogContent
        className="p-0"
        style={{
          maxWidth: 600,
          borderRadius: 4,
          boxShadow:
            "0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)",
          padding: 0,
          fontFamily: "'Heebo', 'Roboto', sans-serif",
        }}
      >
        {/* ---- Title (MuiDialogTitle) ---- */}
        <div
          style={{
            padding: "16px 24px",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 500,
              lineHeight: 1.6,
              letterSpacing: "0.0075em",
              color: "rgba(0,0,0,0.87)",
              margin: 0,
              fontFamily: "'Heebo', 'Roboto', sans-serif",
            }}
          >
            {t("send attendees instructions - dialog - title") ||
              "Please ask your attendees to download the App!"}
          </h2>
        </div>

        {/* ---- Body (MuiDialogContent) ---- */}
        <div
          style={{
            padding: "8px 24px",
          }}
        >
          {/* Description */}
          <p
            style={{
              fontSize: "1rem",
              lineHeight: 1.5,
              color: "rgba(0,0,0,0.54)",
              margin: "0 0 20px 0",
              fontFamily: "'Heebo', 'Roboto', sans-serif",
            }}
          >
            {t("send attendees instructions - dialog - text 1") ||
              "Before running your first session, it's highly recommended to ask your attendees to download and install the EZCheck.me App:"}
          </p>

          {/* iPhone row */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <AppleIcon size={20} />
              <span
                style={{
                  fontSize: "1rem",
                  color: "rgba(0,0,0,0.87)",
                  fontFamily: "'Heebo', 'Roboto', sans-serif",
                }}
              >
                {t("send attendees instructions - dialog - text 2") ||
                  "iPhone App link:"}
              </span>
            </div>
            <a
              href={DOWNLOAD_URLS.IPHONE}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "1rem",
                color: "#1976d2",
                fontFamily: "'Heebo', 'Roboto', sans-serif",
                textDecoration: "none",
                paddingLeft: 28,
                display: "block",
              }}
            >
              {DOWNLOAD_URLS.IPHONE}
            </a>
          </div>

          {/* Android row */}
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <AndroidIcon size={20} />
              <span
                style={{
                  fontSize: "1rem",
                  color: "rgba(0,0,0,0.87)",
                  fontFamily: "'Heebo', 'Roboto', sans-serif",
                }}
              >
                {t("send attendees instructions - dialog - text 3") ||
                  "Android App link:"}
              </span>
            </div>
            <a
              href={DOWNLOAD_URLS.ANDROID}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "1rem",
                color: "#1976d2",
                fontFamily: "'Heebo', 'Roboto', sans-serif",
                textDecoration: "none",
                paddingLeft: 28,
                display: "block",
              }}
            >
              {DOWNLOAD_URLS.ANDROID}
            </a>
          </div>
        </div>

        {/* ---- Actions (MuiDialogActions) ---- */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "8px 8px",
            gap: 8,
          }}
        >
          {/* Cancel — MUI text button, no background */}
          <button
            onClick={() => onOpenChange(false)}
            style={{
              fontFamily: "'Heebo', 'Roboto', sans-serif",
              fontSize: "0.875rem",
              fontWeight: 500,
              lineHeight: 1.75,
              letterSpacing: "0.02857em",
              textTransform: "none",
              minWidth: 64,
              padding: "6px 8px",
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              color: "rgba(0,0,0,0.87)",
              boxShadow: "none",
            }}
          >
            {t("general - cancel") || "Cancel"}
          </button>

          {/* Copy Instructions — MUI contained, orange bg #cb8c1d */}
          <button
            onClick={handleCopy}
            style={{
              ...muiContainedBase,
              background: copied ? "#4caf50" : "#cb8c1d",
              color: "#fff",
            }}
          >
            <FileCopyIcon size={20} />
            {copied
              ? "Copied!"
              : t("send attendees instructions - dialog - copy button") ||
                "Copy Instructions"}
          </button>

          {/* Email Instructions — MUI contained look, maroon bg #880000 */}
          <a
            href={mailto}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...muiContainedBase,
              background: "#880000",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            <EmailIcon size={20} />
            {t("send attendees instructions - dialog - email button") ||
              "Email Instructions"}
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
