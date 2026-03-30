import { useEffect, useState, useMemo, startTransition } from "react";
import {
  ArrowLeft,
  Search,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCourseStore } from "../store/course.store";
import { useSessionStore } from "../store/session.store";
import { useStudentStore } from "../store/student.store";
import {
  COURSE_VIEWS,
  CHECKIN_METHODS,
  type CourseView,
} from "@/config/constants";
import type { Student } from "@/shared/types";
import { CheckinImageDialog } from "@/features/sessions/components/CheckinImageDialog";
import { ManualCheckInDialog } from "./ManualCheckInDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { StartSessionDialog } from "@/features/sessions/components/StartSessionDialog";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useSessionAttendeesStats } from "../hooks/useSessionAttendeesStats";
import { useStudentTable } from "../hooks/useStudentTable";
import { SessionStudentsTable } from "./SessionStudentsTable";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SessionStudents() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as Record<string, string>;
  const urlSessionId = params.sessionId;
  const courseId = useCourseStore((s) => s.courseId);
  const courses = useCourseStore((s) => s.courses);
  const viewCourse = useCourseStore((s) => s.viewCourse);
  const session = useSessionStore((s) => s.session);
  const sessionId = useSessionStore((s) => s.sessionId);
  const getCourseSessions = useSessionStore((s) => s.getCourseSessions);
  const selectSession = useSessionStore((s) => s.selectSession);
  const nextSession = useSessionStore((s) => s.nextSession);
  const prevSession = useSessionStore((s) => s.prevSession);
  const navigateSession = useSessionStore((s) => s.navigateSession);
  const checkUncheck = useSessionStore((s) => s.checkUncheck);
  const getCourseStudents = useStudentStore((s) => s.getCourseStudents);
  const allStudents = useStudentStore((s) => s.students) as Student[];
  const isPremium = useAuthStore((s) => s.user?.plan === "Premium");

  const [loading, setLoading] = useState(true);
  
  const [checkinImage, setCheckinImage] = useState<{
    url: string;
    date: string | number;
  } | null>(null);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [checkinStudent, setCheckinStudent] = useState<{
    id: string;
    name: string;
    email?: string;
    attendee_manual?: boolean;
    sessionData: any;
  } | null>(null);

  const course = useMemo(
    () => courses?.find((c) => c.id === courseId) ?? null,
    [courses, courseId],
  );

  // Sync route $sessionId to session store (handles browser refresh)
  useEffect(() => {
    if (!courseId || !urlSessionId) return;
    // If the store already has the right session selected, skip
    if (sessionId === urlSessionId && session) return;

    async function syncSession() {
      // If sessions list isn't loaded yet, fetch it first
      const currentSessions = useSessionStore.getState().sessions;
      if (!currentSessions || currentSessions.length === 0) {
        await getCourseSessions(courseId!);
      }
      // Now select the session from the (just-loaded) list
      selectSession(courseId!, urlSessionId);
    }
    syncSession();
  }, [courseId, urlSessionId, sessionId, session, getCourseSessions, selectSession]);

  // Fetch ALL course students
  useEffect(() => {
    async function fetch() {
      if (!courseId) return;
      setLoading(true);
      try {
        await getCourseStudents(courseId);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [courseId, getCourseStudents]);

  // Derive check-in status per student from student.sessions[sessionId]
  const { studentsWithStatus, checkedInCount, attendanceRate } = useSessionAttendeesStats(
    allStudents || [],
    sessionId,
    course
  );

  // Pagination & Filtering state management
  const {
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    paginatedData: pagedStudents,
    totalItems: totalStudents,
    startItem: startRow,
    endItem: endRow,
  } = useStudentTable({
    data: studentsWithStatus,
    sortAlphabetically: false, 
  });

  const maxPage = Math.max(0, Math.ceil(totalStudents / rowsPerPage) - 1);

  function handleBack() {
    if (courseId) {
      viewCourse(courseId, COURSE_VIEWS.SESSIONS as CourseView);
    }
  }

  function handleStudentClick(studentId: string) {
    if (courseId) {
      useCourseStore.getState().setStudentId(studentId);
      viewCourse(courseId, COURSE_VIEWS.STUDENT_SESSIONS as CourseView);
    }
  }

  // ── Loading skeleton ──────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <Skeleton width={24} height={24} borderRadius="50%" />
          <div className="flex-1">
            <Skeleton width={180} height={14} borderRadius={3} />
            <Skeleton
              width={120}
              height={10}
              borderRadius={3}
              className="mt-1"
            />
          </div>
        </div>
        <div className="px-2 py-2 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-2"
              style={{ height: 40 }}
            >
              <Skeleton width={40} height={40} borderRadius={4} />
              <Skeleton
                width={`${20 + (i % 3) * 7}%`}
                height={12}
                borderRadius={3}
              />
              <Skeleton
                width={`${15 + (i % 2) * 10}%`}
                height={12}
                borderRadius={3}
              />
              <Skeleton width={52} height={12} borderRadius={3} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Session info helpers ──────────────────────────────────
  const sessionStartDate = session?.begins
    ? new Date(session.begins).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "";

  const durationStr = session?.duration
    ? `${String(Math.floor(session.duration / 60)).padStart(2, "0")}:${String(session.duration % 60).padStart(2, "0")}`
    : "";

  const locationText = session?.location?.locationText;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ═══ A1 — Back link ═══════════════════════════════════ */}
      <div className="px-4 py-2 border-b border-gray-200">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>All Sessions</span>
        </button>
      </div>

      {/* ═══ A2 — Session info bar ════════════════════════════ */}
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="text-[13px] text-gray-700">
          <span className="font-medium">
            {session?.name ||
              `Session ${session?.serialId ?? ""}`}
          </span>
          <span className="mx-2 text-gray-400 text-lg align-middle">|</span>
          <span>
            {checkedInCount} of {studentsWithStatus.length} attendees,
            attendance rate: {attendanceRate}%
          </span>
          {sessionStartDate && (
            <>
              <span className="mx-2 text-gray-400 text-lg align-middle">
                |
              </span>
              <span>
                {sessionStartDate}
                {durationStr ? `, ${durationStr} minutes` : ""}
              </span>
            </>
          )}
          {locationText && (
            <>
              <span className="mx-2 text-gray-400 text-lg align-middle">
                |
              </span>
              <span>Location: </span>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(locationText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                {locationText}
              </a>
            </>
          )}
        </div>
      </div>

      {/* ═══ A3 Search + A4 Resume session ════════════════════ */}
      <div className="flex items-center justify-between px-4 py-1.5">
        <div className="flex-1" />
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => startTransition(() => setSearchTerm(e.target.value))}
            className={cn(
              "w-[200px] border-b border-gray-300 bg-white py-1 pr-7 text-sm text-gray-800",
              "placeholder:text-gray-400 focus:border-accent focus:outline-none transition-colors",
            )}
          />
          {searchTerm.length > 0 ? (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <Search className="absolute right-1 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* ═══ Resume session ══════ */}
      <div className="flex justify-end px-4 pb-1">
        <button
          onClick={() => setResumeDialogOpen(true)}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <Play className="h-3 w-3 fill-current" />
          <span className="underline">Resume session...</span>
        </button>
      </div>

      {/* ═══ TABLE ════════════════════════════════════════════ */}
      <SessionStudentsTable
        students={pagedStudents}
        isPremium={isPremium}
        onStudentClick={handleStudentClick}
        onCheckinClick={(_, student) => {
          setCheckinStudent({
            id: student.id,
            name: student.name,
            email: student.email,
            attendee_manual: student.attendee_manual,
            sessionData: student.sessions?.[sessionId!] ?? null,
          });
        }}
        onSelfieClick={(_, student) => {
          setCheckinImage({
            url: student.checkinSelfie!,
            date: student.checkinTime ?? "",
          });
        }}
      />

      {/* ═══ E — FOOTER ══════════════════════════════════════ */}
      <div
        className="flex items-center justify-between px-4 py-2 border-t border-gray-200 text-sm shrink-0"
        style={{ minHeight: 48 }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateSession("prev")}
            disabled={!prevSession}
            className={cn(
              "text-blue-600 hover:underline",
              !prevSession && "text-gray-400 cursor-not-allowed no-underline",
            )}
          >
            Previous Session
          </button>
          <button
            onClick={() => navigateSession("next")}
            disabled={!nextSession}
            className={cn(
              "text-blue-600 hover:underline",
              !nextSession && "text-gray-400 cursor-not-allowed no-underline",
            )}
          >
            Next Session
          </button>
        </div>

        <div className="flex items-center gap-3 text-gray-600">
          <span>Rows per Page</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
            }}
            className="border border-gray-300 rounded px-1 py-0.5 text-sm bg-white"
          >
            {[10, 25, 50, 100].map((n) => (
               <option key={n} value={n}>
                 {n}
               </option>
            ))}
          </select>
          <span className="text-gray-500">
            {startRow}-{endRow} of {totalStudents}
          </span>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className={cn(
              "p-0.5 rounded hover:bg-gray-100",
              page === 0 && "opacity-30 cursor-not-allowed",
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
            disabled={page >= maxPage}
            className={cn(
              "p-0.5 rounded hover:bg-gray-100",
              page >= maxPage && "opacity-30 cursor-not-allowed",
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ═══ Dialogs ═════════════════════════════════════════ */}
      <CheckinImageDialog
        open={!!checkinImage}
        onOpenChange={(open) => {
          if (!open) setCheckinImage(null);
        }}
        imageUrl={checkinImage?.url ?? ""}
        date={checkinImage?.date ?? ""}
      />

      <StartSessionDialog
        open={resumeDialogOpen}
        onOpenChange={(open) => !open && setResumeDialogOpen(false)}
        resumedSession={session}
        onSessionStarted={(session) => {
          setResumeDialogOpen(false);
          try {
            document.documentElement.requestFullscreen?.().catch(() => {});
          } catch (error) {
            console.error("[SessionStudents] Fullscreen not available", error);
          }
          navigate({
            to: "/session/$shortid",
            params: {
              shortid:
                session.shortId ||
                session.shortid ||
                session.id,
            },
          });
        }}
      />

      <ManualCheckInDialog
        open={!!checkinStudent}
        onOpenChange={(open) => { if (!open) setCheckinStudent(null); }}
        studentName={checkinStudent?.name ?? ""}
        sessionName={session?.name || `Session ${session?.serialId ?? ""}`}
        studentSession={checkinStudent?.sessionData}
        onToggleCheckIn={async (action) => {
          if (!courseId || !sessionId || !checkinStudent) return;

          if (action === "approve" || action === "deny") {
            const updatedStudent = allStudents.find(s => s.id === checkinStudent.id);
            if (updatedStudent?.sessions?.[sessionId]) {
              updatedStudent.sessions[sessionId].request = action === "approve" ? "approved" : "denied";
            }
          }

          const isCheckin = action === "check" || action === "approve";

          await checkUncheck({
            courseId,
            sessionId,
            checkin: isCheckin,
            attendeeid: checkinStudent.id,
            method: CHECKIN_METHODS.MANUAL,
            code: "MANUAL",
            icon: 0,
            name: checkinStudent.name,
            email: checkinStudent.email,
            attendee_manual: checkinStudent.attendee_manual,
          });
          // Re-fetch to update the view
          await getCourseStudents(courseId);
          setCheckinStudent(null);
        }}
      />
    </div>
  );
}
