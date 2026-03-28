/**
 * Course store (Zustand).
 * Replaces courses reducer from Redux (redux-store.md §3.1).
 * Manages course list, selection, view navigation, messages, and auto-sessions.
 */

import { create } from "zustand";
import { handleError } from "@/shared/utils/error.utils";
import type { CourseView } from "@/config/constants";
import { COURSE_VIEWS } from "@/config/constants";
import type { Course, CourseMessage, FieldCheckin } from "@/shared/types";
import type { AutoSession } from "@/shared/types";
import * as courseService from "@/shared/services/course.service";
import * as sessionService from "@/shared/services/session.service";
import * as messagingService from "@/shared/services/messaging.service";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CourseState {
  courseId: string | null;
  view: CourseView;
  courses: Course[] | null;
  loading: boolean;
  error: string | null;
  messages: CourseMessage[];
  autoSessions: AutoSession[];
  checkins: FieldCheckin[];
  latestCourseSelected: boolean;
  studentId: string | null;
}

interface CourseActions {
  // CRUD
  getCourses: () => Promise<void>;
  createCourse: (props: Partial<Course>) => Promise<string | undefined>;
  updateCourse: (props: Partial<Course> & { id: string }) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;

  // Selection / Navigation
  selectCourse: (courseId: string) => void;
  viewCourse: (courseId: string, viewType: CourseView) => void;
  changeView: (viewType: CourseView) => void;

  // Messages
  sendMessage: (
    courseId: string,
    title: string,
    message: string,
  ) => Promise<void>;
  deleteMessage: (courseId: string, messageId: string) => Promise<void>;
  getCourseMessages: (courseId: string) => Promise<void>;

  // Auto-sessions
  getAutoSessions: (room: string) => Promise<void>;

  // Field check-ins
  getCourseFieldCheckins: (courseId: string) => Promise<void>;

  // Loading / Error
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Student navigation
  setStudentId: (studentId: string | null) => void;

  // Reset
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: CourseState = {
  courseId: null,
  view: COURSE_VIEWS.SESSIONS,
  courses: null,
  loading: true,
  error: null,
  messages: [],
  autoSessions: [],
  checkins: [],
  latestCourseSelected: false,
  studentId: null,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCourseStore = create<CourseState & CourseActions>()(
  (set, get) => ({
    ...initialState,

    // -- CRUD --
    getCourses: async () => {
      set({ loading: true, error: null });
      try {
        const courses = await courseService.getAllCourses();
        set({ courses, loading: false });
      } catch (err) {
        handleError(err, "courses.getCourses", { message: "Failed to load courses" });
        set({
          error: (err as Error).message || "Failed to load courses",
          loading: false,
        });
      }
    },

    createCourse: async (props) => {
      set({ loading: true });
      try {
        const course = await courseService.addCourse(props);
        // Refresh course list then auto-select the new course
        await get().getCourses();
        set({
          courseId: course.id,
          latestCourseSelected: true,
          view: COURSE_VIEWS.SESSIONS,
        });
        return course.id;
      } catch (err) {
        handleError(err, "courses.createCourse", { message: "Failed to create course" });
        set({
          error: (err as Error).message || "Failed to create course",
          loading: false,
        });
        return undefined;
      }
    },

    updateCourse: async (props) => {
      try {
        await courseService.updateCourse(props);
        await get().getCourses();
      } catch (err) {
        handleError(err, "courses.updateCourse", { message: "Failed to update course" });
        set({ error: (err as Error).message || "Failed to update course" });
      }
    },

    deleteCourse: async (courseId) => {
      try {
        await courseService.deleteCourse(courseId);
        await get().getCourses();
        // Select first remaining course
        const { courses } = get();
        if (courses && courses.length > 0) {
          set({ courseId: courses[0].id, view: COURSE_VIEWS.SESSIONS });
        } else {
          set({ courseId: null });
        }
      } catch (err) {
        handleError(err, "courses.deleteCourse", { message: "Failed to delete course" });
        set({ error: (err as Error).message || "Failed to delete course" });
      }
    },

    // -- Selection / Navigation --
    selectCourse: (courseId) => {
      // For shift/field courses, default to Attendees view (Dashboard/Sessions are hidden)
      const { courses } = get();
      const course = courses?.find((c) => c.id === courseId);
      const defaultView =
        course?.fieldCheckin === true
          ? COURSE_VIEWS.STUDENTS
          : COURSE_VIEWS.SESSIONS;
      set({
        courseId,
        view: defaultView,
        latestCourseSelected: false,
      });
    },

    viewCourse: (courseId, viewType) => {
      set({ courseId, view: viewType });
    },

    changeView: (viewType) => {
      set({ view: viewType });
    },

    // -- Messages --
    sendMessage: async (courseId, title, message) => {
      try {
        await messagingService.sendMessage(courseId, title, message);
        await get().getCourseMessages(courseId);
      } catch (err) {
        handleError(err, "courses.sendMessage", { message: "Failed to send message" });
        set({ error: (err as Error).message || "Failed to send message" });
      }
    },

    deleteMessage: async (courseId, messageId) => {
      try {
        await messagingService.deleteMessage(courseId, messageId);
        await get().getCourseMessages(courseId);
      } catch (err) {
        handleError(err, "courses.deleteMessage", { message: "Failed to delete message" });
        set({ error: (err as Error).message || "Failed to delete message" });
      }
    },

    getCourseMessages: async (courseId) => {
      try {
        const messages = await messagingService.getCourseMessages(courseId);
        set({ messages });
      } catch (error) {
        handleError(error, "courses.getCourseMessages", { toast: false });
      }
    },

    // -- Auto-sessions --
    getAutoSessions: async (room) => {
      try {
        const autoSessions = await sessionService.getAutoSessions(room);
        set({ autoSessions });
      } catch (error) {
        handleError(error, "courses.getAutoSessions", { toast: false });
        set({ autoSessions: [] });
      }
    },

    // -- Field check-ins --
    getCourseFieldCheckins: async (courseId) => {
      try {
        const checkins = await courseService.getCourseFieldCheckins(courseId);
        set({ checkins });
      } catch (error) {
        handleError(error, "courses.getCourseFieldCheckins", { toast: false });
        set({ checkins: [] });
      }
    },

    // -- Loading / Error --
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    // -- Student navigation --
    setStudentId: (studentId) => set({ studentId }),

    // -- Reset --
    reset: () => set(initialState),
  }),
);
