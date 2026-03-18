/**
 * PrintableSignDialog — displays a printable QR code sign for field/shift courses.
 * Port of legacy CourseQrCodeDownloadDialog.js.
 * Shows: title, inner sign page (institute logo, course name, QR code with
 * embedded EZ✓ME logo, yellow "Scan the Code" badge), instructions, and
 * a green "Download the Sign" button.
 */

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/features/auth/store/auth.store";

interface PrintableSignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseName: string;
}

/** Generate a 2-char random alphanumeric string — matches legacy obfuscation */
function randomChunk(): string {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let s = "";
  for (let i = 0; i < 2; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function PrintableSignDialog({
  open,
  onOpenChange,
  courseId,
  courseName,
}: PrintableSignDialogProps) {
  const user = useAuthStore((s) => s.user);
  const signRef = useRef<HTMLDivElement>(null);

  // Build the obfuscated self-check-in URL — matches legacy qrGen()
  const qrUrl = `https://ezcheck.me/${randomChunk()}${randomChunk()}${randomChunk()}/${randomChunk()}${courseId}${randomChunk()}/self`;

  // Institution theming
  const theme = (user as any)?.theme;
  const themeBgColor = theme?.bgColor || "#0e7e7e";
  const logoImage = theme?.image || null;

  async function handleDownload() {
    const el = signRef.current;
    if (!el) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `${courseName.replace(/[^a-zA-Z0-9 ]/g, "")} QR check-in sign.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      window.print();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden" style={{ maxHeight: "90vh" }}>
        {/* ---- Container matching legacy 80vh layout ---- */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Title bar */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "14px 0",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            Download Printable Course Sign
          </div>

          {/* Inner sign page — the printable area */}
          <div
            ref={signRef}
            style={{
              width: "78%",
              background: "#ECF0F3",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingBottom: 16,
            }}
          >
            {/* Institute logo bar */}
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px 12px",
                backgroundColor: themeBgColor,
              }}
            >
              {logoImage ? (
                <img
                  src={logoImage}
                  alt="Institute Logo"
                  style={{ maxHeight: 36, objectFit: "contain" }}
                  crossOrigin="anonymous"
                />
              ) : (
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 500, letterSpacing: "0.5px" }}>
                  Your Logo Goes Here*
                </span>
              )}
            </div>

            {/* Course name */}
            <div
              style={{
                color: "#224b6f",
                fontWeight: 700,
                fontSize: 18,
                textAlign: "center",
                padding: "12px 8px 8px",
              }}
            >
              {courseName}
            </div>

            {/* QR Code with EZ✓ME logo overlay */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px 0 8px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  padding: 4,
                  background: "#fff",
                  boxShadow:
                    "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)",
                }}
              >
                <QRCodeCanvas
                  value={qrUrl}
                  size={260}
                  level="H"
                  includeMargin={false}
                  style={{ display: "block" }}
                />
                {/* Center logo overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <img
                    src="/assets/images/logos/logo.svg"
                    alt="EZ✓ME"
                    style={{ height: 44, background: "#fff", padding: 3, borderRadius: 3 }}
                    crossOrigin="anonymous"
                  />
                </div>
              </div>
            </div>

            {/* Yellow "Scan the Code" badge */}
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#224b6f",
                background: "#fbf79b",
                padding: "6px 14px",
                borderRadius: 4,
                marginTop: 12,
              }}
            >
              Scan the Code to Self Check-in
            </div>
          </div>

          {/* Bottom instructions + download button */}
          <div style={{ padding: "12px 20px 20px", width: "100%" }}>
            <p style={{ fontSize: 13, color: "#333", marginBottom: 6, lineHeight: 1.5 }}>
              Download and print this sign and hang it at the self-check-in
              location to help attendees to check-in easily.
            </p>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 16, lineHeight: 1.5 }}>
              Note: This is optional. Attendees listed in the course can
              self-check-in without scanning the QR. However, scanning the QR
              would streamline their check-in process
            </p>
            <button
              onClick={handleDownload}
              style={{
                display: "block",
                width: "50%",
                margin: "0 auto",
                padding: "12px 0",
                background: "#1E8229",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Download the Sign
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
