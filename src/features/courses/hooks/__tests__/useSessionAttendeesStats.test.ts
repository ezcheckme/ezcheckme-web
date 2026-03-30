import { renderHook } from "@testing-library/react";
import { useSessionAttendeesStats } from "../useSessionAttendeesStats";
import * as attendanceUtils from "../../utils/attendance.utils";
import { vi, type Mock } from "vitest";
import type { Student } from "@/shared/types";

// Mock the util functions
vi.mock("../../utils/attendance.utils", () => ({
  getLocationStatus: vi.fn(),
  formatCheckInMethod: vi.fn(),
}));

describe("useSessionAttendeesStats", () => {
  const mockCourse = { id: "course-1", maxattendance: 5 };
  
  const mockStudents: Student[] = [
    {
      id: "s1",
      name: "Alice",
      sessions: {
        "sess-1": {
          time: 1704103200000, // 2024-01-01T10:00:00Z in ms
          method: "QR",
          location: { latLng: { lat: 10, lng: 20 } },
          selfie: "https://selfie.jpg",
          reason: "Traffic",
        },
      },
    },
    {
      id: "s2",
      name: "Bob",
      sessions: {
        "sess-1": {
          request: "pending",
        },
      },
    },
    {
      id: "s3",
      name: "Charlie",
      sessions: {}, // No session data at all
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty stats if no sessionId is provided", () => {
    const { result } = renderHook(() =>
      useSessionAttendeesStats(mockStudents, null, mockCourse)
    );

    expect(result.current.studentsWithStatus).toEqual([]);
    expect(result.current.checkedInCount).toBe(0);
    expect(result.current.attendanceRate).toBe(0);
  });

  it("should process student data and calculate correctly for a valid session", () => {
    // Mock the geographic logic resolving to "verified" for Alice
    (attendanceUtils.getLocationStatus as Mock).mockReturnValue("verified");

    const { result } = renderHook(() =>
      useSessionAttendeesStats(mockStudents, "sess-1", mockCourse)
    );

    // Assert overall counts
    expect(result.current.checkedInCount).toBe(1); // Only Alice is checked in
    expect(result.current.attendanceRate).toBe(20); // 1 checked in / 5 max = 20%

    // Assert derived data for Alice
    const aliceStats = result.current.studentsWithStatus.find(s => s.id === "s1");
    expect(aliceStats?.checkedIn).toBe(true);
    expect(aliceStats?.checkinTime).toBe(1704103200000);
    expect(aliceStats?.checkinMethod).toBe("QR");
    expect(aliceStats?.locationStatus).toBe("verified");
    expect(aliceStats?.checkinSelfie).toBe("https://selfie.jpg");
    expect(aliceStats?.checkinReason).toBe("Traffic");

    // Assert derived data for Bob
    const bobStats = result.current.studentsWithStatus.find(s => s.id === "s2");
    expect(bobStats?.checkedIn).toBe(false); // Only 'request' is present, time is not
    expect(bobStats?.request).toBe("pending");

    // Assert derived data for Charlie
    const charlieStats = result.current.studentsWithStatus.find(s => s.id === "s3");
    expect(charlieStats?.checkedIn).toBe(false);
    expect(charlieStats?.checkinTime).toBeUndefined();
  });

  it("should return 0% attendance rate if there is no checkins", () => {
    const { result } = renderHook(() =>
      useSessionAttendeesStats([mockStudents[1], mockStudents[2]], "sess-1", mockCourse)
    );
    expect(result.current.checkedInCount).toBe(0);
    expect(result.current.attendanceRate).toBe(0);
  });

  it("should return 0% attendance if course maxattendance is missing or 0", () => {
    const courseWithZeroMax = { id: "course-1", maxattendance: 0 };
    const { result } = renderHook(() =>
      useSessionAttendeesStats(mockStudents, "sess-1", courseWithZeroMax)
    );
    expect(result.current.checkedInCount).toBe(1);
    expect(result.current.attendanceRate).toBe(0);
  });
});
