import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SessionStudents } from "../SessionStudents";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useCourseStore } from "../../store/course.store";
import { useSessionStore } from "../../store/session.store";
import { useStudentStore } from "../../store/student.store";


// Mock the TanStack router hooks
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ sessionId: "session-1" }),
}));

// Mock the Zustand stores
vi.mock("@/features/auth/store/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("../../store/course.store", () => ({
  useCourseStore: vi.fn(),
}));

vi.mock("../../store/session.store", () => ({
  useSessionStore: vi.fn(),
}));

vi.mock("../../store/student.store", () => ({
  useStudentStore: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("SessionStudents Premium Gating", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const mockCourseStore = {
      courseId: "course-1",
      courses: [{ id: "course-1", fieldCheckinRadius: 200 }],
      viewCourse: vi.fn(),
    };

    const mockSessionStore = {
      session: { id: "session-1", name: "Test Session" },
      sessionId: "session-1",
      sessions: [{ id: "session-1" }],
      getCourseSessions: vi.fn().mockResolvedValue([]),
      selectSession: vi.fn(),
      nextSession: null,
      prevSession: null,
      navigateSession: vi.fn(),
      checkUncheck: vi.fn(),
    };

    const mockStudentStore = {
      getCourseStudents: vi.fn().mockResolvedValue([]),
      students: [
        {
          id: "student-1",
          name: "Premium Student",
          sessions: {
            "session-1": {
              time: Date.now(),
              method: "GPS",
              location: { latLng: "0,0", distance: 50 }, // distance < 200 => Verified
            },
          },
        },
      ],
    };

    // Default mocks for the stores to render properly
    (useCourseStore as any).mockImplementation((selector: any) => selector(mockCourseStore));
    (useSessionStore as any).mockImplementation((selector: any) => selector(mockSessionStore));
    (useStudentStore as any).mockImplementation((selector: any) => selector(mockStudentStore));
  });

  it("should show 'Classroom' location for a Premium user", async () => {
    // Mock Premium User
    (useAuthStore as any).mockImplementation((selector: any) =>
      selector({
        user: { plan: "Premium" },
      })
    );

    render(<SessionStudents />);

    // Since it's < 200m distance, we expect "Classroom"
    expect(await screen.findByText("Classroom")).toBeInTheDocument();
    // It should not show "N/A"
    expect(screen.queryByText("N/A")).not.toBeInTheDocument();
  });

  it("should show 'N/A' location for a standard Free user", async () => {
    // Mock Free User
    (useAuthStore as any).mockImplementation((selector: any) =>
      selector({
        user: { plan: "Basic" },
      })
    );

    render(<SessionStudents />);

    // Expect N/A instead of the location text
    expect(await screen.findByText("N/A")).toBeInTheDocument();
    // Must not show Classroom
    expect(screen.queryByText("Classroom")).not.toBeInTheDocument();
  });
});
