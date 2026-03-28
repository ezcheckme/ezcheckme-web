/**
 * SessionProvider — orchestrates the live session lifecycle.
 *
 * Replaces the legacy Session.js class component (765 lines).
 * Responsibilities:
 *   1. Load session data from localStorage ("_session_")
 *   2. Start countdown timer
 *   3. Connect WebSocket (PubSubService) for real-time check-ins
 *   4. Queue attendee name display animation
 *   5. Sync session data to localStorage for minimized window
 *   6. Handle end session, minimized window commands, fullscreen
 *   7. Render FullSession or SessionOpenInMinimized based on state
 */

import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useLiveSessionStore, setSessionPubSub } from "../store/sessionStore";
import { FullSession } from "./FullSession";
import { SessionOpenInMinimized } from "./SessionOpenInMinimized";
import { PubSubService } from "@/shared/services/pubsub.service";
import type { PubSubMessage, MessageHandler } from "@/shared/services/pubsub.service";
import {
  endSessionVerifyAttendees,
  saveSessionData,
  clearSessionStorageInfoForMinimized,
} from "@/shared/services/session.service";
import { formatDuration } from "@/shared/utils/date.utils";
import type { LiveSessionData } from "@/shared/types/session.types";

export const SessionProvider = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const {
    liveSessionData,
    setLiveSessionData,
    setRemainingTime,
    remainingTime,
    isPaused,
    showMinimized,
    setShowMinimized,
    setVisibleAttendeeName,
    incrementNameCounter,
    addToVerificationBuffer,
    clearSession,
  } = useLiveSessionStore();

  const pubsubRef = useRef<PubSubService | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const minimizedWindowRef = useRef<Window | null>(null);
  const nameQueueRef = useRef<string[]>([]);
  const nameDisplayInProgressRef = useRef(false);
  const running = useRef(false);

  // ---- Attendee Name Display Queue ----
  const processNameQueue = useCallback(() => {
    if (nameDisplayInProgressRef.current || nameQueueRef.current.length === 0) {
      return;
    }

    nameDisplayInProgressRef.current = true;
    const name = nameQueueRef.current.shift()!;
    setVisibleAttendeeName(name);

    setTimeout(() => {
      setVisibleAttendeeName(null);
      nameDisplayInProgressRef.current = false;
      // Process next name in queue
      processNameQueue();
    }, 2500);
  }, [setVisibleAttendeeName]);

  const pushNameDisplay = useCallback(
    (name: string) => {
      nameQueueRef.current.push(name);
      processNameQueue();
    },
    [processNameQueue],
  );

  // ---- Navigate back (auto vs manual) ----
  const goBack = useCallback(
    (sessionData: LiveSessionData) => {
      setTimeout(() => {
        if (sessionData.mode === "auto") {
          navigate({ to: "/auto" });
        } else if (sessionData.courseid) {
          navigate({
            to: "/courses/$courseId/sessions",
            params: { courseId: sessionData.courseid },
          });
        } else {
          navigate({ to: "/courses" });
        }
      }, 1000);
    },
    [navigate],
  );

  // ---- End Session ----
  const endSessionByHost = useCallback(async () => {
    const state = useLiveSessionStore.getState();
    const sessionData = state.liveSessionData;
    if (!sessionData || !running.current) return;

    running.current = false;

    // Close minimized window
    if (minimizedWindowRef.current && !minimizedWindowRef.current.closed) {
      minimizedWindowRef.current.close();
    }

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Call API to end session and verify attendees
    try {
      await endSessionVerifyAttendees(sessionData.courseid, sessionData.id, {
        attendees: [...new Set(state.attendeesVerificationBuffer)],
        nameCounter: state.initialCount > 0 ? 0 : state.nameCounter,
      });
    } catch (error) {
      console.error("Failed to end session:", error);
    }

    // Disconnect WebSocket
    if (pubsubRef.current) {
      pubsubRef.current.endSession(String(sessionData.shortid));
      pubsubRef.current.disconnectSession(String(sessionData.shortid));
      pubsubRef.current.destroy();
      pubsubRef.current = null;
    }

    // Store last session ID
    localStorage.setItem("_last_session_id_", JSON.stringify(sessionData.id));

    // Clear session localStorage
    clearSessionStorageInfoForMinimized();
    localStorage.removeItem("_session_");

    // Navigate back
    goBack(sessionData);

    // Clear store
    clearSession();
  }, [goBack, clearSession]);

  // ---- 1. Load Session on Mount ----
  useEffect(() => {
    const rawSession = localStorage.getItem("_session_");
    const rawCount = localStorage.getItem("_sesstion_count_");
    const rawQrInterval = localStorage.getItem("_qrinterval_");

    if (!rawSession) {
      navigate({ to: "/courses" });
      return;
    }

    let sessionData: LiveSessionData;
    try {
      sessionData = JSON.parse(rawSession) as LiveSessionData;
    } catch (error) {
      console.error("[SessionProvider] Failed to parse session data", error);
      navigate({ to: "/courses" });
      return;
    }

    // Change language to course language
    if (sessionData.language) {
      i18n.changeLanguage(sessionData.language);
    }

    // Clear leftover minimized session data
    clearSessionStorageInfoForMinimized();

    // Handle unlimited duration
    let showTime = true;
    if (sessionData.duration === 0) {
      sessionData.duration = 5256000; // ~10 years in minutes
      showTime = false;
    }

    // Calculate initial remaining time
    const elapsed = sessionData.begins
      ? (Date.now() - new Date(sessionData.begins).getTime()) / 1000
      : 0;
    const totalSeconds = sessionData.duration * 60;
    const remaining = Math.max(0, Math.floor(totalSeconds - elapsed));

    // Set QR interval from course settings
    const customQrInterval = rawQrInterval
      ? JSON.parse(rawQrInterval)
      : sessionData.qrinterval || null;

    // Update store
    setLiveSessionData(sessionData);
    setRemainingTime(remaining);

    useLiveSessionStore.setState({
      initialCount: rawCount ? JSON.parse(rawCount) : sessionData.checkins || 0,
      iconQuizEnabled: sessionData.iconQuizEnabled !== false,
      ivrEnabled: !!sessionData.ivrEnabled,
      category: sessionData.icongroup || (sessionData.ivrEnabled
        ? (sessionData.iconQuizEnabled !== false ? "IVR_Abstract" : "IVR_No_Icon_Quiz")
        : "Abstract"),
      customQrInterval,
      showRemainingTime: showTime,
    });

    running.current = true;

    // Auto-enter fullscreen
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      }
    } catch (error) {
      console.error("[SessionProvider] Fullscreen not available", error);
    }

    return () => {
      running.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- 2. Timer ----
  useEffect(() => {
    if (!liveSessionData || isPaused) return;

    timerRef.current = setInterval(() => {
      const state = useLiveSessionStore.getState();
      const newTime = state.remainingTime - 1;

      if (newTime <= 0) {
        // Session expired
        if (timerRef.current) clearInterval(timerRef.current);
        endSessionByHost();
        return;
      }

      setRemainingTime(newTime);

      // Sync to localStorage for minimized window
      saveSessionData({
        sessionId: state.liveSessionData?.shortid || "",
        qrImage: state.qrCode || undefined,
        remainingText: formatDuration(newTime * 1000),
        checkedIn: Number(state.initialCount) + Number(state.nameCounter),
        iconQuizEnabled: state.iconQuizEnabled,
      });

      // Check for actions from minimized window
      const action = localStorage.getItem("_session_action_");
      if (action === "end_session") {
        localStorage.removeItem("_session_action_");
        endSessionByHost();
      } else if (action === "close_minimized") {
        localStorage.removeItem("_session_action_");
        if (minimizedWindowRef.current && !minimizedWindowRef.current.closed) {
          minimizedWindowRef.current.close();
        }
        setShowMinimized(false);
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    liveSessionData,
    isPaused,
    endSessionByHost,
    setRemainingTime,
    setShowMinimized,
  ]);

  // ---- 3. WebSocket / PubSub ----
  useEffect(() => {
    if (!liveSessionData) return;

    // Old app callback receives the full parsed WS message: { action: "attendee:checkin", data: { attendee: { _id, name } } }
    const onMessage = (message: PubSubMessage) => {
      if (!message) return;

      switch (message.action) {
        case "attendee:checkin": {
          const attendee = message.data?.attendee as {
            name?: string;
            _id?: string;
            id?: string;
          } | null;
          if (attendee) {
            const attendeeId = attendee._id || attendee.id;
            // Only process if we haven't seen this attendee yet
            if (
              attendeeId &&
              !useLiveSessionStore
                .getState()
                .attendeesVerificationBuffer.includes(attendeeId)
            ) {
              incrementNameCounter();
              if (attendee.name) {
                pushNameDisplay(attendee.name);
              }
              if (attendeeId) {
                addToVerificationBuffer(attendeeId);
              }
            }
          }
          break;
        }
        case "attendee:late_request": {
          // Late check-in request received — store for UI display
          const request = message.data?.attendee as {
            id?: string;
            _id?: string;
            name?: string;
          } | null;
          const requestId = request?._id || request?.id;
          if (requestId) {
            useLiveSessionStore.getState().addCheckInRequest({
              id: requestId,
              sessionId: liveSessionData.id,
              courseId: liveSessionData.courseid,
              studentId: requestId,
              studentName: request?.name || "Unknown",
              requestTime: Date.now(),
              status: "pending",
            });
          }
          break;
        }
        default:
          break;
      }
    };

    pubsubRef.current = new PubSubService(onMessage as unknown as MessageHandler);
    setSessionPubSub(pubsubRef.current); // Expose to useQrCode
    // Old app: this.ezwspubsub.connectSession(session.shortid.toString())
    pubsubRef.current.connectSession(
      String(liveSessionData.shortid),
    );

    return () => {
      if (pubsubRef.current) {
        pubsubRef.current.disconnectSession(String(liveSessionData.shortid));
        pubsubRef.current.destroy();
        pubsubRef.current = null;
        setSessionPubSub(null); // Clear ref
      }
    };
  }, [
    liveSessionData,
    incrementNameCounter,
    pushNameDisplay,
    addToVerificationBuffer,
  ]);

  // ---- 4. Watch for remainingTime=0 trigger from FullSession ----
  useEffect(() => {
    if (remainingTime === 0 && liveSessionData && running.current) {
      endSessionByHost();
    }
  }, [remainingTime, liveSessionData, endSessionByHost]);

  // ---- Minimized screen handlers ----
  function handleMinimizeScreen() {
    const width = window.screen.width / 6;
    const height = width * (navigator.userAgent.match(/Safari/i) ? 1.6 : 1.5);

    // Exit fullscreen first
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    setTimeout(() => {
      minimizedWindowRef.current = window.open(
        "/m_session",
        "EZCheckme Minimized",
        `left=${window.screen.width - width - 10},top=${
          window.screen.height - height - 30
        },width=${width},height=${height}`,
      );

      setTimeout(() => {
        if (!minimizedWindowRef.current || minimizedWindowRef.current.closed) {
          console.warn("Minimized session popup was blocked");
          alert("Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.");
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

  function handleCloseMinimized() {
    if (minimizedWindowRef.current && !minimizedWindowRef.current.closed) {
      minimizedWindowRef.current.close();
    }
    setShowMinimized(false);
    localStorage.removeItem("_session_action_");
  }

  // ---- Loading state ----
  if (!liveSessionData) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#ecf0f3",
        }}
      >
        Loading session...
      </div>
    );
  }

  // ---- Render ----
  if (showMinimized) {
    return (
      <SessionOpenInMinimized
        minimizeScreen={handleMinimizeScreen}
        closeMinimized={handleCloseMinimized}
      />
    );
  }

  return <FullSession />;
};
