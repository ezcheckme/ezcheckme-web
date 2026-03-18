/**
 * Session store (Zustand).
 * Replaces sessions reducer from Redux (redux-store.md §3.2).
 * Manages session list, lifecycle, navigation, and check-in operations.
 */

import { create } from "zustand";
import type { Session, CheckinPayload } from "@/shared/types";
import * as sessionService from "@/shared/services/session.service";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SessionState {
  courseId: string | null;
  sessionId: string | null;
  sessions: Session[];
  session: Session | null;
  nextSession: boolean;
  prevSession: boolean;
  loading: boolean;
}

interface SessionActions {
  // CRUD / Lifecycle
  getCourseSessions: (courseId: string) => Promise<void>;
  createSession: (props: Record<string, unknown>) => Promise<Session>;
  createFutureSession: (props: Record<string, unknown>) => Promise<Session>;
  resumeSession: (
    props: Record<string, unknown>,
    courseId: string,
    sessionId: string,
  ) => Promise<Session>;
  endSession: (courseId: string, sessionId: string) => Promise<void>;
  deleteSession: (courseId: string, sessionId: string) => Promise<void>;
  renameSession: (
    courseId: string,
    sessionId: string,
    name: string,
  ) => Promise<void>;
  updateSession: (
    courseId: string,
    sessionId: string,
    data: Record<string, unknown>,
  ) => Promise<void>;

  // Selection / Navigation
  selectSession: (courseId: string, sessionId: string) => void;
  navigateSession: (direction: "next" | "prev") => void;

  // Check-in
  checkUncheck: (payload: CheckinPayload) => Promise<void>;

  // Reset
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computePrevNext(sessions: Session[], sessionId: string | null) {
  if (!sessionId || sessions.length === 0) {
    return { nextSession: false, prevSession: false };
  }
  const idx = sessions.findIndex((s) => s.id === sessionId);
  return {
    nextSession: idx < sessions.length - 1,
    prevSession: idx > 0,
  };
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: SessionState = {
  courseId: null,
  sessionId: null,
  sessions: [],
  session: null,
  nextSession: false,
  prevSession: false,
  loading: false,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useSessionStore = create<SessionState & SessionActions>()(
  (set, get) => ({
    ...initialState,

    getCourseSessions: async (courseId) => {
      set({ loading: true });
      try {
        const raw = await sessionService.getCourseSessions(courseId);
        // Sort by date descending (newest first), matching legacy display order
        raw.sort((a: any, b: any) => {
          const aDate = a.begins ? new Date(a.begins).getTime() : 0;
          const bDate = b.begins ? new Date(b.begins).getTime() : 0;
          return bDate - aDate;
        });
        // Map API fields and add computed values
        const sessions = raw.map((s: any, i: number) => {
          const checkins = s.checkins ?? 0;
          const totalStudents = s.totalStudents ?? 0;
          return {
            ...s,
            // API returns 'shortid' lowercase — map to camelCase
            shortId: s.shortId || s.shortid || s.id,
            serialId: raw.length - i,
            // Compute attendance rate if not provided
            attendanceRate:
              s.attendanceRate ??
              (totalStudents > 0
                ? Math.round((checkins / totalStudents) * 100)
                : 0),
          } as Session;
        });
        set({ sessions, courseId, loading: false });
      } catch {
        set({ sessions: [], loading: false });
      }
    },

    createSession: async (props) => {
      const session = await sessionService.createSession(props);
      // Store session info in localStorage for cross-tab persistence
      sessionService.saveSessionData({
        sessionId: session.id,
        courseId: session.courseId,
        mode: session.mode,
      });
      set({ session, sessionId: session.id, courseId: session.courseId });
      return session;
    },

    createFutureSession: async (props) => {
      const session = await sessionService.createFutureSession(props);
      // Refresh sessions list
      await get().getCourseSessions(session.courseId);
      return session;
    },

    resumeSession: async (props, courseId, sessionId) => {
      const session = await sessionService.resumeSession(
        props,
        courseId,
        sessionId,
      );
      sessionService.saveSessionData({
        sessionId: session.id,
        courseId: session.courseId,
        mode: session.mode,
      });
      set({ session, sessionId: session.id, courseId: session.courseId });
      return session;
    },

    endSession: async (courseId, sessionId) => {
      await sessionService.endSession(courseId, sessionId);
      sessionService.clearSessionStorageInfoForMinimized();
      set({ session: null, sessionId: null });
      // Refresh sessions list
      await get().getCourseSessions(courseId);
    },

    deleteSession: async (courseId, sessionId) => {
      await sessionService.deleteSession(courseId, sessionId);
      set({ session: null, sessionId: null });
      await get().getCourseSessions(courseId);
    },

    renameSession: async (courseId, sessionId, name) => {
      await sessionService.renameSession(courseId, sessionId, name);
      await get().getCourseSessions(courseId);
    },

    updateSession: async (courseId, sessionId, data) => {
      // Optimistic update — patch local state immediately to avoid skeleton flash
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === sessionId ? { ...s, ...data } : s,
        ),
      }));
      await sessionService.updateSessionData(data, sessionId);
    },

    selectSession: (courseId, sessionId) => {
      const { sessions } = get();
      const session = sessions.find((s) => s.id === sessionId) ?? null;
      const { nextSession, prevSession } = computePrevNext(sessions, sessionId);
      set({ courseId, sessionId, session, nextSession, prevSession });
    },

    navigateSession: (direction) => {
      const { sessions, sessionId } = get();
      if (!sessionId) return;
      const idx = sessions.findIndex((s) => s.id === sessionId);
      const newIdx = direction === "next" ? idx + 1 : idx - 1;
      if (newIdx >= 0 && newIdx < sessions.length) {
        const newSession = sessions[newIdx];
        const { nextSession, prevSession } = computePrevNext(
          sessions,
          newSession.id,
        );
        set({
          sessionId: newSession.id,
          session: newSession,
          nextSession,
          prevSession,
        });
      }
    },

    checkUncheck: async (payload) => {
      await sessionService.checkUncheck(payload);
    },

    reset: () => set(initialState),
  }),
);
