/**
 * Checkin store (Zustand) — manages attendee mobile check-in state.
 * Replaces mobile reducer from Redux (mobile.actions.js).
 * Uses "WAQUIZ" check-in method and checks course lock before check-in.
 */

import { create } from "zustand";
import { handleError } from "@/shared/utils/error.utils";
import * as sessionService from "@/shared/services/session.service";
import { getIsCourseLockedForDynamicAddingAttendees } from "@/shared/services/course.service";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CheckinSession {
  id: string;
  _id?: string;
  shortid: string;
  courseid: string;
  name: string;
  courseName?: string;
  iconQuizEnabled?: boolean;
  codes?: {
    current: { code: string; icon: string };
    previous?: { code: string; icon: string };
  };
}

interface CheckinUser {
  uid: string;
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

type CheckinStatus =
  | "idle"
  | "loading"
  | "quiz"
  | "success"
  | "fail"
  | "locked"
  | "ended"
  | "course_locked"
  | "already_checked_in";

interface CheckinState {
  session: CheckinSession | null;
  user: CheckinUser | null;
  status: CheckinStatus;
  currentIcon: number;
  attempts: number;
  error: string | null;
}

interface CheckinActions {
  /** Load session by short ID */
  loadSession: (shortId: string) => Promise<void>;
  /** Set current icon from QR scan or WebSocket */
  setCurrentIcon: (icon: number) => void;
  /** Set user data */
  setUser: (user: CheckinUser) => void;
  /** Load user from localStorage */
  loadStoredUser: () => CheckinUser | null;
  /** Attempt icon quiz answer */
  attemptQuiz: (selectedIcon: number) => Promise<void>;
  /** Direct check-in (from QR code with params) */
  directCheckin: (shortId: string, code: string, icon: string) => Promise<void>;
  /** Set session ended */
  setSessionEnded: () => void;
  /** Reset state */
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "ez:user";
const MAX_ATTEMPTS = 4;

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: CheckinState = {
  session: null,
  user: null,
  status: "idle",
  currentIcon: -1,
  attempts: 0,
  error: null,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCheckinStore = create<CheckinState & CheckinActions>()(
  (set, get) => ({
    ...initialState,

    loadSession: async (shortId) => {
      set({ status: "loading" });
      try {
        const res = await sessionService.getSessionByShortId(shortId);
        const session = {
          ...(res as any),
          id: (res as any)._id || (res as any).id,
          shortid: String((res as any).shortid || shortId),
          courseid: (res as any).courseid || "",
          name: (res as any).name || "",
          courseName: (res as any).coursename || (res as any).courseName || "",
        } as CheckinSession;
        set({
          session,
          status: "quiz",
        });
      } catch (error) {
        handleError(error, "checkin.loadSession", { message: "Session not found" });
        set({ status: "idle", error: "Session not found" });
      }
    },

    setCurrentIcon: (icon) => {
      set({ currentIcon: icon });
    },

    setUser: (user) => {
      set({ user });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } catch (error) {
        handleError(error, "checkin.setUser.localStorage", { toast: false });
      }
    },

    loadStoredUser: () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const user = JSON.parse(stored) as CheckinUser;
          set({ user });
          return user;
        }
      } catch (error) {
        handleError(error, "checkin.loadStoredUser", { toast: false });
      }
      return null;
    },

    attemptQuiz: async (selectedIcon) => {
      const { session, user, currentIcon, attempts } = get();
      if (!session || !user) return;

      const isCorrect = selectedIcon === currentIcon;
      const sessionId = session.id || session._id || "";

      if (isCorrect) {
        // ── Course lock check (matching old Quiz.js) ──
        try {
          const isLocked = await getIsCourseLockedForDynamicAddingAttendees(
            session.courseid,
            user._id || user.uid,
          );

          if (isLocked) {
            const newAttempts = attempts + 1;
            if (newAttempts >= MAX_ATTEMPTS) {
              try {
                localStorage.setItem(`locked:${sessionId}`, String(Date.now()));
              } catch (error) {
                handleError(error, "checkin.attemptQuiz.lockStorage", { toast: false });
              }
              set({ status: "course_locked", attempts: newAttempts });
            } else {
              set({ status: "course_locked", attempts: newAttempts });
            }
            return;
          }
        } catch (error) {
          handleError(error, "checkin.attemptQuiz.lockCheck", { toast: false });
        }

        // ── Check in with "WAQUIZ" method (matching old app) ──
        try {
          const attendeeId = localStorage.getItem("custom:attendeeid") || user.uid || user._id;
          await sessionService.checkUncheck({
            courseId: session.courseid,
            sessionId,
            checkin: true,
            attendeeid: attendeeId,
            method: "WAQUIZ",
            code: String(currentIcon),
            icon: currentIcon,
            name: `${user.firstName} ${user.lastName}`.trim(),
            email: user.email,
          });
          set({ status: "success" });
        } catch (error) {
          handleError(error, "checkin.attemptQuiz.checkIn", { message: "Check-in failed" });
          set({ status: "fail", error: "Check-in failed" });
        }
      } else {
        const newAttempts = attempts + 1;
        if (newAttempts >= MAX_ATTEMPTS) {
          // Lock the user out
          try {
            localStorage.setItem(`locked:${sessionId}`, String(Date.now()));
          } catch (error) {
            handleError(error, "checkin.attemptQuiz.lockStorage", { toast: false });
          }
          set({ status: "locked", attempts: newAttempts });
        } else {
          set({ status: "fail", attempts: newAttempts });
          // Reset to quiz state after delay
          setTimeout(() => {
            set({ status: "quiz" });
          }, 3000);
        }
      }
    },

    directCheckin: async (shortId, _code, icon) => {
      set({ status: "loading" });
      try {
        // Load session
        const res = await sessionService.getSessionByShortId(shortId);
        const checkinSession = {
          ...(res as any),
          id: (res as any)._id || (res as any).id,
          shortid: String((res as any).shortid || shortId),
          courseid: (res as any).courseid || "",
          name: (res as any).name || "",
          courseName: (res as any).coursename || (res as any).courseName || "",
        } as CheckinSession;
        set({ session: checkinSession, currentIcon: Number(icon) });

        // Load stored user
        const user = get().loadStoredUser();
        if (!user) {
          set({ status: "quiz" });
          return;
        }

        // Check if already checked in
        const sessionId = checkinSession.id || checkinSession._id || "";
        const result = await sessionService.isCheckedIn(
          checkinSession.courseid,
          sessionId,
          user.uid || user._id,
        );
        if (result.checkedIn) {
          set({ status: "already_checked_in" });
          return;
        }

        // Go to quiz
        set({ status: "quiz" });
      } catch (error) {
        handleError(error, "checkin.directCheckin", { message: "Session not found" });
        set({ status: "idle", error: "Session not found" });
      }
    },

    setSessionEnded: () => {
      set({ status: "ended" });
    },

    reset: () => set(initialState),
  }),
);

export type { CheckinSession, CheckinUser, CheckinStatus };
