/**
 * Course Students tab view — matches legacy CourseStudents.js.
 * Table with columns: Checkbox | Last Name (avatar) | First Name | Attendance Rate | 1..N session ✓/✗
 */

import { useEffect, useState, useMemo } from "react";
import { Search, Users, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { useCourseStore } from "../store/course.store";
import { useStudentStore } from "../store/student.store";
import { useSessionStore } from "../store/session.store";
import { COURSE_VIEWS, CHECKIN_METHODS, type CourseView } from "@/config/constants";
import { CourseStudentsMenu } from "./CourseStudentsMenu";
import { AddStudentDialog } from "./AddStudentDialog";
import { DeleteStudentsDialog } from "./DeleteStudentsDialog";
import { ManualCheckInDialog } from "./ManualCheckInDialog";
import { ImportAttendeesExcelDialog } from "./ImportAttendeesExcelDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { PricingDialog } from "@/features/billing/components/PricingDialog";
import type { Student } from "@/shared/types";
import { useStudentTable } from "../hooks/useStudentTable";
import { CourseStudentRow } from "./CourseStudentRow";

export function CourseStudents() {
  const courseId = useCourseStore((s) => s.courseId);
  const viewCourse = useCourseStore((s) => s.viewCourse);
  const students = useStudentStore((s) => s.students);
  const loading = useStudentStore((s) => s.loading);
  const getCourseStudents = useStudentStore((s) => s.getCourseStudents);
  const sessions = useSessionStore((s) => s.sessions);
  const getCourseSessions = useSessionStore((s) => s.getCourseSessions);
  const checkUncheck = useSessionStore((s) => s.checkUncheck);
  const user = useAuthStore((s) => s.user);
  const isPremium = user?.plan === "Premium";

  const [selected, setSelected] = useState<string[]>([]);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [deleteStudentsOpen, setDeleteStudentsOpen] = useState(false);
  const [importAttendeesOpen, setImportAttendeesOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

  const [checkinTarget, setCheckinTarget] = useState<{
    student: Student;
    sessionId: string;
    sessionName: string;
    studentSession: any;
  } | null>(null);

  useEffect(() => {
    if (courseId) {
      getCourseStudents(courseId);
      // Also ensure sessions are loaded (needed for per-session columns)
      if (sessions.length === 0) {
        getCourseSessions(courseId);
      }
    }
  }, [courseId, getCourseStudents, getCourseSessions]);

  // Sessions reversed (oldest first) for column display, matching legacy
  const sessionsCopy = useMemo(
    () => sessions.slice().reverse(),
    [sessions],
  );

  const {
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    paginatedData: paginatedStudents,
    filteredData: filteredStudents,
    totalItems,
    totalPages,
    startItem,
    endItem,
  } = useStudentTable({
    data: students,
    sortAlphabetically: true,
    filterByPhoneAndId: user?.showAttendeesPhoneAndId ?? false,
  });

  function handleStudentClick(studentId: string) {
    if (courseId) {
      useStudentStore.getState().selectStudent(courseId, studentId);
      useCourseStore.getState().setStudentId(studentId);
      viewCourse(courseId, COURSE_VIEWS.STUDENT_SESSIONS as CourseView);
    }
  }

  function handleIconClick(
    e: React.MouseEvent,
    student: Student,
    session: any,
  ) {
    e.stopPropagation();
    const studentSession = student.sessions?.[session.id];
    setCheckinTarget({
      student,
      sessionId: session.id,
      sessionName: session.name || `Session`,
      studentSession: studentSession || null,
    });
  }

  async function handleToggleCheckIn(action: "check" | "uncheck" | "approve" | "deny") {
    if (!checkinTarget || !courseId) return;
    const { student, sessionId } = checkinTarget;
    const isCheckin = action === "check" || action === "approve";
    try {
      await checkUncheck({
        courseId,
        sessionId,
        checkin: isCheckin,
        attendeeid: student.id,
        method: CHECKIN_METHODS.MANUAL,
        code: "MANUAL",
        icon: 0,
        name: student.name || "",
        email: student.email || "",
        attendee_manual: student.attendee_manual ?? true,
      });
      // Optimistic local update — avoids full table refetch/rerender
      useStudentStore.setState((state) => ({
        students: state.students.map((s) => {
          if (s.id !== student.id) return s;
          const sessions = { ...s.sessions };
          if (isCheckin) {
            sessions[sessionId] = { ...(sessions[sessionId] || {}), checkin: true, request: "approved" };
          } else {
            delete sessions[sessionId];
          }
          return { ...s, sessions };
        }),
      }));
    } catch (err) {
      console.error("Check-in failed:", err);
    }
    setCheckinTarget(null);
  }

  function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelected(filteredStudents.map((s) => s.id));
    } else {
      setSelected([]);
    }
  }

  function handleItemChecked(studentId: string) {
    setSelected((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  }

  function handlePricingClick(e: React.MouseEvent) {
    e.stopPropagation();
    setPricingOpen(true);
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "click-GetPremium-in-Course-students", {
        event_label: "Get Premium",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-2 border-b" style={{ borderColor: "rgba(0,0,0,0.12)" }}>
          <Skeleton width={160} height={20} borderRadius={3} />
          <div className="flex-1" />
          <Skeleton width={160} height={24} borderRadius={3} />
        </div>
        <div className="px-2 py-2 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-2" style={{ height: 36 }}>
              <Skeleton width={16} height={16} borderRadius={3} />
              <Skeleton width={28} height={28} borderRadius="50%" />
              <Skeleton width={`${22 + (i % 3) * 6}%`} height={12} borderRadius={3} />
              <Skeleton width={`${18 + (i % 2) * 8}%`} height={12} borderRadius={3} />
              <Skeleton width={48} height={12} borderRadius={3} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar: title + menu + search */}
      <div
        className="flex items-center gap-3 px-4 py-2 border-b"
        style={{ borderColor: "rgba(0,0,0,0.12)" }}
      >
        <div className="flex items-center gap-1">
          <h3
            className="text-[17px] font-normal py-1"
            style={{ color: "#20486a" }}
          >
            Attendees {students.length ? `(${students.length})` : ""}
          </h3>
          <CourseStudentsMenu
            courseId={courseId || ""}
            selectedCount={selected.length}
            onAddStudent={() => setAddStudentOpen(true)}
            onDeleteSelected={() => setDeleteStudentsOpen(true)}
            onUploadList={() => setImportAttendeesOpen(true)}
          >
            <button className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
              <MoreVertical className="h-5 w-5" />
            </button>
          </CourseStudentsMenu>
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative max-w-[200px]">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-b border-gray-300 pb-1 text-sm focus:outline-none focus:border-blue-500 transition-colors pr-6"
          />
          <Search className="absolute right-0 bottom-2 h-4 w-4 text-gray-600" />
        </div>
      </div>

      {/* Students table */}
      {filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Users className="h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-500">
            {students.length === 0
              ? "No attendees enrolled"
              : "No matching attendees"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.2)" }}>
                {/* Checkbox header */}
                <th className="px-2 py-2 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={
                      selected.length === filteredStudents.length &&
                      filteredStudents.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                {/* Fixed columns — title case matching legacy */}
                <th className="px-3 py-2 text-left font-normal text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    Last name
                    <svg className="h-3 w-3 text-gray-400" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M6 9L2 5h8L6 9z" />
                    </svg>
                  </span>
                </th>
                <th className="px-3 py-2 text-left font-normal text-xs text-gray-500">
                  First name
                </th>
                {user?.showAttendeesPhoneAndId && (
                  <>
                    <th className="px-3 py-2 text-left font-normal text-xs text-gray-500">
                      Phone
                    </th>
                    <th className="px-3 py-2 text-left font-normal text-xs text-gray-500">
                      ID
                    </th>
                  </>
                )}
                <th
                  className="px-3 py-2 text-center font-normal text-xs text-gray-500"
                  style={{ width: 100 }}
                >
                  Attendance<br />rate
                </th>
                {/* Per-session columns */}
                {sessionsCopy.map((session, index) => {
                  const date = session.begins
                    ? new Date(session.begins)
                    : null;
                  const tooltip = date
                    ? `${session.name || `Session ${index + 1}`}\n${date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}\n${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}`
                    : session.name || `Session ${index + 1}`;
                  return (
                    <th
                      key={session.id}
                      className="px-1 py-2 text-center font-normal text-xs text-gray-500"
                      style={{ minWidth: 32 }}
                      title={tooltip}
                    >
                      {index + 1}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map((student) => (
                <CourseStudentRow
                  key={student.id}
                  student={student}
                  sessionsCopy={sessionsCopy}
                  isSelected={selected.includes(student.id)}
                  isPremium={isPremium}
                  showAttendeesPhoneAndId={user?.showAttendeesPhoneAndId}
                  onSelect={handleItemChecked}
                  onStudentClick={handleStudentClick}
                  onIconClick={handleIconClick}
                  onPricingClick={handlePricingClick}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination footer — matching legacy */}
      {totalItems > 0 && (
        <div
          className="flex items-center justify-end gap-4 px-4 py-2 text-xs text-gray-500 border-t"
          style={{ borderColor: "rgba(0,0,0,0.12)" }}
        >
          <span>Rows per Page</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
            }}
            className="border-none bg-transparent text-xs text-gray-600 cursor-pointer focus:outline-none"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
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
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add Student Dialog */}
      {courseId && (
        <AddStudentDialog
          open={addStudentOpen}
          onOpenChange={setAddStudentOpen}
          courseId={courseId}
        />
      )}

      {/* Delete Students Dialog */}
      {courseId && (
        <DeleteStudentsDialog
          open={deleteStudentsOpen}
          onOpenChange={setDeleteStudentsOpen}
          courseId={courseId}
          students={students.filter((s) => selected.includes(s.id))}
        />
      )}

      {/* Manual Check-in Dialog */}
      {checkinTarget && (
        <ManualCheckInDialog
          open={!!checkinTarget}
          onOpenChange={(open) => { if (!open) setCheckinTarget(null); }}
          studentName={checkinTarget.student.name || ""}
          sessionName={checkinTarget.sessionName}
          studentSession={checkinTarget.studentSession}
          onToggleCheckIn={handleToggleCheckIn}
        />
      )}

      {/* Import Attendees Excel Dialog */}
      {courseId && (
        <ImportAttendeesExcelDialog
          courseId={courseId}
          open={importAttendeesOpen}
          onOpenChange={setImportAttendeesOpen}
        />
      )}

      {/* Pricing Teaser Dialog */}
      <PricingDialog
        open={pricingOpen}
        onOpenChange={setPricingOpen}
        onContactUs={() => setPricingOpen(false)}
      />
    </div>
  );
}
