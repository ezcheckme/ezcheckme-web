/**
 * Student Sessions view — matches legacy StudentSessions.js + StudentDetails.js.
 *
 * Layout (matching legacy):
 * ┌──────────────────────────────────────────────┐
 * │ ← All Attendees                              │
 * ├──────────────────────────────────────────────┤
 * │ ┌──────┐  Name                               │
 * │ │ pic  │  Email: ...                          │
 * │ │ 44%  │  Phone: *****1234                    │
 * │ │      │  ID: not provided                    │
 * │ └──────┘  View Course: [dropdown]             │
 * │ [Edit]                                        │
 * ├──────────────────────────────────────────────┤
 * │ Session name │ Date & Time │ Session ID │ ... │
 * │ Session 9    │ Mar 10 ...  │ 117332     │ ... │
 * ├──────────────────────────────────────────────┤
 * │ ◀ Previous Attendee    Next Attendee ▶       │
 * │ Rows per Page 25   1-9 of 9   < >            │
 * └──────────────────────────────────────────────┘
 */

import { useEffect, useState, useMemo } from "react";
import { useCourseStore } from "../store/course.store";
import { useStudentStore } from "../store/student.store";
import { useSessionStore } from "../store/session.store";
import { COURSE_VIEWS, type CourseView } from "@/config/constants";
import { EditStudentDialog } from "./EditStudentDialog";
import type { Session } from "@/shared/types";

