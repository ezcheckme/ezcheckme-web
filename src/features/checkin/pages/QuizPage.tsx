/**
 * QuizPage — icon quiz for attendee check-in verification.
 * Attendee picks the icon displayed on the session screen from 5 options.
 * Wrong answers after 4 attempts locks the user out.
 *
 * Connected to PubSub WebSocket for real-time icon updates.
 * Source: old Quiz.js (347 lines).
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { Loader2, CheckCircle2, XCircle, Lock, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCheckinStore } from "../store/checkin.store";
import { PubSubService } from "@/shared/services/pubsub.service";
import * as sessionService from "@/shared/services/session.service";

const TOTAL_ICONS = 36;
const ICON_SIZE = 70;
const SPRITE_URL = "/assets/images/quiz-icons/Abstract_sprite.png";
const MAX_ATTEMPTS = 4;
const REDIRECT_DELAY = 4000;

function generateQuizIcons(correctIcon: number): number[] {
  const pool = Array.from({ length: TOTAL_ICONS }, (_, i) => i + 1).filter(
    (i) => i !== correctIcon,
  );
  const icons = [correctIcon];
  while (icons.length < 5) {
    const idx = Math.floor(Math.random() * pool.length);
    icons.push(pool.splice(idx, 1)[0]);
  }
  // Shuffle
  return icons.sort(() => Math.random() - 0.5);
}

export function QuizPage() {
  const navigate = useNavigate();
  const { shortid } = useParams({ from: "/quiz/$shortid" });

  const session = useCheckinStore((s) => s.session);
  const user = useCheckinStore((s) => s.user);
  const status = useCheckinStore((s) => s.status);
  const currentIcon = useCheckinStore((s) => s.currentIcon);
  const attempts = useCheckinStore((s) => s.attempts);
  const loadSession = useCheckinStore((s) => s.loadSession);
  const loadStoredUser = useCheckinStore((s) => s.loadStoredUser);
  const attemptQuiz = useCheckinStore((s) => s.attemptQuiz);
  const setCurrentIcon = useCheckinStore((s) => s.setCurrentIcon);
  const setSessionEnded = useCheckinStore((s) => s.setSessionEnded);

  const [selectedIcon, setSelectedIcon] = useState<number | null>(null);
  const pubsubRef = useRef<PubSubService | null>(null);

  // Load session if not loaded
  useEffect(() => {
    if (!session && shortid) {
      loadSession(shortid);
    }
    if (!user) {
      const storedUser = loadStoredUser();
      if (!storedUser) {
        navigate({ to: "/checkin" });
      }
    }
  }, [session, shortid, user, loadSession, loadStoredUser, navigate]);

  // Check if already checked in / locked
  useEffect(() => {
    if (!session || !user) return;

    const sessionId = (session as any).id || (session as any)._id;
    const locked = localStorage.getItem(`locked:${sessionId}`);
    if (locked) {
      useCheckinStore.setState({ status: "locked" });
      return;
    }

    // Check if already checked in
    const courseId = session.courseid;
    const userId = user.uid || user._id;
    sessionService
      .isCheckedIn(courseId, sessionId, userId)
      .then((res) => {
        if (res.checkedIn) {
          useCheckinStore.setState({ status: "already_checked_in" });
          setTimeout(() => navigate({ to: "/download" }), REDIRECT_DELAY);
        }
      })
      .catch(() => {});
  }, [session, user, navigate]);

  // ── PubSub WebSocket connection ──
  useEffect(() => {
    if (!session || !shortid) return;

    const pubsub = new PubSubService((data: any) => {
      const action = data.action || data.op;
      if (action === "session:update") {
        // Real-time icon update from session
        const codes = data.codes || data.data?.codes;
        if (codes?.current?.icon != null) {
          setCurrentIcon(Number(codes.current.icon));
        }
      } else if (action === "session:ended") {
        setSessionEnded();
        pubsub.close();
      }
    });

    // Connect as attendee to receive icon updates
    pubsub.connectAttendee(String(shortid));
    pubsubRef.current = pubsub;

    return () => {
      pubsub.destroy();
      pubsubRef.current = null;
    };
  }, [session, shortid, setCurrentIcon, setSessionEnded]);

  // Generate quiz icons when current icon updates
  const quizIcons = useMemo(() => {
    if (currentIcon <= 0) return null;
    return generateQuizIcons(currentIcon);
  }, [currentIcon]);

  async function handleIconClick(icon: number) {
    if (selectedIcon !== null) return; // Prevent multiple clicks
    setSelectedIcon(icon);
    await attemptQuiz(icon);
  }

  // Redirect on success after delay + PubSub notification
  useEffect(() => {
    if (status === "success") {
      // Notify via PubSub
      if (pubsubRef.current && shortid && user) {
        pubsubRef.current.checkinAttendee(String(shortid), user);
        pubsubRef.current.close();
      }
      const timer = setTimeout(() => {
        navigate({ to: "/download" });
      }, REDIRECT_DELAY);
      return () => clearTimeout(timer);
    }
  }, [status, shortid, user, navigate]);

  // Redirect on locked/ended after delay
  useEffect(() => {
    if (status === "locked" || status === "ended") {
      const timer = setTimeout(() => {
        navigate({ to: "/download" });
      }, REDIRECT_DELAY);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  // Reset selectedIcon when status goes back to quiz
  useEffect(() => {
    if (status === "quiz") {
      setSelectedIcon(null);
    }
  }, [status]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0277bd] to-[#01579b]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0277bd] to-[#01579b] px-4">
      <div className="w-full max-w-sm">
        {/* Session info */}
        <div className="text-center mb-6">
          <h2 className="text-white/70 text-sm uppercase tracking-wider">
            {session.courseName || "Session"}
          </h2>
          <h1 className="text-white text-lg font-semibold">{session.name}</h1>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          {/* Welcome */}
          {user && (
            <p className="text-gray-700 text-center mb-2">
              Welcome, <span className="font-medium">{user.firstName}</span>!
            </p>
          )}

          {/* Status messages */}
          {status === "success" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-xl font-bold text-green-600">
                Check-in Successful!
              </p>
              <p className="text-sm text-gray-500">
                Your attendance has been recorded.
              </p>
            </div>
          )}

          {status === "already_checked_in" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-xl font-bold text-green-600">
                Already Checked In
              </p>
              <p className="text-sm text-gray-500">
                You have already checked in to this session.
              </p>
            </div>
          )}

          {status === "locked" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Lock className="h-16 w-16 text-red-500" />
              <p className="text-xl font-bold text-red-600">Account Locked</p>
              <p className="text-sm text-gray-500 text-center">
                Too many incorrect attempts. Please contact your instructor.
              </p>
            </div>
          )}

          {status === "ended" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Ban className="h-16 w-16 text-gray-400" />
              <p className="text-xl font-bold text-gray-600">Session Ended</p>
              <p className="text-sm text-gray-500 text-center">
                This session has ended and check-in is no longer available.
              </p>
            </div>
          )}

          {status === "course_locked" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Lock className="h-16 w-16 text-orange-500" />
              <p className="text-lg font-bold text-orange-600 text-center">
                Course is locked for new attendees
              </p>
              <p className="text-sm text-gray-500 text-center">
                Please contact your instructor to be added to the course.
              </p>
            </div>
          )}

          {/* Quiz */}
          {(status === "quiz" || status === "fail") && (
            <>
              <p className="text-sm text-gray-600 text-center mb-4">
                Select the icon shown on the session screen
              </p>

              {status === "fail" && selectedIcon !== null && (
                <div className="flex items-center justify-center gap-2 mb-3 text-red-500">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Wrong icon — try again ({MAX_ATTEMPTS - attempts} left)
                  </span>
                </div>
              )}

              {!quizIcons ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-3">
                  {/* First row: 2 icons */}
                  <div className="flex justify-center gap-4">
                    {quizIcons.slice(0, 2).map((iconIdx) => (
                      <button
                        key={iconIdx}
                        onClick={() => handleIconClick(iconIdx)}
                        disabled={selectedIcon !== null && status !== "quiz"}
                        className={cn(
                          "h-[80px] w-[80px] rounded-xl border-2 transition-all",
                          "hover:border-accent hover:shadow-md",
                          selectedIcon === iconIdx && status === "fail"
                            ? "border-red-400 bg-red-50"
                            : "border-gray-200 bg-white",
                        )}
                      >
                        <div
                          className="mx-auto"
                          style={{
                            width: ICON_SIZE,
                            height: ICON_SIZE,
                            backgroundImage: `url(${SPRITE_URL})`,
                            backgroundPosition: `0 ${(iconIdx - 1) * ICON_SIZE * -1}px`,
                            backgroundSize: `${ICON_SIZE}px auto`,
                          }}
                        />
                      </button>
                    ))}
                  </div>
                  {/* Second row: 3 icons */}
                  <div className="flex justify-center gap-4">
                    {quizIcons.slice(2).map((iconIdx) => (
                      <button
                        key={iconIdx}
                        onClick={() => handleIconClick(iconIdx)}
                        disabled={selectedIcon !== null && status !== "quiz"}
                        className={cn(
                          "h-[80px] w-[80px] rounded-xl border-2 transition-all",
                          "hover:border-accent hover:shadow-md",
                          selectedIcon === iconIdx && status === "fail"
                            ? "border-red-400 bg-red-50"
                            : "border-gray-200 bg-white",
                        )}
                      >
                        <div
                          className="mx-auto"
                          style={{
                            width: ICON_SIZE,
                            height: ICON_SIZE,
                            backgroundImage: `url(${SPRITE_URL})`,
                            backgroundPosition: `0 ${(iconIdx - 1) * ICON_SIZE * -1}px`,
                            backgroundSize: `${ICON_SIZE}px auto`,
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {attempts > 0 && status === "quiz" && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  Attempts: {attempts}/{MAX_ATTEMPTS}
                </p>
              )}
            </>
          )}
        </div>

        {/* Logo */}
        <div className="text-center mt-8">
          <p className="text-white/50 text-xs">Powered by ezcheck.me</p>
        </div>
      </div>
    </div>
  );
}
