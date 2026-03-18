/**
 * CheckinPage — /checkin, /getsessionid, /w/checkin, /w/getsessionid
 * Entry point for attendee check-in.
 *
 * Layout: matches old GetSessionId.js — same 350×568 window as SignUp.
 * On desktop: shows "Pop-Up in a new window" link at bottom.
 *
 * Auth routing:
 *   Anonymous user → redirect to /attendee-signup
 *   Authenticated user → show session ID entry form
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useCheckinStore } from "../store/checkin.store";

const WEB_CHECKIN_X = 350;
const WEB_CHECKIN_Y = 568;

export function CheckinPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const shortid = (params as any)?.shortid;
  const code = (params as any)?.code;
  const icon = (params as any)?.icon;

  const loadSession = useCheckinStore((s) => s.loadSession);
  const directCheckin = useCheckinStore((s) => s.directCheckin);
  const session = useCheckinStore((s) => s.session);
  const status = useCheckinStore((s) => s.status);
  const error = useCheckinStore((s) => s.error);
  const reset = useCheckinStore((s) => s.reset);

  const [sessionId, setSessionId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Get stored user
  const storedUser = (() => {
    try {
      const raw = localStorage.getItem("ez:user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  // Auth routing: anonymous → signup
  useEffect(() => {
    const isAnonymous = !storedUser;

    if (shortid && code && icon) {
      if (isAnonymous) {
        navigate({ to: "/attendee-signup/$shortid", params: { shortid } });
      } else {
        directCheckin(shortid, code, icon);
      }
    } else if (shortid && !code) {
      if (isAnonymous) {
        navigate({ to: "/attendee-signup/$shortid", params: { shortid } });
      } else {
        handleSubmitWithId(shortid);
      }
    } else if (isAnonymous) {
      navigate({ to: "/attendee-signup" });
    }
  }, []);

  // Navigate to quiz when session is loaded
  useEffect(() => {
    if (session && status === "quiz") {
      const sid = session.shortid || sessionId;
      navigate({ to: "/quiz/$shortid", params: { shortid: String(sid) } });
    }
  }, [session, status, navigate, sessionId]);

  useEffect(() => {
    reset();
  }, [reset]);

  const handleSubmitWithId = async (id: string) => {
    setSubmitting(true);
    try {
      await loadSession(id);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId.trim()) return;
    await handleSubmitWithId(sessionId.trim());
  };

  const userName =
    storedUser?.firstName &&
    storedUser.firstName !== "signin" &&
    storedUser.firstName !== "undefined"
      ? storedUser.firstName
      : null;

  // Pop-up in new window handler (matches old app openCheckinPopup)
  const openCheckinPopup = () => {
    const x = window.screen.width - WEB_CHECKIN_X - 50;
    const y = window.screen.height / 2 - WEB_CHECKIN_Y / 2;
    const specs = `width=${WEB_CHECKIN_X},height=${WEB_CHECKIN_Y},left=${x},top=${y},menubar=0`;
    const newWindow = window.open(
      window.location.origin + "/checkin",
      "_blank",
      specs,
    );
    if (newWindow) {
      newWindow.addEventListener("resize", () => {
        newWindow.resizeTo(WEB_CHECKIN_X, WEB_CHECKIN_Y);
      });
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        display: "flex",
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: WEB_CHECKIN_X,
          height: WEB_CHECKIN_Y,
          maxWidth: WEB_CHECKIN_X,
          maxHeight: WEB_CHECKIN_Y,
          margin: "auto",
          backgroundColor: "#ecf0f3",
          border: "solid 1px gray",
          padding: 13,
          boxShadow: "0 2px 5px #000000",
          overflow: "hidden",
          textAlign: "center",
          color: "#161515",
        }}
      >
        {/* Logo — matches old: margin 0 auto, width 50%, height 75 */}
        <div style={{ margin: "0 auto", width: "50%", height: 75 }}>
          <img
            style={{ width: "100%" }}
            src="/assets/images/logos/logo.svg"
            alt="EZCheck.me logo"
          />
        </div>

        {/* Form box — matches old: white bg, rounded, shadow */}
        <div
          style={{
            width: "100%",
            backgroundColor: "#ffffff",
            borderRadius: 5,
            minHeight: 40,
            padding: 10,
            margin: "10px auto",
            boxShadow: "0px 0px 1px 1px rgba(0,0,0,0.32)",
            position: "relative",
            color: "#434343",
          }}
        >
          {/* Welcome — CENTERED, matching old app */}
          <div style={{ margin: "16px 0", textAlign: "center" }}>
            Welcome{userName ? `, ${userName}` : ""}
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="tel"
              pattern="[0-9]*"
              autoFocus
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Session ID"
              style={{
                borderRadius: 5,
                border: "1px solid #ddd",
                width: "100%",
                marginTop: 6,
                height: 30,
                padding: 4,
                fontSize: 16,
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={submitting || !sessionId.trim()}
              style={{
                fontWeight: 650,
                width: "100%",
                height: 30,
                color: "#ffffff",
                marginTop: 12,
                marginBottom: 12,
                paddingTop: 2,
                fontSize: "1.3em",
                textAlign: "center",
                borderRadius: 5,
                cursor: "pointer",
                backgroundColor: "#469c2e",
                border: "none",
                opacity: submitting || !sessionId.trim() ? 0.5 : 1,
              }}
            >
              {submitting ? "..." : "Check-in"}
            </button>
            {error && (
              <div
                style={{
                  width: "100%",
                  padding: 5,
                  backgroundColor: "#ffeeee",
                  height: 30,
                  color: "#dd0000",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Footer: download section — STACKED VERTICALLY like old app */}
        <div
          style={{
            height: "45%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            lineHeight: "2.5em",
            fontSize: "1.3em",
            textAlign: "center",
          }}
        >
          Checking-in is easier with the App!
          <div>
            <a
              href="https://apps.apple.com/us/app/ezcheck-me/id1472247186"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "block", height: 64, textAlign: "center" }}
            >
              <img
                style={{ width: "60%", display: "inline-block" }}
                src="/assets/images/home/ios_app_store.png"
                alt="App Store"
              />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=me.ezcheck"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "block", height: 64, textAlign: "center" }}
            >
              <img
                style={{ width: "60%", display: "inline-block" }}
                src="/assets/images/home/android_app_store.png"
                alt="Google Play"
              />
            </a>
          </div>
        </div>

        {/* Bottom link: Pop-Up in a new window (desktop) */}
        <div
          className="flex flex-row items-center justify-center cursor-pointer text-lg"
          onClick={openCheckinPopup}
        >
          <img
            src="/assets/images/icons/new_window_icon.png"
            alt="new window icon"
            style={{ marginRight: 4 }}
          />
          <span style={{ textDecoration: "underline" }}>
            Pop-Up in a new window
          </span>
        </div>
      </div>
    </div>
  );
}