export function StudentSessions() {
  const courseId = useCourseStore((s) => s.courseId);
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
        studentId,
        method: "manual",
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

  // Mask phone number like legacy: *****1234
  function maskPhone(phone: string | undefined) {
    if (!phone) return "not provided";
    if (phone.length <= 4) return phone;
    return "*******" + phone.slice(-4);
  }

  // Mask student ID like legacy
  function maskId(id: string | undefined) {
    if (!id) return "not provided";
    return id;
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

  const courses = useCourseStore.getState().courses || [];
  const currentCourse = courses?.find((c) => c.id === courseId);

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

      {/* Student profile section — matching legacy StudentDetails.js */}
      <div className="flex px-6 py-4 gap-6">
        {/* Left: Avatar with attendance % overlay + Edit button */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <img
              width={78}
              height={78}
              className="rounded-none"
              style={{ border: "1px solid #dddddd" }}
              src={student.picture || "/assets/images/icons/profile.jpg"}
              alt="avatar"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/assets/images/icons/profile.jpg";
              }}
            />
            {/* Attendance % badge overlay — donut style */}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center"
              style={{
                width: 44,
                height: 44,
              }}
            >
              <svg viewBox="0 0 44 44" className="h-11 w-11">
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="white"
                  stroke="#e0e0e0"
                  strokeWidth="3"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke="#4caf50"
                  strokeWidth="3"
                  strokeDasharray={`${(attendanceRate / 100) * 113.1} 113.1`}
                  strokeDashoffset="0"
                  transform="rotate(-90 22 22)"
                  strokeLinecap="round"
                />
                <text
                  x="22"
                  y="22"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#333"
                  fontSize="11"
                  fontWeight="500"
                >
                  {attendanceRate}%
                </text>
              </svg>
            </div>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="mt-5 px-6 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
          >
            Edit
          </button>
        </div>

        {/* Right: Student details */}
        <div className="flex flex-col gap-1 py-1">
          <h2 className="text-[16px] font-medium text-[rgba(0,0,0,0.87)]">
            {student.name}
            {student.attendee_manual ? " (added manually)" : ""}
          </h2>
          <p className="text-[14px] text-[rgba(0,0,0,0.54)] py-1">
            Email:{" "}
            {student.email ? (
              <a
                href={`mailto:${student.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link hover:underline"
              >
                {student.email}
              </a>
            ) : (
              "not provided"
            )}
          </p>
          <p className="text-[14px] text-[rgba(0,0,0,0.54)] py-1">
            Phone: {maskPhone(student.phone)}
          </p>
          <p className="text-[14px] text-[rgba(0,0,0,0.54)] py-1">
            ID: {maskId(student.studentId || (student as any).attendeeid)}
          </p>
          {/* View Course dropdown */}
          <div className="flex items-center gap-2 mt-3 text-[14px] text-[rgba(0,0,0,0.87)]">
            View Course:{" "}
            <span className="ml-2 text-[rgba(0,0,0,0.87)]">
              {currentCourse?.name || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Sessions table — matching legacy columns */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.2)" }}>
              <th
                className="px-3 py-2 text-left font-normal text-sm text-[#000000]"
                style={{ paddingLeft: 16 }}
              >
                Session name
              </th>
              <th className="px-3 py-2 text-left font-normal text-sm text-gray-500">
                Date & Time
              </th>
              <th className="px-3 py-2 text-left font-normal text-sm text-gray-500">
                Session ID
              </th>
              <th className="px-3 py-2 text-left font-normal text-sm text-gray-500">
                Check-in
              </th>
              <th className="px-3 py-2 text-left font-normal text-sm text-gray-500">
                Check-in method
              </th>
              <th className="px-3 py-2 text-left font-normal text-sm text-gray-500">
                Location
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedSessions.map((session) => {
              const checkinEntry = isCheckedIn(session);
              const attended = !!checkinEntry;
              const checkinTime = checkinEntry?.time
                ? new Date(checkinEntry.time).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : null;
              const checkinMethod = checkinEntry?.method || "";
              const location = checkinEntry?.location;

              return (
                <tr
                  key={session.id}
                  className="hover:bg-gray-50 transition-colors"
                  style={{
                    height: 44,
                    borderBottom: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  {/* Session name + description */}
                  <td className="px-3 text-gray-800" style={{ paddingLeft: 16 }}>
                    <div>
                      {session.name || `Session ${session.serialId ?? ""}`}
                    </div>
                    {(session as any).description && (
                      <div className="text-xs text-gray-400">
                        {(session as any).description}
                      </div>
                    )}
                  </td>
                  {/* Date & Time */}
                  <td className="px-3 text-gray-600">
                    {session.begins
                      ? new Date(session.begins)
                          .toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                          .replace(",", "")
                      : "—"}
                  </td>
                  {/* Session ID (shortid) */}
                  <td className="px-3 text-gray-600">
                    {(session as any).shortid || session.id?.slice(0, 6) || "—"}
                  </td>
                  {/* Check-in status */}
                  <td className="px-3">
                    {attended ? (
                      <span className="flex items-center gap-1 text-[#4caf50]">
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" fill="#4caf50" />
                          <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-xs text-gray-600">{checkinTime}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleToggleCheckin(session)}
                        className="flex items-center gap-1 text-[#f44336] hover:text-[#d32f2f]"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" fill="#f44336" />
                          <path d="M8 8l8 8M16 8l-8 8" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        </svg>
                        <span className="text-xs underline">Check-in...</span>
                      </button>
                    )}
                  </td>
                  {/* Check-in method */}
                  <td className="px-3 text-gray-600 text-xs">
                    {attended ? (checkinMethod || "—") : ""}
                  </td>
                  {/* Location */}
                  <td className="px-3 text-gray-600 text-xs">
                    {attended
                      ? location
                        ? `📍 ${typeof location === "object" ? "Set" : location}`
                        : "N/A"
                      : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Previous/Next Attendee links + pagination */}
      <div
        className="flex items-center justify-between px-4 py-2 border-t"
        style={{ borderColor: "rgba(0,0,0,0.12)" }}
      >
        {/* Prev/Next navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevStudent}
            disabled={!hasPrev}
            className={`text-xs flex items-center gap-1 ${
              hasPrev
                ? "text-link hover:underline cursor-pointer"
                : "text-gray-300 cursor-not-allowed"
            }`}
          >
            ◀ Previous Attendee
          </button>
          <button
            onClick={handleNextStudent}
            disabled={!hasNext}
            className={`text-xs flex items-center gap-1 ${
              hasNext
                ? "text-link hover:underline cursor-pointer"
                : "text-gray-300 cursor-not-allowed"
            }`}
          >
            Next Attendee ▶
          </button>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Rows per Page</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            className="border-none bg-transparent text-xs text-gray-600 cursor-pointer focus:outline-none"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span>
            {startItem}-{endItem} of {totalItems}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() =>
                setPage((p) => Math.min(totalPages - 1, p + 1))
              }
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Student Dialog */}
      <EditStudentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        student={student}
      />
    </div>
  );
}
