import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useQrCode } from "../hooks/useQrCode";
import { useLiveSessionStore } from "../store/sessionStore";
import { post } from "@/shared/services/api-client";

// Mock the API client
vi.mock("@/shared/services/api-client", () => ({
  post: vi.fn().mockResolvedValue({ checkins: 5 }),
}));

// Mock the qr-logo library since we don't want to actually generate images in tests
vi.mock("qr-logo", () => {
  class MockQRLogo {
    generate() {
      return Promise.resolve("data:image/png;base64,mockqrimagedata");
    }
  }
  return { default: MockQRLogo };
});

describe("useQrCode hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset store
    act(() => {
      const store = useLiveSessionStore.getState();
      store.clearSession();
      store.setSession({
        id: "sess-123",
        courseId: "course-1",
        name: "Test",
        status: "active",
        mode: "manual",
        begins: Date.now(),
      });
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should generate a QR code initially", async () => {
    const { result } = renderHook(() =>
      useQrCode({
        sessionId: "sess-123",
        shortId: "123456",
        courseId: "course-1",
        category: "Academy",
      }),
    );

    // Initially loading
    expect(result.current).toBe("");

    // Fast-forward initial generation
    await act(async () => {
      vi.runOnlyPendingTimers();
    });

    // After generation, it should have the mock image and have called the API
    expect(result.current).toBe("data:image/png;base64,mockqrimagedata");
    expect(post).toHaveBeenCalledTimes(1);

    const store = useLiveSessionStore.getState();
    expect(store.qrCode).toBe("data:image/png;base64,mockqrimagedata");
  });

  it("should respect pause state from store", async () => {
    // Start paused
    act(() => {
      useLiveSessionStore.setState({ isPaused: true });
    });

    renderHook(() =>
      useQrCode({
        sessionId: "sess-123",
        shortId: "123456",
        courseId: "course-1",
        category: "Academy",
        customQrInterval: 5,
      }),
    );

    await act(async () => {
      vi.advanceTimersByTime(6000);
    });

    // Should not have generated any QR codes while paused
    expect(post).not.toHaveBeenCalled();

    // Unpause
    act(() => {
      useLiveSessionStore.setState({ isPaused: false });
    });

    await act(async () => {
      vi.advanceTimersByTime(5000); // Wait for the interval
      // Let promises resolve
      await Promise.resolve();
    });

    expect(post).toHaveBeenCalledTimes(1);
  });
});
