import { act } from "@testing-library/react";
import { useLiveSessionStore } from "../store/sessionStore";
import type {
  Session,
  SessionStatus,
  SessionMode,
} from "@/shared/types/session.types";

describe("useLiveSessionStore", () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useLiveSessionStore.getState();
    act(() => {
      store.clearSession();
    });
  });

  const mockSession: Session = {
    id: "123",
    courseId: "456",
    name: "Test Session",
    status: "active" as SessionStatus,
    mode: "manual" as SessionMode,
    begins: Date.now(),
    duration: 60,
  };

  it("should initialize with empty state", () => {
    const state = useLiveSessionStore.getState();
    expect(state.currentSession).toBeNull();
    expect(state.studentsPresent).toEqual([]);
    expect(state.remainingTime).toBe(0);
    expect(state.isPaused).toBe(false);
  });

  it("should set an active session", () => {
    act(() => {
      useLiveSessionStore.getState().setSession(mockSession);
    });

    const state = useLiveSessionStore.getState();
    expect(state.currentSession).toEqual(mockSession);
  });

  it("should add a student and prevent duplicates", () => {
    act(() => {
      useLiveSessionStore.getState().setSession(mockSession);
      useLiveSessionStore.getState().addStudentPresent("student-1");
      useLiveSessionStore.getState().addStudentPresent("student-2");
    });

    let state = useLiveSessionStore.getState();
    expect(state.studentsPresent).toHaveLength(2);
    expect(state.studentsPresent).toContain("student-1");

    // Add duplicate
    act(() => {
      useLiveSessionStore.getState().addStudentPresent("student-1");
    });

    state = useLiveSessionStore.getState();
    expect(state.studentsPresent).toHaveLength(2); // Still 2
  });

  it("should manage remaining time correctly", () => {
    act(() => {
      useLiveSessionStore.getState().setRemainingTime(3600);
    });

    let state = useLiveSessionStore.getState();
    expect(state.remainingTime).toBe(3600);

    act(() => {
      useLiveSessionStore.getState().setRemainingTime(3598);
    });

    state = useLiveSessionStore.getState();
    expect(state.remainingTime).toBe(3598);
  });

  it("should handle pause and resume", () => {
    act(() => {
      useLiveSessionStore.setState({ isPaused: true });
    });

    let state = useLiveSessionStore.getState();
    expect(state.isPaused).toBe(true);

    act(() => {
      useLiveSessionStore.setState({ isPaused: false });
    });

    state = useLiveSessionStore.getState();
    expect(state.isPaused).toBe(false);
  });
});
