import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  Session,
  AutoSession,
  CheckinRequest,
  LiveSessionData,
} from "@/shared/types/session.types";

export interface SessionState {
  currentSession: Session | null;
  /** Raw session data from localStorage (legacy shape) */
  liveSessionData: LiveSessionData | null;
  autoSessionData: AutoSession | null;

  // Live attendance data during session
  studentsPresent: string[];
  studentsAbsent: string[];
  checkInRequests: CheckinRequest[];

  // Attendee name display queue
  visibleAttendeeName: string | null;
  /** Pre-existing check-in count from session creation */
  initialCount: number;
  /** Live check-in counter since session start */
  nameCounter: number;
  /** Attendee IDs for server-side verification */
  attendeesVerificationBuffer: string[];

  // Time and UI state
  remainingTime: number;
  isPaused: boolean;
  minimizedView: boolean;
  /** Whether main window shows "opened in popup" placeholder */
  showMinimized: boolean;
  showRemainingTime: boolean;
  qrCode: string | null;

  // Session settings (from session / course data)
  iconQuizEnabled: boolean;
  ivrEnabled: boolean;
  category: string;
  customQrInterval: number | null;

  // Actions
  setSession: (session: Session) => void;
  setLiveSessionData: (data: LiveSessionData) => void;
  setAutoSessionData: (data: AutoSession) => void;
  setRemainingTime: (time: number) => void;
  togglePause: () => void;
  setMinimizedView: (minimized: boolean) => void;
  setShowMinimized: (show: boolean) => void;
  setQrCode: (qrCode: string) => void;
  setVisibleAttendeeName: (name: string | null) => void;
  incrementNameCounter: () => void;
  addToVerificationBuffer: (id: string) => void;
  addStudentPresent: (studentId: string) => void;
  removeStudentPresent: (studentId: string) => void;
  addCheckInRequest: (request: CheckinRequest) => void;
  resolveCheckInRequest: (requestId: string) => void;
  clearSession: () => void;
}

const initialState = {
  currentSession: null,
  liveSessionData: null,
  autoSessionData: null,
  studentsPresent: [],
  studentsAbsent: [],
  checkInRequests: [],
  visibleAttendeeName: null,
  initialCount: 0,
  nameCounter: 0,
  attendeesVerificationBuffer: [],
  remainingTime: 0,
  isPaused: false,
  minimizedView: false,
  showMinimized: false,
  showRemainingTime: true,
  qrCode: null,
  iconQuizEnabled: true,
  ivrEnabled: false,
  category: "Academy",
  customQrInterval: null,
};

export const useSessionStore = create<SessionState>()(
  devtools(
    (set) => ({
      ...initialState,

      setSession: (session) => set({ currentSession: session }),

      setLiveSessionData: (data) => set({ liveSessionData: data }),

      setAutoSessionData: (data) => set({ autoSessionData: data }),

      setRemainingTime: (time) => set({ remainingTime: time }),

      togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

      setMinimizedView: (minimized) => set({ minimizedView: minimized }),

      setShowMinimized: (show) => set({ showMinimized: show }),

      setQrCode: (qrCode) => set({ qrCode }),

      setVisibleAttendeeName: (name) => set({ visibleAttendeeName: name }),

      incrementNameCounter: () =>
        set((state) => ({ nameCounter: state.nameCounter + 1 })),

      addToVerificationBuffer: (id) =>
        set((state) => ({
          attendeesVerificationBuffer: [
            ...new Set([...state.attendeesVerificationBuffer, id]),
          ],
        })),

      addStudentPresent: (studentId) =>
        set((state) => ({
          studentsPresent: [...new Set([...state.studentsPresent, studentId])],
          studentsAbsent: state.studentsAbsent.filter((id) => id !== studentId),
        })),

      removeStudentPresent: (studentId) =>
        set((state) => ({
          studentsPresent: state.studentsPresent.filter(
            (id) => id !== studentId,
          ),
          studentsAbsent: [...new Set([...state.studentsAbsent, studentId])],
        })),

      addCheckInRequest: (request) =>
        set((state) => ({
          checkInRequests: [...state.checkInRequests, request],
        })),

      resolveCheckInRequest: (requestId) =>
        set((state) => ({
          checkInRequests: state.checkInRequests.filter(
            (req) => req.id !== requestId,
          ),
        })),

      clearSession: () => set(initialState),
    }),
    { name: "SessionStore" },
  ),
);
