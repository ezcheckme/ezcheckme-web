/**
 * FullSession — main live session view.
 * Matches legacy FullSession.js + Session.css layout exactly:
 *   .uber-container → .session-container → .QR-explanation → (.left-pane + .QR)
 *   + .session-footer at bottom
 *   + .theme-bg / .theme-logo at top when theme is set
 *
 * Source: FullSession.js (217 lines) + InfoPane.js (59 lines)
 */

import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useLiveSessionStore } from "../store/sessionStore";
import { useQrCode } from "../hooks/useQrCode";
import { Instructions } from "./Instructions";
import { StudentsCounter } from "./StudentsCounter";
import { formatDuration } from "@/shared/utils/date.utils";

import "./Session.css";

export const FullSession = () => {
  const {
    liveSessionData,
    remainingTime,
    showRemainingTime,
    setShowMinimized,
    category,
    customQrInterval,
  } = useLiveSessionStore();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "he";
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qrImageLoaded, setQrImageLoaded] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const [codeWidth, setCodeWidth] = useState<number | null>(null);

  // QR code generation hook
  const qrCodeDataUrl = useQrCode({
    sessionId: liveSessionData?.id || "",
    shortId: liveSessionData?.shortid || "",
    courseId: liveSessionData?.courseid || "",
    category: category || liveSessionData?.icongroup || "Academy",
    customQrInterval: customQrInterval || liveSessionData?.qrinterval || 10,
  });

  // Theme data
  const theme = liveSessionData?.theme;
  const hasTheme = theme && (theme.bgColor || theme.image);

  // Dynamic QR code sizing based on available space
  useEffect(() => {
    const calculateSize = () => {
      if (qrContainerRef.current) {
        const footerOffset = 127; // footer height + margins
        const availableHeight = window.innerHeight - footerOffset - 62;
        setCodeWidth(Math.min(availableHeight, window.innerWidth * 0.55));
      }
    };

    calculateSize();
    window.addEventListener("resize", calculateSize);
    return () => window.removeEventListener("resize", calculateSize);
  }, []);

  // Fullscreen listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Fullscreen toggle
  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  }

  async function exitFullScreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
    }
  }

  function minimizeScreen() {
    const width = window.screen.width / 6;
    const height = width * (navigator.userAgent.match(/Safari/i) ? 1.6 : 1.5);

    exitFullScreen();

    setTimeout(() => {
      const minimizedSessionWindow = window.open(
        "/m_session",
        "EZCheckme Minimized",
        `left=${window.screen.width - width - 10},top=${
          window.screen.height - height - 30
        },width=${width},height=${height}`,
      );

      setTimeout(() => {
        if (!minimizedSessionWindow || minimizedSessionWindow.closed) {
          console.warn("Minimized session popup was blocked");
        } else {
          setShowMinimized(true);
          const audioRef = document.getElementById("audio") as HTMLAudioElement;
          if (audioRef) {
            audioRef.muted = false;
            audioRef.volume = 0.001;
          }
        }
      }, 2000);
    }, 1000);
  }

  function handleEndSession() {
    useLiveSessionStore.getState().setRemainingTime(0);
  }

  if (!liveSessionData) return null;

  return (
    <>
      <div
        className={cn("uber-container", isRtl && "uber-container-rtl")}
        style={{ opacity: qrImageLoaded ? 1 : 0 }}
      >
        {/* Splash loader beneath — visible while QR not loaded */}
        {!qrImageLoaded && (
          <div id="fuse-splash-screen">
            <div className="center">
              <div className="logo">
                <img
                  width="212"
                  src="/assets/images/logos/logo.svg"
                  alt="logo"
                />
              </div>
              <div className="progress">
                <div className="bar"></div>
              </div>
            </div>
          </div>
        )}
      {/* Theme background bar */}
      {hasTheme && theme.bgColor && (
        <div className="theme-bg" style={{ background: theme.bgColor }} />
      )}

      <div className="session-container">
        {/* Main content: Left pane + QR */}
        <div className="QR-explanation">
          {/* LEFT PANE */}
          <div className="left-pane">
            {/* Theme logo */}
            {hasTheme && theme.image && (
              <div className="theme-logo">
                <img src={theme.image} alt="logo" />
              </div>
            )}

            {/* Course + Session name */}
            <div className="title">
              <h1>{liveSessionData.coursename}</h1>
              <h2>{liveSessionData.name}</h2>
            </div>

            {/* Yellow strip instructions */}
            <Instructions />

            {/* Students counter with animated names */}
            <StudentsCounter />
          </div>

          <div
            className="QR"
            ref={qrContainerRef}
            style={
              codeWidth ? { width: codeWidth, height: codeWidth } : undefined
            }
          >
            {qrCodeDataUrl ? (
              <img
                id="qrCode"
                src={qrCodeDataUrl}
                alt="QR Code"
                onLoad={() => setQrImageLoaded(true)}
              />
            ) : (
              <div className="placeholder" />
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className={cn("session-footer", isRtl && "session-footer-rtl")}>
          {/* Logo */}
          <div className="logo">
            <img
              src="/assets/images/logos/logo.svg"
              width="161"
              height="46"
              className="d-inline-block align-top logo"
              alt="EZCheck.me"
            />
          </div>

          {/* Time + controls */}
          <div className="session-time">
            <h4
              style={{
                display: !showRemainingTime ? "none" : "inline-block",
              }}
            >
              {formatDuration(remainingTime * 1000)}
            </h4>

            <h4 className="end-session" onClick={handleEndSession}>
              {t("session popup - end session")}
            </h4>

            <img
              className="fullscreen"
              src={
                isFullscreen
                  ? "/assets/images/icons/fullscreen-back.svg"
                  : "/assets/images/icons/fullscreen.svg"
              }
              alt={isFullscreen ? "Exit Full Screen" : "Full Screen"}
              title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
              onClick={toggleFullscreen}
            />

            <img
              className="open-minimized"
              src="/assets/images/icons/minimize.png"
              alt="Minimize Screen"
              title="Switch to Minimized Session Window"
              onClick={minimizeScreen}
            />
          </div>
        </div>
      </div>
      </div>
    </>
  );
};
