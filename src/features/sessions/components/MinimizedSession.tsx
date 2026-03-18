/**
 * MinimizedSession — popup window showing QR code and session info.
 * Polls encrypted localStorage for session data from the main window.
 *
 * Matches legacy MinimizedSession.js:
 *   - Yellow top bar with GoEZ.me / Session ID
 *   - QR code image
 *   - Status footer: waiting text + checked-in count
 *   - Bottom bar: timer + End session + maximize icon
 *
 * Uses getSessionInfoFromStorage() for encrypted read (legacy compat).
 */

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { decryptJSON } from "@/shared/services/crypto";

import "./Session.css";

interface SessionInfo {
  remainingText: string;
  sessionId: string;
  checkedIn: number;
  qrImage: string | null;
  iconQuizEnabled: boolean;
}

export const MinimizedSession = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "he";

  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const prevRemainingText = useRef<string | null>(null);
  const staleCount = useRef(0);

  // Dynamic font sizing based on window width (legacy behavior)
  const [fonts, setFonts] = useState({
    small: 15,
    medium: 17,
    large: 20,
    iconFactor: 18,
  });

  useEffect(() => {
    // Resize handling + aspect ratio fix
    const handleResize = () => {
      const width = Math.min(window.innerWidth, 600);
      setFonts({
        small: width / 20,
        medium: width / 18,
        large: width / 12,
        iconFactor: width / 18,
      });

      if (Math.abs(window.innerHeight / window.innerWidth - 1.5) > 0.1) {
        window.resizeBy(0, window.innerWidth * 1.5 - window.innerHeight);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Storage polling — checks every 500ms for updates from main window
    const checkStorage = () => {
      try {
        // Try encrypted storage first (legacy compat), fall back to plain JSON
        let data: SessionInfo | null = null;
        const storedData = localStorage.getItem("_session_info_");
        if (!storedData) {
          staleCount.current += 1;
        } else {
          // Try to decrypt (if the storage service encrypted it)
          try {
            data = decryptJSON<SessionInfo>(storedData, "ezinfo007");
          } catch {
            // Fall back to plain JSON
            try {
              data = JSON.parse(storedData) as SessionInfo;
            } catch {
              staleCount.current += 1;
            }
          }

          if (data) {
            setSessionInfo(data);

            if (prevRemainingText.current === data.remainingText) {
              staleCount.current += 1;
            } else {
              staleCount.current = 0;
              prevRemainingText.current = data.remainingText;
            }
          }
        }

        // Parent window died or stopped updating
        if (staleCount.current > 10) {
          window.close();
        }
      } catch (e) {
        console.error("Failed to parse session info:", e);
      }
    };

    const intervalId = setInterval(checkStorage, 500);
    checkStorage(); // Fire immediately

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleAction = (action: "end_session" | "close_minimized") => {
    localStorage.setItem("_session_action_", action);
    if (action === "close_minimized") {
      window.close();
    }
  };

  if (!sessionInfo || !sessionInfo.qrImage) return null;

  return (
    <>
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          background: "#1a1a2e",
          color: "#fff",
          fontFamily: "'Roboto', sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Top Bar — yellow */}
        <div
          style={{
            background: "#fef4a0",
            color: "#333",
            padding: "8px 12px",
            fontSize: fonts.small,
            display: "flex",
            flexDirection: isRtl ? "row-reverse" : "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {sessionInfo.iconQuizEnabled ? (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div>Scan the code, or go to:</div>
                <div
                  style={{
                    fontSize: fonts.large,
                    fontWeight: 700,
                    color: "blue",
                    textDecoration: "underline",
                  }}
                >
                  GoEZ.me
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isRtl ? "flex-start" : "flex-end",
                }}
              >
                <div>Session ID:</div>
                <div style={{ fontSize: fonts.large, fontWeight: 700 }}>
                  {sessionInfo.sessionId}
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                fontSize: fonts.medium * 1.2,
                textAlign: "center",
                width: "100%",
              }}
            >
              Scan the code using the EZCheck.me App
            </div>
          )}
        </div>

        {/* QR Code */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#fff",
            padding: 4,
          }}
        >
          <img
            id="qrCode"
            src={sessionInfo.qrImage}
            alt="qr"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              transition: "opacity 0.3s",
              opacity: isImageLoaded ? 1 : 0,
            }}
            onLoad={() => setIsImageLoaded(true)}
          />
        </div>

        {/* Bottom text */}
        <div
          style={{
            fontSize: fonts.small,
            padding: "6px 12px",
            background: "#1a1a2e",
          }}
        >
          <div>Waiting for students to check in...</div>
          <div>{sessionInfo.checkedIn + " Students checked-in"}</div>
        </div>

        {/* Time bar */}
        <div
          style={{
            fontSize: fonts.medium,
            padding: "8px 12px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#2d2d44",
          }}
        >
          <div>
            {sessionInfo.remainingText.length > 2
              ? sessionInfo.remainingText
              : `0:${sessionInfo.remainingText}`}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              className="end-session"
              onClick={() => handleAction("end_session")}
              style={{ cursor: "pointer", textDecoration: "underline" }}
            >
              End session
            </div>
            <div
              onClick={() => handleAction("close_minimized")}
              style={{ cursor: "pointer", fontSize: fonts.iconFactor }}
              title="Switch back to full session view"
            >
              ⛶
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
