/**
 * CourseList component tests.
 * Uses Vitest + React Testing Library.
 *
 * Pre-seeds the Zustand store with course data and stubs
 * getCourses to a no-op so the mount effect doesn't trigger
 * real API calls.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Course } from "@/shared/types";
import { useCourseStore } from "../store/course.store";
import { CourseList } from "../components/CourseList";

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

const mockCourses: Course[] = [
  {
    id: "course-1",
    name: "Introduction to CS",
    faculty: "Computer Science",
    year: "2025",
    status: "active",
    type: "classroom",
  } as unknown as Course,
  {
    id: "course-2",
    name: "Data Structures",
    faculty: "Computer Science",
    year: "2025",
    status: "active",
    type: "field",
  } as unknown as Course,
  {
    id: "course-3",
    name: "Hidden Algorithms",
    faculty: "Computer Science",
    year: "2025",
    status: "hidden",
    type: "classroom",
  } as unknown as Course,
];

// Pre-seed store + stub getCourses so the mount useEffect doesn't fire real API
beforeEach(() => {
  useCourseStore.setState({
    courseId: "course-1",
    courses: mockCourses,
    loading: false,
    error: null,
    messages: [],
    autoSessions: [],
    checkins: [],
    latestCourseSelected: false,
    studentId: null,
    // Stub actions that would trigger network calls
    getCourses: vi.fn(async () => {}),
    updateCourse: vi.fn(async () => {}),
    deleteCourse: vi.fn(async () => {}),
  });
});

describe("CourseList", () => {
  it("renders course count in header", () => {
    render(<CourseList />);
    // Total count includes all courses (active + hidden)
    expect(screen.getByText(/My Courses \(3\)/)).toBeInTheDocument();
  });

  it("renders active course names", () => {
    render(<CourseList />);
    expect(screen.getByText("Introduction to CS")).toBeInTheDocument();
    expect(screen.getByText("Data Structures")).toBeInTheDocument();
  });

  it("does not render hidden courses by default", () => {
    render(<CourseList />);
    expect(screen.queryByText("Hidden Algorithms")).not.toBeInTheDocument();
  });

  it("selects a course when its row is clicked", async () => {
    const user = userEvent.setup();
    render(<CourseList />);

    await user.click(screen.getByText("Data Structures"));

    const { courseId } = useCourseStore.getState();
    expect(courseId).toBe("course-2");
  });

  it("renders a dropdown menu trigger on each course row", () => {
    render(<CourseList />);

    // Each active course row has a DropdownMenu trigger (SVG-only button, no title)
    const allButtons = screen.getAllByRole("button");
    const menuTriggers = allButtons.filter((btn) => {
      const svg = btn.querySelector("svg");
      return svg && btn.textContent?.trim() === "" && !btn.hasAttribute("title");
    });
    // 2 active courses = 2 menu trigger buttons
    expect(menuTriggers).toHaveLength(2);
  });

  it("shows the 'Show hidden courses' toggle switch", () => {
    render(<CourseList />);
    expect(screen.getByText("Show hidden courses")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("renders the add course button", () => {
    render(<CourseList />);
    expect(screen.getByTitle("New Course")).toBeInTheDocument();
  });
});
