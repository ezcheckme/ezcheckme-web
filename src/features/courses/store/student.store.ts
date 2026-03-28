/**
 * Student store (Zustand).
 * Replaces students reducer from Redux (redux-store.md §3.3).
 * Manages student list, CRUD, check-in requests, and prev/next navigation.
 */

import { create } from "zustand";
import { handleError } from "@/shared/utils/error.utils";
import type {
  Student,
  CheckinRequest,
  CreateAttendeePayload,
  UpdateAttendeePayload,
} from "@/shared/types";
import * as attendeeService from "@/shared/services/attendee.service";
import * as sessionService from "@/shared/services/session.service";
import * as courseService from "@/shared/services/course.service";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StudentState {
  students: Student[];
  courseId: string | null;
  studentId: string | null;
  nextStudent: boolean;
  prevStudent: boolean;
  checkinRequests: CheckinRequest[];
  loading: boolean;
}

interface StudentActions {
  // Load
  getCourseStudents: (courseId: string) => Promise<void>;
  getCheckinRequests: () => Promise<void>;

  // CRUD
  createStudentManual: (
    courseId: string,
    data: CreateAttendeePayload,
  ) => Promise<void>;
  deleteStudents: (courseId: string, studentIds: string[]) => Promise<void>;
  updateAttendee: (data: UpdateAttendeePayload) => Promise<void>;

  // Navigation
  selectStudent: (courseId: string, studentId: string) => void;
  navigateStudent: (direction: "next" | "prev") => void;

  // Reset
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computePrevNext(students: Student[], studentId: string | null) {
  if (!studentId || students.length === 0) {
    return { nextStudent: false, prevStudent: false };
  }
  const idx = students.findIndex((s) => s.id === studentId);
  return {
    nextStudent: idx < students.length - 1,
    prevStudent: idx > 0,
  };
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: StudentState = {
  students: [],
  courseId: null,
  studentId: null,
  nextStudent: false,
  prevStudent: false,
  checkinRequests: [],
  loading: false,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useStudentStore = create<StudentState & StudentActions>()(
  (set, get) => ({
    ...initialState,

    getCourseStudents: async (courseId) => {
      set({ loading: true });
      try {
        const students = (await courseService.getCourseStudents(
          courseId,
        )) as Student[];
        set({ students, courseId, loading: false });
      } catch (error) {
        handleError(error, "students.getCourseStudents", { message: "Failed to load students" });
        set({ students: [], loading: false });
      }
    },

    getCheckinRequests: async () => {
      try {
        const checkinRequests =
          await sessionService.getCheckinPendingRequests();
        set({ checkinRequests });
      } catch (error) {
        handleError(error, "students.getCheckinRequests", { toast: false });
        set({ checkinRequests: [] });
      }
    },

    createStudentManual: async (courseId, data) => {
      await attendeeService.createAttendeeUser(data);
      // Refresh students list
      await get().getCourseStudents(courseId);
    },

    deleteStudents: async (courseId, studentIds) => {
      // Delete in parallel (matches legacy behavior)
      await Promise.all(
        studentIds.map((id) =>
          attendeeService.deleteAttendeeUser(courseId, id),
        ),
      );
      await get().getCourseStudents(courseId);
    },

    updateAttendee: async (data) => {
      await attendeeService.updateAttendee(data);
      const { courseId } = get();
      if (courseId) {
        await get().getCourseStudents(courseId);
      }
    },

    selectStudent: (courseId, studentId) => {
      const { students } = get();
      const { nextStudent, prevStudent } = computePrevNext(students, studentId);
      set({ courseId, studentId, nextStudent, prevStudent });
    },

    navigateStudent: (direction) => {
      const { students, studentId } = get();
      if (!studentId) return;
      const idx = students.findIndex((s) => s.id === studentId);
      const newIdx = direction === "next" ? idx + 1 : idx - 1;
      if (newIdx >= 0 && newIdx < students.length) {
        const newStudent = students[newIdx];
        const { nextStudent, prevStudent } = computePrevNext(
          students,
          newStudent.id,
        );
        set({
          studentId: newStudent.id,
          nextStudent,
          prevStudent,
        });
      }
    },

    reset: () => set(initialState),
  }),
);
