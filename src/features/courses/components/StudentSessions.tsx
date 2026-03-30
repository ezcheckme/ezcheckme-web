import { useEffect, useState, useMemo } from "react";
import { useCourseStore } from "../store/course.store";
import { useStudentStore } from "../store/student.store";
import { useSessionStore } from "../store/session.store";
import { COURSE_VIEWS, CHECKIN_METHODS, type CourseView } from "@/config/constants";
import { EditStudentDialog } from "./EditStudentDialog";
import { StudentAttendanceSummary } from "./StudentAttendanceSummary";
import { StudentSessionHistoryTable } from "./StudentSessionHistoryTable";
import type { Session } from "@/shared/types";

export function StudentSessions() {
  const courseId = useCourseStore((s) => s.courseId);
  const currentCourse = useCourseStore((s) => s.courses?.find((c) => c.id === courseId));
  const viewCourse = useCourseStore((s) => s.viewCourse);

  // Read studentId from BOTH stores (course store is the primary source, student store is fallback)
  const courseStoreStudentId = useCourseStore((s) => s.studentId);
  const studentStoreStudentId = useStudentStore((s) => s.studentId);
  const studentId = courseStoreStudentId || studentStoreStudentId;

  const students = useStudentStore((s) => s.students);

  const sessions = useSessionStore((s) => s.sessions);
  const getCourseSessions = useSessionStore((s) => s.getCourseSessions);
  const checkUncheck = useSessionStore((s) => s.checkUncheck);

  const [editOpen, setEditOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(0);

  // Find current student
  const student = useMemo(
    () => students.find((s) => s.id === studentId) ?? null,
    [students, studentId],
  );

  // Prev/next student
  const studentIdx = useMemo(
    () => (studentId ? students.findIndex((s) => s.id === studentId) : -1),
    [students, studentId],
  );
  const hasPrev = studentIdx > 0;
  const hasNext = studentIdx >= 0 && studentIdx < students.length - 1;

  // Make sure sessions are loaded
  useEffect(() => {
    if (courseId && sessions.length === 0) {
      getCourseSessions(courseId);
    }
  }, [courseId, sessions.length, getCourseSessions]);

  // Calculate attendance rate
  const attendanceRate = useMemo(() => {
    if (!student || sessions.length === 0) return 0;
    const studentSessions = student.sessions || {};
    let attended = 0;
    sessions.forEach((s) => {
      const entry = studentSessions[s.id];
      if (entry && entry.request !== "pending" && entry.request !== "denied") {
        attended++;
      }
    });
    return Math.round((attended / sessions.length) * 100);
  }, [student, sessions]);

  // Pagination
  const totalItems = sessions.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const paginatedSessions = sessions.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage,
  );
  const startItem = totalItems > 0 ? page * rowsPerPage + 1 : 0;
  const endItem = Math.min((page + 1) * rowsPerPage, totalItems);

  function handleBack() {
    if (courseId) {
      viewCourse(courseId, COURSE_VIEWS.STUDENTS as CourseView);
    }
  }

  function handlePrevStudent() {
    if (hasPrev) {
      const prev = students[studentIdx - 1];
      useStudentStore.getState().selectStudent(courseId!, prev.id);
      useCourseStore.getState().setStudentId(prev.id);
    }
  }

  function handleNextStudent() {
    if (hasNext) {
      const next = students[studentIdx + 1];
      useStudentStore.getState().selectStudent(courseId!, next.id);
      useCourseStore.getState().setStudentId(next.id);
    }
  }

  async function handleToggleCheckin(session: Session) {
    if (!courseId || !studentId) return;
    try {
      await checkUncheck({
        courseId,
        sessionId: session.id,
        checkin: !isCheckedIn(session),
        attendeeid: studentId,
        method: CHECKIN_METHODS.MANUAL,
      });
      if (courseId) {
        useStudentStore.getState().getCourseStudents(courseId);
      }
    } catch (error) {
      console.error("Failed to toggle check-in:", error);
    }
  }

  function isCheckedIn(session: Session) {
    if (!student?.sessions) return null;
    const entry = student.sessions[session.id];
    if (!entry) return null;
    if (entry.request === "pending" || entry.request === "denied") return null;
    return entry;
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <svg className="h-8 w-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
        <p className="text-sm text-gray-500">Student not found</p>
        <button
          onClick={handleBack}
          className="mt-2 text-sm text-link hover:underline"
        >
          Back to Students
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ← All Attendees back link */}
      <div
        className="px-4 py-2 border-b"
        style={{ borderColor: "rgba(0,0,0,0.12)" }}
      >
        <button
          onClick={handleBack}
          className="text-[13px] text-[#4caf50] hover:text-[#388e3c] flex items-center gap-1 font-normal"
        >
          ← All Attendees
        </button>
      </div>

      <StudentAttendanceSummary
        student={student}
        attendanceRate={attendanceRate}
        currentCourseName={currentCourse?.name || "—"}
        onEdit={() => setEditOpen(true)}
      />

      <StudentSessionHistoryTable
        student={student}
        paginatedSessions={paginatedSessions}
        onToggleCheckin={handleToggleCheckin}
        isCheckedIn={isCheckedIn}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPrev={handlePrevStudent}
        onNext={handleNextStudent}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        page={page}
        setPage={setPage}
        startItem={startItem}
        endItem={endItem}
        totalItems={totalItems}
        totalPages={totalPages}
      />

      <EditStudentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        student={student}
      />
    </div>
  );
}
