import { act } from "@testing-library/react";
import { useSessionStore } from "../store/sessionStore";
import type {
  Session,
  SessionStatus,
  SessionMode,
} from "@/shared/types/session.types";

describe("useSessionStore", () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useSessionStore.getState();
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
    const state = useSessionStore.getState();
    expect(state.currentSession).toBeNull();
    expect(state.studentsPresent).toEqual([]);
    expect(state.remainingTime).toBe(0);
    expect(state.isPaused).toBe(false);
  });

  it("should set an active session", () => {
    act(() => {
      useSessionStore.getState().setSession(mockSession);
    });

    const state = useSessionStore.getState();
    expect(state.currentSession).toEqual(mockSession);
  });

  it("should add a student and prevent duplicates", () => {
    act(() => {
      useSessionStore.getState().setSession(mockSession);
      useSessionStore.getState().addStudentPresent("student-1");
      useSessionStore.getState().addStudentPresent("student-2");
    });

    let state = useSessionStore.getState();
    expect(state.studentsPresent).toHaveLength(2);
    expect(state.studentsPresent).toContain("student-1");

    // Add duplicate
    act(() => {
      useSessionStore.getState().addStudentPresent("student-1");
    });

    state = useSessionStore.getState();
    expect(state.studentsPresent).toHaveLength(2); // Still 2
  });

  it("should manage remaining time correctly", () => {
    act(() => {
      useSessionStore.getState().setRemainingTime(3600);
    });

    let state = useSessionStore.getState();
    expect(state.remainingTime).toBe(3600);

    act(() => {
      useSessionStore.getState().setRemainingTime(3598);
    });

    state = useSessionStore.getState();
    expect(state.remainingTime).toBe(3598);
  });

  it("should handle pause and resume", () => {
    act(() => {
      useSessionStore.setState({ isPaused: true });
    });

    let state = useSessionStore.getState();
    expect(state.isPaused).toBe(true);

    act(() => {
      useSessionStore.setState({ isPaused: false });
    });

    state = useSessionStore.getState();
    expect(state.isPaused).toBe(false);
  });
});
