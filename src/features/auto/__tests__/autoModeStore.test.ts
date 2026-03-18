import { act } from "@testing-library/react";
import { useAutoModeStore } from "../store/autoModeStore";
import type { AutoSession } from "@/shared/types/session.types";

describe("useAutoModeStore", () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useAutoModeStore.setState({
        room: null,
        rooms: [],
        sessions: [],
        isLoading: false,
        error: null,
      });
      localStorage.clear();
    });
  });

  it("should initialize with empty state", () => {
    const state = useAutoModeStore.getState();
    expect(state.room).toBeNull();
    expect(state.sessions).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it("should set room and save to localStorage", () => {
    act(() => {
      useAutoModeStore.getState().setRoom("Room A");
    });

    const state = useAutoModeStore.getState();
    expect(state.room).toBe("Room A");
    expect(localStorage.getItem("_room_")).toBe(JSON.stringify("Room A"));
  });

  it("should remove room from localStorage when set to null", () => {
    localStorage.setItem("_room_", JSON.stringify("Room B"));

    act(() => {
      useAutoModeStore.getState().setRoom(null);
    });

    const state = useAutoModeStore.getState();
    expect(state.room).toBeNull();
    expect(localStorage.getItem("_room_")).toBeNull();
  });

  it("should store sessions", () => {
    const mockSessions: AutoSession[] = [
      {
        id: "1",
        courseId: "A",
        begins: 1000,
        status: "scheduled",
        mode: "auto",
      },
    ];

    act(() => {
      useAutoModeStore.getState().setSessions(mockSessions);
    });

    const state = useAutoModeStore.getState();
    expect(state.sessions).toEqual(mockSessions);
  });

  it("should manage loading and error states", () => {
    act(() => {
      useAutoModeStore.getState().setLoading(true);
      useAutoModeStore.getState().setError("Failed");
    });

    const state = useAutoModeStore.getState();
    expect(state.isLoading).toBe(true);
    expect(state.error).toBe("Failed");
  });
});
